/**
 * prepai/src/features/interview/speech.js
 *
 * Purpose
 * - Small helpers for browser speech features used in Interview mode:
 *   - Text-to-Speech (questions)
 *   - Speech-to-Text (answers)
 */

/**
 * Speak text via the Web Speech API (SpeechSynthesis).
 * @param {string} text
 * @param {{ rate?: number, pitch?: number, lang?: string }} [opts]
 */
export function speakText(text, opts = {}) {
  if (!text) return;
  try {
    window.speechSynthesis?.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = opts.lang || "en-US";
    u.rate = opts.rate ?? 0.95;
    u.pitch = opts.pitch ?? 1.05;
    window.speechSynthesis?.speak(u);
  } catch {
    // Some browsers block speech without user gesture; ignore.
  }
}

/**
 * Create and start a continuous speech recognition instance.
 * @param {(transcript: string) => void} onTranscript
 * @returns {SpeechRecognition}
 */
export function startSpeechRecognition(onTranscript) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.onresult = (e) => {
    let transcript = "";
    for (let i = 0; i < e.results.length; i++) transcript += e.results[i][0].transcript;
    onTranscript(transcript);
  };
  recognition.start();
  return recognition;
}

