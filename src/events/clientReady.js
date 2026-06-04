const { REST, Routes } = require('discord.js');
const fs = require('fs');
const { rescheduleActiveGiveaways } = require('../commands/utility/giveaway');
const { cacheAllGuildResources } = require('../utils/guildCache');

module.exports = {
  name: 'clientReady',
  once: true,
  async execute(client) {
    console.log(`Bot online sebagai ${client.user.tag}`);

    const commands = [];
    const folders = fs.readdirSync('./src/commands');
    for (const folder of folders) {
      const files = fs
        .readdirSync(`./src/commands/${folder}`)
        .filter((f) => f.endsWith('.js'));
      for (const file of files) {
        const cmd = require(`../commands/${folder}/${file}`);
        if (cmd.data) commands.push(cmd.data.toJSON());
      }
    }

    try {
      const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
      await rest.put(Routes.applicationCommands(client.user.id), {
        body: commands,
      });
      console.log(`${commands.length} slash commands terdaftar`);
    } catch (err) {
      console.error('Gagal register slash commands:', err);
    }

    try {
      await cacheAllGuildResources(client);
    } catch (err) {
      console.error('Gagal cache guild resources:', err);
    }

    try {
      await rescheduleActiveGiveaways(client);
    } catch (err) {
      console.error('Gagal re-schedule giveaway aktif:', err);
    }
  },
};
