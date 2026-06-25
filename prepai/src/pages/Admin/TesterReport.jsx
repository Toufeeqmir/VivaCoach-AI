import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import API from "../../api";
import { LoadingState, SectionCard } from "../report/components";
import { ReportView } from "../report/index.jsx";

const TesterReport = () => {
  const { userId } = useParams();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await API.get(`/admin/interview/history/${userId}`);
        setInterviews(res.data.sessions || []);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || "Unable to load tester report.");
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [userId]);

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <div className="app-page">
        <div className="mx-auto max-w-6xl">
          <SectionCard title="Tester report" subtitle="The requested tester report could not be loaded.">
            <div className="rounded-[8px] border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
            <Link to="/admin" className="ui-btn-ghost mt-5 no-underline">
              Back to testers
            </Link>
          </SectionCard>
        </div>
      </div>
    );
  }

  return (
    <ReportView
      interviews={interviews}
      emptyState={
        <div className="app-page">
          <div className="mx-auto max-w-6xl">
            <SectionCard title="Tester report" subtitle="No completed interview sessions were found for this tester.">
              <div className="rounded-[8px] border border-[var(--border)] bg-[var(--bg-secondary)] px-8 py-16 text-center">
                <h1 className="text-2xl font-semibold text-white">No completed interview data</h1>
                <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-[var(--text-secondary)]">
                  This tester needs to finish at least one interview before their analytics report is available.
                </p>
                <Link to="/admin" className="ui-btn-ghost mt-8 no-underline">
                  Back to testers
                </Link>
              </div>
            </SectionCard>
          </div>
        </div>
      }
    />
  );
};

export default TesterReport;
