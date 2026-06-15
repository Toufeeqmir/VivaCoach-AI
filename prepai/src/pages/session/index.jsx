import { emotionColors, formatTime } from "./constants";
import { useSessionAnalysis } from "./useSessionAnalysis";

const Session = () => {
  const { state, actions, refs } = useSessionAnalysis();
  const totalDetections = Object.values(state.emotionSummary).reduce((sum, value) => sum + value, 0);

  return (
    <div className="app-page">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-3 border-b border-[var(--border)] pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Expression lab</p>
            <h1 className="mt-2 text-xl font-semibold text-white">Practice your non-verbal presence</h1>
            <p className="mt-2 text-xs text-[var(--text-secondary)]">Review visible expression signals in real time.</p>
          </div>
          <span className="ui-badge w-fit">{state.status === "active" ? `Live · ${formatTime(state.elapsed)}` : state.status === "done" ? "Session complete" : "Ready"}</span>
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_330px]">
          <section className="overflow-hidden rounded-[10px] border border-[var(--border-strong)] bg-[var(--bg-card)]">
            <div className="relative aspect-video bg-black">
              <video ref={refs.videoRef} autoPlay muted playsInline className="h-full w-full object-cover" />
              <canvas ref={refs.canvasRef} className="hidden" />

              {state.status === "active" && (
                <div className="absolute left-3 top-3 flex items-center gap-2 rounded-[7px] border border-white/10 bg-black/75 px-3 py-2 text-[10px] font-semibold text-white">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                  LIVE {formatTime(state.elapsed)}
                </div>
              )}

              {state.status === "active" && state.currentEmotion && (
                <div className="absolute bottom-3 left-3 rounded-[7px] border border-white/10 bg-black/80 px-3 py-2">
                  <span className="text-xs font-semibold capitalize" style={{ color: emotionColors[state.currentEmotion] }}>
                    {state.currentEmotion}
                  </span>
                  <span className="ml-2 text-[10px] text-[var(--text-secondary)]">{state.confidence}% confidence</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap justify-center gap-2 border-t border-[var(--border)] p-4">
              {state.status === "idle" && <button onClick={actions.startSession} className="ui-btn-primary">Start session</button>}
              {state.status === "active" && <button onClick={actions.endSession} className="ui-btn border border-red-500/25 bg-red-500/10 text-red-300">End session</button>}
              {state.status === "done" && <button onClick={actions.resetSession} className="ui-btn-ghost">New session</button>}
            </div>
          </section>

          <aside className="space-y-4">
            {state.result && (
              <section className="rounded-[10px] border border-[var(--blue-border)] border-l-[3px] border-l-[var(--blue)] bg-[var(--bg-card)] p-5">
                <p className="eyebrow">Session complete</p>
                <div className="mt-4 space-y-3 text-xs">
                  <div className="flex justify-between gap-3">
                    <span className="text-[var(--text-secondary)]">Duration</span>
                    <span className="font-semibold text-white">{formatTime(state.result.duration || 0)}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-[var(--text-secondary)]">Dominant emotion</span>
                    <span className="font-semibold capitalize text-[var(--blue-light)]">{state.result.dominantExpression}</span>
                  </div>
                </div>
              </section>
            )}

            <section className="section-card">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-white">Emotion summary</h2>
                <span className="text-[10px] text-[var(--text-muted)]">{totalDetections} signals</span>
              </div>
              <div className="space-y-3">
                {Object.entries(state.emotionSummary).map(([emotion, count]) => {
                  const pct = totalDetections > 0 ? (count / totalDetections) * 100 : 0;
                  return (
                    <div key={emotion}>
                      <div className="mb-1.5 flex justify-between text-[10px] capitalize">
                        <span className="text-[var(--text-secondary)]">{emotion}</span>
                        <span style={{ color: emotionColors[emotion] }}>{pct.toFixed(0)}%</span>
                      </div>
                      <div className="h-1 overflow-hidden rounded-full bg-[var(--bg-raised)]">
                        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: emotionColors[emotion] }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="section-card">
              <h2 className="mb-4 text-sm font-semibold text-white">Recent signals</h2>
              <div className="max-h-40 space-y-2 overflow-y-auto">
                {state.emotionLog.length === 0 ? (
                  <p className="text-xs text-[var(--text-muted)]">No detections yet.</p>
                ) : (
                  [...state.emotionLog].reverse().map((log, index) => (
                    <div key={`${log.time}-${index}`} className="flex justify-between gap-3 border-b border-[var(--border)] pb-2 text-[10px] last:border-0">
                      <span className="capitalize" style={{ color: emotionColors[log.expression] }}>{log.expression}</span>
                      <span className="text-[var(--text-muted)]">{log.time}</span>
                    </div>
                  ))
                )}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Session;
