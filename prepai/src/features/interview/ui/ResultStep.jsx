import AnalysisPanel from "../../AnalysisPanel";

const ResultStep = ({ state, actions, refs }) => {
  const insertedAdaptiveCount =
    (state.answerResult?.followUpQuestions?.length || 0) +
    (state.answerResult?.adaptiveQuestions?.length || 0);

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-8 space-y-6">
        <div className="ui-card-soft rounded-[2.5rem] p-10 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <span className="ui-badge text-[10px] font-black uppercase tracking-widest">Answer Result</span>
            <span className="text-xs text-slate-500">
              Question {state.currentIdx + 1} / {state.questions.length}
            </span>
          </div>

          <h2 className="text-xl font-bold text-white mb-3">
            {state.questions[state.currentIdx]?.question}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="ui-card p-5">
              <div className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Your Answer</div>
              <p className="text-sm leading-relaxed text-slate-200 whitespace-pre-wrap">{state.answer}</p>
            </div>
            <div className="ui-card p-5">
              <div className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">AI Feedback</div>
              {state.answerResult ? (
                <div className="space-y-4">
                  <p className="text-sm leading-relaxed text-slate-300">
                    {state.answerResult.feedback || "Your answer has been analyzed."}
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Overall", value: state.answerResult.overallScore },
                      { label: "Grammar", value: state.answerResult.grammarScore },
                      { label: "Relevance", value: state.answerResult.relevanceScore },
                      { label: "Structure", value: state.answerResult.structureScore },
                      { label: "Delivery", value: state.answerResult.deliveryScore },
                      { label: "WPM", value: state.answerResult.wordsPerMinute },
                    ].map((item) => (
                      <div key={item.label} className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] px-4 py-3">
                        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{item.label}</div>
                        <div className="mt-1 text-lg font-bold text-white">{item.value ?? 0}</div>
                      </div>
                    ))}
                  </div>
                  {state.answerResult.correctedAnswer && (
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Improved version</div>
                      <p className="text-sm leading-relaxed text-slate-200">{state.answerResult.correctedAnswer}</p>
                    </div>
                  )}
                  {state.answerResult.recommendedFocus && (
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Recommended focus</div>
                      <p className="text-sm leading-relaxed text-[var(--cyan)]">{state.answerResult.recommendedFocus}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-slate-500">No result returned from backend.</p>
              )}
            </div>
          </div>

          <div className="mt-6 ui-card p-6">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="text-xs font-bold uppercase tracking-widest text-slate-500">
                Adaptive next questions <span className="text-slate-600 font-semibold">({insertedAdaptiveCount})</span>
              </div>
              <button
                className="ui-btn-ghost px-4 py-2 text-xs"
                onClick={actions.acceptFollowUps}
                disabled={!insertedAdaptiveCount}
                title={!insertedAdaptiveCount ? "No adaptive questions returned from backend" : "Insert adaptive questions into the interview"}
              >
                Insert now {"->"}
              </button>
            </div>

            {insertedAdaptiveCount ? (
              <div className="space-y-3">
                {(state.answerResult?.followUpQuestions || []).map((question, i) => (
                  <div
                    key={`follow-up-${i}`}
                    className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] px-4 py-3 text-sm text-slate-200"
                  >
                    <div className="mb-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">Follow-up</div>
                    {question}
                  </div>
                ))}
                {(state.answerResult?.adaptiveQuestions || []).map((item, i) => (
                  <div
                    key={`adaptive-${i}`}
                    className="rounded-xl border border-cyan-500/15 bg-cyan-500/5 px-4 py-3 text-sm text-slate-200"
                  >
                    <div className="mb-1 flex items-center justify-between gap-3">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-300">Adaptive</span>
                      {item?.focus && <span className="text-[10px] uppercase tracking-widest text-slate-500">{item.focus}</span>}
                    </div>
                    {item?.question}
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] px-4 py-3 text-sm text-slate-500">
                No adaptive questions were generated for this answer. Try restarting the backend if you just updated the API.
              </div>
            )}
          </div>

          <div className="mt-6 flex items-center justify-between gap-3">
            <button className="ui-btn-ghost" onClick={actions.replayQuestion}>
              Replay Question
            </button>
            <button className="ui-btn-primary" onClick={actions.nextQuestion} disabled={state.loading}>
              {state.currentIdx + 1 >= state.questions.length ? "Finish Interview" : "Next Question ->"}
            </button>
          </div>
        </div>
      </div>

      <div className="lg:col-span-4">
        <AnalysisPanel {...state} videoRef={refs.videoRef} canvasRef={refs.canvasRef} />
      </div>
    </div>
  );
};

export default ResultStep;
