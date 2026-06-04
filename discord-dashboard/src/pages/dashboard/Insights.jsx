import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { BarChart3, MessageSquare, Mic, TrendingUp, Users } from 'lucide-react';
import EmptyState from '../../components/ui/EmptyState.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import FormField from '../../components/ui/FormField.jsx';
import PageHeader from '../../components/ui/PageHeader.jsx';
import SectionCard from '../../components/ui/SectionCard.jsx';
import Select from '../../components/ui/Select.jsx';
import StatCard from '../../components/ui/StatCard.jsx';
import LoadingSkeleton from '../../components/shared/LoadingSkeleton.jsx';
import { botApi } from '../../lib/botApi.js';

export default function Insights() {
  const { guildId } = useParams();
  const [period, setPeriod] = useState('week');
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    setData(null);
    setError(null);
    Promise.all([
      botApi.get(`/api/guilds/${guildId}/insights/summary?periode=${period}`),
      botApi.get(`/api/guilds/${guildId}/insights/members?periode=${period}`),
      botApi.get(`/api/guilds/${guildId}/insights/channels?periode=${period}`),
      botApi.get(`/api/guilds/${guildId}/insights/hours?days=7`),
    ])
      .then(([summary, members, channels, hours]) => setData({ summary, members, channels, hours }))
      .catch((err) => setError(err.message || 'Gagal memuat insights.'));
  }, [guildId, period]);

  if (error) return <ErrorState title="Unable to load insights." description={error} />;
  if (!data) return <LoadingSkeleton />;

  const members = data.members.members || [];
  const channels = data.channels.channels || [];
  const hours = data.hours.hours || [];
  const maxChannelMessages = Math.max(1, ...channels.map((channel) => channel.messageCount || 0));

  return (
    <div>
      <PageHeader
        icon={BarChart3}
        title="Insights"
        subtitle="Track activity patterns across messages, members, voice, channels, and hours."
        actions={(
          <FormField label="Period">
            <Select value={period} onChange={(e) => setPeriod(e.target.value)} className="w-44">
              <option value="today">Today</option>
              <option value="week">Week</option>
              <option value="month">Month</option>
            </Select>
          </FormField>
        )}
      />

      <div className="grid gap-5">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard icon={MessageSquare} label="Messages" value={data.summary.totalMessages || 0} />
          <StatCard icon={Users} label="Active Members" value={data.summary.activeMembers || 0} tone="success" />
          <StatCard icon={Mic} label="Voice Minutes" value={data.summary.totalVoiceMinutes || 0} tone="info" />
          <StatCard icon={TrendingUp} label="Message Change" value={`${data.summary.messageChangePercent || 0}%`} tone="warning" />
        </div>

        <div className="grid gap-5 xl:grid-cols-2">
          <SectionCard title="Top Members" description="Most active members for the selected period.">
            <div className="grid gap-3">
              {members.map((member, index) => (
                <div key={member.userId} className="grid gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 md:grid-cols-[48px_1fr_auto] md:items-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#5865f2]/30 bg-[#5865f2]/10 font-bold text-[#c7d2fe]">{index + 1}</div>
                  <div>
                    <div className="font-semibold text-slate-50">{member.userId}</div>
                    <div className="text-sm text-slate-400">{member.messageCount || 0} messages</div>
                  </div>
                  <div className="text-sm font-semibold text-slate-300">{member.voiceMinutes || 0} voice min</div>
                </div>
              ))}
              {!members.length && <EmptyState title="No member activity." description="Activity will appear once members send messages or join voice." />}
            </div>
          </SectionCard>

          <SectionCard title="Channel Activity" description="Message volume by channel for the selected period.">
            <div className="grid gap-4">
              {channels.map((channel) => {
                const width = `${Math.max(4, Math.round(((channel.messageCount || 0) / maxChannelMessages) * 100))}%`;
                return (
                  <div key={channel.channelId} className="grid gap-2">
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="font-medium text-slate-200">&lt;#{channel.channelId}&gt;</span>
                      <span className="text-slate-400">{channel.messageCount || 0}</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/[0.05]">
                      <div className="h-2 rounded-full bg-[#5865f2]" style={{ width }} />
                    </div>
                  </div>
                );
              })}
              {!channels.length && <EmptyState title="No channel activity." description="Channel analytics will populate as messages are logged." />}
            </div>
          </SectionCard>
        </div>

        <SectionCard title="Hourly Activity" description="Message distribution across the last seven days.">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
            {hours.map((hour) => (
              <div key={hour.hour} className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-center">
                <div className="text-xs uppercase tracking-[0.18em] text-slate-500">{String(hour.hour).padStart(2, '0')}:00</div>
                <div className="mt-2 text-lg font-bold text-slate-50">{hour.messages || 0}</div>
              </div>
            ))}
          </div>
          {!hours.length && <div className="mt-4"><EmptyState title="No hourly data." description="Hourly buckets will show up after analytics has enough activity." /></div>}
        </SectionCard>
      </div>
    </div>
  );
}
