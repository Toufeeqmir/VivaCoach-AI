const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const User = require("../models/User");
const InterviewSession = require("../models/InterviewSession");
const { protect, isAdmin } = require("../middleware/auth.middleware");

router.use(protect, isAdmin);

router.get("/users", async (req, res) => {
  try {
    const users = await User.find({})
      .select("name email")
      .sort({ createdAt: -1 })
      .lean();

    const sessionStats = await InterviewSession.aggregate([
      {
        $group: {
          _id: "$user",
          sessionCount: { $sum: 1 },
          lastSessionDate: { $max: "$createdAt" },
        },
      },
    ]);

    const statsByUser = sessionStats.reduce((acc, stat) => {
      acc[String(stat._id)] = stat;
      return acc;
    }, {});

    const formattedUsers = users.map((user) => {
      const stats = statsByUser[String(user._id)];
      return {
        id: user._id,
        name: user.name,
        email: user.email,
        sessionCount: stats?.sessionCount || 0,
        lastSessionDate: stats?.lastSessionDate || null,
      };
    });

    res.json({ success: true, users: formattedUsers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/interview/history/:userId", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
      return res.status(400).json({ success: false, message: "Invalid user id." });
    }

    const sessions = await InterviewSession.find({
      user: req.params.userId,
      status: "completed",
    }).sort({ createdAt: -1 });

    res.json({ success: true, sessions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
