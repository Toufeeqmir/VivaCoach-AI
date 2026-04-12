const express = require("express");
const router  = express.Router();
const { sendMessage, startCoaching, getCoachSummary } = require("../controllers/coach.controller");
const { protect } = require("../middleware/auth.middleware");

router.use(protect);

// POST /api/coach/start    - start coaching session with opening question
router.post("/start",   startCoaching);

// POST /api/coach/message  - send message and get feedback
router.post("/message", sendMessage);

// POST /api/coach/summary  - get final session summary
router.post("/summary", getCoachSummary);

module.exports = router;
