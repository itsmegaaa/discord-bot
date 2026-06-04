const { syncGuildCache } = require('./syncGuild');

async function cacheGuildResources(client, guild) {
  if (!guild) return;
  await syncGuildCache(client, guild);
}

async function cacheAllGuildResources(client) {
  if (!client.db || !client.dbAdmin) return;

  for (const guild of client.guilds.cache.values()) {
    await cacheGuildResources(client, guild).catch(console.error);
  }
}

module.exports = {
  cacheAllGuildResources,
  cacheGuildResources,
};
