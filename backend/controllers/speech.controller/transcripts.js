const Transcript = require("../../models/Transcript");
const Session = require("../../models/Session");

// @desc    Get all transcripts for a session
// @route   GET /api/speech/transcripts/:sessionId
// @access  Private
const getSessionTranscripts = async (req, res) => {
  try {
    const session = await Session.findOne({
      sessionId: req.params.sessionId,
      user: req.user._id,
    });

    if (!session) {
      return res.status(404).json({ success: false, message: "Session not found." });
    }

    const transcripts = await Transcript.find({ session: session._id }).sort({ timestamp: 1 });
    res.status(200).json({ success: true, count: transcripts.length, transcripts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getSessionTranscripts };

