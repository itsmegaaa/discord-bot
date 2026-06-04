import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Card from '../../components/ui/Card.jsx';
import { botApi } from '../../lib/botApi.js';

export default function Insights() {
  const { guildId } = useParams();
  const [period, setPeriod] = useState('week');
  const [data, setData] = useState(null);
  useEffect(() => {
    Promise.all([
      botApi.get(`/api/guilds/${guildId}/insights/summary?periode=${period}`),
      botApi.get(`/api/guilds/${guildId}/insights/members?periode=${period}`),
      botApi.get(`/api/guilds/${guildId}/insights/channels?periode=${period}`),
      botApi.get(`/api/guilds/${guildId}/insights/hours?days=7`),
    ]).then(([summary, members, channels, hours]) => setData({ summary, members, channels, hours }));
  }, [guildId, period]);
  if (!data) return <div>Loading...</div>;
  return (
    <div className="grid gap-4">
      <select value={period} onChange={(e) => setPeriod(e.target.value)} className="w-fit rounded bg-[#313338] p-2">
        <option value="today">Today</option><option value="week">Week</option><option value="month">Month</option>
      </select>
      <div className="grid gap-4 md:grid-cols-4">
        <Card title="Messages">{data.summary.totalMessages}</Card>
        <Card title="Active Members">{data.summary.activeMembers}</Card>
        <Card title="Voice Minutes">{data.summary.totalVoiceMinutes}</Card>
        <Card title="Change">{data.summary.messageChangePercent}%</Card>
      </div>
      <Card title="Top Members">{(data.members.members || []).map((m, i) => <div key={m.userId}>{i + 1}. {m.userId} — {m.messageCount} messages · {m.voiceMinutes} voice</div>)}</Card>
      <Card title="Channel Activity">{(data.channels.channels || []).map((c) => <div key={c.channelId} className="mb-2"><div>&lt;#{c.channelId}&gt; {c.messageCount}</div><div className="h-2 rounded bg-[#5865f2]" style={{ width: `${Math.max(4, c.messageCount)}%` }} /></div>)}</Card>
      <Card title="Hourly Activity"><div className="grid grid-cols-4 gap-2 md:grid-cols-6">{(data.hours.hours || []).map((h) => <div key={h.hour} className="rounded bg-[#2b2d31] p-2 text-center text-sm">{String(h.hour).padStart(2, '0')}:00<br />{h.messages}</div>)}</div></Card>
    </div>
  );
}
