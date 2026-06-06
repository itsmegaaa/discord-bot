'use strict';

const { SlashCommandBuilder } = require('discord.js');
const { successEmbed } = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('deletemydata')
    .setDescription('Hapus seluruh datamu dari database bot secara permanen (irreversible)'),
    
  moduleId: 'privacy',

  async execute(interaction) {
    if (!interaction.client.db) {
      return interaction.reply({ content: '❌ Database belum terhubung.', ephemeral: true });
    }

    // Tanya konfirmasi atau langsung eksekusi (karena ini /slash command, kita eksekusi tapi kasih notifikasi tegas)
    await interaction.deferReply({ ephemeral: true });

    const db = interaction.client.db;
    const userId = interaction.user.id;

    try {
      let deletedCount = 0;

      // 1. Hapus warnings
      const warningsSnap = await db.collection('warnings').where('userId', '==', userId).get();
      const batch = db.batch();
      warningsSnap.forEach(doc => {
        batch.delete(doc.ref);
        deletedCount++;
      });
      await batch.commit();

      // 2. Karena structure members XP adalah /guilds/{guildId}/members/{userId}, kita tidak bisa gampang hapus semua
      // kecuali kita query per guild (kita iterasi guild yg bot join, jika ada).
      // Untuk operasi destruktif, jika bot scaling besar ini berat. Tapi untuk sekarang kita iterasi cache guild.
      const guilds = interaction.client.guilds.cache;
      for (const [guildId, guild] of guilds) {
        try {
          const memberRef = db.collection('guilds').doc(guildId).collection('members').doc(userId);
          const memberDoc = await memberRef.get();
          if (memberDoc.exists) {
            await memberRef.delete();
            deletedCount++;
          }
        } catch (e) {
          // ignore error per guild
        }
      }

      await interaction.editReply({ 
        embeds: [successEmbed('Data Dihapus Permanen', `Sebanyak ${deletedCount} record terkait akunmu (termasuk XP dan Warning) telah dihapus dari sistem bot tanpa jejak.`)] 
      });

    } catch (err) {
      console.error('deletemydata error:', err);
      await interaction.editReply({ content: '❌ Terjadi kesalahan saat menghapus datamu.' });
    }
  },
};
