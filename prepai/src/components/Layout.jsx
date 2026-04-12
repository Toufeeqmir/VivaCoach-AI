import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navLinks = [
    { path: "/dashboard", label: "Dashboard" },
    // { path: "/session", label: "Practice" },
    { path: "/interview", label: "Interview" },
    { path: "/report", label: "Report" },
  ];

  const navIcons = {
    "/dashboard": "▦",
    "/interview": "💬",
    "/report": "📊",
  };

  const Sidebar = ({ onNavigate }) => (
    <aside
      className={[
        "h-full border-r border-slate-200 bg-white",
        collapsed ? "w-[84px]" : "w-[280px]",
      ].join(" ")}
    >
      <div className="flex h-full flex-col">
        {/* Brand */}
        <div className="flex items-center justify-between px-5 py-5">
          <Link to="/dashboard" className="flex items-center gap-3 no-underline" onClick={onNavigate}>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--cyan)] shadow-[0_0_18px_#00d4ff55]">
              <span className="font-['Syne',sans-serif] text-base font-extrabold text-[#050810]">P</span>
            </div>
            {!collapsed && (
              <div className="leading-tight">
                <div className="font-['Syne',sans-serif] text-lg font-extrabold text-slate-900">
                  Prep<span className="text-[var(--cyan)]">AI</span>
                </div>
                <div className="text-xs text-slate-400">Overview</div>
              </div>
            )}
          </Link>
          <button
            type="button"
            className="hidden rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-500 hover:bg-slate-50 md:inline-flex"
            onClick={() => setCollapsed((v) => !v)}
            aria-label="Toggle sidebar"
            title="Toggle sidebar"
          >
            {collapsed ? "›" : "‹"}
          </button>
        </div>

        {/* Nav */}
        <nav className="px-3">
          <div className="mb-3 px-2 text-[11px] font-bold uppercase tracking-widest text-slate-400">
            {!collapsed ? "Menu" : " "}
          </div>
          <div className="space-y-1">
            {navLinks.map((link) => {
              const active = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={onNavigate}
                  className={[
                    "flex items-center gap-3 rounded-2xl px-3 py-3 no-underline transition",
                    active
                      ? "bg-emerald-100 text-slate-900"
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-900",
                  ].join(" ")}
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-lg">
                    {navIcons[link.path] || "•"}
                  </span>
                  {!collapsed && <span className="text-sm font-semibold">{link.label}</span>}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Projects (static list for UI like screenshot) */}
        {!collapsed && (
          <div className="mt-6 px-5">
            <div className="mb-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">Projects</div>
            <div className="space-y-2">
              {["Brand Logo Design", "User Research", "Marketing Sales"].map((p) => (
                <div key={p} className="flex items-center gap-3 rounded-2xl px-3 py-2 text-sm text-slate-600 hover:bg-slate-100">
                  <span className="text-slate-400">#</span>
                  <span className="truncate">{p}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-auto border-t border-slate-200 px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-sm font-extrabold text-white">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-slate-900">{user?.name || "User"}</div>
                <div className="truncate text-xs text-slate-400">{user?.email || "Signed in"}</div>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Mobile top bar */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 md:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
        >
          ☰
        </button>
        <div className="font-['Syne',sans-serif] text-lg font-extrabold text-slate-900">
          Prep<span className="text-[var(--cyan)]">AI</span>
        </div>
        <div className="h-9 w-9 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-sm font-extrabold">
          {user?.name?.charAt(0)?.toUpperCase() || "U"}
        </div>
      </div>

      <div className="flex min-h-screen">
        {/* Desktop sidebar */}
        <div className="hidden md:block">
          <Sidebar />
        </div>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
            <div className="absolute inset-y-0 left-0 w-[300px]">
              <Sidebar onNavigate={() => setMobileOpen(false)} />
            </div>
          </div>
        )}

        {/* Main content */}
        <div className="flex-1">
          <main className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-10">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;
