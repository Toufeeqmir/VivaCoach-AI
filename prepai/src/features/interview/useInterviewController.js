import { useCallback, useEffect, useRef, useState } from "react";

import API from "../../api";
import { normalizeQuestions, insertQuestionsAfter } from "./utils";
import { speakText, startSpeechRecognition } from "./speech";

export function useInterviewController({ initialMode } = {}) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const intervalRef = useRef(null);
  const recognitionRef = useRef(null);
  const timerRef = useRef(null);
  const streamRef = useRef(null);
  const followUpsInsertedAtRef = useRef(new Set());
  const liveTimerRef = useRef(null);

  const [mode, setMode] = useState(initialMode === "live" ? "live" : "practice"); // "practice" | "live"
  const [liveQuestionSeconds, setLiveQuestionSeconds] = useState(60);
  const [liveRemaining, setLiveRemaining] = useState(liveQuestionSeconds);

  const [step, setStep] = useState("setup");
  const [loading, setLoading] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [cameraReady, setCameraReady] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [sessionId, setSessionId] = useState(null);
  const [targetRole, setTargetRole] = useState("");
  const [category, setCategory] = useState("general");
  const [difficulty, setDifficulty] = useState("medium");

  const [answer, setAnswer] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [emotionSummary, setEmotionSummary] = useState({
    happy: 0, neutral: 0, sad: 0, angry: 0, fear: 0, disgust: 0, surprise: 0,
  });
  const [currentEmotion, setCurrentEmotion] = useState(null);
  const [answerResult, setAnswerResult] = useState(null);
  const [finalResult, setFinalResult] = useState(null);

  // Start camera on mount, stop on unmount
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
      clearInterval(intervalRef.current);
      clearInterval(timerRef.current);
      clearInterval(liveTimerRef.current);
      window.speechSynthesis?.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (videoRef.current && streamRef.current && videoRef.current.srcObject !== streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [step]);

  useEffect(() => {
    setLiveRemaining(liveQuestionSeconds);
  }, [liveQuestionSeconds]);

  const speak = useCallback(
    (text) => {
      if (!voiceEnabled || !text) return;
      speakText(text, { lang: "en-US", rate: 0.95, pitch: 1.05 });
    },
    [voiceEnabled],
  );

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraReady(true);
      }
    } catch (err) {
      console.error("Camera error:", err);
    }
  };

  const stopCamera = () => {
    const s = streamRef.current || videoRef.current?.srcObject;
    s?.getTracks?.().forEach((t) => t.stop());
    streamRef.current = null;
  };

  const analyzeFrame = useCallback(async (sid) => {
    try {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      if (!canvas || !video || !video.videoWidth) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext("2d").drawImage(video, 0, 0);
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.8));

      const fd = new FormData();
      fd.append("image", blob, "frame.jpg");
      fd.append("sessionId", sid);
      const res = await API.post("/expression/analyze", fd);
      const { expression, face_detected } = res.data;
      if (face_detected && expression) {
        setCurrentEmotion(expression);
        setEmotionSummary((prev) => ({ ...prev, [expression]: (prev[expression] || 0) + 1 }));
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const startLiveCountdown = useCallback(() => {
    clearInterval(liveTimerRef.current);
    setLiveRemaining(liveQuestionSeconds);
    liveTimerRef.current = setInterval(() => {
      setLiveRemaining((s) => Math.max(0, s - 1));
    }, 1000);
  }, [liveQuestionSeconds]);

  const startInterview = async () => {
    setLoading(true);
    try {
      const roleParam = targetRole ? `&role=${encodeURIComponent(targetRole)}` : "";
      const [qRes, sRes] = await Promise.all([
        API.get(`/interview/questions?category=${category}&difficulty=${difficulty}${roleParam}`),
        API.post("/interview/start"),
      ]);
      const normalized = normalizeQuestions(qRes?.data?.questions ?? []);

      setQuestions(normalized);
      const sid = sRes?.data?.session?.sessionId;
      setSessionId(sid);
      setCurrentIdx(0);
      setAnswer("");
      setAnswerResult(null);
      setFinalResult(null);
      setElapsed(0);

      setStep(mode === "live" ? "live" : "question");
      intervalRef.current = setInterval(() => analyzeFrame(sid), 2000);
      timerRef.current = setInterval(() => setElapsed((p) => p + 1), 1000);
      if (mode === "live") startLiveCountdown();

      speak(normalized?.[0]?.question);
    } catch (err) {
      console.error(err);
      alert("Backend Error!");
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async () => {
    setLoading(true);
    const dominant = Object.keys(emotionSummary).reduce((a, b) => (emotionSummary[a] > emotionSummary[b] ? a : b));
    try {
      const res = await API.post("/interview/answer", {
        sessionId,
        question: questions[currentIdx]?.question,
        originalAnswer: answer,
        duration: elapsed,
        emotionSummary,
        dominantEmotion: dominant,
      });
      setAnswerResult(res.data.result);
      followUpsInsertedAtRef.current.delete(currentIdx);
      setStep("result");
      clearInterval(intervalRef.current);
      clearInterval(timerRef.current);
      clearInterval(liveTimerRef.current);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const nextQuestion = () => {
    const next = currentIdx + 1;
    if (next >= questions.length) {
      setLoading(true);
      API.put(`/interview/${sessionId}/end`).then((res) => {
        setFinalResult(res.data.result);
        setStep("final");
        setLoading(false);
      });
      return;
    }

    setCurrentIdx(next);
    setAnswer("");
    setAnswerResult(null);
    setElapsed(0);
    setStep(mode === "live" ? "live" : "question");
    intervalRef.current = setInterval(() => analyzeFrame(sessionId), 2000);
    timerRef.current = setInterval(() => setElapsed((p) => p + 1), 1000);
    if (mode === "live") startLiveCountdown();
    speak(questions?.[next]?.question);
  };

  // Live mode: auto-submit when timer hits 0
  useEffect(() => {
    if (mode !== "live") return;
    if (step !== "live") return;
    if (loading) return;
    if (liveRemaining !== 0) return;
    submitAnswer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liveRemaining, mode, step]);

  const startSpeech = () => {
    recognitionRef.current = startSpeechRecognition((t) => setAnswer(t));
    setIsListening(true);
  };

  const stopSpeech = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  const replayQuestion = () => speak(questions?.[currentIdx]?.question);

  const acceptFollowUps = () => {
    if (followUpsInsertedAtRef.current.has(currentIdx)) return;
    const followUps = answerResult?.followUpQuestions || [];
    const normalized = normalizeQuestions(followUps);
    if (!normalized.length) return;
    setQuestions((prev) => insertQuestionsAfter(prev, currentIdx, normalized));
    followUpsInsertedAtRef.current.add(currentIdx);
  };

  const endInterviewNow = async () => {
    try {
      setLoading(true);
      clearInterval(intervalRef.current);
      clearInterval(timerRef.current);
      clearInterval(liveTimerRef.current);
      stopSpeech();
      window.speechSynthesis?.cancel();
      const res = await API.put(`/interview/${sessionId}/end`);
      setFinalResult(res.data.result);
      setStep("final");
    } catch (err) {
      console.error(err);
      alert("Could not end interview. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
      startInterview,
      submitAnswer,
      nextQuestion,
      startSpeech,
      stopSpeech,
      setVoiceEnabled,
      replayQuestion,
      acceptFollowUps,
      endInterviewNow,
    },
    refs: { videoRef, canvasRef },
  };
}

