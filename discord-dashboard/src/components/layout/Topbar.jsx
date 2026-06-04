import { Menu, UserCircle } from 'lucide-react';
import { useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import StatusBadge from '../ui/StatusBadge.jsx';

const titles = {
  welcome: 'Welcome System',
  leveling: 'Leveling & XP',
  moderation: 'Moderation',
  automod: 'AutoMod',
  logging: 'Server Logging',
  giveaway: 'Giveaway',
  birthday: 'Birthday Reminder',
  commands: 'Custom Commands',
  insights: 'Server Insights',
};

export default function Topbar({ onMenu }) {
  const location = useLocation();
  const { guildId } = useParams();
  const { guilds, user } = useAuth();
  const currentKey = location.pathname.split('/').filter(Boolean).at(-1);
  const currentGuild = guilds.find((guild) => guild.id === guildId);
  const title = titles[currentKey] || 'Dashboard';

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-white/10 bg-[#0b0d13]/85 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <button type="button" onClick={onMenu} className="rounded-xl border border-white/10 bg-white/[0.03] p-2 text-slate-200 hover:bg-white/[0.07] md:hidden">
          <Menu size={20} />
        </button>
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-slate-100">{title}</div>
          <div className="truncate text-xs text-slate-500">{currentGuild?.name || 'ABNRML Control Center'}</div>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <div className="hidden sm:block">
          <StatusBadge tone="success">Dashboard Online</StatusBadge>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-slate-300">
          <UserCircle size={17} />
          <span className="hidden max-w-36 truncate sm:inline">{user?.displayName || user?.email || 'Discord user'}</span>
        </div>
      </div>
    </header>
  );
}
