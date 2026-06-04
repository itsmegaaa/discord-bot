import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <main className="min-h-screen bg-[#2b2d31] p-6 text-[#f2f3f5]">
      <section className="mx-auto flex min-h-[80vh] max-w-4xl flex-col justify-center">
        <h1 className="text-5xl font-bold">Discord Bot Dashboard</h1>
        <p className="mt-4 max-w-2xl text-lg text-[#b5bac1]">Configure welcome, leveling, moderation, automod, logging, giveaways, birthdays, commands, and insights from one focused dashboard.</p>
        <Link to="/login" className="mt-8 w-fit rounded bg-[#5865f2] px-5 py-3 font-semibold hover:bg-[#4752c4]">Login with Discord</Link>
      </section>
    </main>
  );
}
