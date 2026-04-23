import AnalysisPanel from "../../AnalysisPanel";

const QuestionCard = ({ state, actions, live }) => {
  const currentQuestionType = state.currentQuestion?.questionType || "primary";
  const currentFocus = state.currentQuestion?.focusArea || "";

  return (
    <>
      <div className={`ui-card-soft p-10 rounded-[2.5rem] shadow-xl border-l-4 ${live ? "border-red-500" : "border-[var(--cyan)]"}`}>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <span className={`ui-badge text-[10px] font-black uppercase tracking-widest ${live ? "bg-red-500/15 border border-red-500/25 text-red-200" : ""}`}>
            {live ? "Live Mock • " : ""}Question {state.currentIdx + 1} / {state.questions.length}
          </span>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            {currentQuestionType !== "primary" && (
              <span className={`rounded-full px-3 py-1 uppercase tracking-widest text-[10px] ${live ? "border border-red-500/20 bg-red-500/10 text-red-200" : "border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--cyan)]"}`}>
                {currentQuestionType === "follow_up" ? "Follow-up" : "Adaptive"}
              </span>
            )}
            <span>
              {live ? "Remaining" : "Time"}:{" "}
              <span className={`font-semibold ${live && state.liveRemaining <= 10 ? "text-red-300" : "text-slate-200"}`}>
                {live ? state.liveRemaining : state.elapsed}s
              </span>
            </span>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-white leading-tight">{state.questions[state.currentIdx]?.question}</h2>
        {currentFocus && (
          <p className="mt-4 text-sm text-slate-400">
            Focus: <span className="text-slate-200">{currentFocus}</span>
          </p>
        )}
      </div>

      <div className="ui-card-soft p-8 rounded-[2rem]">
        <textarea
          className="ui-input min-h-[250px] resize-none rounded-2xl p-6 shadow-inner focus:border-[#00d4ff55]"
          placeholder={live ? "Answer fast - Live Mock will auto-submit when time ends..." : "Type your response or use voice..."}
          value={state.answer}
          onChange={(e) => actions.setAnswer(e.target.value)}
        />
        <div className="flex justify-between items-center mt-6">
          <button
            onClick={state.isListening ? actions.stopSpeech : actions.startSpeech}
            className={`ui-btn px-8 py-3 rounded-xl font-bold text-xs uppercase transition-all ${state.isListening ? "bg-red-500 text-white animate-pulse" : "bg-slate-900 text-slate-400"}`}
          >
            {state.isListening ? "Stop Mic" : "Use Voice"}
          </button>
          <button
            onClick={actions.submitAnswer}
            disabled={live ? state.loading : !state.answer.trim() || state.loading}
            className="ui-btn-primary px-10 py-3 rounded-xl font-black text-xs uppercase shadow-xl"
            title={live ? "You can submit early; otherwise it auto-submits at 0s" : undefined}
          >
            {state.loading ? "Processing..." : live ? "Submit Early" : "Submit Answer"}
          </button>
        </div>
      </div>
    </>
  );
};

const EmptyQuestionsState = () => (
  <div className="max-w-3xl mx-auto ui-card-soft p-10 rounded-[2rem] text-center">
    <div className="text-4xl mb-4">Notice</div>
    <h2 className="text-2xl font-bold text-white mb-2">No questions received</h2>
    <p className="text-slate-500 text-sm">
      The backend returned an empty question list. Try again or check the interview questions API.
    </p>
    <div className="mt-6 flex justify-center">
      <button className="ui-btn-primary" onClick={() => window.location.reload()}>
        Reload
      </button>
    </div>
  </div>
);

const QuestionStep = ({ state, actions, refs, live = false }) => {
  if (!state.questions || !state.questions.length) {
    return <EmptyQuestionsState />;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl mx-auto">
      <div className="lg:col-span-8 space-y-6">
        <QuestionCard state={state} actions={actions} live={live} />
      </div>
      <div className="lg:col-span-4">
        <AnalysisPanel {...state} videoRef={refs.videoRef} canvasRef={refs.canvasRef} />
      </div>
    </div>
  );
};

export default QuestionStep;
