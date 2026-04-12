const Session = require("../../models/Session");
const Transcript = require("../../models/Transcript");

// @desc    Get all sessions for logged-in user
// @route   GET /api/sessions
// @access  Private
const getUserSessions = async (req, res) => {
  try {
    const sessions = await Session.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: sessions.length, sessions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get a single session with its transcripts
// @route   GET /api/sessions/:sessionId
// @access  Private
const getSessionById = async (req, res) => {
  try {
    const session = await Session.findOne({
      sessionId: req.params.sessionId,
      user: req.user._id,
    });

    if (!session) {
      return res.status(404).json({ success: false, message: "Session not found." });
    }

    const transcripts = await Transcript.find({ session: session._id }).sort({ timestamp: 1 });
    res.status(200).json({ success: true, session, transcripts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get analytics report for the user (all sessions)
// @route   GET /api/sessions/report
// @access  Private
const getUserReport = async (req, res) => {
  try {
    const sessions = await Session.find({ user: req.user._id, status: "completed" });

    if (sessions.length === 0) {
      return res.status(200).json({ success: true, message: "No completed sessions yet.", report: {} });
    }

    const totalExpressions = {
      happy: 0,
      sad: 0,
      angry: 0,
      neutral: 0,
      surprised: 0,
      fearful: 0,
      disgusted: 0,
    };

    let totalDuration = 0;
    let totalCorrections = 0;

    sessions.forEach((s) => {
      totalDuration += s.duration;
      totalCorrections += s.totalCorrections;
      Object.keys(totalExpressions).forEach((key) => {
        totalExpressions[key] += s.expressionSummary[key] || 0;
      });
    });

    const totalDetections = Object.values(totalExpressions).reduce((a, b) => a + b, 0);
    const expressionPercentages = {};
    Object.keys(totalExpressions).forEach((key) => {
      expressionPercentages[key] =
        totalDetections > 0 ? ((totalExpressions[key] / totalDetections) * 100).toFixed(1) : "0.0";
    });

    res.status(200).json({
      success: true,
      report: {
        totalSessions: sessions.length,
        totalDurationSeconds: totalDuration,
        totalSpeechCorrections: totalCorrections,
        expressionTotals: totalExpressions,
        expressionPercentages,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getUserSessions, getSessionById, getUserReport };

