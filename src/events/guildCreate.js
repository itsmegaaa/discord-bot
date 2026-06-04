const { syncGuild } = require('../utils/syncGuild');

module.exports = {
  name: 'guildCreate',
  async execute(guild, client) {
    try {
      const result = await syncGuild(client, guild);
      if (result.ok) {
        console.log(`Bot bergabung ke server: ${guild.name} (${result.configStatus}).`);
      }
    } catch (err) {
      console.error(`Gagal sync guild baru ${guild.name} (${guild.id}):`, err);
    }
  },
};
