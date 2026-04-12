const DashboardStatCard = ({ label, value, sub, color }) => (
  <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
    <div className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">{label}</div>
    <div className="mt-2 text-3xl font-black" style={{ color }}>
      {value}
    </div>
    {sub && <div className="mt-1 text-sm text-slate-500">{sub}</div>}
  </div>
);

export default DashboardStatCard;

