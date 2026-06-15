import { Link } from "react-router-dom";

const features = [
  { icon: "01", title: "Mock interviews", body: "Practice realistic technical, behavioral, and role-specific interview rounds." },
  { icon: "02", title: "Multimodal feedback", body: "Review answer quality, delivery, clarity, speech patterns, and visible confidence." },
  { icon: "03", title: "Performance reports", body: "Track score trends, strongest skills, weak spots, and your next best drills." },
];

const scoreRows = [
  ["Answer clarity", "86%"],
  ["Technical depth", "74%"],
  ["Confidence", "68%"],
];

const Landing = () => (
  <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
    <nav className="sticky top-0 z-30 border-b border-[var(--border)] bg-[rgba(15,17,23,0.94)] backdrop-blur">
      <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between px-5 lg:px-8">
        <Link to="/" className="flex items-center gap-3 no-underline">
          <span className="brand-mark">AI</span>
          <span className="text-[15px] font-semibold text-white">PrepAI</span>
        </Link>
        <div className="hidden items-center gap-7 text-xs text-[var(--text-secondary)] md:flex">
          <a href="#features" className="no-underline transition hover:text-white">Features</a>
          <a href="#workflow" className="no-underline transition hover:text-white">How it works</a>
          <a href="#contact" className="no-underline transition hover:text-white">Contact</a>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/login" className="ui-btn-ghost min-h-9 px-3 text-xs no-underline">Log in</Link>
          <Link to="/register" className="ui-btn-primary min-h-9 px-3 text-xs no-underline">Get started</Link>
        </div>
      </div>
    </nav>

    <main>
      <section className="border-b border-[var(--border)]">
        <div className="mx-auto grid min-h-[calc(100vh-68px)] max-w-7xl items-center gap-12 px-5 py-16 lg:grid-cols-[1.02fr_0.98fr] lg:px-8 lg:py-20">
          <div className="max-w-2xl">
            <span className="ui-badge">AI-powered interview coaching</span>
            <h1 className="mt-6 max-w-[650px] text-4xl font-semibold leading-[1.12] text-white sm:text-5xl lg:text-[58px]">
              Ace your next interview with <span className="text-[var(--blue-light)]">focused AI guidance.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-[var(--text-secondary)]">
              Practice real questions, improve how you communicate, and turn every session into a clear plan for what to work on next.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/register" className="ui-btn-primary no-underline">Start practicing</Link>
              <a href="#workflow" className="ui-btn-ghost no-underline">See the workflow</a>
            </div>
            <div className="mt-12 grid max-w-xl grid-cols-3 border-y border-[var(--border)]">
              {[["Real time", "AI feedback"], ["6+", "Skill signals"], ["One", "Focused workspace"]].map(([value, label]) => (
                <div key={label} className="border-r border-[var(--border)] py-4 pr-4 last:border-r-0 last:pl-4">
                  <p className="text-lg font-semibold text-[var(--blue-light)]">{value}</p>
                  <p className="mt-1 text-[11px] text-[var(--text-secondary)]">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="overflow-hidden rounded-[12px] border border-[var(--border-strong)] bg-[var(--bg-secondary)]">
              <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
                <div>
                  <p className="text-xs font-semibold text-white">Practice session</p>
                  <p className="mt-1 text-[10px] text-[var(--text-muted)]">Technical · Data structures</p>
                </div>
                <span className="ui-badge px-2 py-1 text-[9px]">Question 4 of 12</span>
              </div>
              <div className="p-4">
                <div className="rounded-[10px] border border-[var(--blue-border)] border-l-[3px] border-l-[var(--blue)] bg-[var(--bg-card)] p-5">
                  <div className="mb-4 flex gap-2">
                    <span className="ui-badge px-2 py-1 text-[9px]">DSA</span>
                    <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-[9px] text-emerald-300">Medium</span>
                  </div>
                  <p className="text-sm leading-6 text-white">
                    Explain the difference between a stack and a queue. When would you use each one?
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <span className="ui-btn-primary min-h-8 px-3 text-[10px]">Answer with voice</span>
                    <span className="ui-btn-ghost min-h-8 px-3 text-[10px]">Type answer</span>
                  </div>
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div className="section-card">
                    <p className="eyebrow">Live feedback</p>
                    <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">Your structure is strong. Add one concrete example before your conclusion.</p>
                  </div>
                  <div className="section-card">
                    <p className="eyebrow">Current scores</p>
                    <div className="mt-3 space-y-3">
                      {scoreRows.map(([label, value]) => (
                        <div key={label} className="flex items-center justify-between text-[11px]">
                          <span className="text-[var(--text-secondary)]">{label}</span>
                          <span className="text-[var(--blue-light)]">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="border-b border-[var(--border)]">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
          <p className="eyebrow">Everything in one place</p>
          <h2 className="mt-3 max-w-xl text-3xl font-semibold leading-tight text-white">A calmer way to prepare, practice, and improve.</h2>
          <div className="mt-10 grid gap-px overflow-hidden rounded-[10px] border border-[var(--border)] bg-[var(--border)] md:grid-cols-3">
            {features.map((feature) => (
              <article key={feature.title} className="bg-[var(--bg-secondary)] p-6">
                <span className="icon-tile">{feature.icon}</span>
                <h3 className="mt-5 text-sm font-semibold text-white">{feature.title}</h3>
                <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">{feature.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="workflow" className="border-b border-[var(--border)]">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[0.7fr_1.3fr]">
            <div>
              <p className="eyebrow">How it works</p>
              <h2 className="mt-3 text-3xl font-semibold leading-tight text-white">One repeatable loop for better interviews.</h2>
            </div>
            <div className="divide-y divide-[var(--border)] border-y border-[var(--border)]">
              {[["01", "Choose a focus", "Select your target role, question category, and difficulty."], ["02", "Answer naturally", "Speak or type while PrepAI reviews content and delivery."], ["03", "Practice what matters", "Use your report and AI coach to target the highest-impact improvement."]].map(([num, title, body]) => (
                <div key={num} className="grid gap-3 py-6 sm:grid-cols-[70px_180px_1fr]">
                  <span className="text-xs font-semibold text-[var(--blue-light)]">{num}</span>
                  <h3 className="text-sm font-semibold text-white">{title}</h3>
                  <p className="text-sm leading-6 text-[var(--text-secondary)]">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>

    <footer id="contact" className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-8 text-xs text-[var(--text-muted)] sm:flex-row sm:items-center sm:justify-between lg:px-8">
      <span>PrepAI · AI-powered interview training</span>
      <a href="mailto:Toufeeqmir124@gmail.com" className="text-[var(--text-secondary)] no-underline hover:text-white">Toufeeqmir124@gmail.com</a>
    </footer>
  </div>
);

export default Landing;
