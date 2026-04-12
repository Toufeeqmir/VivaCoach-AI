const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const geminiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const geminiText = async (prompt, timeoutMs = 15000) => {
  const timeout = new Promise((_, rej) => setTimeout(() => rej(new Error("Gemini timeout")), timeoutMs));
  const run = (async () => {
    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    return response.text();
  })();
  return Promise.race([run, timeout]);
};

const FILLER_WORDS = [
  "umm",
  "um",
  "uh",
  "like",
  "you know",
  "basically",
  "literally",
  "actually",
  "so yeah",
  "right",
  "okay so",
  "hmm",
  "kind of",
  "sort of",
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

/**
 * Lightweight, local-only language checks (fallback when Gemini fails).
 * Not a full grammar engine, but gives useful actionable feedback.
 */
const localLanguageFeedback = (message) => {
  const original = (message || "").trim();
  const text = original.replace(/\s+/g, " ").trim();
  const lower = text.toLowerCase();
  const words = text ? text.split(/\s+/) : [];
  const wordCount = words.length;

  const grammarIssues = [];
  const corrections = [];
  const improvements = [];
  const strengths = [];

  // Basic formatting & punctuation
  if (text && text[0] === text[0].toLowerCase()) {
    grammarIssues.push("Start your sentence with a capital letter.");
    corrections.push({ issue: "Sentence starts with lowercase", fix: "Capitalize the first letter." });
  }
  if (text && !/[.!?]$/.test(text)) {
    grammarIssues.push("Add ending punctuation (., !, or ?).");
    corrections.push({ issue: "Missing ending punctuation", fix: "Add a period at the end." });
  }
  if (/\s{2,}/.test(original)) {
    grammarIssues.push("Remove extra spaces.");
    corrections.push({ issue: "Extra spaces", fix: "Use single spaces between words." });
  }

  // Common chat-style phrasing to improve
  if (/\bi am\b/i.test(text)) {
    improvements.push('Prefer "I\'m" for natural speech (unless formal writing).');
    corrections.push({ issue: 'Use of "I am" repeatedly', fix: 'Use "I\'m" to sound more natural.' });
  }
  if (/\bi done\b/i.test(lower) || (/\bi did\b/i.test(lower) && /\bbefore\b/i.test(lower))) {
    grammarIssues.push('Avoid non-standard phrasing like "I done"; use "I have done" / "I did".');
    corrections.push({ issue: "Non-standard tense", fix: 'Use "I have done…" or "I did…"' });
  }
  if (/\bvery\b/.test(lower) || /\breally\b/.test(lower)) {
    improvements.push('Reduce intensifiers like "very/really"—use specific examples instead.');
  }

  // Structure hints for interview answers
  if (wordCount < 12) {
    improvements.push("Add 1–2 sentences: your role/field, 1 key skill, and 1 example.");
  } else {
    strengths.push("Good answer length.");
  }

  if (!/(because|for example|for instance|so that|which led|result)/i.test(text) && wordCount >= 18) {
    improvements.push("Add a quick example to make your point more concrete.");
  }

  // Build a simple improved version (minimal edits)
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
  const status = issuesLines.length === 0 && filler.length === 0 ? "✅ Correct" : "❌ Incorrect";
  if (issuesLines.length === 0) issuesLines.push("None");

  const improvedVersion = improved || message;
  const correctionsLine = status === "✅ Correct" ? "No correction needed" : improvedVersion;
  const explanation =
    status === "✅ Correct"
      ? "Your sentence is grammatically correct. The improved version is a more natural/professional phrasing."
      : "Your sentence has issues that affect clarity or correctness. The corrected version fixes them.";

  return [
    `Original Sentence:\n"${message}"`,
    `Status:\n${status}`,
    `Corrections:\n${status === "✅ Correct" ? correctionsLine : `"${correctionsLine}"`}`,
    `Improved Version:\n"${improvedVersion}"`,
    `Mistakes:\n${issuesLines.length ? issuesLines.join("\n") : "None"}`,
    `Explanation:\n${explanation}`,
  ].join("\n\n");
};

module.exports = {
  geminiText,
  detectFillerWords,
  calculateWPM,
  clamp,
  localLanguageFeedback,
  looksLikeAQuestion,
  buildFallbackCoachResponse,
};

