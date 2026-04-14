const HF_TOKEN = process.env.HF_TOKEN || process.env.HF_API_TOKEN;

const CANONICAL = ["angry", "disgust", "fear", "happy", "neutral", "sad", "surprise"];

const inFlightByUser = new Map();
const disabledUntilByUser = new Map();

const GRADIO_SPACE = "https://mir-sajad-01-facial-expression-recognition.hf.space";
const GRADIO_API_PREFIX = `${GRADIO_SPACE}/gradio_api`;
const GRADIO_API_NAME = "/predict_emotion";
const GRADIO_HTTP_ENDPOINT = `${GRADIO_API_PREFIX}/call/predict_emotion`;
const GRADIO_UPLOAD_ENDPOINT = `${GRADIO_API_PREFIX}/upload`;

function resolveHfEndpoint() {
  return GRADIO_HTTP_ENDPOINT;
}

function normalizeLabel(label) {
  const l = String(label || "")
    .toLowerCase()
    .replace(/[^\p{L}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

  const word = l.split(" ").find(Boolean) || "";
  if (word === "anger") return "angry";
  if (word === "surprised") return "surprise";
  if (word === "happiness") return "happy";
  if (word === "sadness") return "sad";
  if (word === "fearful") return "fear";
  if (word === "disgusted") return "disgust";
  if (word === "neutrality") return "neutral";
  return CANONICAL.includes(word) ? word : "neutral";
}

function parseLabelPayload(result) {
  if (!result || typeof result !== "object" || !result.label) return null;
  const expression = normalizeLabel(result.label);
  const confidences = Array.isArray(result.confidences) ? result.confidences : [];
  const match = confidences.find((c) => normalizeLabel(c?.label) === expression);
  const confidence = Number(match?.confidence ?? 1);
  return { expression, confidence, probabilities: {} };
}

// Handles both:
// 1) { data: [{ label, confidences }] } from Gradio HTTP endpoint
// 2) { label, confidences } from gradio_client-like response
function parseHfPredictions(payload) {
  const fromGradioRun = parseLabelPayload(payload?.data?.[0]);
  if (fromGradioRun) return fromGradioRun;

  const directResult = parseLabelPayload(payload);
  if (directResult) return directResult;

  return null;
}

module.exports = {
  HF_TOKEN,
  GRADIO_SPACE,
  GRADIO_API_PREFIX,
  GRADIO_API_NAME,
  GRADIO_HTTP_ENDPOINT,
  GRADIO_UPLOAD_ENDPOINT,
  inFlightByUser,
  disabledUntilByUser,
  resolveHfEndpoint,
  parseHfPredictions,
};