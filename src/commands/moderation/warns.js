const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

function toDate(value) {
  if (!value) return null;
  if (typeof value.toDate === 'function') return value.toDate();
  if (value instanceof Date) return value;
  return null;
}

function formatDate(value) {
  const date = toDate(value);
  if (!date) return 'Tanggal tidak tersedia';

  return `<t:${Math.floor(date.getTime() / 1000)}:f>`;
}

function compareWarns(a, b) {
  const dateA = toDate(a.timestamp)?.getTime() ?? 0;
  const dateB = toDate(b.timestamp)?.getTime() ?? 0;
  return dateA - dateB;
}

function buildEmbeds(target, warns) {
  const chunks = [];
  let current = '';

  warns.forEach((warn, index) => {
    const item = [
      `**${index + 1}.** ${warn.reason}`,
      `Moderator: <@${warn.moderatorId}>`,
      `Tanggal: ${formatDate(warn.timestamp)}`,
    ].join('\n');
    const next = current ? `${current}\n\n${item}` : item;

    if (next.length > 3900) {
      chunks.push(current);
      current = item;
    } else {
      current = next;
    }
  });

  if (current) chunks.push(current);

  return chunks.slice(0, 10).map((description, index) =>
    new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle(index === 0 ? `Daftar Warn ${target.tag}` : `Daftar Warn ${target.tag} (${index + 1})`)
      .setDescription(description)
      .setTimestamp()
  );
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warns')
    .setDescription('Lihat daftar warn user')
    .addUserOption((o) =>
      o.setName('target').setDescription('User yang dilihat warn-nya').setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    if (!interaction.client.db) {
      return interaction.reply({
        content: '❌ Firestore belum tersedia untuk membaca warn.',
        ephemeral: true,
      });
    }

    const target = interaction.options.getUser('target');
    const snapshot = await interaction.client.db
      .collection('warnLogs')
      .where('guildId', '==', interaction.guildId)
      .where('userId', '==', target.id)
      .get();

    if (snapshot.empty) {
      const embed = new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle(`Daftar Warn ${target.tag}`)
        .setDescription('User ini belum memiliki warn.')
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    }

    const warns = snapshot.docs
      .map((doc) => doc.data())
      .sort(compareWarns);
    const embeds = buildEmbeds(target, warns);

    return interaction.reply({ embeds });
  },
};
