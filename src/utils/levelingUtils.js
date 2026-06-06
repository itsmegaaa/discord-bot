const { EmbedBuilder } = require('discord.js');

/**
 * Default config untuk fitur leveling guild.
 * Dipakai sebagai fallback jika guild belum punya konfigurasi.
 */
const DEFAULT_LEVELING_CONFIG = {
  levelingEnabled: true,
  xpPerMessage: 15,
  xpCooldownSeconds: 60,
  levelUpChannelId: null,
  levelRoles: [],
  voiceXpEnabled: true,
  voiceXpPerMinute: 5,
};

/**
 * Hitung level berdasarkan total XP.
 * Formula: level = floor(0.1 * sqrt(xp))
 * @param {number} xp
 * @returns {number}
 */
function xpToLevel(xp) {
  return Math.floor(0.1 * Math.sqrt(xp));
}

/**
 * Ambil channel untuk pengumuman level up.
 * Jika config.levelUpChannelId diset, fetch channel tersebut;
 * jika tidak, gunakan fallbackChannel.
 * @param {import('discord.js').Guild} guild
 * @param {import('discord.js').TextBasedChannel|null} fallbackChannel
 * @param {{levelUpChannelId?: string|null}} config
 * @returns {Promise<import('discord.js').TextBasedChannel|null>}
 */
async function resolveLevelUpChannel(guild, fallbackChannel, config) {
  if (!config.levelUpChannelId) return fallbackChannel ?? guild.systemChannel;

  try {
    return await guild.channels.fetch(config.levelUpChannelId);
  } catch (err) {
    console.error('Gagal mengambil channel level up:', err);
    return fallbackChannel ?? guild.systemChannel;
  }
}

/**
 * Kirim pesan level up ke channel yang sesuai.
 * Menerima Message (dari messageCreate) atau GuildMember (dari voiceStateUpdate).
 * @param {import('discord.js').Message|import('discord.js').GuildMember} context
 * @param {{levelUpChannelId?: string|null}} config
 * @param {number} newLevel
 */
async function sendLevelUpMessage(context, config, newLevel) {
  const guild = context.guild;
  // context bisa berupa Message (punya .author & .channel) atau GuildMember (punya .user)
  const userId = context.author?.id ?? context.user?.id ?? context.id;
  const fallback = context.channel ?? null;

  const channel = await resolveLevelUpChannel(guild, fallback, config);
  if (!channel?.send) return;

  const embed = new EmbedBuilder()
    .setColor('#57F287')
    .setTitle('Level Up!')
    .setDescription(`<@${userId}> naik ke **Level ${newLevel}**!`)
    .setTimestamp();

  await channel.send({ embeds: [embed] });
}

/**
 * Assign role rewards kepada member yang baru saja level up.
 * Hanya role yang berada di rentang (oldLevel, newLevel] yang di-assign.
 * @param {import('discord.js').GuildMember} member
 * @param {Array<{level: number, roleId: string}>} levelRoles
 * @param {number} oldLevel
 * @param {number} newLevel
 */
async function assignLevelRoles(member, levelRoles, oldLevel, newLevel) {
  const rewards = Array.isArray(levelRoles)
    ? levelRoles.filter((reward) => reward.level > oldLevel && reward.level <= newLevel)
    : [];

  for (const reward of rewards) {
    const role = member.guild.roles.cache.get(reward.roleId);
    if (role) await member.roles.add(role).catch(console.error);
  }
}

module.exports = {
  DEFAULT_LEVELING_CONFIG,
  assignLevelRoles,
  sendLevelUpMessage,
  xpToLevel,
};
