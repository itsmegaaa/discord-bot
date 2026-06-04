const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setbio')
    .setDescription('Atur bio profile')
    .addStringOption((o) =>
      o.setName('teks').setDescription('Bio maksimal 100 karakter').setRequired(true).setMaxLength(100)
    ),

  async execute(interaction) {
    if (!interaction.guildId || !interaction.client.db || !interaction.client.dbAdmin) {
      return interaction.reply({ content: 'Setbio hanya bisa dipakai di server dengan Firestore aktif.', ephemeral: true });
    }

    const profileBio = interaction.options.getString('teks');
    await interaction.client.db.collection('userProfiles').doc(`${interaction.guildId}_${interaction.user.id}`).set({
      guildId: interaction.guildId,
      userId: interaction.user.id,
      profileBio,
      updatedAt: interaction.client.dbAdmin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    return interaction.reply({ content: 'Bio profile kamu sudah disimpan.', ephemeral: true });
  },
};
