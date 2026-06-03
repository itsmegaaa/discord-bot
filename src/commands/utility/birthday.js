const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');

function isValidDate(day, month) {
  const date = new Date(Date.UTC(2024, month - 1, day));
  return date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('birthday')
    .setDescription('Kelola tanggal ulang tahun')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('set')
        .setDescription('Simpan ulang tahun kamu')
        .addIntegerOption((o) => o.setName('hari').setDescription('Hari lahir').setRequired(true).setMinValue(1).setMaxValue(31))
        .addIntegerOption((o) => o.setName('bulan').setDescription('Bulan lahir').setRequired(true).setMinValue(1).setMaxValue(12))
    )
    .addSubcommand((subcommand) => subcommand.setName('remove').setDescription('Hapus ulang tahun kamu'))
    .addSubcommand((subcommand) =>
      subcommand
        .setName('check')
        .setDescription('Cek ulang tahun user')
        .addUserOption((o) => o.setName('user').setDescription('User yang dicek').setRequired(false))
    )
    .addSubcommand((subcommand) => subcommand.setName('list').setDescription('Lihat daftar ulang tahun server')),

  async execute(interaction) {
    if (!interaction.guildId || !interaction.client.db) {
      return interaction.reply({ content: 'Birthday hanya bisa dipakai di server dengan Firestore aktif.', ephemeral: true });
    }

    const subcommand = interaction.options.getSubcommand();
    const collection = interaction.client.db.collection('birthdays');

    if (subcommand === 'set') {
      const day = interaction.options.getInteger('hari');
      const month = interaction.options.getInteger('bulan');
      if (!isValidDate(day, month)) return interaction.reply({ content: 'Tanggal ulang tahun tidak valid.', ephemeral: true });

      await collection.doc(`${interaction.guildId}_${interaction.user.id}`).set({
        guildId: interaction.guildId,
        userId: interaction.user.id,
        day,
        month,
      });

      return interaction.reply({ content: `Ulang tahun kamu disimpan: **${day}/${month}**.`, ephemeral: true });
    }

    if (subcommand === 'remove') {
      await collection.doc(`${interaction.guildId}_${interaction.user.id}`).delete();
      return interaction.reply({ content: 'Ulang tahun kamu sudah dihapus.', ephemeral: true });
    }

    if (subcommand === 'check') {
      const user = interaction.options.getUser('user') ?? interaction.user;
      const snapshot = await collection.doc(`${interaction.guildId}_${user.id}`).get();
      if (!snapshot.exists) return interaction.reply({ content: `${user} belum menyimpan ulang tahun.`, ephemeral: true });

      const data = snapshot.data();
      return interaction.reply({ content: `Ulang tahun ${user}: **${data.day}/${data.month}**.`, ephemeral: true });
    }

    const snapshot = await collection.where('guildId', '==', interaction.guildId).get();
    const birthdays = snapshot.docs
      .map((doc) => doc.data())
      .sort((a, b) => (a.month - b.month) || (a.day - b.day))
      .slice(0, 25);

    const embed = new EmbedBuilder()
      .setColor('#FF6B9D')
      .setTitle('Daftar Ulang Tahun')
      .setDescription(birthdays.length
        ? birthdays.map((item) => `• <@${item.userId}> - **${item.day}/${item.month}**`).join('\n')
        : 'Belum ada data ulang tahun.')
      .setTimestamp();

    return interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
