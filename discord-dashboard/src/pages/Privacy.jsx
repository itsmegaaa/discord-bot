export default function Privacy() {
  return (
    <main className="min-h-screen bg-[#0b0d13] py-12 px-6 text-slate-300">
      <div className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-[#171a23]/95 p-8 shadow-2xl shadow-black/40">
        <h1 className="mb-2 text-3xl font-bold text-slate-50">Privacy Policy</h1>
        <p className="mb-8 text-sm text-slate-500">Last updated: 2026</p>

        <div className="space-y-6 leading-relaxed">
          <p>
            This Discord bot may store limited data required to provide server
            features and dashboard configuration.
          </p>

          <section>
            <h2 className="mb-2 text-xl font-semibold text-slate-100">Data We May Store</h2>
            <ul className="ml-6 list-disc space-y-1 text-slate-400">
              <li>Discord user ID</li>
              <li>Discord server/guild ID</li>
              <li>Channel ID</li>
              <li>Role ID</li>
              <li>Leveling or XP data</li>
              <li>Birthday data, if enabled</li>
              <li>Moderation logs or warning records</li>
              <li>Server configuration</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-semibold text-slate-100">How Data Is Used</h2>
            <p>
              Data is used only to run bot features, dashboard settings, moderation,
              logging, and community automation.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-semibold text-slate-100">Data Sharing</h2>
            <p>
              We do not sell user data. Data may be stored using services such as
              Firebase, Firestore, hosting providers, or other infrastructure used by
              the project.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-semibold text-slate-100">Data Removal</h2>
            <p>
              Server administrators or users may request removal of related data when
              technically possible.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-semibold text-slate-100">Security</h2>
            <p>
              Reasonable steps are taken to protect stored data, but no online system
              can be guaranteed to be fully secure.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-semibold text-slate-100">Contact</h2>
            <p>
              For privacy or data removal requests, contact the bot owner or server
              administrator.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
