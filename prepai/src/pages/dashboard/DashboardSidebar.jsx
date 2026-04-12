import { Link, useNavigate } from "react-router-dom";

import DashboardStatCard from "./DashboardStatCard";

const DashboardSidebar = ({ report, interviews, loading, query }) => {
  const navigate = useNavigate();
  return (
    <div className="lg:col-span-4 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <DashboardStatCard label="Sessions" value={report?.totalSessions || 0} sub="All time" color="#10b981" />
        <DashboardStatCard label="Interviews" value={interviews.length} sub="Completed" color="#06b6d4" />
        <DashboardStatCard label="Speech Fixes" value={report?.totalSpeechCorrections || 0} sub="Grammar" color="#a78bfa" />
        <DashboardStatCard
          label="Practice"
          value={report ? Math.floor((report.totalDurationSeconds || 0) / 60) + "m" : "0m"}
          sub="Minutes"
          color="#f59e0b"
        />
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div className="text-sm font-extrabold text-slate-900">Recent Interviews</div>
          <Link to="/report" className="text-xs font-bold text-emerald-600 no-underline hover:underline">
            View
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-[54px] rounded-2xl border border-slate-200 bg-slate-50 animate-pulse" />
            ))}
          </div>
        ) : interviews.length > 0 ? (
          <div className="space-y-3">
            {interviews.slice(0, 4).map((s, i) => (
              <button
                key={i}
                type="button"
                onClick={() => navigate("/report")}
                className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left transition hover:border-emerald-200 hover:bg-white"
                title="Open report card"
              >
                <div>
                  <div className="text-xs font-bold text-slate-700">{s.answers?.length || 0} questions</div>
                  <div className="mt-1 text-[11px] text-slate-500">{new Date(s.createdAt).toLocaleDateString()}</div>
                </div>
                <div className="text-sm font-black text-slate-900">{s.totalScore}/100</div>
              </button>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-500">
            {query?.trim() ? "No interviews match your search. " : "No interviews yet. "}
            <Link to="/interview" className="font-semibold text-emerald-600 no-underline hover:underline">
              Start one
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardSidebar;

