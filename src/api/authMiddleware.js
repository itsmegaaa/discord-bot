function getBearerToken(req) {
  const auth = req.header('authorization') ?? '';
  return auth.startsWith('Bearer ') ? auth.slice(7) : null;
}

function sessionExpiryMs(expiresAt) {
  if (typeof expiresAt === 'number') return expiresAt;
  if (typeof expiresAt?.toMillis === 'function') return expiresAt.toMillis();
  return 0;
}

function hasApiSecret(req) {
  const expected = process.env.API_SECRET;
  return Boolean(expected && req.header('x-api-secret') === expected);
}

async function requireDashboardAuth(req, res, next) {
  try {
    if (hasApiSecret(req)) {
      req.authMode = 'apiSecret';
      req.dashboardAuth = { mode: 'apiSecret' };
      return next();
    }

    const token = getBearerToken(req);
    if (!token) return res.status(401).json({ error: 'Bearer token wajib diisi.' });

    const decoded = await req.admin.auth().verifyIdToken(token);
    const session = await req.db.collection('sessions').doc(decoded.uid).get();
    if (!session.exists) return res.status(401).json({ error: 'Session tidak ditemukan.' });

    const sessionData = session.data();
    if (sessionExpiryMs(sessionData.expiresAt) <= Date.now()) {
      return res.status(401).json({ error: 'Session sudah expired.' });
    }

    req.authMode = 'firebase';
    req.dashboardAuth = {
      mode: 'firebase',
      uid: decoded.uid,
      decoded,
      session: sessionData,
      manageableGuilds: Array.isArray(sessionData.manageableGuilds) ? sessionData.manageableGuilds : [],
    };

    return next();
  } catch (err) {
    return next(err);
  }
}

function requireGuildAccess(req, res, next) {
  if (req.authMode === 'apiSecret') return next();

  const guildId = req.params.guildId;
  if (!guildId) return res.status(400).json({ error: 'guildId wajib diisi.' });

  const manageableGuilds = req.dashboardAuth?.manageableGuilds ?? [];
  if (!manageableGuilds.some((guild) => guild.id === guildId)) {
    return res.status(403).json({ error: 'Kamu tidak punya akses dashboard untuk server ini.' });
  }

  return next();
}

module.exports = {
  requireDashboardAuth,
  requireGuildAccess,
};
