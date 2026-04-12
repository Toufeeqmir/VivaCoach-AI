import { Link } from "react-router-dom";

const LandingNavbar = () => {
  return (
    <nav className="relative z-50 border-b border-white/10 bg-[rgba(10,10,10,0.35)]">
      <div className="flex items-center justify-between px-6 py-5 md:px-10">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.15)]">
            <span className="font-['Syne',sans-serif] text-sm font-extrabold text-white">P</span>
          </div>
          <span className="font-['Syne',sans-serif] text-[22px] font-extrabold text-white">
            Prep<span className="text-[#f97316]">AI</span>
          </span>
        </div>

        <div className="hidden items-center gap-6 text-xs font-semibold uppercase tracking-[0.18em] text-white/70 md:flex">
          <a href="#top" className="no-underline hover:text-white">
            Home
          </a>
          <a href="#about" className="no-underline hover:text-white">
            About
          </a>
          <a href="#features" className="no-underline hover:text-white">
            Services
          </a>
          <a href="#how" className="no-underline hover:text-white">
            Process
          </a>
          <a href="#contact" className="no-underline hover:text-white">
            Contact
          </a>
        </div>

        <div className="flex gap-3">
          <Link
            to="/login"
            className="rounded-xl px-4 py-2 text-sm font-semibold text-white/80 no-underline transition hover:bg-white/5 hover:text-white"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="rounded-xl bg-[#f97316] px-5 py-2 text-sm font-extrabold text-black no-underline shadow-[0_0_18px_rgba(249,115,22,0.35)] transition hover:-translate-y-0.5"
          >
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default LandingNavbar;

