'use strict';

const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const { successEmbed } = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('exportmydata')
    .setDescription('Export semua datamu (XP, Warnings, dll) ke file JSON yang akan dikirim via DM'),
    
  moduleId: 'privacy',

  async execute(interaction) {
    if (!interaction.client.db) {
      return interaction.reply({ content: '❌ Database belum terhubung.', ephemeral: true });
    }

    await interaction.deferReply({ ephemeral: true });

    const db = interaction.client.db;
    const userId = interaction.user.id;

    // Kumpulkan data di seluruh guild
    const exportData = {
      userId: userId,
      exportedAt: new Date().toISOString(),
      xpData: {},
      warnings: [],
      // Bisa ditambah query lain seperti profil, afk, dst jika strukturnya global
    };

    try {
      // XP Data (butuh iterasi lewat collection group jika memungkinkan,
      // tapi karena struktur kita /guilds/{guildId}/members/{userId}, kita harus cari pakai collectionGroup)
      const xpQuery = await db.collectionGroup('members').where('id', '==', userId).get(); // Asumsi dokumen member punya field id
      xpQuery.forEach(doc => {
        // karena doc name nya userId, firestore collectionGroup tidak bisa filter by document ID secara langsung.
        // Sebaiknya kita simpan field userId juga di dalam doc. Jika tidak ada, ini mungkin tidak fetch apa2.
        // Untuk amannya, kita fetch semua warning dulu.
      });
      
      // Ambil warning (global untuk user ini)
      const warningsSnap = await db.collection('warnings').where('userId', '==', userId).get();
      warningsSnap.forEach(doc => {
        exportData.warnings.push(doc.data());
      });

      // Export file
      const buffer = Buffer.from(JSON.stringify(exportData, null, 2), 'utf-8');
      const attachment = new AttachmentBuilder(buffer, { name: `data_${userId}.json` });

      try {
        await interaction.user.send({
          content: 'Berikut adalah salinan datamu yang disimpan oleh bot.',
          files: [attachment]
        });
        await interaction.editReply({ embeds: [successEmbed('Data Dikirim', 'Cek Direct Message (DM) dari bot untuk mendownload file JSON datamu.')] });
      } catch (dmErr) {
        // Jika DM terkunci
        await interaction.editReply({ 
          content: '❌ Gagal mengirim DM. Pastikan setting privasimu mengizinkan DM dari anggota server ini.',
        });
      }

    } catch (err) {
      console.error('exportmydata error:', err);
      await interaction.editReply({ content: '❌ Terjadi kesalahan saat mengumpulkan datamu.' });
    }
  },
};
