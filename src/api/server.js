const cors = require('cors');
const express = require('express');
const admin = require('firebase-admin');
const authRouter = require('./routes/auth');
const guildsRouter = require('./routes/guilds');
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

function attachFirebase(req, res, next) {
  req.admin = admin;
  req.db = admin.firestore();
  return next();
}

function securityHeaders(req, res, next) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Content-Security-Policy', "default-src 'self'; frame-ancestors 'none'");
  return next();
}

function errorHandler(err, req, res, next) {
  console.error(err);
  if (res.headersSent) return next(err);
  return res.status(err.statusCode || 500).json({
    error: err.message || 'Internal server error',
  });
}

function createApp() {
  initializeFirebase();

  const app = express();
  const dashboardOrigin = process.env.DASHBOARD_URL || true;
  app.use(cors({ origin: dashboardOrigin }));
  app.use(securityHeaders);
  app.use(express.json({ limit: '1mb' }));
  app.use(requireApiSecret);
  app.use(attachFirebase);
  app.use('/api/auth', authRouter);
  app.use('/api/guilds', guildsRouter);
  app.use('/api/guilds/:guildId/insights', (req, res, next) => {
    if (!req.params.guildId) return res.status(400).json({ error: 'guildId wajib diisi.' });
    return next();
  }, insightsRouter);
  app.use(errorHandler);

  return app;
}

if (require.main === module) {
  const port = Number(process.env.API_PORT ?? 3000);
  const app = createApp();
  app.listen(port, () => {
    console.log(`Dashboard API berjalan di port ${port}`);
  });
}

module.exports = { createApp };
