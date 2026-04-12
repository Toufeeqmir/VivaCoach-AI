const axios = require("axios");
const FormData = require("form-data");
const { correctText } = require("./correct");

// @desc    Convert audio to text using the Python AI service (Whisper), then correct it
// @route   POST /api/speech/transcribe
// @access  Private
const transcribeAudio = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No audio file provided." });
    }

    const formData = new FormData();
    formData.append("audio", req.file.buffer, {
      filename: "audio.webm",
      contentType: req.file.mimetype,
    });

    let transcribedText;
    try {
      const aiResponse = await axios.post(`${process.env.AI_SERVICE_URL}/transcribe`, formData, {
        headers: formData.getHeaders(),
        timeout: 20000,
      });
      transcribedText = aiResponse.data.text;
    } catch (aiError) {
      return res.status(502).json({
        success: false,
        message: "AI transcription service unavailable.",
        error: aiError.message,
      });
    }

    req.body.originalText = transcribedText;
    return correctText(req, res);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { transcribeAudio };

