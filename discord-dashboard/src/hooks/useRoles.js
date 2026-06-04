import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { botApi } from '../lib/botApi.js';

export function useRoles() {
  const { guildId } = useParams();
  const [roles, setRoles] = useState([]);
  useEffect(() => {
    botApi.get(`/api/guilds/${guildId}/roles`)
      .then((data) => setRoles(data.roles || []))
      .catch(() => setRoles([]));
  }, [guildId]);
  return roles;
}
