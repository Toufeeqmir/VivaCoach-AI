const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
// Set GROQ_MODEL in .env to override this without changing source code.
// `llama-3.3-70b-versatile` is not available to this Groq account.
const GROQ_MODEL = process.env.GROQ_MODEL || "groq/compound-mini";

const askGroq = async (prompt) => {
  const response = await groq.chat.completions.create({
    model: GROQ_MODEL,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  });
  return response.choices[0].message.content;
};

const parseModelJson = (text) => {
  let cleaned = String(text || "").replace(/```json/g, "").replace(/```/g, "").trim();
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1) cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  return JSON.parse(cleaned);
};

module.exports = { askGroq, parseModelJson };

