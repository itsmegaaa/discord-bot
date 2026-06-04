import { Star } from 'lucide-react';
import Button from '../../components/ui/Button.jsx';
import ChannelSelect from '../../components/ui/ChannelSelect.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import FormField from '../../components/ui/FormField.jsx';
import Input from '../../components/ui/Input.jsx';
import PageHeader from '../../components/ui/PageHeader.jsx';
import RoleSelect from '../../components/ui/RoleSelect.jsx';
import SaveButton from '../../components/ui/SaveButton.jsx';
import SectionCard from '../../components/ui/SectionCard.jsx';
import Toggle from '../../components/ui/Toggle.jsx';
import LoadingSkeleton from '../../components/shared/LoadingSkeleton.jsx';
import { botApi } from '../../lib/botApi.js';
import { useChannels } from '../../hooks/useChannels.js';
import { useGuildConfig } from '../../hooks/useGuildConfig.js';
import { useRoles } from '../../hooks/useRoles.js';

export default function Leveling() {
  const { config, setConfig, loading, error, save, guildId } = useGuildConfig();
  const channels = useChannels();
  const roles = useRoles();

  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorState title="Unable to load leveling settings." description={error} />;

  const rewards = config.levelRoles || [];
  return (
    <div>
      <PageHeader
        icon={Star}
        title="Leveling & XP"
        subtitle="Reward active members with XP, levels, voice activity, and role milestones."
        actions={<SaveButton onClick={() => save(config)}>Save Changes</SaveButton>}
      />
      <div className="grid gap-5">
        <SectionCard title="XP Settings" description="Tune message XP and cooldown behavior.">
          <div className="grid gap-4 md:grid-cols-2">
            <Toggle checked={config.levelingEnabled !== false} onChange={(value) => setConfig({ ...config, levelingEnabled: value })} label="Enable Leveling" />
            <FormField label="XP per message">
              <Input type="number" min="1" max="50" value={config.xpPerMessage || 15} onChange={(e) => setConfig({ ...config, xpPerMessage: Number(e.target.value) })} />
            </FormField>
            <FormField label="Cooldown seconds">
              <Input type="number" min="10" max="300" value={config.xpCooldownSeconds || 60} onChange={(e) => setConfig({ ...config, xpCooldownSeconds: Number(e.target.value) })} />
            </FormField>
            <ChannelSelect label="Level Up Channel" value={config.levelUpChannelId} onChange={(value) => setConfig({ ...config, levelUpChannelId: value })} channels={channels} />
          </div>
        </SectionCard>

        <SectionCard title="Voice XP" description="Reward members who spend time in voice channels.">
          <div className="grid gap-4 md:grid-cols-2">
            <Toggle checked={config.voiceXpEnabled !== false} onChange={(value) => setConfig({ ...config, voiceXpEnabled: value })} label="Enable Voice XP" />
            <FormField label="Voice XP per minute">
              <Input type="number" min="1" max="20" value={config.voiceXpPerMinute || 5} onChange={(e) => setConfig({ ...config, voiceXpPerMinute: Number(e.target.value) })} />
            </FormField>
          </div>
        </SectionCard>

        <SectionCard title="Role Rewards" description="Assign roles when members reach specific levels.">
          <div className="grid gap-3">
            {rewards.map((row, index) => (
              <div key={index} className="grid gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3 md:grid-cols-[120px_1fr_auto]">
                <FormField label="Level">
                  <Input type="number" value={row.level} onChange={(e) => setConfig({ ...config, levelRoles: rewards.map((item, i) => i === index ? { ...item, level: Number(e.target.value) } : item) })} />
                </FormField>
                <RoleSelect value={row.roleId} onChange={(value) => setConfig({ ...config, levelRoles: rewards.map((item, i) => i === index ? { ...item, roleId: value } : item) })} roles={roles} label="Reward Role" />
                <div className="flex items-end">
                  <Button variant="danger" onClick={() => setConfig({ ...config, levelRoles: rewards.filter((_, i) => i !== index) })}>Delete</Button>
                </div>
              </div>
            ))}
            <Button className="w-fit" variant="secondary" onClick={() => setConfig({ ...config, levelRoles: [...rewards, { level: 1, roleId: null }] })}>Add Role Reward</Button>
          </div>
        </SectionCard>

        <SectionCard title="Danger Zone" description="Reset all XP data for this server. This action cannot be undone.">
          <Button variant="danger" onClick={() => window.confirm('Reset all XP?') && botApi.delete(`/api/guilds/${guildId}/levels`)}>Reset All XP</Button>
        </SectionCard>
      </div>
    </div>
  );
}
