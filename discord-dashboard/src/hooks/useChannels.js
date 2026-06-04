import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { botApi } from '../lib/botApi.js';

export function useChannels() {
  const { guildId } = useParams();
  const [channels, setChannels] = useState([]);
  useEffect(() => {
    botApi.get(`/api/guilds/${guildId}/channels`).then((data) => setChannels(data.channels || []));
  }, [guildId]);
  return channels;
}
