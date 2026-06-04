const cors = require('cors');
const express = require('express');
const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');
const authRouter = require('./routes/auth');
const guildsRouter = require('./routes/guilds');
const insightsRouter = require('./routes/insights');
const { requireDashboardAuth, requireGuildAccess } = require('./authMiddleware');
require('dotenv').config();

function initializeFirebase() {
  if (admin.apps.length) return;

  let serviceAccountRaw = process.env.FIREBASE_SERVICE_ACCOUNT;
  const localServiceAccountPath = path.resolve(process.cwd(), 'serviceAccountKey.json');

  if (!serviceAccountRaw && process.env.NODE_ENV !== 'production' && fs.existsSync(localServiceAccountPath)) {
    serviceAccountRaw = fs.readFileSync(localServiceAccountPath, 'utf8');
  }

  if (!serviceAccountRaw) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT belum diatur. Set env ini sebagai JSON service account satu baris di backend hosting.');
  }

  let serviceAccount;
  try {
    serviceAccount = JSON.parse(serviceAccountRaw);
  } catch (err) {
    throw new Error(`FIREBASE_SERVICE_ACCOUNT bukan JSON valid: ${err.message}`);
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

function allowedOrigins() {
  const origins = new Set();
  if (process.env.DASHBOARD_URL) origins.add(process.env.DASHBOARD_URL);
  if (process.env.NODE_ENV !== 'production') {
    origins.add('http://localhost:5173');
    origins.add('http://127.0.0.1:5173');
  }
  return origins;
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
  const origins = allowedOrigins();
  app.use(cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (origins.has(origin)) return callback(null, true);
      return callback(new Error(`CORS origin tidak diizinkan: ${origin}`));
    },
  }));
  app.use(securityHeaders);
  app.use(express.json({ limit: '1mb' }));
  app.use(attachFirebase);
  app.use('/api/auth/guilds', requireDashboardAuth);
  app.use('/api/auth', authRouter);
  app.use('/api/guilds', requireDashboardAuth);
  app.use('/api/guilds/:guildId', requireGuildAccess);
  app.use('/api/guilds/:guildId/insights', (req, res, next) => {
    if (!req.params.guildId) return res.status(400).json({ error: 'guildId wajib diisi.' });
    return next();
  }, insightsRouter);
  app.use('/api/guilds', guildsRouter);
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
