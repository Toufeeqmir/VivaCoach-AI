import { Link } from "react-router-dom";

const quickActions = [
  {
    title: "Live mock interview",
    desc: "Timed questions, auto-submits at zero",
    to: "/interview?mode=live",
    badge: "Live",
    active: true,
  },
  {
    title: "Practice interview",
    desc: "No timer - type or speak freely",
    to: "/interview?mode=practice",
  },
  {
    title: "Report card",
    desc: "Scores, trends and weak spots",
    to: "/report",
  },
  {
    title: "AI coach",
    desc: "Personalised tips to improve faster",
    to: "/coach",
  },
];

const ActionGlyph = ({ active = false }) => (
  <span
    className={[
      "flex h-14 w-14 shrink-0 items-center justify-center rounded-[12px]",
      active ? "bg-[#30312e] text-[#d8fff3]" : "bg-[#242521] text-[#d0ccc2]",
    ].join(" ")}
  >
    <span className="h-4 w-4 rounded-[3px] border border-current" />
  </span>
);

const QuickActionCard = ({ title, desc, to, badge, active }) => (
  <Link
    to={to}
    className={[
      "group flex min-h-[110px] items-center gap-5 rounded-[14px] border p-5 no-underline transition",
      active
        ? "border-[#10100f] bg-[#10100f] text-white"
        : "border-[#55554f] bg-transparent text-white hover:border-[#d8d2c4] hover:bg-[#292a27]",
    ].join(" ")}
  >
    <ActionGlyph active={active} />
    <div className="min-w-0 flex-1">
      <div className="text-xl font-black leading-tight text-white">{title}</div>
      <div className="mt-1 text-lg font-semibold leading-tight text-[#aaa69e]">{desc}</div>
    </div>
    {badge && (
      <span className="shrink-0 rounded-full bg-[#dffff8] px-4 py-1 text-base font-black text-[#126f5b]">{badge}</span>
    )}
    <span className="ml-auto hidden h-4 w-4 shrink-0 rounded-[3px] border border-[#77756e] sm:block" />
  </Link>
);

const DashboardTasks = () => (
  <section className="min-h-[620px] rounded-[18px] border border-[#55554f] bg-[#30312e] p-7 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
    <div className="mb-7 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <h2 className="text-2xl font-black text-white">Quick actions</h2>
      <p className="text-xl font-semibold text-[#aaa69e]">Pick a mode to start</p>
    </div>
    <div className="space-y-4">
      {quickActions.map((action) => (
        <QuickActionCard key={action.title} {...action} />
      ))}
    </div>
  </section>
);

export default DashboardTasks;
