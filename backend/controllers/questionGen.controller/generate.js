const Question = require("../../models/Question");
const { getQuestionModel } = require("./aiClient");

const generateQuestions = async (req, res) => {
  try {
    const { category = "general", difficulty = "medium", count = 5, role } = req.query;
    const questionCount = Math.min(Math.max(parseInt(count, 10) || 5, 3), 10);

    const context = role ? `preparing for a ${role} position` : `preparing for a ${category} interview`;
    const model = getQuestionModel();

    const prompt = `
      You are a professional hiring manager. 
      Generate exactly ${questionCount} unique ${difficulty} level interview questions for a candidate ${context}.
      
      Requirements:
      - Return the response STRICTLY as a JSON array of strings.
      - Example format: ["Question 1", "Question 2"]
      - No markdown, no "json" tags, no extra text.
    `;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const cleanJson = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(cleanJson);

      if (Array.isArray(parsed)) {
        const questions = parsed.slice(0, questionCount).map((q) => ({
          question: q,
          category,
          difficulty,
          generated: true,
        }));

        return res.status(200).json({
          success: true,
          count: questions.length,
          questions,
          source: "ai_generated",
        });
      }
    } catch (geminiError) {
      console.error("Gemini Execution Error:", geminiError.message);
      const dbQuestions = await Question.find({ category, difficulty }).limit(questionCount);
      if (dbQuestions.length > 0) {
        return res.status(200).json({
          success: true,
          questions: dbQuestions.map((q) => ({ ...q._doc, generated: false })),
          source: "database",
        });
      }
    }

    res.status(500).json({ success: false, message: "Could not generate questions." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { generateQuestions };

