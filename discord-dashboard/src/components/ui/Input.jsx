export default function Input({ className = '', ...props }) {
  return (
    <input
      className={`min-h-10 w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 transition focus:border-[#5865f2] focus:ring-2 focus:ring-[#5865f2]/20 ${className}`}
      {...props}
    />
  );
}
