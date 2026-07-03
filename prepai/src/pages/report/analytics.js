export const SCORE_METRICS = [
  { key: "overall", answerKey: "overallScore", label: "Overall", color: "#85b7eb" },
  { key: "confidence", answerKey: "confidenceScore", label: "Confidence", color: "#fbbf24" },
  { key: "delivery", answerKey: "deliveryScore", label: "Delivery", color: "#34d399" },
  { key: "grammar", answerKey: "grammarScore", label: "Grammar", color: "#f87171" },
  { key: "structure", answerKey: "structureScore", label: "Structure", color: "#a78bfa" },
  { key: "relevance", answerKey: "relevanceScore", label: "Relevance", color: "#60a5fa" },
];

export const SESSION_DETAIL_METRICS = [
  { key: "overall", label: "Overall" },
  { key: "confidence", label: "Confidence" },
  { key: "grammar", label: "Grammar" },
  { key: "delivery", label: "Delivery" },
];

export const COMPARISON_CONFIG = [
  { key: "confidenceScore", label: "Confidence" },
  { key: "grammarScore", label: "Grammar" },
  { key: "deliveryScore", label: "Delivery" },
  { key: "structureScore", label: "Structure" },
  { key: "relevanceScore", label: "Relevance" },
];

export const EMOTION_COLORS = {
  happy: "#fbbf24",
  neutral: "#94a3b8",
  sad: "#60a5fa",
  angry: "#f87171",
  fear: "#a78bfa",
  disgust: "#34d399",
  surprise: "#fb923c",
};

const STRONG_THRESHOLD = 75;
const WEAK_THRESHOLD = 65;

const asNumber = (value) => {
  const next = Number(value);
  return Number.isFinite(next) ? next : null;
};

const average = (items, picker = (item) => item) => {
  const values = items
    .map((item) => asNumber(picker(item)))
    .filter((value) => value !== null);

  return values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : 0;
};

const clampMetric = (value) => {
  const safeValue = asNumber(value);
  return safeValue === null ? 0 : Math.max(0, Math.min(100, Math.round(safeValue)));
};

const clampCount = (value) => {
  const safeValue = asNumber(value);
  return safeValue === null ? 0 : Math.max(0, Math.round(safeValue));
};

const sortByDateDesc = (sessions) =>
  [...(sessions || [])].sort((a, b) => new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0));

const sortByDateAsc = (sessions) =>
  [...(sessions || [])].sort((a, b) => new Date(a?.createdAt || 0) - new Date(b?.createdAt || 0));

export const scoreTone = (score) => {
  if (score >= 75) return { color: "#34d399", badge: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" };
  if (score >= 55) return { color: "#fbbf24", badge: "bg-yellow-500/10 border-yellow-500/20 text-yellow-400" };
  return { color: "#f87171", badge: "bg-red-500/10 border-red-500/20 text-red-400" };
};

export const deltaTone = (delta) => {
  if (delta > 0) {
    return {
      direction: "up",
      arrow: "\u2191",
      label: "Improvement",
      text: "text-emerald-400",
      border: "border-emerald-500/20",
      bg: "bg-emerald-500/10",
      color: "#34d399",
    };
  }

  if (delta < 0) {
    return {
      direction: "down",
      arrow: "\u2193",
      label: "Decline",
      text: "text-red-400",
      border: "border-red-500/20",
      bg: "bg-red-500/10",
      color: "#f87171",
    };
  }

  return {
    direction: "flat",
    arrow: "\u2192",
    label: "No change",
    text: "text-slate-400",
    border: "border-slate-700",
    bg: "bg-slate-800/60",
    color: "#94a3b8",
  };
};

export const formatSignedPercent = (value) => {
  const number = Number(value) || 0;
  return `${number > 0 ? "+" : ""}${number}%`;
};

export const formatSessionDate = (value) =>
  new Date(value).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

export const formatTimelineDate = (value) =>
  new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

export const getAnswerMetric = (answer, key) => {
  if (key === "fillerWordCount") {
    return clampCount(answer?.fillerWordCount);
  }

  const directValue = asNumber(answer?.[key]);
  if (directValue !== null) {
    return clampMetric(directValue);
  }

  if (key === "relevanceScore") return clampMetric(answer?.overallScore || answer?.multimodalScore);
  if (key === "structureScore") return clampMetric(answer?.grammarScore || answer?.overallScore);

  if (key === "deliveryScore") {
    return average([answer?.speechScore, answer?.fillerScore, answer?.confidenceScore]);
  }

  return 0;
};

export const getSessionMetric = (session, key) => {
  const answers = session?.answers || [];

  if (key === "overallScore") {
    const sessionTotal = asNumber(session?.totalScore);
    return clampMetric(sessionTotal !== null ? sessionTotal : average(answers, (answer) => getAnswerMetric(answer, "overallScore")));
  }

  if (key === "fillerWordCount") {
    return clampCount(average(answers, (answer) => getAnswerMetric(answer, "fillerWordCount")));
  }

  if (key === "eyeContactScore") {
    return average(answers, (answer) => getAnswerMetric(answer, "confidenceScore"));
  }

  if (key === "speakingPaceScore") {
    return average(answers, (answer) => getAnswerMetric(answer, "speechScore"));
  }

  return average(answers, (answer) => getAnswerMetric(answer, key));
};

const buildMetricComparison = (latestSession, previousSession) =>
  COMPARISON_CONFIG.map((metric) => {
    const latest = getSessionMetric(latestSession, metric.key);
    const previous = getSessionMetric(previousSession, metric.key);
    const delta = latest - previous;
    const tone = deltaTone(delta);

    return {
      ...metric,
      latest,
      previous,
      value: latest,
      baseline: previous,
      delta,
      deltaLabel: formatSignedPercent(delta),
      direction: tone.direction,
    };
  });

const buildSkillSignals = (latestSession) => {
  if (!latestSession) return [];

  return [
    { key: "confidence", label: "Confidence", value: getSessionMetric(latestSession, "confidenceScore") },
    { key: "delivery", label: "Delivery", value: getSessionMetric(latestSession, "deliveryScore") },
    { key: "grammar", label: "Grammar", value: getSessionMetric(latestSession, "grammarScore") },
    { key: "structure", label: "Structure", value: getSessionMetric(latestSession, "structureScore") },
    { key: "relevance", label: "Relevance", value: getSessionMetric(latestSession, "relevanceScore") },
    { key: "eyeContact", label: "Eye Contact", value: getSessionMetric(latestSession, "eyeContactScore") },
    { key: "speakingPace", label: "Speaking Pace", value: getSessionMetric(latestSession, "speakingPaceScore") },
    { key: "fillerWords", label: "Filler Words", value: getSessionMetric(latestSession, "fillerScore") },
  ];
};

const buildStrengthsAndWeaknesses = (latestSession) => {
  const skillSignals = buildSkillSignals(latestSession);

  return {
    skillSignals,
    strengths: skillSignals
      .filter((signal) => signal.value >= STRONG_THRESHOLD)
      .sort((a, b) => b.value - a.value)
      .slice(0, 4),
    weaknesses: skillSignals
      .filter((signal) => signal.value < WEAK_THRESHOLD)
      .sort((a, b) => a.value - b.value)
      .slice(0, 4),
  };
};

const buildTopFillers = (answers) => {
  const fillerCounts = answers.reduce((acc, answer) => {
    (answer.fillerWords || []).forEach((word) => {
      const key = String(word || "").trim().toLowerCase();
      if (!key) return;
      acc[key] = (acc[key] || 0) + 1;
    });
    return acc;
  }, {});

  return Object.entries(fillerCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);
};

const buildAiSummary = ({ latestSession, previousSession, metricsComparison, weaknesses, topFillers }) => {
  if (!latestSession) {
    return {
      locked: true,
      bullets: ["Complete an interview to unlock progress insights."],
      recommendation: "Start with one complete interview so PrepAI has performance data to analyze.",
    };
  }

  if (!previousSession) {
    return {
      locked: true,
      bullets: ["Complete another interview to unlock progress insights."],
      recommendation: "Complete at least two interviews to compare trends and receive targeted recommendations.",
    };
  }

  const latestScore = getSessionMetric(latestSession, "overallScore");
  const previousScore = getSessionMetric(previousSession, "overallScore");
  const scoreDelta = latestScore - previousScore;
  const improvedMetrics = metricsComparison.filter((metric) => metric.delta > 0).sort((a, b) => b.delta - a.delta);
  const declinedMetrics = metricsComparison.filter((metric) => metric.delta < 0).sort((a, b) => a.delta - b.delta);
  const flatMetrics = metricsComparison.filter((metric) => metric.delta === 0);

  const bullets = [
    scoreDelta > 0
      ? `Overall score improved by ${Math.abs(scoreDelta)}%.`
      : scoreDelta < 0
        ? `Overall score declined by ${Math.abs(scoreDelta)}%.`
        : "Overall score stayed unchanged.",
  ];

  const biggestGain = improvedMetrics[0];
  const biggestDrop = declinedMetrics[0];
  const delivery = metricsComparison.find((metric) => metric.key === "deliveryScore");

  if (biggestGain) {
    bullets.push(
      Math.abs(biggestGain.delta) >= 6
        ? `${biggestGain.label} improved significantly.`
        : `${biggestGain.label} improved by ${Math.abs(biggestGain.delta)}%.`
    );
  }

  if (delivery && delivery.delta > 0 && biggestGain?.key !== delivery.key) {
    bullets.push("Delivery became more consistent.");
  }

  if (biggestDrop) {
    bullets.push(
      Math.abs(biggestDrop.delta) >= 6
        ? `${biggestDrop.label} decreased noticeably.`
        : `${biggestDrop.label} decreased slightly.`
    );
  }

  if (bullets.length === 1 && flatMetrics.length) {
    bullets.push("Core interview skills stayed steady between the last two sessions.");
  }

  const needs = new Set();
  if (weaknesses.some((item) => item.key === "grammar") || declinedMetrics.some((item) => item.key === "grammarScore")) {
    needs.add("practice grammar");
  }
  if (weaknesses.some((item) => item.key === "fillerWords") || topFillers.length > 0) {
    needs.add("reduce filler words");
  }
  if (weaknesses.some((item) => item.key === "speakingPace")) {
    needs.add("stabilize speaking pace");
  }
  if (weaknesses.some((item) => item.key === "structure")) {
    needs.add("tighten answer structure");
  }
  if (weaknesses.some((item) => item.key === "relevance")) {
    needs.add("answer more directly");
  }
  if (!needs.size && biggestDrop) {
    needs.add(`rebuild ${biggestDrop.label.toLowerCase()}`);
  }

  const recommendation = needs.size
    ? `${Array.from(needs).slice(0, 2).join(" and ")} before your next interview.`
    : "Repeat one higher-difficulty interview to keep pressure-testing your strongest skills.";

  return {
    locked: false,
    bullets: bullets.slice(0, 4),
    recommendation: `${recommendation.charAt(0).toUpperCase()}${recommendation.slice(1)}`,
  };
};

const buildTimelineSessions = (sessions) =>
  sessions.map((session, index) => ({
    ...session,
    timelineLabel: `Session ${sessions.length - index}`,
    displayDate: formatTimelineDate(session.createdAt),
    metrics: {
      overall: getSessionMetric(session, "overallScore"),
      confidence: getSessionMetric(session, "confidenceScore"),
      grammar: getSessionMetric(session, "grammarScore"),
      delivery: getSessionMetric(session, "deliveryScore"),
      structure: getSessionMetric(session, "structureScore"),
      relevance: getSessionMetric(session, "relevanceScore"),
      speech: getSessionMetric(session, "speechScore"),
      filler: getSessionMetric(session, "fillerScore"),
      fillersPerAnswer: getSessionMetric(session, "fillerWordCount"),
    },
  }));

const buildScoreTrend = (sessions, bestSession) => {
  const bestId = bestSession?.sessionId;

  return sortByDateAsc(sessions).map((session, index) => ({
    id: session.sessionId || String(index),
    name: `Session ${index + 1}`,
    shortName: `S${index + 1}`,
    date: formatSessionDate(session.createdAt),
    isBest: Boolean(bestId && session.sessionId === bestId),
    overall: getSessionMetric(session, "overallScore"),
    confidence: getSessionMetric(session, "confidenceScore"),
    delivery: getSessionMetric(session, "deliveryScore"),
    grammar: getSessionMetric(session, "grammarScore"),
    structure: getSessionMetric(session, "structureScore"),
    relevance: getSessionMetric(session, "relevanceScore"),
  }));
};

export const buildReportData = (interviews) => {
  const sessions = sortByDateDesc(interviews).filter((session) => session?.status !== "active");
  const answers = sessions.flatMap((session) =>
    (session.answers || []).map((answer) => ({
      ...answer,
      sessionId: session.sessionId,
      sessionDate: session.createdAt,
      sessionScore: getSessionMetric(session, "overallScore"),
    }))
  );

  const latestSession = sessions[0] || null;
  const previousSession = sessions[1] || null;
  const bestSession = [...sessions].sort((a, b) => getSessionMetric(b, "overallScore") - getSessionMetric(a, "overallScore"))[0] || null;
  const latestScore = latestSession ? getSessionMetric(latestSession, "overallScore") : 0;
  const previousScore = previousSession ? getSessionMetric(previousSession, "overallScore") : null;
  const bestScore = bestSession ? getSessionMetric(bestSession, "overallScore") : 0;
  const scoreDelta = previousScore === null ? null : latestScore - previousScore;
  const metricsComparison = previousSession ? buildMetricComparison(latestSession, previousSession) : [];
  const topFillers = buildTopFillers(answers);
  const { skillSignals, strengths, weaknesses } = buildStrengthsAndWeaknesses(latestSession);
  const scoreTrend = buildScoreTrend(sessions, bestSession);
  const bestTrend = scoreTrend.find((point) => point.isBest) || null;

  const improvement = {
    value: scoreDelta,
    label: scoreDelta === null ? "No previous session" : `${formatSignedPercent(scoreDelta)} from previous`,
    ...deltaTone(scoreDelta || 0),
  };

  const buildSummary = (session) =>
    session
      ? {
          session,
          score: getSessionMetric(session, "overallScore"),
          date: session.createdAt,
          metrics: buildTimelineSessions([session])[0].metrics,
        }
      : null;

  const aiSummary = buildAiSummary({
    latestSession,
    previousSession,
    metricsComparison,
    weaknesses,
    topFillers,
  });

  return {
    latest: buildSummary(latestSession),
    previous: buildSummary(previousSession),
    best: buildSummary(bestSession),
    totalSessions: sessions.length,
    improvement,
    metricsComparison,
    strengths,
    weaknesses,
    aiSummary,
    sessions: buildTimelineSessions(sessions),
    answers,
    latestSession,
    previousSession,
    bestSession,
    latestScore,
    previousScore,
    bestScore,
    overallAverage: average(sessions, (session) => getSessionMetric(session, "overallScore")),
    skillSignals,
    topFillers,
    scoreTrend,
    bestTrend,
  };
};
