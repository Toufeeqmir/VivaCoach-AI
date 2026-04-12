import { Link, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";

const DashboardHeader = ({ userName, loading, query, onQueryChange, interviews }) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    const onDocDown = (e) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocDown);
    return () => document.removeEventListener("mousedown", onDocDown);
  }, []);

  const suggestions = useMemo(() => {
    const base = [
      { label: "Start Interview (Live Mock available)", to: "/interview", hint: "Quick action" },
      { label: "Open Report Card", to: "/report", hint: "Analytics" },
      { label: "Open Coach", to: "/coach", hint: "Practice" },
      { label: "Open Session", to: "/session", hint: "Tools" },
    ];
    const q = (query || "").trim().toLowerCase();
    const filtered = !q ? base : base.filter((x) => x.label.toLowerCase().includes(q));

    const iQ = (query || "").trim().toLowerCase();
    const interviewMatches =
      !iQ
        ? []
        : (interviews || [])
            .slice(0, 12)
            .filter((s) => {
              const dateStr = s?.createdAt ? new Date(s.createdAt).toLocaleDateString().toLowerCase() : "";
              const scoreStr = `${s?.totalScore ?? ""}`.toLowerCase();
              const questionsStr = `${s?.answers?.length ?? 0}`.toLowerCase();
              return dateStr.includes(iQ) || scoreStr.includes(iQ) || questionsStr.includes(iQ);
            })
            .slice(0, 4)
            .map((s) => ({
              label: `Interview • ${new Date(s.createdAt).toLocaleDateString()} • ${s.totalScore}/100`,
              to: "/report",
              hint: `${s.answers?.length || 0} questions`,
            }));

    return { actions: filtered, interviews: interviewMatches };
  }, [interviews, query]);

  return (
    <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <div className="text-xs font-extrabold uppercase tracking-widest text-emerald-500">Overview</div>
        <h1 className="mt-2 text-3xl font-black text-slate-900">Dashboard</h1>
        <p className="mt-2 text-sm text-slate-500">Here is your performance overview</p>
      </div>

      <div className="flex w-full max-w-xl items-center gap-3">
        <div ref={wrapRef} className="relative w-full">
          <input
            className="w-full rounded-3xl border border-slate-200 bg-white px-5 py-3 text-sm text-slate-700 shadow-sm outline-none transition focus:border-emerald-300"
            placeholder="Search interviews or type: report, coach, interview…"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            onFocus={() => setOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setOpen(false);
              if (e.key === "Enter") {
                const first = suggestions.actions[0] || suggestions.interviews[0];
                if (first?.to) navigate(first.to);
                setOpen(false);
              }
            }}
          />
          <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">⌕</div>

          {open && (query.trim().length > 0 || !loading) && (
            <div className="absolute left-0 right-0 top-[calc(100%+10px)] z-50 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg">
              <div className="px-4 py-3 text-[11px] font-extrabold uppercase tracking-widest text-slate-400">
                {loading ? "Loading…" : "Suggestions"}
              </div>

              {!loading && suggestions.actions.length === 0 && suggestions.interviews.length === 0 ? (
                <div className="px-4 pb-4 text-sm text-slate-500">No matches. Try “report”, “interview”, or a date/score.</div>
              ) : (
                <div className="max-h-72 overflow-auto pb-2">
                  {suggestions.actions.map((s) => (
                    <button
                      key={s.to}
                      type="button"
                      onClick={() => {
                        navigate(s.to);
                        setOpen(false);
                      }}
                      className="flex w-full items-center justify-between px-4 py-3 text-left text-sm hover:bg-slate-50"
                    >
                      <span className="font-semibold text-slate-800">{s.label}</span>
                      <span className="text-xs font-semibold text-slate-400">{s.hint}</span>
                    </button>
                  ))}

                  {suggestions.interviews.length > 0 && (
                    <div className="px-4 pt-3 pb-1 text-[11px] font-extrabold uppercase tracking-widest text-slate-400">
                      Matching interviews
                    </div>
                  )}
                  {suggestions.interviews.map((s, idx) => (
                    <button
                      key={`${s.label}-${idx}`}
                      type="button"
                      onClick={() => {
                        navigate(s.to);
                        setOpen(false);
                      }}
                      className="flex w-full items-center justify-between px-4 py-3 text-left text-sm hover:bg-slate-50"
                    >
                      <span className="font-semibold text-slate-800">{s.label}</span>
                      <span className="text-xs font-semibold text-slate-400">{s.hint}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <div className="rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm">
            {userName || "Signed in"}
          </div>
          <Link
            to="/interview"
            className="rounded-3xl bg-emerald-500 px-5 py-3 text-sm font-extrabold text-white shadow-sm transition hover:bg-emerald-600 md:inline-flex no-underline"
          >
            Start
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;

