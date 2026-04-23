import { useCallback, useEffect, useRef, useState } from "react";
import API from "../../../api";
import { startSpeechRecognition } from "../speech";

export const useInterviewMedia = ({ onEmotionDetected }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const intervalRef = useRef(null);
  const recognitionRef = useRef(null);
  const timerRef = useRef(null);
  const streamRef = useRef(null);
  const liveTimerRef = useRef(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    return () => {
      const stream = streamRef.current || videoRef.current?.srcObject;
      stream?.getTracks?.().forEach((track) => track.stop());
      clearInterval(intervalRef.current);
      clearInterval(timerRef.current);
      clearInterval(liveTimerRef.current);
      recognitionRef.current?.stop?.();
      window.speechSynthesis?.cancel();
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraReady(true);
      }
    } catch (error) {
      console.error("Camera error:", error);
    }
  };

  const stopCamera = () => {
    const stream = streamRef.current || videoRef.current?.srcObject;
    stream?.getTracks?.().forEach((track) => track.stop());
    streamRef.current = null;
    setCameraReady(false);
  };

  const ensureVideoBound = useCallback(() => {
    if (videoRef.current && streamRef.current && videoRef.current.srcObject !== streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, []);

  const analyzeFrame = useCallback(async (sessionId) => {
    try {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      if (!canvas || !video || !video.videoWidth) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext("2d").drawImage(video, 0, 0);
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.8));

      const formData = new FormData();
      formData.append("image", blob, "frame.jpg");
      formData.append("sessionId", sessionId);
      const res = await API.post("/expression/analyze", formData);
      const { expression, face_detected: faceDetected } = res.data;

      if (faceDetected && expression) {
        onEmotionDetected(expression);
      }
    } catch (error) {
      console.error(error);
    }
  }, [onEmotionDetected]);

  const startSpeech = (setAnswer) => {
    recognitionRef.current = startSpeechRecognition((transcript) => setAnswer(transcript));
    setIsListening(true);
  };

  const stopSpeech = () => {
    recognitionRef.current?.stop?.();
    setIsListening(false);
  };

  return {
    cameraReady,
    isListening,
    setIsListening,
    refs: {
      videoRef,
      canvasRef,
      intervalRef,
      timerRef,
      liveTimerRef,
      streamRef,
    },
    startCamera,
    stopCamera,
    ensureVideoBound,
    analyzeFrame,
    startSpeech,
    stopSpeech,
  };
};
