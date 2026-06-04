import { NavLink, useParams } from 'react-router-dom';
import { BarChart3, Bot, Cake, ClipboardList, Command, Gift, LogOut, Shield, Sparkles, Star } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import ServerSelector from '../shared/ServerSelector.jsx';

const items = [
  ['welcome', 'Welcome', Sparkles],
  ['leveling', 'Leveling', Star],
  ['moderation', 'Moderation', Shield],
  ['automod', 'Auto Mod', Bot],
  ['logging', 'Logging', ClipboardList],
  ['giveaway', 'Giveaway', Gift],
  ['birthday', 'Birthday', Cake],
  ['commands', 'Commands', Command],
  ['insights', 'Insights', BarChart3],
];

export default function Sidebar({ open, onClose }) {
  const { guildId } = useParams();
  const { logout } = useAuth();

  return (
    <aside className={`${open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} fixed inset-y-0 left-0 z-40 w-64 bg-[#1e1f22] p-4 transition md:static md:block`}>
      <div className="mb-4 flex items-center gap-2 font-bold">
        <Bot className="text-[#5865f2]" /> Bot Dashboard
      </div>
      <ServerSelector />
      <nav className="mt-5 grid gap-1">
        {items.map(([path, label, Icon]) => (
          <NavLink
            key={path}
            to={`/dashboard/${guildId}/${path}`}
            onClick={onClose}
            className={({ isActive }) => `flex items-center gap-3 rounded px-3 py-2 text-sm ${isActive ? 'bg-[#5865f2] text-white' : 'text-[#b5bac1] hover:bg-[#35373c]'}`}
          >
            <Icon size={18} /> {label}
          </NavLink>
        ))}
      </nav>
      <button type="button" onClick={logout} className="mt-6 flex w-full items-center gap-3 rounded px-3 py-2 text-sm text-[#b5bac1] hover:bg-[#35373c]">
        <LogOut size={18} /> Logout
      </button>
    </aside>
  );
}
