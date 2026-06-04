const tones = {
  default: 'border-white/10 bg-white/[0.04] text-slate-300',
  success: 'border-[#22c55e]/25 bg-[#22c55e]/10 text-[#86efac]',
  warning: 'border-[#f59e0b]/25 bg-[#f59e0b]/10 text-[#fcd34d]',
  danger: 'border-[#ef4444]/25 bg-[#ef4444]/10 text-[#fecaca]',
  info: 'border-[#38bdf8]/25 bg-[#38bdf8]/10 text-[#7dd3fc]',
};

export default function StatusBadge({ children, tone = 'default' }) {
  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${tones[tone]}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {children}
    </span>
  );
}
