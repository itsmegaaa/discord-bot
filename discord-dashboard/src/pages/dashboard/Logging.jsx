import { ClipboardList } from 'lucide-react';
import ChannelSelect from '../../components/ui/ChannelSelect.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import PageHeader from '../../components/ui/PageHeader.jsx';
import SaveButton from '../../components/ui/SaveButton.jsx';
import SectionCard from '../../components/ui/SectionCard.jsx';
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
  const { config, setConfig, loading, error, save } = useGuildConfig();
  const channels = useChannels();

  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorState title="Unable to load logging settings." description={error} />;

  return (
    <div>
      <PageHeader
        icon={ClipboardList}
        title="Logging"
        subtitle="Route server activity into a readable audit channel and choose which signals matter."
        actions={<SaveButton onClick={() => save(config)}>Save Logging</SaveButton>}
      />

      <div className="grid gap-5">
        <SectionCard title="Log Channel" description="All enabled logs will use this channel. It also updates the moderation log fallback.">
          <ChannelSelect value={config.logChannelId} onChange={(value) => setConfig({ ...config, logChannelId: value, modLogChannelId: value })} channels={channels} label="Audit Channel" />
        </SectionCard>

        <SectionCard title="Events" description="Keep noisy logs off and important operational history on.">
          <div className="grid gap-3 md:grid-cols-2">
            {toggles.map(([key, label]) => (
              <Toggle key={key} checked={config[key] !== false} onChange={(value) => setConfig({ ...config, [key]: value })} label={label} />
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
