import { Link } from "react-router-dom";

const LandingCTA = () => {
  return (
    <section id="pricing" className="px-6 py-20 text-center md:px-12">
      <div className="mx-auto max-w-[820px] rounded-[2.5rem] border border-[#00d4ff22] bg-[linear-gradient(180deg,_rgba(0,212,255,0.08),_rgba(255,255,255,0.02))] px-10 py-14 shadow-[0_0_70px_#00d4ff10]">
        <h2 className="mb-4 font-['Syne',sans-serif] text-4xl font-extrabold text-white">Ready to Ace Your Next Interview?</h2>
        <p className="mb-8 text-base text-slate-300">Join PrepAI and start practicing with real AI feedback today.</p>
        <Link
          to="/register"
          className="rounded-2xl bg-[var(--cyan)] px-10 py-4 font-['Syne',sans-serif] text-base font-extrabold text-[#050810] no-underline shadow-[0_0_40px_#00d4ff55] transition hover:-translate-y-0.5"
        >
          Get Started Free
        </Link>
      </div>
    </section>
  );
};

export default LandingCTA;

