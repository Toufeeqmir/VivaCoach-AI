export const average = (values) => {
  const clean = values.filter(Number.isFinite);
  return clean.length ? Math.round(clean.reduce((sum, value) => sum + value, 0) / clean.length) : 0;
};

export const buildReadiness = (interviews) => {
  const answers = interviews?.[0]?.answers || [];
  if (!answers.length) {
    return [
      { label: "Communication", value: 0 },
      { label: "Technical depth", value: 0 },
      { label: "Grammar & clarity", value: 0 },
      { label: "Answer pacing", value: 0 },
    ];
  }

  return [
    { label: "Communication", value: average(answers.map((answer) => answer.deliveryScore || answer.confidenceScore || answer.overallScore)) },
    { label: "Technical depth", value: average(answers.map((answer) => average([answer.relevanceScore, answer.structureScore]))) },
    { label: "Grammar & clarity", value: average(answers.map((answer) => answer.grammarScore || answer.fillerScore)) },
    { label: "Answer pacing", value: average(answers.map((answer) => answer.speechScore || answer.wordsPerMinute)) },
  ];
};

export const getWeekActivity = (interviews) => {
  const labels = ["M", "T", "W", "T", "F", "S", "S"];
  const monday = new Date();
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  monday.setHours(0, 0, 0, 0);
  const activeDays = new Set();
  (interviews || []).forEach((session) => {
    if (!session?.createdAt) return;
    const diff = Math.floor((new Date(session.createdAt) - monday) / 86400000);
    if (diff >= 0 && diff < 7) activeDays.add(diff);
  });
  return labels.map((label, index) => ({ label, active: activeDays.has(index) }));
};

const DashboardSidebar = ({ interviews }) => {
  const readiness = buildReadiness(interviews);
  const week = getWeekActivity(interviews);
  const hasSessions = Boolean(interviews?.length);

  return (
    <aside className="space-y-4">
      <section className="section-card">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold leading-[1.25] tracking-[0] text-white">Skill readiness</h2>
            <p className="mt-1.5 text-[15px] font-normal leading-6 tracking-[0] text-[var(--text-secondary)]">{hasSessions ? "Based on your latest session" : "Unlocks after your first session"}</p>
          </div>
          <span className="ui-badge text-sm leading-5 tracking-[0.01em]">Latest</span>
        </div>
        <div className="space-y-4">
          {readiness.map((skill) => (
            <div key={skill.label}>
              <div className="mb-2 flex items-center justify-between text-sm font-normal leading-5 tracking-[0]">
                <span className="text-[var(--text-secondary)]">{skill.label}</span>
                <span className="font-medium text-[var(--blue-light)] [font-variant-numeric:tabular-nums]">{hasSessions ? Math.min(100, skill.value) : 0}%</span>
              </div>
              <div className="h-1 overflow-hidden rounded-full bg-[var(--bg-raised)]">
                <div className="h-full rounded-full bg-[var(--blue)]" style={{ width: `${hasSessions ? Math.min(100, skill.value) : 0}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section-card">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold leading-[1.25] tracking-[0] text-white">Weekly activity</h2>
            <p className="mt-1.5 text-[15px] font-normal leading-6 tracking-[0] text-[var(--text-secondary)]">Small sessions, consistent progress</p>
          </div>
          <span className="text-base font-semibold leading-6 tracking-[0] text-[var(--blue-light)] [font-variant-numeric:tabular-nums]">{week.filter((day) => day.active).length}/7</span>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {week.map((day, index) => (
            <div key={`${day.label}-${index}`} className="text-center">
              <p className="mb-2 text-sm font-normal leading-5 tracking-[0.01em] text-[var(--text-secondary)]">{day.label}</p>
              <div className={day.active ? "h-8 rounded-[6px] border border-[var(--blue)] bg-[var(--blue)]" : "h-8 rounded-[6px] border border-[var(--border)] bg-[var(--bg-secondary)]"} />
            </div>
          ))}
        </div>
      </section>
    </aside>
  );
};

export default DashboardSidebar;
