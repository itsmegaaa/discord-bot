import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Card from '../../components/ui/Card.jsx';
import ChannelSelect from '../../components/ui/ChannelSelect.jsx';
import SaveButton from '../../components/ui/SaveButton.jsx';
import { botApi } from '../../lib/botApi.js';
import { useChannels } from '../../hooks/useChannels.js';
import { useGuildConfig } from '../../hooks/useGuildConfig.js';

export default function Moderation() {
  const { guildId } = useParams();
  const { config, setConfig, save } = useGuildConfig();
  const channels = useChannels();
  const [warns, setWarns] = useState([]);
  const load = () => botApi.get(`/api/guilds/${guildId}/warns`).then((data) => setWarns(data.warns || []));
  useEffect(() => { load(); }, [guildId]);
  return (
    <div className="grid gap-4">
      <Card title="Mod Log">
        <ChannelSelect value={config.modLogChannelId} onChange={(value) => setConfig({ ...config, modLogChannelId: value, logChannelId: value })} channels={channels} />
      </Card>
      <Card title="Warn Management">
        <div className="grid gap-2">
          {warns.map((warn) => (
            <div key={warn.id} className="grid gap-2 rounded bg-[#2b2d31] p-3 md:grid-cols-[1fr_1fr_auto]">
              <div>{warn.userId}</div><div className="text-[#b5bac1]">{warn.reason}</div>
              <button className="rounded bg-[#ed4245] px-3 py-1" onClick={() => botApi.delete(`/api/guilds/${guildId}/warns/${warn.id}`).then(load)}>Delete</button>
            </div>
          ))}
          {!warns.length && <p className="text-[#b5bac1]">No warns.</p>}
        </div>
      </Card>
      <SaveButton onClick={() => save(config)}>Save</SaveButton>
    </div>
  );
}
