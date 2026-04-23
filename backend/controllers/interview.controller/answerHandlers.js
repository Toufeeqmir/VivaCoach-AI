const InterviewSession = require("../../models/InterviewSession");
const {
  detectFillerWords,
  calculateWordsPerMinute,
  calculateGrammarScore,
  calculateFillerScore,
  calculateConfidenceScore,
  calculateSpeechScore,
  calculateOverallScore,
  calculateSpeechSentimentScore,
  calculateMultimodalScore,
  generateFeedback,
} = require("../../utils/scoreCalculator");
const { askGroq, parseModelJson } = require("./groqClient");

const clampScore = (value, fallback = 0) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return fallback;
  return Math.max(0, Math.min(100, Math.round(num)));
};

const average = (...values) => {
  const valid = values.filter((value) => Number.isFinite(value));
  if (!valid.length) return 0;
  return Math.round(valid.reduce((sum, value) => sum + value, 0) / valid.length);
};

const deriveRecommendedFocus = ({
  grammarScore,
  relevanceScore,
  structureScore,
  speechScore,
  fillerScore,
  confidenceScore,
}) => {
  const rankedWeaknesses = [
    {
      key: "clarity",
      score: average(grammarScore, structureScore),
      label: "clarity and structure",
    },
    {
      key: "relevance",
      score: relevanceScore,
      label: "staying closer to the question",
    },
    {
      key: "delivery",
      score: average(speechScore, fillerScore),
      label: "delivery and speaking pace",
    },
    {
      key: "confidence",
      score: confidenceScore,
      label: "confidence and presence",
    },
  ].sort((a, b) => a.score - b.score);

  return rankedWeaknesses[0]?.label || "giving sharper examples";
};

const buildAdaptivePrompt = ({
  role,
  category,
  difficulty,
  question,
  originalAnswer,
  feedback,
  recommendedFocus,
  previousAnswers,
}) => `
You are an expert interviewer building the next best follow-up for a mock interview.

Role: ${role || "Software Developer"}
Category: ${category || "general"}
Difficulty: ${difficulty || "medium"}
Current question: "${question}"
Candidate answer: "${originalAnswer}"
Current feedback: "${feedback || ""}"
Main improvement focus: "${recommendedFocus}"

Recent answers for context:
${previousAnswers.length ? previousAnswers.map((answer, index) => `${index + 1}. Q: ${answer.question}\nA: ${answer.originalAnswer}`).join("\n\n") : "None"}

Return ONLY valid JSON with this shape:
{
  "recommendedFocus": "<short focus area>",
  "adaptiveQuestions": [
    {
      "question": "<a focused next question>",
      "focus": "<what skill it probes>",
      "type": "adaptive"
    },
    {
      "question": "<a second focused next question>",
      "focus": "<what skill it probes>",
      "type": "adaptive"
    }
  ]
}

Rules:
- Questions must react to the candidate's last answer quality.
- If the answer lacked detail, ask for evidence or an example.
- If the answer lacked structure, ask for situation, action, and result.
- If the answer was weakly relevant, ask them to answer the original question more directly.
- Keep questions concise and realistic.
`;

const submitAnswer = async (req, res) => {
  try {
    const {
      sessionId,
      question,
      originalAnswer,
      duration,
      emotionSummary,
      dominantEmotion,
      questionType = "primary",
      focusArea = "",
      category = "general",
      difficulty = "medium",
      role = "",
    } = req.body;

    const session = await InterviewSession.findOne({ sessionId, user: req.user._id });
    if (!session) {
      return res.status(404).json({ success: false, message: "Interview session not found" });
    }

    const { fillerWords, fillerWordCount } = detectFillerWords(originalAnswer);
    const wpm = calculateWordsPerMinute(originalAnswer, duration);

    const aiPrompt = `
      Evaluate this interview response:
      Question: "${question}"
      Answer: "${originalAnswer}"
      Dominant Emotion: "${dominantEmotion}"

      CRITICAL: Return ONLY valid JSON. 
      Format:
      {
        "grammarScore": <0-100>,
        "relevanceScore": <0-100>,
        "structureScore": <0-100>,
        "feedback": "<short advice>",
        "improvedText": "<better version>"
      }
    `;

    const aiText = await askGroq(aiPrompt);
    const aiData = parseModelJson(aiText);

    const followUpPrompt = `
      You are an expert interviewer. Based on the question and answer below,
      generate 2 short follow-up questions that probe deeper (clarify, ask for examples, trade-offs).

      Question: "${question}"
      Answer: "${originalAnswer}"

      CRITICAL: Return ONLY valid JSON. No extra text.
      Format: {"followUps":["follow up 1","follow up 2"]}
    `;
    let followUps = [];
    try {
      const followUpText = await askGroq(followUpPrompt);
      const followUpData = parseModelJson(followUpText);
      followUps = Array.isArray(followUpData.followUps) ? followUpData.followUps : [];
      followUps = followUps.filter((q) => typeof q === "string" && q.trim().length > 0).slice(0, 3);
    } catch (e) {
      followUps = [];
    }

    const totalWords = String(originalAnswer || "").trim().split(/\s+/).filter(Boolean).length;
    const normalizedEmotionSummary = {
      angry: Number(emotionSummary?.angry || 0),
      disgust: Number(emotionSummary?.disgust || 0),
      fear: Number(emotionSummary?.fear || 0),
      happy: Number(emotionSummary?.happy || 0),
      neutral: Number(emotionSummary?.neutral || 0),
      sad: Number(emotionSummary?.sad || 0),
      surprise: Number(emotionSummary?.surprise || 0),
    };

    const aiGrammarScore = clampScore(aiData.grammarScore, 70);
    const aiRelevanceScore = clampScore(aiData.relevanceScore, 68);
    const aiStructureScore = clampScore(aiData.structureScore, 65);
    const grammarScore = calculateGrammarScore(Math.max(0, totalWords - Math.round((aiGrammarScore / 100) * totalWords)), totalWords);
    const relevanceScore = aiRelevanceScore;
    const structureScore = aiStructureScore;
    const fillerScore = calculateFillerScore(fillerWordCount, totalWords);
    const confidenceScore = calculateConfidenceScore(normalizedEmotionSummary, grammarScore, fillerScore);
    const speechScore = calculateSpeechScore(wpm);
    const speechSentimentScore = calculateSpeechSentimentScore(originalAnswer);
    const multimodalScore = calculateMultimodalScore(confidenceScore, speechSentimentScore);
    const deliveryScore = average(speechScore, fillerScore, confidenceScore);
    const baseOverall = calculateOverallScore(multimodalScore, grammarScore, speechScore, fillerScore);
    const overallScore = Math.round(
      baseOverall * 0.6 +
      relevanceScore * 0.2 +
      structureScore * 0.2
    );
    const recommendedFocus = deriveRecommendedFocus({
      grammarScore,
      relevanceScore,
      structureScore,
      speechScore,
      fillerScore,
      confidenceScore,
    });
    const feedbackText = `${aiData.feedback || ""} ${generateFeedback(overallScore, wpm, fillerWordCount, grammarScore)}`.trim();

    let adaptiveQuestions = [];
    let adaptiveFocus = recommendedFocus;
    try {
      const adaptivePrompt = buildAdaptivePrompt({
        role,
        category,
        difficulty,
        question,
        originalAnswer,
        feedback: feedbackText,
        recommendedFocus,
        previousAnswers: session.answers.slice(-3),
      });
      const adaptiveText = await askGroq(adaptivePrompt);
      const adaptiveData = parseModelJson(adaptiveText);
      adaptiveFocus = typeof adaptiveData.recommendedFocus === "string" && adaptiveData.recommendedFocus.trim()
        ? adaptiveData.recommendedFocus.trim()
        : recommendedFocus;
      adaptiveQuestions = Array.isArray(adaptiveData.adaptiveQuestions)
        ? adaptiveData.adaptiveQuestions
            .filter((item) => typeof item?.question === "string" && item.question.trim())
            .slice(0, 2)
            .map((item) => ({
              question: item.question.trim(),
              focus: typeof item.focus === "string" ? item.focus.trim() : adaptiveFocus,
              type: "adaptive",
            }))
        : [];
    } catch (adaptiveError) {
      adaptiveQuestions = [];
    }

    const answerData = {
      question,
      questionType,
      focusArea,
      category,
      originalAnswer,
      correctedAnswer: aiData.improvedText,
      dominantEmotion,
      emotionSummary: normalizedEmotionSummary,
      fillerWords,
      followUpQuestions: followUps,
      adaptiveQuestions,
      confidenceScore,
      grammarScore,
      relevanceScore,
      structureScore,
      deliveryScore,
      speechScore,
      fillerScore,
      speechSentimentScore,
      multimodalScore,
      overallScore,
      duration,
      feedback: feedbackText,
      recommendedFocus: adaptiveFocus,
      fillerWordCount,
      wordsPerMinute: wpm,
    };

    await InterviewSession.updateOne(
      { sessionId, user: req.user._id },
      { $push: { answers: answerData } }
    );
    res.status(200).json({ success: true, result: answerData });
  } catch (error) {
    console.error("Submit Answer Error:", error);
    res.status(500).json({ success: false, message: "AI Analysis failed" });
  }
};

module.exports = { submitAnswer };
