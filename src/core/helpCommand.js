'use strict';

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { listModulesForGuild } = require('./guildModuleSettings');

/**
 * Auto-generated /help command yang membaca metadata modul aktif per guild.
 */
const helpCommand = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Tampilkan semua modul dan command yang aktif di server ini')
    .addStringOption((o) =>
      o.setName('modul')
        .setDescription('Nama modul yang ingin dilihat detailnya')
        .setRequired(false)
    ),

  moduleId: 'core', // command inti, selalu aktif

  async execute(interaction) {
    const client = interaction.client;
    const guildId = interaction.guildId;
    const moduleName = interaction.options.getString('modul');

    await interaction.deferReply({ ephemeral: true });

    // Lazy import registry untuk hindari circular dependency
    const { registry } = require('./ModuleRegistry');

    if (moduleName) {
      // Detail satu modul
      const mod = registry.getAll().find(
        (m) => m.id.toLowerCase() === moduleName.toLowerCase() ||
               m.name.toLowerCase() === moduleName.toLowerCase()
      );

      if (!mod) {
        return interaction.editReply({ content: `❌ Modul **${moduleName}** tidak ditemukan.` });
      }

      const enabled = client.db
        ? await isModuleEnabledFor(client.db, guildId, mod)
        : mod.defaultEnabled !== false;

      const commandList = (mod.commands ?? [])
        .map((cmd) => `• \`/${cmd.data.name}\` — ${cmd.data.description}`)
        .join('\n') || '_Tidak ada slash command_';

      const embed = new EmbedBuilder()
        .setColor(enabled ? '#57F287' : '#ED4245')
        .setTitle(`📦 Modul: ${mod.name}`)
        .setDescription(mod.description || '_Tidak ada deskripsi_')
        .addFields(
          { name: 'Status', value: enabled ? '✅ Aktif' : '❌ Nonaktif', inline: true },
          { name: 'Commands', value: commandList }
        )
        .setTimestamp();

      return interaction.editReply({ embeds: [embed] });
    }

    // Daftar semua modul
    let moduleList;
    if (client.db) {
      moduleList = await listModulesForGuild(client.db, guildId, registry);
    } else {
      moduleList = registry.getAll().map((mod) => ({
        ...mod,
        enabled: mod.defaultEnabled !== false,
      }));
    }

    const enabled = moduleList.filter((m) => m.enabled);
    const disabled = moduleList.filter((m) => !m.enabled);

    const formatModule = (m) => {
      const cmdCount = (m.commands ?? []).length;
      return `**${m.name}** — ${m.description ?? ''}` +
        (cmdCount ? ` _(${cmdCount} cmd)_` : '');
    };

    const embed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle('📚 Bantuan Bot')
      .setDescription('Gunakan `/help modul:<nama>` untuk detail command tiap modul.')
      .setTimestamp();

    if (enabled.length) {
      embed.addFields({
        name: '✅ Modul Aktif',
        value: enabled.map(formatModule).join('\n'),
      });
    }

    if (disabled.length) {
      embed.addFields({
        name: '❌ Modul Nonaktif',
        value: disabled.map((m) => `~~${m.name}~~`).join(', '),
      });
    }

    embed.setFooter({ text: 'Admin dapat enable/disable modul melalui dashboard.' });
    return interaction.editReply({ embeds: [embed] });
  },
};

/**
 * Helper agar tidak circular import
 */
async function isModuleEnabledFor(db, guildId, mod) {
  const { isModuleEnabled } = require('./guildModuleSettings');
  return isModuleEnabled(db, guildId, mod.id, mod.defaultEnabled !== false);
}

module.exports = { helpCommand };
