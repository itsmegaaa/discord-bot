const { EmbedBuilder } = require('discord.js');
const { getGuildConfig, sendLog } = require('../utils/logger');

module.exports = {
  name: 'messageUpdate',
  async execute(oldMessage, newMessage, client) {
    if (!newMessage.guild || newMessage.author?.bot) return;

    const config = await getGuildConfig(client, newMessage.guild.id);
    if (!config?.logMessageEdit) return;

    const oldContent = oldMessage.content || 'Tidak tersedia';
    const newContent = newMessage.content || 'Tidak tersedia';
    if (oldContent === newContent) return;

    const embed = new EmbedBuilder()
      .setColor('#FEE75C')
      .setTitle('Message Edited')
      .addFields(
        { name: 'User', value: `${newMessage.author} (${newMessage.author.tag})` },
        { name: 'Channel', value: `${newMessage.channel}` },
        { name: 'Sebelum', value: oldContent.slice(0, 1024) },
        { name: 'Sesudah', value: newContent.slice(0, 1024) }
      )
      .setTimestamp();

    await sendLog(client, newMessage.guild.id, embed);
  },
};
