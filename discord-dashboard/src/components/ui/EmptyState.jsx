import { Inbox } from 'lucide-react';

export default function EmptyState({ action, description, icon: Icon = Inbox, title = 'Nothing here yet' }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-6 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-[#94a3b8]">
        <Icon size={22} />
      </div>
      <h3 className="mt-4 text-base font-semibold text-slate-100">{title}</h3>
      {description && <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
