import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged, signInWithCustomToken, signOut } from 'firebase/auth';
import { auth } from '../lib/firebase.js';
import { botApi } from '../lib/botApi.js';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [guilds, setGuilds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser);
      setLoading(false);
      if (nextUser) {
        const token = await nextUser.getIdToken();
        const data = await botApi.get('/api/auth/guilds', token).catch(() => ({ guilds: [] }));
        setGuilds(data.guilds || []);
      } else {
        setGuilds([]);
      }
    });
  }, []);

  const loginWithDiscordToken = useCallback(async (accessToken, expiresIn) => {
    const data = await botApi.post('/api/auth/discord', { accessToken, expiresIn });
    await signInWithCustomToken(auth, data.firebaseCustomToken);
  }, []);

  const logout = useCallback(async () => {
    await signOut(auth);
    localStorage.removeItem('selectedGuildId');
  }, []);

  const value = useMemo(() => ({
    user,
    guilds,
    loading,
    loginWithDiscordToken,
    logout,
  }), [user, guilds, loading, loginWithDiscordToken, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
