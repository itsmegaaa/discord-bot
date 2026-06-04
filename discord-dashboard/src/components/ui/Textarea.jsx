export default function Textarea({ className = '', ...props }) {
  return (
    <textarea
      className={`w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm leading-6 text-slate-100 placeholder:text-slate-600 transition focus:border-[#5865f2] focus:ring-2 focus:ring-[#5865f2]/20 ${className}`}
      {...props}
    />
  );
}
