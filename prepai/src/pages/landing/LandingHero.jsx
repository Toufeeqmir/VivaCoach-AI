import { Link } from "react-router-dom";

import LandingHeroIllustration from "./LandingHeroIllustration";

const LandingHero = ({ visible }) => {
  return (
    <section id="top" className="relative overflow-hidden">
      <div className="grid items-center gap-12 px-6 py-14 md:grid-cols-2 md:px-10 md:py-20">
        <div className={`transition-all duration-700 ease-out ${visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}>
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-white/60">AI Interview Coach</div>
          <h1 className="mt-4 font-['Syne',sans-serif] text-[clamp(38px,5.4vw,66px)] font-extrabold leading-[1.05] text-white tracking-tight">
            Interview Practice
            <br />
            With Real-Time AI
            <br />
            Feedback
          </h1>

          <p id="about" className="mt-6 max-w-xl text-base leading-relaxed text-white/70 md:text-lg">
            PrepAI helps you improve confidence, clarity, and expressions with voice + emotion analysis and smart scoring after every session.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              to="/register"
              className="rounded-xl bg-[#f97316] px-6 py-3 text-sm font-extrabold text-black no-underline shadow-[0_0_18px_rgba(249,115,22,0.35)] transition hover:-translate-y-0.5"
            >
              Start Practicing
            </Link>
            <a
              href="#features"
              className="rounded-xl border border-white/15 bg-white/0 px-6 py-3 text-sm font-semibold text-white no-underline transition hover:bg-white/5"
            >
              Explore Features →
            </a>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-6 text-xs font-semibold text-white/55">
            {["Trusted feedback", "Real interview questions", "Instant scoring", "No credit card"].map((t) => (
              <span key={t} className="inline-flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#f97316]" />
                {t}
              </span>
            ))}
          </div>
        </div>

        <div
          className={`transition-all duration-1000 ease-out delay-200 ${visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`}
        >
          <div className="mx-auto w-full max-w-[560px]">
            <div className="rounded-[26px] border border-white/15 bg-white/5 p-5 shadow-[0_0_60px_rgba(0,0,0,0.45)]">
              <LandingHeroIllustration className="aspect-[4/3] w-full" />
              <div className="mt-4 grid grid-cols-3 gap-3">
                {[
                  ["Live", "Feedback"],
                  ["Voice", "Analysis"],
                  ["Smart", "Scoring"],
                ].map(([a, b]) => (
                  <div key={a} className="rounded-2xl border border-white/10 bg-black/30 px-3 py-3 text-center">
                    <div className="text-sm font-extrabold text-white">{a}</div>
                    <div className="text-[11px] font-semibold uppercase tracking-widest text-white/55">{b}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingHero;

