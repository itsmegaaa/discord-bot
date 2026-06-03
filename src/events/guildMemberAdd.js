const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const { createWelcomeCard } = require('../utils/welcomeCard');

function formatMessage(template, member, memberCount) {
  return template
    .replaceAll('{user}', `${member}`)
    .replaceAll('{server}', member.guild.name)
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
  name: 'guildMemberAdd',
  async execute(member, client) {
    const config = await getGuildConfig(member, client);

    const autoRoleId = config?.autoRoleId || process.env.AUTO_ROLE_ID;
    if (autoRoleId) {
      const role = member.guild.roles.cache.get(autoRoleId);
      if (role) await member.roles.add(role).catch(console.error);
    }

    const channelId = config?.welcomeChannelId || process.env.WELCOME_CHANNEL_ID;
    if (!channelId) return;

    const channel = member.guild.channels.cache.get(channelId);
    if (!channel) return;

    const memberCount = member.guild.memberCount;
    const welcomeMessage = config?.welcomeMessage || 'Halo {user}! Kamu adalah member ke-**{count}**.';
    const rulesId = config?.rulesChannelId || process.env.RULES_CHANNEL_ID;
    const rulesText = rulesId ? `\nBaca <#${rulesId}> ya!` : '';
    const description = `${formatMessage(welcomeMessage, member, memberCount)}${rulesText}`;
    const welcomeCardEnabled = config?.welcomeCardEnabled ?? true;

    if (!welcomeCardEnabled) {
      const embed = new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle('👋 Selamat datang!')
        .setDescription(description)
        .setThumbnail(member.user.displayAvatarURL({ size: 256 }))
        .setTimestamp();

      await channel.send({ embeds: [embed] });
      return;
    }

    try {
      const cardBuffer = await createWelcomeCard(member);
      const attachment = new AttachmentBuilder(cardBuffer, {
        name: 'welcome.png',
      });

      const embed = new EmbedBuilder()
        .setColor('#2B2D31')
        .setTitle(`👋 Selamat datang di ${member.guild.name}!`)
        .setDescription(description)
        .setImage('attachment://welcome.png')
        .setTimestamp();

      await channel.send({ embeds: [embed], files: [attachment] });
    } catch (err) {
      console.error('Gagal membuat welcome card:', err);

      const embed = new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle('👋 Selamat datang!')
        .setDescription(description)
        .setThumbnail(member.user.displayAvatarURL({ size: 256 }))
        .setTimestamp();

      await channel.send({ embeds: [embed] });
    }
  },
};
