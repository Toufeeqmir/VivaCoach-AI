import { Link } from "react-router-dom";
import { dashboardActions } from "./DashboardTasks";

const statMeta = [
  { icon: "01", label: "Sessions" },
  { icon: "02", label: "Interviews" },
  { icon: "03", label: "Grammar" },
  { icon: "04", label: "Time" },
];

const actionIconMap = {
  LM: "MI",
  PI: "PI",
  AI: "AI",
  EX: "EX",
};

const skillIconMap = {
  Communication: "CM",
  "Technical depth": "TD",
  "Grammar & clarity": "GC",
  "Answer pacing": "AP",
};

const formatGreetingLabel = (greeting) =>
  greeting
    .split(" ")
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(" ");

const formatPracticeTime = (minutes) => {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  return remaining ? `${hours}h ${remaining}m` : `${hours}h`;
};

const getCurrentStreak = (week) => {
  const todayIndex = (new Date().getDay() + 6) % 7;
  let streak = 0;

  for (let index = todayIndex; index >= 0; index -= 1) {
    if (!week[index]?.active) break;
    streak += 1;
  }

  return streak;
};

const MobileSectionHeading = ({ title, eyebrow }) => (
  <div className="mb-4">
    <h2 className="text-2xl font-semibold leading-[1.25] tracking-[0] text-white">{title}</h2>
    {eyebrow && <p className="mt-1.5 text-base leading-6 text-[var(--text-secondary)]">{eyebrow}</p>}
  </div>
);

const MobileStatCard = ({ stat, index }) => {
  const meta = statMeta[index] || statMeta[0];

  return (
    <article className="min-w-0 rounded-[20px] border border-[var(--border)] bg-[var(--bg-card)] p-5 shadow-[0_18px_40px_rgba(0,0,0,0.22)] transition duration-300 hover:-translate-y-0.5 hover:border-[var(--border-strong)] active:scale-[0.98]">
      <span className="inline-flex h-11 w-11 items-center justify-center rounded-[14px] border border-[var(--blue-border)] bg-[var(--blue-tint)] text-sm font-semibold leading-none tracking-[0.01em] text-[var(--blue-light)]">
        {meta.icon}
      </span>
      <p className="mt-5 text-[46px] font-bold leading-none tracking-[0] text-white [font-variant-numeric:tabular-nums]">{stat.value}</p>
      <p className="mt-3 text-[17px] font-medium leading-6 tracking-[0] text-[var(--text-primary)]">{stat.label}</p>
      <p className="mt-1 text-sm font-normal leading-5 tracking-[0] text-[var(--text-secondary)]">{stat.sub}</p>
    </article>
  );
};

const MobileQuickActions = () => (
  <section>
    <MobileSectionHeading title="Quick actions" eyebrow="Choose a focused practice mode" />
    <div className="space-y-4">
      {dashboardActions.map((action) => (
        <Link
          key={action.title}
          to={action.to}
          className="group flex min-h-[88px] items-center gap-4 rounded-[20px] border border-[var(--border)] bg-[var(--bg-card)] p-5 no-underline shadow-[0_18px_40px_rgba(0,0,0,0.2)] transition duration-300 hover:-translate-y-0.5 hover:border-[var(--border-strong)] active:scale-[0.98]"
        >
          <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] border border-[var(--blue-border)] bg-[var(--blue-tint)] text-sm font-semibold text-[var(--blue-light)]">
            {actionIconMap[action.code] || action.code}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[17px] font-medium leading-6 tracking-[0] text-white">{action.title}</span>
            <span className="mt-1 block text-base font-normal leading-[1.55] tracking-[0] text-[var(--text-secondary)]">
              {action.mobileDesc || action.desc}
            </span>
          </span>
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--border)] text-base text-[var(--text-secondary)] transition duration-200 group-hover:border-[var(--blue-border)] group-hover:text-[var(--blue-light)]">
            &rarr;
          </span>
        </Link>
      ))}
    </div>
  </section>
);

const MobileSkillReadiness = ({ readiness, hasSessions }) => (
  <section className="rounded-[20px] border border-[var(--border)] bg-[var(--bg-card)] p-5 shadow-[0_18px_40px_rgba(0,0,0,0.22)]">
    <MobileSectionHeading
      title="Skill readiness"
      eyebrow={hasSessions ? "Based on your latest session" : "Unlocks after your first session"}
    />
    <div className="space-y-5">
      {readiness.map((skill) => {
        const value = hasSessions ? Math.min(100, skill.value) : 0;
        return (
          <div key={skill.label}>
            <div className="mb-2.5 flex items-center gap-3">
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] border border-[var(--blue-border)] bg-[var(--blue-tint)] text-xs font-semibold text-[var(--blue-light)]">
                {skillIconMap[skill.label] || "SK"}
              </span>
              <span className="min-w-0 flex-1 text-base font-medium leading-6 text-[var(--text-primary)]">{skill.label}</span>
              <span className="text-sm font-semibold leading-5 text-[var(--blue-light)] [font-variant-numeric:tabular-nums]">{value}%</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-[var(--bg-raised)]">
              <div className="mobile-progress-fill h-full rounded-full bg-[var(--blue)]" style={{ width: `${value}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  </section>
);

const MobileMetric = ({ label, value }) => (
  <div className="rounded-[18px] border border-[var(--border)] bg-[var(--bg-secondary)] p-4">
    <p className="text-2xl font-semibold leading-none text-white [font-variant-numeric:tabular-nums]">{value}</p>
    <p className="mt-2 text-sm leading-5 text-[var(--text-secondary)]">{label}</p>
  </div>
);

const MobileWeeklyActivity = ({ week, totalMinutes, sessionsCompleted }) => {
  const activeDays = week.filter((day) => day.active).length;
  const consistencyScore = Math.round((activeDays / 7) * 100);
  const currentStreak = getCurrentStreak(week);

  return (
    <section className="rounded-[20px] border border-[var(--border)] bg-[var(--bg-card)] p-5 shadow-[0_18px_40px_rgba(0,0,0,0.22)]">
      <div className="mb-5 flex items-start justify-between gap-4">
        <MobileSectionHeading title="Weekly activity" eyebrow="Momentum across this week" />
        <span className="rounded-full border border-[var(--blue-border)] bg-[var(--blue-tint)] px-3 py-1 text-sm font-semibold leading-5 text-[var(--blue-light)] [font-variant-numeric:tabular-nums]">
          {activeDays}/7
        </span>
      </div>

      <div className="mb-5 flex min-h-[76px] items-end gap-2 rounded-[18px] border border-[var(--border)] bg-[var(--bg-secondary)] p-4">
        {week.map((day, index) => (
          <div key={`${day.label}-${index}`} className="flex min-w-0 flex-1 flex-col items-center gap-2">
            <div
              className={[
                "w-full rounded-full transition-all duration-300",
                day.active ? "bg-[var(--blue)]" : "bg-[var(--bg-raised)]",
              ].join(" ")}
              style={{ height: day.active ? `${28 + index * 2}px` : "14px" }}
            />
            <span className="text-xs font-medium leading-none text-[var(--text-secondary)]">{day.label}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <MobileMetric label="Consistency score" value={`${consistencyScore}%`} />
        <MobileMetric label="Practice time" value={formatPracticeTime(totalMinutes)} />
        <MobileMetric label="Sessions completed" value={sessionsCompleted} />
        <MobileMetric label="Current streak" value={`${currentStreak}d`} />
      </div>
    </section>
  );
};

const DashboardMobile = ({
  firstName,
  formatToday,
  greeting,
  stats,
  readiness,
  week,
  totalMinutes,
  sessionsCompleted,
  hasSessions,
}) => (
  <div className="mobile-dashboard-enter max-w-full overflow-x-hidden px-4 pb-28 pt-4 md:px-6">
    <section className="relative overflow-hidden rounded-[20px] border border-[var(--border-strong)] bg-[var(--bg-card)] p-5 shadow-[0_20px_48px_rgba(0,0,0,0.28)]">
      <div className="pointer-events-none absolute right-[-34px] top-6 h-32 w-36 rotate-[-14deg] rounded-[24px] border border-[var(--blue-border)] bg-[linear-gradient(135deg,var(--blue-tint),transparent)] opacity-90" />
      <div className="pointer-events-none absolute right-6 top-14 h-20 w-24 rotate-[-14deg] rounded-[18px] border border-[var(--border-strong)] bg-[var(--bg-raised)]/60" />
      <div className="relative z-10">
        <p className="flex flex-wrap items-center gap-2 text-sm font-normal leading-5 tracking-[0.01em] text-[var(--text-secondary)]">
          <span>{formatToday()}</span>
          <span aria-hidden="true">&bull;</span>
          <span>{formatGreetingLabel(greeting)}</span>
        </p>
        <h1 className="mt-4 max-w-[280px] text-[32px] font-bold leading-[1.1] tracking-[0] text-white">
          Ready to practice, {firstName}?
        </h1>
        <p className="mt-4 max-w-[310px] text-[17px] font-normal leading-[1.6] tracking-[0] text-[var(--text-secondary)]">
          Your prep workspace is ready. Start another round or review your progress.
        </p>
        <div className="mt-6 flex flex-col gap-3 min-[380px]:flex-row min-[380px]:flex-wrap">
          <Link to="/interview?mode=live" className="ui-btn-primary min-h-11 rounded-[14px] px-5 text-base font-semibold leading-6 no-underline">
            Start Session
          </Link>
          <Link to="/report" className="ui-btn-ghost min-h-11 rounded-[14px] px-5 text-base font-semibold leading-6 no-underline">
            View Report
          </Link>
        </div>
      </div>
    </section>

    <section className="mt-5 grid grid-cols-2 gap-4">
      {stats.map((stat, index) => (
        <MobileStatCard key={stat.label} stat={stat} index={index} />
      ))}
    </section>

    <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
      <MobileQuickActions />
      <div className="space-y-5">
        <MobileSkillReadiness readiness={readiness} hasSessions={hasSessions} />
        <MobileWeeklyActivity week={week} totalMinutes={totalMinutes} sessionsCompleted={sessionsCompleted} />
      </div>
    </div>
  </div>
);

export default DashboardMobile;
