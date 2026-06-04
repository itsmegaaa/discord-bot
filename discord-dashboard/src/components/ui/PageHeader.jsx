export default function PageHeader({ actions, icon: Icon, subtitle, title }) {
  return (
    <div className="mb-6 flex flex-col gap-4 border-b border-white/10 pb-5 md:flex-row md:items-end md:justify-between">
      <div className="flex min-w-0 gap-4">
        {Icon && (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#5865f2]/30 bg-[#5865f2]/15 text-[#a5b4fc]">
            <Icon size={24} />
          </div>
        )}
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-slate-50 md:text-3xl">{title}</h1>
          {subtitle && <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
