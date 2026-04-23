import { useEffect, useRef } from "react";
import API from "../../api";

export const useCoachCamera = ({
  step,
  setCameraReady,
  setCurrentEmotion,
  setEmotionSummary,
  setEmotionLog,
}) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const bindRetryRef = useRef(null);

  useEffect(() => {
    const tryBind = () => {
      if (!videoRef.current || !streamRef.current) return false;
      if (videoRef.current.srcObject !== streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
      }
      videoRef.current.play?.().catch(() => {});
      setCameraReady(true);
      return true;
    };

    if (!tryBind() && step === "chat" && streamRef.current) {
      clearTimeout(bindRetryRef.current);
      bindRetryRef.current = setTimeout(tryBind, 200);
    }
  }, [setCameraReady, step]);

  useEffect(() => {
    return () => {
      clearTimeout(bindRetryRef.current);
      const stream = streamRef.current || videoRef.current?.srcObject;
      stream?.getTracks?.().forEach((track) => track.stop());
    };
  }, []);

  const startCamera = async () => {
    try {
      if (streamRef.current) {
        if (videoRef.current && videoRef.current.srcObject !== streamRef.current) {
          videoRef.current.srcObject = streamRef.current;
          videoRef.current.play?.().catch(() => {});
        }
        setCameraReady(true);
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play?.().catch(() => {});
        setCameraReady(true);
      } else {
        clearTimeout(bindRetryRef.current);
        bindRetryRef.current = setTimeout(() => {
          if (videoRef.current && streamRef.current) {
            videoRef.current.srcObject = streamRef.current;
            videoRef.current.play?.().catch(() => {});
            setCameraReady(true);
          }
        }, 200);
      }
    } catch (error) {
      console.error("Coach camera error:", error);
    }
  };

  const stopCamera = () => {
    clearTimeout(bindRetryRef.current);
    const stream = streamRef.current || videoRef.current?.srcObject;
    stream?.getTracks?.().forEach((track) => track.stop());
    streamRef.current = null;
    setCameraReady(false);
  };

  const analyzeFrame = async () => {
    try {
      const canvas = canvasRef.current;
      const video = videoRef.current;

      if (step !== "chat" || !canvas || !video || !video.videoWidth) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext("2d").drawImage(video, 0, 0);
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.8));
      if (!blob) return;

      const formData = new FormData();
      formData.append("image", blob, "coach-frame.jpg");
      const res = await API.post("/expression/analyze", formData);
      const { expression, face_detected: faceDetected } = res.data || {};

      if (faceDetected && expression) {
        setCurrentEmotion(expression);
        setEmotionSummary((prev) => ({ ...prev, [expression]: (prev[expression] || 0) + 1 }));
        setEmotionLog((prev) => [...prev, { emotion: expression, ts: Date.now() }].slice(-300));
      }
    } catch (error) {
      console.error("Coach expression error:", error?.response?.data || error.message);
    }
  };

  return {
    videoRef,
    canvasRef,
    startCamera,
    stopCamera,
    analyzeFrame,
  };
};
