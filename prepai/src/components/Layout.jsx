import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const IconBox = ({ active = false }) => (
  <span
    className={[
      "inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-[4px] border text-[10px]",
      active ? "border-zinc-200 bg-zinc-900 text-zinc-100" : "border-zinc-500 text-zinc-400",
    ].join(" ")}
  >
    <span className="h-2 w-2 rounded-[2px] border border-current" />
  </span>
);

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navLinks = [
    { path: "/dashboard", label: "Dashboard", tag: "Home" },
    { path: "/interview", label: "Interview" },
    { path: "/report", label: "Report" },
    { path: "/coach", label: "AI Coach" },
  ];

  const userInitial = user?.name?.charAt(0)?.toUpperCase() || "U";
  const needsInset = location.pathname === "/session";

  const Sidebar = ({ onNavigate }) => (
    <aside className="flex h-full w-[308px] shrink-0 flex-col border-r border-[#474744] bg-[#2f302d] text-zinc-100 lg:w-[348px]">
      <div className="flex h-[104px] items-center gap-4 border-b border-[#474744] px-7">
        <Link to="/dashboard" className="flex items-center gap-4 no-underline" onClick={onNavigate}>
          <div className="flex h-12 w-12 items-center justify-center rounded-[10px] bg-[#111110] font-serif text-lg font-bold text-white">
            PA
          </div>
          <span className="text-2xl font-black text-white">PrepAI</span>
        </Link>
      </div>

      <nav className="flex-1 px-4 py-5">
        <div className="mb-4 text-sm font-black uppercase text-[#b4b0a8]">Menu</div>
        <div className="space-y-2">
          {navLinks.map((link) => {
            const active = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={onNavigate}
                className={[
                  "flex min-h-[52px] items-center gap-4 rounded-[14px] px-5 text-lg font-semibold no-underline transition",
                  active ? "bg-[#232421] text-white" : "text-[#c9c6bf] hover:bg-[#272824] hover:text-white",
                ].join(" ")}
              >
                <IconBox active={active} />
                <span className="min-w-0 flex-1 truncate">{link.label}</span>
                {active && link.tag && (
                  <span className="rounded-full bg-[#10100f] px-4 py-1 text-sm font-semibold text-white">{link.tag}</span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="border-t border-[#474744] px-7 py-5">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#090909] text-lg font-black text-white">
            {userInitial}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-lg font-black text-white">{user?.name || "User"}</div>
            <div className="truncate text-base text-[#aaa69e]">Free plan</div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex h-9 w-9 items-center justify-center rounded-[8px] border border-[#55554f] bg-transparent text-zinc-300 transition hover:border-zinc-300 hover:text-white"
            aria-label="Logout"
            title="Logout"
          >
            <span className="h-3 w-3 rounded-[2px] border border-current" />
          </button>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-[#10100f] text-zinc-100">
      <div className="sticky top-0 z-40 flex h-[72px] items-center justify-between border-b border-[#474744] bg-[#2f302d] px-4 md:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-[8px] border border-[#55554f] text-white"
          aria-label="Open menu"
        >
          <span className="h-4 w-4 border-y border-current" />
        </button>
        <Link to="/dashboard" className="flex items-center gap-3 text-xl font-black text-white no-underline">
          <span className="flex h-9 w-9 items-center justify-center rounded-[8px] bg-[#111110] font-serif text-sm">PA</span>
          PrepAI
        </Link>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#090909] font-black text-white">
          {userInitial}
        </div>
      </div>

      <div className="flex min-h-screen">
        <div className="hidden md:block">
          <Sidebar />
        </div>

        {mobileOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-black/60"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
            />
            <div className="absolute inset-y-0 left-0 max-w-[86vw]">
              <Sidebar onNavigate={() => setMobileOpen(false)} />
            </div>
          </div>
        )}

        <main className="min-w-0 flex-1 bg-[#10100f]">
          {needsInset ? <div className="p-6 md:p-10">{children}</div> : children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
