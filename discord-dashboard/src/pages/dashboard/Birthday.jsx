import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Card from '../../components/ui/Card.jsx';
import ChannelSelect from '../../components/ui/ChannelSelect.jsx';
import RoleSelect from '../../components/ui/RoleSelect.jsx';
import SaveButton from '../../components/ui/SaveButton.jsx';
import Toggle from '../../components/ui/Toggle.jsx';
import { botApi } from '../../lib/botApi.js';
import { useChannels } from '../../hooks/useChannels.js';
import { useGuildConfig } from '../../hooks/useGuildConfig.js';
import { useRoles } from '../../hooks/useRoles.js';

export default function Birthday() {
  const { guildId } = useParams();
  const { config, setConfig, save } = useGuildConfig();
  const channels = useChannels();
  const roles = useRoles();
  const [birthdays, setBirthdays] = useState([]);
  const load = () => botApi.get(`/api/guilds/${guildId}/birthdays`).then((data) => setBirthdays(data.birthdays || []));
  useEffect(() => { load(); }, [guildId]);
  return (
    <div className="grid gap-4">
      <Card title="Settings">
        <div className="grid gap-3">
          <Toggle checked={config.birthdayEnabled !== false} onChange={(value) => setConfig({ ...config, birthdayEnabled: value })} label="Enable Birthday System" />
          <ChannelSelect value={config.birthdayChannelId} onChange={(value) => setConfig({ ...config, birthdayChannelId: value })} channels={channels} />
          <RoleSelect value={config.birthdayRoleId} onChange={(value) => setConfig({ ...config, birthdayRoleId: value })} roles={roles} />
        </div>
      </Card>
      <Card title="Birthday List">
        {birthdays.map((item) => <div key={item.id} className="mb-2 flex justify-between rounded bg-[#2b2d31] p-3"><span>{item.userId} — {item.day}/{item.month}</span><button onClick={() => botApi.delete(`/api/guilds/${guildId}/birthdays/${item.userId}`).then(load)}>Delete</button></div>)}
      </Card>
      <SaveButton onClick={() => save(config)}>Save</SaveButton>
    </div>
  );
}
