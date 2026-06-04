export default function Card({ title, children, actions }) {
  return (
    <section className="rounded-lg border border-white/5 bg-[#313338] p-5">
      {(title || actions) && (
        <div className="mb-4 flex items-center justify-between gap-4">
          {title && <h2 className="text-lg font-semibold text-[#f2f3f5]">{title}</h2>}
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}
