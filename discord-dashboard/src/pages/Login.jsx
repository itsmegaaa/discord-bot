import { useEffect, useRef, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Bot, ShieldCheck } from 'lucide-react';
import Button from '../components/ui/Button.jsx';
import { discordAuthorizeUrl, parseDiscordTokenFromHash } from '../lib/discordApi.js';
import { useAuth } from '../hooks/useAuth.js';

export default function Login() {
  const { user, loginWithDiscordToken } = useAuth();
  const [error, setError] = useState(null);
  const [exchanging, setExchanging] = useState(false);
  const exchangeStarted = useRef(false);

  useEffect(() => {
    const { accessToken, expiresIn } = parseDiscordTokenFromHash(window.location.hash);
    if (!accessToken) return;
    if (exchangeStarted.current) return;
    exchangeStarted.current = true;
    window.history.replaceState(null, '', '/login');
    setExchanging(true);
    setError(null);
    loginWithDiscordToken(accessToken, expiresIn)
      .catch((err) => {
        exchangeStarted.current = false;
        setError(err.message || 'Gagal login dengan Discord.');
      })
      .finally(() => setExchanging(false));
  }, [loginWithDiscordToken]);

  if (user) return <Navigate to="/servers" replace />;

  return (
    <main className="grid min-h-screen place-items-center bg-[#0b0d13] p-6 text-slate-50">
      <section className="w-full max-w-md rounded-3xl border border-white/10 bg-[#171a23]/95 p-6 shadow-2xl shadow-black/40">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#5865f2] shadow-lg shadow-[#5865f2]/25">
            <Bot size={24} />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">ABNRML</p>
            <h1 className="text-2xl font-bold">Control Center</h1>
          </div>
        </div>
        <p className="mt-5 text-sm leading-6 text-slate-400">
          Login with Discord to manage servers where you have Manage Server permission.
        </p>
        <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="flex gap-3">
            <ShieldCheck className="mt-0.5 text-[#86efac]" size={20} />
            <p className="text-sm leading-6 text-slate-300">
              Your Discord access token is exchanged immediately for a Firebase session and is not stored in browser storage.
            </p>
          </div>
        </div>
        {error && <p className="mt-4 rounded-2xl border border-[#ef4444]/30 bg-[#ef4444]/10 p-3 text-sm text-[#fecaca]">{error}</p>}
        {exchanging && <p className="mt-4 rounded-2xl border border-[#5865f2]/30 bg-[#5865f2]/10 p-3 text-sm text-[#c7d2fe]">Menghubungkan akun Discord...</p>}
        <Button
          as="a"
          href={exchanging ? undefined : discordAuthorizeUrl()}
          aria-disabled={exchanging}
          className={`mt-6 w-full ${exchanging ? 'pointer-events-none' : ''}`}
          loading={exchanging}
          size="lg"
        >
          Login with Discord
        </Button>
      </section>
    </main>
  );
}
