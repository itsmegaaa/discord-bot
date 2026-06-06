'use strict';

/**
 * Modul: Leveling
 * Fitur: XP dari pesan dan voice, level up, role rewards, rank card, leaderboard
 */
module.exports = {
  id: 'leveling',
  name: 'Leveling',
  description: 'Sistem XP dari pesan dan voice, level up, role rewards.',
  defaultEnabled: true,
  version: '1.0.0',
  dashboardSupport: true,
  permissions: [],
  defaultConfig: {
    xpPerMessage: 15,
    xpCooldownSeconds: 60,
    voiceXpEnabled: true,
    voiceXpPerMinute: 5,
    levelUpChannelId: null,
    levelRoles: [],
  },

  commands: [
    require('../../commands/utility/rank'),
    require('../../commands/utility/leaderboard'),
  ],

  // Event messageCreate dan voiceStateUpdate sudah dihandle di events/ lama.
  // Modul ini hanya mendaftarkan commands agar bisa di-enable/disable.
  // Guard isModuleEnabled ada di interactionCreate.js.
  events: [],
  jobs: [],
};

