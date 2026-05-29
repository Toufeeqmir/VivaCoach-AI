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
        console.error(err);
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
      { label: "Sessions", value: totalSessions, sub: "All time", color: "#f8f7f2" },
      { label: "Interviews done", value: interviews.length, sub: "Completed", color: "#078d73" },
      { label: "Grammar fixes", value: report?.totalSpeechCorrections || 0, sub: "Speech improvements", color: "#6961dc" },
      { label: "Practice time", value: `${totalMinutes}m`, sub: "Total minutes", color: "#a66b0f" },
    ];
  }, [interviews.length, report]);

  const firstName = (user?.name || "there").split(" ")[0];
  const hasActivity = stats.some((item) => Number.parseInt(item.value, 10) > 0);

  return (
    <div className="min-h-screen bg-[#10100f]">
      <DashboardHeader
        loading={loading}
        query={query}
        onQueryChange={setQuery}
        interviews={interviews}
      />

      <div className="mx-auto max-w-[1380px] px-6 py-10 lg:px-12 lg:py-12">
        <section className="mb-10 max-w-[640px]">
          <p className="mb-3 text-xl font-semibold text-[#aaa69e]">
            {formatToday()} - {getGreeting()}
          </p>
          <h2 className="font-serif text-5xl font-bold leading-none text-white sm:text-6xl">
            Ready to practice,
            <span className="block italic text-[#050505]">{firstName}?</span>
          </h2>
          <p className="mt-6 max-w-[560px] text-xl font-semibold leading-relaxed text-[#aaa69e]">
            {hasActivity
              ? "Your prep workspace is ready. Start another round or review the progress you have already built."
              : "No sessions yet. Every expert was once a beginner - start your first mock interview today."}
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link
              to="/interview?mode=live"
              className="inline-flex h-16 items-center justify-center gap-4 rounded-[14px] border border-[#666660] px-9 text-xl font-black text-white no-underline transition hover:border-[#d8d2c4] hover:bg-[#232421]"
            >
              <span className="h-4 w-4 rounded-[3px] border border-current" />
              Start session
            </Link>
            <Link
              to="/report"
              className="inline-flex h-16 items-center justify-center rounded-[14px] border border-[#666660] px-10 text-xl font-black text-white no-underline transition hover:border-[#d8d2c4] hover:bg-[#232421]"
            >
              View report
            </Link>
          </div>
        </section>

        <section className="mb-10 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <DashboardStatCard key={stat.label} {...stat} />
          ))}
        </section>

        <section className="grid grid-cols-1 gap-7 xl:grid-cols-[minmax(0,1.25fr)_minmax(360px,0.75fr)]">
          <DashboardTasks />
          <DashboardSidebar interviews={interviews} />
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
