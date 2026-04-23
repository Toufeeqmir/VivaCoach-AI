import { useCallback, useEffect, useRef, useState } from "react";
import API from "../../api";
import { createEmotionSummary } from "./constants";

export const useSessionAnalysis = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const intervalRef = useRef(null);
  const timerRef = useRef(null);

  const [sessionId, setSessionId] = useState(null);
  const [status, setStatus] = useState("idle");
  const [currentEmotion, setCurrentEmotion] = useState(null);
  const [confidence, setConfidence] = useState(0);
  const [emotionLog, setEmotionLog] = useState([]);
  const [emotionSummary, setEmotionSummary] = useState(createEmotionSummary);
  const [elapsed, setElapsed] = useState(0);
  const [result, setResult] = useState(null);

  useEffect(() => {
    startCamera();

    return () => {
      stopCamera();
      clearInterval(intervalRef.current);
      clearInterval(timerRef.current);
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Camera error:", error);
    }
  };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject;
    stream?.getTracks().forEach((track) => track.stop());
  };

  const captureFrame = useCallback(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return null;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);

    return new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.8));
  }, []);

  const analyzeFrame = useCallback(async (sid) => {
    try {
      const blob = await captureFrame();
      if (!blob) return;

      const formData = new FormData();
      formData.append("image", blob, "frame.jpg");
      if (sid) formData.append("sessionId", sid);

      const res = await API.post("/expression/analyze", formData);
      const { expression, confidence: conf, face_detected: faceDetected } = res.data;

      if (faceDetected && expression) {
        setCurrentEmotion(expression);
        setConfidence(Math.round(conf));
        setEmotionLog((prev) => [
          ...prev.slice(-19),
          { expression, confidence: conf, time: new Date().toLocaleTimeString() },
        ]);
        setEmotionSummary((prev) => ({ ...prev, [expression]: (prev[expression] || 0) + 1 }));
      }
    } catch (error) {
      console.error("Analyze error:", error);
    }
  }, [captureFrame]);

  const resetSession = () => {
    setStatus("idle");
    setSessionId(null);
    setCurrentEmotion(null);
    setConfidence(0);
    setEmotionLog([]);
    setEmotionSummary(createEmotionSummary());
    setElapsed(0);
    setResult(null);
  };

  const startSession = async () => {
    try {
      const res = await API.post("/sessions/start");
      const sid = res.data.session.sessionId;
      setSessionId(sid);
      setStatus("active");
      setEmotionLog([]);
      setEmotionSummary(createEmotionSummary());
      setElapsed(0);
      setResult(null);
      intervalRef.current = setInterval(() => analyzeFrame(sid), 2000);
      timerRef.current = setInterval(() => setElapsed((prev) => prev + 1), 1000);
    } catch (error) {
      console.error("Start session error:", error);
    }
  };

  const endSession = async () => {
    clearInterval(intervalRef.current);
    clearInterval(timerRef.current);
    setStatus("ending");

    try {
      const res = await API.put(`/sessions/${sessionId}/end`);
      setResult(res.data.session);
      setStatus("done");
    } catch (error) {
      console.error("End session error:", error);
      setStatus("idle");
    }
  };

  return {
    state: {
      sessionId,
      status,
      currentEmotion,
      confidence,
      emotionLog,
      emotionSummary,
      elapsed,
      result,
    },
    actions: {
      startSession,
      endSession,
      resetSession,
    },
    refs: {
      videoRef,
      canvasRef,
    },
  };
};
