import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { botApi } from '../lib/botApi.js';

export function useGuildConfig() {
  const { guildId } = useParams();
  const [config, setConfig] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    botApi.get(`/api/guilds/${guildId}/config`)
      .then((data) => setConfig(data.config || {}))
      .catch((err) => {
        setConfig({});
        setError(err.message || 'Gagal memuat konfigurasi server.');
      })
      .finally(() => setLoading(false));
  }, [guildId]);

  const save = useCallback(async (patch) => {
    const previous = config;
    const next = { ...config, ...patch };
    setConfig(next);
    try {
      await botApi.post(`/api/guilds/${guildId}/config`, next);
      setError(null);
    } catch (err) {
      setConfig(previous);
      setError(err.message || 'Gagal menyimpan konfigurasi server.');
      throw err;
    }
  }, [config, guildId]);

  return { config, setConfig, loading, error, save, guildId };
}
