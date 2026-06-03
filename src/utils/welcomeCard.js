const { createCanvas, loadImage } = require('canvas');

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

  // "SELAMAT DATANG" text
  ctx.font = 'bold 18px Arial';
  ctx.fillStyle = '#5865F2';
  ctx.fillText('SELAMAT DATANG', 250, 85);

  // Username
  ctx.font = 'bold 36px Arial';
  ctx.fillStyle = '#FFFFFF';
  const username = member.user.displayName;
  ctx.fillText(
    username.length > 18 ? username.substring(0, 18) + '...' : username,
    250,
    135
  );

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
