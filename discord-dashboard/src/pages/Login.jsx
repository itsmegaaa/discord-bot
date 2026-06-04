import { useEffect, useRef, useState } from 'react';
import { Navigate } from 'react-router-dom';
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
    <main className="grid min-h-screen place-items-center bg-[#2b2d31] p-6">
      <div className="w-full max-w-md rounded-lg border border-white/5 bg-[#313338] p-6">
        <h1 className="text-2xl font-bold">Login</h1>
        <p className="mt-2 text-[#b5bac1]">Discord token is exchanged immediately for a Firebase custom token and is not persisted in browser storage.</p>
        {error && <p className="mt-4 rounded bg-[#ed4245]/20 p-3 text-sm text-[#ed4245]">{error}</p>}
        {exchanging && <p className="mt-4 rounded bg-[#5865f2]/20 p-3 text-sm text-[#b5bac1]">Menghubungkan akun Discord...</p>}
        <a
          href={exchanging ? undefined : discordAuthorizeUrl()}
          aria-disabled={exchanging}
          className={`mt-6 block rounded px-4 py-3 text-center font-semibold ${exchanging ? 'pointer-events-none bg-[#4e5058] text-[#b5bac1]' : 'bg-[#5865f2] hover:bg-[#4752c4]'}`}
        >
          {exchanging ? 'Logging in...' : 'Login with Discord'}
        </a>
      </div>
    </main>
  );
}
