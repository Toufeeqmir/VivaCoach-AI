import { useEffect, useState } from "react";

import LandingCTA from "./LandingCTA";
import LandingFeatures from "./LandingFeatures";
import LandingFooter from "./LandingFooter";
import LandingHero from "./LandingHero";
import LandingHowItWorks from "./LandingHowItWorks";
import LandingNavbar from "./LandingNavbar";

const Landing = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
  }, []);

  return (
    <div className="min-h-screen font-['DM_Sans',sans-serif] bg-[#070707]">
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-60">
        <div className="absolute inset-0 bg-[radial-gradient(700px_500px_at_30%_15%,rgba(255,255,255,0.06),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(700px_500px_at_70%_35%,rgba(0,212,255,0.10),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(600px_420px_at_65%_70%,rgba(249,115,22,0.10),transparent_60%)]" />
        <div className="absolute inset-0 bg-[repeating-linear-gradient(135deg,rgba(255,255,255,0.06)_0px,rgba(255,255,255,0.06)_1px,transparent_1px,transparent_18px)]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
        <div className="rounded-[28px] border border-white/15 bg-[rgba(10,10,10,0.75)] shadow-[0_40px_120px_rgba(0,0,0,0.55)] backdrop-blur">
          <LandingNavbar />
          <LandingHero visible={visible} />
          <LandingFeatures />
          <LandingHowItWorks />
          <LandingCTA />
          <LandingFooter />
        </div>
      </div>
    </div>
  );
};

export default Landing;

