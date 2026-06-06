'use strict';

const { SlashCommandBuilder } = require('discord.js');
const { infoEmbed } = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mydata')
    .setDescription('Tampilkan ringkasan data pribadimu yang tersimpan di bot'),
    
  moduleId: 'privacy',

  async execute(interaction) {
    if (!interaction.client.db) {
      return interaction.reply({ content: '❌ Database belum terhubung.', ephemeral: true });
    }

    await interaction.deferReply({ ephemeral: true });

    const db = interaction.client.db;
    const userId = interaction.user.id;
    const guildId = interaction.guildId;

    let xpData = null;
    let warningsCount = 0;

    // Ambil data XP untuk guild ini
    if (guildId) {
      const xpDoc = await db.collection('guilds').doc(guildId)
                            .collection('members').doc(userId).get();
      if (xpDoc.exists) xpData = xpDoc.data();

      // Ambil data warning untuk guild ini
      const warningsSnap = await db.collection('warnings')
        .where('guildId', '==', guildId)
        .where('userId', '==', userId)
        .get();
      warningsCount = warningsSnap.size;
    }

    const embed = infoEmbed('Ringkasan Datamu', 'Ini adalah data ringkas terkait akunmu yang disimpan oleh bot di server ini.')
      .addFields(
        { name: 'Server', value: interaction.guild?.name || 'DM', inline: true },
        { name: 'XP/Level', value: xpData ? `Level: ${xpData.level || 0} | XP: ${xpData.xp || 0}` : 'Belum ada data', inline: true },
        { name: 'Warnings', value: `${warningsCount} catatan`, inline: true }
      )
      .setFooter({ text: 'Gunakan /exportmydata untuk mengambil semua raw data, atau /deletemydata untuk menghapusnya permanen.' });

    await interaction.editReply({ embeds: [embed] });
  },
};
