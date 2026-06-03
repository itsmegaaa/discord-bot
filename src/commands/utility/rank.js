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
  if (level >= 30) return '#FEE75C';
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

async function createRankCard(user, data, rank) {
  const xp = data.xp ?? 0;
  const level = data.level ?? xpToLevel(xp);
  const currentLevelXp = levelToXp(level);
  const nextLevelXp = levelToXp(level + 1);
  const progress = clamp((xp - currentLevelXp) / (nextLevelXp - currentLevelXp), 0, 1);
  const accent = levelColor(level);

  const canvas = createCanvas(800, 200);
  const ctx = canvas.getContext('2d');

  const gradient = ctx.createLinearGradient(0, 0, 800, 0);
  gradient.addColorStop(0, '#1a1a2e');
  gradient.addColorStop(1, '#16213e');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 800, 200);

  ctx.strokeStyle = '#5865F2';
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
  ctx.strokeStyle = accent;
  ctx.lineWidth = 5;
  ctx.stroke();

  ctx.font = 'bold 28px Arial';
  ctx.fillStyle = '#FFFFFF';
  const username = user.displayName.length > 22
    ? `${user.displayName.substring(0, 22)}...`
    : user.displayName;
  ctx.fillText(username, 200, 70);

  ctx.font = '18px Arial';
  ctx.fillStyle = accent;
  ctx.fillText(`Level ${level}`, 200, 100);

  ctx.fillStyle = '#2B2D31';
  roundRect(ctx, 200, 120, 400, 20, 10);
  ctx.fill();

  ctx.fillStyle = '#5865F2';
  roundRect(ctx, 200, 120, 400 * progress, 20, 10);
  ctx.fill();

  ctx.font = '16px Arial';
  ctx.fillStyle = '#B9BBBE';
  ctx.fillText(`${Math.floor(xp).toLocaleString()} / ${Math.floor(nextLevelXp).toLocaleString()} XP`, 200, 160);

  ctx.font = 'bold 20px Arial';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(`Rank #${rank}`, 650, 45);

  return canvas.toBuffer('image/png');
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rank')
    .setDescription('Lihat rank dan progress level')
    .addUserOption((o) =>
      o.setName('user').setDescription('User yang ingin dilihat rank-nya').setRequired(false)
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
    const cardBuffer = await createRankCard(target, data, rank);
    const attachment = new AttachmentBuilder(cardBuffer, {
      name: 'rank.png',
    });

    return interaction.reply({ files: [attachment] });
  },
};
