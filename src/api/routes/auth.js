const express = require('express');

const MANAGE_GUILD = 0x20;
const router = express.Router();

async function fetchDiscordUser(accessToken) {
  const response = await fetch('https://discord.com/api/users/@me', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) throw new Error('Discord token tidak valid.');
  return response.json();
}

async function fetchDiscordGuilds(accessToken) {
  const response = await fetch('https://discord.com/api/users/@me/guilds', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) throw new Error('Gagal mengambil guild Discord.');
  return response.json();
}

router.post('/discord', async (req, res, next) => {
  try {
    const { accessToken, expiresIn } = req.body ?? {};
    if (!accessToken) return res.status(400).json({ error: 'accessToken wajib diisi.' });

    const [discordUser, discordGuilds] = await Promise.all([
      fetchDiscordUser(accessToken),
      fetchDiscordGuilds(accessToken),
    ]);
    const uid = `discord:${discordUser.id}`;
    const manageableGuilds = discordGuilds
      .filter((guild) => (Number(guild.permissions) & MANAGE_GUILD) !== 0)
      .map((guild) => ({
        id: guild.id,
        name: guild.name,
        icon: guild.icon,
        owner: guild.owner,
        permissions: guild.permissions,
      }));

    await req.db.collection('sessions').doc(uid).set({
      uid,
      discordUser,
      discordAccessToken: accessToken,
      manageableGuilds,
      expiresAt: Date.now() + Number(expiresIn ?? 3600) * 1000,
      updatedAt: req.admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    const firebaseCustomToken = await req.admin.auth().createCustomToken(uid, {
      provider: 'discord',
      discordId: discordUser.id,
    });

    return res.json({ firebaseCustomToken, user: discordUser });
  } catch (err) {
    return next(err);
  }
});

router.get('/guilds', async (req, res, next) => {
  try {
    const auth = req.header('authorization') ?? '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Bearer token wajib diisi.' });

    const decoded = await req.admin.auth().verifyIdToken(token);
    const session = await req.db.collection('sessions').doc(decoded.uid).get();
    if (!session.exists) return res.status(401).json({ error: 'Session tidak ditemukan.' });

    const botGuilds = await req.db.collection('guildConfigs').get();
    const botGuildIds = new Set(botGuilds.docs.map((doc) => doc.id));
    const guilds = (session.data().manageableGuilds ?? [])
      .filter((guild) => botGuildIds.has(guild.id));

    return res.json({ guilds });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
