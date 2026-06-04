import { Link } from 'react-router-dom';
import { BarChart3, Cake, Command, Gift, Shield, Sparkles, Star, TerminalSquare } from 'lucide-react';
import Button from '../components/ui/Button.jsx';

const features = [
  ['Welcome System', 'Configure greetings, goodbye messages, auto roles, and welcome cards.', Sparkles],
  ['Leveling', 'Reward active members with XP, voice activity, and role milestones.', Star],
  ['Moderation', 'Review warnings and keep staff workflows organized.', Shield],
  ['AutoMod', 'Stop spam, bad words, links, and mass mentions early.', TerminalSquare],
  ['Giveaway', 'Track active and ended giveaways from the dashboard.', Gift],
  ['Birthday Reminder', 'Celebrate members automatically with channels and roles.', Cake],
  ['Custom Commands', 'Create shortcuts for repeated server information.', Command],
  ['Insights', 'Understand activity, top members, and channel performance.', BarChart3],
];

export default function Landing() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#0b0d13] text-slate-50">
      <section className="relative min-h-[92vh] px-6 py-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(88,101,242,0.22),transparent_34rem),radial-gradient(circle_at_80%_10%,rgba(56,189,248,0.12),transparent_28rem)]" />
        <nav className="relative mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#5865f2] shadow-lg shadow-[#5865f2]/25">
              <Sparkles size={20} />
            </div>
            <div>
              <div className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">ABNRML</div>
              <div className="font-bold">Control Center</div>
            </div>
          </div>
          <Button as={Link} to="/login" variant="secondary" size="sm">Open Dashboard</Button>
        </nav>

        <div className="relative mx-auto grid min-h-[76vh] max-w-7xl content-center gap-10 py-16">
          <div className="max-w-4xl">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#a5b4fc]">ABNRML Bot</p>
            <h1 className="mt-5 max-w-5xl text-5xl font-black tracking-tight text-white md:text-7xl">
              Manage your Discord community from one clean control center.
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-400">
              ABNRML Bot helps you configure welcome messages, leveling, moderation, automod, logging, giveaways,
              birthdays, custom commands, and server insights through a modern web dashboard.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button as={Link} to="/login" size="lg">Login with Discord</Button>
              <Button as="a" href="#features" variant="secondary" size="lg">Explore features</Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <PreviewCard label="Active Members" value="1,248" tone="primary" />
            <PreviewCard label="Automod Blocks" value="87" tone="danger" />
            <PreviewCard label="Weekly XP" value="92.4k" tone="success" />
          </div>
        </div>
      </section>

      <section id="features" className="border-y border-white/10 bg-[#11131a] px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold">Everything your server needs.</h2>
            <p className="mt-3 text-slate-400">Configure community systems without digging through command docs.</p>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map(([title, description, Icon]) => (
              <div key={title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#5865f2]/25 bg-[#5865f2]/10 text-[#a5b4fc]">
                  <Icon size={21} />
                </div>
                <h3 className="mt-4 font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-3">
          {['Invite the bot', 'Login with Discord', 'Tune your systems'].map((title, index) => (
            <div key={title} className="rounded-2xl border border-white/10 bg-[#171a23] p-6">
              <div className="text-sm font-bold text-[#a5b4fc]">0{index + 1}</div>
              <h3 className="mt-4 text-xl font-bold">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                {index === 0 && 'Add ABNRML Bot to your server and keep the worker online.'}
                {index === 1 && 'Use a Discord account with Manage Server permission.'}
                {index === 2 && 'Configure welcome, leveling, moderation, and insights from the dashboard.'}
              </p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-white/10 px-6 py-8 text-center text-sm text-slate-500">
        Created & Developed by Rivaldy Taufikqul Hakim
      </footer>
    </main>
  );
}

function PreviewCard({ label, tone, value }) {
  const tones = {
    primary: 'from-[#5865f2]/20 to-[#5865f2]/5 text-[#a5b4fc]',
    danger: 'from-[#ef4444]/20 to-[#ef4444]/5 text-[#fecaca]',
    success: 'from-[#22c55e]/20 to-[#22c55e]/5 text-[#86efac]',
  };

  return (
    <div className={`rounded-2xl border border-white/10 bg-gradient-to-br ${tones[tone]} p-5 shadow-xl shadow-black/20`}>
      <div className="text-sm text-slate-400">{label}</div>
      <div className="mt-3 text-3xl font-black text-white">{value}</div>
      <div className="mt-4 h-2 rounded-full bg-white/10">
        <div className="h-2 w-2/3 rounded-full bg-current" />
      </div>
    </div>
  );
}
