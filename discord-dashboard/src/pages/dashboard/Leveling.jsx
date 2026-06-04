import Card from '../../components/ui/Card.jsx';
import ChannelSelect from '../../components/ui/ChannelSelect.jsx';
import RoleSelect from '../../components/ui/RoleSelect.jsx';
import SaveButton from '../../components/ui/SaveButton.jsx';
import Toggle from '../../components/ui/Toggle.jsx';
import LoadingSkeleton from '../../components/shared/LoadingSkeleton.jsx';
import { botApi } from '../../lib/botApi.js';
import { useChannels } from '../../hooks/useChannels.js';
import { useGuildConfig } from '../../hooks/useGuildConfig.js';
import { useRoles } from '../../hooks/useRoles.js';

export default function Leveling() {
  const { config, setConfig, loading, save, guildId } = useGuildConfig();
  const channels = useChannels();
  const roles = useRoles();
  if (loading) return <LoadingSkeleton />;

  const rewards = config.levelRoles || [];
  return (
    <div className="grid gap-4">
      <Card title="XP Settings">
        <div className="grid gap-4 md:grid-cols-2">
          <Toggle checked={config.levelingEnabled !== false} onChange={(value) => setConfig({ ...config, levelingEnabled: value })} label="Enable Leveling" />
          <Toggle checked={config.voiceXpEnabled !== false} onChange={(value) => setConfig({ ...config, voiceXpEnabled: value })} label="Enable Voice XP" />
          <label>XP per message<input type="number" min="1" max="50" value={config.xpPerMessage || 15} onChange={(e) => setConfig({ ...config, xpPerMessage: Number(e.target.value) })} className="mt-2 w-full rounded bg-[#313338] p-2" /></label>
          <label>Cooldown seconds<input type="number" min="10" max="300" value={config.xpCooldownSeconds || 60} onChange={(e) => setConfig({ ...config, xpCooldownSeconds: Number(e.target.value) })} className="mt-2 w-full rounded bg-[#313338] p-2" /></label>
          <label>Voice XP/minute<input type="number" min="1" max="20" value={config.voiceXpPerMinute || 5} onChange={(e) => setConfig({ ...config, voiceXpPerMinute: Number(e.target.value) })} className="mt-2 w-full rounded bg-[#313338] p-2" /></label>
          <ChannelSelect label="Level Up Channel" value={config.levelUpChannelId} onChange={(value) => setConfig({ ...config, levelUpChannelId: value })} channels={channels} />
        </div>
      </Card>
      <Card title="Role Rewards">
        <div className="grid gap-3">
          {rewards.map((row, index) => (
            <div key={index} className="grid gap-2 md:grid-cols-[120px_1fr_auto]">
              <input type="number" value={row.level} onChange={(e) => setConfig({ ...config, levelRoles: rewards.map((item, i) => i === index ? { ...item, level: Number(e.target.value) } : item) })} className="rounded bg-[#2b2d31] p-2" />
              <RoleSelect value={row.roleId} onChange={(value) => setConfig({ ...config, levelRoles: rewards.map((item, i) => i === index ? { ...item, roleId: value } : item) })} roles={roles} />
              <button className="rounded bg-[#ed4245] px-3" onClick={() => setConfig({ ...config, levelRoles: rewards.filter((_, i) => i !== index) })}>Delete</button>
            </div>
          ))}
          <button className="w-fit rounded bg-[#5865f2] px-3 py-2" onClick={() => setConfig({ ...config, levelRoles: [...rewards, { level: 1, roleId: null }] })}>Add Role Reward</button>
        </div>
      </Card>
      <div className="flex gap-3">
        <SaveButton onClick={() => save(config)}>Save</SaveButton>
        <button className="rounded bg-[#ed4245] px-4 py-2 font-semibold" onClick={() => window.confirm('Reset all XP?') && botApi.delete(`/api/guilds/${guildId}/levels`)}>Reset All XP</button>
      </div>
    </div>
  );
}
