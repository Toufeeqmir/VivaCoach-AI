import API from "../../../api";
import { buildAdaptiveQueue, createEmotionSummary, insertAdaptiveQuestions } from "./helpers";
import { normalizeQuestions } from "../utils";

export const createInterviewActions = ({
  mode,
  sessionId,
  targetRole,
  category,
  difficulty,
  answer,
  elapsed,
  currentIdx,
  questions,
  answerResult,
  emotionSummary,
  followUpsInsertedAtRef,
  refs,
  setLoading,
  setQuestions,
  setSessionId,
  setCurrentIdx,
  setAnswer,
  setAnswerResult,
  setElapsed,
  setEmotionSummary,
  setCurrentEmotion,
  setFinalResult,
  setStep,
  setLiveRemaining,
  analyzeFrame,
  speak,
  stopSpeech,
}) => {
  const resetAnswerState = () => {
    setAnswer("");
    setAnswerResult(null);
    setElapsed(0);
    setEmotionSummary(createEmotionSummary());
    setCurrentEmotion(null);
  };

  const clearQuestionTimers = () => {
    clearInterval(refs.intervalRef.current);
    clearInterval(refs.timerRef.current);
    clearInterval(refs.liveTimerRef.current);
  };

  const beginQuestionTimers = (sid, liveQuestionSeconds) => {
    refs.intervalRef.current = setInterval(() => analyzeFrame(sid), 2000);
    refs.timerRef.current = setInterval(() => setElapsed((prev) => prev + 1), 1000);
    if (mode === "live") {
      clearInterval(refs.liveTimerRef.current);
      setLiveRemaining(liveQuestionSeconds);
      refs.liveTimerRef.current = setInterval(() => {
        setLiveRemaining((seconds) => Math.max(0, seconds - 1));
      }, 1000);
    }
  };

  const startInterview = async (liveQuestionSeconds) => {
    setLoading(true);
    try {
      const roleParam = targetRole ? `&role=${encodeURIComponent(targetRole)}` : "";
      const [qRes, sRes] = await Promise.all([
        API.get(`/interview/questions?category=${category}&difficulty=${difficulty}${roleParam}`),
        API.post("/interview/start"),
      ]);
      const normalized = normalizeQuestions(qRes?.data?.questions ?? []);
      const sid = sRes?.data?.session?.sessionId;

      setQuestions(normalized);
      setSessionId(sid);
      setCurrentIdx(0);
      resetAnswerState();
      setFinalResult(null);
      setStep(mode === "live" ? "live" : "question");
      beginQuestionTimers(sid, liveQuestionSeconds);
      speak(normalized?.[0]?.question);
    } catch (error) {
      console.error(error);
      alert("Backend Error!");
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async () => {
    setLoading(true);
    const dominant = Object.keys(emotionSummary).reduce((a, b) => (emotionSummary[a] > emotionSummary[b] ? a : b));
    const currentQuestion = questions[currentIdx] || {};

    try {
      const res = await API.post("/interview/answer", {
        sessionId,
        question: currentQuestion?.question,
        originalAnswer: answer,
        duration: elapsed,
        emotionSummary,
        dominantEmotion: dominant,
        questionType: currentQuestion?.questionType || "primary",
        focusArea: currentQuestion?.focusArea || "",
        category,
        difficulty,
        role: targetRole,
      });

      setAnswerResult(res.data.result);
      followUpsInsertedAtRef.current.delete(currentIdx);
      setStep("result");
      clearQuestionTimers();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const nextQuestion = (liveQuestionSeconds) => {
    let workingQuestions = questions;
    if (!followUpsInsertedAtRef.current.has(currentIdx)) {
      const adaptiveQueue = buildAdaptiveQueue(answerResult);
      if (adaptiveQueue.length) {
        workingQuestions = insertAdaptiveQuestions(questions, currentIdx, answerResult);
        setQuestions(workingQuestions);
        followUpsInsertedAtRef.current.add(currentIdx);
      }
    }

    const next = currentIdx + 1;
    if (next >= workingQuestions.length) {
      setLoading(true);
      API.put(`/interview/${sessionId}/end`).then((res) => {
        setFinalResult(res.data.result);
        setStep("final");
        setLoading(false);
      });
      return;
    }

    setCurrentIdx(next);
    resetAnswerState();
    setStep(mode === "live" ? "live" : "question");
    beginQuestionTimers(sessionId, liveQuestionSeconds);
    speak(workingQuestions?.[next]?.question);
  };

  const acceptFollowUps = () => {
    if (followUpsInsertedAtRef.current.has(currentIdx)) return;
    const queued = buildAdaptiveQueue(answerResult);
    if (!queued.length) return;
    setQuestions((prev) => insertAdaptiveQuestions(prev, currentIdx, answerResult));
    followUpsInsertedAtRef.current.add(currentIdx);
  };

  const endInterviewNow = async () => {
    try {
      setLoading(true);
      clearQuestionTimers();
      stopSpeech();
      window.speechSynthesis?.cancel();
      const res = await API.put(`/interview/${sessionId}/end`);
      setFinalResult(res.data.result);
      setStep("final");
    } catch (error) {
      console.error(error);
      alert("Could not end interview. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return {
    startInterview,
    submitAnswer,
    nextQuestion,
    acceptFollowUps,
    endInterviewNow,
  };
};
