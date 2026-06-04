export default function SectionCard({ actions, children, className = '', description, title }) {
  return (
    <section className={`rounded-2xl border border-white/10 bg-[#171a23]/90 p-5 shadow-xl shadow-black/20 ${className}`}>
      {(title || description || actions) && (
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            {title && <h2 className="text-base font-semibold text-slate-100">{title}</h2>}
            {description && <p className="mt-1 text-sm leading-6 text-slate-400">{description}</p>}
          </div>
          {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  );
}
