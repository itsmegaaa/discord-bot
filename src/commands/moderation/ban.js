const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban seorang member')
    .addUserOption((o) =>
      o.setName('target').setDescription('Member yang di-ban').setRequired(true)
    )
    .addStringOption((o) =>
      o.setName('alasan').setDescription('Alasan ban').setRequired(false)
    )
    .addIntegerOption((o) =>
      o.setName('hapus_pesan').setDescription('Hapus pesan X hari (0-7)').setMinValue(0).setMaxValue(7)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  async execute(interaction) {
    const target = interaction.options.getMember('target');
    const alasan = interaction.options.getString('alasan') ?? 'Tidak ada alasan';
    const hapusPesan = interaction.options.getInteger('hapus_pesan') ?? 0;

    if (!target) return interaction.reply({ content: '❌ Member tidak ditemukan.', ephemeral: true });
    if (!target.bannable) return interaction.reply({ content: '❌ Aku tidak bisa ban member ini.', ephemeral: true });

    await target.ban({ deleteMessageSeconds: hapusPesan * 86400, reason: alasan });

    const embed = new EmbedBuilder()
      .setColor('#ED4245')
      .setTitle('🔨 Member Di-ban')
      .addFields(
        { name: 'Member', value: `${target.user.tag}`, inline: true },
        { name: 'Moderator', value: `${interaction.user.tag}`, inline: true },
        { name: 'Alasan', value: alasan }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
