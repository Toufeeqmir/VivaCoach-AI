const axios = require("axios");
const Transcript = require("../../models/Transcript");
const Session = require("../../models/Session");

// @desc    Correct spoken text using Gemini API
// @route   POST /api/speech/correct-text
// @access  Private
const correctText = async (req, res) => {
  try {
    const { originalText, sessionId, expressionAtTime } = req.body;

    if (!originalText || originalText.trim() === "") {
      return res.status(400).json({ success: false, message: "No text provided." });
    }

    const geminiPrompt = `You are a grammar and language correction assistant.
The user spoke the following sentence. Please:
1. Correct any grammatical, spelling, or structural errors.
2. Improve sentence clarity while preserving the original meaning.
3. Return a JSON object with these fields:
   - correctedText: the improved sentence (string)
   - corrections: an array of objects with { original, corrected, type } where type is one of: grammar, spelling, punctuation, clarity, structure

Original sentence: "${originalText}"

Respond with valid JSON only, no extra text.`;

    let correctedText = originalText;
    let corrections = [];

    try {
      const geminiResponse = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          contents: [{ parts: [{ text: geminiPrompt }] }],
        },
        { timeout: 10000 }
      );

      const rawText = geminiResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
      const cleanJson = rawText.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(cleanJson);
      correctedText = parsed.correctedText || originalText;
      corrections = parsed.corrections || [];
    } catch (geminiError) {
      console.error("Gemini API error:", geminiError.message);
      correctedText = originalText;
    }

    let session = null;
    if (sessionId) {
      session = await Session.findOne({ sessionId, user: req.user._id });
    }

    const transcript = await Transcript.create({
      user: req.user._id,
      session: session ? session._id : null,
      originalText,
      correctedText,
      corrections,
      expressionAtTime: expressionAtTime || "neutral",
    });

    if (session && session.status === "active" && corrections.length > 0) {
      session.totalCorrections += corrections.length;
      await session.save();
    }

    res.status(200).json({
      success: true,
      originalText,
      correctedText,
      corrections,
      transcriptId: transcript._id,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { correctText };

