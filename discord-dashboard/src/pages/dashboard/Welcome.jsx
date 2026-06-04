import { Sparkles } from 'lucide-react';
import ChannelSelect from '../../components/ui/ChannelSelect.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import FormField from '../../components/ui/FormField.jsx';
import PageHeader from '../../components/ui/PageHeader.jsx';
import RoleSelect from '../../components/ui/RoleSelect.jsx';
import SaveButton from '../../components/ui/SaveButton.jsx';
import SectionCard from '../../components/ui/SectionCard.jsx';
import Textarea from '../../components/ui/Textarea.jsx';
import Toggle from '../../components/ui/Toggle.jsx';
import LoadingSkeleton from '../../components/shared/LoadingSkeleton.jsx';
import { useChannels } from '../../hooks/useChannels.js';
import { useGuildConfig } from '../../hooks/useGuildConfig.js';
import { useRoles } from '../../hooks/useRoles.js';

export default function Welcome() {
  const { config, setConfig, loading, error, save } = useGuildConfig();
  const channels = useChannels();
  const roles = useRoles();

  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorState title="Unable to load welcome settings." description={error} />;

  return (
    <div>
      <PageHeader
        icon={Sparkles}
        title="Welcome System"
        subtitle="Control how new members are greeted and what happens when they leave."
        actions={<SaveButton onClick={() => save(config)}>Save Changes</SaveButton>}
      />
      <div className="grid gap-5">
        <SectionCard title="Welcome Message" description="Choose where greetings appear and customize the first message new members see.">
          <div className="grid gap-4">
            <Toggle checked={config.welcomeEnabled !== false} onChange={(value) => setConfig({ ...config, welcomeEnabled: value })} label="Enable Welcome System" />
            <ChannelSelect label="Welcome Channel" value={config.welcomeChannelId} onChange={(value) => setConfig({ ...config, welcomeChannelId: value })} channels={channels} />
            <FormField label="Welcome Message" description="Suggested placeholders: {user}, {server}, {count}">
              <Textarea value={config.welcomeMessage || ''} onChange={(e) => setConfig({ ...config, welcomeMessage: e.target.value })} className="min-h-32" placeholder="Welcome message with {user} {server} {count}" />
            </FormField>
          </div>
        </SectionCard>

        <div className="grid gap-5 lg:grid-cols-2">
          <SectionCard title="Goodbye Message" description="Send a clean farewell message when someone leaves.">
            <div className="grid gap-4">
              <ChannelSelect label="Goodbye Channel" value={config.goodbyeChannelId} onChange={(value) => setConfig({ ...config, goodbyeChannelId: value })} channels={channels} />
              <FormField label="Goodbye Message" description="Suggested placeholders: {user}, {count}">
                <Textarea value={config.goodbyeMessage || ''} onChange={(e) => setConfig({ ...config, goodbyeMessage: e.target.value })} className="min-h-28" placeholder="Goodbye message" />
              </FormField>
            </div>
          </SectionCard>

          <SectionCard title="Welcome Card" description="Use a generated card image for a more memorable arrival moment.">
            <Toggle checked={config.welcomeCardEnabled !== false} onChange={(value) => setConfig({ ...config, welcomeCardEnabled: value })} label="Enable Welcome Card" />
          </SectionCard>
        </div>

        <SectionCard title="Auto Role" description="Automatically assign a role when a member joins.">
          <RoleSelect label="Role on join" value={config.autoRoleId} onChange={(value) => setConfig({ ...config, autoRoleId: value })} roles={roles} />
        </SectionCard>
      </div>
    </div>
  );
}
