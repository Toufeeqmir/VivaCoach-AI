import { scoreTone } from "./utils";

export const SectionCard = ({ title, subtitle, children }) => (
  <section className="rounded-[2rem] border border-slate-800 bg-[#0d1117] p-6 shadow-xl">
    <div className="mb-5">
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-400">{title}</p>
      {subtitle && <p className="mt-2 text-sm text-slate-500">{subtitle}</p>}
    </div>
    {children}
  </section>
);

export const MetricTile = ({ label, value, subtitle, suffix = "%" }) => {
  const numericValue = typeof value === "number" ? value : Number(value) || 0;
  const tone = scoreTone(numericValue);

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#050810] p-5">
      <div className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">{label}</div>
      <div className="mt-3 text-3xl font-black" style={{ color: tone.color }}>
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
    <div className="rounded-2xl border border-slate-800 bg-[#050810] p-4">
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
  <div className="rounded-2xl border border-cyan-500/15 bg-cyan-500/5 p-4">
    <div className="text-xs font-black uppercase tracking-wider text-cyan-300">{title}</div>
    <p className="mt-2 text-sm leading-relaxed text-slate-300">{body}</p>
  </div>
);

export const LoadingState = () => (
  <div className="min-h-screen bg-[#050810] px-6 py-10 text-slate-200">
    <div className="mx-auto max-w-6xl">
      <div className="flex min-h-[50vh] items-center justify-center rounded-[2rem] border border-slate-800 bg-[#0d1117]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
          <p className="text-sm text-slate-500">Loading your performance report...</p>
        </div>
      </div>
    </div>
  </div>
);

export const EmptyState = () => (
  <div className="min-h-screen bg-[#050810] px-6 py-10 text-slate-200">
    <div className="mx-auto max-w-6xl">
      <SectionCard title="Report" subtitle="Complete an interview session and this page will turn into your personal improvement dashboard.">
        <div className="rounded-[1.5rem] border border-slate-800 bg-[#050810] px-8 py-16 text-center">
          <h1 className="text-3xl font-black text-white">No interview data yet</h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-slate-500">
            Start a session, answer a few questions, and come back here to see score trends, weak areas, filler patterns, and practice suggestions.
          </p>
          <a
            href="/interview"
            className="mt-8 inline-flex rounded-xl bg-cyan-500 px-6 py-3 text-sm font-black uppercase tracking-wider text-[#050810] transition hover:bg-cyan-400"
          >
            Start interview
          </a>
        </div>
      </SectionCard>
    </div>
  </div>
);
