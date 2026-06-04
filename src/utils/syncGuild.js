const FIRESTORE_NOT_READY_MESSAGE = 'Firestore belum terhubung. Pastikan FIREBASE_SERVICE_ACCOUNT tersedia di service bot worker.';

const TEXT_CHANNEL_TYPES = new Set([0, 5, 10, 11, 12, 15, 16, '0', '5', '10', '11', '12', '15', '16']);
const VOICE_CHANNEL_TYPES = new Set([2, 13, '2', '13']);
const CATEGORY_CHANNEL_TYPES = new Set([4, '4']);

const DEFAULT_GUILD_CONFIG = {
  welcomeEnabled: true,
  welcomeChannelId: null,
  welcomeMessage: 'Selamat datang {user} di {server}! Kamu adalah member ke-{count}.',
  welcomeCardEnabled: true,
  autoRoleId: null,
  goodbyeChannelId: null,
  goodbyeMessage: '{user} telah meninggalkan server. Sekarang ada {count} member.',
  modLogChannelId: null,
  levelingEnabled: true,
  xpPerMessage: 15,
  xpCooldownSeconds: 60,
  levelUpChannelId: null,
  levelRoles: [],
  voiceXpEnabled: true,
  voiceXpPerMinute: 5,
  giveawayJoinType: 'button',
  birthdayChannelId: null,
  birthdayRoleId: null,
  giveawayLogChannelId: null,
  birthdayEnabled: true,
  automodEnabled: false,
  logChannelId: null,
  logMessageEdit: true,
  logMessageDelete: true,
  logVoiceActivity: false,
  logMemberJoin: true,
  logMemberLeave: true,
  logRoleChanges: false,
  logModActions: true,
  antiRaidEnabled: false,
  raidThreshold: 10,
  adminRoleId: null,
};

function hasFirestore(client) {
  return Boolean(client?.db && client?.dbAdmin);
}

function logFirestoreMissing() {
  console.error(FIRESTORE_NOT_READY_MESSAGE);
}

function channelType(channel) {
  if (VOICE_CHANNEL_TYPES.has(channel?.type)) return 'voice';
  if (CATEGORY_CHANNEL_TYPES.has(channel?.type)) return 'category';
  if (TEXT_CHANNEL_TYPES.has(channel?.type)) return 'text';
  return 'text';
}

async function refreshGuildResources(guild) {
  await guild.channels.fetch().catch(() => null);
  await guild.roles.fetch().catch(() => null);
}

function mapChannels(guild) {
  return [...(guild.channels.cache?.values?.() ?? [])]
    .filter((channel) => channel?.id && channel?.name)
    .map((channel) => ({
      id: channel.id,
      name: channel.name,
      type: channelType(channel),
      position: channel.rawPosition ?? 0,
    }))
    .sort((a, b) => a.position - b.position || a.name.localeCompare(b.name));
}

function mapRoles(guild) {
  return [...(guild.roles.cache?.values?.() ?? [])]
    .filter((role) => role?.id && role.id !== guild.id)
    .map((role) => ({
      id: role.id,
      name: role.name,
      color: role.hexColor,
      position: role.position ?? 0,
    }))
    .sort((a, b) => b.position - a.position || a.name.localeCompare(b.name));
}

async function syncGuildConfig(client, guild, timestamp) {
  const docRef = client.db.collection('guildConfigs').doc(guild.id);
  const snapshot = await docRef.get();

  if (!snapshot.exists) {
    await docRef.set({
      guildId: guild.id,
      guildName: guild.name,
      ...DEFAULT_GUILD_CONFIG,
      createdAt: timestamp,
      updatedAt: timestamp,
    }, { merge: true });
    return 'created';
  }

  const data = snapshot.data() ?? {};
  const metadata = {
    guildId: guild.id,
    guildName: guild.name,
    updatedAt: timestamp,
  };

  if (data.createdAt === undefined) {
    metadata.createdAt = timestamp;
  }

  await docRef.set(metadata, { merge: true });
  return 'updated';
}

async function syncGuildCache(client, guild) {
  if (!hasFirestore(client)) {
    logFirestoreMissing();
    return false;
  }

  await refreshGuildResources(guild);

  await client.db.collection('guildCache').doc(guild.id).set({
    guildId: guild.id,
    guildName: guild.name,
    channels: mapChannels(guild),
    roles: mapRoles(guild),
    memberCount: guild.memberCount ?? 0,
    updatedAt: client.dbAdmin.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });

  return true;
}

async function syncGuild(client, guild) {
  if (!hasFirestore(client)) {
    logFirestoreMissing();
    return { ok: false, reason: 'firestore-missing' };
  }

  const timestamp = client.dbAdmin.firestore.FieldValue.serverTimestamp();
  const configStatus = await syncGuildConfig(client, guild, timestamp);
  await syncGuildCache(client, guild);

  return { ok: true, configStatus };
}

async function syncAllGuilds(client) {
  if (!hasFirestore(client)) {
    logFirestoreMissing();
    return { success: 0, failed: 0 };
  }

  let success = 0;
  let failed = 0;

  for (const guild of client.guilds.cache.values()) {
    try {
      await syncGuild(client, guild);
      success += 1;
    } catch (err) {
      failed += 1;
      console.error(`Gagal sync guild ${guild.name} (${guild.id}):`, err);
    }
  }

  console.log(`Sync guild selesai: ${success} sukses, ${failed} gagal.`);
  return { success, failed };
}

module.exports = {
  FIRESTORE_NOT_READY_MESSAGE,
  channelType,
  syncAllGuilds,
  syncGuild,
  syncGuildCache,
};
