import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api";

const formatDate = (value) => {
  if (!value) return "No sessions yet";

  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const TesterList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await API.get("/admin/users");
        setUsers(res.data.users || []);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || "Unable to load tester list.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="app-page">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6">
          <p className="eyebrow">Admin</p>
          <h1 className="mt-2 text-2xl font-semibold text-white">Tester reports</h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">Open any tester to review their completed interview analytics.</p>
        </div>

        <section className="section-card overflow-hidden">
          {loading ? (
            <div className="flex min-h-[260px] items-center justify-center text-sm text-[var(--text-secondary)]">
              Loading testers...
            </div>
          ) : error ? (
            <div className="rounded-[8px] border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Sessions</th>
                    <th className="px-4 py-3">Last active</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      tabIndex={0}
                      onClick={() => navigate(`/admin/users/${user.id}`)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") navigate(`/admin/users/${user.id}`);
                      }}
                      className="cursor-pointer border-b border-[var(--border)] text-[var(--text-secondary)] transition last:border-b-0 hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] focus:bg-[var(--bg-secondary)] focus:outline-none"
                    >
                      <td className="px-4 py-4 font-medium text-[var(--text-primary)]">{user.name || "Unnamed user"}</td>
                      <td className="px-4 py-4">{user.email}</td>
                      <td className="px-4 py-4">{user.sessionCount || 0}</td>
                      <td className="px-4 py-4">{formatDate(user.lastSessionDate)}</td>
                    </tr>
                  ))}
                  {!users.length && (
                    <tr>
                      <td colSpan={4} className="px-4 py-12 text-center text-[var(--text-muted)]">
                        No users found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default TesterList;
