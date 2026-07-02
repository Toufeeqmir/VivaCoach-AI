import { Link } from "react-router-dom";

export const dashboardActions = [
  { title: "Live mock interview", desc: "Timed questions in a realistic interview flow", mobileDesc: "Timed interview in realistic conditions", to: "/interview?mode=live", code: "LM" },
  { title: "Practice interview", desc: "Answer without time pressure and review feedback", mobileDesc: "Practice without time pressure", to: "/interview?mode=practice", code: "PI" },
  { title: "AI coach", desc: "Work through communication and confidence drills", mobileDesc: "Communication and confidence coaching", to: "/coach", code: "AI" },
  { title: "Expression lab", desc: "Practice non-verbal presence with live signals", mobileDesc: "Practice body language with live feedback", to: "/session", code: "EX" },
];

const DashboardTasks = () => (
  <section className="section-card">
    <div className="mb-4 flex items-center justify-between gap-3">
      <div>
        <h2 className="text-2xl font-semibold leading-[1.25] tracking-[0] text-white">Quick actions</h2>
        <p className="mt-1.5 text-[15px] font-normal leading-6 tracking-[0] text-[var(--text-secondary)]">Choose a focused practice mode</p>
      </div>
      <span className="ui-badge text-sm leading-5 tracking-[0.01em]">Practice</span>
    </div>
    <div className="divide-y divide-[var(--border)] border-y border-[var(--border)]">
      {dashboardActions.map((action) => (
        <Link key={action.title} to={action.to} className="group flex items-center gap-3 py-4 no-underline">
          <span className="icon-tile shrink-0 text-sm leading-none tracking-[0.01em]">{action.code}</span>
          <div className="min-w-0 flex-1">
            <p className="text-base font-medium leading-6 tracking-[0] text-white">{action.title}</p>
            <p className="mt-1 truncate text-[15px] font-normal leading-6 tracking-[0] text-[var(--text-secondary)]">{action.desc}</p>
          </div>
          <span className="text-base leading-6 text-[var(--text-secondary)] transition group-hover:text-[var(--blue-light)]">→</span>
        </Link>
      ))}
    </div>
  </section>
);

export default DashboardTasks;
