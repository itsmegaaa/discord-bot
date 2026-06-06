'use strict';

const { PermissionFlagsBits } = require('discord.js');
const { getModuleConfig } = require('../guildModuleSettings');

/**
 * Validasi internal bot permission (custom roles).
 * Digunakan untuk menggantikan pengecekan hardcoded Administrator.
 */

// User IDs of the bot owners
const BOT_OWNERS = new Set(['123456789012345678']); // Ganti dengan ID asli owner jika perlu

/**
 * Cek apakah user adalah owner bot (Developer)
 */
function isBotOwner(userId) {
  return BOT_OWNERS.has(userId);
}

/**
 * Cek apakah user adalah owner dari Guild
 */
function isGuildOwner(interaction) {
  return interaction.guild && interaction.guild.ownerId === interaction.user.id;
}

/**
 * Helper generik untuk mengecek apakah user memiliki role spesifik yang didefinisikan
 * dalam konfigurasi guild, atau memiliki Discord Administrator permission.
 */
async function hasInternalPermission(interaction, permissionType) {
  if (!interaction.guild) return false;
  if (isBotOwner(interaction.user.id)) return true;
  if (isGuildOwner(interaction)) return true;

  const member = interaction.member;
  if (!member) return false;

  // Jika Administrator Discord, otomatis lulus semua internal checks
  if (member.permissions.has(PermissionFlagsBits.Administrator)) {
    return true;
  }

  // Ambil config umum dari guild
  if (interaction.client.db) {
    const guildId = interaction.guild.id;
    try {
      const doc = await interaction.client.db.collection('guildConfigs').doc(guildId).get();
      if (doc.exists) {
        const data = doc.data();
        
        switch (permissionType) {
          case 'moderation.manage':
            // Harus memiliki adminRoleId
            if (data.adminRoleId && member.roles.cache.has(data.adminRoleId)) return true;
            break;
            
          case 'module.manage':
          case 'config.manage':
          case 'dashboard.admin':
            // Bisa pakai role dashboardAdminId kalau diimplementasikan nanti
            // Sementara fallback ke adminRoleId
            if (data.adminRoleId && member.roles.cache.has(data.adminRoleId)) return true;
            break;
            
          default:
            return false;
        }
      }
    } catch (err) {
      console.error(`Gagal mengecek permission ${permissionType}:`, err);
    }
  }

  return false;
}

/**
 * Middleware-style checker untuk ditaruh di command execute()
 * @param {import('discord.js').Interaction} interaction 
 * @param {string} permissionType 
 * @returns {Promise<boolean>}
 */
async function requirePermission(interaction, permissionType) {
  const hasPerm = await hasInternalPermission(interaction, permissionType);
  if (!hasPerm) {
    const { errorEmbed } = require('../../utils/embeds');
    const embed = errorEmbed('Akses Ditolak', `Kamu tidak memiliki izin internal \`${permissionType}\` untuk menggunakan fitur ini.`);
    
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ embeds: [embed], ephemeral: true });
    } else {
      await interaction.reply({ embeds: [embed], ephemeral: true });
    }
    return false; // Return false so command execution can be aborted
  }
  return true;
}

module.exports = {
  isBotOwner,
  isGuildOwner,
  hasInternalPermission,
  requirePermission,
};
