import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Shield } from 'lucide-react';
import Button from '../../components/ui/Button.jsx';
import ChannelSelect from '../../components/ui/ChannelSelect.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import PageHeader from '../../components/ui/PageHeader.jsx';
import SaveButton from '../../components/ui/SaveButton.jsx';
import SectionCard from '../../components/ui/SectionCard.jsx';
import LoadingSkeleton from '../../components/shared/LoadingSkeleton.jsx';
import { botApi } from '../../lib/botApi.js';
import { useChannels } from '../../hooks/useChannels.js';
import { useGuildConfig } from '../../hooks/useGuildConfig.js';
import { useToast } from '../../hooks/useToast.js';

export default function Moderation() {
  const { guildId } = useParams();
  const { config, setConfig, loading, error, save } = useGuildConfig();
  const channels = useChannels();
  const { toast } = useToast();
  const [warns, setWarns] = useState([]);
  const [warnError, setWarnError] = useState(null);
  const load = () => botApi.get(`/api/guilds/${guildId}/warns`)
    .then((data) => {
      setWarns(data.warns || []);
      setWarnError(null);
    })
    .catch((err) => setWarnError(err.message || 'Gagal memuat warn server.'));
  useEffect(() => { load(); }, [guildId]);

  const handleSave = async () => {
    try {
      await save(config);
      toast.success('Moderation settings saved.');
    } catch (err) {
      toast.error(err.message || 'Failed to save moderation settings.');
    }
  };

  const handleDeleteWarning = async (warnId) => {
    try {
      await botApi.delete(`/api/guilds/${guildId}/warns/${warnId}`);
      toast.success('Warning deleted.');
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to delete warning.');
    }
  };

  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorState title="Unable to load moderation settings." description={error} />;

  return (
    <div>
      <PageHeader
        icon={Shield}
        title="Moderation"
        subtitle="Review warnings, configure moderation logs, and keep staff actions organized."
        actions={<SaveButton onClick={handleSave}>Save Changes</SaveButton>}
      />
      <div className="grid gap-5">
        <SectionCard title="Mod Log" description="Choose where moderation and staff action logs should be sent.">
          <ChannelSelect value={config.modLogChannelId} onChange={(value) => setConfig({ ...config, modLogChannelId: value, logChannelId: value })} channels={channels} label="Mod Log Channel" />
        </SectionCard>
        <SectionCard title="Warn Management" description="Review and remove warning records for this server.">
          <div className="grid gap-3">
            {warnError && <ErrorState title="Unable to load warnings." description={warnError} />}
            {!warnError && warns.map((warn) => (
              <div key={warn.id} className="grid gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 md:grid-cols-[1fr_1fr_auto]">
                <div>
                  <div className="text-xs uppercase tracking-[0.18em] text-slate-500">User</div>
                  <div className="mt-1 font-semibold text-slate-100">{warn.userId}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Reason</div>
                  <div className="mt-1 text-sm text-slate-300">{warn.reason}</div>
                </div>
                <div className="flex items-center md:justify-end">
                  <Button variant="danger" size="sm" onClick={() => handleDeleteWarning(warn.id)}>Delete</Button>
                </div>
              </div>
            ))}
            {!warnError && !warns.length && <EmptyState title="No warnings found." description="Warnings created by moderation or automod will appear here." />}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
