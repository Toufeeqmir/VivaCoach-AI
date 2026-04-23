export const emotionColors = {
  happy: "#fbbf24",
  neutral: "#94a3b8",
  sad: "#60a5fa",
  angry: "#f87171",
  fear: "#c084fc",
  disgust: "#34d399",
  surprise: "#fb923c",
};

export const emotionEmoji = {
  happy: "😊",
  neutral: "😐",
  sad: "😢",
  angry: "😠",
  fear: "😨",
  disgust: "🤢",
  surprise: "😲",
};

export const createEmotionSummary = () => ({
  happy: 0,
  neutral: 0,
  sad: 0,
  angry: 0,
  fear: 0,
  disgust: 0,
  surprise: 0,
});

export const formatTime = (seconds) =>
  `${Math.floor(seconds / 60).toString().padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`;
