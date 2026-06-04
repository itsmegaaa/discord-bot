const { EmbedBuilder } = require('discord.js');
const { DEFAULT_AUTOMOD_CONFIG } = require('../commands/moderation/automod');
const { formatDuration } = require('../commands/utility/afk');
const { getGuildCustomCommands, normalizeTrigger } = require('../commands/utility/cc');
const { logActivity } = require('../utils/activityLogger');
const { IP_LOGGER_DOMAINS } = require('../utils/ipLoggerDomains');
const { sendLog } = require('../utils/logger');

const spamTracker = new Map();
const SPAM_CLEANUP_INTERVAL_MS = 10 * 60 * 1000;
const SPAM_RETENTION_MS = 10000;

const spamCleanupInterval = setInterval(() => {
  const cutoff = Date.now() - SPAM_RETENTION_MS;
  for (const [key, timestamps] of spamTracker.entries()) {
    const recent = timestamps.filter((timestamp) => timestamp >= cutoff);
    if (recent.length) {
      spamTracker.set(key, recent);
    } else {
      spamTracker.delete(key);
    }
  }
}, SPAM_CLEANUP_INTERVAL_MS);

if (typeof spamCleanupInterval.unref === 'function') spamCleanupInterval.unref();

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

  const withoutPrefix = content.slice(1).trim();
  if (!withoutPrefix) return;

  const [rawTrigger, ...args] = withoutPrefix.split(/\s+/);
  const argsText = args.join(' ');
  const trigger = normalizeTrigger(rawTrigger);
  if (!trigger) return;
  if (!/^[a-z0-9_-]+$/i.test(trigger)) return;

  const commands = await getGuildCustomCommands(client.db, message.guild.id);
  const command = commands.get(trigger);
  if (!command?.response) return;

  const response = String(command.response)
    .replaceAll('{user}', `${message.author}`)
    .replaceAll('{username}', message.author.username)
    .replaceAll('{server}', message.guild.name)
    .replaceAll('{channel}', `${message.channel}`)
    .replaceAll('{args}', argsText);

  await message.channel.send(response).catch(console.error);
}

function extractDomains(content) {
  const urlMatches = content.match(/(?:https?:\/\/|discord\.gg\/)[^\s<>)]+/gi) ?? [];

  return urlMatches.map((raw) => {
    try {
      if (raw.toLowerCase().startsWith('discord.gg/')) return 'discord.gg';
      return new URL(raw).hostname.toLowerCase().replace(/^www\./, '');
    } catch {
      return raw.toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
    }
  });
}

function memberHasBypass(member, config) {
  if (!member) return false;
  if (member.permissions.has('ManageMessages')) return true;
  const bypassRoles = Array.isArray(config.bypassRoles) ? config.bypassRoles : [];
  return bypassRoles.some((roleId) => member.roles.cache.has(roleId));
}

async function getAutomodConfig(message, client) {
  const guildConfig = await getGuildConfig(message.guild.id, client);
  if (!guildConfig.automodEnabled) return null;

  const doc = await client.db.collection('automodConfigs').doc(message.guild.id).get();
  const automodConfig = {
    guildId: message.guild.id,
    ...DEFAULT_AUTOMOD_CONFIG,
    ...(doc.exists ? doc.data() : {}),
  };

  return automodConfig.enabled ? automodConfig : null;
}

function trackSpam(message, threshold) {
  const key = `${message.guild.id}_${message.author.id}`;
  const now = Date.now();
  const timestamps = (spamTracker.get(key) ?? []).filter((timestamp) => now - timestamp <= 5000);
  timestamps.push(now);
  spamTracker.set(key, timestamps);

  return timestamps.length > threshold;
}

function detectAutomodViolation(message, config) {
  const content = message.content.toLowerCase();

  if (config.badWordsEnabled) {
    const badWord = (config.badWords ?? []).find((word) => word && content.includes(word.toLowerCase()));
    if (badWord) return `Bad word terdeteksi: ${badWord}`;
  }

  if (config.antiLinkEnabled) {
    const domains = extractDomains(message.content);
    const allowedDomains = (config.allowedDomains ?? []).map((domain) => domain.toLowerCase().replace(/^www\./, ''));
    const blockedDomain = domains.find((domain) => !allowedDomains.some((allowed) => domain === allowed || domain.endsWith(`.${allowed}`)));
    if (blockedDomain) return `Link tidak diizinkan: ${blockedDomain}`;
  }

  if (config.antiMassMentionEnabled && message.mentions.users.size > config.massMentionThreshold) {
    return `Mass mention melebihi batas (${message.mentions.users.size}/${config.massMentionThreshold})`;
  }

  if (config.antiSpamEnabled && trackSpam(message, config.antiSpamThreshold)) {
    return `Spam terdeteksi (${config.antiSpamThreshold}+ pesan dalam 5 detik)`;
  }

  return null;
}

async function getWarnCount(db, guildId, userId) {
  const snapshot = await db
    .collection('warnLogs')
    .where('guildId', '==', guildId)
    .where('userId', '==', userId)
    .get();

  return snapshot.size;
}

async function autoWarn(message, client, reason) {
  await client.db.collection('warnLogs').add({
    guildId: message.guild.id,
    userId: message.author.id,
    moderatorId: client.user.id,
    reason,
    timestamp: client.dbAdmin.firestore.FieldValue.serverTimestamp(),
  });

  return getWarnCount(client.db, message.guild.id, message.author.id);
}

async function logSecurityAction(message, client, title, reason, color = '#ED4245') {
  const embed = new EmbedBuilder()
    .setColor(color)
    .setTitle(title)
    .addFields(
      { name: 'User', value: `${message.author} (${message.author.tag})`, inline: false },
      { name: 'Channel', value: `${message.channel}`, inline: true },
      { name: 'Detail aksi', value: reason, inline: false }
    )
    .setTimestamp();

  await sendLog(client, message.guild.id, embed);
}

async function handleIpLoggerProtection(message, client) {
  const domains = extractDomains(message.content);
  const matchedDomain = domains.find((domain) =>
    IP_LOGGER_DOMAINS.some((blocked) => domain === blocked || domain.endsWith(`.${blocked}`))
  );
  if (!matchedDomain) return false;

  await message.delete().catch(console.error);
  await message.author.send('Link yang kamu kirim terdeteksi sebagai IP logger dan telah dihapus.').catch(() => null);
  await logSecurityAction(message, client, 'IP Logger Dihapus', `Domain terdeteksi: ${matchedDomain}`);
  return true;
}

async function handleAutoMod(message, client) {
  const config = await getAutomodConfig(message, client);
  if (!config || memberHasBypass(message.member, config)) return false;

  const violation = detectAutomodViolation(message, config);
  if (!violation) return false;

  await message.delete().catch(console.error);
  const totalWarns = await autoWarn(message, client, violation);

  if (config.autoTimeoutEnabled && totalWarns >= config.autoTimeoutThreshold && message.member?.moderatable) {
    await message.member.timeout(config.autoTimeoutDuration * 60 * 1000, violation).catch(console.error);
  }

  await message.author.send(`Pesanmu dihapus karena melanggar aturan server: ${violation}`).catch(() => null);
  await logSecurityAction(message, client, 'Auto Mod Triggered', `${violation}\nTotal warn: ${totalWarns}`);
  return true;
}

module.exports = {
  name: 'messageCreate',
  async execute(message, client) {
    if (!message.guild || message.author.bot) return;
    if (!client.db || !client.dbAdmin) return;

    if (await handleIpLoggerProtection(message, client)) return;
    if (await handleAutoMod(message, client)) return;

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

    await logActivity(client.db, client.dbAdmin, message.guild.id, message.author.id, message.channelId, {
      messages: 1,
    });

    if (result.leveledUp) {
      await assignLevelRoles(message.member, config.levelRoles, result.oldLevel, result.newLevel);
      await sendLevelUpMessage(message, config, result.newLevel);
    }
  },
};
