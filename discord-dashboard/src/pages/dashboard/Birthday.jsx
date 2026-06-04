import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Cake } from 'lucide-react';
import Button from '../../components/ui/Button.jsx';
import ChannelSelect from '../../components/ui/ChannelSelect.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
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

export default function Birthday() {
  const { guildId } = useParams();
  const { config, setConfig, loading, error, save } = useGuildConfig();
  const channels = useChannels();
  const roles = useRoles();
  const [birthdays, setBirthdays] = useState([]);
  const [listError, setListError] = useState(null);
  const load = () => botApi.get(`/api/guilds/${guildId}/birthdays`)
    .then((data) => {
      setBirthdays(data.birthdays || []);
      setListError(null);
    })
    .catch((err) => setListError(err.message || 'Gagal memuat birthday list.'));

  useEffect(() => {
    load();
  }, [guildId]);

  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorState title="Unable to load birthday settings." description={error} />;

  return (
    <div>
      <PageHeader
        icon={Cake}
        title="Birthday"
        subtitle="Celebrate members automatically with a channel announcement and optional birthday role."
        actions={<SaveButton onClick={() => save(config)}>Save Birthday</SaveButton>}
      />

      <div className="grid gap-5">
        <SectionCard title="Settings" description="Control the birthday system and where celebrations are posted.">
          <div className="grid gap-4 md:grid-cols-2">
            <Toggle checked={config.birthdayEnabled !== false} onChange={(value) => setConfig({ ...config, birthdayEnabled: value })} label="Enable Birthday System" />
            <ChannelSelect value={config.birthdayChannelId} onChange={(value) => setConfig({ ...config, birthdayChannelId: value })} channels={channels} label="Birthday Channel" />
            <RoleSelect value={config.birthdayRoleId} onChange={(value) => setConfig({ ...config, birthdayRoleId: value })} roles={roles} label="Birthday Role" />
          </div>
        </SectionCard>

        <SectionCard title="Birthday List" description="Member birthday records saved for this server.">
          <div className="grid gap-3">
            {listError && <ErrorState title="Unable to load birthdays." description={listError} />}
            {!listError && birthdays.map((item) => (
              <div key={item.id || item.userId} className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="font-semibold text-slate-50">{item.userId}</div>
                  <div className="mt-1 text-sm text-slate-400">{item.day}/{item.month}</div>
                </div>
                <Button variant="danger" size="sm" onClick={() => botApi.delete(`/api/guilds/${guildId}/birthdays/${item.userId}`).then(load)}>Delete</Button>
              </div>
            ))}
            {!listError && !birthdays.length && <EmptyState title="No birthdays saved." description="Birthday records added from Discord will show up here." />}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
