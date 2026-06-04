import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { discordAuthorizeUrl, parseDiscordTokenFromHash } from '../lib/discordApi.js';
import { useAuth } from '../hooks/useAuth.js';

export default function Login() {
  const { user, loginWithDiscordToken } = useAuth();
  const [error, setError] = useState(null);

  useEffect(() => {
    const { accessToken, expiresIn } = parseDiscordTokenFromHash(window.location.hash);
    if (!accessToken) return;
    window.history.replaceState(null, '', '/login');
    loginWithDiscordToken(accessToken, expiresIn).catch((err) => setError(err.message));
  }, [loginWithDiscordToken]);

  if (user) return <Navigate to="/servers" replace />;

  return (
    <main className="grid min-h-screen place-items-center bg-[#2b2d31] p-6">
      <div className="w-full max-w-md rounded-lg border border-white/5 bg-[#313338] p-6">
        <h1 className="text-2xl font-bold">Login</h1>
        <p className="mt-2 text-[#b5bac1]">Discord token is exchanged immediately for a Firebase custom token and is not persisted in browser storage.</p>
        {error && <p className="mt-4 rounded bg-[#ed4245]/20 p-3 text-sm text-[#ed4245]">{error}</p>}
        <a href={discordAuthorizeUrl()} className="mt-6 block rounded bg-[#5865f2] px-4 py-3 text-center font-semibold hover:bg-[#4752c4]">Login with Discord</a>
      </div>
    </main>
  );
}
