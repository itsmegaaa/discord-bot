import { Link } from 'react-router-dom';
import { Server, ShieldCheck } from 'lucide-react';
import Button from '../components/ui/Button.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import { useAuth } from '../hooks/useAuth.js';

export default function ServerList() {
  const { guilds } = useAuth();
  return (
    <main className="min-h-screen bg-[#0b0d13] p-6 text-slate-50">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-3 border-b border-white/10 pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#a5b4fc]">ABNRML Control Center</p>
            <h1 className="mt-2 text-3xl font-bold">Select Server</h1>
            <p className="mt-2 text-sm text-slate-400">Choose a Discord server where ABNRML Bot is installed and you can manage settings.</p>
          </div>
          <div className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-slate-300">
            {guilds.length} manageable servers
          </div>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {guilds.map((guild) => (
            <div key={guild.id} className="rounded-2xl border border-white/10 bg-[#171a23] p-5 shadow-xl shadow-black/20">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#5865f2]/15 text-[#a5b4fc]">
                  <Server size={22} />
                </div>
                <div className="min-w-0">
                  <div className="truncate text-lg font-semibold">{guild.name}</div>
                  <div className="mt-1 truncate text-xs text-slate-500">{guild.id}</div>
                </div>
              </div>
              <Button as={Link} to={`/dashboard/${guild.id}/welcome`} className="mt-5 w-full" variant="secondary">
                Manage Server
              </Button>
            </div>
          ))}
        </div>
        {!guilds.length && (
          <div className="mt-6">
            <EmptyState
              icon={ShieldCheck}
              title="No manageable server found."
              description="Possible causes: the bot has not been invited, your Discord account does not have Manage Server permission, Firestore has not registered the server yet, or the bot worker has not synced the guild. Invite the bot, make sure your Discord account can manage the server, then refresh this page."
            />
          </div>
        )}
      </div>
    </main>
  );
}
