import { Activity } from 'lucide-react';
import { useParams, Link } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader.jsx';
import SectionCard from '../../components/ui/SectionCard.jsx';
import { useAuth } from '../../hooks/useAuth.js';

export default function Overview() {
  const { guildId } = useParams();
  const { guilds } = useAuth();
  const guild = guilds.find((g) => g.id === guildId);

  return (
    <div>
      <PageHeader
        icon={Activity}
        title="Dashboard Overview"
        subtitle={`Quick look at your server's bot statistics and active features.`}
      />
      <div className="grid gap-5 lg:grid-cols-2">
        <SectionCard title="Server Info" description="Basic server details.">
          <div className="flex items-center gap-4">
            {guild?.icon ? (
              <img src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`} alt={guild.name} className="h-16 w-16 rounded-2xl" />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#5865f2] text-xl font-bold text-white">
                {guild?.name?.[0] || '?'}
              </div>
            )}
            <div>
              <div className="text-xl font-bold text-slate-50">{guild?.name}</div>
              <div className="text-sm text-slate-400">ID: {guildId}</div>
            </div>
          </div>
        </SectionCard>
        <SectionCard title="Quick Actions" description="Fast access to important settings.">
          <div className="grid grid-cols-2 gap-3 mt-2">
            <Link to={`/dashboard/${guildId}/modules`} className="flex items-center justify-center rounded-xl bg-[#5865f2] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#4752c4]">
              Manage Modules
            </Link>
            <Link to={`/dashboard/${guildId}/welcome`} className="flex items-center justify-center rounded-xl bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10 border border-white/10">
              Welcome Settings
            </Link>
            <Link to={`/dashboard/${guildId}/moderation`} className="flex items-center justify-center rounded-xl bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10 border border-white/10">
              Moderation
            </Link>
            <Link to={`/dashboard/${guildId}/insights`} className="flex items-center justify-center rounded-xl bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10 border border-white/10">
              View Analytics
            </Link>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
