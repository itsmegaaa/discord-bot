import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { botApi } from '../lib/botApi.js';

export function useGuildConfig() {
  const { guildId } = useParams();
  const [config, setConfig] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    botApi.get(`/api/guilds/${guildId}/config`)
      .then((data) => setConfig(data.config || {}))
      .finally(() => setLoading(false));
  }, [guildId]);

  const save = useCallback(async (patch) => {
    const previous = config;
    const next = { ...config, ...patch };
    setConfig(next);
    try {
      await botApi.post(`/api/guilds/${guildId}/config`, next);
    } catch (err) {
      setConfig(previous);
      throw err;
    }
  }, [config, guildId]);

  return { config, setConfig, loading, save, guildId };
}
