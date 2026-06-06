'use strict';

const { isModuleEnabled } = require('./guildModuleSettings');

/**
 * ModuleLoader — engine yang mengelola loading commands, events, dan jobs
 * berdasarkan modul yang terdaftar di registry.
 */

/**
 * Register semua commands dari semua modul ke client.commands.
 * Semua commands tetap didaftarkan ke Discord (agar slash menu tidak kosong),
 * tapi execution akan dicek per-guild di interactionCreate.
 *
 * @param {import('discord.js').Client} client
 * @param {import('./ModuleRegistry').ModuleRegistry} registry
 */
function registerAllCommands(client, registry) {
  for (const mod of registry.getAll()) {
    for (const command of (mod.commands ?? [])) {
      if (command.data && command.execute) {
        client.commands.set(command.data.name, {
          ...command,
          moduleId: mod.id, // tandai command ini milik modul apa
        });
      }
    }
  }
  console.log(`ModuleLoader: ${client.commands.size} commands dimuat dari ${registry.getAll().length} modul`);
}

/**
 * Ambil semua commands sebagai JSON untuk didaftarkan ke Discord REST.
 * @param {import('./ModuleRegistry').ModuleRegistry} registry
 * @returns {object[]}
 */
function getAllCommandsJson(registry) {
  const commands = [];
  for (const mod of registry.getAll()) {
    for (const command of (mod.commands ?? [])) {
      if (command.data) {
        commands.push(command.data.toJSON());
      }
    }
  }
  return commands;
}

/**
 * Attach semua event listeners dari semua modul ke client.
 * Event dari modul yang di-disable per guild akan di-skip di dalam handler-nya masing-masing
 * menggunakan guard isModuleEnabled().
 *
 * @param {import('discord.js').Client} client
 * @param {import('./ModuleRegistry').ModuleRegistry} registry
 */
function attachModuleEvents(client, registry) {
  for (const mod of registry.getAll()) {
    for (const event of (mod.events ?? [])) {
      const handler = async (...args) => {
        // Cek apakah modul aktif untuk guild terkait (jika ada)
        if (client.db) {
          const guildId = extractGuildId(...args);
          if (guildId) {
            const enabled = await isModuleEnabled(client.db, guildId, mod.id, mod.defaultEnabled !== false);
            if (!enabled) return;
          }
        }
        await event.execute(...args, client);
      };

      if (event.once) {
        client.once(event.name, handler);
      } else {
        client.on(event.name, handler);
      }
    }
  }
}

/**
 * Start semua cron jobs dari semua modul.
 * Jobs yang di-disable per guild harus di-handle di dalam job itu sendiri.
 * @param {import('discord.js').Client} client
 * @param {import('./ModuleRegistry').ModuleRegistry} registry
 */
function startModuleJobs(client, registry) {
  for (const mod of registry.getAll()) {
    for (const job of (mod.jobs ?? [])) {
      try {
        job.start(client);
      } catch (err) {
        console.error(`ModuleLoader: gagal start job dari modul '${mod.id}':`, err);
      }
    }
  }
}

/**
 * Coba extract guildId dari berbagai tipe argument event discord.js.
 * @param {...any} args
 * @returns {string|null}
 */
function extractGuildId(...args) {
  for (const arg of args) {
    if (!arg || typeof arg !== 'object') continue;
    // Message, GuildMember, VoiceState, BaseGuildChannel, Role, etc.
    if (typeof arg.guildId === 'string') return arg.guildId;
    if (arg.guild?.id) return arg.guild.id;
    // oldState/newState di voiceStateUpdate
    if (arg.guild) return arg.guild.id;
  }
  return null;
}

module.exports = {
  registerAllCommands,
  getAllCommandsJson,
  attachModuleEvents,
  startModuleJobs,
};
