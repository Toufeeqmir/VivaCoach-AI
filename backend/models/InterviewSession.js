const mongoose = require("mongoose");

const AnswerSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  questionType: {
    type: String,
    enum: ["primary", "follow_up", "adaptive"],
    default: "primary",
  },
  focusArea: {
    type: String,
    default: "",
  },
  category: {
    type: String,
    default: "general",
  },
  originalAnswer: {
    type: String,
    default: "",
  },
  correctedAnswer: {
    type: String,
    default: "",
  },
  fillerWords: {
    type: [String],
    default: [],
  },
  fillerWordCount: {
    type: Number,
    default: 0,
  },
  wordsPerMinute: {
    type: Number,
    default: 0,
  },
  dominantEmotion: {
    type: String,
    default: "neutral",
  },
  emotionLog: [
    {
      expression: String,
      confidence: Number,
      timestamp: { type: Date, default: Date.now },
    },
  ],
  emotionSummary: {
    angry:    { type: Number, default: 0 },
    disgust:  { type: Number, default: 0 },
    fear:     { type: Number, default: 0 },
    happy:    { type: Number, default: 0 },
    neutral:  { type: Number, default: 0 },
    sad:      { type: Number, default: 0 },
    surprise: { type: Number, default: 0 },
  },
  /**
   * AI-generated follow-up questions for deeper probing,
   * stored per answer so the UI can replay/continue later.
   */
  followUpQuestions: {
    type: [String],
    default: [],
  },
  confidenceScore: { type: Number, default: 0 },
  grammarScore:    { type: Number, default: 0 },
  relevanceScore:  { type: Number, default: 0 },
  structureScore:  { type: Number, default: 0 },
  deliveryScore:   { type: Number, default: 0 },
  speechScore:     { type: Number, default: 0 },
  fillerScore:     { type: Number, default: 0 },
  speechSentimentScore: { type: Number, default: 0 },
  multimodalScore: { type: Number, default: 0 },
  overallScore:    { type: Number, default: 0 },
  duration:        { type: Number, default: 0 },
  feedback:        { type: String, default: "" },
  recommendedFocus: { type: String, default: "" },
  adaptiveQuestions: {
    type: [
      {
        question: { type: String, required: true },
        focus: { type: String, default: "" },
        type: { type: String, default: "adaptive" },
      },
    ],
    default: [],
  },
});

const InterviewSessionSchema = new mongoose.Schema(
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
    status: {
      type: String,
      enum: ["active", "completed"],
      default: "active",
    },
    answers: [AnswerSchema],
    totalScore:       { type: Number, default: 0 },
    totalDuration:    { type: Number, default: 0 },
    overallFeedback:  { type: String, default: "" },
    startTime:        { type: Date, default: Date.now },
    endTime:          { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("InterviewSession", InterviewSessionSchema);
