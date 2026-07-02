const DashboardStatCard = ({ label, value, sub, index = 0 }) => (
  <article className="section-card min-h-[132px]">
    <span className="icon-tile h-8 w-8 text-sm leading-none tracking-[0.01em]">{String(index + 1).padStart(2, "0")}</span>
    <p className="mt-3 text-5xl font-bold leading-none tracking-[0] text-white [font-variant-numeric:tabular-nums]">{value}</p>
    <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
      <p className="text-base font-medium leading-6 tracking-[0] text-[var(--text-primary)]">{label}</p>
      {sub && <p className="text-sm font-normal leading-5 tracking-[0] text-[var(--text-secondary)]">{sub}</p>}
    </div>
  </article>
);

export default DashboardStatCard;
