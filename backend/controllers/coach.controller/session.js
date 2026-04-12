const { geminiText, detectFillerWords } = require("./shared");

// @desc    Start a new coaching session with opening question
// @route   POST /api/coach/start
// @access  Private
const startCoaching = async (req, res) => {
  try {
    const { topic = "general interview" } = req.body;

    const prompt = `You are starting an AI communication coaching session focused on grammar and clarity.
Greet the user in one short sentence and ask them to paste ONE sentence they want to improve.
Return ONLY the message, nothing else.`;

    let openingQuestion = "Send me one sentence (or a short paragraph) and I’ll correct grammar and improve clarity.";

    try {
      const raw = await geminiText(prompt, 10000);
      if (raw.trim()) openingQuestion = raw.trim();
    } catch (err) {
      console.error("Gemini start error:", err.message);
    }

    res.status(200).json({
      success: true,
      openingQuestion,
      message: "Coaching session started. Respond to the question above.",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get session summary after coaching
// @route   POST /api/coach/summary
// @access  Private
const getCoachSummary = async (req, res) => {
  try {
    const { messages = [] } = req.body;

    if (messages.length === 0) {
      return res.status(400).json({ success: false, message: "No messages to summarize." });
    }

    const userMessages = messages.filter((m) => m.role === "user");
    const allText = userMessages.map((m) => m.content).join(" ");
    const allFillers = detectFillerWords(allText);
    const totalWords = allText.trim().split(/\s+/).length;

    const prompt = `Based on this interview coaching conversation, provide a final performance summary.

User's responses: ${userMessages.map((m, i) => `Response ${i + 1}: "${m.content}"`).join("\n")}

Return ONLY valid JSON:
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

    let summary = null;

    try {
      const raw = await geminiText(prompt, 15000);
      const clean = raw.replace(/```json|```/g, "").trim();
      summary = JSON.parse(clean);
    } catch (err) {
      console.error("Summary error:", err.message);
      summary = {
        overallScore: 65,
        summary: "You completed the coaching session. Keep practicing to improve your interview skills.",
        topStrengths: ["Completed the session", "Engaged with the coach"],
        topImprovements: ["Reduce filler words", "Be more specific in answers", "Practice more"],
        communicationScore: 65,
        confidenceScore: 60,
        clarityScore: 65,
        nextSteps: "Practice answering behavioral questions using the STAR method.",
      };
    }

    res.status(200).json({
      success: true,
      summary,
      stats: {
        totalResponses: userMessages.length,
        totalWords,
        fillerWordsUsed: allFillers,
        fillerCount: allFillers.length,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { startCoaching, getCoachSummary };

