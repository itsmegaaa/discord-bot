import Card from '../../components/ui/Card.jsx';
import ChannelSelect from '../../components/ui/ChannelSelect.jsx';
import RoleSelect from '../../components/ui/RoleSelect.jsx';
import SaveButton from '../../components/ui/SaveButton.jsx';
import Toggle from '../../components/ui/Toggle.jsx';
import LoadingSkeleton from '../../components/shared/LoadingSkeleton.jsx';
import { useChannels } from '../../hooks/useChannels.js';
import { useGuildConfig } from '../../hooks/useGuildConfig.js';
import { useRoles } from '../../hooks/useRoles.js';

export default function Welcome() {
  const { config, setConfig, loading, save } = useGuildConfig();
  const channels = useChannels();
  const roles = useRoles();
  if (loading) return <LoadingSkeleton />;

  return (
    <div className="grid gap-4">
      <Card title="Welcome System">
        <div className="grid gap-4">
          <Toggle checked={config.welcomeEnabled !== false} onChange={(value) => setConfig({ ...config, welcomeEnabled: value })} label="Enable Welcome System" />
          <ChannelSelect label="Welcome Channel" value={config.welcomeChannelId} onChange={(value) => setConfig({ ...config, welcomeChannelId: value })} channels={channels} />
          <textarea value={config.welcomeMessage || ''} onChange={(e) => setConfig({ ...config, welcomeMessage: e.target.value })} className="min-h-28 rounded bg-[#2b2d31] p-3" placeholder="Welcome message with {user} {server} {count}" />
          <Toggle checked={config.welcomeCardEnabled !== false} onChange={(value) => setConfig({ ...config, welcomeCardEnabled: value })} label="Enable Welcome Card" />
          <ChannelSelect label="Goodbye Channel" value={config.goodbyeChannelId} onChange={(value) => setConfig({ ...config, goodbyeChannelId: value })} channels={channels} />
          <textarea value={config.goodbyeMessage || ''} onChange={(e) => setConfig({ ...config, goodbyeMessage: e.target.value })} className="min-h-24 rounded bg-[#2b2d31] p-3" placeholder="Goodbye message" />
        </div>
      </Card>
      <Card title="Auto Role">
        <RoleSelect label="Role on join" value={config.autoRoleId} onChange={(value) => setConfig({ ...config, autoRoleId: value })} roles={roles} />
      </Card>
      <SaveButton onClick={() => save(config)}>Save</SaveButton>
    </div>
  );
}
