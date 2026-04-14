const FILLER_WORDS = [
  "umm", "um", "uh", "like", "you know", "basically",
  "literally", "actually", "so", "right", "okay", "hmm"
];

const POSITIVE_SPEECH_WORDS = [
  "confident", "learned", "improved", "achieved", "led", "built", "delivered",
  "solved", "collaborated", "success", "growth", "clear", "strong",
];

const NEGATIVE_SPEECH_WORDS = [
  "can't", "cannot", "failed", "confused", "unsure", "weak", "difficult",
  "problem", "issue", "stuck", "nervous", "maybe", "idk",
];

const detectFillerWords = (text) => {
  if (!text) return { fillerWords: [], fillerWordCount: 0 };

  const lower = text.toLowerCase();
  const found = [];

  FILLER_WORDS.forEach((word) => {
    const regex = new RegExp(`\\b${word}\\b`, "gi");
    const matches = lower.match(regex);
    if (matches) {
      matches.forEach(() => found.push(word));
    }
  });

  return {
    fillerWords: [...new Set(found)],
    fillerWordCount: found.length,
  };
};

const calculateWordsPerMinute = (text, durationSeconds) => {
  if (!text || !durationSeconds || durationSeconds === 0) return 0;

  const wordCount = text.trim().split(/\s+/).length;
  const minutes = durationSeconds / 60;
  return Math.round(wordCount / minutes);
};

const calculateGrammarScore = (corrections, totalWords) => {
  if (!totalWords || totalWords === 0) return 100;

  const errorRate = corrections / totalWords;
  const score = Math.max(0, 100 - errorRate * 100);
  return Math.round(score);
};

const calculateFillerScore = (fillerWordCount, totalWords) => {
  if (!totalWords || totalWords === 0) return 100;

  const fillerRate = fillerWordCount / totalWords;
  const score = Math.max(0, 100 - fillerRate * 200);
  return Math.round(score);
};

// FIX: when emotion data is missing, estimate from answer quality instead of hardcoding 50
const calculateConfidenceScore = (emotionSummary, grammarScore = 70, fillerScore = 70) => {
  const total = Object.values(emotionSummary).reduce((a, b) => a + b, 0);

  if (total === 0) {
    // HuggingFace emotion model unavailable — derive confidence from answer quality
    return Math.round((grammarScore * 0.5) + (fillerScore * 0.5));
  }

  const positive = (emotionSummary.happy || 0) + (emotionSummary.neutral || 0);
  const score = Math.round((positive / total) * 100);
  return Math.min(100, Math.max(0, score));
};

// FIX: minimum score is 30, not 0 — very slow speech still deserves partial credit
const calculateSpeechScore = (wordsPerMinute) => {
  if (wordsPerMinute === 0) return 50;
  if (wordsPerMinute >= 120 && wordsPerMinute <= 150) return 100;
  if (wordsPerMinute < 80) return 30;
  if (wordsPerMinute < 120) {
    return Math.max(30, Math.round(100 - (120 - wordsPerMinute) * 1.5));
  }
  return Math.max(30, Math.round(100 - (wordsPerMinute - 150) * 1.5));
};

const calculateOverallScore = (confidenceScore, grammarScore, speechScore, fillerScore) => {
  return Math.round(
    confidenceScore * 0.30 +
    grammarScore    * 0.25 +
    speechScore     * 0.25 +
    fillerScore     * 0.20
  );
};

const calculateSpeechSentimentScore = (text = "") => {
  const words = String(text)
    .toLowerCase()
    .replace(/[^a-z\s']/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) return 50;

  let positive = 0;
  let negative = 0;
  words.forEach((w) => {
    if (POSITIVE_SPEECH_WORDS.includes(w)) positive += 1;
    if (NEGATIVE_SPEECH_WORDS.includes(w)) negative += 1;
  });

  const signal = positive - negative;
  const density = signal / Math.max(6, Math.ceil(words.length / 4));
  return Math.max(0, Math.min(100, Math.round(50 + density * 20)));
};

const calculateMultimodalScore = (confidenceScore, speechSentimentScore) => {
  return Math.round(confidenceScore * 0.6 + speechSentimentScore * 0.4);
};

const generateFeedback = (overallScore, wordsPerMinute, fillerWordCount, grammarScore) => {
  const feedback = [];

  if (overallScore >= 80) {
    feedback.push("Excellent performance! You showed great confidence and clarity.");
  } else if (overallScore >= 60) {
    feedback.push("Good performance! A few areas need improvement.");
  } else {
    feedback.push("Keep practicing! You will improve with more sessions.");
  }

  if (wordsPerMinute === 0) {
    feedback.push("No speaking pace detected. Make sure to speak clearly into your microphone.");
  } else if (wordsPerMinute > 150) {
    feedback.push("You were speaking too fast. Try to slow down to 120-150 words per minute.");
  } else if (wordsPerMinute < 100) {
    feedback.push("You were speaking too slowly. Try to maintain a steady pace.");
  } else {
    feedback.push("Your speaking pace was good!");
  }

  if (fillerWordCount > 5) {
    feedback.push(`You used ${fillerWordCount} filler words. Try to reduce words like umm, like, you know.`);
  } else if (fillerWordCount > 0) {
    feedback.push(`You used ${fillerWordCount} filler word(s). Keep reducing them.`);
  }

  if (grammarScore < 70) {
    feedback.push("Work on your grammar and sentence structure.");
  } else if (grammarScore >= 90) {
    feedback.push("Great grammar and sentence structure!");
  }

  return feedback.join(" ");
};

const getDominantEmotion = (emotionSummary) => {
  return Object.keys(emotionSummary).reduce((a, b) =>
    emotionSummary[a] > emotionSummary[b] ? a : b
  );
};

module.exports = {
  detectFillerWords,
  calculateWordsPerMinute,
  calculateGrammarScore,
  calculateFillerScore,
  calculateConfidenceScore,
  calculateSpeechScore,
  calculateOverallScore,
  calculateSpeechSentimentScore,
  calculateMultimodalScore,
  generateFeedback,
  getDominantEmotion,
};