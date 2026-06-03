const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const MEDALS = ['🥇', '🥈', '🥉'];

async function getUsername(client, userId) {
  try {
    const user = await client.users.fetch(userId);
    return user.username;
  } catch {
    return `<@${userId}>`;
  }
}

function formatNumber(value) {
  return Math.floor(value ?? 0).toLocaleString();
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Lihat leaderboard XP server')
    .addStringOption((o) =>
      o
        .setName('periode')
        .setDescription('Periode leaderboard')
        .setRequired(false)
        .addChoices(
          { name: 'All Time', value: 'all' },
          { name: 'Weekly', value: 'weekly' }
        )
    ),

  async execute(interaction) {
    if (!interaction.guildId) {
      return interaction.reply({
        content: 'Command ini hanya bisa dipakai di server.',
        ephemeral: true,
      });
    }

    if (!interaction.client.db) {
      return interaction.reply({
        content: 'Firestore belum tersedia untuk membaca leaderboard.',
        ephemeral: true,
      });
    }

    const periode = interaction.options.getString('periode') ?? 'all';
    const field = periode === 'weekly' ? 'weeklyXp' : 'xp';
    const snapshot = await interaction.client.db
      .collection('userLevels')
      .where('guildId', '==', interaction.guildId)
      .orderBy(field, 'desc')
      .limit(10)
      .get();

    const lines = [];
    for (let i = 0; i < snapshot.docs.length; i += 1) {
      const data = snapshot.docs[i].data();
      const username = await getUsername(interaction.client, data.userId);
      const prefix = MEDALS[i] ?? `${i + 1}.`;
      const xp = formatNumber(data[field]);
      lines.push(`${prefix} #${i + 1} ${username} - Level ${data.level ?? 0} - ${xp} XP`);
    }

    const embed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle(periode === 'weekly' ? 'Leaderboard Weekly XP' : 'Leaderboard XP')
      .setDescription(lines.length ? lines.join('\n') : 'Belum ada data XP.')
      .setTimestamp();

    if (periode === 'weekly') {
      embed.setFooter({ text: 'Reset tiap Senin 00:00 WIB' });
    }

    return interaction.reply({ embeds: [embed] });
  },
};
