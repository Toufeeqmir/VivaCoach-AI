import { landingFeatures } from "./landingData";

const LandingFeatures = () => {
  return (
    <section id="features" className="px-6 py-16 md:px-10 md:py-20">
      <div className="mb-10">
        <div className="text-center text-xs font-semibold uppercase tracking-[0.22em] text-white/55">Services</div>
        <h2 className="mt-3 text-center font-['Syne',sans-serif] text-4xl font-extrabold text-white md:text-5xl">
          What we do
        </h2>
        <p className="mt-4 text-center text-sm text-white/65 md:text-base">Everything you need to practice, score, and improve.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {landingFeatures.map((f, i) => (
          <div
            key={i}
            className="group cursor-default rounded-[26px] border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-7 transition duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-[0_0_60px_rgba(0,0,0,0.35)]"
          >
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-black/25 text-2xl transition group-hover:scale-105">
              {f.icon}
            </div>
            <h3 className="mb-2 font-['Syne',sans-serif] text-lg font-extrabold text-white">{f.title}</h3>
            <p className="text-sm leading-relaxed text-white/70">{f.desc}</p>
            <div className="mt-5 h-px w-full bg-gradient-to-r from-transparent via-white/15 to-transparent" />
          </div>
        ))}
      </div>
    </section>
  );
};

export default LandingFeatures;

