import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import { firebaseConfigError } from './lib/firebase.js';
import { router } from './router/index.jsx';

function ConfigErrorScreen({ message }) {
  return (
    <main className="grid min-h-screen place-items-center bg-[#0b0d13] p-6 text-slate-50">
      <section className="max-w-xl rounded-3xl border border-[#ef4444]/30 bg-[#171a23]/95 p-6 shadow-2xl shadow-black/40">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#fecaca]">Dashboard config error</p>
        <h1 className="mt-2 text-2xl font-bold">Firebase env belum lengkap</h1>
        <p className="mt-3 text-slate-400">{message}</p>
        <p className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-6 text-slate-400">
          Set env Vercel untuk VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN,
          VITE_FIREBASE_PROJECT_ID, VITE_FIREBASE_APP_ID, VITE_DISCORD_CLIENT_ID,
          dan VITE_BOT_API_URL lalu redeploy.
        </p>
      </section>
    </main>
  );
}

export default function App() {
  if (firebaseConfigError) return <ConfigErrorScreen message={firebaseConfigError} />;

  return (
    <ToastProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ToastProvider>
  );
}
