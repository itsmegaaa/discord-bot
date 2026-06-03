const { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');

const DEFAULT_AUTOMOD_CONFIG = {
  enabled: false,
  badWordsEnabled: false,
  badWords: [],
  antiSpamEnabled: false,
  antiSpamThreshold: 5,
  antiLinkEnabled: false,
  allowedDomains: [],
  antiMassMentionEnabled: false,
  massMentionThreshold: 5,
  autoTimeoutEnabled: false,
  autoTimeoutThreshold: 3,
  autoTimeoutDuration: 10,
  bypassRoles: [],
};

async function getAutomodConfig(db, guildId) {
  const doc = await db.collection('automodConfigs').doc(guildId).get();
  return {
    guildId,
    ...DEFAULT_AUTOMOD_CONFIG,
    ...(doc.exists ? doc.data() : {}),
  };
}

async function updateAutomodConfig(db, guildId, data) {
  await db.collection('automodConfigs').doc(guildId).set({
    guildId,
    ...data,
  }, { merge: true });
}

function normalizeWord(word) {
  return word.trim().toLowerCase();
}

function normalizeDomain(domain) {
  return domain
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .split('/')[0];
}

function settingsEmbed(config) {
  return new EmbedBuilder()
    .setColor('#5865F2')
    .setTitle('Auto Mod Settings')
    .addFields(
      { name: 'Enabled', value: `${config.enabled}`, inline: true },
      { name: 'Bad Words', value: `${config.badWordsEnabled} (${config.badWords.length})`, inline: true },
      { name: 'Anti Link', value: `${config.antiLinkEnabled}`, inline: true },
      { name: 'Anti Spam', value: `${config.antiSpamEnabled} (${config.antiSpamThreshold}/5s)`, inline: true },
      { name: 'Anti Mass Mention', value: `${config.antiMassMentionEnabled} (${config.massMentionThreshold})`, inline: true },
      { name: 'Auto Timeout', value: `${config.autoTimeoutEnabled} (${config.autoTimeoutThreshold} warn)`, inline: true },
      { name: 'Allowed Domains', value: config.allowedDomains.length ? config.allowedDomains.join(', ') : 'Kosong' }
    )
    .setTimestamp();
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('automod')
    .setDescription('Kelola auto moderation')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand((subcommand) => subcommand.setName('enable').setDescription('Aktifkan auto mod'))
    .addSubcommand((subcommand) => subcommand.setName('disable').setDescription('Nonaktifkan auto mod'))
    .addSubcommandGroup((group) =>
      group
        .setName('badwords')
        .setDescription('Kelola bad words')
        .addSubcommand((subcommand) =>
          subcommand
            .setName('add')
            .setDescription('Tambah bad word')
            .addStringOption((o) => o.setName('kata').setDescription('Kata').setRequired(true).setMaxLength(100))
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName('remove')
            .setDescription('Hapus bad word')
            .addStringOption((o) => o.setName('kata').setDescription('Kata').setRequired(true).setMaxLength(100))
        )
        .addSubcommand((subcommand) => subcommand.setName('list').setDescription('Lihat bad words'))
    )
    .addSubcommandGroup((group) =>
      group
        .setName('allowdomain')
        .setDescription('Kelola allowed domains')
        .addSubcommand((subcommand) =>
          subcommand
            .setName('add')
            .setDescription('Tambah domain whitelist')
            .addStringOption((o) => o.setName('domain').setDescription('Domain').setRequired(true).setMaxLength(100))
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName('remove')
            .setDescription('Hapus domain whitelist')
            .addStringOption((o) => o.setName('domain').setDescription('Domain').setRequired(true).setMaxLength(100))
        )
    )
    .addSubcommand((subcommand) => subcommand.setName('settings').setDescription('Lihat settings auto mod')),

  async execute(interaction) {
    if (!interaction.guildId || !interaction.client.db) {
      return interaction.reply({ content: 'Auto mod hanya bisa dipakai di server dengan Firestore aktif.', ephemeral: true });
    }

    const db = interaction.client.db;
    const group = interaction.options.getSubcommandGroup(false);
    const subcommand = interaction.options.getSubcommand();
    const config = await getAutomodConfig(db, interaction.guildId);

    if (!group && subcommand === 'enable') {
      await updateAutomodConfig(db, interaction.guildId, { enabled: true });
      await interaction.client.db.collection('guildConfigs').doc(interaction.guildId).set({ automodEnabled: true }, { merge: true });
      return interaction.reply({ content: 'Auto mod diaktifkan.', ephemeral: true });
    }

    if (!group && subcommand === 'disable') {
      await updateAutomodConfig(db, interaction.guildId, { enabled: false });
      await interaction.client.db.collection('guildConfigs').doc(interaction.guildId).set({ automodEnabled: false }, { merge: true });
      return interaction.reply({ content: 'Auto mod dinonaktifkan.', ephemeral: true });
    }

    if (!group && subcommand === 'settings') {
      return interaction.reply({ embeds: [settingsEmbed(config)], ephemeral: true });
    }

    if (group === 'badwords') {
      if (subcommand === 'list') {
        return interaction.reply({
          content: config.badWords.length ? config.badWords.join(', ') : 'Bad words masih kosong.',
          ephemeral: true,
        });
      }

      const word = normalizeWord(interaction.options.getString('kata'));
      const badWords = new Set(config.badWords.map(normalizeWord));
      if (subcommand === 'add') badWords.add(word);
      if (subcommand === 'remove') badWords.delete(word);

      await updateAutomodConfig(db, interaction.guildId, {
        badWords: [...badWords],
        badWordsEnabled: badWords.size > 0,
      });

      return interaction.reply({ content: `Bad words diperbarui (${badWords.size} kata).`, ephemeral: true });
    }

    if (group === 'allowdomain') {
      const domain = normalizeDomain(interaction.options.getString('domain'));
      const allowedDomains = new Set(config.allowedDomains.map(normalizeDomain));
      if (subcommand === 'add') allowedDomains.add(domain);
      if (subcommand === 'remove') allowedDomains.delete(domain);

      await updateAutomodConfig(db, interaction.guildId, {
        allowedDomains: [...allowedDomains],
      });

      return interaction.reply({ content: `Allowed domains diperbarui (${allowedDomains.size} domain).`, ephemeral: true });
    }

    return interaction.reply({ content: 'Subcommand tidak dikenal.', ephemeral: true });
  },

  DEFAULT_AUTOMOD_CONFIG,
  getAutomodConfig,
};
