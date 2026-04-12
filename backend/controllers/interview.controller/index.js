const { generateQuestions } = require("./questionHandlers");
const { submitAnswer } = require("./answerHandlers");
const { startInterview, endInterview, getInterviewResult, getInterviewHistory } = require("./sessionHandlers");

module.exports = {
  generateQuestions,
  startInterview,
  submitAnswer,
  endInterview,
  getInterviewResult,
  getInterviewHistory,
};

