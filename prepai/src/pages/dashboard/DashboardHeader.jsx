import { Link } from "react-router-dom";

const DashboardHeader = ({ query, onQueryChange }) => (
  <header className="border-b border-[var(--border)] bg-[var(--bg-primary)]">
    <div className="mx-auto flex max-w-[1400px] flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between lg:px-8">
      <div>
        <h1 className="text-base font-semibold text-white">Dashboard</h1>
        <p className="mt-1 text-xs text-[var(--text-secondary)]">Your interview preparation overview</p>
      </div>
      <div className="flex items-center gap-2">
        <input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          className="ui-input h-10 w-full py-2 text-xs sm:w-56"
          placeholder="Search your workspace"
          aria-label="Search workspace"
        />
        <Link to="/interview" className="ui-btn-primary shrink-0 text-xs no-underline">New session</Link>
      </div>
    </div>
  </header>
);

export default DashboardHeader;
