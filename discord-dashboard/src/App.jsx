import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { firebaseConfigError } from './lib/firebase.js';
import { router } from './router/index.jsx';

function ConfigErrorScreen({ message }) {
  return (
    <main className="grid min-h-screen place-items-center bg-[#2b2d31] p-6 text-[#f2f3f5]">
      <section className="max-w-xl rounded-lg border border-[#ed4245]/40 bg-[#313338] p-6 shadow-lg">
        <p className="text-sm font-semibold uppercase tracking-wide text-[#ed4245]">Dashboard config error</p>
        <h1 className="mt-2 text-2xl font-bold">Firebase env belum lengkap</h1>
        <p className="mt-3 text-[#b5bac1]">{message}</p>
        <p className="mt-4 text-sm text-[#b5bac1]">
          Set env Vercel untuk VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN,
          VITE_FIREBASE_PROJECT_ID, dan VITE_FIREBASE_APP_ID lalu redeploy.
        </p>
      </section>
    </main>
  );
}

export default function App() {
  if (firebaseConfigError) return <ConfigErrorScreen message={firebaseConfigError} />;

  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
