const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mute')
    .setDescription('Timeout seorang member')
    .addUserOption((o) =>
      o.setName('target').setDescription('Member yang di-mute').setRequired(true)
    )
    .addIntegerOption((o) =>
      o.setName('durasi').setDescription('Durasi dalam menit').setRequired(true).setMinValue(1).setMaxValue(40320)
    )
    .addStringOption((o) =>
      o.setName('alasan').setDescription('Alasan mute')
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    const target = interaction.options.getMember('target');
    const durasi = interaction.options.getInteger('durasi');
    const alasan = interaction.options.getString('alasan') ?? 'Tidak ada alasan';

    if (!target) return interaction.reply({ content: '❌ Member tidak ditemukan.', ephemeral: true });

    await target.timeout(durasi * 60 * 1000, alasan);

    const embed = new EmbedBuilder()
      .setColor('#FF6B35')
      .setTitle('🔇 Member Di-mute')
      .addFields(
        { name: 'Member', value: target.user.tag, inline: true },
        { name: 'Durasi', value: `${durasi} menit`, inline: true },
        { name: 'Alasan', value: alasan }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};