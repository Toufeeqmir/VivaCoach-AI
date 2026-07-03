import { useEffect, useState } from "react";
import API from "../../api";
import { EmptyState, LoadingState, SectionCard } from "./components";
import {
  AiSummarySection,
  ComparisonSection,
  HeroSection,
  StrengthsWeaknessesSection,
} from "./AnalyticsSections";
import SessionTimelineSection from "./SessionTimelineSection";
import { buildReportData } from "./analytics";

export const ReportView = ({ interviews, emptyState }) => {
  const [expanded, setExpanded] = useState(null);

  if (!interviews.length) {
    return emptyState || <EmptyState />;
  }

  const report = buildReportData(interviews);

  return (
    <div className="app-page">
      <div className="mx-auto max-w-7xl space-y-5">
        <HeroSection report={report} />
        <AiSummarySection report={report} />
        <ComparisonSection report={report} />
        <StrengthsWeaknessesSection report={report} />
        <SessionTimelineSection sessions={report.sessions} expanded={expanded} setExpanded={setExpanded} />
      </div>
    </div>
  );
};

const Report = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await API.get("/interview/history");
        setInterviews(res.data.sessions || []);
      } catch (error) {
        console.error(error);
        setError(error.response?.data?.message || "Unable to load your progress analytics.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <div className="app-page">
        <div className="mx-auto max-w-6xl">
          <SectionCard title="Report" subtitle="Your progress dashboard could not be loaded.">
            <div className="rounded-[8px] border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          </SectionCard>
        </div>
      </div>
    );
  }

  return <ReportView interviews={interviews} />;
};

export default Report;
