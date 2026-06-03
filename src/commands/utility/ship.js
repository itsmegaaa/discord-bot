const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');

function seededPercent(idA, idB) {
  const seed = [idA, idB].sort().join(':');
  let hash = 0;

  for (let i = 0; i < seed.length; i += 1) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash |= 0;
  }

  return Math.abs(hash) % 101;
}

function heartBar(percent) {
  const filled = Math.round(percent / 10);
  return '❤️'.repeat(filled) + '🤍'.repeat(10 - filled);
}

function comment(percent) {
  if (percent <= 20) return 'Kayaknya ga cocok 😬';
  if (percent <= 50) return 'Lumayan...';
  if (percent <= 80) return 'Ada chemistry nih! 👀';
  return 'Jodoh banget! 💕';
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ship')
    .setDescription('Hitung kecocokan dua user')
    .addUserOption((o) => o.setName('user1').setDescription('User pertama').setRequired(true))
    .addUserOption((o) => o.setName('user2').setDescription('User kedua').setRequired(true)),

  async execute(interaction) {
    const user1 = interaction.options.getUser('user1');
    const user2 = interaction.options.getUser('user2');
    const percent = seededPercent(user1.id, user2.id);

    const embed = new EmbedBuilder()
      .setColor('#EB459E')
      .setTitle('Ship Calculator')
      .setDescription([
        `${user1} x ${user2}`,
        '',
        `**${percent}%**`,
        heartBar(percent),
        comment(percent),
      ].join('\n'))
      .setTimestamp();

    return interaction.reply({ embeds: [embed] });
  },
};
