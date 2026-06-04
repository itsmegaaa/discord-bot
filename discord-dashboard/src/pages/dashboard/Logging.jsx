import Card from '../../components/ui/Card.jsx';
import ChannelSelect from '../../components/ui/ChannelSelect.jsx';
import SaveButton from '../../components/ui/SaveButton.jsx';
import Toggle from '../../components/ui/Toggle.jsx';
import LoadingSkeleton from '../../components/shared/LoadingSkeleton.jsx';
import { useChannels } from '../../hooks/useChannels.js';
import { useGuildConfig } from '../../hooks/useGuildConfig.js';

const toggles = [
  ['logMessageEdit', 'Message Edit'],
  ['logMessageDelete', 'Message Delete'],
  ['logVoiceActivity', 'Voice Activity'],
  ['logMemberJoin', 'Member Join'],
  ['logMemberLeave', 'Member Leave'],
  ['logRoleChanges', 'Role Changes'],
  ['logModActions', 'Mod Actions'],
];

export default function Logging() {
  const { config, setConfig, loading, save } = useGuildConfig();
  const channels = useChannels();
  if (loading) return <LoadingSkeleton />;
  return (
    <div className="grid gap-4">
      <Card title="Log Channel">
        <ChannelSelect value={config.logChannelId} onChange={(value) => setConfig({ ...config, logChannelId: value, modLogChannelId: value })} channels={channels} />
      </Card>
      <Card title="Events">
        <div className="grid gap-3 md:grid-cols-2">
          {toggles.map(([key, label]) => <Toggle key={key} checked={config[key] !== false} onChange={(value) => setConfig({ ...config, [key]: value })} label={label} />)}
        </div>
      </Card>
      <SaveButton onClick={() => save(config)}>Save</SaveButton>
    </div>
  );
}
