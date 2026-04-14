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

const submitAnswer = async (req, res) => {
  try {
    const { sessionId, question, originalAnswer, duration, emotionSummary, dominantEmotion } = req.body;

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

    const grammarScore = calculateGrammarScore(
      Math.max(0, Math.round((100 - Number(aiData.grammarScore || 70)) * (totalWords / 100))),
      totalWords
    );
    const fillerScore = calculateFillerScore(fillerWordCount, totalWords);
    const confidenceScore = calculateConfidenceScore(normalizedEmotionSummary, grammarScore, fillerScore);
    const speechScore = calculateSpeechScore(wpm);
    const speechSentimentScore = calculateSpeechSentimentScore(originalAnswer);
    const multimodalScore = calculateMultimodalScore(confidenceScore, speechSentimentScore);
    const overallScore = calculateOverallScore(multimodalScore, grammarScore, speechScore, fillerScore);
    const feedbackText = `${aiData.feedback || ""} ${generateFeedback(overallScore, wpm, fillerWordCount, grammarScore)}`.trim();

    const answerData = {
      question,
      originalAnswer,
      correctedAnswer: aiData.improvedText,
      dominantEmotion,
      emotionSummary: normalizedEmotionSummary,
      fillerWords,
      followUpQuestions: followUps,
      confidenceScore,
      grammarScore,
      speechScore,
      fillerScore,
      speechSentimentScore,
      multimodalScore,
      overallScore,
      duration,
      feedback: feedbackText,
      fillerWordCount,
      wordsPerMinute: wpm,
    };

    await InterviewSession.findOneAndUpdate({ sessionId, user: req.user._id }, { $push: { answers: answerData } });
    res.status(200).json({ success: true, result: answerData });
  } catch (error) {
    console.error("Submit Answer Error:", error);
    res.status(500).json({ success: false, message: "AI Analysis failed" });
  }
};

module.exports = { submitAnswer };

