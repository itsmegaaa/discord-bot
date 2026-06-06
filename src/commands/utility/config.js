'use strict';

const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const { requirePermission } = require('../../core/permissions/permissionChecker');
const { successEmbed, errorEmbed } = require('../../utils/embeds');
const https = require('https');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('config')
    .setDescription('Kelola konfigurasi guild (export/import)')
    .addSubcommand((sub) =>
      sub
        .setName('export')
        .setDescription('Export semua konfigurasi dan setting modul server ke file JSON')
    )
    .addSubcommand((sub) =>
      sub
        .setName('import')
        .setDescription('Import konfigurasi server dari file JSON')
        .addAttachmentOption((o) =>
          o.setName('file').setDescription('File JSON hasil export sebelumnya').setRequired(true)
        )
    ),

  moduleId: 'utility', // or maybe 'analytics' or just generic

  async execute(interaction) {
    // Hanya bot owner, guild owner, atau yang punya config.manage / adminRoleId
    if (!(await requirePermission(interaction, 'config.manage'))) return;

    if (!interaction.client.db) {
      return interaction.reply({ content: '❌ Database belum terhubung.', ephemeral: true });
    }

    const sub = interaction.options.getSubcommand();
    const guildId = interaction.guildId;
    const db = interaction.client.db;

    if (sub === 'export') {
      await interaction.deferReply({ ephemeral: true });

      try {
        const guildConfigDoc = await db.collection('guildConfigs').doc(guildId).get();
        const modulesDoc = await db.collection('guildModules').doc(guildId).get();

        const exportData = {
          version: '1.0.0',
          guildId: guildId,
          exportedAt: new Date().toISOString(),
          guildConfig: guildConfigDoc.data() || {},
          guildModules: modulesDoc.data() || {},
        };

        const buffer = Buffer.from(JSON.stringify(exportData, null, 2), 'utf-8');
        const attachment = new AttachmentBuilder(buffer, { name: `config_${guildId}.json` });

        const embed = successEmbed('Config Diexport', 'Gunakan file ini untuk backup. Hati-hati, file ini bisa berisi ID channel penting.');

        return interaction.editReply({ embeds: [embed], files: [attachment] });
      } catch (err) {
        console.error('Config export error:', err);
        return interaction.editReply({ embeds: [errorEmbed('Gagal Export', 'Terjadi kesalahan saat mengambil data.')] });
      }
    }

    if (sub === 'import') {
      await interaction.deferReply({ ephemeral: true });

      const attachment = interaction.options.getAttachment('file');
      if (!attachment.name.endsWith('.json')) {
        return interaction.editReply({ embeds: [errorEmbed('Format Salah', 'File harus berupa JSON.')] });
      }

      // Download the JSON file
      https.get(attachment.url, (res) => {
        let rawData = '';
        res.on('data', (chunk) => { rawData += chunk; });
        res.on('end', async () => {
          try {
            const parsedData = JSON.parse(rawData);

            // Validasi data
            if (!parsedData.guildConfig && !parsedData.guildModules) {
              return interaction.editReply({ embeds: [errorEmbed('Format Data Salah', 'File JSON tidak dikenali sebagai config bot.')] });
            }

            // Restore guildConfigs
            if (parsedData.guildConfig) {
              await db.collection('guildConfigs').doc(guildId).set(
                { ...parsedData.guildConfig, guildId: guildId }, // Pastikan guildId tetap guild saat ini
                { merge: true }
              );
            }

            // Restore guildModules
            if (parsedData.guildModules) {
              await db.collection('guildModules').doc(guildId).set(
                { ...parsedData.guildModules, guildId: guildId },
                { merge: true }
              );
            }

            return interaction.editReply({ embeds: [successEmbed('Config Diimpor', 'Data konfigurasi server telah berhasil direstore.')] });

          } catch (e) {
            console.error('Config import parse error:', e);
            return interaction.editReply({ embeds: [errorEmbed('Gagal Membaca File', 'File JSON mungkin corrupt.')] });
          }
        });
      }).on('error', (e) => {
        console.error('Config import download error:', e);
        return interaction.editReply({ embeds: [errorEmbed('Gagal Mendownload', 'Tidak bisa mengambil file attachment.')] });
      });
    }
  },
};
