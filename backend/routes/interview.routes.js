const express = require("express");
const router  = express.Router();

const {
  generateQuestions,
  startInterview,
  submitAnswer,
  endInterview,
  getInterviewResult,
  getInterviewHistory,
} = require("../controllers/interview.controller");

const { protect } = require("../middleware/auth.middleware");

router.use(protect);

router.get("/questions",      generateQuestions);
router.post("/start",         startInterview);
router.post("/answer",        submitAnswer);
router.put("/:sessionId/end", endInterview);

router.get("/history",        getInterviewHistory);
router.get("/:sessionId",     getInterviewResult);

module.exports = router;
