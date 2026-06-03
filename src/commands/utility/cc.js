const { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');

const customCommandCache = new Map();

function normalizeTrigger(trigger) {
  return trigger.trim().toLowerCase().replace(/^!+/, '');
}

function invalidateGuildCache(guildId) {
  customCommandCache.delete(guildId);
}

async function getGuildCustomCommands(db, guildId) {
  const cached = customCommandCache.get(guildId);
  if (cached) return cached;

  const snapshot = await db.collection('customCommands').where('guildId', '==', guildId).get();
  const commands = new Map();
  snapshot.docs.forEach((doc) => {
    const data = doc.data();
    commands.set(normalizeTrigger(data.trigger), data);
  });
  customCommandCache.set(guildId, commands);
  return commands;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('cc')
    .setDescription('Kelola custom command')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand((subcommand) =>
      subcommand
        .setName('add')
        .setDescription('Tambah custom command')
        .addStringOption((o) => o.setName('trigger').setDescription('Trigger tanpa prefix, contoh: rules').setRequired(true).setMaxLength(50))
        .addStringOption((o) => o.setName('response').setDescription('Respons bot').setRequired(true).setMaxLength(1500))
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('remove')
        .setDescription('Hapus custom command')
        .addStringOption((o) => o.setName('trigger').setDescription('Trigger').setRequired(true).setMaxLength(50))
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('edit')
        .setDescription('Edit custom command')
        .addStringOption((o) => o.setName('trigger').setDescription('Trigger').setRequired(true).setMaxLength(50))
        .addStringOption((o) => o.setName('response').setDescription('Respons baru').setRequired(true).setMaxLength(1500))
    )
    .addSubcommand((subcommand) => subcommand.setName('list').setDescription('Lihat custom command server')),

  async execute(interaction) {
    if (!interaction.guildId || !interaction.client.db || !interaction.client.dbAdmin) {
      return interaction.reply({ content: 'Custom command hanya bisa dipakai di server dengan Firestore aktif.', ephemeral: true });
    }

    const subcommand = interaction.options.getSubcommand();
    const trigger = interaction.options.getString('trigger');
    const normalized = trigger ? normalizeTrigger(trigger) : null;
    const collection = interaction.client.db.collection('customCommands');

    if (subcommand === 'add' || subcommand === 'edit') {
      const response = interaction.options.getString('response');
      const docRef = collection.doc(`${interaction.guildId}_${normalized}`);
      const now = interaction.client.dbAdmin.firestore.FieldValue.serverTimestamp();
      const existing = await docRef.get();

      await docRef.set({
        guildId: interaction.guildId,
        trigger: normalized,
        response,
        createdBy: existing.exists ? existing.data().createdBy : interaction.user.id,
        createdAt: existing.exists ? existing.data().createdAt : now,
        updatedAt: now,
      }, { merge: true });

      invalidateGuildCache(interaction.guildId);
      return interaction.reply({ content: `Custom command **!${normalized}** sudah disimpan.`, ephemeral: true });
    }

    if (subcommand === 'remove') {
      await collection.doc(`${interaction.guildId}_${normalized}`).delete();
      invalidateGuildCache(interaction.guildId);
      return interaction.reply({ content: `Custom command **!${normalized}** sudah dihapus.`, ephemeral: true });
    }

    const commands = await getGuildCustomCommands(interaction.client.db, interaction.guildId);
    const embed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle('Custom Commands')
      .setDescription(commands.size
        ? [...commands.keys()].sort().map((item) => `• !${item}`).join('\n')
        : 'Belum ada custom command.')
      .setTimestamp();

    return interaction.reply({ embeds: [embed], ephemeral: true });
  },

  getGuildCustomCommands,
  normalizeTrigger,
  invalidateGuildCache,
};
