const raidTracker = new Map();
const raidMode = new Map();

function isRaidMode(guildId) {
  return raidMode.get(guildId) === true;
}

function setRaidMode(guildId, enabled) {
  raidMode.set(guildId, enabled);
}

function trackJoin(guildId, username, windowMs = 10000) {
  const now = Date.now();
  const entries = raidTracker.get(guildId) ?? [];
  const nextEntries = entries
    .filter((entry) => now - entry.timestamp <= windowMs)
    .concat({ timestamp: now, username });

  raidTracker.set(guildId, nextEntries);
  return nextEntries;
}

module.exports = {
  isRaidMode,
  raidMode,
  raidTracker,
  setRaidMode,
  trackJoin,
};
