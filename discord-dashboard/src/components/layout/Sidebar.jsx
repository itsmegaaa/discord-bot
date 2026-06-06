import { NavLink, useParams } from 'react-router-dom';
import { BarChart3, Bot, Cake, ClipboardList, Command, Gift, LogOut, Shield, Sparkles, Star, Layers, Activity, FileText, Database, SmilePlus } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import StatusBadge from '../ui/StatusBadge.jsx';
import ServerSelector from '../shared/ServerSelector.jsx';

const groups = [
  {
    name: 'Overview',
    items: [
      ['overview', 'Overview', Activity],
      ['insights', 'Analytics', BarChart3],
    ]
  },
  {
    name: 'Features',
    items: [
      ['modules', 'Modules', Layers],
      ['welcome', 'Welcome', Sparkles],
      ['leveling', 'Leveling', Star],
      ['giveaway', 'Giveaway', Gift],
      ['birthday', 'Birthday', Cake],
      ['commands', 'Commands', Command],
      ['reaction-roles', 'Reaction Roles', SmilePlus],
    ]
  },
  {
    name: 'Moderation',
    items: [
      ['moderation', 'Moderation', Shield],
      ['automod', 'Auto Mod', Bot],
      ['logging', 'Logging', ClipboardList],
    ]
  },
  {
    name: 'Settings',
    items: [
      ['privacy', 'Privacy & Data', Database],
      ['legal', 'Legal Pages', FileText],
    ]
  }
];

export default function Sidebar({ open, onClose }) {
  const { guildId } = useParams();
  const { logout } = useAuth();

  return (
    <aside className={`${open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-white/10 bg-[#0b0d13]/95 p-4 shadow-2xl shadow-black/40 backdrop-blur-xl transition`}>
      <div className="mb-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#5865f2] text-white shadow-lg shadow-[#5865f2]/25">
            <Bot size={24} />
          </div>
          <div>
            <div className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">ABNRML</div>
            <div className="text-lg font-bold text-slate-50">Control Center</div>
          </div>
        </div>
        <div className="mt-4">
          <StatusBadge tone="success">Dashboard Online</StatusBadge>
        </div>
      </div>
      <ServerSelector />
      <nav className="mt-5 flex flex-col gap-5 overflow-y-auto pb-4">
        {groups.map((group) => (
          <div key={group.name}>
            <div className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
              {group.name}
            </div>
            <div className="grid gap-1">
              {group.items.map(([path, label, Icon]) => (
                <NavLink
                  key={path}
                  to={`/dashboard/${guildId}/${path}`}
                  onClick={onClose}
                  className={({ isActive }) => `flex min-h-10 items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${isActive ? 'border border-[#5865f2]/40 bg-[#5865f2]/20 text-white shadow-lg shadow-[#5865f2]/10' : 'border border-transparent text-slate-400 hover:border-white/10 hover:bg-white/[0.04] hover:text-slate-100'}`}
                >
                  <Icon size={18} /> <span>{label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>
      <button type="button" onClick={logout} className="mt-auto flex min-h-11 w-full items-center gap-3 rounded-xl border border-transparent px-3 py-2 text-sm font-medium text-slate-400 transition hover:border-white/10 hover:bg-white/[0.04] hover:text-slate-100">
        <LogOut size={18} /> Logout
      </button>
    </aside>
  );
}
