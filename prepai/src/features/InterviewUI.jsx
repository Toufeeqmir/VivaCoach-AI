import AnalysisPanel from "./AnalysisPanel";

/**
 * prepai/src/features/InterviewUI.jsx
 *
 * Purpose
 * - Presentation/UI component for Interview Mode.
 * - Renders the interview state machine screens:
 *   - setup: configuration inputs and "Begin Session"
 *   - question: question prompt + answer input + voice controls
 *   - result: displays per-question AI evaluation and navigation
 *   - final: displays overall session result and links to report
 *
 * Inputs
 * - `state`: interview state from `Interview.jsx` controller
 * - `actions`: callbacks to mutate state or perform side effects (API calls, speech, etc.)
 * - `refs`: camera refs passed down to `AnalysisPanel`
 */

/**
 * Render interview UI based on the controller state.
 * @param {{ state: any, actions: any, refs: any }} props
 * @returns {JSX.Element}
 */
const InterviewUI = ({ state, actions, refs }) => {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-slate-200 p-6 font-sans">
      {/* Change: unify interview UI with app theme vars + Tailwind primitives. */}
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
            {state.voiceEnabled ? "🔊 Voice On" : "🔈 Voice Off"}
          </button>
          <button
            type="button"
            onClick={actions.replayQuestion}
            className="ui-btn-ghost px-4 py-2 text-xs"
            disabled={state.step !== "question"}
            title="Replay question"
          >
            ↻ Replay
          </button>
        </div>
      </header>

      {/* SETUP PHASE - The UI you liked */}
      {state.step === "setup" && (
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
                    {state.mode === "live" ? "Live Mock runs with a timer and feels like a real interview." : "Practice lets you answer without time pressure."}
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
                  onChange={e => actions.setTargetRole(e.target.value)} 
                />
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-3">Category</label>
                  <select 
                    className="ui-select rounded-2xl px-5 py-4" 
                    value={state.category} 
                    onChange={e => actions.setCategory(e.target.value)}
                  >
                    <option value="technical">Technical</option>
                    <option value="behavioral">Behavioral</option>
                    <option value="general">General</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-3">Level</label>
                  <select 
                    className="ui-select rounded-2xl px-5 py-4" 
                    value={state.difficulty} 
                    onChange={e => actions.setDifficulty(e.target.value)}
                  >
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
      )}

      {/* Change: handle blank/failed question generation gracefully. */}
      {state.step === "question" && (!state.questions || state.questions.length === 0) && (
        <div className="max-w-3xl mx-auto ui-card-soft p-10 rounded-[2rem] text-center">
          <div className="text-4xl mb-4">🧠</div>
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
      )}

      {/* QUESTION PHASE (practice) */}
      {state.step === "question" && state.questions[state.currentIdx] && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl mx-auto">
          <div className="lg:col-span-8 space-y-6">
            <div className="ui-card-soft border-l-4 border-[var(--cyan)] p-10 rounded-[2.5rem] shadow-xl">
              {/* Change: fix question rendering (use `.question`), prevent blank/crash. */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <span className="ui-badge text-[10px] font-black uppercase tracking-widest">
                  Question {state.currentIdx + 1} / {state.questions.length}
                </span>
                <span className="text-xs text-slate-500">
                  Time: <span className="text-slate-300 font-semibold">{state.elapsed}s</span>
                </span>
              </div>
              <h2 className="text-2xl font-bold text-white leading-tight">
                {state.questions[state.currentIdx]?.question}
              </h2>
            </div>
            <div className="ui-card-soft p-8 rounded-[2rem]">
              <textarea 
                className="ui-input min-h-[250px] resize-none rounded-2xl p-6 shadow-inner focus:border-[#00d4ff55]" 
                placeholder="Type your response or use voice..." 
                value={state.answer} 
                onChange={e => actions.setAnswer(e.target.value)} 
              />
              <div className="flex justify-between items-center mt-6">
                <button 
                  onClick={state.isListening ? actions.stopSpeech : actions.startSpeech} 
                  className={`ui-btn px-8 py-3 rounded-xl font-bold text-xs uppercase transition-all ${state.isListening ? "bg-red-500 text-white animate-pulse" : "bg-slate-900 text-slate-400"}`}
                >
                  {state.isListening ? "Stop Mic" : "🎙️ Use Voice"}
                </button>
                <button 
                  onClick={actions.submitAnswer} 
                  disabled={!state.answer.trim() || state.loading} 
                  className="ui-btn-primary px-10 py-3 rounded-xl font-black text-xs uppercase shadow-xl"
                >
                  {state.loading ? "Processing..." : "Submit Answer"}
                </button>
              </div>
            </div>
          </div>
          <div className="lg:col-span-4">
            <AnalysisPanel {...state} videoRef={refs.videoRef} canvasRef={refs.canvasRef} />
          </div>
        </div>
      )}

      {/* LIVE MOCK QUESTION PHASE */}
      {state.step === "live" && state.questions[state.currentIdx] && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl mx-auto">
          <div className="lg:col-span-8 space-y-6">
            <div className="ui-card-soft border-l-4 border-red-500 p-10 rounded-[2.5rem] shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <span className="ui-badge text-[10px] font-black uppercase tracking-widest bg-red-500/15 border border-red-500/25 text-red-200">
                  Live Mock • Question {state.currentIdx + 1} / {state.questions.length}
                </span>
                <span className="text-xs text-slate-500">
                  Remaining:{" "}
                  <span className={`font-semibold ${state.liveRemaining <= 10 ? "text-red-300" : "text-slate-200"}`}>
                    {state.liveRemaining}s
                  </span>
                </span>
              </div>
              <h2 className="text-2xl font-bold text-white leading-tight">
                {state.questions[state.currentIdx]?.question}
              </h2>
            </div>

            <div className="ui-card-soft p-8 rounded-[2rem]">
              <textarea
                className="ui-input min-h-[250px] resize-none rounded-2xl p-6 shadow-inner focus:border-[#00d4ff55]"
                placeholder="Answer fast — Live Mock will auto-submit when time ends..."
                value={state.answer}
                onChange={(e) => actions.setAnswer(e.target.value)}
              />
              <div className="flex justify-between items-center mt-6">
                <button
                  onClick={state.isListening ? actions.stopSpeech : actions.startSpeech}
                  className={`ui-btn px-8 py-3 rounded-xl font-bold text-xs uppercase transition-all ${state.isListening ? "bg-red-500 text-white animate-pulse" : "bg-slate-900 text-slate-400"}`}
                >
                  {state.isListening ? "Stop Mic" : "🎙️ Use Voice"}
                </button>
                <button
                  onClick={actions.submitAnswer}
                  disabled={state.loading}
                  className="ui-btn-primary px-10 py-3 rounded-xl font-black text-xs uppercase shadow-xl"
                  title="You can submit early; otherwise it auto-submits at 0s"
                >
                  {state.loading ? "Processing..." : "Submit Early"}
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4">
            <AnalysisPanel {...state} videoRef={refs.videoRef} canvasRef={refs.canvasRef} />
          </div>
        </div>
      )}

      {/* Change: show answer result after submit (previously missing, looked like a crash). */}
      {state.step === "result" && (
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
                    <pre className="text-xs leading-relaxed text-slate-300 whitespace-pre-wrap break-words">
                      {JSON.stringify(state.answerResult, null, 2)}
                    </pre>
                  ) : (
                    <p className="text-sm text-slate-500">No result returned from backend.</p>
                  )}
                </div>
              </div>

              {/* Change: show AI follow-up questions (real interview depth). */}
              <div className="mt-6 ui-card p-6">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="text-xs font-bold uppercase tracking-widest text-slate-500">
                    Follow-up questions{" "}
                    <span className="text-slate-600 font-semibold">
                      ({state.answerResult?.followUpQuestions?.length || 0})
                    </span>
                  </div>
                  <button
                    className="ui-btn-ghost px-4 py-2 text-xs"
                    onClick={actions.acceptFollowUps}
                    disabled={!state.answerResult?.followUpQuestions?.length}
                    title={!state.answerResult?.followUpQuestions?.length ? "No follow-ups returned from backend" : "Insert follow-ups into next questions"}
                  >
                    Continue with follow-ups →
                  </button>
                </div>

                {state.answerResult?.followUpQuestions?.length ? (
                  <ul className="space-y-2">
                    {state.answerResult.followUpQuestions.map((q, i) => (
                      <li
                        key={i}
                        className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] px-4 py-3 text-sm text-slate-200"
                      >
                        {q}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] px-4 py-3 text-sm text-slate-500">
                    No follow-ups were generated for this answer. If you just added this feature, restart your backend server so the updated API returns follow-ups.
                  </div>
                )}
              </div>

              <div className="mt-6 flex items-center justify-between gap-3">
                <button className="ui-btn-ghost" onClick={actions.replayQuestion}>
                  ↻ Replay Question
                </button>
                <button className="ui-btn-primary" onClick={actions.nextQuestion} disabled={state.loading}>
                  {state.currentIdx + 1 >= state.questions.length ? "Finish Interview" : "Next Question →"}
                </button>
              </div>
            </div>
          </div>
          <div className="lg:col-span-4">
            <AnalysisPanel {...state} videoRef={refs.videoRef} canvasRef={refs.canvasRef} />
          </div>
        </div>
      )}

      {/* Change: show final overall result + link to report. */}
      {state.step === "final" && (
        <div className="max-w-5xl mx-auto ui-card-soft rounded-[2.5rem] p-10 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <span className="ui-badge text-[10px] font-black uppercase tracking-widest">Interview Complete</span>
            <span className="text-xs text-slate-500">Sessions are saved to your Report Card</span>
          </div>

          <h2 className="text-3xl font-black text-white mb-4">Your Overall Result</h2>

          {state.finalResult ? (
            <pre className="ui-card p-6 text-xs leading-relaxed text-slate-200 whitespace-pre-wrap break-words">
              {JSON.stringify(state.finalResult, null, 2)}
            </pre>
          ) : (
            <div className="ui-card p-6 text-slate-500 text-sm">No final result returned.</div>
          )}

          <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
            <a className="ui-btn-ghost no-underline" href="/dashboard">Back to Dashboard</a>
            <a className="ui-btn-primary no-underline" href="/report">View Report Card →</a>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewUI;