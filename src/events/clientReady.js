'use strict';

const { REST, Routes } = require('discord.js');
const { rescheduleActiveGiveaways } = require('../commands/utility/giveaway');
const { syncAllGuilds } = require('../utils/syncGuild');
const { getAllCommandsJson, startModuleJobs } = require('../core/ModuleLoader');
const { helpCommand } = require('../core/helpCommand');

module.exports = {
  name: 'clientReady',
  once: true,
  async execute(client) {
    console.log(`Bot online sebagai ${client.user.tag}`);

    // Slash commands registration dipindahkan ke skrip manual: src/bot/deployCommands.js
    // untuk mencegah rate limit akibat mendeploy command setiap bot merestart.

    // ── Sync guild cache ke Firestore ───────────────────────────────────────
    try {
      await syncAllGuilds(client);
    } catch (err) {
      console.error('Gagal sync guild:', err);
    }

    // ── Reschedule giveaway aktif yang mungkin terputus ─────────────────────
    try {
      await rescheduleActiveGiveaways(client);
    } catch (err) {
      console.error('Gagal re-schedule giveaway aktif:', err);
    }

    // ── Start semua job dari modul yang terdaftar ───────────────────────────
    const { registry } = require('../core/ModuleRegistry');
    startModuleJobs(client, registry);
  },
};
