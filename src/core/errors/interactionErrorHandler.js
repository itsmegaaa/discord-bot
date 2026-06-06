'use strict';

const { errorEmbed } = require('../../utils/embeds');

/**
 * Handle errors gracefully from interaction commands to prevent bot crash.
 * Translates errors to user-friendly messages while keeping technical logs internal.
 * 
 * @param {import('discord.js').Interaction} interaction 
 * @param {Error} error 
 */
async function handleInteractionError(interaction, error) {
  // 1. Log internal error (dengan trace lengkap)
  console.error(`[Interaction Error] Command: ${interaction.commandName || 'Unknown Component'} | User: ${interaction.user.tag}`);
  console.error(error);

  // 2. Siapkan response ramah pengguna
  let message = 'Terjadi kesalahan sistem saat memproses permintaanmu. Silakan coba lagi nanti.';
  
  // Jika error memang dilempar dari kode kita untuk validasi (Custom Error message)
  if (error.name === 'ValidationError') {
    message = error.message;
  }

  const embed = errorEmbed('Error Sistem', message);

  // 3. Reply ke user
  try {
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ embeds: [embed], ephemeral: true });
    } else {
      await interaction.reply({ embeds: [embed], ephemeral: true });
    }
  } catch (replyError) {
    // Jika bahkan reply gagal (misal: interaction timeout), log saja
    console.error(`[Interaction Error] Gagal membalas user dengan error embed:`, replyError);
  }
}

module.exports = {
  handleInteractionError,
};
