const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const groqText = async (prompt, timeoutMs = 15000) => {
  const timeout = new Promise((_, rej) => setTimeout(() => rej(new Error("Groq timeout")), timeoutMs));
  const run = groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  }).then(r => r.choices[0].message.content);
  return Promise.race([run, timeout]);
};

const FILLER_WORDS = [
  "umm", "um", "uh", "like", "you know", "basically",
  "literally", "actually", "so yeah", "right", "okay so",
  "hmm", "kind of", "sort of",
];

const detectFillerWords = (text) => {
  const lower = (text || "").toLowerCase();
  const found = [];
  FILLER_WORDS.forEach((word) => {
    const regex = new RegExp(`\\b${word}\\b`, "gi");
    const matches = lower.match(regex);
    if (matches) matches.forEach(() => found.push(word));
  });
  return [...new Set(found)];
};

const calculateWPM = (text, durationSeconds) => {
  if (!text || durationSeconds === 0) return 0;
  const words = text.trim().split(/\s+/).length;
  return Math.round(words / (durationSeconds / 60));
};

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

const localLanguageFeedback = (message) => {
  const text = (message || "").trim().replace(/\s+/g, " ");
  const words = text ? text.split(/\s+/) : [];
  const wordCount = words.length;
  const grammarIssues = [];
  const corrections = [];
  const improvements = [];
  const strengths = [];

  if (text && text[0] === text[0].toLowerCase()) {
    grammarIssues.push("Start your sentence with a capital letter.");
    corrections.push({ issue: "Sentence starts with lowercase", fix: "Capitalize the first letter." });
  }
  if (text && !/[.!?]$/.test(text)) {
    grammarIssues.push("Add ending punctuation (., !, or ?).");
    corrections.push({ issue: "Missing ending punctuation", fix: "Add a period at the end." });
  }
  if (wordCount < 12) {
    improvements.push("Add 1-2 sentences: your role/field, 1 key skill, and 1 example.");
  } else {
    strengths.push("Good answer length.");
  }

  let improvedVersion = text;
  if (improvedVersion) {
    improvedVersion = improvedVersion[0].toUpperCase() + improvedVersion.slice(1);
    if (!/[.!?]$/.test(improvedVersion)) improvedVersion += ".";
  }

  const fillerWordsUsed = detectFillerWords(text);
  const grammarPenalty = clamp(grammarIssues.length * 6, 0, 30);
  const fillerPenalty = clamp(fillerWordsUsed.length * 5, 0, 25);
  const lengthPenalty = wordCount < 8 ? 18 : wordCount < 15 ? 10 : 0;
  const score = clamp(82 - grammarPenalty - fillerPenalty - lengthPenalty, 20, 95);

  return {
    overallScore: score,
    grammarIssues,
    fillerWordsUsed,
    strengths,
    improvements,
    improvedVersion,
    corrections,
    tip: "Answer in 2 parts: (1) who you are + field, (2) 1 proof example + result.",
  };
};

const looksLikeAQuestion = (text) => /\?\s*$/.test((text || "").trim());

const buildFallbackCoachResponse = (message, feedback) => {
  const issues = Array.isArray(feedback?.corrections) ? feedback.corrections : [];
  const filler = Array.isArray(feedback?.fillerWordsUsed) ? feedback.fillerWordsUsed : [];
  const improved = typeof feedback?.improvedVersion === "string" ? feedback.improvedVersion : "";
  const issuesLines = [];
  if (issues.length > 0) {
    issues.slice(0, 4).forEach((c) => issuesLines.push(`- ${c.issue} → ${c.fix}`));
  }
  if (filler.length > 0) issuesLines.push(`- Filler words used: ${filler.join(", ")}`);
  const status = issuesLines.length === 0 ? "✅ Correct" : "❌ Needs improvement";
  return `${status}\n\n${issuesLines.join("\n")}${improved ? `\n\nImproved: "${improved}"` : ""}`;
};

module.exports = {
  groqText,
  detectFillerWords,
  calculateWPM,
  clamp,
  localLanguageFeedback,
  looksLikeAQuestion,
  buildFallbackCoachResponse,
};
