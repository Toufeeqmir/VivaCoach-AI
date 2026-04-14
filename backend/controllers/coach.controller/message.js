const {
  groqText,
  detectFillerWords,
  calculateWPM,
  clamp,
  localLanguageFeedback,
  looksLikeAQuestion,
  buildFallbackCoachResponse,
} = require("./shared");

const sendMessage = async (req, res) => {
  try {
    const { message, history = [], duration = 0 } = req.body;

    if (!message || message.trim() === "") {
      return res.status(400).json({ success: false, message: "Message is required." });
    }

    const fillerWords = detectFillerWords(message);
    const wordCount = message.trim().split(/\s+/).length;
    const wpm = duration > 0 ? calculateWPM(message, duration) : 0;

    const systemPrompt = `You are an expert AI Communication Coach helping users improve their English communication and interview skills.

Your role is like a friendly ChatGPT-style coach. You:
1. Have natural back-and-forth conversations
2. Correct grammar and sentence structure
3. Give interview tips when asked
4. Help improve communication skills
5. Answer any questions about interviews, communication, or language

For every user message:
- Respond naturally like a helpful coach
- If they share a sentence to correct: correct it clearly
- If they ask a question: answer it helpfully
- Give specific actionable advice
- Be encouraging but honest

After your response, provide feedback in this exact format:

###FEEDBACK###
{
  "overallScore": <0-100>,
  "grammarIssues": ["<issue 1>", "<issue 2>"],
  "fillerWordsUsed": ["<filler words found>"],
  "strengths": ["<what they did well>"],
  "improvements": ["<specific improvements>"],
  "improvedVersion": "<better version of their message>",
  "tip": "<one actionable tip>"
}
###END###`;

    const historyText = (Array.isArray(history) ? history : [])
      .slice(-10)
      .map((h) => `${h.role === "user" ? "User" : "Coach"}: ${h.content}`)
      .join("\n");

    let coachResponse = "";
    let feedback = null;

    try {
      const raw = await groqText(
        `${systemPrompt}\n\nConversation so far:\n${historyText}\n\nUser: "${message}"\n\nCoach:`,
        15000
      );

      const feedbackMatch = raw.match(/###FEEDBACK###([\s\S]*?)###END###/);
      if (feedbackMatch) {
        const cleanJson = feedbackMatch[1].trim().replace(/```json|```/g, "").trim();
        try { feedback = JSON.parse(cleanJson); } catch (e) { feedback = null; }
        coachResponse = raw.replace(/###FEEDBACK###[\s\S]*?###END###/, "").trim();
      } else {
        coachResponse = raw.trim();
      }
    } catch (groqError) {
      console.error("Groq coach error:", groqError.message);
      coachResponse = "";
    }

    if (!feedback) feedback = localLanguageFeedback(message);
    if (fillerWords.length > 0 && feedback.fillerWordsUsed?.length === 0) {
      feedback.fillerWordsUsed = fillerWords;
    }

    feedback.overallScore = clamp(Number(feedback.overallScore || 0), 0, 100);
    feedback.grammarIssues = Array.isArray(feedback.grammarIssues) ? feedback.grammarIssues : [];
    feedback.fillerWordsUsed = Array.isArray(feedback.fillerWordsUsed) ? feedback.fillerWordsUsed : [];
    feedback.strengths = Array.isArray(feedback.strengths) ? feedback.strengths : [];
    feedback.improvements = Array.isArray(feedback.improvements) ? feedback.improvements : [];
    feedback.improvedVersion = typeof feedback.improvedVersion === "string" ? feedback.improvedVersion : message;
    feedback.tip = typeof feedback.tip === "string" ? feedback.tip : "Keep responses clear and concise.";

    if (!coachResponse || coachResponse.length < 10) {
      coachResponse = looksLikeAQuestion(message)
        ? "Great question! Send me your exact sentence and I'll correct it and give you specific feedback."
        : buildFallbackCoachResponse(message, feedback);
    }

    res.status(200).json({
      success: true,
      coachResponse,
      feedback,
      stats: {
        wordCount,
        wpm: wpm > 0 ? wpm : null,
        fillerWords,
        fillerCount: fillerWords.length,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { sendMessage };
