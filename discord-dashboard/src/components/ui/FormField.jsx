export default function FormField({ children, description, label }) {
  return (
    <label className="grid gap-2 text-sm">
      {label && <span className="font-medium text-slate-200">{label}</span>}
      {children}
      {description && <span className="text-xs leading-5 text-slate-500">{description}</span>}
    </label>
  );
}
