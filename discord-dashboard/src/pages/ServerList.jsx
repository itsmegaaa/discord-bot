import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

export default function ServerList() {
  const { guilds } = useAuth();
  return (
    <main className="min-h-screen bg-[#2b2d31] p-6">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold">Select Server</h1>
        <div className="mt-6 grid gap-3">
          {guilds.map((guild) => (
            <Link key={guild.id} to={`/dashboard/${guild.id}/welcome`} className="rounded-lg border border-white/5 bg-[#313338] p-4 hover:bg-[#35373c]">
              <div className="font-semibold">{guild.name}</div>
              <div className="text-sm text-[#80848e]">{guild.id}</div>
            </Link>
          ))}
          {!guilds.length && <p className="text-[#b5bac1]">No manageable server with bot installed was found.</p>}
        </div>
      </div>
    </main>
  );
}
