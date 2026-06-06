export default function Terms() {
  return (
    <main className="min-h-screen bg-[#0b0d13] py-12 px-6 text-slate-300">
      <div className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-[#171a23]/95 p-8 shadow-2xl shadow-black/40">
        <h1 className="mb-2 text-3xl font-bold text-slate-50">Terms of Service</h1>
        <p className="mb-8 text-sm text-slate-500">Last updated: 2026</p>

        <div className="space-y-6 leading-relaxed">
          <p>
            By using this Discord bot, you agree to use it responsibly and follow
            Discord&apos;s Terms of Service and Community Guidelines.
          </p>

          <section>
            <h2 className="mb-2 text-xl font-semibold text-slate-100">Bot Usage</h2>
            <p>
              This bot provides community features such as welcome messages,
              moderation, leveling, giveaways, birthday reminders, logging, custom
              commands, and server configuration.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-semibold text-slate-100">Server Admin Responsibility</h2>
            <p>
              Server owners and administrators are responsible for how the bot is
              configured and used in their Discord server.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-semibold text-slate-100">Abuse</h2>
            <p>
              The bot may not be used for spam, harassment, abuse, or activity that
              violates Discord rules.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-semibold text-slate-100">Changes</h2>
            <p>
              Features may be changed, disabled, or removed for maintenance,
              security, or stability reasons.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-semibold text-slate-100">Contact</h2>
            <p>
              For questions or removal requests, contact the bot owner or server
              administrator.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
