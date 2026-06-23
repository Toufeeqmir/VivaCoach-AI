const METRIC_ORDER = ["posture", "eyeContact", "confidence", "headStability", "handMovement"];

const METRIC_LABELS = {
  posture: "Posture",
  eyeContact: "Eye Contact",
  confidence: "Confidence",
  headStability: "Head Stability",
  handMovement: "Hand Movement",
};

const UNKNOWN_METRICS = {
  posture: "Awaiting posture",
  eyeContact: "Awaiting gaze",
  confidence: "Awaiting signal",
  headStability: "Awaiting head pose",
  handMovement: "Awaiting hand data",
};

const RAW_KEYS = {
  posture: ["posture", "postureStatus", "posture_status"],
  eyeContact: ["eyeContact", "eye_contact", "gaze", "lookingAtCamera", "looking_at_camera"],
  confidence: ["confidenceLevel", "confidence_level", "presenceConfidence", "presence_confidence"],
  headStability: ["headStability", "head_stability", "headMovement", "head_movement"],
  handMovement: ["handMovement", "hand_movement", "handActivity", "hand_activity"],
};

const STATUS_ICON = {
  good: "✅",
  warning: "⚠️",
  poor: "⚠️",
  unknown: "",
};

const toMetric = (id, statusText, severity, source = "detector", score = null) => ({
  id,
  label: METRIC_LABELS[id],
  statusText,
  severity,
  icon: STATUS_ICON[severity],
  source,
  score,
});

export const createBodyLanguageSnapshot = () => ({
  lastUpdated: null,
  metrics: METRIC_ORDER.reduce((metrics, id) => {
    metrics[id] = toMetric(id, UNKNOWN_METRICS[id], "unknown", "pending");
    return metrics;
  }, {}),
});

const normalizeToken = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[_\s-]+/g, "");

const normalizeScore = (value) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return null;
  return number <= 1 ? Math.round(number * 100) : Math.round(number);
};

const rawMetricValue = (rawValue) => {
  if (rawValue && typeof rawValue === "object") {
    return rawValue.status ?? rawValue.label ?? rawValue.level ?? rawValue.value ?? rawValue.score ?? null;
  }

  return rawValue;
};

const rawMetricScore = (rawValue) => {
  if (rawValue && typeof rawValue === "object") {
    return normalizeScore(rawValue.score ?? rawValue.confidence ?? rawValue.value);
  }

  return typeof rawValue === "number" ? normalizeScore(rawValue) : null;
};

const getFirstValue = (source, keys) => {
  for (const key of keys) {
    if (source?.[key] !== undefined && source?.[key] !== null) return source[key];
  }

  return null;
};

const statusFromScore = (id, score) => {
  if (score === null) return null;

  if (id === "handMovement") {
    if (score <= 35) return toMetric(id, "Calm", "good", "mediapipe", score);
    if (score <= 70) return toMetric(id, "Active", "warning", "mediapipe", score);
    return toMetric(id, "Excess", score >= 90 ? "poor" : "warning", "mediapipe", score);
  }

  if (id === "headStability") {
    if (score >= 70) return toMetric(id, "Stable", "good", "mediapipe", score);
    if (score >= 40) return toMetric(id, "Average", "warning", "mediapipe", score);
    return toMetric(id, "Unstable", "poor", "mediapipe", score);
  }

  if (id === "confidence") {
    if (score >= 70) return toMetric(id, "High", "good", "mediapipe", score);
    if (score >= 40) return toMetric(id, "Average", "warning", "mediapipe", score);
    return toMetric(id, "Low", "poor", "mediapipe", score);
  }

  if (score >= 70) return toMetric(id, "Good", "good", "mediapipe", score);
  if (score >= 40) return toMetric(id, "Average", "warning", "mediapipe", score);
  return toMetric(id, "Poor", "poor", "mediapipe", score);
};

const statusFromToken = (id, rawValue) => {
  const score = rawMetricScore(rawValue);
  const scoreStatus = statusFromScore(id, score);
  if (scoreStatus) return scoreStatus;

  const token = normalizeToken(rawMetricValue(rawValue));
  if (!token) return null;

  if (id === "handMovement") {
    if (["none", "minimal", "low", "calm", "steady", "normal"].includes(token)) {
      return toMetric(id, "Calm", "good", "mediapipe");
    }
    if (["moderate", "active", "average"].includes(token)) {
      return toMetric(id, "Active", "warning", "mediapipe");
    }
    if (["high", "excess", "excessive", "poor", "unstable"].includes(token)) {
      return toMetric(id, "Excess", token === "poor" ? "poor" : "warning", "mediapipe");
    }
  }

  if (id === "headStability") {
    if (["stable", "steady", "good"].includes(token)) return toMetric(id, "Stable", "good", "mediapipe");
    if (["average", "moderate", "slightmovement", "needsimprovement"].includes(token)) {
      return toMetric(id, "Average", "warning", "mediapipe");
    }
    if (["unstable", "poor", "excess", "excessive"].includes(token)) {
      return toMetric(id, "Unstable", "poor", "mediapipe");
    }
  }

  if (id === "confidence") {
    if (["high", "confident", "good"].includes(token)) return toMetric(id, "High", "good", "mediapipe");
    if (["average", "moderate", "medium", "needsimprovement"].includes(token)) {
      return toMetric(id, "Average", "warning", "mediapipe");
    }
    if (["low", "poor", "nervous"].includes(token)) return toMetric(id, "Low", "poor", "mediapipe");
  }

  if (["good", "upright", "straight", "stable", "centered", "visible", "detected", "true"].includes(token)) {
    return toMetric(id, id === "headStability" ? "Stable" : "Good", "good", "mediapipe");
  }

  if (["average", "moderate", "needsimprovement", "slouching", "leaning", "partial", "false"].includes(token)) {
    return toMetric(id, id === "posture" ? "Needs Improvement" : "Average", "warning", "mediapipe");
  }

  if (["poor", "bad", "away", "notdetected", "missing", "lost", "unstable"].includes(token)) {
    return toMetric(id, id === "headStability" ? "Unstable" : "Poor", "poor", "mediapipe");
  }

  return null;
};

const readBodyLanguagePayload = (payload) => {
  // Connect the real MediaPipe/pose output here when the backend starts returning it.
  // Supported shape: { bodyLanguage: { posture, eyeContact, confidenceLevel, headStability, handMovement } }.
  const nested =
    payload?.bodyLanguage ||
    payload?.body_language ||
    payload?.bodyMetrics ||
    payload?.body_metrics ||
    payload?.mediaPipe ||
    payload?.mediapipe ||
    {};

  return {
    ...nested,
    posture: payload?.posture ?? nested.posture,
    eyeContact: payload?.eyeContact ?? payload?.eye_contact ?? nested.eyeContact ?? nested.eye_contact,
    confidenceLevel: payload?.confidenceLevel ?? payload?.confidence_level ?? nested.confidenceLevel ?? nested.confidence_level,
    headStability: payload?.headStability ?? payload?.head_stability ?? nested.headStability ?? nested.head_stability,
    handMovement: payload?.handMovement ?? payload?.hand_movement ?? nested.handMovement ?? nested.hand_movement,
  };
};

const deriveEyeContactFromFace = (payload) => {
  if (payload?.warning || typeof payload?.face_detected !== "boolean") return null;
  return payload.face_detected
    ? toMetric("eyeContact", "Good", "good", "face-detection")
    : toMetric("eyeContact", "Poor", "poor", "face-detection");
};

const deriveConfidenceFromExpression = (payload) => {
  if (payload?.warning || typeof payload?.face_detected !== "boolean") return null;
  if (!payload.face_detected) return toMetric("confidence", "Low", "poor", "expression");

  const score = normalizeScore(payload.confidence);
  const expression = normalizeToken(payload.expression);
  const composedExpressions = ["happy", "neutral", "surprise"];

  if (score !== null && score >= 65 && composedExpressions.includes(expression)) {
    return toMetric("confidence", "High", "good", "expression", score);
  }

  if (score !== null && score < 35) return toMetric("confidence", "Low", "poor", "expression", score);
  if (["sad", "fear", "angry", "disgust"].includes(expression)) {
    return toMetric("confidence", "Average", "warning", "expression", score);
  }

  return toMetric("confidence", "Average", "warning", "expression", score);
};

export const buildBodyLanguageSnapshot = (payload = {}, previous = createBodyLanguageSnapshot()) => {
  const bodyPayload = readBodyLanguagePayload(payload);
  const metrics = { ...previous.metrics };

  for (const id of METRIC_ORDER) {
    const rawValue = getFirstValue(bodyPayload, RAW_KEYS[id]);
    const nextMetric = rawValue !== null ? statusFromToken(id, rawValue) : null;
    if (nextMetric) metrics[id] = nextMetric;
  }

  metrics.eyeContact = statusFromToken("eyeContact", getFirstValue(bodyPayload, RAW_KEYS.eyeContact)) || deriveEyeContactFromFace(payload) || metrics.eyeContact;
  metrics.confidence = statusFromToken("confidence", getFirstValue(bodyPayload, RAW_KEYS.confidence)) || deriveConfidenceFromExpression(payload) || metrics.confidence;

  return {
    lastUpdated: Date.now(),
    metrics,
  };
};

export const getBodyLanguageAlerts = (snapshot) => {
  const metrics = snapshot?.metrics || {};
  const alerts = [];

  if (["warning", "poor"].includes(metrics.posture?.severity) && metrics.posture?.source !== "pending") {
    alerts.push({ id: "posture", message: "Sit Straight", severity: metrics.posture.severity });
  }

  if (metrics.eyeContact?.severity === "warning") {
    alerts.push({ id: "eye-contact", message: "Maintain Eye Contact", severity: "warning" });
  }

  if (metrics.eyeContact?.severity === "poor") {
    alerts.push({ id: "eye-contact", message: "Avoid Looking Away", severity: "poor" });
  }

  if (["warning", "poor"].includes(metrics.headStability?.severity) && metrics.headStability?.source !== "pending") {
    alerts.push({ id: "head-stability", message: "Keep Your Head Stable", severity: metrics.headStability.severity });
  }

  if (["warning", "poor"].includes(metrics.handMovement?.severity) && metrics.handMovement?.source !== "pending") {
    alerts.push({ id: "hand-movement", message: "Reduce Excessive Hand Movement", severity: metrics.handMovement.severity });
  }

  return alerts;
};
