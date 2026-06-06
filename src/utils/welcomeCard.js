const { createCanvas, loadImage } = require('canvas');

/** Batas maksimal karakter username yang ditampilkan di welcome card. */
const MAX_USERNAME_LENGTH = 18;

/**
 * Buat welcome card sebagai PNG buffer untuk member yang baru bergabung.
 * @param {import('discord.js').GuildMember} member
 * @returns {Promise<Buffer>}
 */
async function createWelcomeCard(member) {
  const canvas = createCanvas(800, 250);
  const ctx = canvas.getContext('2d');

  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, 800, 0);
  gradient.addColorStop(0, '#1a1a2e');
  gradient.addColorStop(1, '#16213e');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 800, 250);

  // Decorative border
  ctx.strokeStyle = '#5865F2';
  ctx.lineWidth = 3;
  ctx.strokeRect(10, 10, 780, 230);

  // Avatar circle
  ctx.save();
  ctx.beginPath();
  ctx.arc(125, 125, 80, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  const avatar = await loadImage(
    member.user.displayAvatarURL({ extension: 'jpg', size: 256 })
  );
  ctx.drawImage(avatar, 45, 45, 160, 160);
  ctx.restore();

  // Avatar border ring
  ctx.beginPath();
  ctx.arc(125, 125, 82, 0, Math.PI * 2);
  ctx.strokeStyle = '#5865F2';
  ctx.lineWidth = 4;
  ctx.stroke();

  // "SELAMAT DATANG" label
  ctx.font = 'bold 18px Arial';
  ctx.fillStyle = '#5865F2';
  ctx.fillText('SELAMAT DATANG', 250, 85);

  // Username (dipotong jika terlalu panjang)
  ctx.font = 'bold 36px Arial';
  ctx.fillStyle = '#FFFFFF';
  const username = member.user.displayName;
  const displayName = username.length > MAX_USERNAME_LENGTH
    ? `${username.substring(0, MAX_USERNAME_LENGTH)}...`
    : username;
  ctx.fillText(displayName, 250, 135);

  // Server name + member count
  ctx.font = '18px Arial';
  ctx.fillStyle = '#B9BBBE';
  ctx.fillText(
    `Member ke-${member.guild.memberCount} di ${member.guild.name}`,
    250,
    175
  );

  return canvas.toBuffer('image/png');
}

module.exports = { createWelcomeCard };
