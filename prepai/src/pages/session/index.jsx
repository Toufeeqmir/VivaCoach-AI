import { emotionColors, emotionEmoji, formatTime } from "./constants";
import { useSessionAnalysis } from "./useSessionAnalysis";

const Session = () => {
  const { state, actions, refs } = useSessionAnalysis();
  const totalDetections = Object.values(state.emotionSummary).reduce((sum, value) => sum + value, 0);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "Syne", fontSize: 28, fontWeight: 800, color: "#fff" }}>Expression Practice</h1>
        <p style={{ color: "#64748b", fontSize: 14, marginTop: 4 }}>AI analyzes your facial emotions in real time</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24 }}>
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 20, overflow: "hidden" }}>
          <div style={{ position: "relative", aspectRatio: "16/9", background: "#000" }}>
            <video ref={refs.videoRef} autoPlay muted playsInline style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <canvas ref={refs.canvasRef} style={{ display: "none" }} />

            {state.status === "active" && (
              <div style={{ position: "absolute", top: 16, left: 16, background: "rgba(0,0,0,0.7)", borderRadius: 8, padding: "6px 14px", display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#f87171", animation: "pulse-cyan 1s infinite" }} />
                <span style={{ color: "#fff", fontSize: 13, fontFamily: "Syne" }}>LIVE {formatTime(state.elapsed)}</span>
              </div>
            )}

            {state.status === "active" && state.currentEmotion && (
              <div style={{ position: "absolute", bottom: 16, left: 16, background: "rgba(0,0,0,0.8)", borderRadius: 12, padding: "10px 16px", border: `1px solid ${emotionColors[state.currentEmotion]}44` }}>
                <span style={{ fontSize: 24 }}>{emotionEmoji[state.currentEmotion]}</span>
                <span style={{ color: emotionColors[state.currentEmotion], fontFamily: "Syne", fontWeight: 700, fontSize: 16, marginLeft: 8, textTransform: "capitalize" }}>
                  {state.currentEmotion}
                </span>
                <span style={{ color: "#64748b", fontSize: 13, marginLeft: 8 }}>{state.confidence}%</span>
              </div>
            )}
          </div>

          <div style={{ padding: 20, display: "flex", gap: 12, justifyContent: "center" }}>
            {state.status === "idle" && (
              <button onClick={actions.startSession} style={{ background: "var(--cyan)", color: "#050810", padding: "12px 32px", borderRadius: 10, fontFamily: "Syne", fontWeight: 700, fontSize: 15, border: "none", cursor: "pointer", boxShadow: "0 0 20px #00d4ff33" }}>
                Start Session
              </button>
            )}
            {state.status === "active" && (
              <button onClick={actions.endSession} style={{ background: "#f87171", color: "#fff", padding: "12px 32px", borderRadius: 10, fontFamily: "Syne", fontWeight: 700, fontSize: 15, border: "none", cursor: "pointer" }}>
                End Session
              </button>
            )}
            {state.status === "done" && (
              <button onClick={actions.resetSession} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "#e2e8f0", padding: "12px 32px", borderRadius: 10, fontFamily: "Syne", fontWeight: 700, fontSize: 15, cursor: "pointer" }}>
                New Session
              </button>
            )}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {state.result && (
            <div style={{ background: "var(--bg-card)", border: "1px solid #00d4ff33", borderRadius: 16, padding: 20 }}>
              <h3 style={{ fontFamily: "Syne", fontWeight: 700, color: "var(--cyan)", marginBottom: 16, fontSize: 15 }}>Session Complete</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#64748b", fontSize: 13 }}>Duration</span>
                  <span style={{ color: "#e2e8f0", fontSize: 13, fontWeight: 600 }}>{formatTime(state.result.duration || 0)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#64748b", fontSize: 13 }}>Dominant Emotion</span>
                  <span style={{ color: emotionColors[state.result.dominantExpression] || "var(--cyan)", fontSize: 13, fontWeight: 600, textTransform: "capitalize" }}>
                    {state.result.dominantExpression}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, padding: 20, flex: 1 }}>
            <h3 style={{ fontFamily: "Syne", fontWeight: 700, color: "#fff", marginBottom: 16, fontSize: 15 }}>Emotion Summary</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {Object.entries(state.emotionSummary).map(([emotion, count]) => {
                const pct = totalDetections > 0 ? (count / totalDetections) * 100 : 0;
                return (
                  <div key={emotion}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ color: "#94a3b8", fontSize: 12, textTransform: "capitalize" }}>{emotion}</span>
                      <span style={{ color: emotionColors[emotion], fontSize: 12 }}>{pct.toFixed(0)}%</span>
                    </div>
                    <div style={{ height: 4, background: "#1f2937", borderRadius: 2 }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: emotionColors[emotion], borderRadius: 2, transition: "width 0.5s" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, padding: 20 }}>
            <h3 style={{ fontFamily: "Syne", fontWeight: 700, color: "#fff", marginBottom: 12, fontSize: 15 }}>Recent</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 160, overflowY: "auto" }}>
              {state.emotionLog.length === 0 ? (
                <span style={{ color: "#475569", fontSize: 13 }}>No detections yet</span>
              ) : (
                [...state.emotionLog].reverse().map((log, index) => (
                  <div key={index} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: emotionColors[log.expression], fontSize: 13, textTransform: "capitalize" }}>
                      {emotionEmoji[log.expression]} {log.expression}
                    </span>
                    <span style={{ color: "#475569", fontSize: 11 }}>{log.time}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Session;
