const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const {
  getHourlyDistribution,
  getMemberInsight,
  getServerSummary,
  getTopChannels,
  getTopMembers,
} = require('../../utils/analytics');

function addPeriodOption(subcommand) {
  return subcommand.addStringOption((o) =>
    o
      .setName('periode')
      .setDescription('Periode insight')
      .setRequired(false)
      .addChoices(
        { name: 'Today', value: 'today' },
        { name: 'Week', value: 'week' },
        { name: 'Month', value: 'month' },
        { name: 'All Time', value: 'alltime' }
      )
  );
}

async function username(client, userId) {
  try {
    const user = await client.users.fetch(userId);
    return user.username;
  } catch {
    return `<@${userId}>`;
  }
}

function hourTable(hours) {
  const max = Math.max(...hours.map((item) => item.messages), 1);
  return hours.map((item) => {
    const filled = Math.round((item.messages / max) * 10);
    const bar = '█'.repeat(filled) + '░'.repeat(10 - filled);
    return `${String(item.hour).padStart(2, '0')}:00 ${bar} ${item.messages} pesan`;
  }).join('\n');
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('insights')
    .setDescription('Lihat analytics server')
    .addSubcommand((subcommand) =>
      addPeriodOption(subcommand.setName('server').setDescription('Statistik keseluruhan server'))
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('member')
        .setDescription('Statistik individual member')
        .addUserOption((o) => o.setName('user').setDescription('User').setRequired(false))
    )
    .addSubcommand((subcommand) =>
      addPeriodOption(subcommand.setName('topmembers').setDescription('Top 10 member paling aktif'))
    )
    .addSubcommand((subcommand) => subcommand.setName('channels').setDescription('Channel paling ramai'))
    .addSubcommand((subcommand) => subcommand.setName('hours').setDescription('Jam tersibuk')),

  async execute(interaction) {
    if (!interaction.guildId || !interaction.client.db) {
      return interaction.reply({ content: 'Insights hanya bisa dipakai di server dengan Firestore aktif.', ephemeral: true });
    }

    const subcommand = interaction.options.getSubcommand();
    const period = interaction.options.getString('periode') ?? 'week';
    const db = interaction.client.db;

    if (subcommand === 'server') {
      const summary = await getServerSummary(db, interaction.guildId, period);
      const embed = new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle(`Server Insights (${period})`)
        .addFields(
          { name: 'Total pesan', value: `${summary.totalMessages} (${summary.messageChangePercent >= 0 ? '+' : ''}${summary.messageChangePercent}% vs periode sebelumnya)`, inline: false },
          { name: 'Member aktif', value: `${summary.activeMembers}`, inline: true },
          { name: 'Voice minutes', value: `${summary.totalVoiceMinutes}`, inline: true },
          { name: 'Jam tersibuk', value: `${String(summary.busiestHour.hour).padStart(2, '0')}:00 (${summary.busiestHour.messages} pesan)`, inline: false },
          { name: 'Channel paling ramai', value: summary.topChannel ? `<#${summary.topChannel.channelId}> (${summary.topChannel.messageCount} pesan)` : 'Belum ada data', inline: false }
        )
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    }

    if (subcommand === 'member') {
      const target = interaction.options.getUser('user') ?? interaction.user;
      const insight = await getMemberInsight(db, interaction.guildId, target.id, period);
      const embed = new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle(`Member Insights - ${target.username}`)
        .addFields(
          { name: 'Pesan', value: `Alltime: ${insight.allMessages}\nPeriode ini: ${insight.periodMessages}`, inline: true },
          { name: 'Voice', value: `Alltime: ${insight.allVoiceMinutes} menit\nPeriode ini: ${insight.periodVoiceMinutes} menit`, inline: true },
          { name: 'Level & XP', value: `Level ${insight.level} · ${insight.xp} XP`, inline: false },
          { name: 'Rata-rata pesan/hari', value: `${insight.averageMessagesPerDay}`, inline: true },
          { name: 'Hari paling aktif', value: insight.mostActiveDay, inline: true },
          { name: 'Pertama aktif', value: insight.firstActive, inline: true }
        )
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    }

    if (subcommand === 'topmembers') {
      const members = await getTopMembers(db, interaction.guildId, period, 10);
      const medals = ['🥇', '🥈', '🥉'];
      const lines = [];
      for (let i = 0; i < members.length; i += 1) {
        lines.push(`${medals[i] ?? `${i + 1}.`} #${i + 1} ${await username(interaction.client, members[i].userId)} — ${members[i].messageCount} pesan · ${members[i].voiceMinutes} menit voice`);
      }
      const embed = new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle(`Top Members (${period})`)
        .setDescription(lines.length ? lines.join('\n') : 'Belum ada data.')
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    }

    if (subcommand === 'channels') {
      const channels = await getTopChannels(db, interaction.guildId, 'week', 10);
      const embed = new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle('Channel Paling Ramai')
        .setDescription(channels.length
          ? channels.map((item, index) => `${index + 1}. <#${item.channelId}> — ${item.messageCount} pesan`).join('\n')
          : 'Belum ada data.')
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    }

    const hours = await getHourlyDistribution(db, interaction.guildId, 7);
    const embed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle('Jam Tersibuk (7 Hari)')
      .setDescription(`\`\`\`\n${hourTable(hours)}\n\`\`\``)
      .setTimestamp();

    return interaction.reply({ embeds: [embed] });
  },
};
