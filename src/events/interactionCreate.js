'use strict';

const { isModuleEnabled } = require('../core/guildModuleSettings');
const { handleInteractionError } = require('../core/errors/interactionErrorHandler');
const { routeComponentInteraction } = require('../bot/componentRouter');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    try {
      // 1. Handle Component Interactions (Button, SelectMenu, Modal)
      if (interaction.isMessageComponent() || interaction.isModalSubmit()) {
        const handled = await routeComponentInteraction(interaction, client);
        if (!handled && !interaction.replied && !interaction.deferred) {
          // Fallback if no handler was found
          await interaction.reply({ content: '❌ Aksi ini tidak dikenali atau sudah kadaluarsa.', ephemeral: true });
        }
        return;
      }

      // 2. Handle Slash Commands
      if (!interaction.isChatInputCommand()) return;

      const command = client.commands.get(interaction.commandName);
      if (!command) {
        console.error(`Perintah ${interaction.commandName} tidak ditemukan.`);
        return;
      }

      // ── Guard: cek apakah modul command ini aktif untuk guild ini ──
      if (command.moduleId && command.moduleId !== 'core' && interaction.guildId && client.db) {
        const { registry } = require('../core/ModuleRegistry');
        const mod = registry.getById(command.moduleId);
        const defaultEnabled = mod ? mod.defaultEnabled !== false : true;
        const enabled = await isModuleEnabled(client.db, interaction.guildId, command.moduleId, defaultEnabled);

        if (!enabled) {
          return interaction.reply({
            content: `❌ Modul **${mod?.name ?? command.moduleId}** tidak aktif di server ini.\nAdmin dapat mengaktifkannya melalui dashboard.`,
            ephemeral: true,
          });
        }
      }

      // 3. Eksekusi Command
      await command.execute(interaction);

    } catch (error) {
      // Sentralisasi error handling
      await handleInteractionError(interaction, error);
    }
  },
};
