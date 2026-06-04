export default function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex min-h-11 items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-left transition hover:bg-white/[0.06]"
      aria-pressed={checked}
    >
      {label && <span className="text-sm font-medium text-slate-100">{label}</span>}
      <span className={`relative h-6 w-11 shrink-0 rounded-full border transition ${checked ? 'border-[#5865f2]/80 bg-[#5865f2]' : 'border-white/10 bg-[#242938]'}`}>
        <span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${checked ? 'left-6' : 'left-1'}`} />
      </span>
    </button>
  );
}
