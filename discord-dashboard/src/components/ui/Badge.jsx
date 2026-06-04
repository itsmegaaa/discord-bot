export default function Badge({ children, tone = 'neutral' }) {
  const tones = {
    neutral: 'bg-white/10 text-[#b5bac1]',
    success: 'bg-[#57f287]/15 text-[#57f287]',
    danger: 'bg-[#ed4245]/15 text-[#ed4245]',
    warning: 'bg-[#fee75c]/15 text-[#fee75c]',
  };
  return <span className={`rounded-full px-3 py-1 text-xs font-medium ${tones[tone]}`}>{children}</span>;
}
