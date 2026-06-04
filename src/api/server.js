const express = require('express');
const admin = require('firebase-admin');
const insightsRouter = require('./routes/insights');
require('dotenv').config();

function initializeFirebase() {
  if (admin.apps.length) return;

  if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT belum diatur.');
  }

  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

function requireApiSecret(req, res, next) {
  const expected = process.env.API_SECRET;
  if (!expected) {
    return res.status(500).json({ error: 'API_SECRET belum diatur.' });
  }

  if (req.header('x-api-secret') !== expected) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  return next();
}

function createApp() {
  initializeFirebase();

  const app = express();
  app.use(express.json());
  app.use(requireApiSecret);
  app.use('/api/guilds/:guildId/insights', (req, res, next) => {
    if (!req.params.guildId) return res.status(400).json({ error: 'guildId wajib diisi.' });
    req.db = admin.firestore();
    return next();
  }, insightsRouter);

  return app;
}

if (require.main === module) {
  const port = Number(process.env.API_PORT ?? 3000);
  const app = createApp();
  app.listen(port, () => {
    console.log(`Insights API berjalan di port ${port}`);
  });
}

module.exports = { createApp };
