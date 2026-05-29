const DashboardStatCard = ({ label, value, sub, color = "#f8f7f2" }) => (
  <div className="min-h-[188px] rounded-[18px] border border-[#55554f] bg-[#30312e] p-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
    <div className="flex items-start justify-between gap-4">
      <div className="max-w-[130px] text-xl font-semibold leading-tight text-[#aaa69e]">{label}</div>
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[10px] bg-[#242521] text-[#aaa69e]">
        <span className="h-4 w-4 rounded-[3px] border border-current" />
      </div>
    </div>
    <div className="mt-7 font-serif text-5xl leading-none" style={{ color }}>
      {value}
    </div>
    {sub && <div className="mt-5 text-lg font-semibold leading-tight text-[#aaa69e]">{sub}</div>}
  </div>
);

export default DashboardStatCard;
