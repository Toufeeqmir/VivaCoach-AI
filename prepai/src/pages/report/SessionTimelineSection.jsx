import { SectionCard } from "./components";
import { EMOTION_COLORS, SESSION_DETAIL_METRICS, deltaTone, getAnswerMetric, scoreTone } from "./analytics";

const MetricBadge = ({ label, value }) => {
  const tone = scoreTone(value);

  return (
    <div className="rounded-[8px] border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-secondary)]">{label}</p>
      <p className="mt-1 text-lg font-bold" style={{ color: tone.color }}>
        {value}%
      </p>
    </div>
  );
};

const TextBlock = ({ title, children }) => (
  <div className="rounded-[8px] border border-[var(--border)] bg-[var(--bg-secondary)] p-4">
    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-secondary)]">{title}</p>
    <div className="mt-2 text-sm leading-6 text-[var(--text-primary)]">{children}</div>
  </div>
);

const EmotionBars = ({ emotionSummary = {} }) => {
  const total = Object.values(emotionSummary).reduce((sum, value) => sum + Number(value || 0), 0);

  return (
    <div className="space-y-2">
      {Object.entries(EMOTION_COLORS).map(([emotion, color]) => {
        const count = Number(emotionSummary?.[emotion] || 0);
        const percent = total ? Math.round((count / total) * 100) : 0;

        return (
          <div key={emotion}>
            <div className="mb-1 flex items-center justify-between gap-3 text-xs">
              <span className="capitalize text-[var(--text-secondary)]">{emotion}</span>
              <span className="font-semibold text-[var(--text-primary)]">{percent}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-[var(--bg-raised)]">
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${percent}%`, backgroundColor: color }} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

const AnswerDetails = ({ answer, answerIndex }) => {
  const speechMetrics = [
    { label: "Speech Score", value: getAnswerMetric(answer, "speechScore") },
    { label: "Filler Control", value: getAnswerMetric(answer, "fillerScore") },
    { label: "Pace", value: `${Math.round(Number(answer.wordsPerMinute || 0))} WPM`, raw: true },
    { label: "Fillers", value: answer.fillerWordCount || 0, raw: true },
  ];

  return (
    <article className="rounded-[10px] border border-[var(--border)] bg-[var(--bg-card)] p-4 md:p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--blue-light)]">
            Question {answerIndex + 1}
          </p>
          <h3 className="mt-2 text-base font-semibold leading-6 text-white">{answer.question || "Question not saved"}</h3>
        </div>
        <span className={`shrink-0 rounded-full border px-3 py-1 text-xs font-bold ${scoreTone(answer.overallScore || 0).badge}`}>
          {answer.overallScore || 0}%
        </span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricBadge label="Confidence" value={getAnswerMetric(answer, "confidenceScore")} />
        <MetricBadge label="Grammar" value={getAnswerMetric(answer, "grammarScore")} />
        <MetricBadge label="Delivery" value={getAnswerMetric(answer, "deliveryScore")} />
        <MetricBadge label="Relevance" value={getAnswerMetric(answer, "relevanceScore")} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <TextBlock title="Answer">
          <p className="whitespace-pre-wrap">{answer.originalAnswer || "No answer text was saved for this question."}</p>
          {answer.correctedAnswer && (
            <div className="mt-4 border-t border-[var(--border)] pt-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-secondary)]">Improved Version</p>
              <p className="mt-2 whitespace-pre-wrap text-[var(--text-secondary)]">{answer.correctedAnswer}</p>
            </div>
          )}
        </TextBlock>

        <TextBlock title="AI Feedback">
          {answer.feedback || "No AI feedback was saved for this answer."}
        </TextBlock>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <TextBlock title="Speech Analysis">
          <div className="grid grid-cols-2 gap-3">
            {speechMetrics.map((metric) => (
              <div key={metric.label} className="rounded-[8px] border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-secondary)]">{metric.label}</p>
                <p className="mt-1 text-base font-bold text-white">{metric.raw ? metric.value : `${metric.value}%`}</p>
              </div>
            ))}
          </div>
          {(answer.fillerWords || []).length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {answer.fillerWords.map((word, index) => (
                <span key={`${word}-${index}`} className="rounded-full border border-red-500/20 bg-red-500/10 px-2 py-1 text-xs text-red-300">
                  {word}
                </span>
              ))}
            </div>
          )}
        </TextBlock>

        <TextBlock title="Body Language Analysis">
          <p>
            Dominant expression: <span className="font-semibold capitalize text-white">{answer.dominantEmotion || "neutral"}</span>
          </p>
          <p className="mt-1">
            Visible confidence: <span className="font-semibold text-white">{getAnswerMetric(answer, "confidenceScore")}%</span>
          </p>
          <div className="mt-4">
            <EmotionBars emotionSummary={answer.emotionSummary} />
          </div>
        </TextBlock>

        <TextBlock title="Recommendations">
          <p>{answer.recommendedFocus || "No specific recommendation was saved for this answer."}</p>
          {(answer.adaptiveQuestions || []).length > 0 && (
            <div className="mt-3 space-y-2">
              {answer.adaptiveQuestions.map((item, index) => (
                <div key={`${item.question}-${index}`} className="rounded-[8px] border border-[var(--blue-border)] bg-[var(--blue-tint)] px-3 py-2">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--blue-light)]">{item.focus || "Follow-up"}</p>
                  <p className="mt-1 text-[var(--text-primary)]">{item.question}</p>
                </div>
              ))}
            </div>
          )}
          {(answer.followUpQuestions || []).length > 0 && (
            <div className="mt-3 space-y-2">
              {answer.followUpQuestions.map((item, index) => (
                <p key={`${item}-${index}`} className="rounded-[8px] border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2 text-[var(--text-secondary)]">
                  {item}
                </p>
              ))}
            </div>
          )}
        </TextBlock>
      </div>
    </article>
  );
};

const SessionTimelineSection = ({ sessions, expanded, setExpanded }) => (
  <SectionCard title="Interview Timeline" subtitle="Completed sessions with score, speech, body-language, feedback, and recommendation details.">
    <div className="space-y-4">
      {sessions.map((session, index) => {
        const isOpen = expanded === index;
        const tone = scoreTone(session.metrics.overall);
        const previous = sessions[index + 1];
        const delta = previous ? session.metrics.overall - previous.metrics.overall : 0;
        const trend = deltaTone(delta);

        return (
          <div key={session.sessionId || index} className="overflow-hidden rounded-[10px] border border-[var(--border)] bg-[var(--bg-secondary)] transition duration-300">
            <button
              type="button"
              onClick={() => setExpanded(isOpen ? null : index)}
              className="w-full px-4 py-4 text-left transition hover:bg-white/[0.02] md:px-5"
              aria-expanded={isOpen}
            >
              <div className="grid gap-4 lg:grid-cols-[minmax(180px,1fr)_minmax(0,1.7fr)_auto] lg:items-center">
                <div>
                  <p className="text-base font-semibold text-white">{session.timelineLabel}</p>
                  <p className="mt-1 text-sm text-[var(--text-secondary)]">{session.displayDate}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {SESSION_DETAIL_METRICS.map((metric) => (
                    <div key={metric.key} className="rounded-[8px] border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-secondary)]">{metric.label}</p>
                      <p className="mt-1 text-sm font-bold text-white">{session.metrics[metric.key]}%</p>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-3 lg:justify-end">
                  <span className={`rounded-full border px-3 py-1 text-xs font-bold ${tone.badge}`}>
                    {session.metrics.overall}%
                  </span>
                  {previous && (
                    <span className={`rounded-full border px-3 py-1 text-xs font-bold ${trend.border} ${trend.bg} ${trend.text}`}>
                      {trend.arrow} {delta > 0 ? "+" : ""}{delta}%
                    </span>
                  )}
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-secondary)]">
                    {isOpen ? "Hide" : "Open"}
                  </span>
                </div>
              </div>
            </button>

            {isOpen && (
              <div className="border-t border-[var(--border)] px-4 py-5 md:px-5">
                {session.overallFeedback && (
                  <div className="mb-5 rounded-[8px] border border-[var(--blue-border)] bg-[var(--blue-tint)] p-4 text-sm leading-6 text-[var(--text-primary)]">
                    {session.overallFeedback}
                  </div>
                )}

                <div className="space-y-4">
                  {(session.answers || []).map((answer, answerIndex) => (
                    <AnswerDetails key={`${session.sessionId}-${answerIndex}`} answer={answer} answerIndex={answerIndex} />
                  ))}
                  {!(session.answers || []).length && (
                    <div className="rounded-[8px] border border-[var(--border)] bg-[var(--bg-card)] px-5 py-6 text-sm text-[var(--text-secondary)]">
                      No answer-level analysis was saved for this session.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  </SectionCard>
);

export default SessionTimelineSection;
