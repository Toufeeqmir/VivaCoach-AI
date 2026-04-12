const { v4: uuidv4 } = require("uuid");
const Session = require("../../models/Session");
const User = require("../../models/User");

// @desc    Start a new session
// @route   POST /api/sessions/start
// @access  Private
const startSession = async (req, res) => {
  try {
    const session = await Session.create({
      user: req.user._id,
      sessionId: uuidv4(),
      startTime: new Date(),
      status: "active",
    });

    res.status(201).json({ success: true, message: "Session started.", session });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    End a session and compute summary
// @route   PUT /api/sessions/:sessionId/end
// @access  Private
const endSession = async (req, res) => {
  try {
    const session = await Session.findOne({
      sessionId: req.params.sessionId,
      user: req.user._id,
    });

    if (!session) {
      return res.status(404).json({ success: false, message: "Session not found." });
    }

    if (session.status === "completed") {
      return res.status(400).json({ success: false, message: "Session already ended." });
    }

    const endTime = new Date();
    const duration = Math.floor((endTime - session.startTime) / 1000);

    const summary = session.expressionSummary;
    const dominant = Object.keys(summary).reduce((a, b) => (summary[a] > summary[b] ? a : b));

    session.endTime = endTime;
    session.duration = duration;
    session.dominantExpression = dominant;
    session.status = "completed";
    await session.save();

    await User.findByIdAndUpdate(req.user._id, { $inc: { totalSessions: 1 } });

    res.status(200).json({ success: true, message: "Session ended.", session });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { startSession, endSession };

