export default function StatCard({ icon: Icon, label, tone = 'primary', value }) {
  const tones = {
    primary: 'border-[#5865f2]/25 bg-[#5865f2]/10 text-[#a5b4fc]',
    success: 'border-[#22c55e]/25 bg-[#22c55e]/10 text-[#86efac]',
    warning: 'border-[#f59e0b]/25 bg-[#f59e0b]/10 text-[#fcd34d]',
    info: 'border-[#38bdf8]/25 bg-[#38bdf8]/10 text-[#7dd3fc]',
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-[#171a23]/90 p-5 shadow-xl shadow-black/15">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400">{label}</p>
          <p className="mt-2 text-2xl font-bold text-slate-50">{value}</p>
        </div>
        {Icon && (
          <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${tones[tone]}`}>
            <Icon size={21} />
          </div>
        )}
      </div>
    </div>
  );
}
