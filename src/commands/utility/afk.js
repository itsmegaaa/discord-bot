const { SlashCommandBuilder } = require('discord.js');

function formatDuration(ms) {
  const minutes = Math.max(1, Math.floor(ms / 60000));
  if (minutes < 60) return `${minutes} menit`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours} jam ${rest} menit` : `${hours} jam`;
}

async function removeAfk(db, guildId, userId) {
  const docRef = db.collection('afkUsers').doc(`${guildId}_${userId}`);
  const snapshot = await docRef.get();
  if (!snapshot.exists) return null;

  await docRef.delete();
  return snapshot.data();
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('afk')
    .setDescription('Kelola status AFK')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('set')
        .setDescription('Set status AFK')
        .addStringOption((o) => o.setName('alasan').setDescription('Alasan AFK').setRequired(false).setMaxLength(200))
    )
    .addSubcommand((subcommand) =>
      subcommand.setName('remove').setDescription('Hapus status AFK')
    ),

  async execute(interaction) {
    if (!interaction.guildId || !interaction.client.db || !interaction.client.dbAdmin) {
      return interaction.reply({ content: 'AFK hanya bisa dipakai di server dengan Firestore aktif.', ephemeral: true });
    }

    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'remove') {
      const data = await removeAfk(interaction.client.db, interaction.guildId, interaction.user.id);
      if (!data) return interaction.reply({ content: 'Kamu sedang tidak AFK.', ephemeral: true });

      if (interaction.member?.manageable && data.originalNickname !== undefined) {
        await interaction.member.setNickname(data.originalNickname || null).catch(console.error);
      }

      const sinceMs = data.since?.toMillis?.() ?? Date.now();
      return interaction.reply({ content: `Status AFK dihapus. Kamu AFK selama ${formatDuration(Date.now() - sinceMs)}.`, ephemeral: true });
    }

    const reason = interaction.options.getString('alasan') ?? 'AFK';
    const member = interaction.member;
    const originalNickname = member?.nickname ?? null;

    await interaction.client.db.collection('afkUsers').doc(`${interaction.guildId}_${interaction.user.id}`).set({
      guildId: interaction.guildId,
      userId: interaction.user.id,
      reason,
      since: interaction.client.dbAdmin.firestore.FieldValue.serverTimestamp(),
      originalNickname,
    });

    if (member?.manageable && !member.displayName.startsWith('[AFK] ')) {
      await member.setNickname(`[AFK] ${member.displayName}`).catch(console.error);
    }

    return interaction.reply({ content: `Status AFK disimpan: **${reason}**`, ephemeral: true });
  },

  removeAfk,
  formatDuration,
};
