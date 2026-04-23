import { SectionCard } from "./components";
import { formatSessionDate, getAnswerMetric, scoreTone, SKILL_CONFIG } from "./utils";

const SessionReviewSection = ({ interviews, expanded, setExpanded }) => (
  <SectionCard title="Session review" subtitle="Open any completed session to review the answer-level analysis, adaptive focus, and generated next questions.">
    <div className="space-y-4">
      {interviews.map((session, index) => {
        const sessionAverage = session.totalScore || 0;
        const tone = scoreTone(sessionAverage);
        const isOpen = expanded === index;

        return (
          <div key={session.sessionId || index} className="overflow-hidden rounded-[1.75rem] border border-slate-800 bg-[#050810]">
            <button
              type="button"
              onClick={() => setExpanded(isOpen ? null : index)}
              className="w-full px-6 py-5 text-left transition hover:bg-white/[0.02]"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="text-lg font-bold text-white">Session {interviews.length - index}</div>
                  <div className="mt-1 text-sm text-slate-500">
                    {formatSessionDate(session.createdAt)} · {session.answers?.length || 0} answers
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`rounded-full border px-3 py-1 text-xs font-bold ${tone.badge}`}>
                    {sessionAverage}%
                  </span>
                  <span className="text-xs uppercase tracking-widest text-slate-600">{isOpen ? "Hide" : "Open"}</span>
                </div>
              </div>
            </button>

            {isOpen && (
              <div className="border-t border-slate-800 px-6 py-6">
                {session.overallFeedback && (
                  <div className="mb-5 rounded-2xl border border-slate-800 bg-[#0d1117] p-5 text-sm leading-relaxed text-slate-300">
                    {session.overallFeedback}
                  </div>
                )}

                <div className="space-y-4">
                  {(session.answers || []).map((answer, answerIndex) => (
                    <article key={`${session.sessionId}-${answerIndex}`} className="rounded-2xl border border-slate-800 bg-[#0d1117] p-5">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="max-w-3xl">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full border border-slate-700 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                              {answer.questionType === "adaptive" ? "Adaptive" : answer.questionType === "follow_up" ? "Follow-up" : "Primary"}
                            </span>
                            {answer.focusArea && (
                              <span className="rounded-full border border-cyan-500/15 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-cyan-300">
                                {answer.focusArea}
                              </span>
                            )}
                          </div>
                          <h3 className="mt-3 text-lg font-bold text-white">{answer.question}</h3>
                          {answer.feedback && <p className="mt-3 text-sm leading-relaxed text-slate-400">{answer.feedback}</p>}
                        </div>

                        <div className={`rounded-full border px-3 py-1 text-xs font-bold ${scoreTone(answer.overallScore || 0).badge}`}>
                          {answer.overallScore || 0}%
                        </div>
                      </div>

                      <div className="mt-5 grid gap-3 md:grid-cols-3 lg:grid-cols-6">
                        {SKILL_CONFIG.map((metric) => (
                          <div key={metric.key} className="rounded-xl border border-slate-800 bg-[#050810] px-3 py-3">
                            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{metric.label}</div>
                            <div className="mt-1 text-lg font-bold text-white">{getAnswerMetric(answer, metric.key)}%</div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-5 grid gap-4 lg:grid-cols-2">
                        <div className="rounded-2xl border border-slate-800 bg-[#050810] p-4">
                          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Recommended focus</div>
                          <p className="mt-2 text-sm text-slate-300">
                            {answer.recommendedFocus || "No specific follow-up focus was saved for this answer."}
                          </p>
                        </div>

                        <div className="rounded-2xl border border-slate-800 bg-[#050810] p-4">
                          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Adaptive questions generated</div>
                          {(answer.adaptiveQuestions || []).length ? (
                            <div className="mt-3 space-y-2">
                              {answer.adaptiveQuestions.map((item, itemIndex) => (
                                <div key={`${item.question}-${itemIndex}`} className="rounded-xl border border-cyan-500/15 bg-cyan-500/5 px-3 py-3 text-sm text-slate-300">
                                  <div className="mb-1 text-[10px] font-bold uppercase tracking-widest text-cyan-300">
                                    {item.focus || "Adaptive"}
                                  </div>
                                  {item.question}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="mt-2 text-sm text-slate-500">No adaptive question set was generated for this answer.</p>
                          )}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  </SectionCard>
);

export default SessionReviewSection;
