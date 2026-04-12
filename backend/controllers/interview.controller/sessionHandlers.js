const { v4: uuidv4 } = require("uuid");
const InterviewSession = require("../../models/InterviewSession");
const { askGroq } = require("./groqClient");

const startInterview = async (req, res) => {
  try {
    const session = await InterviewSession.create({
      user: req.user._id,
      sessionId: uuidv4(),
      status: "active",
      startTime: new Date(),
    });
    res.status(201).json({ success: true, session });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const endInterview = async (req, res) => {
  try {
    const session = await InterviewSession.findOne({ sessionId: req.params.sessionId, user: req.user._id });
    if (!session) return res.status(404).json({ message: "Session not found" });

    const summaryPrompt = `
      You are a career coach. Summarize this interview performance in under 80 words:
      ${JSON.stringify(session.answers)}
    `;

    const summaryText = await askGroq(summaryPrompt);

    session.status = "completed";
    session.overallFeedback = summaryText;
    session.endTime = new Date();

    const total = session.answers.reduce((acc, curr) => acc + curr.overallScore, 0);
    session.totalScore = session.answers.length > 0 ? Math.round(total / session.answers.length) : 0;

    await session.save();
    res.status(200).json({ success: true, result: session });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getInterviewResult = async (req, res) => {
  try {
    const session = await InterviewSession.findOne({ sessionId: req.params.sessionId, user: req.user._id });
    if (!session) return res.status(404).json({ success: false, message: "Not found" });
    res.status(200).json({ success: true, session });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getInterviewHistory = async (req, res) => {
  try {
    const sessions = await InterviewSession.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, sessions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { startInterview, endInterview, getInterviewResult, getInterviewHistory };

