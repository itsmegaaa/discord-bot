import { useEffect, useState } from 'react';
import Card from '../../components/ui/Card.jsx';
import RoleSelect from '../../components/ui/RoleSelect.jsx';
import SaveButton from '../../components/ui/SaveButton.jsx';
import Toggle from '../../components/ui/Toggle.jsx';
import { useParams } from 'react-router-dom';
import { botApi } from '../../lib/botApi.js';
import { useRoles } from '../../hooks/useRoles.js';

export default function AutoMod() {
  const { guildId } = useParams();
  const roles = useRoles();
  const [automod, setAutomod] = useState({});
  useEffect(() => { botApi.get(`/api/guilds/${guildId}/automod`).then((data) => setAutomod(data.automod || {})); }, [guildId]);
  const save = () => botApi.post(`/api/guilds/${guildId}/automod`, automod);
  const list = (key) => (automod[key] || []).join(', ');
  const setList = (key, value) => setAutomod({ ...automod, [key]: value.split(',').map((item) => item.trim()).filter(Boolean) });
  return (
    <div className="grid gap-4">
      <Card title="General"><Toggle checked={automod.enabled === true} onChange={(value) => setAutomod({ ...automod, enabled: value })} label="Enable Auto Moderation" /></Card>
      <Card title="Filters">
        <div className="grid gap-4">
          <Toggle checked={automod.badWordsEnabled === true} onChange={(value) => setAutomod({ ...automod, badWordsEnabled: value })} label="Bad Words Filter" />
          <input value={list('badWords')} onChange={(e) => setList('badWords', e.target.value)} placeholder="bad, words, comma separated" className="rounded bg-[#2b2d31] p-2" />
          <Toggle checked={automod.antiSpamEnabled === true} onChange={(value) => setAutomod({ ...automod, antiSpamEnabled: value })} label="Anti Spam" />
          <input type="number" value={automod.antiSpamThreshold || 5} onChange={(e) => setAutomod({ ...automod, antiSpamThreshold: Number(e.target.value) })} className="rounded bg-[#2b2d31] p-2" />
          <Toggle checked={automod.antiLinkEnabled === true} onChange={(value) => setAutomod({ ...automod, antiLinkEnabled: value })} label="Anti Link" />
          <input value={list('allowedDomains')} onChange={(e) => setList('allowedDomains', e.target.value)} placeholder="youtube.com, discord.com" className="rounded bg-[#2b2d31] p-2" />
          <Toggle checked={automod.antiMassMentionEnabled === true} onChange={(value) => setAutomod({ ...automod, antiMassMentionEnabled: value })} label="Anti Mass Mention" />
          <input type="number" value={automod.massMentionThreshold || 5} onChange={(e) => setAutomod({ ...automod, massMentionThreshold: Number(e.target.value) })} className="rounded bg-[#2b2d31] p-2" />
        </div>
      </Card>
      <Card title="Auto Punishment">
        <div className="grid gap-3">
          <Toggle checked={automod.autoTimeoutEnabled === true} onChange={(value) => setAutomod({ ...automod, autoTimeoutEnabled: value })} label="Auto Timeout" />
          <input type="number" value={automod.autoTimeoutThreshold || 3} onChange={(e) => setAutomod({ ...automod, autoTimeoutThreshold: Number(e.target.value) })} className="rounded bg-[#2b2d31] p-2" />
          <input type="number" value={automod.autoTimeoutDuration || 10} onChange={(e) => setAutomod({ ...automod, autoTimeoutDuration: Number(e.target.value) })} className="rounded bg-[#2b2d31] p-2" />
          <RoleSelect multiple label="Bypass Roles" roles={roles} value={automod.bypassRoles || []} onChange={(value) => setAutomod({ ...automod, bypassRoles: value })} />
        </div>
      </Card>
      <SaveButton onClick={save}>Save</SaveButton>
    </div>
  );
}
