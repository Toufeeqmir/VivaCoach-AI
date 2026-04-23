import { useEffect, useRef, useState } from "react";
import API from "../../api";
import { formatTime, scoreColor, scoreBorder } from "../helpers";
import { COACH_TOPICS, createEmotionSummary } from "./constants";
import { useCoachCamera } from "./useCoachCamera";
import { useCoachSpeech } from "./useCoachSpeech";

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
  const [emotionSummary, setEmotionSummary] = useState(createEmotionSummary);
  const [currentEmotion, setCurrentEmotion] = useState(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [emotionLog, setEmotionLog] = useState([]);

  const chatEndRef = useRef(null);
  const timerRef = useRef(null);
  const emotionIntervalRef = useRef(null);

  const { videoRef, canvasRef, startCamera, stopCamera, analyzeFrame } = useCoachCamera({
    step,
    setCameraReady,
    setCurrentEmotion,
    setEmotionSummary,
    setEmotionLog,
  });

  const { speak, startListening, stopListening } = useCoachSpeech({
    setInput,
    setIsListening,
    setIsSpeaking,
  });

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      clearInterval(emotionIntervalRef.current);
    };
  }, []);

  const resetEmotionState = () => {
    setEmotionSummary(createEmotionSummary());
    setCurrentEmotion(null);
    setEmotionLog([]);
  };

  const startSession = async () => {
    setLoading(true);

    try {
      const res = await API.post("/coach/start", { topic });
      const opening = res.data.openingQuestion;

      setMessages([{ role: "coach", content: opening }]);
      setStep("chat");
      resetEmotionState();
      await startCamera();

      timerRef.current = setInterval(() => {
        setSessionDuration((prev) => prev + 1);
      }, 1000);

      clearInterval(emotionIntervalRef.current);
      emotionIntervalRef.current = setInterval(analyzeFrame, 2500);

      setTimeout(() => speak(opening), 300);
    } catch (error) {
      console.error(error);
      alert("Failed to start. Check your server.");
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setInput("");
    setLoading(true);

    try {
      const history = messages.map((message) => ({
        role: message.role === "coach" ? "assistant" : "user",
        content: message.content,
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
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        {
          role: "coach",
          content: "Sorry, I could not process that. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const endSession = async () => {
    clearInterval(timerRef.current);
    clearInterval(emotionIntervalRef.current);
    stopCamera();
    window.speechSynthesis?.cancel();

    setLoading(true);

    try {
      const userMessages = messages
        .filter((message) => message.role === "user")
        .map((message) => ({
          role: "user",
          content: message.content,
        }));

      const res = await API.post("/coach/summary", {
        messages: userMessages,
        emotionSummary,
        emotionLog,
      });

      setSummary(res.data);
      setStep("summary");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

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

    topics: COACH_TOPICS,
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
