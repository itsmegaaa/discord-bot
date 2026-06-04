import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Bot } from 'lucide-react';
import ErrorState from '../../components/ui/ErrorState.jsx';
import FormField from '../../components/ui/FormField.jsx';
import Input from '../../components/ui/Input.jsx';
import PageHeader from '../../components/ui/PageHeader.jsx';
import RoleSelect from '../../components/ui/RoleSelect.jsx';
import SaveButton from '../../components/ui/SaveButton.jsx';
import SectionCard from '../../components/ui/SectionCard.jsx';
import Toggle from '../../components/ui/Toggle.jsx';
import { botApi } from '../../lib/botApi.js';
import { useRoles } from '../../hooks/useRoles.js';
import { useToast } from '../../hooks/useToast.js';

export default function AutoMod() {
  const { guildId } = useParams();
  const roles = useRoles();
  const { toast } = useToast();
  const [automod, setAutomod] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    setError(null);
    botApi.get(`/api/guilds/${guildId}/automod`)
      .then((data) => setAutomod(data.automod || {}))
      .catch((err) => setError(err.message || 'Gagal memuat AutoMod.'));
  }, [guildId]);

  const save = async () => {
    try {
      await botApi.post(`/api/guilds/${guildId}/automod`, automod);
      toast.success('AutoMod settings saved.');
    } catch (err) {
      toast.error(err.message || 'Failed to save AutoMod settings.');
    }
  };
  const list = (key) => (automod[key] || []).join(', ');
  const setList = (key, value) => setAutomod({ ...automod, [key]: value.split(',').map((item) => item.trim()).filter(Boolean) });

  return (
    <div>
      <PageHeader
        icon={Bot}
        title="AutoMod"
        subtitle="Tune automatic filters, link rules, spam limits, and timeout escalation."
        actions={<SaveButton onClick={save}>Save AutoMod</SaveButton>}
      />

      <div className="grid gap-5">
        {error && <ErrorState title="Unable to load AutoMod settings." description={error} />}
        <SectionCard title="General Protection" description="Enable or pause the full automatic moderation stack.">
          <Toggle checked={automod.enabled === true} onChange={(value) => setAutomod({ ...automod, enabled: value })} label="Enable Auto Moderation" />
        </SectionCard>

        <SectionCard title="Content Filters" description="Block configured bad words and decide which domains are allowed.">
          <div className="grid gap-4">
            <Toggle checked={automod.badWordsEnabled === true} onChange={(value) => setAutomod({ ...automod, badWordsEnabled: value })} label="Bad Words Filter" />
            <FormField label="Bad words" description="Separate each word with a comma.">
              <Input value={list('badWords')} onChange={(e) => setList('badWords', e.target.value)} placeholder="bad, words, comma separated" />
            </FormField>
            <Toggle checked={automod.antiLinkEnabled === true} onChange={(value) => setAutomod({ ...automod, antiLinkEnabled: value })} label="Anti Link" />
            <FormField label="Allowed domains" description="Links from these domains will be ignored by the anti-link filter.">
              <Input value={list('allowedDomains')} onChange={(e) => setList('allowedDomains', e.target.value)} placeholder="youtube.com, discord.com" />
            </FormField>
          </div>
        </SectionCard>

        <SectionCard title="Rate Limits" description="Configure spam and mass mention thresholds before action is taken.">
          <div className="grid gap-4 md:grid-cols-2">
            <Toggle checked={automod.antiSpamEnabled === true} onChange={(value) => setAutomod({ ...automod, antiSpamEnabled: value })} label="Anti Spam" />
            <FormField label="Spam threshold">
              <Input type="number" min="1" value={automod.antiSpamThreshold || 5} onChange={(e) => setAutomod({ ...automod, antiSpamThreshold: Number(e.target.value) })} />
            </FormField>
            <Toggle checked={automod.antiMassMentionEnabled === true} onChange={(value) => setAutomod({ ...automod, antiMassMentionEnabled: value })} label="Anti Mass Mention" />
            <FormField label="Mention threshold">
              <Input type="number" min="1" value={automod.massMentionThreshold || 5} onChange={(e) => setAutomod({ ...automod, massMentionThreshold: Number(e.target.value) })} />
            </FormField>
          </div>
        </SectionCard>

        <SectionCard title="Auto Punishment" description="Escalate repeated violations into timeouts and define bypass roles.">
          <div className="grid gap-4 md:grid-cols-2">
            <Toggle checked={automod.autoTimeoutEnabled === true} onChange={(value) => setAutomod({ ...automod, autoTimeoutEnabled: value })} label="Auto Timeout" />
            <FormField label="Warn threshold">
              <Input type="number" min="1" value={automod.autoTimeoutThreshold || 3} onChange={(e) => setAutomod({ ...automod, autoTimeoutThreshold: Number(e.target.value) })} />
            </FormField>
            <FormField label="Timeout duration minutes">
              <Input type="number" min="1" value={automod.autoTimeoutDuration || 10} onChange={(e) => setAutomod({ ...automod, autoTimeoutDuration: Number(e.target.value) })} />
            </FormField>
            <RoleSelect multiple label="Bypass Roles" roles={roles} value={automod.bypassRoles || []} onChange={(value) => setAutomod({ ...automod, bypassRoles: value })} />
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
