const { cacheGuildResources } = require('../utils/guildCache');

module.exports = {
  name: 'channelCreate',
  async execute(channel, client) {
    if (channel.guild) await cacheGuildResources(client, channel.guild).catch(console.error);
  },
};
