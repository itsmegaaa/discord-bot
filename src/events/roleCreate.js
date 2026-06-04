const { cacheGuildResources } = require('../utils/guildCache');

module.exports = {
  name: 'roleCreate',
  async execute(role, client) {
    await cacheGuildResources(client, role.guild).catch(console.error);
  },
};
