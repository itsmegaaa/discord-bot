const { EmbedBuilder } = require('discord.js');
const { getGuildConfig, sendLog } = require('../utils/logger');

module.exports = {
  name: 'messageDelete',
  async execute(message, client) {
    if (!message.guild || message.author?.bot) return;

    const config = await getGuildConfig(client, message.guild.id);
    if (!config?.logMessageDelete) return;

    const embed = new EmbedBuilder()
      .setColor('#ED4245')
      .setTitle('Message Deleted')
      .addFields(
        { name: 'User', value: message.author ? `${message.author} (${message.author.tag})` : 'Tidak tersedia' },
        { name: 'Channel', value: `${message.channel}` },
        { name: 'Detail aksi', value: (message.content || 'Konten tidak tersedia').slice(0, 1024) }
      )
      .setTimestamp();

    await sendLog(client, message.guild.id, embed);
  },
};
