import { insertQuestionsAfter, normalizeQuestions } from "../utils";

export const createEmotionSummary = () => ({
  happy: 0,
  neutral: 0,
  sad: 0,
  angry: 0,
  fear: 0,
  disgust: 0,
  surprise: 0,
});

export const buildAdaptiveQueue = (answerResult) => {
  const followUps = normalizeQuestions(answerResult?.followUpQuestions || []).map((item) => ({
    ...item,
    questionType: item.questionType || "follow_up",
    focusArea: item.focusArea || answerResult?.recommendedFocus || "go deeper",
  }));

  const adaptive = normalizeQuestions(answerResult?.adaptiveQuestions || []).map((item) => ({
    ...item,
    questionType: item.questionType || "adaptive",
    focusArea: item.focusArea || answerResult?.recommendedFocus || item.focus || "",
  }));

  return [...followUps, ...adaptive];
};

export const insertAdaptiveQuestions = (questions, currentIdx, answerResult) =>
  insertQuestionsAfter(questions, currentIdx, buildAdaptiveQueue(answerResult));
