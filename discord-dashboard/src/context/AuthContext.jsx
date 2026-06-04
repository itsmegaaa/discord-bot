import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged, signInWithCustomToken, signOut } from 'firebase/auth';
import { auth, firebaseConfigError } from '../lib/firebase.js';
import { botApi } from '../lib/botApi.js';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [guilds, setGuilds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(firebaseConfigError);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return undefined;
    }

    return onAuthStateChanged(auth, async (nextUser) => {
      try {
        setUser(nextUser);
        setError(firebaseConfigError);
        if (nextUser) {
          const token = await nextUser.getIdToken();
          const data = await botApi.get('/api/auth/guilds', token);
          setGuilds(data.guilds || []);
        } else {
          setGuilds([]);
        }
      } catch (err) {
        setGuilds([]);
        setError(err.message || 'Gagal memuat session dashboard.');
      } finally {
        setLoading(false);
      }
    });
  }, []);

  const loginWithDiscordToken = useCallback(async (accessToken, expiresIn) => {
    if (!auth) throw new Error(firebaseConfigError || 'Firebase Auth belum tersedia.');
    const data = await botApi.post('/api/auth/discord', { accessToken, expiresIn });
    await signInWithCustomToken(auth, data.firebaseCustomToken);
  }, []);

  const logout = useCallback(async () => {
    if (!auth) return;
    await signOut(auth);
    localStorage.removeItem('selectedGuildId');
  }, []);

  const value = useMemo(() => ({
    user,
    guilds,
    loading,
    error,
    loginWithDiscordToken,
    logout,
  }), [user, guilds, loading, error, loginWithDiscordToken, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
