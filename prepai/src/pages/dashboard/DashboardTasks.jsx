import { Link } from "react-router-dom";

const actions = [
  { title: "Live mock interview", desc: "Timed questions in a realistic interview flow", to: "/interview?mode=live", code: "LM" },
  { title: "Practice interview", desc: "Answer without time pressure and review feedback", to: "/interview?mode=practice", code: "PI" },
  { title: "AI coach", desc: "Work through communication and confidence drills", to: "/coach", code: "AI" },
  { title: "Expression lab", desc: "Practice non-verbal presence with live signals", to: "/session", code: "EX" },
];

const DashboardTasks = () => (
  <section className="section-card">
    <div className="mb-4 flex items-center justify-between gap-3">
      <div>
        <h2 className="text-sm font-semibold text-white">Quick actions</h2>
        <p className="mt-1 text-[11px] text-[var(--text-muted)]">Choose a focused practice mode</p>
      </div>
      <span className="ui-badge text-[9px]">Practice</span>
    </div>
    <div className="divide-y divide-[var(--border)] border-y border-[var(--border)]">
      {actions.map((action) => (
        <Link key={action.title} to={action.to} className="group flex items-center gap-3 py-4 no-underline">
          <span className="icon-tile shrink-0">{action.code}</span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-white">{action.title}</p>
            <p className="mt-1 truncate text-[11px] text-[var(--text-secondary)]">{action.desc}</p>
          </div>
          <span className="text-sm text-[var(--text-muted)] transition group-hover:text-[var(--blue-light)]">→</span>
        </Link>
      ))}
    </div>
  </section>
);

export default DashboardTasks;
