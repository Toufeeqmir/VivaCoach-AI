import { Link } from "react-router-dom";

import { landingHowSteps } from "./landingData";

const LandingHowItWorks = () => {
  return (
    <section id="how" className="mx-auto max-w-7xl px-6 pb-20 md:px-12">
      <div className="rounded-[2.25rem] border border-white/10 bg-white/5 p-8 md:p-10">
        <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-xs font-extrabold uppercase tracking-widest text-slate-400">How it works</div>
            <h2 className="mt-2 font-['Syne',sans-serif] text-3xl font-extrabold text-white">Train like it’s the real thing</h2>
          </div>
          <Link to="/register" className="ui-btn-primary w-fit no-underline">
            Start now →
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {landingHowSteps.map((s) => (
            <div key={s.step} className="rounded-3xl border border-white/10 bg-[rgba(255,255,255,0.03)] p-6">
              <div className="text-sm font-black text-[var(--cyan)]">{s.step}</div>
              <div className="mt-2 text-lg font-extrabold text-white">{s.title}</div>
              <div className="mt-2 text-sm text-slate-300">{s.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LandingHowItWorks;

