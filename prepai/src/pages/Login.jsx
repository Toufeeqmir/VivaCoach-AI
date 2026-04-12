import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid-bg flex min-h-screen items-center justify-center bg-[var(--bg-primary)] px-6 py-10">
      <div className="w-full max-w-[420px]">
        <div className="mb-8 text-center">
          <Link to="/" className="mb-6 inline-flex items-center gap-2 no-underline">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--cyan)] shadow-[0_0_15px_#00d4ff66]">
              <span className="font-['Syne',sans-serif] text-base font-extrabold text-[#050810]">P</span>
            </div>
            <span className="font-['Syne',sans-serif] text-2xl font-extrabold text-white">
              Prep<span className="text-[var(--cyan)]">AI</span>
            </span>
          </Link>
          <h1 className="ui-title text-[28px]">Welcome Back</h1>
          <p className="mt-2 text-sm text-slate-500">Login to continue your interview practice</p>
        </div>

        <div className="ui-card p-8">
          {error && (
            <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="mb-2 block text-[13px] font-medium text-slate-400">Email Address</label>
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
              <label className="mb-2 block text-[13px] font-medium text-slate-400">Password</label>
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
              style={loading ? { background: "#00d4ff88" } : undefined}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-500">
            Don't have an account?{" "}
            <Link to="/register" className="font-medium text-[var(--cyan)] no-underline hover:underline">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
