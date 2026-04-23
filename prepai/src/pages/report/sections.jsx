import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { MetricTile, RecommendationCard, SectionCard, SkillMeter } from "./components";
import { EMOTION_COLORS, formatDate } from "./utils";

const TrendPill = ({ item }) => {
  const pillClass =
    item.direction === "up"
      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
      : item.direction === "down"
        ? "border-red-500/20 bg-red-500/10 text-red-400"
        : "border-slate-700 bg-slate-800/60 text-slate-400";

  const deltaLabel = `${item.delta > 0 ? "+" : ""}${item.delta}`;

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#050810] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">{item.label}</div>
          <div className="mt-2 text-2xl font-black text-white">
            {item.value}
            {item.suffix ?? "%"}
          </div>
        </div>
        <span className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-wider ${pillClass}`}>
          {item.direction === "up" ? "Up" : item.direction === "down" ? "Down" : "Flat"} {deltaLabel}
        </span>
      </div>

      <p className="mt-3 text-xs text-slate-500">
        Previous: {item.baseline}
        {item.suffix ?? "%"}
      </p>
    </div>
  );
};

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#050810] px-4 py-3 shadow-xl">
      <div className="text-xs font-black uppercase tracking-[0.25em] text-slate-500">{label}</div>
      <div className="mt-2 space-y-1">
        {payload.map((entry) => (
          <div key={entry.dataKey} className="flex items-center justify-between gap-4 text-xs">
            <span style={{ color: entry.color }}>{entry.name}</span>
            <span className="font-bold text-white">{entry.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const HeroSection = ({ interviews, answers, overallAverage, thisWeekAverage, scoreDelta }) => (
  <section className="rounded-[2.5rem] border border-cyan-500/15 bg-[radial-gradient(circle_at_top_left,_rgba(6,182,212,0.16),_transparent_45%),_#0d1117] p-8 shadow-2xl">
    <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-2xl">
        <p className="text-[10px] font-black uppercase tracking-[0.35em] text-cyan-300">Performance report</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-white">Progress that tells you what to practice next</h1>
        <p className="mt-4 text-sm leading-relaxed text-slate-400">
          This report now highlights your strongest skills, weakest patterns, and the next drills most likely to improve your mock interview scores.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <MetricTile label="Sessions" value={interviews.length} subtitle="Completed interviews" suffix="" />
        <MetricTile label="Average" value={overallAverage} subtitle="All completed sessions" />
        <MetricTile
          label="This week"
          value={thisWeekAverage}
          subtitle={scoreDelta === 0 ? "No change vs last week" : `${scoreDelta > 0 ? "+" : ""}${scoreDelta}% vs last week`}
        />
        <MetricTile label="Questions" value={answers.length} subtitle="Answers analyzed" suffix="" />
      </div>
    </div>
  </section>
);

export const SkillSummarySection = ({ skillSummary, strongestSkill, weakestSkill }) => (
  <SectionCard title="Skill summary" subtitle="Averages across every answer you submitted, with the strongest and weakest areas surfaced first.">
    <div className="grid gap-4 md:grid-cols-2">
      {skillSummary.map((metric) => (
        <SkillMeter key={metric.key} label={metric.label} value={metric.value} />
      ))}
    </div>

    <div className="mt-6 grid gap-4 md:grid-cols-2">
      <div className="rounded-2xl border border-emerald-500/15 bg-emerald-500/5 p-5">
        <div className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-300">Strongest area</div>
        <div className="mt-3 text-2xl font-black text-white">{strongestSkill?.label || "Not enough data"}</div>
        <p className="mt-2 text-sm text-slate-400">
          {strongestSkill ? `${strongestSkill.value}% average. Keep this stable while you lift weaker skills.` : "Complete a few more answers to unlock this insight."}
        </p>
      </div>

      <div className="rounded-2xl border border-red-500/15 bg-red-500/5 p-5">
        <div className="text-[10px] font-black uppercase tracking-[0.25em] text-red-300">Main growth area</div>
        <div className="mt-3 text-2xl font-black text-white">{weakestSkill?.label || "Not enough data"}</div>
        <p className="mt-2 text-sm text-slate-400">
          {weakestSkill ? `${weakestSkill.value}% average. This is the highest-leverage place to practice next.` : "Complete a few more answers to unlock this insight."}
        </p>
      </div>
    </div>
  </SectionCard>
);

export const PracticeSection = ({ shownRecommendations, topFillers, topFocuses }) => (
  <SectionCard title="Practice next" subtitle="Personalized drills generated from your weak metrics, repeated filler words, and common coaching focus.">
    <div className="space-y-4">
      {shownRecommendations.map((item) => (
        <RecommendationCard key={item.title} title={item.title} body={item.body} />
      ))}
      {!shownRecommendations.length && (
        <div className="rounded-2xl border border-slate-800 bg-[#050810] p-5 text-sm text-slate-500">
          More answer data is needed before this page can suggest a reliable practice plan.
        </div>
      )}
    </div>

    <div className="mt-6 space-y-4">
      <div className="rounded-2xl border border-slate-800 bg-[#050810] p-5">
        <div className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">Top filler words</div>
        <div className="mt-3 flex flex-wrap gap-2">
          {topFillers.length ? topFillers.map(([word, count]) => (
            <span key={word} className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300">
              {word} x{count}
            </span>
          )) : (
            <span className="text-sm text-slate-500">No strong filler pattern detected yet.</span>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-[#050810] p-5">
        <div className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">Most common coaching focus</div>
        <div className="mt-3 space-y-2">
          {topFocuses.length ? topFocuses.map(([focus, count]) => (
            <div key={focus} className="flex items-center justify-between gap-3 text-sm">
              <span className="text-slate-300">{focus}</span>
              <span className="text-slate-500">{count} answers</span>
            </div>
          )) : (
            <span className="text-sm text-slate-500">Adaptive focus data will appear after more answers.</span>
          )}
        </div>
      </div>
    </div>
  </SectionCard>
);

export const MomentumSection = ({ latestSession, bestSession, thisWeekAverage, lastWeekAverage, scoreDelta }) => (
  <SectionCard title="Momentum" subtitle="Quick context on your recent performance so you can see whether you are moving in the right direction.">
    <div className="grid gap-4 md:grid-cols-2">
      <div className="rounded-2xl border border-slate-800 bg-[#050810] p-5">
        <div className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">Latest session</div>
        <div className="mt-3 text-3xl font-black text-white">{latestSession?.totalScore || 0}%</div>
        <p className="mt-2 text-sm text-slate-500">
          {latestSession ? `${formatDate(latestSession.createdAt)} · ${latestSession.answers?.length || 0} answers` : "No recent session available."}
        </p>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-[#050810] p-5">
        <div className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">Best session</div>
        <div className="mt-3 text-3xl font-black text-white">{bestSession?.totalScore || 0}%</div>
        <p className="mt-2 text-sm text-slate-500">
          {bestSession ? `${formatDate(bestSession.createdAt)} · peak performance so far` : "No session data available."}
        </p>
      </div>
    </div>

    <div className="mt-6 rounded-2xl border border-slate-800 bg-[#050810] p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">Weekly comparison</div>
          <p className="mt-2 text-sm text-slate-400">This week vs last week average interview score.</p>
        </div>
        <span className={`rounded-full border px-3 py-1 text-xs font-bold ${scoreDelta >= 0 ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400" : "border-red-500/20 bg-red-500/10 text-red-400"}`}>
          {scoreDelta >= 0 ? "+" : ""}{scoreDelta}%
        </span>
      </div>

      <div className="mt-5 space-y-4">
        <div>
          <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
            <span>This week</span>
            <span>{thisWeekAverage}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-900">
            <div className="h-full rounded-full bg-cyan-500" style={{ width: `${thisWeekAverage}%` }} />
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
            <span>Last week</span>
            <span>{lastWeekAverage}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-900">
            <div className="h-full rounded-full bg-slate-500" style={{ width: `${lastWeekAverage}%` }} />
          </div>
        </div>
      </div>
    </div>
  </SectionCard>
);

export const PresenceSection = ({ emotionTotals, totalEmotionSignals, dominantEmotion }) => (
  <SectionCard title="Presence" subtitle="A softer view of how your visible emotional signals show up across completed interview answers.">
    <div className="grid gap-3 md:grid-cols-2">
      {Object.entries(emotionTotals).map(([emotion, count]) => {
        const percent = totalEmotionSignals ? ((count / totalEmotionSignals) * 100).toFixed(1) : "0.0";
        return (
          <div key={emotion} className="rounded-2xl border border-slate-800 bg-[#050810] p-4">
            <div className="mb-2 flex items-center justify-between gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{emotion}</span>
              <span className="text-sm font-bold" style={{ color: EMOTION_COLORS[emotion] }}>{percent}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-900">
              <div className="h-full rounded-full" style={{ width: `${percent}%`, backgroundColor: EMOTION_COLORS[emotion] }} />
            </div>
          </div>
        );
      })}
    </div>

    <div className="mt-6 rounded-2xl border border-slate-800 bg-[#050810] p-5">
      <div className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">Dominant visible pattern</div>
      <div className="mt-3 text-2xl font-black text-white capitalize">{dominantEmotion?.[0] || "neutral"}</div>
      <p className="mt-2 text-sm text-slate-500">
        {dominantEmotion && totalEmotionSignals
          ? `Detected in ${((dominantEmotion[1] / totalEmotionSignals) * 100).toFixed(1)}% of all saved emotion signals.`
          : "More emotion data is needed for a stable read."}
      </p>
    </div>
  </SectionCard>
);

export const ComparisonSection = ({ comparisonSummary, scoreTrend }) => {
  const { latestSession, previousSession, bestSession, latestVsPrevious, latestVsBest, narrative } = comparisonSummary;

  const metricChartData = (previousSession ? latestVsPrevious : latestVsBest)
    .filter((item) => item.key !== "fillerWordCount")
    .map((item) => ({
      metric: item.label,
      latest: item.value,
      baseline: item.baseline,
    }));

  return (
    <SectionCard title="Progress comparison" subtitle="See whether your latest interview moved up or down against your previous session and your best performance so far.">
      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[1.75rem] border border-cyan-500/15 bg-[radial-gradient(circle_at_top_left,_rgba(6,182,212,0.12),_transparent_40%),_#050810] p-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.25em] text-cyan-300">
              Latest: {latestSession?.totalScore || 0}%
            </span>
            <span className="rounded-full border border-slate-700 px-3 py-1 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
              {previousSession ? `Previous: ${previousSession.totalScore || 0}%` : "Previous: N/A"}
            </span>
            <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.25em] text-amber-300">
              Best: {bestSession?.totalScore || 0}%
            </span>
          </div>

          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-slate-300">{narrative}</p>

          <div className="mt-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={scoreTrend} margin={{ top: 10, right: 12, left: -18, bottom: 0 }}>
                <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
                <XAxis dataKey="name" stroke="#64748b" tickLine={false} axisLine={false} />
                <YAxis domain={[0, 100]} stroke="#64748b" tickLine={false} axisLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Line type="monotone" dataKey="score" name="Overall" stroke="#22d3ee" strokeWidth={3} dot={{ r: 4, fill: "#22d3ee" }} />
                <Line type="monotone" dataKey="confidence" name="Confidence" stroke="#f59e0b" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="delivery" name="Delivery" stroke="#34d399" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-slate-800 bg-[#050810] p-6">
          <div className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">
            {previousSession ? "Latest vs previous" : "Latest vs best"}
          </div>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metricChartData} margin={{ top: 10, right: 10, left: -24, bottom: 18 }}>
                <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="metric"
                  stroke="#64748b"
                  tickLine={false}
                  axisLine={false}
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                  height={60}
                />
                <YAxis domain={[0, 100]} stroke="#64748b" tickLine={false} axisLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="latest" name="Latest" fill="#22d3ee" radius={[6, 6, 0, 0]} />
                <Bar dataKey="baseline" name={previousSession ? "Previous" : "Best"} fill="#64748b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {(latestVsPrevious.length ? latestVsPrevious : latestVsBest).map((item) => (
          <TrendPill key={item.key} item={item} />
        ))}
      </div>
    </SectionCard>
  );
};
