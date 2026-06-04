const { AttachmentBuilder, PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
const { createCanvas, loadImage } = require('canvas');
const { getRank, levelColor } = require('./rank');

function isBirthdayToday(birthday) {
  if (!birthday) return false;
  const now = new Date();
  return birthday.day === now.getDate() && birthday.month === now.getMonth() + 1;
}

function formatDate(date) {
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

async function countWarns(db, guildId, userId) {
  const snapshot = await db
    .collection('warnLogs')
    .where('guildId', '==', guildId)
    .where('userId', '==', userId)
    .get();
  return snapshot.size;
}

async function getProfileData(interaction, target) {
  const db = interaction.client.db;
  const guildId = interaction.guildId;
  const member = await interaction.guild.members.fetch(target.id);

  const [
    levelSnapshot,
    warnCount,
    birthdaySnapshot,
    profileSnapshot,
    rank,
  ] = await Promise.all([
    db.collection('userLevels').doc(`${guildId}_${target.id}`).get(),
    countWarns(db, guildId, target.id),
    db.collection('birthdays').doc(`${guildId}_${target.id}`).get(),
    db.collection('userProfiles').doc(`${guildId}_${target.id}`).get(),
    getRank(db, guildId, target.id),
  ]);

  return {
    member,
    level: levelSnapshot.exists ? levelSnapshot.data() : {},
    warnCount,
    birthday: birthdaySnapshot.exists ? birthdaySnapshot.data() : null,
    profile: profileSnapshot.exists ? profileSnapshot.data() : {},
    rank,
  };
}

function badges(data) {
  const result = [];
  const joinedAt = data.member.joinedAt ?? new Date();
  const memberAgeMs = Date.now() - joinedAt.getTime();
  const permissions = data.member.permissions;
  const totalMessages = data.level.totalMessages ?? 0;
  const voiceMinutes = data.level.voiceMinutes ?? 0;

  if (memberAgeMs > 365 * 24 * 60 * 60 * 1000) result.push('🎮 Veteran');
  if (data.rank <= 3) result.push('⭐ Top Member');
  if (isBirthdayToday(data.birthday)) result.push('🎂 Ulang Tahun');
  if (permissions.has(PermissionFlagsBits.ManageMessages)) result.push('🛡️ Moderator');
  if (permissions.has(PermissionFlagsBits.Administrator)) result.push('👑 Admin');
  if (totalMessages > 1000) result.push('💬 Chatter');
  if (voiceMinutes > 1000) result.push('🎙️ Voice Master');
  if (data.level.lastLevelUpAt?.toMillis && Date.now() - data.level.lastLevelUpAt.toMillis() < 24 * 60 * 60 * 1000) {
    result.push('⚡ Level Up');
  }

  return result;
}

async function createProfileCard(user, data) {
  const canvas = createCanvas(800, 400);
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createLinearGradient(0, 0, 800, 0);
  gradient.addColorStop(0, '#1a1a2e');
  gradient.addColorStop(1, '#16213e');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 800, 400);

  ctx.strokeStyle = '#5865F2';
  ctx.lineWidth = 3;
  ctx.strokeRect(10, 10, 780, 380);

  const avatar = await loadImage(user.displayAvatarURL({ extension: 'jpg', size: 256 }));
  ctx.save();
  ctx.beginPath();
  ctx.arc(95, 95, 60, 0, Math.PI * 2);
  ctx.clip();
  ctx.drawImage(avatar, 35, 35, 120, 120);
  ctx.restore();

  const level = data.level.level ?? 0;
  ctx.beginPath();
  ctx.arc(95, 95, 62, 0, Math.PI * 2);
  ctx.strokeStyle = levelColor(level);
  ctx.lineWidth = 5;
  ctx.stroke();

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 32px Arial';
  ctx.fillText(user.displayName.substring(0, 24), 190, 65);

  ctx.font = '18px Arial';
  ctx.fillStyle = '#B9BBBE';
  ctx.fillText(`Joined: ${data.member.joinedAt ? formatDate(data.member.joinedAt) : 'Tidak tersedia'}`, 190, 100);
  ctx.fillText(`Level ${level} · ${(data.level.xp ?? 0).toLocaleString()} XP`, 190, 130);
  ctx.fillText(`Bio: ${(data.profile.profileBio ?? 'Belum ada bio').substring(0, 100)}`, 190, 160);

  ctx.strokeStyle = '#5865F2';
  ctx.beginPath();
  ctx.moveTo(40, 190);
  ctx.lineTo(760, 190);
  ctx.stroke();

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 22px Arial';
  ctx.fillText(`📨 ${(data.level.totalMessages ?? 0).toLocaleString()} Pesan`, 70, 235);
  ctx.fillText(`🎙️ ${(data.level.voiceMinutes ?? 0).toLocaleString()} Menit Voice`, 390, 235);
  ctx.fillText(`⚠️ ${data.warnCount} Warn`, 70, 285);
  ctx.fillText(`🏆 Rank #${data.rank} di Server`, 390, 285);

  ctx.beginPath();
  ctx.moveTo(40, 315);
  ctx.lineTo(760, 315);
  ctx.stroke();

  const badgeText = badges(data).join('  ') || 'Belum ada badge';
  ctx.font = '20px Arial';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(badgeText.substring(0, 80), 70, 355);

  return canvas.toBuffer('image/png');
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('profile')
    .setDescription('Lihat profile card')
    .addUserOption((o) => o.setName('user').setDescription('User').setRequired(false)),

  async execute(interaction) {
    if (!interaction.guildId || !interaction.client.db) {
      return interaction.reply({ content: 'Profile hanya bisa dipakai di server dengan Firestore aktif.', ephemeral: true });
    }

    const target = interaction.options.getUser('user') ?? interaction.user;
    const data = await getProfileData(interaction, target);
    const buffer = await createProfileCard(target, data);
    const attachment = new AttachmentBuilder(buffer, { name: 'profile.png' });

    return interaction.reply({ files: [attachment] });
  },

  createProfileCard,
};
