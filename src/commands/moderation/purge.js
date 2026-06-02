const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('purge')
    .setDescription('Hapus banyak pesan sekaligus')
    .addIntegerOption((o) =>
      o.setName('jumlah').setDescription('Jumlah pesan (1-100)').setRequired(true).setMinValue(1).setMaxValue(100)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    const jumlah = interaction.options.getInteger('jumlah');
    const deleted = await interaction.channel.bulkDelete(jumlah, true);

    const embed = new EmbedBuilder()
      .setColor('#57F287')
      .setDescription(`🗑️ **${deleted.size}** pesan berhasil dihapus.`);

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};