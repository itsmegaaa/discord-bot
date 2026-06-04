const PERIOD_DAYS = {
  today: 1,
  week: 7,
  month: 30,
  alltime: null,
};

function dateKey(date) {
  return date.toISOString().split('T')[0];
}

function getDateKeys(period = 'week') {
  const days = PERIOD_DAYS[period] ?? PERIOD_DAYS.week;
  if (!days) return null;

  const keys = [];
  for (let i = 0; i < days; i += 1) {
    const date = new Date();
    date.setUTCDate(date.getUTCDate() - i);
    keys.push(dateKey(date));
  }
  return keys;
}

function getPreviousDateKeys(period = 'week') {
  const days = PERIOD_DAYS[period] ?? PERIOD_DAYS.week;
  if (!days) return [];

  const keys = [];
  for (let i = days; i < days * 2; i += 1) {
    const date = new Date();
    date.setUTCDate(date.getUTCDate() - i);
    keys.push(dateKey(date));
  }
  return keys;
}

function matchesPeriod(data, keys) {
  return !keys || keys.includes(data.date);
}

async function fetchByGuild(db, collection, guildId) {
  const snapshot = await db.collection(collection).where('guildId', '==', guildId).get();
  return snapshot.docs.map((doc) => doc.data());
}

async function getActivityLogs(db, guildId, period = 'week') {
  const keys = getDateKeys(period);
  const rows = await fetchByGuild(db, 'activityLogs', guildId);
  return rows.filter((row) => matchesPeriod(row, keys));
}

async function getChannelLogs(db, guildId, period = 'week') {
  const keys = getDateKeys(period);
  const rows = await fetchByGuild(db, 'channelLogs', guildId);
  return rows.filter((row) => matchesPeriod(row, keys));
}

async function getServerStats(db, guildId, period = 'week') {
  const keys = getDateKeys(period);
  const rows = await fetchByGuild(db, 'serverStats', guildId);
  return rows.filter((row) => matchesPeriod(row, keys));
}

async function getServerStatsByDays(db, guildId, days = 30) {
  const keys = [];
  for (let i = 0; i < days; i += 1) {
    const date = new Date();
    date.setUTCDate(date.getUTCDate() - i);
    keys.push(dateKey(date));
  }

  const rows = await fetchByGuild(db, 'serverStats', guildId);
  return rows
    .filter((row) => keys.includes(row.date))
    .sort((a, b) => a.date.localeCompare(b.date));
}

function sum(rows, field) {
  return rows.reduce((total, row) => total + (row[field] ?? 0), 0);
}

function percentChange(current, previous) {
  if (!previous) return current ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

async function getServerSummary(db, guildId, period = 'week') {
  const [activityRows, channelRows, currentStats, previousStats] = await Promise.all([
    getActivityLogs(db, guildId, period),
    getChannelLogs(db, guildId, period),
    getServerStats(db, guildId, period),
    fetchByGuild(db, 'serverStats', guildId).then((rows) => rows.filter((row) => {
      const keys = getPreviousDateKeys(period);
      return keys.includes(row.date);
    })),
  ]);

  const totalMessages = sum(currentStats, 'totalMessages') || sum(activityRows, 'messageCount');
  const previousMessages = sum(previousStats, 'totalMessages');
  const topChannel = getTopChannelsFromRows(channelRows, 1)[0] ?? null;
  const hours = getHourlyDistributionFromRows(channelRows);
  const busiestHour = hours.reduce((best, item) => (item.messages > best.messages ? item : best), { hour: 0, messages: 0 });
  const activeMembers = new Set(activityRows.filter((row) => (row.messageCount ?? 0) > 0).map((row) => row.userId)).size;

  return {
    totalMessages,
    previousMessages,
    messageChangePercent: percentChange(totalMessages, previousMessages),
    activeMembers,
    totalVoiceMinutes: sum(currentStats, 'totalVoiceMinutes') || sum(activityRows, 'voiceMinutes'),
    busiestHour,
    topChannel,
  };
}

async function getMemberInsight(db, guildId, userId, period = 'week') {
  const [periodRows, allRows, levelDoc] = await Promise.all([
    getActivityLogs(db, guildId, period),
    getActivityLogs(db, guildId, 'alltime'),
    db.collection('userLevels').doc(`${guildId}_${userId}`).get(),
  ]);
  const memberPeriodRows = periodRows.filter((row) => row.userId === userId);
  const memberAllRows = allRows.filter((row) => row.userId === userId);
  const level = levelDoc.exists ? levelDoc.data() : {};
  const days = PERIOD_DAYS[period] ?? Math.max(memberPeriodRows.length, 1);
  const weekRows = allRows.filter((row) => matchesPeriod(row, getDateKeys('week')) && row.userId === userId);
  const activeDay = weekRows.sort((a, b) => (b.messageCount ?? 0) - (a.messageCount ?? 0))[0] ?? null;
  const firstActive = memberAllRows.sort((a, b) => a.date.localeCompare(b.date))[0] ?? null;

  return {
    userId,
    periodMessages: sum(memberPeriodRows, 'messageCount'),
    allMessages: sum(memberAllRows, 'messageCount'),
    periodVoiceMinutes: sum(memberPeriodRows, 'voiceMinutes'),
    allVoiceMinutes: sum(memberAllRows, 'voiceMinutes'),
    level: level.level ?? 0,
    xp: level.xp ?? 0,
    averageMessagesPerDay: Math.round((sum(memberPeriodRows, 'messageCount') / Math.max(days ?? 1, 1)) * 10) / 10,
    mostActiveDay: activeDay?.date ?? 'Tidak tersedia',
    firstActive: firstActive?.date ?? 'Tidak tersedia',
  };
}

async function getTopMembers(db, guildId, period = 'week', limit = 10) {
  const rows = await getActivityLogs(db, guildId, period);
  const byUser = new Map();

  rows.forEach((row) => {
    const current = byUser.get(row.userId) ?? { userId: row.userId, messageCount: 0, voiceMinutes: 0 };
    current.messageCount += row.messageCount ?? 0;
    current.voiceMinutes += row.voiceMinutes ?? 0;
    byUser.set(row.userId, current);
  });

  return [...byUser.values()]
    .sort((a, b) => b.messageCount - a.messageCount)
    .slice(0, limit);
}

function getTopChannelsFromRows(rows, limit = 10) {
  const byChannel = new Map();

  rows.forEach((row) => {
    const current = byChannel.get(row.channelId) ?? { channelId: row.channelId, messageCount: 0 };
    current.messageCount += row.messageCount ?? 0;
    byChannel.set(row.channelId, current);
  });

  return [...byChannel.values()]
    .sort((a, b) => b.messageCount - a.messageCount)
    .slice(0, limit);
}

async function getTopChannels(db, guildId, period = 'week', limit = 10) {
  return getTopChannelsFromRows(await getChannelLogs(db, guildId, period), limit);
}

function getHourlyDistributionFromRows(rows) {
  const buckets = Array(24).fill(0);
  rows.forEach((row) => {
    const hourlyBuckets = Array.isArray(row.hourlyBuckets) ? row.hourlyBuckets : [];
    hourlyBuckets.forEach((count, hour) => {
      buckets[hour] += count ?? 0;
    });
  });
  return buckets.map((messages, hour) => ({ hour, messages }));
}

async function getHourlyDistribution(db, guildId, days = 7) {
  const keys = [];
  for (let i = 0; i < days; i += 1) {
    const date = new Date();
    date.setUTCDate(date.getUTCDate() - i);
    keys.push(dateKey(date));
  }
  const rows = await fetchByGuild(db, 'channelLogs', guildId);
  return getHourlyDistributionFromRows(rows.filter((row) => keys.includes(row.date)));
}

module.exports = {
  getActivityLogs,
  getChannelLogs,
  getDateKeys,
  getHourlyDistribution,
  getMemberInsight,
  getServerStats,
  getServerStatsByDays,
  getServerSummary,
  getTopChannels,
  getTopMembers,
};
