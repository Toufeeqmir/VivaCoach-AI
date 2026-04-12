const Session = require("../../models/Session");
const {
  HF_TOKEN,
  inFlightByUser,
  disabledUntilByUser,
  resolveHfEndpoint,
  parseHfPredictions,
} = require("./hfConfig");

const analyzeExpression = async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image frame provided.",
      });
    }

    let expression = "neutral";
    let confidence = 0;
    let faceDetected = false;

    try {
      if (!HF_TOKEN) {
        return res.status(200).json({
          success: true,
          expression: "neutral",
          confidence: 0,
          face_detected: false,
          warning: "HF_TOKEN missing on server.",
        });
      }

      const userKey = String(req.user?._id || "anon");
      const disabledUntil = disabledUntilByUser.get(userKey) || 0;
      if (Date.now() < disabledUntil) {
        return res.status(200).json({
          success: true,
          expression: "neutral",
          confidence: 0,
          face_detected: false,
          warning:
            "HuggingFace inference is temporarily disabled due to authorization error. Check HF token permissions.",
        });
      }

      if (inFlightByUser.get(userKey)) {
        return res.status(200).json({
          success: true,
          expression: "neutral",
          confidence: 0,
          face_detected: false,
          warning: "Model busy. Skipping this frame.",
        });
      }

      inFlightByUser.set(userKey, true);

      const ac = new AbortController();
      const t = setTimeout(() => ac.abort(), 30000);

      let json;
      try {
        const endpoint = resolveHfEndpoint();
        const resp = await fetch(`${endpoint}?wait_for_model=true`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${HF_TOKEN}`,
            "Content-Type": req.file.mimetype || "application/octet-stream",
            Accept: "application/json",
          },
          body: req.file.buffer,
          signal: ac.signal,
        });

        if (!resp.ok) {
          const text = await resp.text().catch(() => "");
          if (resp.status === 401 || resp.status === 403) {
            disabledUntilByUser.set(userKey, Date.now() + 5 * 60 * 1000);
          }
          throw new Error(`HF inference failed: ${resp.status} ${resp.statusText} ${text}`.slice(0, 500));
        }

        json = await resp.json();
      } finally {
        clearTimeout(t);
        inFlightByUser.delete(userKey);
      }

      const parsed = parseHfPredictions(json);
      if (parsed) {
        expression = parsed.expression;
        confidence = parsed.confidence;
        faceDetected = true;
      }
    } catch (aiError) {
      console.error("HuggingFace error message :", aiError.message);
      console.error("HuggingFace error code    :", aiError.code);

      return res.status(200).json({
        success: true,
        expression: "neutral",
        confidence: 0,
        face_detected: false,
        warning: "Model temporarily unavailable.",
      });
    }

    if (sessionId && faceDetected) {
      const session = await Session.findOne({
        sessionId,
        user: req.user._id,
      });

      if (session && session.status === "active") {
        session.expressionLog.push({ expression, confidence });

        if (session.expressionSummary[expression] !== undefined) {
          session.expressionSummary[expression] += 1;
        }

        await session.save();
      }
    }

    res.status(200).json({
      success: true,
      expression,
      confidence: Math.round(confidence * 100),
      face_detected: faceDetected,
    });
  } catch (error) {
    console.error("Controller error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = { analyzeExpression };

