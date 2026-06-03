module.exports = {
  name: 'guildCreate',
  async execute(guild, client) {
    if (!client.db || !client.dbAdmin) return;

    const timestamp = client.dbAdmin.firestore.FieldValue.serverTimestamp();

    await client.db.collection('guildConfigs').doc(guild.id).set({
      guildId: guild.id,
      guildName: guild.name,
      welcomeChannelId: null,
      welcomeMessage: 'Selamat datang {user} di {server}! Kamu adalah member ke-{count}.',
      welcomeCardEnabled: true,
      autoRoleId: null,
      goodbyeChannelId: null,
      goodbyeMessage: '{user} telah meninggalkan server. Sekarang ada {count} member.',
      modLogChannelId: null,
      createdAt: timestamp,
    }, { merge: true });

    console.log(`✅ Bot bergabung ke server: ${guild.name}`);
  },
};
