import { AlertTriangle } from 'lucide-react';

export default function ErrorState({ action, description = 'Please try again in a moment.', title = 'Something went wrong' }) {
  return (
    <div className="rounded-2xl border border-[#ef4444]/30 bg-[#ef4444]/10 p-6 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-[#ef4444]/30 bg-[#ef4444]/10 text-[#fecaca]">
        <AlertTriangle size={22} />
      </div>
      <h3 className="mt-4 text-base font-semibold text-[#fee2e2]">{title}</h3>
      {description && <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-[#fecaca]/80">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
