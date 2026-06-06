'use strict';

const express = require('express');
const {
  listModulesForGuild,
  setModuleEnabled,
  getModuleConfig,
  setModuleConfig,
} = require('../../core/guildModuleSettings');

const router = express.Router({ mergeParams: true });

/**
 * GET /api/guilds/:guildId/modules
 * List semua modul beserta status enabled dan config per guild.
 */
router.get('/', async (req, res, next) => {
  try {
    const { registry } = require('../../core/ModuleRegistry');
    const modules = await listModulesForGuild(req.db, req.params.guildId, registry);
    res.json({ modules });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/guilds/:guildId/modules/:moduleId/enable
 * Enable sebuah modul untuk guild.
 */
router.post('/:moduleId/enable', async (req, res, next) => {
  try {
    const { registry } = require('../../core/ModuleRegistry');
    const { moduleId } = req.params;
    if (!registry.getById(moduleId)) {
      return res.status(404).json({ error: `Modul '${moduleId}' tidak ditemukan.` });
    }
    await setModuleEnabled(req.db, req.admin, req.params.guildId, moduleId, true);
    res.json({ ok: true, moduleId, enabled: true });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/guilds/:guildId/modules/:moduleId/disable
 * Disable sebuah modul untuk guild.
 */
router.post('/:moduleId/disable', async (req, res, next) => {
  try {
    const { registry } = require('../../core/ModuleRegistry');
    const { moduleId } = req.params;
    if (!registry.getById(moduleId)) {
      return res.status(404).json({ error: `Modul '${moduleId}' tidak ditemukan.` });
    }
    await setModuleEnabled(req.db, req.admin, req.params.guildId, moduleId, false);
    res.json({ ok: true, moduleId, enabled: false });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/guilds/:guildId/modules/:moduleId/config
 * Baca config sebuah modul untuk guild.
 */
router.get('/:moduleId/config', async (req, res, next) => {
  try {
    const { registry } = require('../../core/ModuleRegistry');
    const { moduleId } = req.params;
    const mod = registry.getById(moduleId);
    if (!mod) {
      return res.status(404).json({ error: `Modul '${moduleId}' tidak ditemukan.` });
    }
    const config = await getModuleConfig(req.db, req.params.guildId, moduleId);
    res.json({ moduleId, config: { ...(mod.defaultConfig ?? {}), ...config } });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/guilds/:guildId/modules/:moduleId/config
 * Update config sebuah modul untuk guild (merge dengan config lama).
 */
router.post('/:moduleId/config', async (req, res, next) => {
  try {
    const { registry } = require('../../core/ModuleRegistry');
    const { moduleId } = req.params;
    if (!registry.getById(moduleId)) {
      return res.status(404).json({ error: `Modul '${moduleId}' tidak ditemukan.` });
    }
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({ error: 'Body harus berupa object config.' });
    }
    await setModuleConfig(req.db, req.admin, req.params.guildId, moduleId, req.body);
    res.json({ ok: true, moduleId });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
