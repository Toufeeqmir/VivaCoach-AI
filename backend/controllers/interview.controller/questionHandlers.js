const { askGroq, parseModelJson } = require("./groqClient");

// @desc    Generate Questions using Groq
// @route   GET /api/interview/questions
const generateQuestions = async (req, res) => {
  try {
    const { category, difficulty, role } = req.query;

    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({ success: false, message: "Groq API Key Missing" });
    }

    const prompt = `
      You are an expert HR interviewer. Generate 5 interview questions for the role: ${role || "Software Developer"}.
      Category: ${category || "General"}
      Difficulty: ${difficulty || "Medium"}

      CRITICAL: Return ONLY a valid JSON object. No extra text, no markdown backticks.
      Format: {"questions": ["question1", "question2", "question3", "question4", "question5"]}
    `;

    const text = await askGroq(prompt);
    const data = parseModelJson(text);
    const rawQuestions = Array.isArray(data.questions) ? data.questions : data;

    const questionArray = rawQuestions.map((q) => ({
      question: typeof q === "string" ? q : q.question,
      category: category || "general",
      difficulty: difficulty || "medium",
      questionType: "primary",
      focusArea: category || "general",
    }));

    res.status(200).json({ success: true, questions: questionArray });
  } catch (error) {
    console.error("GROQ GENERATION ERROR:", error.message);
    res.status(500).json({ success: false, message: "AI generation failed" });
  }
};

module.exports = { generateQuestions };

