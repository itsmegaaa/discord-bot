import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Command as CommandIcon } from 'lucide-react';
import Button from '../../components/ui/Button.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import FormField from '../../components/ui/FormField.jsx';
import Input from '../../components/ui/Input.jsx';
import PageHeader from '../../components/ui/PageHeader.jsx';
import SaveButton from '../../components/ui/SaveButton.jsx';
import SectionCard from '../../components/ui/SectionCard.jsx';
import Textarea from '../../components/ui/Textarea.jsx';
import { botApi } from '../../lib/botApi.js';
import { useToast } from '../../hooks/useToast.js';

export default function CustomCommands() {
  const { guildId } = useParams();
  const { toast } = useToast();
  const [commands, setCommands] = useState([]);
  const [form, setForm] = useState({ trigger: '', response: '' });
  const [error, setError] = useState(null);
  const load = () => botApi.get(`/api/guilds/${guildId}/custom-commands`)
    .then((data) => {
      setCommands(data.commands || []);
      setError(null);
    })
    .catch((err) => setError(err.message || 'Gagal memuat custom commands.'));

  useEffect(() => {
    load();
  }, [guildId]);

  const save = async () => {
    try {
      await botApi.post(`/api/guilds/${guildId}/custom-commands`, form);
      setForm({ trigger: '', response: '' });
      toast.success('Custom command created.');
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to save custom command.');
    }
  };

  return (
    <div>
      <PageHeader
        icon={CommandIcon}
        title="Custom Commands"
        subtitle="Create lightweight prefix responses for common server shortcuts."
      />

      <div className="grid gap-5">
        <SectionCard title="Add New Command" description="Members will trigger these commands with the configured prefix.">
          <div className="grid gap-4">
            <FormField label="Trigger" description="Write the trigger without the prefix.">
              <Input value={form.trigger} onChange={(e) => setForm({ ...form, trigger: e.target.value })} placeholder="trigger without !" />
            </FormField>
            <FormField label="Response">
              <Textarea value={form.response} onChange={(e) => setForm({ ...form, response: e.target.value })} placeholder="response" className="min-h-28" />
            </FormField>
            <SaveButton className="w-fit" onClick={save}>Save Command</SaveButton>
          </div>
        </SectionCard>

        <SectionCard title="Custom Commands" description="Edit responses or remove commands from this server.">
          <div className="grid gap-3">
            {error && <ErrorState title="Unable to load custom commands." description={error} />}
            {!error && commands.map((item) => <CommandRow key={item.id || item.trigger} item={item} guildId={guildId} load={load} />)}
            {!error && !commands.length && <EmptyState title="No custom commands yet." description="Add a command above and it will be available from chat." />}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

function CommandRow({ item, guildId, load }) {
  const [response, setResponse] = useState(item.response || '');
  const { toast } = useToast();

  const updateCommand = async () => {
    try {
      await botApi.put(`/api/guilds/${guildId}/custom-commands/${item.trigger}`, { response });
      toast.success('Custom command updated.');
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to update custom command.');
    }
  };

  const deleteCommand = async () => {
    try {
      await botApi.delete(`/api/guilds/${guildId}/custom-commands/${item.trigger}`);
      toast.success('Custom command deleted.');
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to delete custom command.');
    }
  };

  return (
    <div className="grid gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 md:grid-cols-[180px_1fr_auto_auto] md:items-center">
      <div>
        <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Trigger</div>
        <div className="mt-1 font-semibold text-slate-50">!{item.trigger}</div>
      </div>
      <Input value={response} onChange={(e) => setResponse(e.target.value)} />
      <Button variant="secondary" size="sm" onClick={updateCommand}>Save</Button>
      <Button variant="danger" size="sm" onClick={deleteCommand}>Delete</Button>
    </div>
  );
}
