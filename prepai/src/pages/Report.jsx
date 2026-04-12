import { useEffect, useState } from "react";
import API from "../api";

const emotionEmoji = {
  happy: "😊", neutral: "😐", sad: "😢",
  angry: "😠", fear: "😨", disgust: "🤢", surprise: "😲"
};

const emotionColor = {
  happy: "#fbbf24", neutral: "#94a3b8", sad: "#60a5fa",
  angry: "#f87171", fear: "#c084fc", disgust: "#34d399", surprise: "#fb923c"
};

const scoreColor = (s) => s >= 70 ? "#34d399" : s >= 50 ? "#fbbf24" : "#f87171";
const scoreBg = (s) => s >= 70 ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : s >= 50 ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-400" : "bg-red-500/10 border-red-500/20 text-red-400";

const MiniBar = ({ value, color, max = 100 }) => (
  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
    <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${Math.min((value / max) * 100, 100)}%`, backgroundColor: color }} />
  </div>
);

const StatCard = ({ label, value, sub, color, icon }) => (
  <div className="bg-[#0d1117] border border-slate-800 rounded-2xl p-5 hover:border-slate-600 transition-all duration-300">
    <div className="flex justify-between items-start mb-3">
      <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">{label}</span>
      <span className="text-xl">{icon}</span>
    </div>
    <div className="text-3xl font-black mb-1" style={{ color }}>{value}</div>
    {sub && <div className="text-slate-500 text-xs">{sub}</div>}
  </div>
);

const WeekChart = ({ thisWeek, lastWeek }) => {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const max = Math.max(...thisWeek, ...lastWeek, 1);
  return (
    <div className="bg-[#0d1117] border border-slate-800 rounded-2xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-white font-bold text-base">Weekly Score Comparison</h3>
        <div className="flex gap-4 text-xs">
          <span className="flex items-center gap-1.5 text-slate-400">
            <span className="w-3 h-3 rounded-sm bg-cyan-500 inline-block" /> This week
          </span>
          <span className="flex items-center gap-1.5 text-slate-400">
            <span className="w-3 h-3 rounded-sm bg-slate-600 inline-block" /> Last week
          </span>
        </div>
      </div>
      <div className="flex items-end gap-2 h-40">
        {days.map((day, i) => (
          <div key={day} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full flex gap-0.5 items-end" style={{ height: 120 }}>
              <div className="flex-1 rounded-t-md transition-all duration-1000 bg-slate-700"
                style={{ height: `${lastWeek[i] ? (lastWeek[i] / max) * 100 : 0}%`, minHeight: lastWeek[i] ? 4 : 0 }} />
              <div className="flex-1 rounded-t-md transition-all duration-1000 bg-cyan-500"
                style={{ height: `${thisWeek[i] ? (thisWeek[i] / max) * 100 : 0}%`, minHeight: thisWeek[i] ? 4 : 0 }} />
            </div>
            <span className="text-slate-500 text-[10px] font-bold">{day}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const ImprovementBadge = ({ thisWeek, lastWeek }) => {
  const avg = (arr) => arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;
  const tw = avg(thisWeek.filter(Boolean));
  const lw = avg(lastWeek.filter(Boolean));
  const diff = tw - lw;
  if (!tw && !lw) return null;
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border ${diff >= 0 ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border-red-500/20 text-red-400"}`}>
      {diff >= 0 ? "↑" : "↓"} {Math.abs(diff)}% vs last week
    </div>
  );
};

const Report = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await API.get("/interview/history");
        setInterviews(res.data.sessions || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- Data Processing ---
  const now = new Date();
  const startOfThisWeek = new Date(now);
  startOfThisWeek.setDate(now.getDate() - now.getDay() + 1);
  startOfThisWeek.setHours(0, 0, 0, 0);

  const startOfLastWeek = new Date(startOfThisWeek);
  startOfLastWeek.setDate(startOfThisWeek.getDate() - 7);

  const thisWeekSessions = interviews.filter(s => new Date(s.createdAt) >= startOfThisWeek);
  const lastWeekSessions = interviews.filter(s => {
    const d = new Date(s.createdAt);
    return d >= startOfLastWeek && d < startOfThisWeek;
  });

  // Build day-by-day scores for chart (Mon=0 ... Sun=6)
  const buildWeekScores = (sessions, weekStart) => {
    const scores = Array(7).fill(0);
    const counts = Array(7).fill(0);
    sessions.forEach(s => {
      const d = new Date(s.createdAt);
      const dayIdx = (d.getDay() + 6) % 7;
      scores[dayIdx] += s.totalScore || 0;
      counts[dayIdx]++;
    });
    return scores.map((s, i) => counts[i] ? Math.round(s / counts[i]) : 0);
  };

  const thisWeekScores = buildWeekScores(thisWeekSessions, startOfThisWeek);
  const lastWeekScores = buildWeekScores(lastWeekSessions, startOfLastWeek);

  const avgScore = (arr) => arr.length ? Math.round(arr.reduce((a, b) => a + (b.totalScore || 0), 0) / arr.length) : 0;
  const thisWeekAvg = avgScore(thisWeekSessions);
  const lastWeekAvg = avgScore(lastWeekSessions);
  const overallAvg = avgScore(interviews);

  // Emotion aggregation
  const allEmotions = { happy: 0, neutral: 0, sad: 0, angry: 0, fear: 0, disgust: 0, surprise: 0 };
  interviews.forEach(session => {
    session.answers?.forEach(ans => {
      Object.keys(allEmotions).forEach(em => {
        allEmotions[em] += (ans.emotionSummary?.[em] || 0);
      });
    });
  });
  const totalEmotions = Object.values(allEmotions).reduce((a, b) => a + b, 0);

  // Best scores
  const bestSession = interviews.reduce((best, s) => (!best || s.totalScore > best.totalScore) ? s : best, null);
  const totalQuestions = interviews.reduce((a, s) => a + (s.answers?.length || 0), 0);

  const tabs = ["overview", "weekly", "sessions", "emotions"];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050810] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 text-sm">Loading your report card...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050810] text-slate-200 p-6">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-cyan-500 text-xs font-bold uppercase tracking-widest mb-1">Performance Report Card</p>
            <h1 className="text-4xl font-black text-white tracking-tight">Your Progress</h1>
            <p className="text-slate-500 text-sm mt-1">{interviews.length} sessions completed • All time analytics</p>
          </div>
          <ImprovementBadge thisWeek={thisWeekScores} lastWeek={lastWeekScores} />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-[#0d1117] border border-slate-800 rounded-xl p-1 w-fit">
          {tabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 capitalize
                ${activeTab === tab ? "bg-cyan-500 text-black" : "text-slate-500 hover:text-slate-300"}`}>
              {tab}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ── */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="Total Sessions" value={interviews.length} icon="🎯" color="#06b6d4" sub="All time" />
              <StatCard label="Overall Avg" value={`${overallAvg}%`} icon="📊" color={scoreColor(overallAvg)} sub="Across all sessions" />
              <StatCard label="Questions Done" value={totalQuestions} icon="💬" color="#c084fc" sub="Total answered" />
              <StatCard label="Best Score" value={bestSession ? `${bestSession.totalScore}%` : "—"} icon="🏆" color="#fbbf24" sub={bestSession ? new Date(bestSession.createdAt).toLocaleDateString() : "No sessions yet"} />
            </div>

            {/* This week vs Last week summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#0d1117] border border-cyan-500/20 rounded-2xl p-6">
                <p className="text-cyan-500 text-[10px] font-bold uppercase tracking-widest mb-2">This Week</p>
                <div className="text-5xl font-black text-white mb-2">{thisWeekAvg || "—"}{thisWeekAvg ? "%" : ""}</div>
                <p className="text-slate-500 text-sm">{thisWeekSessions.length} sessions this week</p>
                <div className="mt-4 space-y-2">
                  {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d, i) => (
                    thisWeekScores[i] > 0 && (
                      <div key={d} className="flex items-center gap-3">
                        <span className="text-slate-600 text-xs w-7">{d}</span>
                        <MiniBar value={thisWeekScores[i]} color="#06b6d4" />
                        <span className="text-cyan-400 text-xs font-bold w-8 text-right">{thisWeekScores[i]}%</span>
                      </div>
                    )
                  ))}
                  {thisWeekSessions.length === 0 && <p className="text-slate-600 text-xs">No sessions this week yet</p>}
                </div>
              </div>

              <div className="bg-[#0d1117] border border-slate-700 rounded-2xl p-6">
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-2">Last Week</p>
                <div className="text-5xl font-black text-slate-400 mb-2">{lastWeekAvg || "—"}{lastWeekAvg ? "%" : ""}</div>
                <p className="text-slate-500 text-sm">{lastWeekSessions.length} sessions last week</p>
                <div className="mt-4 space-y-2">
                  {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d, i) => (
                    lastWeekScores[i] > 0 && (
                      <div key={d} className="flex items-center gap-3">
                        <span className="text-slate-600 text-xs w-7">{d}</span>
                        <MiniBar value={lastWeekScores[i]} color="#475569" />
                        <span className="text-slate-400 text-xs font-bold w-8 text-right">{lastWeekScores[i]}%</span>
                      </div>
                    )
                  ))}
                  {lastWeekSessions.length === 0 && <p className="text-slate-600 text-xs">No sessions last week</p>}
                </div>
              </div>
            </div>

            {/* Score breakdown from latest session */}
            {interviews[0]?.answers?.length > 0 && (
              <div className="bg-[#0d1117] border border-slate-800 rounded-2xl p-6">
                <h3 className="text-white font-bold mb-5">Latest Session Breakdown</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {[
                    { label: "Grammar", key: "grammarScore", color: "#34d399" },
                    { label: "Confidence", key: "confidenceScore", color: "#06b6d4" },
                    { label: "Speech Pace", key: "speechScore", color: "#fbbf24" },
                    { label: "Filler Words", key: "fillerScore", color: "#c084fc" },
                  ].map(({ label, key, color }) => {
                    const avg = Math.round(interviews[0].answers.reduce((a, b) => a + (b[key] || 0), 0) / interviews[0].answers.length);
                    return (
                      <div key={key}>
                        <div className="flex justify-between mb-2">
                          <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">{label}</span>
                          <span className="text-xs font-bold" style={{ color }}>{avg}%</span>
                        </div>
                        <MiniBar value={avg} color={color} />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── WEEKLY TAB ── */}
        {activeTab === "weekly" && (
          <div className="space-y-6">
            <WeekChart thisWeek={thisWeekScores} lastWeek={lastWeekScores} />

            {/* Side by side comparison */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: "Sessions", thisVal: thisWeekSessions.length, lastVal: lastWeekSessions.length, icon: "🎯", suffix: "" },
                { label: "Avg Score", thisVal: thisWeekAvg, lastVal: lastWeekAvg, icon: "📊", suffix: "%" },
                { label: "Questions", thisVal: thisWeekSessions.reduce((a, s) => a + (s.answers?.length || 0), 0), lastVal: lastWeekSessions.reduce((a, s) => a + (s.answers?.length || 0), 0), icon: "💬", suffix: "" },
              ].map(({ label, thisVal, lastVal, icon, suffix }) => {
                const diff = thisVal - lastVal;
                return (
                  <div key={label} className="bg-[#0d1117] border border-slate-800 rounded-2xl p-5">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">{label}</span>
                      <span>{icon}</span>
                    </div>
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-[10px] text-cyan-500 font-bold uppercase mb-1">This week</p>
                        <p className="text-3xl font-black text-white">{thisVal}{suffix}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Last week</p>
                        <p className="text-3xl font-black text-slate-500">{lastVal}{suffix}</p>
                      </div>
                    </div>
                    {(thisVal || lastVal) ? (
                      <div className={`mt-3 text-xs font-bold ${diff >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                        {diff >= 0 ? "▲" : "▼"} {Math.abs(diff)}{suffix} {diff >= 0 ? "improvement" : "decline"}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>

            {/* 7-day score list */}
            <div className="bg-[#0d1117] border border-slate-800 rounded-2xl p-6">
              <h3 className="text-white font-bold mb-5">Day by Day — This Week</h3>
              <div className="space-y-3">
                {["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"].map((day, i) => (
                  <div key={day} className="flex items-center gap-4">
                    <span className="text-slate-500 text-xs font-bold w-20">{day}</span>
                    <div className="flex-1">
                      <MiniBar value={thisWeekScores[i]} color="#06b6d4" />
                    </div>
                    <span className="text-xs font-bold w-12 text-right" style={{ color: thisWeekScores[i] ? scoreColor(thisWeekScores[i]) : "#334155" }}>
                      {thisWeekScores[i] ? `${thisWeekScores[i]}%` : "—"}
                    </span>
                    <div className="flex-1">
                      <MiniBar value={lastWeekScores[i]} color="#475569" />
                    </div>
                    <span className="text-slate-600 text-xs font-bold w-12 text-right">
                      {lastWeekScores[i] ? `${lastWeekScores[i]}%` : "—"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── SESSIONS TAB ── */}
        {activeTab === "sessions" && (
          <div className="space-y-4">
            {interviews.length === 0 ? (
              <div className="bg-[#0d1117] border border-slate-800 rounded-2xl p-16 text-center">
                <div className="text-5xl mb-4">💬</div>
                <p className="text-slate-500">No sessions yet. Start your first interview!</p>
                <a href="/interview" className="text-cyan-500 text-sm mt-3 inline-block hover:underline">Go to Interview →</a>
              </div>
            ) : interviews.map((session, i) => (
              <div key={i} className="bg-[#0d1117] border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-600 transition-all duration-300">
                <button className="w-full p-6 text-left" onClick={() => setExpanded(expanded === i ? null : i)}>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-white font-bold">Session #{interviews.length - i}</p>
                      <p className="text-slate-500 text-xs mt-1">
                        {new Date(session.createdAt).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
                        {" · "}{session.answers?.length || 0} questions
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className={`px-3 py-1 rounded-full text-xs font-bold border ${scoreBg(session.totalScore)}`}>
                        {session.totalScore}%
                      </div>
                      <span className="text-slate-600">{expanded === i ? "▲" : "▼"}</span>
                    </div>
                  </div>

                  {/* Mini score bars */}
                  {session.answers?.length > 0 && (
                    <div className="grid grid-cols-4 gap-3 mt-4">
                      {[
                        { label: "Grammar", key: "grammarScore", color: "#34d399" },
                        { label: "Confidence", key: "confidenceScore", color: "#06b6d4" },
                        { label: "Speech", key: "speechScore", color: "#fbbf24" },
                        { label: "Fillers", key: "fillerScore", color: "#c084fc" },
                      ].map(({ label, key, color }) => {
                        const avg = Math.round(session.answers.reduce((a, b) => a + (b[key] || 0), 0) / session.answers.length);
                        return (
                          <div key={key}>
                            <div className="flex justify-between mb-1">
                              <span className="text-slate-600 text-[10px]">{label}</span>
                              <span className="text-[10px] font-bold" style={{ color }}>{avg}%</span>
                            </div>
                            <MiniBar value={avg} color={color} />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </button>

                {/* Expanded answers */}
                {expanded === i && session.answers?.length > 0 && (
                  <div className="border-t border-slate-800 p-6 space-y-4">
                    <p className="text-slate-400 text-sm leading-relaxed italic mb-4">"{session.overallFeedback}"</p>
                    {session.answers.map((ans, j) => (
                      <div key={j} className="bg-[#050810] border border-slate-800 rounded-xl p-4">
                        <div className="flex justify-between items-start mb-3">
                          <p className="text-white text-sm font-medium flex-1 pr-4">{ans.question}</p>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex-shrink-0 ${scoreBg(ans.overallScore)}`}>
                            {ans.overallScore}%
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                          {[
                            { label: "Grammar", value: ans.grammarScore, color: "#34d399" },
                            { label: "Confidence", value: ans.confidenceScore, color: "#06b6d4" },
                            { label: "WPM", value: ans.wordsPerMinute, color: "#fbbf24", max: 200 },
                            { label: "Fillers", value: ans.fillerWordCount, color: "#f87171", max: 20, invert: true },
                          ].map(({ label, value, color, max = 100 }) => (
                            <div key={label}>
                              <div className="flex justify-between mb-1">
                                <span className="text-slate-600 text-[10px]">{label}</span>
                                <span className="text-[10px] font-bold" style={{ color }}>{value}</span>
                              </div>
                              <MiniBar value={value} color={color} max={max} />
                            </div>
                          ))}
                        </div>
                        {ans.dominantEmotion && (
                          <div className="flex items-center gap-2">
                            <span className="text-slate-600 text-[10px] uppercase font-bold">Dominant emotion:</span>
                            <span className="text-xs" style={{ color: emotionColor[ans.dominantEmotion] }}>
                              {emotionEmoji[ans.dominantEmotion]} {ans.dominantEmotion}
                            </span>
                          </div>
                        )}
                        {ans.feedback && (
                          <p className="text-slate-500 text-xs mt-2 leading-relaxed">{ans.feedback}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── EMOTIONS TAB ── */}
        {activeTab === "emotions" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(allEmotions).map(([em, count]) => {
                const pct = totalEmotions > 0 ? ((count / totalEmotions) * 100).toFixed(1) : "0.0";
                return (
                  <div key={em} className="bg-[#0d1117] border border-slate-800 rounded-2xl p-5 text-center hover:border-slate-600 transition-all">
                    <div className="text-3xl mb-2">{emotionEmoji[em]}</div>
                    <div className="text-2xl font-black mb-1" style={{ color: emotionColor[em] }}>{pct}%</div>
                    <div className="text-slate-500 text-xs capitalize font-bold uppercase tracking-wider">{em}</div>
                    <div className="mt-3">
                      <MiniBar value={parseFloat(pct)} color={emotionColor[em]} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Dominant emotion overall */}
            {totalEmotions > 0 && (() => {
              const dominant = Object.entries(allEmotions).reduce((a, b) => b[1] > a[1] ? b : a);
              return (
                <div className="bg-[#0d1117] border border-slate-800 rounded-2xl p-6 text-center">
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-3">Your Dominant Expression</p>
                  <div className="text-6xl mb-3">{emotionEmoji[dominant[0]]}</div>
                  <p className="text-2xl font-black capitalize" style={{ color: emotionColor[dominant[0]] }}>{dominant[0]}</p>
                  <p className="text-slate-500 text-sm mt-2">Detected in {((dominant[1] / totalEmotions) * 100).toFixed(1)}% of your sessions</p>
                </div>
              );
            })()}

            {/* Emotion trend this week */}
            <div className="bg-[#0d1117] border border-slate-800 rounded-2xl p-6">
              <h3 className="text-white font-bold mb-5">Emotion Trend — This Week</h3>
              {thisWeekSessions.length === 0 ? (
                <p className="text-slate-600 text-sm">No sessions this week yet.</p>
              ) : (
                <div className="space-y-3">
                  {Object.entries(allEmotions).map(([em, _]) => {
                    let total = 0, count = 0;
                    thisWeekSessions.forEach(s => s.answers?.forEach(a => {
                      total += (a.emotionSummary?.[em] || 0);
                      count += Object.values(a.emotionSummary || {}).reduce((x, y) => x + y, 0);
                    }));
                    const pct = count > 0 ? (total / count) * 100 : 0;
                    return (
                      <div key={em} className="flex items-center gap-4">
                        <span className="text-base w-8">{emotionEmoji[em]}</span>
                        <span className="text-slate-400 text-xs capitalize w-16">{em}</span>
                        <div className="flex-1">
                          <MiniBar value={pct} color={emotionColor[em]} />
                        </div>
                        <span className="text-xs font-bold w-10 text-right" style={{ color: emotionColor[em] }}>{pct.toFixed(1)}%</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* No data state */}
        {interviews.length === 0 && activeTab === "overview" && (
          <div className="bg-[#0d1117] border border-slate-800 rounded-2xl p-16 text-center mt-6">
            <div className="text-5xl mb-4">📊</div>
            <h3 className="text-white font-bold text-lg mb-2">No data yet</h3>
            <p className="text-slate-500 text-sm mb-6">Complete your first interview session to see your report card</p>
            <a href="/interview" className="bg-cyan-500 text-black font-bold px-6 py-3 rounded-xl text-sm hover:bg-cyan-400 transition-all">
              Start Interview →
            </a>
          </div>
        )}

      </div>
    </div>
  );
};

export default Report;