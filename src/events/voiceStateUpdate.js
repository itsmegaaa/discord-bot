const { EmbedBuilder } = require('discord.js');
const { logActivity } = require('../utils/activityLogger');
const { getGuildConfig: getLogConfig, sendLog } = require('../utils/logger');

const voiceSessions = new Map();

const DEFAULT_CONFIG = {
  voiceXpEnabled: true,
  voiceXpPerMinute: 5,
  levelUpChannelId: null,
  levelRoles: [],
};

function xpToLevel(xp) {
  return Math.floor(0.1 * Math.sqrt(xp));
}

function sessionKey(guildId, userId) {
  return `${guildId}_${userId}`;
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
    console.error('Gagal membaca guild config voice XP:', err);
    return DEFAULT_CONFIG;
  }
}

async function resolveLevelUpChannel(guild, config) {
  if (config.levelUpChannelId) {
    try {
      return await guild.channels.fetch(config.levelUpChannelId);
    } catch (err) {
      console.error('Gagal mengambil channel level up:', err);
    }
  }

  return guild.systemChannel;
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

async function sendLevelUpMessage(member, config, newLevel) {
  const channel = await resolveLevelUpChannel(member.guild, config);
  if (!channel?.send) return;

  const embed = new EmbedBuilder()
    .setColor('#57F287')
    .setTitle('Level Up!')
    .setDescription(`${member} naik ke **Level ${newLevel}**!`)
    .setTimestamp();

  await channel.send({ embeds: [embed] });
}

async function logVoiceActivity(oldState, newState, client) {
  const guild = newState.guild || oldState.guild;
  const member = newState.member || oldState.member;
  const config = await getLogConfig(client, guild.id);
  if (!config?.logVoiceActivity) return;

  let detail = null;
  if (!oldState.channelId && newState.channelId) {
    detail = `Join voice: ${newState.channel}`;
  } else if (oldState.channelId && !newState.channelId) {
    detail = `Leave voice: ${oldState.channel}`;
  } else if (oldState.channelId !== newState.channelId) {
    detail = `Pindah voice: ${oldState.channel} -> ${newState.channel}`;
  }

  if (!detail) return;

  const embed = new EmbedBuilder()
    .setColor('#95A5A6')
    .setTitle('Voice Activity')
    .addFields(
      { name: 'User', value: `${member} (${member.user.tag})` },
      { name: 'Server', value: guild.name },
      { name: 'Detail aksi', value: detail }
    )
    .setTimestamp();

  await sendLog(client, guild.id, embed);
}

module.exports = {
  name: 'voiceStateUpdate',
  async execute(oldState, newState, client) {
    const member = newState.member || oldState.member;
    if (!member || member.user.bot || !client.db || !client.dbAdmin) return;

    await logVoiceActivity(oldState, newState, client);

    const key = sessionKey(member.guild.id, member.id);

    if (!oldState.channelId && newState.channelId) {
      const config = await getGuildConfig(member.guild.id, client);
      if (config.voiceXpEnabled) voiceSessions.set(key, Date.now());
      return;
    }

    if (!oldState.channelId || newState.channelId) return;

    const startedAt = voiceSessions.get(key);
    voiceSessions.delete(key);
    if (!startedAt) return;

    const config = await getGuildConfig(member.guild.id, client);
    if (!config.voiceXpEnabled) return;

    const voiceMinutes = Math.floor((Date.now() - startedAt) / 60000);
    if (voiceMinutes <= 0) return;

    const gainedXp = voiceMinutes * config.voiceXpPerMinute;
    const docId = `${member.guild.id}_${member.id}`;
    const userRef = client.db.collection('userLevels').doc(docId);
    const serverTimestamp = client.dbAdmin.firestore.FieldValue.serverTimestamp();

    const result = await client.db.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(userRef);
      const data = snapshot.exists ? snapshot.data() : {};
      const oldXp = data.xp ?? 0;
      const oldLevel = data.level ?? xpToLevel(oldXp);
      const newXp = oldXp + gainedXp;
      const newLevel = xpToLevel(newXp);

      transaction.set(userRef, {
        guildId: member.guild.id,
        userId: member.id,
        xp: newXp,
        level: newLevel,
        totalMessages: data.totalMessages ?? 0,
        voiceMinutes: (data.voiceMinutes ?? 0) + voiceMinutes,
        weeklyXp: (data.weeklyXp ?? 0) + gainedXp,
        weeklyReset: data.weeklyReset ?? serverTimestamp,
      }, { merge: true });

      return {
        oldLevel,
        newLevel,
        leveledUp: newLevel > oldLevel,
      };
    });

    await logActivity(client.db, client.dbAdmin, member.guild.id, member.id, {
      voiceMinutes,
    });

    if (result.leveledUp) {
      await assignLevelRoles(member, config.levelRoles, result.oldLevel, result.newLevel);
      await sendLevelUpMessage(member, config, result.newLevel);
    }
  },
};
