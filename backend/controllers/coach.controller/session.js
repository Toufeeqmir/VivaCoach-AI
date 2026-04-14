const { groqText, detectFillerWords } = require("./shared");
const {
  calculateConfidenceScore,
  calculateSpeechSentimentScore,
  calculateMultimodalScore,
} = require("../../utils/scoreCalculator");

const startCoaching = async (req, res) => {
  try {
    const { topic = "general interview" } = req.body;

    const prompt = `You are an AI Communication Coach. Start a coaching session warmly.
Greet the user in 2-3 friendly sentences, introduce yourself as their personal communication coach,
and invite them to either ask you anything about interviews/communication OR share a sentence they want corrected.
Be warm and encouraging. Topic focus: ${topic}`;

    let openingQuestion = "Hi! I'm your AI Communication Coach. I'm here to help you improve your English, correct your grammar, and prepare for interviews. You can ask me anything or share a sentence you'd like me to correct!";

    try {
      const raw = await groqText(prompt, 10000);
      if (raw.trim()) openingQuestion = raw.trim();
    } catch (err) {
      console.error("Groq start error:", err.message);
    }

    res.status(200).json({
      success: true,
      openingQuestion,
      message: "Coaching session started.",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getCoachSummary = async (req, res) => {
  try {
    const { messages = [], emotionSummary = {}, emotionLog = [] } = req.body;

    if (messages.length === 0) {
      return res.status(400).json({ success: false, message: "No messages to summarize." });
    }

    const userMessages = messages.filter((m) => m.role === "user");
    const allText = userMessages.map((m) => m.content).join(" ");
    const allFillers = detectFillerWords(allText);
    const totalWords = allText.trim().split(/\s+/).length;

    const prompt = `Based on this coaching conversation, provide a final performance summary.
User responses: ${userMessages.map((m, i) => `Response ${i + 1}: "${m.content}"`).join("\n")}

Return ONLY valid JSON with no extra text:
{
  "overallScore": <0-100>,
  "summary": "<2-3 sentence overall assessment>",
  "topStrengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "topImprovements": ["<improvement 1>", "<improvement 2>", "<improvement 3>"],
  "communicationScore": <0-100>,
  "confidenceScore": <0-100>,
  "clarityScore": <0-100>,
  "nextSteps": "<specific advice for what to practice next>"
}`;

    const normalizedEmotionSummary = {
      angry: Number(emotionSummary?.angry || 0),
      disgust: Number(emotionSummary?.disgust || 0),
      fear: Number(emotionSummary?.fear || 0),
      happy: Number(emotionSummary?.happy || 0),
      neutral: Number(emotionSummary?.neutral || 0),
      sad: Number(emotionSummary?.sad || 0),
      surprise: Number(emotionSummary?.surprise || 0),
    };

    let summary = null;

    try {
      const raw = await groqText(prompt, 15000);
      const clean = raw.replace(/```json|```/g, "").trim();
      summary = JSON.parse(clean);
    } catch (err) {
      console.error("Summary error:", err.message);
      summary = {
        overallScore: 65,
        summary: "You completed the coaching session. Keep practicing to improve your communication skills.",
        topStrengths: ["Completed the session", "Engaged with the coach", "Showed willingness to improve"],
        topImprovements: ["Reduce filler words", "Be more specific in answers", "Practice daily"],
        communicationScore: 65,
        confidenceScore: 60,
        clarityScore: 65,
        nextSteps: "Practice answering behavioral questions using the STAR method daily.",
      };
    }

    const confidenceScore = calculateConfidenceScore(normalizedEmotionSummary);
    const speechSentimentScore = calculateSpeechSentimentScore(allText);
    const multimodalScore = calculateMultimodalScore(confidenceScore, speechSentimentScore);
    const totalEmotionFrames = Object.values(normalizedEmotionSummary).reduce((a, b) => a + b, 0);
    const dominantEmotion = Object.keys(normalizedEmotionSummary).reduce((a, b) =>
      normalizedEmotionSummary[a] > normalizedEmotionSummary[b] ? a : b
    );

    let emotionSwitchCount = 0;
    for (let i = 1; i < emotionLog.length; i += 1) {
      if (emotionLog[i]?.emotion && emotionLog[i - 1]?.emotion && emotionLog[i].emotion !== emotionLog[i - 1].emotion) {
        emotionSwitchCount += 1;
      }
    }
    const switchRate = emotionLog.length > 1 ? emotionSwitchCount / (emotionLog.length - 1) : 0;
    const frequentEmotionChanges = switchRate >= 0.35;

    const stressEmotionCount =
      normalizedEmotionSummary.angry +
      normalizedEmotionSummary.fear +
      normalizedEmotionSummary.sad +
      normalizedEmotionSummary.disgust;
    const stressRatio = totalEmotionFrames > 0 ? stressEmotionCount / totalEmotionFrames : 0;
    const pressureScore = Math.max(
      0,
      Math.min(
        100,
        Math.round(stressRatio * 70 + switchRate * 30)
      )
    );
    const communicationBehavior = pressureScore >= 60
      ? "Under pressure at times; emotional fluctuations were noticeable."
      : pressureScore >= 35
      ? "Mostly stable communication with occasional pressure moments."
      : "Calm and stable communication with consistent emotional control.";

    summary.confidenceScore = Math.round((Number(summary.confidenceScore || 0) + multimodalScore) / 2);
    summary.overallScore = Math.round((Number(summary.overallScore || 0) * 0.7) + (multimodalScore * 0.3));

    res.status(200).json({
      success: true,
      summary,
      stats: {
        totalResponses: userMessages.length,
        totalWords,
        fillerWordsUsed: allFillers,
        fillerCount: allFillers.length,
        emotionSummary: normalizedEmotionSummary,
        confidenceScore,
        speechSentimentScore,
        multimodalScore,
        pressureScore,
        dominantEmotion,
        emotionSwitchCount,
        frequentEmotionChanges,
        communicationBehavior,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { startCoaching, getCoachSummary };
