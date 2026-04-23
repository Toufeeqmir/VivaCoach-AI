import { useEffect, useState } from "react";
import API from "../../api";
import { EmptyState, LoadingState } from "./components";
import {
  ComparisonSection,
  HeroSection,
  MomentumSection,
  PracticeSection,
  PresenceSection,
  SkillSummarySection,
} from "./sections";
import SessionReviewSection from "./SessionReviewSection";
import { buildReportData } from "./utils";

const Report = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await API.get("/interview/history");
        setInterviews(res.data.sessions || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <LoadingState />;
  }

  if (!interviews.length) {
    return <EmptyState />;
  }

  const report = buildReportData(interviews);

  return (
    <div className="min-h-screen bg-[#050810] px-6 py-10 text-slate-200">
      <div className="mx-auto max-w-6xl space-y-8">
        <HeroSection
          interviews={interviews}
          answers={report.answers}
          overallAverage={report.overallAverage}
          thisWeekAverage={report.thisWeekAverage}
          scoreDelta={report.scoreDelta}
        />

        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <SkillSummarySection
            skillSummary={report.skillSummary}
            strongestSkill={report.strongestSkill}
            weakestSkill={report.weakestSkill}
          />
          <PracticeSection
            shownRecommendations={report.shownRecommendations}
            topFillers={report.topFillers}
            topFocuses={report.topFocuses}
          />
        </div>

        <ComparisonSection comparisonSummary={report.comparisonSummary} scoreTrend={report.scoreTrend} />

        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <MomentumSection
            latestSession={report.latestSession}
            bestSession={report.bestSession}
            thisWeekAverage={report.thisWeekAverage}
            lastWeekAverage={report.lastWeekAverage}
            scoreDelta={report.scoreDelta}
          />
          <PresenceSection
            emotionTotals={report.emotionTotals}
            totalEmotionSignals={report.totalEmotionSignals}
            dominantEmotion={report.dominantEmotion}
          />
        </div>

        <SessionReviewSection interviews={interviews} expanded={expanded} setExpanded={setExpanded} />
      </div>
    </div>
  );
};

export default Report;
