// const Session = require("../../models/Session");
// const {
//   HF_TOKEN,
//   inFlightByUser,
//   disabledUntilByUser,
//   resolveHfEndpoint,
//   parseHfPredictions,
// } = require("./hfConfig");

// const analyzeExpression = async (req, res) => {
//   try {
//     const { sessionId } = req.body;

//     if (!req.file) {
//       return res.status(400).json({
//         success: false,
//         message: "No image frame provided.",
//       });
//     }

//     let expression = "neutral";
//     let confidence = 0;
//     let faceDetected = false;

//     try {
//       if (!HF_TOKEN) {
//         return res.status(200).json({
//           success: true,
//           expression: "neutral",
//           confidence: 0,
//           face_detected: false,
//           warning: "HF_TOKEN missing on server.",
//         });
//       }

//       const userKey = String(req.user?._id || "anon");
//       const disabledUntil = disabledUntilByUser.get(userKey) || 0;
//       if (Date.now() < disabledUntil) {
//         return res.status(200).json({
//           success: true,
//           expression: "neutral",
//           confidence: 0,
//           face_detected: false,
//           warning:
//             "HuggingFace inference is temporarily disabled due to authorization error. Check HF token permissions.",
//         });
//       }

//       if (inFlightByUser.get(userKey)) {
//         return res.status(200).json({
//           success: true,
//           expression: "neutral",
//           confidence: 0,
//           face_detected: false,
//           warning: "Model busy. Skipping this frame.",
//         });
//       }

//       inFlightByUser.set(userKey, true);

//       const ac = new AbortController();
//       const t = setTimeout(() => ac.abort(), 30000);

//       let json;
//       try {
//         const endpoint = resolveHfEndpoint();
//         const resp = await fetch(`${endpoint}?wait_for_model=true`, {
//           method: "POST",
//           headers: {
//             Authorization: `Bearer ${HF_TOKEN}`,
//             "Content-Type": req.file.mimetype || "application/octet-stream",
//             Accept: "application/json",
//           },
//           body: req.file.buffer,
//           signal: ac.signal,
//         });

//         if (!resp.ok) {
//           const text = await resp.text().catch(() => "");
//           if (resp.status === 401 || resp.status === 403) {
//             disabledUntilByUser.set(userKey, Date.now() + 5 * 60 * 1000);
//           }
//           throw new Error(`HF inference failed: ${resp.status} ${resp.statusText} ${text}`.slice(0, 500));
//         }

//         json = await resp.json();
//       } finally {
//         clearTimeout(t);
//         inFlightByUser.delete(userKey);
//       }

//       const parsed = parseHfPredictions(json);
//       if (parsed) {
//         expression = parsed.expression;
//         confidence = parsed.confidence;
//         faceDetected = true;
//       }
//     } catch (aiError) {
//       console.error("HuggingFace error message :", aiError.message);
//       console.error("HuggingFace error code    :", aiError.code);

//       return res.status(200).json({
//         success: true,
//         expression: "neutral",
//         confidence: 0,
//         face_detected: false,
//         warning: "Model temporarily unavailable.",
//       });
//     }

//     if (sessionId && faceDetected) {
//       const session = await Session.findOne({
//         sessionId,
//         user: req.user._id,
//       });

//       if (session && session.status === "active") {
//         session.expressionLog.push({ expression, confidence });

//         if (session.expressionSummary[expression] !== undefined) {
//           session.expressionSummary[expression] += 1;
//         }

//         await session.save();
//       }
//     }

//     res.status(200).json({
//       success: true,
//       expression,
//       confidence: Math.round(confidence * 100),
//       face_detected: faceDetected,
//     });
//   } catch (error) {
//     console.error("Controller error:", error.message);
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// module.exports = { analyzeExpression };

const axios = require("axios");
const FormData = require("form-data");
const Session = require("../../models/Session");
const {
  inFlightByUser,
  disabledUntilByUser,
  parseHfPredictions,
  GRADIO_HTTP_ENDPOINT,
  GRADIO_UPLOAD_ENDPOINT,
} = require("./hfConfig");

function parseSseCompletePayload(sseText) {
  const lines = String(sseText || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const eventLine = lines.find((line) => line.startsWith("event:"));
  if (eventLine && eventLine.includes("error")) return null;

  // Gradio v6 response stream example:
  // event: complete
  // data: [{...}]
  const dataLine = lines.reverse().find((line) => line.startsWith("data:"));
  if (!dataLine) return null;

  try {
    const parsed = JSON.parse(dataLine.slice("data:".length).trim());
    return Array.isArray(parsed) ? parsed[0] : parsed;
  } catch {
    return null;
  }
}

const analyzeExpression = async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image frame provided.",
      });
    }

    let expression   = "neutral";
    let confidence   = 0;
    let faceDetected = false;

    try {
      const userKey = String(req.user?._id || "anon");

      const disabledUntil = disabledUntilByUser.get(userKey) || 0;
      if (Date.now() < disabledUntil) {
        return res.status(200).json({
          success: true, expression: "neutral",
          confidence: 0, face_detected: false,
          warning: "Temporarily disabled.",
        });
      }

      if (inFlightByUser.get(userKey)) {
        return res.status(200).json({
          success: true, expression: "neutral",
          confidence: 0, face_detected: false,
          warning: "Model busy. Skipping frame.",
        });
      }

      inFlightByUser.set(userKey, true);

      try {
        // Step 1 — upload image to Gradio temp storage
        const uploadForm = new FormData();
        uploadForm.append("files", req.file.buffer, {
          filename: req.file.originalname || "frame.jpg",
          contentType: req.file.mimetype || "image/jpeg",
        });
        const uploadRes = await axios.post(
          GRADIO_UPLOAD_ENDPOINT,
          uploadForm,
          { headers: uploadForm.getHeaders(), timeout: 30000 }
        );
        const uploadedPath = uploadRes.data?.[0];
        if (!uploadedPath) {
          throw new Error("Gradio upload failed: missing uploaded file path");
        }

        // Step 2 — queue prediction job
        const queueRes = await axios.post(
          GRADIO_HTTP_ENDPOINT,
          {
            data: [
              {
                path: uploadedPath,
                meta: { _type: "gradio.FileData" },
              },
            ],
          },
          { headers: { "Content-Type": "application/json" }, timeout: 30000 }
        );

        const eventId = queueRes.data?.event_id;
        if (!eventId) {
          throw new Error("Gradio call failed: missing event_id");
        }

        // Step 2 — get completion payload from SSE endpoint
        const resultRes = await axios.get(`${GRADIO_HTTP_ENDPOINT}/${eventId}`, {
          timeout: 30000,
          responseType: "text",
        });

        const modelPayload = parseSseCompletePayload(resultRes.data);
        const parsed = parseHfPredictions(modelPayload);
        if (parsed) {
          expression   = parsed.expression;
          confidence   = parsed.confidence;
          faceDetected = true;
        }

      } finally {
        inFlightByUser.delete(userKey);
      }

    } catch (aiError) {
      console.error("Gradio error:", aiError.response?.data || aiError.message);
      return res.status(200).json({
        success: true,
        expression: "neutral",
        confidence: 0,
        face_detected: false,
        warning: "Model temporarily unavailable.",
      });
    }

    // Save to session if active
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