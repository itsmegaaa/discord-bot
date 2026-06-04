const { cacheGuildResources } = require('../utils/guildCache');

module.exports = {
  name: 'channelUpdate',
  async execute(oldChannel, newChannel, client) {
    const guild = newChannel.guild || oldChannel.guild;
    if (guild) await cacheGuildResources(client, guild).catch(console.error);
  },
};
