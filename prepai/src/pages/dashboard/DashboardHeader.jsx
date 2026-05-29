import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const SearchIcon = () => (
  <span className="inline-flex h-4 w-4 items-center justify-center rounded-[3px] border border-[#8c8981]">
    <span className="h-1.5 w-1.5 rounded-full border border-current text-[#8c8981]" />
  </span>
);

const DashboardHeader = ({ loading, query, onQueryChange, interviews }) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    const onDocDown = (event) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocDown);
    return () => document.removeEventListener("mousedown", onDocDown);
  }, []);

  const suggestions = useMemo(() => {
    const actions = [
      { label: "Live mock interview", to: "/interview?mode=live", hint: "Timed mode" },
      { label: "Practice interview", to: "/interview?mode=practice", hint: "Open practice" },
      { label: "Report card", to: "/report", hint: "Scores" },
      { label: "AI coach", to: "/coach", hint: "Tips" },
    ];
    const q = (query || "").trim().toLowerCase();
    const actionMatches = !q ? actions : actions.filter((item) => item.label.toLowerCase().includes(q));

    const interviewMatches = !q
      ? []
      : (interviews || [])
          .filter((session) => {
            const dateStr = session?.createdAt ? new Date(session.createdAt).toLocaleDateString().toLowerCase() : "";
            const scoreStr = `${session?.totalScore ?? ""}`.toLowerCase();
            const questionStr = `${session?.answers?.length ?? 0}`.toLowerCase();
            return dateStr.includes(q) || scoreStr.includes(q) || questionStr.includes(q);
          })
          .slice(0, 4)
          .map((session) => ({
            label: `Interview - ${new Date(session.createdAt).toLocaleDateString()}`,
            to: "/report",
            hint: `${session.totalScore || 0}/100`,
          }));

    return { actions: actionMatches, interviews: interviewMatches };
  }, [interviews, query]);

  return (
    <header className="sticky top-0 z-30 border-b border-[#474744] bg-[#2f302d]">
      <div className="flex min-h-[104px] flex-col gap-4 px-6 py-5 lg:flex-row lg:items-center lg:justify-between lg:px-12">
        <div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-center sm:gap-6">
          <h1 className="text-2xl font-black text-white">Dashboard</h1>
          <span className="hidden h-8 w-px bg-[#5a5a55] sm:block" />
          <p className="max-w-[220px] text-xl font-semibold leading-tight text-[#aaa69e]">Your performance overview</p>
        </div>

        <div className="flex w-full items-center gap-3 lg:w-auto">
          <div ref={wrapRef} className="relative w-full lg:w-[360px] xl:w-[420px]">
            <input
              className="h-14 w-full rounded-[14px] border border-[#53534e] bg-[#252622] px-16 pr-24 text-lg font-semibold text-zinc-100 outline-none transition placeholder:text-[#aaa69e] focus:border-[#d8d2c4]"
              placeholder="Search..."
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              onFocus={() => setOpen(true)}
              onKeyDown={(event) => {
                if (event.key === "Escape") setOpen(false);
                if (event.key === "Enter") {
                  const first = suggestions.actions[0] || suggestions.interviews[0];
                  if (first?.to) navigate(first.to);
                  setOpen(false);
                }
              }}
            />
            <div className="pointer-events-none absolute left-6 top-1/2 -translate-y-1/2 text-[#aaa69e]">
              <SearchIcon />
            </div>
            <div className="pointer-events-none absolute right-5 top-1/2 hidden -translate-y-1/2 rounded-[8px] border border-[#696963] px-3 py-1 text-sm font-bold text-[#aaa69e] sm:block">
              Ctrl K
            </div>

            {open && (query.trim().length > 0 || !loading) && (
              <div className="absolute left-0 right-0 top-[calc(100%+10px)] z-50 overflow-hidden rounded-[16px] border border-[#53534e] bg-[#1b1c19] shadow-2xl">
                <div className="border-b border-[#343530] px-4 py-3 text-xs font-black uppercase text-[#aaa69e]">
                  {loading ? "Loading" : "Suggestions"}
                </div>
                {!loading && suggestions.actions.length === 0 && suggestions.interviews.length === 0 ? (
                  <div className="px-4 py-4 text-sm text-[#aaa69e]">No matches found.</div>
                ) : (
                  <div className="max-h-72 overflow-auto py-2">
                    {[...suggestions.actions, ...suggestions.interviews].map((item, index) => (
                      <button
                        key={`${item.label}-${index}`}
                        type="button"
                        onClick={() => {
                          navigate(item.to);
                          setOpen(false);
                        }}
                        className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left transition hover:bg-[#272824]"
                      >
                        <span className="text-sm font-bold text-white">{item.label}</span>
                        <span className="text-xs font-semibold text-[#aaa69e]">{item.hint}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            type="button"
            className="relative inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-[14px] border border-[#53534e] bg-[#252622] text-zinc-200 transition hover:border-zinc-300"
            aria-label="Notifications"
            title="Notifications"
          >
            <span className="h-4 w-4 rounded-[3px] border border-current" />
            <span className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full bg-[#d8568e]" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
