import { useEffect, useRef } from "react";

export const useCoachSpeech = ({ setInput, setIsListening, setIsSpeaking }) => {
  const recognitionRef = useRef(null);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop?.();
      window.speechSynthesis?.cancel();
    };
  }, []);

  const speak = (text) => {
    window.speechSynthesis?.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.9;
    utterance.pitch = 1;

    setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis?.speak(utterance);
  };

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Use Chrome or Edge for voice input.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event) => setInput(event.results[0][0].transcript);
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  const stopListening = () => {
    recognitionRef.current?.stop?.();
    setIsListening(false);
  };

  return {
    speak,
    startListening,
    stopListening,
  };
};
