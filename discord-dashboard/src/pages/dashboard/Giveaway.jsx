import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Gift } from 'lucide-react';
import Button from '../../components/ui/Button.jsx';
import ChannelSelect from '../../components/ui/ChannelSelect.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import FormField from '../../components/ui/FormField.jsx';
import PageHeader from '../../components/ui/PageHeader.jsx';
import SaveButton from '../../components/ui/SaveButton.jsx';
import SectionCard from '../../components/ui/SectionCard.jsx';
import Select, { optionClassName } from '../../components/ui/Select.jsx';
import LoadingSkeleton from '../../components/shared/LoadingSkeleton.jsx';
import { botApi } from '../../lib/botApi.js';
import { useChannels } from '../../hooks/useChannels.js';
import { useGuildConfig } from '../../hooks/useGuildConfig.js';
import { useToast } from '../../hooks/useToast.js';

export default function Giveaway() {
  const { guildId } = useParams();
  const { config, setConfig, loading, error, save } = useGuildConfig();
  const channels = useChannels();
  const { toast } = useToast();
  const [giveaways, setGiveaways] = useState([]);
  const [listError, setListError] = useState(null);
  const load = () => botApi.get(`/api/guilds/${guildId}/giveaways`)
    .then((data) => {
      setGiveaways(data.giveaways || []);
      setListError(null);
    })
    .catch((err) => setListError(err.message || 'Gagal memuat giveaway.'));

  useEffect(() => {
    load();
  }, [guildId]);

  const active = giveaways.filter((item) => !item.ended);
  const ended = giveaways.filter((item) => item.ended).slice(0, 20);

  const handleSave = async () => {
    try {
      await save(config);
      toast.success('Giveaway settings saved.');
    } catch (err) {
      toast.error(err.message || 'Failed to save giveaway settings.');
    }
  };

  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorState title="Unable to load giveaway settings." description={error} />;

  return (
    <div>
      <PageHeader
        icon={Gift}
        title="Giveaway"
        subtitle="Manage running giveaways, reroll winners, and send giveaway logs to the right place."
        actions={<SaveButton onClick={handleSave}>Save Settings</SaveButton>}
      />

      <div className="grid gap-5">
        <SectionCard title="Settings" description="Choose how members join and where giveaway activity should be logged.">
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Join type">
              <Select value={config.giveawayJoinType || 'button'} onChange={(e) => setConfig({ ...config, giveawayJoinType: e.target.value })}>
                <option value="button" className={optionClassName}>Button</option>
                <option value="reaction" className={optionClassName}>Reaction</option>
              </Select>
            </FormField>
            <ChannelSelect value={config.giveawayLogChannelId} onChange={(value) => setConfig({ ...config, giveawayLogChannelId: value })} channels={channels} label="Giveaway Log Channel" />
          </div>
        </SectionCard>

        <SectionCard title="Active Giveaways" description="Giveaways currently open for entries.">
          <div className="grid gap-3">
            {listError && <ErrorState title="Unable to load giveaways." description={listError} />}
            {!listError && active.map((item) => <GiveawayRow key={item.id || item.messageId} item={item} guildId={guildId} load={load} />)}
            {!listError && !active.length && <EmptyState title="No active giveaways." description="Start a giveaway from Discord and it will appear here." />}
          </div>
        </SectionCard>

        <SectionCard title="Ended Giveaways" description="Recent ended giveaways available for reroll or cleanup.">
          <div className="grid gap-3">
            {listError && <ErrorState title="Unable to load giveaway history." description={listError} />}
            {!listError && ended.map((item) => <GiveawayRow key={item.id || item.messageId} item={item} guildId={guildId} load={load} ended />)}
            {!listError && !ended.length && <EmptyState title="No ended giveaways." description="Completed giveaways will be listed here for quick rerolls." />}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

function GiveawayRow({ item, guildId, load, ended }) {
  const { toast } = useToast();

  const runAction = async (request, successMessage, errorMessage) => {
    try {
      await request();
      toast.success(successMessage);
      load();
    } catch (err) {
      toast.error(err.message || errorMessage);
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-base font-semibold text-slate-50">{item.prize || 'Untitled giveaway'}</div>
          <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-400">
            <span className="rounded-full border border-white/10 bg-white/[0.03] px-2 py-1">Winners: {item.winnersCount || 1}</span>
            <span className="rounded-full border border-white/10 bg-white/[0.03] px-2 py-1">Channel: {item.channelId || 'Unknown'}</span>
            <span className="rounded-full border border-white/10 bg-white/[0.03] px-2 py-1">Message: {item.messageId || 'Unknown'}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {!ended && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => runAction(
                () => botApi.post(`/api/guilds/${guildId}/giveaways/${item.messageId}/end`),
                'Giveaway ended.',
                'Failed to end giveaway.',
              )}
            >
              End Early
            </Button>
          )}
          {ended && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => runAction(
                () => botApi.post(`/api/guilds/${guildId}/giveaways/${item.messageId}/reroll`),
                'Winner rerolled.',
                'Failed to reroll winner.',
              )}
            >
              Reroll
            </Button>
          )}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => runAction(
              () => botApi.delete(`/api/guilds/${guildId}/giveaways/${item.messageId}`),
              'Giveaway deleted.',
              'Failed to delete giveaway.',
            )}
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
