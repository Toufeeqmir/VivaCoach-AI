const average = (values) => {
  const clean = values.filter((value) => Number.isFinite(value));
  if (!clean.length) return 0;
  return Math.round(clean.reduce((sum, value) => sum + value, 0) / clean.length);
};

const clamp = (value) => Math.max(0, Math.min(100, value || 0));

const buildReadiness = (interviews) => {
  const latest = interviews?.[0];
  const answers = latest?.answers || [];
  if (!answers.length) {
    return [
      { label: "Communication", value: 0 },
      { label: "Technical depth", value: 0 },
      { label: "Grammar & clarity", value: 0 },
      { label: "Answer pacing", value: 0 },
    ];
  }

  return [
    {
      label: "Communication",
      value: average(answers.map((answer) => answer.deliveryScore || answer.confidenceScore || answer.overallScore)),
    },
    {
      label: "Technical depth",
      value: average(answers.map((answer) => average([answer.relevanceScore, answer.structureScore]))),
    },
    {
      label: "Grammar & clarity",
      value: average(answers.map((answer) => answer.grammarScore || answer.fillerScore)),
    },
    {
      label: "Answer pacing",
      value: average(answers.map((answer) => answer.speechScore || answer.wordsPerMinute)),
    },
  ];
};

const getWeekActivity = (interviews) => {
  const labels = ["M", "T", "W", "T", "F", "S", "S"];
  const today = new Date();
  const monday = new Date(today);
  const dayIndex = (today.getDay() + 6) % 7;
  monday.setDate(today.getDate() - dayIndex);
  monday.setHours(0, 0, 0, 0);

  const activeDays = new Set();
  (interviews || []).forEach((session) => {
    if (!session?.createdAt) return;
    const sessionDate = new Date(session.createdAt);
    const diff = Math.floor((sessionDate - monday) / 86400000);
    if (diff >= 0 && diff < 7) activeDays.add(diff);
  });

  return labels.map((label, index) => ({ label, active: activeDays.has(index) }));
};

const DashboardSidebar = ({ interviews }) => {
  const readiness = buildReadiness(interviews);
  const week = getWeekActivity(interviews);
  const activeCount = week.filter((day) => day.active).length;
  const hasSessions = (interviews || []).length > 0;

  return (
    <aside className="space-y-7">
      <section className="rounded-[18px] border border-[#55554f] bg-[#30312e] p-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
        <div className="mb-8 flex items-start justify-between gap-6">
          <h2 className="max-w-[170px] text-2xl font-black leading-tight text-white">Skill readiness</h2>
          <p className="max-w-[190px] text-lg font-semibold leading-tight text-[#aaa69e]">
            {hasSessions ? "Based on latest session" : "Unlocks after first session"}
          </p>
        </div>

        <div className="space-y-6">
          {readiness.map((skill) => (
            <div key={skill.label}>
              <div className="mb-3 flex items-center justify-between gap-4">
                <span className="text-xl font-semibold text-[#d5d2ca]">{skill.label}</span>
                {hasSessions && <span className="text-sm font-black text-[#aaa69e]">{clamp(skill.value)}%</span>}
              </div>
              <div className="h-2 rounded-full bg-[#232421]">
                <div
                  className="h-full rounded-full bg-[#d8d2c4] transition-all"
                  style={{ width: `${hasSessions ? clamp(skill.value) : 0}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <p className="mt-7 text-lg font-semibold leading-relaxed text-[#aaa69e]">
          {hasSessions
            ? "Keep practicing to raise each skill score across these four areas."
            : "Complete a session to see how your skills score across these four areas."}
        </p>
      </section>

      <section className="rounded-[18px] border border-[#55554f] bg-[#30312e] p-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
        <div className="mb-7 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-black text-white">Weekly streak</h2>
          <p className="text-xl font-semibold text-[#aaa69e]">{activeCount} days this week</p>
        </div>

        <div className="grid grid-cols-7 gap-3">
          {week.map((day, index) => (
            <div key={`${day.label}-${index}`} className="text-center">
              <div className="mb-3 text-base font-semibold text-[#aaa69e]">{day.label}</div>
              <div
                className={[
                  "mx-auto h-11 w-full max-w-[48px] rounded-[10px] border",
                  day.active ? "border-[#d8fff3] bg-[#d8fff3]" : "border-[#55554f] bg-[#272824]",
                ].join(" ")}
              />
            </div>
          ))}
        </div>

        <p className="mt-7 text-lg font-semibold leading-relaxed text-[#aaa69e]">
          Practice daily to build a streak. Consistent prep leads to consistent results.
        </p>
      </section>
    </aside>
  );
};

export default DashboardSidebar;
