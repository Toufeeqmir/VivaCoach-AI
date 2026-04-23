export const SKILL_CONFIG = [
  { key: "overallScore", label: "Overall" },
  { key: "grammarScore", label: "Grammar" },
  { key: "relevanceScore", label: "Relevance" },
  { key: "structureScore", label: "Structure" },
  { key: "confidenceScore", label: "Confidence" },
  { key: "deliveryScore", label: "Delivery" },
];

export const COMPARISON_CONFIG = [
  { key: "overallScore", label: "Overall", betterDirection: "up" },
  { key: "confidenceScore", label: "Confidence", betterDirection: "up" },
  { key: "deliveryScore", label: "Delivery", betterDirection: "up" },
  { key: "structureScore", label: "Structure", betterDirection: "up" },
  { key: "relevanceScore", label: "Relevance", betterDirection: "up" },
  { key: "grammarScore", label: "Grammar", betterDirection: "up" },
  { key: "fillerWordCount", label: "Fillers / answer", betterDirection: "down", suffix: "" },
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

export const scoreTone = (score) => {
  if (score >= 75) return { color: "#34d399", badge: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" };
  if (score >= 55) return { color: "#fbbf24", badge: "bg-yellow-500/10 border-yellow-500/20 text-yellow-400" };
  return { color: "#f87171", badge: "bg-red-500/10 border-red-500/20 text-red-400" };
};

const average = (items, picker) => {
  if (!items.length) return 0;
  const total = items.reduce((sum, item) => sum + (picker(item) || 0), 0);
  return Math.round(total / items.length);
};

const clampMetric = (value) => {
  const safeValue = typeof value === "number" && Number.isFinite(value) ? value : 0;
  return Math.max(0, Math.round(safeValue));
};

export const getAnswerMetric = (answer, key) => {
  if (typeof answer?.[key] === "number" && Number.isFinite(answer[key])) {
    return answer[key];
  }

  if (key === "relevanceScore") return answer?.overallScore || answer?.multimodalScore || 0;
  if (key === "structureScore") return answer?.grammarScore || answer?.overallScore || 0;
  if (key === "deliveryScore") {
    const parts = [answer?.speechScore, answer?.fillerScore, answer?.confidenceScore].filter(
      (value) => typeof value === "number" && Number.isFinite(value)
    );
    return parts.length ? Math.round(parts.reduce((sum, value) => sum + value, 0) / parts.length) : 0;
  }

  return 0;
};

export const getSessionMetric = (session, key) => {
  const answers = session?.answers || [];

  if (key === "overallScore") {
    return clampMetric(session?.totalScore || average(answers, (answer) => getAnswerMetric(answer, "overallScore")));
  }

  if (key === "fillerWordCount") {
    return clampMetric(average(answers, (answer) => answer?.fillerWordCount || 0));
  }

  return clampMetric(average(answers, (answer) => getAnswerMetric(answer, key)));
};

const startOfWeek = (date) => {
  const next = new Date(date);
  const day = (next.getDay() + 6) % 7;
  next.setDate(next.getDate() - day);
  next.setHours(0, 0, 0, 0);
  return next;
};

export const formatDate = (value) =>
  new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

export const formatSessionDate = (value) =>
  new Date(value).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

const buildMetricComparison = (session, baselineSession) =>
  COMPARISON_CONFIG.map((metric) => {
    const value = getSessionMetric(session, metric.key);
    const baseline = getSessionMetric(baselineSession, metric.key);
    const delta = value - baseline;
    const improved = metric.betterDirection === "down" ? delta < 0 : delta > 0;
    const declined = metric.betterDirection === "down" ? delta > 0 : delta < 0;

    return {
      ...metric,
      value,
      baseline,
      delta,
      direction: improved ? "up" : declined ? "down" : "flat",
    };
  });

const buildComparisonSummary = (latestSession, previousSession, bestSession) => {
  const latestVsPrevious = previousSession ? buildMetricComparison(latestSession, previousSession) : [];
  const latestVsBest = bestSession ? buildMetricComparison(latestSession, bestSession) : [];

  const improved = latestVsPrevious.filter((item) => item.direction === "up");
  const declined = latestVsPrevious.filter((item) => item.direction === "down");
  const biggestGain = [...improved].sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))[0] || null;
  const biggestDrop = [...declined].sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))[0] || null;

  let narrative = "Complete one more interview to unlock session-to-session comparison.";
  if (previousSession) {
    if (biggestGain && biggestDrop) {
      narrative = `${biggestGain.label} improved by ${Math.abs(biggestGain.delta)} points, while ${biggestDrop.label.toLowerCase()} slipped by ${Math.abs(biggestDrop.delta)}.`;
    } else if (biggestGain) {
      narrative = `${biggestGain.label} improved by ${Math.abs(biggestGain.delta)} points compared with your previous session.`;
    } else if (biggestDrop) {
      narrative = `${biggestDrop.label} dropped by ${Math.abs(biggestDrop.delta)} points compared with your previous session.`;
    } else {
      narrative = "Your latest session stayed almost identical to the previous one across the main scoring metrics.";
    }
  }

  return {
    latestSession,
    previousSession,
    bestSession,
    latestVsPrevious,
    latestVsBest,
    biggestGain,
    biggestDrop,
    narrative,
  };
};

export const buildReportData = (interviews) => {
  const answers = interviews.flatMap((session) =>
    (session.answers || []).map((answer) => ({
      ...answer,
      sessionId: session.sessionId,
      sessionDate: session.createdAt,
      sessionScore: session.totalScore || 0,
    }))
  );

  const now = new Date();
  const thisWeekStart = startOfWeek(now);
  const lastWeekStart = new Date(thisWeekStart);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);

  const thisWeekSessions = interviews.filter((session) => new Date(session.createdAt) >= thisWeekStart);
  const lastWeekSessions = interviews.filter((session) => {
    const date = new Date(session.createdAt);
    return date >= lastWeekStart && date < thisWeekStart;
  });

  const overallAverage = average(interviews, (session) => session.totalScore || 0);
  const thisWeekAverage = average(thisWeekSessions, (session) => session.totalScore || 0);
  const lastWeekAverage = average(lastWeekSessions, (session) => session.totalScore || 0);
  const scoreDelta = thisWeekAverage - lastWeekAverage;

  const skillSummary = SKILL_CONFIG.map((metric) => ({
    ...metric,
    value: average(answers, (answer) => getAnswerMetric(answer, metric.key)),
  }));

  const strongestSkill = [...skillSummary].sort((a, b) => b.value - a.value)[0] || null;
  const weakestSkill = [...skillSummary].sort((a, b) => a.value - b.value)[0] || null;
  const latestSession = interviews[0] || null;
  const previousSession = interviews[1] || null;
  const bestSession = [...interviews].sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0))[0] || null;

  const fillerCounts = answers.reduce((acc, answer) => {
    (answer.fillerWords || []).forEach((word) => {
      const key = String(word || "").trim().toLowerCase();
      if (!key) return;
      acc[key] = (acc[key] || 0) + 1;
    });
    return acc;
  }, {});

  const topFillers = Object.entries(fillerCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  const focusCounts = answers.reduce((acc, answer) => {
    const focus = String(answer.recommendedFocus || "").trim();
    if (!focus) return acc;
    acc[focus] = (acc[focus] || 0) + 1;
    return acc;
  }, {});

  const topFocuses = Object.entries(focusCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const emotionTotals = answers.reduce((acc, answer) => {
    Object.keys(EMOTION_COLORS).forEach((emotion) => {
      acc[emotion] = (acc[emotion] || 0) + Number(answer.emotionSummary?.[emotion] || 0);
    });
    return acc;
  }, { happy: 0, neutral: 0, sad: 0, angry: 0, fear: 0, disgust: 0, surprise: 0 });

  const totalEmotionSignals = Object.values(emotionTotals).reduce((sum, value) => sum + value, 0);
  const dominantEmotion = Object.entries(emotionTotals).sort((a, b) => b[1] - a[1])[0] || null;

  const practiceRecommendations = [];
  if (weakestSkill) {
    if (weakestSkill.key === "relevanceScore") {
      practiceRecommendations.push({
        title: "Answer more directly",
        body: "Start with a one-line answer to the question, then support it with one example and one result.",
      });
    } else if (weakestSkill.key === "structureScore") {
      practiceRecommendations.push({
        title: "Use a tighter structure",
        body: "Practice answering with Situation, Action, and Result so your stories feel complete instead of scattered.",
      });
    } else if (weakestSkill.key === "deliveryScore") {
      practiceRecommendations.push({
        title: "Sharpen delivery",
        body: "Record shorter answers and aim for a calm pace, fewer fillers, and cleaner sentence endings.",
      });
    } else {
      practiceRecommendations.push({
        title: `Improve ${weakestSkill.label.toLowerCase()}`,
        body: `Your ${weakestSkill.label.toLowerCase()} is the lowest-scoring area right now, so it is the fastest place to gain points.`,
      });
    }
  }

  if (topFillers.length) {
    practiceRecommendations.push({
      title: "Reduce filler words",
      body: `Your most common fillers are ${topFillers.map(([word]) => `"${word}"`).join(", ")}. Pause silently before the next sentence instead of filling the gap.`,
    });
  }

  if (topFocuses.length) {
    practiceRecommendations.push({
      title: "Repeat your main drill",
      body: `The most common coaching focus has been "${topFocuses[0][0]}". Run one short mock round with that as your only goal.`,
    });
  }

  const comparisonSummary = latestSession
    ? buildComparisonSummary(latestSession, previousSession, bestSession)
    : {
        latestSession: null,
        previousSession: null,
        bestSession: null,
        latestVsPrevious: [],
        latestVsBest: [],
        biggestGain: null,
        biggestDrop: null,
        narrative: "Complete one interview to unlock session-to-session comparison.",
      };

  const scoreTrend = [...interviews]
    .reverse()
    .map((session, index) => ({
      name: `S${index + 1}`,
      date: formatSessionDate(session.createdAt),
      score: session.totalScore || 0,
      confidence: getSessionMetric(session, "confidenceScore"),
      delivery: getSessionMetric(session, "deliveryScore"),
      structure: getSessionMetric(session, "structureScore"),
    }));

  return {
    answers,
    overallAverage,
    thisWeekAverage,
    lastWeekAverage,
    scoreDelta,
    skillSummary,
    strongestSkill,
    weakestSkill,
    latestSession,
    previousSession,
    bestSession,
    topFillers,
    topFocuses,
    emotionTotals,
    totalEmotionSignals,
    dominantEmotion,
    shownRecommendations: practiceRecommendations.slice(0, 3),
    comparisonSummary,
    scoreTrend,
  };
};
