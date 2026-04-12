import { useState, useRef, useEffect } from "react";
import API from "../api";

const emotionColors = {
  happy: "#fbbf24", neutral: "#94a3b8", sad: "#60a5fa",
  angry: "#f87171", fear: "#c084fc", disgust: "#34d399", surprise: "#fb923c"
};

const Coach = () => {
  const [step, setStep]               = useState("setup");
  const [topic, setTopic]             = useState("general interview");
  const [messages, setMessages]       = useState([]);
  const [input, setInput]             = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking]   = useState(false);
  const [loading, setLoading]         = useState(false);
  const [lastFeedback, setLastFeedback] = useState(null);
  const [summary, setSummary]         = useState(null);
  const [sessionDuration, setSessionDuration] = useState(0);
  const recognitionRef  = useRef(null);
  const chatEndRef      = useRef(null);
  const timerRef        = useRef(null);
  const msgStartRef     = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      window.speechSynthesis?.cancel();
    };
  }, []);

  const speak = (text) => {
    window.speechSynthesis?.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US"; u.rate = 0.88; u.pitch = 1.05;
    setIsSpeaking(true);
    u.onend = () => setIsSpeaking(false);
    window.speechSynthesis?.speak(u);
  };

  const startListening = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert("Use Chrome or Edge for voice input."); return; }
    const r = new SR();
    r.continuous = false; r.interimResults = false; r.lang = "en-US";
    r.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setInput(transcript);
    };
    r.onerror  = () => setIsListening(false);
    r.onend    = () => setIsListening(false);
    recognitionRef.current = r;
    r.start();
    setIsListening(true);
    msgStartRef.current = Date.now();
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  const startSession = async () => {
    setLoading(true);
    try {
      const res = await API.post("/coach/start", { topic });
      const opening = res.data.openingQuestion;
      setMessages([{ role: "coach", content: opening, type: "question" }]);
      setStep("chat");
      timerRef.current = setInterval(() => setSessionDuration(p => p + 1), 1000);
      setTimeout(() => speak(opening), 300);
    } catch (err) {
      console.error(err);
      alert("Failed to start. Make sure Gemini API key is set.");
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsg   = input.trim();
    const duration  = msgStartRef.current ? Math.round((Date.now() - msgStartRef.current) / 1000) : 0;
    msgStartRef.current = null;

    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setInput("");
    setLoading(true);
    setLastFeedback(null);

    try {
      const history = messages.map(m => ({ role: m.role === "coach" ? "assistant" : "user", content: m.content }));
      const res = await API.post("/coach/message", { message: userMsg, history, duration });

      const { coachResponse, feedback, stats } = res.data;

      setMessages(prev => [...prev, {
        role:     "coach",
        content:  coachResponse,
        feedback,
        stats,
        type:     "response",
      }]);

      setLastFeedback({ feedback, stats });
      speak(coachResponse);

    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: "coach", content: "Sorry, I could not process that. Please try again.", type: "error" }]);
    } finally {
      setLoading(false);
    }
  };

  const endSession = async () => {
    clearInterval(timerRef.current);
    window.speechSynthesis?.cancel();
    setLoading(true);
    try {
      const userMessages = messages.filter(m => m.role === "user").map(m => ({ role: "user", content: m.content }));
      const res = await API.post("/coach/summary", { messages: userMessages });
      setSummary(res.data);
      setStep("summary");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (s) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  const ScoreCircle = ({ score, label, color }) => (
    <div style={{ textAlign: "center" }}>
      <div style={{ width: 64, height: 64, borderRadius: "50%", border: `3px solid ${color}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 6px", background: color + "15" }}>
        <span style={{ fontFamily: "Syne", fontWeight: 800, fontSize: 16, color }}>{score}</span>
      </div>
      <span style={{ color: "#64748b", fontSize: 11 }}>{label}</span>
    </div>
  );

  const topics = [
    "general interview", "behavioral questions", "technical interview",
    "leadership skills", "conflict resolution", "career goals",
    "strengths and weaknesses", "situational questions",
  ];

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontFamily: "Syne", fontSize: 22, fontWeight: 800, color: "#fff" }}>AI Communication Coach</h1>
        <p style={{ color: "#64748b", fontSize: 13, marginTop: 3 }}>Practice with an AI interviewer that gives real time feedback on every response</p>
      </div>

      {/* Setup */}
      {step === "setup" && (
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, padding: 28 }}>
            <h2 style={{ fontFamily: "Syne", fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 20 }}>Choose Your Focus Area</h2>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 20 }}>
              {topics.map(t => (
                <button key={t} onClick={() => setTopic(t)}
                  style={{ padding: "10px 12px", borderRadius: 8, border: `1px solid ${topic === t ? "var(--cyan)" : "var(--border)"}`, background: topic === t ? "var(--cyan-dim)" : "#0d1117", color: topic === t ? "var(--cyan)" : "#94a3b8", fontSize: 12, cursor: "pointer", textAlign: "left", textTransform: "capitalize", transition: "all 0.2s" }}>
                  {t}
                </button>
              ))}
            </div>

            <div style={{ background: "#0d1117", borderRadius: 10, padding: 14, marginBottom: 20, border: "1px solid var(--border)" }}>
              <div style={{ color: "#64748b", fontSize: 11, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>What you will get</div>
              {[
                "Real time grammar correction",
                "Filler word detection after each response",
                "Improved version of your answer",
                "Specific tips for each response",
                "Final performance score and summary",
                "Voice and text input supported",
              ].map((item, i) => (
                <div key={i} style={{ color: "#94a3b8", fontSize: 12, padding: "3px 0", display: "flex", gap: 8 }}>
                  <span style={{ color: "var(--cyan)" }}>✓</span>{item}
                </div>
              ))}
            </div>

            <button onClick={startSession} disabled={loading}
              style={{ width: "100%", background: "var(--cyan)", color: "#050810", padding: "12px", borderRadius: 8, fontFamily: "Syne", fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer", boxShadow: "0 0 20px #00d4ff33" }}>
              {loading ? "Starting..." : "Start Coaching Session"}
            </button>
          </div>
        </div>
      )}

      {/* Chat */}
      {step === "chat" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 18, height: "calc(100vh - 220px)" }}>

          {/* Chat area */}
          <div style={{ display: "flex", flexDirection: "column", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden" }}>

            {/* Chat header */}
            <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--cyan)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 12px #00d4ff44" }}>
                  <span style={{ fontFamily: "Syne", fontWeight: 800, fontSize: 14, color: "#050810" }}>AI</span>
                </div>
                <div>
                  <div style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>Interview Coach</div>
                  <div style={{ color: "#34d399", fontSize: 11 }}>● Online</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ color: "#64748b", fontSize: 12 }}>{formatTime(sessionDuration)}</span>
                <button onClick={endSession} disabled={loading}
                  style={{ background: "#f8717115", border: "1px solid #f8717133", borderRadius: 6, padding: "5px 12px", color: "#f87171", fontSize: 12, cursor: "pointer" }}>
                  End Session
                </button>
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
              {messages.map((msg, i) => (
                <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: msg.role === "user" ? "flex-end" : "flex-start" }}>
                  <div style={{
                    maxWidth: "78%", padding: "10px 14px", borderRadius: msg.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                    background: msg.role === "user" ? "var(--cyan)" : "#1f2937",
                    color: msg.role === "user" ? "#050810" : "#e2e8f0",
                    fontSize: 13, lineHeight: 1.6,
                  }}>
                    {msg.content}
                  </div>

                  {/* Per message feedback */}
                  {msg.role === "coach" && msg.feedback && (
                    <div style={{ maxWidth: "78%", marginTop: 6, background: "#0d1117", border: "1px solid var(--border)", borderRadius: 10, padding: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <span style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", letterSpacing: 1 }}>Feedback</span>
                        <span style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 13, color: msg.feedback.overallScore >= 70 ? "#34d399" : msg.feedback.overallScore >= 50 ? "#fbbf24" : "#f87171" }}>
                          {msg.feedback.overallScore}/100
                        </span>
                      </div>

                      {msg.feedback.fillerWordsUsed?.length > 0 && (
                        <div style={{ marginBottom: 8 }}>
                          <span style={{ color: "#64748b", fontSize: 11 }}>Filler words: </span>
                          {msg.feedback.fillerWordsUsed.map((w, j) => (
                            <span key={j} style={{ background: "#f8717115", border: "1px solid #f8717133", borderRadius: 4, padding: "1px 6px", color: "#f87171", fontSize: 11, marginLeft: 4 }}>{w}</span>
                          ))}
                        </div>
                      )}

                      {msg.feedback.grammarIssues?.length > 0 && (
                        <div style={{ marginBottom: 8 }}>
                          {msg.feedback.grammarIssues.slice(0, 2).map((issue, j) => (
                            <div key={j} style={{ color: "#fbbf24", fontSize: 11, padding: "2px 0" }}>⚠ {issue}</div>
                          ))}
                        </div>
                      )}

                      {msg.feedback.improvements?.length > 0 && (
                        <div style={{ marginBottom: 8 }}>
                          {msg.feedback.improvements.slice(0, 2).map((imp, j) => (
                            <div key={j} style={{ color: "#94a3b8", fontSize: 11, padding: "2px 0" }}>→ {imp}</div>
                          ))}
                        </div>
                      )}

                      {msg.feedback.improvedVersion && msg.feedback.improvedVersion !== msg.stats?.originalMessage && (
                        <div style={{ background: "#00d4ff08", border: "1px solid #00d4ff22", borderRadius: 6, padding: 8, marginTop: 4 }}>
                          <div style={{ color: "var(--cyan)", fontSize: 10, marginBottom: 4, textTransform: "uppercase", letterSpacing: 1 }}>Better version</div>
                          <div style={{ color: "#e2e8f0", fontSize: 12, fontStyle: "italic" }}>{msg.feedback.improvedVersion}</div>
                        </div>
                      )}

                      {msg.feedback.tip && (
                        <div style={{ marginTop: 6, color: "#34d399", fontSize: 11 }}>💡 {msg.feedback.tip}</div>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div style={{ display: "flex", alignItems: "flex-start" }}>
                  <div style={{ background: "#1f2937", padding: "10px 14px", borderRadius: "14px 14px 14px 4px" }}>
                    <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                      {[0, 1, 2].map(i => (
                        <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--cyan)", animation: `pulse-cyan 1s infinite ${i * 0.2}s` }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Input area */}
            <div style={{ padding: 14, borderTop: "1px solid var(--border)" }}>
              <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
                <textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                  placeholder="Type your response or click the mic to speak..."
                  rows={2}
                  style={{ flex: 1, background: "#0d1117", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 12px", color: "#e2e8f0", fontSize: 13, resize: "none", outline: "none", fontFamily: "DM Sans, sans-serif", lineHeight: 1.5 }}
                />
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <button onClick={isListening ? stopListening : startListening}
                    style={{ width: 38, height: 38, borderRadius: 8, border: `1px solid ${isListening ? "#f8717155" : "#00d4ff33"}`, background: isListening ? "#f8717115" : "var(--cyan-dim)", color: isListening ? "#f87171" : "var(--cyan)", fontSize: 16, cursor: "pointer" }}>
                    {isListening ? "🔴" : "🎙️"}
                  </button>
                  <button onClick={sendMessage} disabled={!input.trim() || loading}
                    style={{ width: 38, height: 38, borderRadius: 8, border: "none", background: input.trim() ? "var(--cyan)" : "#1f2937", color: input.trim() ? "#050810" : "#64748b", fontSize: 16, cursor: input.trim() ? "pointer" : "not-allowed" }}>
                    ↑
                  </button>
                </div>
              </div>
              {isListening && (
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#f87171", animation: "pulse-cyan 1s infinite" }} />
                  <span style={{ color: "#f87171", fontSize: 11 }}>Listening... speak now</span>
                </div>
              )}
              {isSpeaking && (
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--cyan)", animation: "pulse-cyan 1s infinite" }} />
                  <span style={{ color: "var(--cyan)", fontSize: 11 }}>Coach is speaking...</span>
                </div>
              )}
            </div>
          </div>

          {/* Right panel - live feedback */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14, overflowY: "auto" }}>

            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 14, padding: 16 }}>
              <div style={{ color: "#64748b", fontSize: 11, marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>Session Stats</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#94a3b8", fontSize: 12 }}>Responses</span>
                  <span style={{ color: "var(--cyan)", fontSize: 12, fontWeight: 600 }}>{messages.filter(m => m.role === "user").length}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#94a3b8", fontSize: 12 }}>Duration</span>
                  <span style={{ color: "#e2e8f0", fontSize: 12 }}>{formatTime(sessionDuration)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#94a3b8", fontSize: 12 }}>Topic</span>
                  <span style={{ color: "#e2e8f0", fontSize: 12, textTransform: "capitalize" }}>{topic}</span>
                </div>
              </div>
            </div>

            {lastFeedback && (
              <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 14, padding: 16 }}>
                <div style={{ color: "#64748b", fontSize: 11, marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>Last Response</div>

                <div style={{ textAlign: "center", marginBottom: 14 }}>
                  <div style={{ fontFamily: "Syne", fontSize: 32, fontWeight: 800, color: lastFeedback.feedback.overallScore >= 70 ? "#34d399" : lastFeedback.feedback.overallScore >= 50 ? "#fbbf24" : "#f87171" }}>
                    {lastFeedback.feedback.overallScore}
                  </div>
                  <div style={{ color: "#64748b", fontSize: 11 }}>Score</div>
                </div>

                {lastFeedback.stats?.wordCount > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ color: "#94a3b8", fontSize: 12 }}>Words</span>
                    <span style={{ color: "#e2e8f0", fontSize: 12 }}>{lastFeedback.stats.wordCount}</span>
                  </div>
                )}

                {lastFeedback.stats?.fillerCount > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ color: "#94a3b8", fontSize: 12 }}>Filler words</span>
                    <span style={{ color: "#f87171", fontSize: 12, fontWeight: 600 }}>{lastFeedback.stats.fillerCount}</span>
                  </div>
                )}

                {lastFeedback.feedback.strengths?.length > 0 && (
                  <div style={{ marginTop: 10 }}>
                    <div style={{ color: "#64748b", fontSize: 11, marginBottom: 6 }}>Strengths</div>
                    {lastFeedback.feedback.strengths.slice(0, 2).map((s, i) => (
                      <div key={i} style={{ color: "#34d399", fontSize: 12, padding: "2px 0" }}>✓ {s}</div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 14, padding: 16 }}>
              <div style={{ color: "#64748b", fontSize: 11, marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>Quick Tips</div>
              {["Avoid filler words like umm and like", "Use STAR method for behavioral questions", "Keep answers under 2 minutes", "Speak clearly and at steady pace", "Be specific with examples"].map((tip, i) => (
                <div key={i} style={{ color: "#94a3b8", fontSize: 12, padding: "4px 0", borderBottom: i < 4 ? "1px solid #1f2937" : "none" }}>
                  {tip}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Summary */}
      {step === "summary" && summary && (
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <div style={{ background: "var(--bg-card)", border: "1px solid #00d4ff22", borderRadius: 16, padding: 28, textAlign: "center", marginBottom: 16 }}>
            <p style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Session Complete</p>
            <div style={{ fontFamily: "Syne", fontSize: 52, fontWeight: 800, lineHeight: 1, marginBottom: 4, color: summary.summary.overallScore >= 70 ? "#34d399" : summary.summary.overallScore >= 50 ? "#fbbf24" : "#f87171" }}>
              {summary.summary.overallScore}
            </div>
            <div style={{ color: "#64748b", fontSize: 13 }}>Overall Score</div>
            <p style={{ color: "#94a3b8", fontSize: 13, marginTop: 14, lineHeight: 1.6, maxWidth: 460, margin: "14px auto 0" }}>{summary.summary.summary}</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, padding: 16, textAlign: "center" }}>
              <div style={{ fontFamily: "Syne", fontSize: 24, fontWeight: 800, color: "var(--cyan)" }}>{summary.summary.communicationScore}</div>
              <div style={{ color: "#64748b", fontSize: 12, marginTop: 4 }}>Communication</div>
            </div>
            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, padding: 16, textAlign: "center" }}>
              <div style={{ fontFamily: "Syne", fontSize: 24, fontWeight: 800, color: "#fbbf24" }}>{summary.summary.confidenceScore}</div>
              <div style={{ color: "#64748b", fontSize: 12, marginTop: 4 }}>Confidence</div>
            </div>
            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, padding: 16, textAlign: "center" }}>
              <div style={{ fontFamily: "Syne", fontSize: 24, fontWeight: 800, color: "#34d399" }}>{summary.summary.clarityScore}</div>
              <div style={{ color: "#64748b", fontSize: 12, marginTop: 4 }}>Clarity</div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 14, padding: 20 }}>
              <h3 style={{ fontFamily: "Syne", fontSize: 13, fontWeight: 700, color: "#34d399", marginBottom: 12 }}>Top Strengths</h3>
              {summary.summary.topStrengths?.map((s, i) => (
                <div key={i} style={{ color: "#94a3b8", fontSize: 12, padding: "4px 0", display: "flex", gap: 8 }}>
                  <span style={{ color: "#34d399" }}>✓</span>{s}
                </div>
              ))}
            </div>
            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 14, padding: 20 }}>
              <h3 style={{ fontFamily: "Syne", fontSize: 13, fontWeight: 700, color: "#fbbf24", marginBottom: 12 }}>Areas to Improve</h3>
              {summary.summary.topImprovements?.map((s, i) => (
                <div key={i} style={{ color: "#94a3b8", fontSize: 12, padding: "4px 0", display: "flex", gap: 8 }}>
                  <span style={{ color: "#fbbf24" }}>→</span>{s}
                </div>
              ))}
            </div>
          </div>

          {summary.summary.nextSteps && (
            <div style={{ background: "var(--bg-card)", border: "1px solid #00d4ff22", borderRadius: 14, padding: 20, marginBottom: 16 }}>
              <h3 style={{ fontFamily: "Syne", fontSize: 13, fontWeight: 700, color: "var(--cyan)", marginBottom: 8 }}>Next Steps</h3>
              <p style={{ color: "#94a3b8", fontSize: 13, lineHeight: 1.6 }}>{summary.summary.nextSteps}</p>
            </div>
          )}

          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => { setStep("setup"); setMessages([]); setLastFeedback(null); setSummary(null); setSessionDuration(0); }}
              style={{ flex: 1, background: "var(--cyan)", color: "#050810", padding: "11px", borderRadius: 8, fontFamily: "Syne", fontWeight: 700, fontSize: 13, border: "none", cursor: "pointer" }}>
              Practice Again
            </button>
            <button onClick={() => window.location.href = "/interview"}
              style={{ flex: 1, background: "var(--bg-card)", border: "1px solid var(--border)", color: "#e2e8f0", padding: "11px", borderRadius: 8, fontFamily: "Syne", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
              Try Interview Mode
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Coach;
