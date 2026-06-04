import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Card from '../../components/ui/Card.jsx';
import ChannelSelect from '../../components/ui/ChannelSelect.jsx';
import SaveButton from '../../components/ui/SaveButton.jsx';
import { botApi } from '../../lib/botApi.js';
import { useChannels } from '../../hooks/useChannels.js';
import { useGuildConfig } from '../../hooks/useGuildConfig.js';

export default function Giveaway() {
  const { guildId } = useParams();
  const { config, setConfig, save } = useGuildConfig();
  const channels = useChannels();
  const [giveaways, setGiveaways] = useState([]);
  const load = () => botApi.get(`/api/guilds/${guildId}/giveaways`).then((data) => setGiveaways(data.giveaways || []));
  useEffect(() => { load(); }, [guildId]);
  const active = giveaways.filter((item) => !item.ended);
  const ended = giveaways.filter((item) => item.ended).slice(0, 20);
  return (
    <div className="grid gap-4">
      <Card title="Settings">
        <div className="grid gap-3">
          <select value={config.giveawayJoinType || 'button'} onChange={(e) => setConfig({ ...config, giveawayJoinType: e.target.value })} className="rounded bg-[#2b2d31] p-2">
            <option value="button">Button</option>
            <option value="reaction">Reaction</option>
          </select>
          <ChannelSelect value={config.giveawayLogChannelId} onChange={(value) => setConfig({ ...config, giveawayLogChannelId: value })} channels={channels} />
        </div>
      </Card>
      <Card title="Active Giveaways">{active.map((item) => <GiveawayRow key={item.id} item={item} guildId={guildId} load={load} />)}{!active.length && <p className="text-[#b5bac1]">No active giveaways.</p>}</Card>
      <Card title="Ended Giveaways">{ended.map((item) => <GiveawayRow key={item.id} item={item} guildId={guildId} load={load} ended />)}{!ended.length && <p className="text-[#b5bac1]">No ended giveaways.</p>}</Card>
      <SaveButton onClick={() => save(config)}>Save Settings</SaveButton>
    </div>
  );
}

function GiveawayRow({ item, guildId, load, ended }) {
  return (
    <div className="mb-2 rounded bg-[#2b2d31] p-3">
      <div className="font-semibold">{item.prize}</div>
      <div className="text-sm text-[#b5bac1]">Winners: {item.winnersCount} · Channel: {item.channelId}</div>
      <div className="mt-3 flex gap-2">
        {!ended && <button className="rounded bg-[#ed4245] px-3 py-1" onClick={() => botApi.post(`/api/guilds/${guildId}/giveaways/${item.messageId}/end`).then(load)}>End Early</button>}
        {ended && <button className="rounded bg-[#5865f2] px-3 py-1" onClick={() => botApi.post(`/api/guilds/${guildId}/giveaways/${item.messageId}/reroll`).then(load)}>Reroll</button>}
        <button className="rounded bg-[#35373c] px-3 py-1" onClick={() => botApi.delete(`/api/guilds/${guildId}/giveaways/${item.messageId}`).then(load)}>Delete</button>
      </div>
    </div>
  );
}
