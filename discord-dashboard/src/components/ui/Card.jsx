export default function Card({ title, children, actions, className = '' }) {
  return (
    <section className={`rounded-2xl border border-white/10 bg-[#171a23]/90 p-5 shadow-xl shadow-black/20 ${className}`}>
      {(title || actions) && (
        <div className="mb-4 flex items-center justify-between gap-4">
          {title && <h2 className="text-lg font-semibold text-slate-100">{title}</h2>}
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}
