import { useEffect, useMemo, useState } from "react";
import { createBodyLanguageSnapshot, getBodyLanguageAlerts } from "./interview/bodyLanguage";

const emotionColors = { happy: "text-yellow-400", neutral: "text-slate-400", sad: "text-blue-400", angry: "text-red-400", fear: "text-purple-400", disgust: "text-emerald-400", surprise: "text-orange-400" };
const emotionBg = { happy: "bg-yellow-400", neutral: "bg-slate-400", sad: "bg-blue-400", angry: "bg-red-400", fear: "bg-purple-400", disgust: "bg-emerald-400", surprise: "bg-orange-400" };

const metricOrder = ["posture", "eyeContact", "confidence", "headStability", "handMovement"];

const toneClasses = {
  good: {
    card: "border-emerald-400/25 bg-emerald-400/10",
    dot: "bg-emerald-400",
    text: "text-emerald-300",
    ring: "shadow-[0_0_0_1px_rgba(52,211,153,0.12)]",
  },
  warning: {
    card: "border-amber-400/25 bg-amber-400/10",
    dot: "bg-amber-300",
    text: "text-amber-200",
    ring: "shadow-[0_0_0_1px_rgba(251,191,36,0.12)]",
  },
  poor: {
    card: "border-red-400/25 bg-red-500/10",
    dot: "bg-red-400",
    text: "text-red-200",
    ring: "shadow-[0_0_0_1px_rgba(248,113,113,0.12)]",
  },
  unknown: {
    card: "border-[var(--border)] bg-[var(--bg-secondary)]",
    dot: "bg-slate-500",
    text: "text-[var(--text-secondary)]",
    ring: "",
  },
};

const alertToneClasses = {
  warning: "border-amber-400/30 bg-amber-400/10 text-amber-100",
  poor: "border-red-400/30 bg-red-500/10 text-red-100",
};

const MetricRow = ({ metric }) => {
  const tone = toneClasses[metric.severity] || toneClasses.unknown;

  return (
    <div className={`rounded-[8px] border px-3 py-2.5 transition-all duration-300 ${tone.card} ${tone.ring}`}>
      <div className="flex items-center justify-between gap-3">
        <p className="min-w-0 text-sm font-semibold leading-5 text-white">
          <span className="text-[var(--text-secondary)]">{metric.label}: </span>
          <span key={`${metric.id}-${metric.statusText}-${metric.severity}`} className={`metric-value-change inline-flex items-center gap-1 ${tone.text}`}>
            {metric.statusText}
            {metric.icon && <span aria-hidden="true">{metric.icon}</span>}
          </span>
        </p>
        <span className={`h-2 w-2 shrink-0 rounded-full transition-colors duration-300 ${tone.dot}`} />
      </div>
      {metric.score !== null && metric.score !== undefined && (
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-black/20">
          <div className={`h-full rounded-full transition-all duration-500 ${tone.dot}`} style={{ width: `${Math.max(0, Math.min(metric.score, 100))}%` }} />
        </div>
      )}
    </div>
  );
};

const BodyLanguagePanel = ({ bodyLanguage, cameraReady }) => {
  const metrics = bodyLanguage?.metrics || {};

  return (
    <div className="section-card h-full">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-xs font-semibold text-white">Body language</p>
        <span className="ui-badge px-2 py-1 text-[9px]">{cameraReady && bodyLanguage?.lastUpdated ? "Live" : "Standby"}</span>
      </div>
      <div className="space-y-2.5">
        {metricOrder.map((id) => (
          <MetricRow key={id} metric={metrics[id]} />
        ))}
      </div>
    </div>
  );
};

const LiveCoachingAlerts = ({ alerts }) => {
  const [visibleAlerts, setVisibleAlerts] = useState([]);

  useEffect(() => {
    setVisibleAlerts((previousAlerts) => {
      const incoming = new Map(alerts.map((alert) => [alert.id, alert]));
      const nextAlerts = alerts.map((alert) => ({ ...alert, exiting: false }));
      const exitingAlerts = previousAlerts
        .filter((alert) => !incoming.has(alert.id))
        .map((alert) => (alert.exiting ? alert : { ...alert, exiting: true }));

      return [...nextAlerts, ...exitingAlerts];
    });
  }, [alerts]);

  useEffect(() => {
    if (!visibleAlerts.some((alert) => alert.exiting)) return undefined;

    const timeout = window.setTimeout(() => {
      setVisibleAlerts((previousAlerts) => previousAlerts.filter((alert) => !alert.exiting));
    }, 320);

    return () => window.clearTimeout(timeout);
  }, [visibleAlerts]);

  if (!visibleAlerts.length) return null;

  return (
    <div className="space-y-2" aria-live="polite">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold text-white">Live coaching</p>
        <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">{alerts.length} active</span>
      </div>
      <div className="space-y-2">
        {visibleAlerts.map((alert) => (
          <div
            key={alert.id}
            className={`rounded-[8px] border px-3 py-2 text-sm font-semibold transition-all duration-300 ${
              alertToneClasses[alert.severity] || alertToneClasses.warning
            } ${alert.exiting ? "translate-y-1 opacity-0" : "translate-y-0 opacity-100 metric-alert-enter"}`}
          >
            {alert.message}
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Camera + emotion analysis visualization panel.
 * @param {{
 *  videoRef: any,
 *  canvasRef: any,
 *  cameraReady?: boolean,
 *  currentEmotion?: string | null,
 *  emotionSummary: Record<string, number>,
 *  bodyLanguage?: ReturnType<typeof createBodyLanguageSnapshot>
 * }} props
 * @returns {JSX.Element}
 */
const AnalysisPanel = ({ videoRef, canvasRef, cameraReady, currentEmotion, emotionSummary = {}, bodyLanguage }) => {
  const fallbackBodyLanguage = useMemo(() => createBodyLanguageSnapshot(), []);
  const activeBodyLanguage = bodyLanguage || fallbackBodyLanguage;
  const alerts = useMemo(() => getBodyLanguageAlerts(activeBodyLanguage), [activeBodyLanguage]);
  const emotionTotal = Object.values(emotionSummary).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-3">
      <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_minmax(245px,0.9fr)]">
        <div className="relative aspect-square overflow-hidden rounded-[10px] border border-[var(--border-strong)] bg-black">
          <video ref={videoRef} autoPlay muted playsInline className="h-full w-full object-cover scale-x-[-1]" />
          <canvas ref={canvasRef} className="hidden" />
          {currentEmotion && (
            <div className="absolute left-3 top-3 rounded-[7px] border border-white/10 bg-black/80 px-3 py-1.5">
              <span className={`text-[10px] font-black uppercase ${emotionColors[currentEmotion]}`}>{currentEmotion}</span>
            </div>
          )}
        </div>
        <BodyLanguagePanel bodyLanguage={activeBodyLanguage} cameraReady={cameraReady} />
      </div>

      <LiveCoachingAlerts alerts={alerts} />

      <div className="section-card">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-xs font-semibold text-white">Facial signals</p>
          <span className="ui-badge px-2 py-1 text-[9px]">{cameraReady ? "Active" : "Standby"}</span>
        </div>
        {Object.entries(emotionSummary).map(([em, count]) => {
          const pct = emotionTotal > 0 ? (count / emotionTotal) * 100 : 0;
          return (
            <div key={em} className="mb-3">
              <div className="flex justify-between text-[9px] font-medium uppercase text-[var(--text-secondary)]"><span>{em}</span><span>{Math.round(pct)}%</span></div>
              <div className="mt-1 h-1 overflow-hidden rounded-full bg-[var(--bg-raised)]"><div className={`h-full transition-all duration-500 ${emotionBg[em]}`} style={{ width: `${pct}%` }} /></div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AnalysisPanel;
