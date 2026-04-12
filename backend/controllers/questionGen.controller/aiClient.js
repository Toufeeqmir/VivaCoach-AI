const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const getQuestionModel = () => ai.getGenerativeModel({ model: "gemini-1.5-flash" });

module.exports = { getQuestionModel };

