import { Link } from "react-router-dom";

const DashboardHeader = ({ query, onQueryChange }) => (
  <header className="border-b border-[var(--border)] bg-[var(--bg-primary)]">
    <div className="mx-auto flex max-w-[1400px] flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between lg:px-8">
      <div>
        <h1 className="text-2xl font-semibold leading-[1.25] tracking-[0] text-white">Dashboard</h1>
        <p className="mt-1.5 text-base font-normal leading-6 tracking-[0] text-[var(--text-secondary)]">Your interview preparation overview</p>
      </div>
      <div className="flex items-center gap-2">
        <input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          className="ui-input h-10 w-full py-2 text-base leading-6 sm:w-56"
          placeholder="Search your workspace"
          aria-label="Search workspace"
        />
        <Link to="/interview" className="ui-btn-primary shrink-0 text-base font-semibold leading-6 no-underline">New session</Link>
      </div>
    </div>
  </header>
);

export default DashboardHeader;
