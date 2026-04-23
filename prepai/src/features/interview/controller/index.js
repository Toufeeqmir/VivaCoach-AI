import { useCallback, useEffect, useRef, useState } from "react";
import { speakText } from "../speech";
import { createEmotionSummary } from "./helpers";
import { createInterviewActions } from "./actions";
import { useInterviewMedia } from "./useInterviewMedia";

export function useInterviewController({ initialMode } = {}) {
  const followUpsInsertedAtRef = useRef(new Set());

  const [mode, setMode] = useState(initialMode === "live" ? "live" : "practice");
  const [liveQuestionSeconds, setLiveQuestionSeconds] = useState(60);
  const [liveRemaining, setLiveRemaining] = useState(liveQuestionSeconds);
  const [step, setStep] = useState("setup");
  const [loading, setLoading] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [sessionId, setSessionId] = useState(null);
  const [targetRole, setTargetRole] = useState("");
  const [category, setCategory] = useState("general");
  const [difficulty, setDifficulty] = useState("medium");
  const [answer, setAnswer] = useState("");
  const [emotionSummary, setEmotionSummary] = useState(createEmotionSummary);
  const [currentEmotion, setCurrentEmotion] = useState(null);
  const [answerResult, setAnswerResult] = useState(null);
  const [finalResult, setFinalResult] = useState(null);

  const {
    cameraReady,
    isListening,
    refs,
    startCamera,
    stopCamera,
    ensureVideoBound,
    analyzeFrame,
    startSpeech,
    stopSpeech,
  } = useInterviewMedia({
    onEmotionDetected: (expression) => {
      setCurrentEmotion(expression);
      setEmotionSummary((prev) => ({ ...prev, [expression]: (prev[expression] || 0) + 1 }));
    },
  });

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  useEffect(() => {
    ensureVideoBound();
  }, [ensureVideoBound, step]);

  useEffect(() => {
    setLiveRemaining(liveQuestionSeconds);
  }, [liveQuestionSeconds]);

  const speak = useCallback((text) => {
    if (!voiceEnabled || !text) return;
    speakText(text, { lang: "en-US", rate: 0.95, pitch: 1.05 });
  }, [voiceEnabled]);

  const { startInterview, submitAnswer, nextQuestion, acceptFollowUps, endInterviewNow } = createInterviewActions({
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
  });

  useEffect(() => {
    if (mode !== "live" || step !== "live" || loading || liveRemaining !== 0) return;
    submitAnswer();
  }, [liveRemaining, mode, step, loading, submitAnswer]);

  const replayQuestion = () => speak(questions?.[currentIdx]?.question);

  return {
    state: {
      mode,
      liveQuestionSeconds,
      liveRemaining,
      step,
      loading,
      elapsed,
      questions,
      currentIdx,
      currentQuestion: questions[currentIdx] || null,
      targetRole,
      category,
      difficulty,
      answer,
      isListening,
      emotionSummary,
      currentEmotion,
      answerResult,
      finalResult,
      cameraReady,
      voiceEnabled,
    },
    actions: {
      setMode,
      setLiveQuestionSeconds,
      setTargetRole,
      setCategory,
      setDifficulty,
      setAnswer,
      startInterview: () => startInterview(liveQuestionSeconds),
      submitAnswer,
      nextQuestion: () => nextQuestion(liveQuestionSeconds),
      startSpeech: () => startSpeech(setAnswer),
      stopSpeech,
      setVoiceEnabled,
      replayQuestion,
      acceptFollowUps,
      endInterviewNow,
    },
    refs: {
      videoRef: refs.videoRef,
      canvasRef: refs.canvasRef,
    },
  };
}
