const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const { createCanvas, loadImage } = require('canvas');

function xpToLevel(xp) {
  return Math.floor(0.1 * Math.sqrt(xp));
}

function levelToXp(level) {
  return Math.pow(level / 0.1, 2);
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function levelColor(level) {
  if (level >= 30) return '#F1C40F';
  if (level >= 20) return '#9B59B6';
  if (level >= 10) return '#5865F2';
  return '#57F287';
}

function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

async function getRank(db, guildId, userId) {
  const snapshot = await db
    .collection('userLevels')
    .where('guildId', '==', guildId)
    .orderBy('xp', 'desc')
    .get();

  const index = snapshot.docs.findIndex((doc) => doc.data().userId === userId);
  return index === -1 ? snapshot.size + 1 : index + 1;
}

function styleTokens(style, level) {
  const accent = levelColor(level);
  if (style === 'minimal') {
    return {
      background: '#F5F6F8',
      border: '#D7DCE3',
      text: '#1F2328',
      muted: '#586069',
      barBg: '#D7DCE3',
      bar: accent,
      accent,
    };
  }

  if (style === 'dark') {
    return {
      background: '#050505',
      border: accent,
      text: '#FFFFFF',
      muted: '#B9BBBE',
      barBg: '#1F1F1F',
      bar: accent,
      accent,
    };
  }

  return {
    background: null,
    border: '#5865F2',
    text: '#FFFFFF',
    muted: '#B9BBBE',
    barBg: '#2B2D31',
    bar: '#5865F2',
    accent,
  };
}

async function createRankCard(user, data, rank, style = 'default') {
  const xp = data.xp ?? 0;
  const level = data.level ?? xpToLevel(xp);
  const currentLevelXp = levelToXp(level);
  const nextLevelXp = levelToXp(level + 1);
  const progress = clamp((xp - currentLevelXp) / (nextLevelXp - currentLevelXp), 0, 1);
  const tokens = styleTokens(style, level);

  const canvas = createCanvas(800, 200);
  const ctx = canvas.getContext('2d');

  if (style === 'default') {
    const gradient = ctx.createLinearGradient(0, 0, 800, 0);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(1, '#16213e');
    ctx.fillStyle = gradient;
  } else {
    ctx.fillStyle = tokens.background;
  }
  ctx.fillRect(0, 0, 800, 200);

  ctx.strokeStyle = tokens.border;
  ctx.lineWidth = 3;
  ctx.strokeRect(10, 10, 780, 180);

  const avatar = await loadImage(user.displayAvatarURL({ extension: 'jpg', size: 256 }));

  ctx.save();
  ctx.beginPath();
  ctx.arc(100, 100, 70, 0, Math.PI * 2);
  ctx.clip();
  ctx.drawImage(avatar, 30, 30, 140, 140);
  ctx.restore();

  ctx.beginPath();
  ctx.arc(100, 100, 72, 0, Math.PI * 2);
  ctx.strokeStyle = tokens.accent;
  ctx.lineWidth = 5;
  ctx.stroke();

  ctx.font = 'bold 28px Arial';
  ctx.fillStyle = tokens.text;
  const username = user.displayName.length > 22
    ? `${user.displayName.substring(0, 22)}...`
    : user.displayName;
  ctx.fillText(username, 200, 70);

  ctx.font = '18px Arial';
  ctx.fillStyle = tokens.accent;
  ctx.fillText(`Level ${level}`, 200, 100);

  ctx.fillStyle = tokens.barBg;
  roundRect(ctx, 200, 120, 400, 20, 10);
  ctx.fill();

  ctx.fillStyle = tokens.bar;
  roundRect(ctx, 200, 120, 400 * progress, 20, 10);
  ctx.fill();

  ctx.font = '16px Arial';
  ctx.fillStyle = tokens.muted;
  ctx.fillText(`${Math.floor(xp).toLocaleString()} / ${Math.floor(nextLevelXp).toLocaleString()} XP`, 200, 160);

  ctx.font = 'bold 20px Arial';
  ctx.fillStyle = tokens.text;
  ctx.fillText(`Rank #${rank}`, 650, 45);

  return canvas.toBuffer('image/png');
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rank')
    .setDescription('Lihat rank dan progress level')
    .addUserOption((o) =>
      o.setName('user').setDescription('User yang ingin dilihat rank-nya').setRequired(false)
    )
    .addStringOption((o) =>
      o
        .setName('style')
        .setDescription('Style rank card')
        .setRequired(false)
        .addChoices(
          { name: 'Default', value: 'default' },
          { name: 'Minimal', value: 'minimal' },
          { name: 'Dark', value: 'dark' }
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
        content: 'Firestore belum tersedia untuk membaca rank.',
        ephemeral: true,
      });
    }

    const target = interaction.options.getUser('user') ?? interaction.user;
    const style = interaction.options.getString('style') ?? 'default';
    const docId = `${interaction.guildId}_${target.id}`;
    const snapshot = await interaction.client.db.collection('userLevels').doc(docId).get();
    const data = snapshot.exists ? snapshot.data() : {
      guildId: interaction.guildId,
      userId: target.id,
      xp: 0,
      level: 0,
      totalMessages: 0,
      voiceMinutes: 0,
      weeklyXp: 0,
    };
    const rank = await getRank(interaction.client.db, interaction.guildId, target.id);
    const cardBuffer = await createRankCard(target, data, rank, style);
    const attachment = new AttachmentBuilder(cardBuffer, {
      name: 'rank.png',
    });

    return interaction.reply({ files: [attachment] });
  },

  createRankCard,
  getRank,
  levelColor,
};
