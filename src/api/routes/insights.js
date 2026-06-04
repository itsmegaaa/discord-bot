const express = require('express');
const {
  getHourlyDistribution,
  getServerStatsByDays,
  getServerSummary,
  getTopChannels,
  getTopMembers,
} = require('../../utils/analytics');

const router = express.Router({ mergeParams: true });

function period(req) {
  return req.query.periode || 'week';
}

function limit(req) {
  const value = Number(req.query.limit ?? 10);
  return Number.isFinite(value) ? Math.min(Math.max(value, 1), 100) : 10;
}

router.get('/summary', async (req, res) => {
  const data = await getServerSummary(req.db, req.params.guildId, period(req));
  res.json(data);
});

router.get('/members', async (req, res) => {
  const data = await getTopMembers(req.db, req.params.guildId, period(req), limit(req));
  res.json({ members: data });
});

router.get('/channels', async (req, res) => {
  const data = await getTopChannels(req.db, req.params.guildId, period(req), limit(req));
  res.json({ channels: data });
});

router.get('/hours', async (req, res) => {
  const days = Number(req.query.days ?? 7);
  const safeDays = Number.isFinite(days) ? Math.min(Math.max(days, 1), 90) : 7;
  const data = await getHourlyDistribution(req.db, req.params.guildId, safeDays);
  res.json({ hours: data });
});

router.get('/server-stats', async (req, res) => {
  const days = Number(req.query.days ?? 30);
  const safeDays = Number.isFinite(days) ? Math.min(Math.max(days, 1), 365) : 30;
  const data = await getServerStatsByDays(req.db, req.params.guildId, safeDays);
  res.json({ stats: data });
});

module.exports = router;
