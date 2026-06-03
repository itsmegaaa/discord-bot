const { EmbedBuilder } = require('discord.js');
const { sendLog } = require('../utils/logger');

function formatMessage(template, member, memberCount) {
  return template
    .replaceAll('{user}', member.user.tag)
    .replaceAll('{count}', `${memberCount}`);
}

async function getGuildConfig(member, client) {
  if (!client.db) return null;

  try {
    const doc = await client.db.collection('guildConfigs').doc(member.guild.id).get();
    return doc.exists ? doc.data() : null;
  } catch (err) {
    console.error('Gagal membaca guild config:', err);
    return null;
  }
}

module.exports = {
  name: 'guildMemberRemove',
  async execute(member, client) {
    const config = await getGuildConfig(member, client);
    if (config?.logMemberLeave) {
      const roles = member.roles.cache
        .filter((role) => role.id !== member.guild.id)
        .map((role) => role.name)
        .join(', ') || 'Tidak ada role';
      const logEmbed = new EmbedBuilder()
        .setColor('#ED4245')
        .setTitle('Member Left')
        .addFields(
          { name: 'User', value: `${member.user.tag}` },
          { name: 'Server', value: member.guild.name },
          { name: 'Detail aksi', value: `Role saat keluar: ${roles.slice(0, 1000)}` }
        )
        .setTimestamp();

      await sendLog(client, member.guild.id, logEmbed);
    }

    const channelId = config?.goodbyeChannelId || process.env.GOODBYE_CHANNEL_ID;
    if (!channelId) return;

    const channel = member.guild.channels.cache.get(channelId);
    if (!channel) return;

    const memberCount = member.guild.memberCount;
    const goodbyeMessage = config?.goodbyeMessage || '{user} telah meninggalkan server. Sekarang ada {count} member.';

    const embed = new EmbedBuilder()
      .setColor('#80848E')
      .setTitle('Member Keluar')
      .setDescription(formatMessage(goodbyeMessage, member, memberCount))
      .setThumbnail(member.user.displayAvatarURL({ size: 256 }))
      .setTimestamp();

    await channel.send({ embeds: [embed] });
  },
};
