function channelType(channel) {
  if (channel?.type === 2) return 'voice';
  if (channel?.type === 0) return 'text';
  if (channel?.type === 4) return 'category';
  return `${channel?.type ?? 'unknown'}`;
}

async function cacheGuildResources(client, guild) {
  if (!client.db || !client.dbAdmin || !guild) return;

  const channels = guild.channels.cache
    .filter((channel) => ['0', '2', '4', 0, 2, 4].includes(channel.type))
    .map((channel) => ({
      id: channel.id,
      name: channel.name,
      type: channelType(channel),
      position: channel.rawPosition ?? 0,
    }))
    .sort((a, b) => a.position - b.position || a.name.localeCompare(b.name));

  const roles = guild.roles.cache
    .filter((role) => role.id !== guild.id)
    .map((role) => ({
      id: role.id,
      name: role.name,
      color: role.hexColor,
      position: role.position,
    }))
    .sort((a, b) => b.position - a.position || a.name.localeCompare(b.name));

  await client.db.collection('guildCache').doc(guild.id).set({
    guildId: guild.id,
    guildName: guild.name,
    channels,
    roles,
    updatedAt: client.dbAdmin.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });
}

async function cacheAllGuildResources(client) {
  if (!client.db || !client.dbAdmin) return;

  for (const guild of client.guilds.cache.values()) {
    await cacheGuildResources(client, guild).catch(console.error);
  }
}

module.exports = {
  cacheAllGuildResources,
  cacheGuildResources,
};
