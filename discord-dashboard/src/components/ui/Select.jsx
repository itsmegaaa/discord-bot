export const optionClassName = 'bg-[#11131A] text-slate-100 disabled:text-slate-500';

export default function Select({ children, className = '', ...props }) {
  return (
    <select
      className={`min-h-10 w-full rounded-xl border border-white/10 bg-[#11131A] px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-[#5865F2] focus:ring-2 focus:ring-[#5865F2]/30 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}
