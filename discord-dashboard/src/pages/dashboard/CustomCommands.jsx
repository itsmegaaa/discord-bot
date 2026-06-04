import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Card from '../../components/ui/Card.jsx';
import SaveButton from '../../components/ui/SaveButton.jsx';
import { botApi } from '../../lib/botApi.js';

export default function CustomCommands() {
  const { guildId } = useParams();
  const [commands, setCommands] = useState([]);
  const [form, setForm] = useState({ trigger: '', response: '' });
  const load = () => botApi.get(`/api/guilds/${guildId}/custom-commands`).then((data) => setCommands(data.commands || []));
  useEffect(() => { load(); }, [guildId]);
  const save = () => botApi.post(`/api/guilds/${guildId}/custom-commands`, form).then(() => { setForm({ trigger: '', response: '' }); load(); });
  return (
    <div className="grid gap-4">
      <Card title="Add New Command">
        <div className="grid gap-3">
          <input value={form.trigger} onChange={(e) => setForm({ ...form, trigger: e.target.value })} placeholder="trigger without !" className="rounded bg-[#2b2d31] p-2" />
          <textarea value={form.response} onChange={(e) => setForm({ ...form, response: e.target.value })} placeholder="response" className="min-h-24 rounded bg-[#2b2d31] p-2" />
          <SaveButton onClick={save}>Save Command</SaveButton>
        </div>
      </Card>
      <Card title="Custom Commands">
        {commands.map((item) => <CommandRow key={item.id} item={item} guildId={guildId} load={load} />)}
      </Card>
    </div>
  );
}

function CommandRow({ item, guildId, load }) {
  const [response, setResponse] = useState(item.response || '');
  return (
    <div className="mb-2 grid gap-2 rounded bg-[#2b2d31] p-3 md:grid-cols-[160px_1fr_auto_auto]">
      <div>!{item.trigger}</div>
      <input value={response} onChange={(e) => setResponse(e.target.value)} className="rounded bg-[#313338] p-2" />
      <button onClick={() => botApi.put(`/api/guilds/${guildId}/custom-commands/${item.trigger}`, { response }).then(load)}>Save</button>
      <button onClick={() => botApi.delete(`/api/guilds/${guildId}/custom-commands/${item.trigger}`).then(load)}>Delete</button>
    </div>
  );
}
