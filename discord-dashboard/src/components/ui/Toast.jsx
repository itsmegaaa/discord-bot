import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

const styles = {
  success: {
    icon: CheckCircle2,
    accent: 'border-l-[#22C55E]',
    iconClass: 'text-[#22C55E]',
  },
  error: {
    icon: AlertCircle,
    accent: 'border-l-[#EF4444]',
    iconClass: 'text-[#EF4444]',
  },
  info: {
    icon: Info,
    accent: 'border-l-[#38BDF8]',
    iconClass: 'text-[#38BDF8]',
  },
};

export default function Toast({ message, type = 'success', onClose }) {
  if (!message) return null;

  const tone = styles[type] || styles.info;
  const Icon = tone.icon;

  return (
    <div
      className={`pointer-events-auto flex w-full items-start gap-3 rounded-xl border border-l-4 border-white/10 bg-[#11131A]/95 p-4 text-sm text-slate-100 shadow-xl shadow-black/30 backdrop-blur ${tone.accent}`}
      role="status"
    >
      <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${tone.iconClass}`} aria-hidden="true" />
      <div className="min-w-0 flex-1 font-medium leading-5">{message}</div>
      <button
        type="button"
        className="rounded-lg p-1 text-slate-400 transition hover:bg-white/10 hover:text-white"
        onClick={onClose}
        aria-label="Close notification"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}

export function ToastViewport({ toasts, onClose }) {
  return (
    <div className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex flex-col gap-3 sm:bottom-auto sm:left-auto sm:right-5 sm:top-5 sm:w-96">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => onClose(toast.id)}
        />
      ))}
    </div>
  );
}
