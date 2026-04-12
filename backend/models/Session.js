const mongoose = require("mongoose");

// Sub-schema for each expression entry within a session
const ExpressionEntrySchema = new mongoose.Schema({
  expression: {
    type: String,
    /**
     * Canonical expression labels used across the app (frontend + backend).
     * Keep these aligned with frontend keys (Interview, Report, Dashboard).
     */
    enum: ["happy", "sad", "angry", "neutral", "surprise", "fear", "disgust"],
    required: true,
  },
  confidence: {
    type: Number, // 0.0 - 1.0
    default: 0,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const SessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sessionId: {
      type: String,
      required: true,
      unique: true,
    },
    startTime: {
      type: Date,
      default: Date.now,
    },
    endTime: {
      type: Date,
    },
    duration: {
      type: Number, // in seconds
      default: 0,
    },
    expressionLog: [ExpressionEntrySchema],
    // Summary counts of expressions detected in this session
    expressionSummary: {
      happy: { type: Number, default: 0 },
      sad: { type: Number, default: 0 },
      angry: { type: Number, default: 0 },
      neutral: { type: Number, default: 0 },
      surprise: { type: Number, default: 0 },
      fear: { type: Number, default: 0 },
      disgust: { type: Number, default: 0 },
    },
    dominantExpression: {
      type: String,
      default: "neutral",
    },
    totalCorrections: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["active", "completed"],
      default: "active",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Session", SessionSchema);
