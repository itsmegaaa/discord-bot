const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const { createWelcomeCard } = require('../utils/welcomeCard');

module.exports = {
  name: 'guildMemberAdd',
  async execute(member, client) {
    // ── AUTO ROLE ──────────────────────────────────────
    const autoRoleId = process.env.AUTO_ROLE_ID;
    if (autoRoleId) {
      const role = member.guild.roles.cache.get(autoRoleId);
      if (role) await member.roles.add(role).catch(console.error);
    }

    // ── WELCOME MESSAGE ────────────────────────────────
    const channelId = process.env.WELCOME_CHANNEL_ID;
    if (!channelId) return;

    const channel = member.guild.channels.cache.get(channelId);
    if (!channel) return;

    const memberCount = member.guild.memberCount;

    // Generate welcome card (canvas)
    try {
      const cardBuffer = await createWelcomeCard(member);
      const attachment = new AttachmentBuilder(cardBuffer, {
        name: 'welcome.png',
      });

      const embed = new EmbedBuilder()
        .setColor('#2B2D31')
        .setTitle(`👋 Selamat datang di ${member.guild.name}!`)
        .setDescription(
          `Halo ${member}! Kamu adalah member ke-**${memberCount}**.\nBaca <#${process.env.RULES_CHANNEL_ID || channelId}> ya!`
        )
        .setImage('attachment://welcome.png')
        .setTimestamp();

      await channel.send({ embeds: [embed], files: [attachment] });
    } catch (err) {
      // Fallback tanpa gambar
      const embed = new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle(`👋 Selamat datang!`)
        .setDescription(`Halo ${member}! Kamu member ke-**${memberCount}**.`)
        .setThumbnail(member.user.displayAvatarURL({ size: 256 }));
      await channel.send({ embeds: [embed] });
    }
  },
};