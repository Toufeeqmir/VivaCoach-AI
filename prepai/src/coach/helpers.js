// helpers.js

export const formatTime = (s) =>
  `${Math.floor(s / 60)
    .toString()
    .padStart(2, "0")}:${(s % 60)
    .toString()
    .padStart(2, "0")}`;

export const scoreColor = (s) =>
  s >= 70 ? "text-emerald-400" : s >= 50 ? "text-yellow-400" : "text-red-400";

export const scoreBorder = (s) =>
  s >= 70
    ? "border-emerald-500/30"
    : s >= 50
    ? "border-yellow-500/30"
    : "border-red-500/30";