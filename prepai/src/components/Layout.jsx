import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navLinks = [
  { path: "/dashboard", label: "Dashboard", short: "DB" },
  { path: "/interview", label: "Interview", short: "IN" },
  { path: "/report", label: "Report", short: "RP" },
  { path: "/coach", label: "AI coach", short: "AI" },
  { path: "/session", label: "Expression lab", short: "EX" },
];

const MenuIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
);

const SearchIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="m21 21-4.3-4.3M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z" />
  </svg>
);

const HomeIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 11 9-8 9 8" />
    <path d="M5 10v10h14V10" />
  </svg>
);

const MicIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M12 14a4 4 0 0 0 4-4V7a4 4 0 0 0-8 0v3a4 4 0 0 0 4 4Z" />
    <path d="M19 10a7 7 0 0 1-14 0M12 17v4" />
  </svg>
);

const BotIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 8V4" />
    <rect x="5" y="8" width="14" height="11" rx="4" />
    <path d="M9 13h.01M15 13h.01" />
  </svg>
);

const ChartIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M4 19V5M4 19h16" />
    <path d="M8 16v-5M12 16V8M16 16v-8" />
  </svg>
);

const UserIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M20 21a8 8 0 0 0-16 0" />
    <path d="M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z" />
  </svg>
);

const bottomNavLinks = [
  { path: "/dashboard", label: "Dashboard", Icon: HomeIcon },
  { path: "/interview", label: "Interview", Icon: MicIcon },
  { path: "/coach", label: "AI Coach", Icon: BotIcon },
  { path: "/report", label: "Reports", Icon: ChartIcon },
];

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const visibleNavLinks = user?.isAdmin
    ? [...navLinks, { path: "/admin", label: "Admin", short: "AD" }]
    : navLinks;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const initials = (user?.name || "User")
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  const Sidebar = ({ onNavigate, mobile = false }) => (
    <aside
      className={[
        "flex h-full flex-col border-r border-[var(--border)] bg-[var(--bg-secondary)]",
        mobile ? "w-[286px] rounded-r-[20px] shadow-[24px_0_60px_rgba(0,0,0,0.35)]" : "w-[224px]",
      ].join(" ")}
    >
      <Link to="/dashboard" onClick={onNavigate} className="flex h-[74px] items-center gap-3 border-b border-[var(--border)] px-5 no-underline">
        <span className="brand-mark">AI</span>
        <span className="text-[15px] font-semibold text-[var(--text-primary)]">PrepAI</span>
      </Link>

      <nav className="flex-1 px-3 py-5">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">Menu</p>
        <div className="space-y-1">
          {visibleNavLinks.map((link) => {
            const active = link.path === "/admin" ? location.pathname.startsWith("/admin") : location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={onNavigate}
                className={[
                  "flex min-h-11 items-center gap-3 rounded-[8px] border px-3 text-[13px] font-medium no-underline transition",
                  active
                    ? "border-[var(--blue-border)] bg-[var(--blue-tint)] text-[var(--blue-light)]"
                    : "border-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-card)] hover:text-[var(--text-primary)]",
                ].join(" ")}
              >
                <span className={active ? "icon-tile h-7 w-7 rounded-[6px] text-[9px]" : "inline-flex h-7 w-7 items-center justify-center text-[9px] text-[var(--text-muted)]"}>
                  {link.short}
                </span>
                {link.label}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="border-t border-[var(--border)] p-3">
        <div className="mb-2 flex items-center gap-3 rounded-[8px] bg-[var(--bg-card)] p-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--blue-deep)] text-[11px] font-semibold text-[var(--blue-light)]">
            {initials}
          </span>
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-[var(--text-primary)]">{user?.name || "User"}</p>
            <p className="mt-0.5 text-[10px] text-[var(--text-muted)]">Free plan</p>
          </div>
        </div>
        <button type="button" onClick={handleLogout} className="ui-btn-ghost w-full text-xs">
          Sign out
        </button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--bg-primary)] md:hidden">
        <div className="flex h-[72px] items-center gap-2 px-4">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] border border-[var(--border-strong)] bg-[var(--bg-secondary)] text-[var(--text-primary)] transition duration-200 active:scale-95"
            aria-label="Open menu"
          >
            <MenuIcon />
          </button>
          <Link to="/dashboard" className="flex min-w-0 flex-1 items-center gap-2 no-underline">
            <span className="brand-mark h-9 w-9 rounded-[10px]">AI</span>
            <span className="truncate text-base font-semibold leading-6 text-white">PrepAI</span>
          </Link>
          <button
            type="button"
            onClick={() => setMobileSearchOpen((open) => !open)}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] border border-[var(--border-strong)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] transition duration-200 active:scale-95"
            aria-label="Search workspace"
            aria-expanded={mobileSearchOpen}
          >
            <SearchIcon />
          </button>
          <Link
            to="/interview"
            className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-[14px] border border-[var(--blue)] bg-[var(--blue)] px-4 text-base font-semibold leading-6 text-white no-underline transition duration-200 active:scale-95"
          >
            New Session
          </Link>
        </div>
        {mobileSearchOpen && (
          <div className="mobile-search-panel px-4 pb-4">
            <input
              className="ui-input min-h-11 rounded-[14px] py-2 text-base leading-6"
              placeholder="Search your workspace"
              aria-label="Search workspace"
            />
          </div>
        )}
      </header>

      <div className="flex min-h-screen">
        <div className="fixed inset-y-0 left-0 hidden md:block">
          <Sidebar />
        </div>

        {mobileOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <button type="button" className="mobile-sidebar-overlay absolute inset-0 bg-black/70" onClick={() => setMobileOpen(false)} aria-label="Close menu" />
            <div className="mobile-sidebar-panel absolute inset-y-0 left-0">
              <Sidebar mobile onNavigate={() => setMobileOpen(false)} />
            </div>
          </div>
        )}

        <main className="min-w-0 flex-1 md:ml-[224px]">{children}</main>
      </div>

      <nav className="fixed inset-x-3 bottom-3 z-40 grid grid-cols-5 rounded-[22px] border border-[var(--border-strong)] bg-[var(--bg-secondary)] p-1 shadow-[0_18px_45px_rgba(0,0,0,0.42)] md:hidden" aria-label="Primary mobile navigation">
        {bottomNavLinks.map(({ path, label, Icon }) => {
          const active = path === "/report" ? location.pathname.startsWith("/report") : location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              aria-current={active ? "page" : undefined}
              className={[
                "flex min-h-[58px] min-w-0 flex-col items-center justify-center gap-1 rounded-[18px] px-1 text-[11px] font-medium leading-none no-underline transition duration-200 active:scale-95",
                active
                  ? "bg-[var(--blue-tint)] text-[var(--blue-light)]"
                  : "text-[var(--text-secondary)] hover:bg-[var(--bg-card)] hover:text-[var(--text-primary)]",
              ].join(" ")}
            >
              <Icon />
              <span className="w-full truncate text-center">{label}</span>
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="flex min-h-[58px] min-w-0 flex-col items-center justify-center gap-1 rounded-[18px] px-1 text-[11px] font-medium leading-none text-[var(--text-secondary)] transition duration-200 hover:bg-[var(--bg-card)] hover:text-[var(--text-primary)] active:scale-95"
        >
          <UserIcon />
          <span className="w-full truncate text-center">Profile</span>
        </button>
      </nav>
    </div>
  );
};

export default Layout;
