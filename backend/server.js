const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();

connectDB();

const app = express();

//Reads the frontend URL from .env
const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(",").map((origin) => origin.trim())
  : true;

  //Enables communication between React and Express (React-> backend)
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth",       require("./routes/auth.routes"));
app.use("/api/sessions",   require("./routes/session.routes"));
app.use("/api/expression", require("./routes/expression.routes"));
app.use("/api/speech",     require("./routes/speech.routes"));

 
// app.use("/api/questions", require("./routes/questionGen.routes"));
app.use("/api/coach",     require("./routes/coach.routes"));

// app.use("/api/multimodal", require("./routes/multimodal.routes"));

app.use("/api/interview",  require("./routes/interview.routes"));
app.use("/api/admin",      require("./routes/admin.routes"));
app.get("/", (req, res) => {
  res.json({ message: "Facial Expression & Speech Correction API is running." });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: "Internal Server Error", error: err.message });
});

const PORT = process.env.PORT || 5001;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}`);
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`Port ${PORT} is already in use. The backend may already be running.`);
    console.error(`Use http://localhost:${PORT} or stop the existing process before starting another one.`);
    process.exit(1);
  }

  console.error("Server failed to start:", error);
  process.exit(1);
});

// To shut down the server safely when stop Node.js application
 //SIGINT: is a signal sent to your Node.js application when ctrl + c  entered
process.on("SIGINT", () => {
  console.log("Shutting down gracefully...");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
  setTimeout(() => {
    console.error("Forced shutdown after timeout");
    process.exit(1);
  }, 10000);
});
