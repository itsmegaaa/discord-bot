const { cacheGuildResources } = require('../utils/guildCache');

module.exports = {
  name: 'roleUpdate',
  async execute(oldRole, newRole, client) {
    await cacheGuildResources(client, newRole.guild || oldRole.guild).catch(console.error);
  },
};
