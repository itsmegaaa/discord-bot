const variants = {
  primary: 'border-[#5865f2]/70 bg-[#5865f2] text-white shadow-lg shadow-[#5865f2]/20 hover:bg-[#4752c4]',
  secondary: 'border-white/10 bg-white/[0.04] text-slate-100 hover:bg-white/[0.08]',
  danger: 'border-[#ef4444]/60 bg-[#ef4444]/15 text-[#fecaca] hover:bg-[#ef4444]/25',
  ghost: 'border-transparent bg-transparent text-slate-300 hover:bg-white/[0.06] hover:text-white',
};

const sizes = {
  sm: 'min-h-9 px-3 text-sm',
  md: 'min-h-10 px-4 text-sm',
  lg: 'min-h-12 px-5 text-base',
};

export default function Button({
  as: Component = 'button',
  children,
  className = '',
  disabled,
  loading,
  size = 'md',
  type = 'button',
  variant = 'primary',
  ...props
}) {
  const isButton = Component === 'button';
  return (
    <Component
      className={`inline-flex items-center justify-center gap-2 rounded-xl border font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={isButton ? disabled || loading : undefined}
      type={isButton ? type : undefined}
      aria-disabled={!isButton && (disabled || loading) ? true : undefined}
      {...props}
    >
      {loading ? 'Loading...' : children}
    </Component>
  );
}
