import { useState, useRef, useEffect } from "react";
import API from "../api";
import { formatTime, scoreColor, scoreBorder } from "./helpers";

export const useCoachLogic = () => {
  const [step, setStep] = useState("setup");
  const [topic, setTopic] = useState("general interview");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [emotionSummary, setEmotionSummary] = useState({
    happy: 0, neutral: 0, sad: 0, angry: 0, fear: 0, disgust: 0, surprise: 0,
  });
  const [currentEmotion, setCurrentEmotion] = useState(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [emotionLog, setEmotionLog] = useState([]);

  const recognitionRef = useRef(null);
  const chatEndRef = useRef(null);
  const timerRef = useRef(null);
  const emotionIntervalRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const bindRetryRef = useRef(null);

  // 🔄 Auto scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    // Fix: if camera stream starts before chat video mounts, bind it when ready
    const tryBind = () => {
      if (!videoRef.current || !streamRef.current) return false;
      if (videoRef.current.srcObject !== streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
      }
      // Attempt play to ensure element renders first frame in some browsers
      videoRef.current.play?.().catch(() => {});
      setCameraReady(true);
      return true;
    };

    if (!tryBind() && step === "chat" && streamRef.current) {
      clearTimeout(bindRetryRef.current);
      bindRetryRef.current = setTimeout(tryBind, 200);
    }
  }, [step]);

  // 🧹 Cleanup
  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      clearInterval(emotionIntervalRef.current);
      clearTimeout(bindRetryRef.current);
      const s = streamRef.current || videoRef.current?.srcObject;
      s?.getTracks?.().forEach((t) => t.stop());
      window.speechSynthesis?.cancel();
    };
  }, []);

  const startCamera = async () => {
    try {
      // Reuse existing stream if already open
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
        // If chat UI hasn't mounted yet, retry shortly.
        clearTimeout(bindRetryRef.current);
        bindRetryRef.current = setTimeout(() => {
          if (videoRef.current && streamRef.current) {
            videoRef.current.srcObject = streamRef.current;
            videoRef.current.play?.().catch(() => {});
            setCameraReady(true);
          }
        }, 200);
      }
    } catch (err) {
      console.error("Coach camera error:", err);
    }
  };

  const stopCamera = () => {
    clearTimeout(bindRetryRef.current);
    const s = streamRef.current || videoRef.current?.srcObject;
    s?.getTracks?.().forEach((t) => t.stop());
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

      const fd = new FormData();
      fd.append("image", blob, "coach-frame.jpg");
      const res = await API.post("/expression/analyze", fd);
      const { expression, face_detected } = res.data || {};
      if (face_detected && expression) {
        setCurrentEmotion(expression);
        setEmotionSummary((prev) => ({ ...prev, [expression]: (prev[expression] || 0) + 1 }));
        setEmotionLog((prev) => [...prev, { emotion: expression, ts: Date.now() }].slice(-300));
      }
    } catch (err) {
      console.error("Coach expression error:", err?.response?.data || err.message);
    }
  };

  // 🔊 Text to speech
  const speak = (text) => {
    window.speechSynthesis?.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US";
    u.rate = 0.9;
    u.pitch = 1;

    setIsSpeaking(true);
    u.onend = () => setIsSpeaking(false);

    window.speechSynthesis?.speak(u);
  };

  // 🎤 Start voice input
  const startListening = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SR) {
      alert("Use Chrome or Edge for voice input.");
      return;
    }

    const r = new SR();
    r.continuous = false;
    r.interimResults = false;
    r.lang = "en-US";

    r.onresult = (e) => setInput(e.results[0][0].transcript);
    r.onerror = () => setIsListening(false);
    r.onend = () => setIsListening(false);

    recognitionRef.current = r;
    r.start();
    setIsListening(true);
  };

  // 🛑 Stop voice input
  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  // 🚀 Start session
  const startSession = async () => {
    setLoading(true);

    try {
      const res = await API.post("/coach/start", { topic });
      const opening = res.data.openingQuestion;

      setMessages([{ role: "coach", content: opening }]);
      setStep("chat");
      setEmotionSummary({
        happy: 0, neutral: 0, sad: 0, angry: 0, fear: 0, disgust: 0, surprise: 0,
      });
      setCurrentEmotion(null);
      setEmotionLog([]);
      await startCamera();

      timerRef.current = setInterval(() => {
        setSessionDuration((p) => p + 1);
      }, 1000);
      clearInterval(emotionIntervalRef.current);
      emotionIntervalRef.current = setInterval(analyzeFrame, 2500);

      setTimeout(() => speak(opening), 300);
    } catch (err) {
      console.error(err);
      alert("Failed to start. Check your server.");
    } finally {
      setLoading(false);
    }
  };

  // 💬 Send message
  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input.trim();

    setMessages((prev) => [
      ...prev,
      { role: "user", content: userMsg },
    ]);

    setInput("");
    setLoading(true);

    try {
      const history = messages.map((m) => ({
        role: m.role === "coach" ? "assistant" : "user",
        content: m.content,
      }));

      const res = await API.post("/coach/message", {
        message: userMsg,
        history,
      });

      const { coachResponse, feedback } = res.data;

      setMessages((prev) => [
        ...prev,
        {
          role: "coach",
          content: coachResponse,
          feedback,
        },
      ]);

      speak(coachResponse);
    } catch (err) {
      console.error(err);

      setMessages((prev) => [
        ...prev,
        {
          role: "coach",
          content:
            "Sorry, I could not process that. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // 🏁 End session
  const endSession = async () => {
    clearInterval(timerRef.current);
    clearInterval(emotionIntervalRef.current);
    stopCamera();
    window.speechSynthesis?.cancel();

    setLoading(true);

    try {
      const userMessages = messages
        .filter((m) => m.role === "user")
        .map((m) => ({
          role: "user",
          content: m.content,
        }));

      const res = await API.post("/coach/summary", {
        messages: userMessages,
        emotionSummary,
        emotionLog,
      });

      setSummary(res.data);
      setStep("summary");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ⌨️ Handle Enter key
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // 🎯 Topics
  const topics = [
    { id: "general interview", label: "General Interview", icon: "🎯" },
    { id: "behavioral questions", label: "Behavioral", icon: "🧠" },
    { id: "technical interview", label: "Technical", icon: "💻" },
    { id: "leadership skills", label: "Leadership", icon: "👑" },
    { id: "communication skills", label: "Communication", icon: "💬" },
    { id: "grammar correction", label: "Grammar Fix", icon: "✏️" },
    { id: "confidence building", label: "Confidence", icon: "💪" },
    { id: "situational questions", label: "Situational", icon: "🎭" },
  ];

  return {
    step,
    topic,
    setTopic,
    messages,
    input,
    setInput,
    isListening,
    isSpeaking,
    loading,
    summary,
    sessionDuration,
    emotionSummary,
    currentEmotion,
    cameraReady,
    emotionLog,

    startSession,
    sendMessage,
    endSession,
    startListening,
    stopListening,
    handleKeyDown,

    topics,
    scoreColor,
    scoreBorder,
    formatTime,

    setStep,
    setMessages,
    setSummary,
    setSessionDuration,

    chatEndRef,
    videoRef,
    canvasRef,
  };
};