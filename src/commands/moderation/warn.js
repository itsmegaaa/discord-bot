const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

async function getWarnCount(db, guildId, userId) {
  const snapshot = await db
    .collection('warnLogs')
    .where('guildId', '==', guildId)
    .where('userId', '==', userId)
    .get();

  return snapshot.size;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Beri peringatan ke user')
    .addUserOption((o) =>
      o.setName('target').setDescription('User yang diberi warn').setRequired(true)
    )
    .addStringOption((o) =>
      o.setName('reason').setDescription('Alasan warn').setRequired(true).setMaxLength(1000)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    if (!interaction.client.db) {
      return interaction.reply({
        content: '❌ Firestore belum tersedia untuk menyimpan warn.',
        ephemeral: true,
      });
    }

    const target = interaction.options.getUser('target');
    const reason = interaction.options.getString('reason');
    const timestamp = interaction.client.dbAdmin
      ? interaction.client.dbAdmin.firestore.FieldValue.serverTimestamp()
      : new Date();

    await interaction.client.db.collection('warnLogs').add({
      guildId: interaction.guildId,
      userId: target.id,
      moderatorId: interaction.user.id,
      reason,
      timestamp,
    });

    const totalWarns = await getWarnCount(interaction.client.db, interaction.guildId, target.id);

    const embed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle('User Diberi Warn')
      .addFields(
        { name: 'User', value: `${target.tag}`, inline: true },
        { name: 'Moderator', value: `${interaction.user.tag}`, inline: true },
        { name: 'Total Warn', value: `${totalWarns}`, inline: true },
        { name: 'Alasan', value: reason }
      )
      .setTimestamp();

    return interaction.reply({ embeds: [embed] });
  },
};
