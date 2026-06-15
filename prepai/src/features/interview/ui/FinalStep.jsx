const FinalStep = ({ state }) => (
  <div className="ui-card-soft mx-auto max-w-5xl border-l-[3px] border-l-[var(--blue)] p-6">
    <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
      <span className="ui-badge text-[10px] font-black uppercase tracking-widest">Interview Complete</span>
      <span className="text-xs text-slate-500">Sessions are saved to your Report Card</span>
    </div>

    <h2 className="mb-4 text-2xl font-semibold text-white">Your overall result</h2>

    {state.finalResult ? (
      <pre className="ui-card whitespace-pre-wrap break-words p-5 text-xs leading-relaxed text-slate-200">
        {JSON.stringify(state.finalResult, null, 2)}
      </pre>
    ) : (
      <div className="ui-card p-6 text-slate-500 text-sm">No final result returned.</div>
    )}

    <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
      <a className="ui-btn-ghost no-underline" href="/dashboard">Back to Dashboard</a>
      <a className="ui-btn-primary no-underline" href="/report">View Report Card {"->"}</a>
    </div>
  </div>
);

export default FinalStep;
