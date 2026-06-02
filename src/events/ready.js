const { REST, Routes } = require('discord.js');
const fs = require('fs');

module.exports = {
  name: 'ready',
  once: true,
  async execute(client) {
    console.log(`✅ Bot online sebagai ${client.user.tag}`);

    // Register slash commands
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

    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
    await rest.put(Routes.applicationCommands(client.user.id), {
      body: commands,
    });
    console.log(`📋 ${commands.length} slash commands terdaftar`);
  },
};