import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate(location.state?.from?.pathname || "/dashboard", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen bg-[var(--bg-primary)] lg:grid-cols-[0.9fr_1.1fr]">
      <div className="hidden border-r border-[var(--border)] bg-[var(--bg-secondary)] p-10 lg:flex lg:flex-col lg:justify-between">
        <Link to="/" className="flex items-center gap-3 no-underline">
          <span className="brand-mark">AI</span>
          <span className="text-[15px] font-semibold text-white">PrepAI</span>
        </Link>
        <div className="max-w-md">
          <span className="ui-badge">Focused interview preparation</span>
          <h2 className="mt-6 text-4xl font-semibold leading-tight text-white">Practice with purpose. Improve with evidence.</h2>
          <p className="mt-5 text-sm leading-6 text-[var(--text-secondary)]">Your sessions, feedback, coaching, and progress reports stay together in one calm workspace.</p>
        </div>
        <p className="text-[11px] text-[var(--text-muted)]">PrepAI · AI-powered interview training</p>
      </div>
      <div className="flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-[420px]">
          <Link to="/" className="mb-8 flex items-center gap-3 no-underline lg:hidden">
            <span className="brand-mark">AI</span>
            <span className="text-[15px] font-semibold text-white">PrepAI</span>
          </Link>
          <div className="mb-6">
            <p className="eyebrow">Welcome back</p>
            <h1 className="mt-2 text-2xl font-semibold text-white">Log in to your workspace</h1>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">Continue your interview preparation.</p>
          </div>

          <div className="ui-card p-6">
          {error && (
            <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="mb-2 block text-xs font-medium text-[var(--text-secondary)]">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="ui-input"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium text-[var(--text-secondary)]">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="ui-input"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="ui-btn-primary mt-2 w-full"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="mt-5 text-center text-xs text-[var(--text-secondary)]">
            Don't have an account?{" "}
            <Link to="/register" className="font-medium text-[var(--blue-light)] no-underline hover:underline">
              Register here
            </Link>
          </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
