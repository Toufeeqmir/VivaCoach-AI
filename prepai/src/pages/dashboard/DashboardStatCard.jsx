const DashboardStatCard = ({ label, value, sub, index = 0 }) => (
  <article className="section-card min-h-[132px]">
    <span className="icon-tile h-8 w-8 text-[9px]">{String(index + 1).padStart(2, "0")}</span>
    <p className="mt-4 text-2xl font-semibold text-white">{value}</p>
    <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
      <p className="text-xs text-[var(--text-secondary)]">{label}</p>
      {sub && <p className="text-[10px] text-[var(--text-muted)]">{sub}</p>}
    </div>
  </article>
);

export default DashboardStatCard;
