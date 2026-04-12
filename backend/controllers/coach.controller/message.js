const {
  geminiText,
  detectFillerWords,
  calculateWPM,
  clamp,
  localLanguageFeedback,
  looksLikeAQuestion,
  buildFallbackCoachResponse,
} = require("./shared");

// @desc    Send message to AI coach and get feedback
// @route   POST /api/coach/message
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const { message, history = [], duration = 0 } = req.body;

    if (!message || message.trim() === "") {
      return res.status(400).json({ success: false, message: "Message is required." });
    }

    // Analyze the message
    const fillerWords = detectFillerWords(message);
    const wordCount = message.trim().split(/\s+/).length;
    const wpm = duration > 0 ? calculateWPM(message, duration) : 0;

    const systemPrompt = `You are an AI Communication Coach focused on correcting grammar, sentence structure, and clarity in real-time.

Your job is NOT to act like an interviewer unless explicitly asked.

For every user input, do the following:

STEP 1: Check correctness
- Is the sentence grammatically correct?
- Is it natural in spoken English?

STEP 2: If WRONG:
- Clearly say it is incorrect
- Show the corrected version
- Highlight what was wrong

STEP 3: If CORRECT:
- Say it is correct
- Suggest a slightly better or more natural version (optional)

STEP 4: Keep response SHORT and precise

OUTPUT FORMAT (STRICT):

Original Sentence:
"<user sentence>"

Status:
✅ Correct
or
❌ Incorrect

Corrections:
(if incorrect, show corrected sentence)
(if correct, write "No correction needed")

Improved Version:
(a more natural or professional version)

Mistakes:
- (list exact mistakes like grammar, article usage, plural, etc.)
- If none → "None"

Explanation:
(1–2 line simple explanation)

IMPORTANT RULES:
- DO NOT ask follow-up questions automatically
- DO NOT behave like an interviewer unless user asks for practice
- Focus only on correction and clarity
- Be direct, not motivational
- Avoid repeating generic sentences

After the formatted response above, provide structured feedback in this exact JSON format at the end:

###FEEDBACK###
{
  "overallScore": <number 0-100>,
  "grammarIssues": [<list of specific grammar issues; include suggested fix when possible>],
  "fillerWordsUsed": [<list of filler words found>],
  "strengths": [<list of what they did well>],
  "improvements": [<list of specific improvements for communication and interview impact>],
  "improvedVersion": "<rewrite their message in a better, interview-ready way>",
  "tip": "<one specific actionable tip for the next response>",
  "nextQuestion": "<only include if the user explicitly asked for interview practice>"
}
###END###
Always output valid JSON in the feedback block.`;

    let coachResponse = "";
    let feedback = null;

    try {
      const historyText = (Array.isArray(history) ? history : [])
        .slice(-10)
        .map((h) => `${h.role === "user" ? "User" : "Coach"}: ${h.content}`)
        .join("\n");

      const raw = await geminiText(
        `${systemPrompt}\n\nConversation so far:\n${historyText}\n\nUser said: "${message}"`,
        15000,
      );

      // Split response and feedback
      const feedbackMatch = raw.match(/###FEEDBACK###([\s\S]*?)###END###/);
      if (feedbackMatch) {
        const cleanJson = feedbackMatch[1].trim().replace(/```json|```/g, "").trim();
        try {
          feedback = JSON.parse(cleanJson);
        } catch (e) {
          feedback = null;
        }
        coachResponse = raw.replace(/###FEEDBACK###[\s\S]*?###END###/, "").trim();
      } else {
        coachResponse = raw.trim();
      }
    } catch (geminiError) {
      console.error("Gemini coach error:", geminiError.message);
      coachResponse = "";
    }

    // Build feedback if Gemini did not return structured one
    if (!feedback) {
      feedback = localLanguageFeedback(message);
    }

    // Always add detected filler words
    if (fillerWords.length > 0 && feedback.fillerWordsUsed?.length === 0) {
      feedback.fillerWordsUsed = fillerWords;
    }

    // Safety: enforce reasonable bounds + arrays
    feedback.overallScore = clamp(Number(feedback.overallScore || 0), 0, 100);
    feedback.grammarIssues = Array.isArray(feedback.grammarIssues) ? feedback.grammarIssues : [];
    feedback.fillerWordsUsed = Array.isArray(feedback.fillerWordsUsed) ? feedback.fillerWordsUsed : [];
    feedback.strengths = Array.isArray(feedback.strengths) ? feedback.strengths : [];
    feedback.improvements = Array.isArray(feedback.improvements) ? feedback.improvements : [];
    feedback.improvedVersion = typeof feedback.improvedVersion === "string" ? feedback.improvedVersion : message;
    feedback.tip =
      typeof feedback.tip === "string"
        ? feedback.tip
        : "Keep it simple: subject + verb + object. Then add one detail.";
    // Do not force a follow-up question in open coach mode.
    if (typeof feedback.nextQuestion !== "string") feedback.nextQuestion = "";

    // If Gemini failed (or returned empty), craft an interactive coach response with specific corrections.
    // Also, if user asked a question, answer more directly; if they answered, push them to improve.
    if (!coachResponse || coachResponse.length < 10) {
      if (looksLikeAQuestion(message)) {
        coachResponse =
          "Good question. Here’s how I’d improve your communication: keep it concise, use one clear point per sentence, and add a small example. " +
          "Send me your exact sentence and I’ll rewrite it and point out grammar issues.";
      } else {
        coachResponse = buildFallbackCoachResponse(message, feedback);
      }
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

