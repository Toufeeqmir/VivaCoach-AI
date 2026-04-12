const HF_MODEL_ID = process.env.HF_MODEL_ID || "mir-sajad-01/facialExpressionModel";
const HF_MODEL_URL = process.env.HF_MODEL_URL || "";
const HF_TOKEN = process.env.HF_TOKEN || process.env.HF_API_TOKEN;

const CANONICAL = ["angry", "disgust", "fear", "happy", "neutral", "sad", "surprise"];
const inFlightByUser = new Map();
const disabledUntilByUser = new Map();

function resolveHfEndpoint() {
  const url = String(HF_MODEL_URL || "").trim();
  if (url.includes("router.huggingface.co/hf-inference/models/")) return url;
  const m = url.match(/api-inference\.huggingface\.co\/models\/(.+)$/i);
  const modelId = m && m[1] ? m[1] : HF_MODEL_ID;
  return `https://router.huggingface.co/hf-inference/models/${encodeURIComponent(modelId)}`;
}

function normalizeLabel(label) {
  const l = String(label || "").toLowerCase().trim();
  if (l === "anger") return "angry";
  return CANONICAL.includes(l) ? l : "neutral";
}

function parseHfPredictions(data) {
  if (!Array.isArray(data) || data.length === 0) return null;
  const probs = {};
  let best = { expression: "neutral", confidence: 0 };

  for (const row of data) {
    const expression = normalizeLabel(row?.label);
    const score = Number(row?.score) || 0;
    probs[expression] = Math.max(probs[expression] || 0, score);
    if (score > best.confidence) best = { expression, confidence: score };
  }

  return { ...best, probabilities: probs };
}

module.exports = {
  HF_TOKEN,
  inFlightByUser,
  disabledUntilByUser,
  resolveHfEndpoint,
  parseHfPredictions,
};

