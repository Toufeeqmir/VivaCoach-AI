const InterviewHeader = ({ state, actions }) => (
  <header className="max-w-7xl mx-auto mb-10 flex items-center justify-between gap-4">
    <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">
      PrepAI<span className="text-[var(--cyan)]">.</span>
    </h1>
    <div className="flex items-center gap-2">
      {(state.step === "question" || state.step === "result") && (
        <button
          type="button"
          onClick={actions.endInterviewNow}
          disabled={state.loading}
          className="ui-btn bg-red-500/15 text-red-300 border border-red-500/25 px-4 py-2 text-xs hover:bg-red-500/20"
          title="End interview now and generate report"
        >
          End Interview
        </button>
      )}
      <button
        type="button"
        onClick={() => actions.setVoiceEnabled(!state.voiceEnabled)}
        className={`ui-btn px-4 py-2 text-xs ${state.voiceEnabled ? "bg-[var(--cyan)] text-[#050810]" : "ui-btn-ghost"}`}
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
