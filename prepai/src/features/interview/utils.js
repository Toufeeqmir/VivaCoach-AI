/**
 * prepai/src/features/interview/utils.js
 *
 * Purpose
 * - Small helper utilities for Interview feature to keep controller files light.
 */

/**
 * Normalize backend questions into a consistent shape.
 * Backend may return strings or objects; UI expects `{ question: string }`.
 * @param {any[]} raw
 * @returns {{question: string}[]}
 */
export function normalizeQuestions(raw) {
  const arr = Array.isArray(raw) ? raw : [];
  return arr
    .filter(Boolean)
    .map((q) => (typeof q === "string" ? { question: q } : q))
    .filter((q) => typeof q?.question === "string" && q.question.trim().length > 0)
    .map((q) => ({
      ...q,
      question: q.question.trim(),
      questionType: q.questionType || q.type || "primary",
      focusArea: q.focusArea || q.focus || "",
    }));
}

/**
 * Insert new questions directly after a given index.
 * @param {{question: string}[]} questions
 * @param {number} afterIndex
 * @param {{question: string}[]} toInsert
 * @returns {{question: string}[]}
 */
export function insertQuestionsAfter(questions, afterIndex, toInsert) {
  const base = Array.isArray(questions) ? questions : [];
  const insert = Array.isArray(toInsert) ? toInsert : [];
  const i = Math.max(-1, Math.min(afterIndex, base.length - 1));
  return [...base.slice(0, i + 1), ...insert, ...base.slice(i + 1)];
}

