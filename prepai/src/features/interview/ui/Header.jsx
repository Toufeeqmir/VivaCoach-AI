const InterviewHeader = ({ state, actions }) => (
  <header className="mx-auto mb-6 flex max-w-7xl flex-col gap-3 border-b border-[var(--border)] pb-5 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <h1 className="text-base font-semibold text-white">Practice session</h1>
      <p className="mt-1 text-xs text-[var(--text-secondary)]">Configure, answer, and review in one focused flow</p>
    </div>
    <div className="flex items-center gap-2">
      {(state.step === "question" || state.step === "result") && (
        <button
          type="button"
          onClick={actions.endInterviewNow}
          disabled={state.loading}
          className="ui-btn border border-red-500/25 bg-red-500/10 px-3 py-2 text-xs text-red-300 hover:bg-red-500/15"
          title="End interview now and generate report"
        >
          End Interview
        </button>
      )}
      <button
        type="button"
        onClick={() => actions.setVoiceEnabled(!state.voiceEnabled)}
        className={`ui-btn px-3 py-2 text-xs ${state.voiceEnabled ? "border border-[var(--blue)] bg-[var(--blue)] text-white" : "ui-btn-ghost"}`}
        title="Toggle AI voice"
      >
        {state.voiceEnabled ? "Voice On" : "Voice Off"}
      </button>
      <button
        type="button"
        onClick={actions.replayQuestion}
        className="ui-btn-ghost px-4 py-2 text-xs"
        disabled={state.step !== "question"}
        title="Replay question"
      >
        Replay
      </button>
    </div>
  </header>
);

export default InterviewHeader;
