import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import Select from '../ui/Select.jsx';

export default function ServerSelector() {
  const { guildId } = useParams();
  const { guilds } = useAuth();
  const navigate = useNavigate();

  if (!guilds.length) {
    return (
      <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-4 text-sm text-slate-400">
        No manageable server found.
      </div>
    );
  }

  return (
    <label className="grid gap-2 text-sm">
      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Server</span>
      <Select
        value={guildId || ''}
        onChange={(event) => navigate(`/dashboard/${event.target.value}/welcome`)}
        aria-label="Select Discord server"
      >
        {guilds.map((guild) => (
          <option key={guild.id} value={guild.id}>{guild.name}</option>
        ))}
      </Select>
    </label>
  );
}
