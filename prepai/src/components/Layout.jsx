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

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
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

  const Sidebar = ({ onNavigate }) => (
    <aside className="flex h-full w-[224px] flex-col border-r border-[var(--border)] bg-[var(--bg-secondary)]">
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
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-[var(--border)] bg-[var(--bg-secondary)] px-4 md:hidden">
        <button type="button" onClick={() => setMobileOpen(true)} className="ui-btn-ghost h-9 min-h-9 w-9 px-0" aria-label="Open menu">
          <span className="text-lg">=</span>
        </button>
        <Link to="/dashboard" className="flex items-center gap-2 no-underline">
          <span className="brand-mark h-8 w-8 rounded-[7px]">AI</span>
          <span className="text-sm font-semibold text-white">PrepAI</span>
        </Link>
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--blue-deep)] text-[10px] font-semibold text-[var(--blue-light)]">
          {initials}
        </span>
      </header>

      <div className="flex min-h-screen">
        <div className="fixed inset-y-0 left-0 hidden md:block">
          <Sidebar />
        </div>

        {mobileOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <button type="button" className="absolute inset-0 bg-black/70" onClick={() => setMobileOpen(false)} aria-label="Close menu" />
            <div className="absolute inset-y-0 left-0">
              <Sidebar onNavigate={() => setMobileOpen(false)} />
            </div>
          </div>
        )}

        <main className="min-w-0 flex-1 md:ml-[224px]">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
