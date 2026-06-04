import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';

export default function ServerSelector() {
  const { guildId } = useParams();
  const { guilds } = useAuth();
  const navigate = useNavigate();

  return (
    <select
      value={guildId || ''}
      onChange={(event) => navigate(`/dashboard/${event.target.value}/welcome`)}
      className="w-full rounded border border-white/5 bg-[#313338] px-3 py-2 text-sm text-[#f2f3f5]"
    >
      {guilds.map((guild) => (
        <option key={guild.id} value={guild.id}>{guild.name}</option>
      ))}
    </select>
  );
}
