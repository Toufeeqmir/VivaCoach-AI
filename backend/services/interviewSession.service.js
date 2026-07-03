const InterviewSession = require("../models/InterviewSession");

const COMPLETED_INTERVIEW_SESSION_FILTER = Object.freeze({
  status: "completed",
});

const buildCompletedInterviewSessionQuery = (userId) => ({
  user: userId,
  ...COMPLETED_INTERVIEW_SESSION_FILTER,
});

const findCompletedInterviewSessionsByUser = (userId) =>
  InterviewSession.find(buildCompletedInterviewSessionQuery(userId)).sort({ createdAt: -1 });

const aggregateCompletedInterviewSessionStatsByUser = () =>
  InterviewSession.aggregate([
    { $match: COMPLETED_INTERVIEW_SESSION_FILTER },
    {
      $group: {
        _id: "$user",
        sessionCount: { $sum: 1 },
        lastSessionDate: { $max: "$createdAt" },
      },
    },
  ]);

module.exports = {
  COMPLETED_INTERVIEW_SESSION_FILTER,
  buildCompletedInterviewSessionQuery,
  findCompletedInterviewSessionsByUser,
  aggregateCompletedInterviewSessionStatsByUser,
};
