'use strict';

/**
 * guildModuleSettings — baca/tulis state enabled/disabled modul per guild di Firestore.
 *
 * Firestore schema:
 *   guildModules/{guildId}
 *   {
 *     guildId: string,
 *     modules: {
 *       [moduleId]: { enabled: boolean, config: object }
 *     },
 *     updatedAt: Timestamp
 *   }
 */

/**
 * Ambil state modul untuk sebuah guild.
 * Jika doc belum ada, semua modul dianggap enabled (fallback graceful).
 * @param {FirebaseFirestore.Firestore} db
 * @param {string} guildId
 * @returns {Promise<Record<string, {enabled: boolean, config: object}>>}
 */
async function getModulesState(db, guildId) {
  try {
    const doc = await db.collection('guildModules').doc(guildId).get();
    if (!doc.exists) return {};
    return doc.data()?.modules ?? {};
  } catch (err) {
    console.error(`guildModuleSettings: gagal baca guildModules/${guildId}:`, err);
    return {};
  }
}

/**
 * Cek apakah sebuah modul aktif untuk guild tertentu.
 * Jika guild belum punya doc, kembalikan defaultEnabled dari descriptor.
 * @param {FirebaseFirestore.Firestore} db
 * @param {string} guildId
 * @param {string} moduleId
 * @param {boolean} [defaultEnabled=true]
 * @returns {Promise<boolean>}
 */
async function isModuleEnabled(db, guildId, moduleId, defaultEnabled = true) {
  const state = await getModulesState(db, guildId);
  if (!(moduleId in state)) return defaultEnabled;
  return state[moduleId].enabled !== false;
}

/**
 * Enable atau disable sebuah modul untuk guild.
 * @param {FirebaseFirestore.Firestore} db
 * @param {import('firebase-admin')} admin
 * @param {string} guildId
 * @param {string} moduleId
 * @param {boolean} enabled
 */
async function setModuleEnabled(db, admin, guildId, moduleId, enabled) {
  await db.collection('guildModules').doc(guildId).set({
    guildId,
    modules: {
      [moduleId]: { enabled },
    },
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });
}

/**
 * Baca config sebuah modul untuk guild.
 * @param {FirebaseFirestore.Firestore} db
 * @param {string} guildId
 * @param {string} moduleId
 * @returns {Promise<object>}
 */
async function getModuleConfig(db, guildId, moduleId) {
  const state = await getModulesState(db, guildId);
  return state[moduleId]?.config ?? {};
}

/**
 * Update config sebuah modul untuk guild (merge dengan config lama).
 * @param {FirebaseFirestore.Firestore} db
 * @param {import('firebase-admin')} admin
 * @param {string} guildId
 * @param {string} moduleId
 * @param {object} config
 */
async function setModuleConfig(db, admin, guildId, moduleId, config) {
  await db.collection('guildModules').doc(guildId).set({
    guildId,
    modules: {
      [moduleId]: { config },
    },
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });
}

/**
 * Inisialisasi doc guildModules untuk guild baru.
 * Hanya menulis jika doc belum ada, dengan defaultEnabled dari registry.
 * @param {FirebaseFirestore.Firestore} db
 * @param {import('firebase-admin')} admin
 * @param {string} guildId
 * @param {import('./ModuleRegistry').ModuleRegistry} registry
 */
async function initGuildModules(db, admin, guildId, registry) {
  if (!db) return;
  try {
    const docRef = db.collection('guildModules').doc(guildId);
    const doc = await docRef.get();
    if (doc.exists) return; // sudah ada, jangan overwrite

    const modules = {};
    for (const mod of registry.getAll()) {
      modules[mod.id] = {
        enabled: mod.defaultEnabled !== false,
        config: mod.defaultConfig ?? {},
      };
    }

    await docRef.set({
      guildId,
      modules,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  } catch (err) {
    console.error(`initGuildModules: gagal inisialisasi guild ${guildId}:`, err);
  }
}

/**
 * Ambil daftar semua modul beserta status enabled untuk ditampilkan di dashboard.
 * @param {FirebaseFirestore.Firestore} db
 * @param {string} guildId
 * @param {import('./ModuleRegistry').ModuleRegistry} registry
 * @returns {Promise<Array<{id, name, description, enabled, config}>>}
 */
async function listModulesForGuild(db, guildId, registry) {
  const state = await getModulesState(db, guildId);
  return registry.getAll().map((mod) => ({
    id: mod.id,
    name: mod.name,
    description: mod.description,
    defaultEnabled: mod.defaultEnabled !== false,
    enabled: state[mod.id]?.enabled ?? (mod.defaultEnabled !== false),
    config: state[mod.id]?.config ?? mod.defaultConfig ?? {},
  }));
}

module.exports = {
  getModulesState,
  isModuleEnabled,
  setModuleEnabled,
  getModuleConfig,
  setModuleConfig,
  initGuildModules,
  listModulesForGuild,
};
