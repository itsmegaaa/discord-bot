const { EmbedBuilder } = require('discord.js');
const { logActivity } = require('../utils/activityLogger');

const DEFAULT_CONFIG = {
  levelingEnabled: true,
  xpPerMessage: 15,
  xpCooldownSeconds: 60,
  levelUpChannelId: null,
  levelRoles: [],
};

function xpToLevel(xp) {
  return Math.floor(0.1 * Math.sqrt(xp));
}

async function getGuildConfig(guildId, client) {
  if (!client.db) return DEFAULT_CONFIG;

  try {
    const doc = await client.db.collection('guildConfigs').doc(guildId).get();
    return {
      ...DEFAULT_CONFIG,
      ...(doc.exists ? doc.data() : {}),
    };
  } catch (err) {
    console.error('Gagal membaca guild config leveling:', err);
    return DEFAULT_CONFIG;
  }
}

async function resolveLevelUpChannel(guild, fallbackChannel, config) {
  if (!config.levelUpChannelId) return fallbackChannel;

  try {
    return await guild.channels.fetch(config.levelUpChannelId);
  } catch (err) {
    console.error('Gagal mengambil channel level up:', err);
    return fallbackChannel;
  }
}

async function assignLevelRoles(member, levelRoles, oldLevel, newLevel) {
  const rewards = Array.isArray(levelRoles)
    ? levelRoles.filter((reward) => reward.level > oldLevel && reward.level <= newLevel)
    : [];

  for (const reward of rewards) {
    const role = member.guild.roles.cache.get(reward.roleId);
    if (role) await member.roles.add(role).catch(console.error);
  }
}

async function sendLevelUpMessage(message, config, newLevel) {
  const channel = await resolveLevelUpChannel(message.guild, message.channel, config);
  if (!channel?.send) return;

  const embed = new EmbedBuilder()
    .setColor('#57F287')
    .setTitle('Level Up!')
    .setDescription(`${message.author} naik ke **Level ${newLevel}**!`)
    .setTimestamp();

  await channel.send({ embeds: [embed] });
}

module.exports = {
  name: 'messageCreate',
  async execute(message, client) {
    if (!message.guild || message.author.bot || !client.db || !client.dbAdmin) return;

    const config = await getGuildConfig(message.guild.id, client);
    if (!config.levelingEnabled) return;

    const docId = `${message.guild.id}_${message.author.id}`;
    const userRef = client.db.collection('userLevels').doc(docId);
    const now = Date.now();
    const timestamp = client.dbAdmin.firestore.Timestamp.fromMillis(now);
    const serverTimestamp = client.dbAdmin.firestore.FieldValue.serverTimestamp();

    const result = await client.db.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(userRef);
      const data = snapshot.exists ? snapshot.data() : {};
      const lastMessageAt = data.lastMessageAt?.toMillis?.() ?? 0;
      const cooldownMs = config.xpCooldownSeconds * 1000;

      if (lastMessageAt && now - lastMessageAt < cooldownMs) {
        return null;
      }

      const oldXp = data.xp ?? 0;
      const oldLevel = data.level ?? xpToLevel(oldXp);
      const newXp = oldXp + config.xpPerMessage;
      const newLevel = xpToLevel(newXp);

      transaction.set(userRef, {
        guildId: message.guild.id,
        userId: message.author.id,
        xp: newXp,
        level: newLevel,
        totalMessages: (data.totalMessages ?? 0) + 1,
        voiceMinutes: data.voiceMinutes ?? 0,
        lastMessageAt: timestamp,
        weeklyXp: (data.weeklyXp ?? 0) + config.xpPerMessage,
        weeklyReset: data.weeklyReset ?? serverTimestamp,
      }, { merge: true });

      return {
        oldLevel,
        newLevel,
        leveledUp: newLevel > oldLevel,
      };
    });

    if (!result) return;

    await logActivity(client.db, client.dbAdmin, message.guild.id, message.author.id, {
      messages: 1,
    });

    if (result.leveledUp) {
      await assignLevelRoles(message.member, config.levelRoles, result.oldLevel, result.newLevel);
      await sendLevelUpMessage(message, config, result.newLevel);
    }
  },
};
