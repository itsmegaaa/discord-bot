const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick seorang member')
    .addUserOption((o) =>
      o.setName('target').setDescription('Member yang di-kick').setRequired(true)
    )
    .addStringOption((o) =>
      o.setName('alasan').setDescription('Alasan kick')
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

  async execute(interaction) {
    const target = interaction.options.getMember('target');
    const alasan = interaction.options.getString('alasan') ?? 'Tidak ada alasan';

    if (!target?.kickable) return interaction.reply({ content: '❌ Tidak bisa kick member ini.', ephemeral: true });

    await target.kick(alasan);

    const embed = new EmbedBuilder()
      .setColor('#FEE75C')
      .setTitle('👢 Member Di-kick')
      .addFields(
        { name: 'Member', value: target.user.tag, inline: true },
        { name: 'Moderator', value: interaction.user.tag, inline: true },
        { name: 'Alasan', value: alasan }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};