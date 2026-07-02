import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import API from "../../api";

import DashboardHeader from "./DashboardHeader";
import DashboardSidebar from "./DashboardSidebar";
import DashboardStatCard from "./DashboardStatCard";
import DashboardTasks from "./DashboardTasks";

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

const formatToday = () =>
  new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());

const Dashboard = () => {
  const { user } = useAuth();
  const [report, setReport] = useState(null);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reportRes, sessionsRes, interviewsRes] = await Promise.all([
          API.get("/sessions/report"),
          API.get("/sessions"),
          API.get("/interview/history"),
        ]);
        setReport(reportRes.data.report || {});
        void sessionsRes;
        setInterviews(interviewsRes.data.sessions || []);
      } catch (err) {
        if (err.response?.status !== 401) {
          console.error(err);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const stats = useMemo(() => {
    const totalSessions = report?.totalSessions || 0;
    const totalMinutes = Math.floor((report?.totalDurationSeconds || 0) / 60);
    return [
      { label: "Sessions", value: totalSessions, sub: "All time" },
      { label: "Interviews done", value: interviews.length, sub: "Completed" },
      { label: "Grammar fixes", value: report?.totalSpeechCorrections || 0, sub: "Speech improvements" },
      { label: "Practice time", value: `${totalMinutes}m`, sub: "Total minutes" },
    ];
  }, [interviews.length, report]);

  const firstName = (user?.name || "there").split(" ")[0];
  const hasActivity = stats.some((item) => Number.parseInt(item.value, 10) > 0);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] antialiased">
      <DashboardHeader
        loading={loading}
        query={query}
        onQueryChange={setQuery}
        interviews={interviews}
      />

      <div className="mx-auto max-w-[1400px] px-5 py-6 lg:px-8 lg:py-8">
        <section className="mb-6 rounded-[10px] border border-[var(--border-strong)] border-l-[3px] border-l-[var(--blue)] bg-[var(--bg-card)] p-6">
          <p className="mb-2 text-sm leading-5 tracking-[0.01em] text-[var(--text-secondary)]">
            {formatToday()} - {getGreeting()}
          </p>
          <h2 className="max-w-[780px] text-[34px] font-bold leading-[1.1] tracking-[0] text-white sm:text-[40px]">
            Ready to practice, {firstName}?
          </h2>
          <p className="mt-4 max-w-[620px] text-base font-normal leading-7 tracking-[0] text-[var(--text-secondary)]">
            {hasActivity
              ? "Your prep workspace is ready. Start another round or review the progress you have already built."
              : "No sessions yet. Every expert was once a beginner - start your first mock interview today."}
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              to="/interview?mode=live"
              className="ui-btn-primary text-base font-semibold leading-6 no-underline"
            >
              Start session
            </Link>
            <Link
              to="/report"
              className="ui-btn-ghost text-base font-semibold leading-6 no-underline"
            >
              View report
            </Link>
          </div>
        </section>

        <section className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat, index) => (
            <DashboardStatCard key={stat.label} {...stat} index={index} />
          ))}
        </section>

        <section className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
          <DashboardTasks />
          <DashboardSidebar interviews={interviews} />
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
