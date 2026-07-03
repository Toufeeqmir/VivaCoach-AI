import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { SectionCard } from "./components";
import { SCORE_METRICS, deltaTone, formatSignedPercent } from "./analytics";

const StatIcon = ({ type }) => {
  const common = {
    "aria-hidden": "true",
    viewBox: "0 0 24 24",
    className: "h-5 w-5",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };

  if (type === "trend") {
    return (
      <svg {...common}>
        <path d="M4 17 9 12l4 4 7-8" />
        <path d="M14 8h6v6" />
      </svg>
    );
  }

  if (type === "best") {
    return (
      <svg {...common}>
        <path d="M8 21h8" />
        <path d="M12 17v4" />
        <path d="M7 4h10v5a5 5 0 0 1-10 0V4Z" />
        <path d="M5 5H3v3a4 4 0 0 0 4 4" />
        <path d="M19 5h2v3a4 4 0 0 1-4 4" />
      </svg>
    );
  }

  if (type === "sessions") {
    return (
      <svg {...common}>
        <path d="M8 6h13" />
        <path d="M8 12h13" />
        <path d="M8 18h13" />
        <path d="M3 6h.01" />
        <path d="M3 12h.01" />
        <path d="M3 18h.01" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <path d="M12 3v18" />
      <path d="M3 12h18" />
      <circle cx="12" cy="12" r="7" />
    </svg>
  );
};

const StatCard = ({ icon, label, value, sub, tone = "neutral", arrow }) => {
  const toneClasses = {
    good: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
    bad: "border-red-500/20 bg-red-500/10 text-red-400",
    neutral: "border-[var(--blue-border)] bg-[var(--blue-tint)] text-[var(--blue-light)]",
  };

  return (
    <article className="min-h-[148px] rounded-[10px] border border-[var(--border)] bg-[var(--bg-secondary)] p-5 transition duration-300 hover:-translate-y-0.5 hover:border-[var(--border-strong)]">
      <div className="flex items-start justify-between gap-4">
        <span className={`inline-flex h-10 w-10 items-center justify-center rounded-[8px] border ${toneClasses[tone] || toneClasses.neutral}`}>
          <StatIcon type={icon} />
        </span>
        {arrow && (
          <span className={`inline-flex h-8 min-w-8 items-center justify-center rounded-full border px-2 text-sm font-bold ${toneClasses[tone] || toneClasses.neutral}`}>
            {arrow}
          </span>
        )}
      </div>
      <p className="mt-5 text-4xl font-bold leading-none text-white [font-variant-numeric:tabular-nums]">{value}</p>
      <div className="mt-3">
        <p className="text-sm font-semibold text-[var(--text-primary)]">{label}</p>
        {sub && <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">{sub}</p>}
      </div>
    </article>
  );
};

export const HeroSection = ({ report }) => {
  const improvementValue = report.improvement.value;
  const improvementTone = deltaTone(improvementValue || 0);
  const statTone = improvementValue > 0 ? "good" : improvementValue < 0 ? "bad" : "neutral";

  const stats = [
    {
      icon: "latest",
      label: "Latest Score",
      value: `${report.latestScore}%`,
      sub: report.latest ? "Most recent completed interview" : "No completed interview",
    },
    {
      icon: "trend",
      label: "Improvement",
      value: improvementValue === null ? "--" : formatSignedPercent(improvementValue),
      sub: improvementValue === null ? "Complete another session" : "from previous session",
      tone: statTone,
      arrow: improvementTone.arrow,
    },
    {
      icon: "best",
      label: "Best Score",
      value: `${report.bestScore}%`,
      sub: report.best ? "Highest completed session" : "No completed interview",
    },
    {
      icon: "sessions",
      label: "Total Interview Sessions",
      value: report.totalSessions,
      sub: "Completed interviews",
    },
  ];

  return (
    <section className="rounded-[10px] border border-[var(--blue-border)] border-l-[3px] border-l-[var(--blue)] bg-[var(--bg-card)] p-5 md:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="eyebrow">AI Interview Analytics</p>
          <h1 className="mt-3 text-3xl font-semibold leading-tight text-white md:text-4xl">Progress Dashboard</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--text-secondary)]">
            Track performance changes across completed interview sessions and focus your next practice round.
          </p>
        </div>
        <div className="rounded-full border border-[var(--border)] bg-[var(--bg-secondary)] px-4 py-2 text-xs font-semibold text-[var(--text-secondary)]">
          Average score: <span className="text-[var(--blue-light)]">{report.overallAverage}%</span>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} tone="neutral" {...stat} />
        ))}
      </div>
    </section>
  );
};

export const AiSummarySection = ({ report }) => {
  const lockedMessage =
    report.totalSessions <= 1 ? "Complete another interview to unlock progress insights." : report.aiSummary.bullets[0];

  return (
    <SectionCard title="AI Coach Summary" subtitle="Session-to-session interpretation based on your saved interview metrics.">
      {report.aiSummary.locked ? (
        <div className="rounded-[8px] border border-[var(--border)] bg-[var(--bg-secondary)] px-5 py-6 text-sm font-medium text-[var(--text-secondary)]">
          {lockedMessage}
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.55fr)]">
          <div className="space-y-3">
            {report.aiSummary.bullets.map((item) => (
              <p key={item} className="flex gap-3 text-sm leading-6 text-[var(--text-primary)]">
                <span className="mt-0.5 text-[var(--blue-light)]">{"\u2022"}</span>
                <span>{item}</span>
              </p>
            ))}
          </div>
          <div className="rounded-[8px] border border-[var(--blue-border)] bg-[var(--blue-tint)] p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--blue-light)]">Recommendation</p>
            <p className="mt-2 text-sm leading-6 text-[var(--text-primary)]">{report.aiSummary.recommendation}</p>
          </div>
        </div>
      )}
    </SectionCard>
  );
};

const TrendTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;

  const point = payload[0]?.payload;

  return (
    <div className="rounded-[8px] border border-[var(--border-strong)] bg-[var(--bg-secondary)] px-4 py-3 shadow-xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-white">{point?.name}</p>
          <p className="mt-0.5 text-[11px] text-[var(--text-secondary)]">{point?.date}</p>
        </div>
        {point?.isBest && (
          <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-1 text-[10px] font-bold text-amber-300">
            Best
          </span>
        )}
      </div>
      <div className="mt-3 space-y-1.5">
        {payload.map((entry) => (
          <div key={entry.dataKey} className="flex min-w-[190px] items-center justify-between gap-4 text-xs">
            <span className="flex items-center gap-2 text-[var(--text-secondary)]">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
              {entry.name}
            </span>
            <span className="font-semibold text-white">{entry.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const BestOverallDot = ({ cx, cy, payload }) => {
  if (cx === undefined || cy === undefined) return null;

  return (
    <circle
      cx={cx}
      cy={cy}
      r={payload?.isBest ? 6 : 3}
      fill={payload?.isBest ? "#fbbf24" : "#85b7eb"}
      stroke={payload?.isBest ? "#fff7ed" : "#0f1117"}
      strokeWidth={payload?.isBest ? 2 : 1}
    />
  );
};

const DeltaLabel = ({ x, y, width, height, value, payload }) => {
  const tone = deltaTone(payload?.delta || 0);
  const labelX = Number(x || 0) + Number(width || 0) + 10;
  const labelY = Number(y || 0) + Number(height || 0) / 2 + 4;

  return (
    <text x={labelX} y={labelY} fill={tone.color} fontSize={12} fontWeight={700}>
      {value}
    </text>
  );
};

const SkillComparisonTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;

  const point = payload[0]?.payload;
  const tone = deltaTone(point?.delta || 0);

  return (
    <div className="rounded-[8px] border border-[var(--border-strong)] bg-[var(--bg-secondary)] px-4 py-3 shadow-xl">
      <p className="text-xs font-semibold text-white">{point?.metric}</p>
      <div className="mt-2 space-y-1 text-xs text-[var(--text-secondary)]">
        <p>Previous Session: <span className="font-semibold text-white">{point?.previous}%</span></p>
        <p>Latest Session: <span className="font-semibold text-white">{point?.latest}%</span></p>
        <p className={tone.text}>{tone.arrow} {point?.deltaLabel}</p>
      </div>
    </div>
  );
};

export const ProgressLockedSection = () => (
  <SectionCard title="Progress Analytics" subtitle="Comparison graphs unlock after two completed interviews.">
    <div className="rounded-[8px] border border-[var(--border)] bg-[var(--bg-secondary)] px-5 py-8 text-center text-sm font-medium text-[var(--text-secondary)]">
      Complete at least two interviews to view progress analytics.
    </div>
  </SectionCard>
);

export const ComparisonSection = ({ report }) => {
  if (report.totalSessions < 2) {
    return <ProgressLockedSection />;
  }

  const skillComparisonData = report.metricsComparison.map((metric) => ({
    metric: metric.label,
    previous: metric.previous,
    latest: metric.latest,
    delta: metric.delta,
    deltaLabel: metric.deltaLabel,
  }));

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(360px,0.75fr)]">
      <SectionCard title="Session History Graph" subtitle="Overall, confidence, delivery, grammar, structure, and relevance across interview sessions.">
        <div className="mb-4 flex flex-wrap gap-3">
          {SCORE_METRICS.map((metric) => (
            <span key={metric.key} className="inline-flex items-center gap-2 text-xs text-[var(--text-secondary)]">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: metric.color }} />
              {metric.label}
            </span>
          ))}
        </div>

        <div className="h-[360px] min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={report.scoreTrend} margin={{ top: 16, right: 18, bottom: 34, left: 8 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
              <XAxis
                dataKey="shortName"
                stroke="#8a96a8"
                tickLine={false}
                axisLine={false}
                label={{ value: "Interview Sessions", position: "insideBottom", offset: -18, fill: "#8a96a8", fontSize: 12 }}
              />
              <YAxis
                domain={[0, 100]}
                stroke="#8a96a8"
                tickLine={false}
                axisLine={false}
                label={{ value: "Score (%)", angle: -90, position: "insideLeft", fill: "#8a96a8", fontSize: 12 }}
              />
              <Tooltip content={<TrendTooltip />} />
              {report.bestTrend && (
                <ReferenceLine
                  x={report.bestTrend.shortName}
                  stroke="#fbbf24"
                  strokeDasharray="4 4"
                  label={{ value: "Best", position: "insideTopRight", fill: "#fbbf24", fontSize: 12 }}
                />
              )}
              {SCORE_METRICS.map((metric) => (
                <Line
                  key={metric.key}
                  type="monotone"
                  dataKey={metric.key}
                  name={metric.label}
                  stroke={metric.color}
                  strokeWidth={metric.key === "overall" ? 3 : 2}
                  dot={metric.key === "overall" ? <BestOverallDot /> : false}
                  activeDot={{ r: 5 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </SectionCard>

      <SectionCard title="Skill Comparison" subtitle="Latest session compared with the previous completed session.">
        <div className="mb-4 flex items-center gap-3 text-xs text-[var(--text-secondary)]">
          <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-sm bg-slate-500" />Previous Session</span>
          <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-sm bg-[var(--blue)]" />Latest Session</span>
        </div>
        <div className="h-[360px] min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={skillComparisonData}
              layout="vertical"
              margin={{ top: 12, right: 54, bottom: 10, left: 8 }}
              barGap={4}
              barCategoryGap={18}
            >
              <CartesianGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} stroke="#8a96a8" tickLine={false} axisLine={false} />
              <YAxis
                type="category"
                dataKey="metric"
                width={88}
                stroke="#8a96a8"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12 }}
              />
              <Tooltip content={<SkillComparisonTooltip />} />
              <Bar dataKey="previous" name="Previous Session" fill="#64748b" radius={[0, 6, 6, 0]} barSize={8} />
              <Bar dataKey="latest" name="Latest Session" fill="#378add" radius={[0, 6, 6, 0]} barSize={8}>
                <LabelList dataKey="deltaLabel" content={<DeltaLabel />} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </SectionCard>
    </div>
  );
};

const SignalList = ({ items, variant }) => {
  const isStrength = variant === "strength";
  const emptyText = isStrength
    ? "No skill is above the strength threshold yet."
    : "No urgent weak spot is below the improvement threshold.";

  if (!items.length) {
    return <p className="text-sm leading-6 text-[var(--text-secondary)]">{emptyText}</p>;
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.key} className="flex items-center justify-between gap-3 rounded-[8px] border border-[var(--border)] bg-[var(--bg-secondary)] px-4 py-3">
          <span className="flex min-w-0 items-center gap-3 text-sm font-medium text-[var(--text-primary)]">
            <span className={isStrength ? "text-emerald-400" : "text-[var(--text-secondary)]"}>
              {isStrength ? "\u2713" : "\u2022"}
            </span>
            <span className="truncate">{item.label}</span>
          </span>
          <span className={`rounded-full border px-2 py-1 text-xs font-bold ${isStrength ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400" : "border-red-500/20 bg-red-500/10 text-red-400"}`}>
            {item.value}%
          </span>
        </div>
      ))}
    </div>
  );
};

export const StrengthsWeaknessesSection = ({ report }) => (
  <div className="grid gap-5 lg:grid-cols-2">
    <SectionCard title="Strengths" subtitle="Automatically selected from latest-session skills scoring 75% or higher.">
      <SignalList items={report.strengths} variant="strength" />
    </SectionCard>
    <SectionCard title="Needs Improvement" subtitle="Automatically selected from latest-session skills below 65%.">
      <SignalList items={report.weaknesses} variant="weakness" />
    </SectionCard>
  </div>
);
