import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import API from "../../api";

import DashboardHeader from "./DashboardHeader";
import DashboardSidebar from "./DashboardSidebar";
import DashboardTasks from "./DashboardTasks";

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
        setReport(reportRes.data.report);
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

  const q = query.trim().toLowerCase();
  const filteredInterviews = !q
    ? interviews
    : interviews.filter((s) => {
        const dateStr = s?.createdAt ? new Date(s.createdAt).toLocaleDateString().toLowerCase() : "";
        const scoreStr = `${s?.totalScore ?? ""}`.toLowerCase();
        const questionsStr = `${s?.answers?.length ?? 0}`.toLowerCase();
        return (
          dateStr.includes(q) ||
          scoreStr.includes(q) ||
          questionsStr.includes(q) ||
          `${questionsStr} questions`.includes(q)
        );
      });

  return (
    <div className="w-full">
      <DashboardHeader
        userName={user?.name}
        loading={loading}
        query={query}
        onQueryChange={setQuery}
        interviews={interviews}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <DashboardTasks />
        <DashboardSidebar report={report} interviews={filteredInterviews} loading={loading} query={query} />
      </div>
    </div>
  );
};

export default Dashboard;

