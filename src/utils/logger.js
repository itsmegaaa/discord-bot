async function getGuildConfig(client, guildId) {
  if (!client.db) return null;

  try {
    const doc = await client.db.collection('guildConfigs').doc(guildId).get();
    return doc.exists ? doc.data() : null;
  } catch (err) {
    console.error('Gagal membaca guild config untuk log:', err);
    return null;
  }
}

async function sendLog(client, guildId, embed) {
  const config = await getGuildConfig(client, guildId);
  const channelId = config?.logChannelId || config?.modLogChannelId;
  if (!channelId) return;

  const channel = await client.channels.fetch(channelId).catch(() => null);
  if (!channel?.send) return;

  await channel.send({ embeds: [embed] }).catch(console.error);
}

module.exports = { sendLog, getGuildConfig };
