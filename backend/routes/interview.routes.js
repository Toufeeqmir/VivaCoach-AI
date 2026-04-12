const express = require("express");
const router  = express.Router();
const InterviewSession = require("../models/InterviewSession");

const {
  generateQuestions,
  startInterview,
  submitAnswer,
  endInterview,
} = require("../controllers/interview.controller");

const { protect } = require("../middleware/auth.middleware");

router.use(protect);

router.get("/questions",      generateQuestions);
router.post("/start",         startInterview);
router.post("/answer",        submitAnswer);
router.put("/:sessionId/end", endInterview);

router.get("/history", async (req, res) => {
  try {
    const sessions = await InterviewSession.find({
      user: req.user._id,
      status: "completed",
    }).sort({ createdAt: -1 });
    res.json({ success: true, sessions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/:sessionId", async (req, res) => {
  try {
    const session = await InterviewSession.findOne({
      sessionId: req.params.sessionId,
      user: req.user._id,
    });
    if (!session) return res.status(404).json({ message: "Not found" });
    res.json({ success: true, session });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;