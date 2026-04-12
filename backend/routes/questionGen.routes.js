const express = require("express");
const router  = express.Router();
const { generateQuestions } = require("../controllers/questionGen.controller");
const { protect } = require("../middleware/auth.middleware");

router.use(protect);

// GET /api/questions/generate?category=general&difficulty=medium&count=5
router.get("/generate", generateQuestions);

module.exports = router;
