const { EmbedBuilder } = require('discord.js');
const { formatDuration } = require('../commands/utility/afk');
const { getGuildCustomCommands, normalizeTrigger } = require('../commands/utility/cc');
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

async function clearAfkStatus(message, client) {
  const docRef = client.db.collection('afkUsers').doc(`${message.guild.id}_${message.author.id}`);
  const snapshot = await docRef.get();
  if (!snapshot.exists) return;

  const data = snapshot.data();
  await docRef.delete();

  if (message.member?.manageable && data.originalNickname !== undefined) {
    await message.member.setNickname(data.originalNickname || null).catch(console.error);
  }

  const sinceMs = data.since?.toMillis?.() ?? Date.now();
  await message.reply(`Welcome back, ${message.author}! Kamu AFK selama ${formatDuration(Date.now() - sinceMs)}.`).catch(console.error);
}

async function notifyMentionedAfkUsers(message, client) {
  if (!message.mentions.members?.size) return;

  for (const member of message.mentions.members.values()) {
    if (member.id === message.author.id) continue;

    const snapshot = await client.db.collection('afkUsers').doc(`${message.guild.id}_${member.id}`).get();
    if (!snapshot.exists) continue;

    const data = snapshot.data();
    const sinceMs = data.since?.toMillis?.() ?? Date.now();
    await message.reply(`⚠️ ${member.user.tag} sedang AFK: ${data.reason ?? 'AFK'} (sejak ${formatDuration(Date.now() - sinceMs)} lalu)`).catch(console.error);
  }
}

async function runCustomCommand(message, client) {
  const content = message.content.trim();
  if (!content.startsWith('!')) return;

  const trigger = normalizeTrigger(content.slice(1));
  if (!trigger) return;

  const commands = await getGuildCustomCommands(client.db, message.guild.id);
  const command = commands.get(trigger);
  if (command?.response) await message.channel.send(command.response).catch(console.error);
}

module.exports = {
  name: 'messageCreate',
  async execute(message, client) {
    if (!message.guild || message.author.bot) return;
    if (!client.db || !client.dbAdmin) return;

    await clearAfkStatus(message, client);
    await notifyMentionedAfkUsers(message, client);
    await runCustomCommand(message, client);

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
