import { scoreTone } from "./utils";
import { Link } from "react-router-dom";

export const SectionCard = ({ title, subtitle, children }) => (
  <section className="section-card">
    <div className="mb-5">
      <p className="eyebrow">{title}</p>
      {subtitle && <p className="mt-2 text-xs leading-5 text-[var(--text-secondary)]">{subtitle}</p>}
    </div>
    {children}
  </section>
);

export const MetricTile = ({ label, value, subtitle, suffix = "%" }) => {
  const numericValue = typeof value === "number" ? value : Number(value) || 0;
  const tone = scoreTone(numericValue);

  return (
    <div className="rounded-[8px] border border-[var(--border)] bg-[var(--bg-secondary)] p-4">
      <div className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">{label}</div>
      <div className="mt-3 text-2xl font-semibold" style={{ color: tone.color }}>
        {value}
        {suffix}
      </div>
      {subtitle && <div className="mt-2 text-xs text-slate-500">{subtitle}</div>}
    </div>
  );
};

export const SkillMeter = ({ label, value }) => {
  const tone = scoreTone(value);

  return (
    <div className="rounded-[8px] border border-[var(--border)] bg-[var(--bg-secondary)] p-4">
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</span>
        <span className="text-sm font-bold" style={{ color: tone.color }}>{value}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-900">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${value}%`, backgroundColor: tone.color }} />
      </div>
    </div>
  );
};

export const RecommendationCard = ({ title, body }) => (
  <div className="rounded-[8px] border border-[var(--blue-border)] bg-[var(--blue-tint)] p-4">
    <div className="text-xs font-black uppercase tracking-wider text-cyan-300">{title}</div>
    <p className="mt-2 text-sm leading-relaxed text-slate-300">{body}</p>
  </div>
);

export const LoadingState = () => (
  <div className="app-page">
    <div className="mx-auto max-w-6xl">
      <div className="flex min-h-[50vh] items-center justify-center rounded-[10px] border border-[var(--border)] bg-[var(--bg-card)]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
          <p className="text-sm text-slate-500">Loading your performance report...</p>
        </div>
      </div>
    </div>
  </div>
);

export const EmptyState = () => (
  <div className="app-page">
    <div className="mx-auto max-w-6xl">
      <SectionCard title="Report" subtitle="Complete an interview session and this page will turn into your personal improvement dashboard.">
        <div className="rounded-[8px] border border-[var(--border)] bg-[var(--bg-secondary)] px-8 py-16 text-center">
          <h1 className="text-2xl font-semibold text-white">No interview data yet</h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-slate-500">
            Start a session, answer a few questions, and come back here to see score trends, weak areas, filler patterns, and practice suggestions.
          </p>
          <Link
            to="/interview"
            className="ui-btn-primary mt-8 no-underline"
          >
            Start interview
          </Link>
        </div>
      </SectionCard>
    </div>
  </div>
);
