const { cacheGuildResources } = require('../utils/guildCache');

module.exports = {
  name: 'roleDelete',
  async execute(role, client) {
    await cacheGuildResources(client, role.guild).catch(console.error);
  },
};
