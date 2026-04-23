import AnalysisPanel from "../../AnalysisPanel";

const SetupStep = ({ state, actions, refs }) => (
  <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-10 items-start">
    <div className="ui-card-soft rounded-[2rem] p-10 shadow-2xl">
      <h2 className="text-2xl font-bold text-white mb-8 tracking-tight">Interview Configuration</h2>
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="ui-card p-5">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Mode</div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => actions.setMode("practice")}
                className={`ui-btn px-4 py-2 text-xs ${state.mode === "practice" ? "bg-[var(--cyan)] text-[#050810]" : "ui-btn-ghost"}`}
              >
                Practice
              </button>
              <button
                type="button"
                onClick={() => actions.setMode("live")}
                className={`ui-btn px-4 py-2 text-xs ${state.mode === "live" ? "bg-red-500 text-white" : "ui-btn-ghost"}`}
                title="Timed session; auto-submits when time runs out"
              >
                Live Mock
              </button>
            </div>
            <div className="mt-3 text-xs text-slate-500">
              {state.mode === "live"
                ? "Live Mock runs with a timer and feels like a real interview."
                : "Practice lets you answer without time pressure."}
            </div>
          </div>

          <div className="ui-card p-5">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Timer (per question)</div>
            <select
              className="ui-select rounded-2xl px-5 py-4"
              value={state.liveQuestionSeconds}
              onChange={(e) => actions.setLiveQuestionSeconds(Number(e.target.value))}
              disabled={state.mode !== "live"}
            >
              <option value={45}>45 seconds</option>
              <option value={60}>60 seconds</option>
              <option value={90}>90 seconds</option>
              <option value={120}>120 seconds</option>
            </select>
            <div className="mt-3 text-xs text-slate-500">Used only in Live Mock mode.</div>
          </div>
        </div>

        <div>
          <label className="block text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-3">Target Job Role</label>
          <input
            type="text"
            className="ui-input rounded-2xl px-5 py-4"
            placeholder="e.g. Full Stack Developer"
            value={state.targetRole}
            onChange={(e) => actions.setTargetRole(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className="block text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-3">Category</label>
            <select className="ui-select rounded-2xl px-5 py-4" value={state.category} onChange={(e) => actions.setCategory(e.target.value)}>
              <option value="technical">Technical</option>
              <option value="behavioral">Behavioral</option>
              <option value="general">General</option>
            </select>
          </div>
          <div>
            <label className="block text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-3">Level</label>
            <select className="ui-select rounded-2xl px-5 py-4" value={state.difficulty} onChange={(e) => actions.setDifficulty(e.target.value)}>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>

        <button
          onClick={actions.startInterview}
          disabled={state.loading}
          className="ui-btn-primary w-full py-5 rounded-2xl uppercase tracking-widest text-xs font-black"
        >
          {state.loading ? "Generating Questions..." : "Begin Session"}
        </button>
      </div>
    </div>

    <AnalysisPanel {...state} videoRef={refs.videoRef} canvasRef={refs.canvasRef} />
  </div>
);

export default SetupStep;
