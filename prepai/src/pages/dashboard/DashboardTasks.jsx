import { Link } from "react-router-dom";

const QuickActionCard = ({ title, desc, to, accent = "emerald" }) => {
  const accentClasses =
    accent === "cyan"
      ? "hover:border-cyan-200 hover:shadow-[0_0_0_4px_rgba(34,211,238,0.10)]"
      : accent === "violet"
        ? "hover:border-violet-200 hover:shadow-[0_0_0_4px_rgba(167,139,250,0.10)]"
        : accent === "amber"
          ? "hover:border-amber-200 hover:shadow-[0_0_0_4px_rgba(245,158,11,0.10)]"
          : "hover:border-emerald-200 hover:shadow-[0_0_0_4px_rgba(16,185,129,0.10)]";

  return (
    <Link
      to={to}
      className={`group block rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md no-underline ${accentClasses}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-sm font-extrabold text-slate-900">{title}</div>
          <div className="mt-1 text-xs text-slate-500">{desc}</div>
        </div>
        <div className="shrink-0 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-extrabold text-slate-700 transition group-hover:bg-white">
          Open →
        </div>
      </div>
    </Link>
  );
};

const DashboardTasks = () => {
  return (
    <div className="lg:col-span-8 space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <div className="text-xs font-extrabold uppercase tracking-widest text-slate-500">Quick actions</div>
          <div className="mt-1 text-sm font-semibold text-slate-700">Jump back into practice.</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <QuickActionCard
          title="Start Live Mock Interview"
          desc="Timed questions + auto-submit at 0s."
          to="/interview?mode=live"
          accent="amber"
        />
        <QuickActionCard
          title="Start Practice Interview"
          desc="No time pressure. Use voice or type."
          to="/interview?mode=practice"
          accent="emerald"
        />
        <QuickActionCard title="Open Report Card" desc="View sessions, trends, and breakdowns." to="/report" accent="cyan" />
        <QuickActionCard title="Open Coach" desc="Get guided improvement tips and practice." to="/coach" accent="violet" />
        <QuickActionCard title="Open Session Tools" desc="Go to session page." to="/session" accent="emerald" />
      </div>
    </div>
  );
};

export default DashboardTasks;

