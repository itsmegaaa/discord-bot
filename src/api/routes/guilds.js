const express = require('express');

const router = express.Router();

function docId(guildId, id) {
  return `${guildId}_${id}`;
}

async function listCollection(db, collection, guildId) {
  const snapshot = await db.collection(collection).where('guildId', '==', guildId).get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

async function deleteQuery(snapshot) {
  const deletes = snapshot.docs.map((doc) => doc.ref.delete());
  await Promise.all(deletes);
  return deletes.length;
}

function pickWinners(participants, winnersCount) {
  const pool = [...new Set(participants)];
  const winners = [];

  while (pool.length && winners.length < winnersCount) {
    winners.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
  }

  return winners;
}

router.get('/', async (req, res, next) => {
  try {
    const snapshot = await req.db.collection('guildConfigs').get();
    const manageableGuildIds = new Set((req.dashboardAuth?.manageableGuilds ?? []).map((guild) => guild.id));
    const guilds = snapshot.docs
      .filter((doc) => req.authMode === 'apiSecret' || manageableGuildIds.has(doc.id))
      .map((doc) => ({
        id: doc.id,
        name: doc.data().guildName ?? doc.id,
        config: doc.data(),
      }));
    res.json({ guilds });
  } catch (err) {
    next(err);
  }
});

router.get('/:guildId/config', async (req, res, next) => {
  try {
    const doc = await req.db.collection('guildConfigs').doc(req.params.guildId).get();
    res.json({ config: doc.exists ? doc.data() : {} });
  } catch (err) {
    next(err);
  }
});

router.post('/:guildId/config', async (req, res, next) => {
  try {
    await req.db.collection('guildConfigs').doc(req.params.guildId).set(req.body ?? {}, { merge: true });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.get('/:guildId/automod', async (req, res, next) => {
  try {
    const doc = await req.db.collection('automodConfigs').doc(req.params.guildId).get();
    res.json({ automod: doc.exists ? doc.data() : {} });
  } catch (err) {
    next(err);
  }
});

router.post('/:guildId/automod', async (req, res, next) => {
  try {
    await req.db.collection('automodConfigs').doc(req.params.guildId).set({
      guildId: req.params.guildId,
      ...(req.body ?? {}),
    }, { merge: true });
    await req.db.collection('guildConfigs').doc(req.params.guildId).set({
      automodEnabled: req.body?.enabled === true,
    }, { merge: true });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.get('/:guildId/channels', async (req, res, next) => {
  try {
    const doc = await req.db.collection('guildCache').doc(req.params.guildId).get();
    res.json({ channels: doc.exists ? (doc.data().channels ?? []) : [] });
  } catch (err) {
    next(err);
  }
});

router.get('/:guildId/roles', async (req, res, next) => {
  try {
    const doc = await req.db.collection('guildCache').doc(req.params.guildId).get();
    res.json({ roles: doc.exists ? (doc.data().roles ?? []) : [] });
  } catch (err) {
    next(err);
  }
});

router.get('/:guildId/warns', async (req, res, next) => {
  try {
    res.json({ warns: await listCollection(req.db, 'warnLogs', req.params.guildId) });
  } catch (err) {
    next(err);
  }
});

router.delete('/:guildId/warns/:warnId', async (req, res, next) => {
  try {
    const ref = req.db.collection('warnLogs').doc(req.params.warnId);
    const snap = await ref.get();
    if (!snap.exists) return res.status(404).json({ error: 'Warn tidak ditemukan.' });
    if (snap.data().guildId !== req.params.guildId) {
      return res.status(404).json({ error: 'Warn tidak ditemukan di server ini.' });
    }

    await ref.delete();
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.delete('/:guildId/levels', async (req, res, next) => {
  try {
    const snapshot = await req.db.collection('userLevels').where('guildId', '==', req.params.guildId).get();
    const count = await deleteQuery(snapshot);
    res.json({ ok: true, count });
  } catch (err) {
    next(err);
  }
});

router.get('/:guildId/giveaways', async (req, res, next) => {
  try {
    res.json({ giveaways: await listCollection(req.db, 'giveaways', req.params.guildId) });
  } catch (err) {
    next(err);
  }
});

router.post('/:guildId/giveaways/:id/end', async (req, res, next) => {
  try {
    const ref = req.db.collection('giveaways').doc(docId(req.params.guildId, req.params.id));
    const snap = await ref.get();
    if (!snap.exists) return res.status(404).json({ error: 'Giveaway tidak ditemukan.' });

    const data = snap.data();
    const winners = data.ended
      ? (data.winners ?? [])
      : pickWinners(data.participants ?? [], data.winnersCount ?? 1);

    if (!data.ended) {
      await ref.set({ ended: true, winners }, { merge: true });
    }

    res.json({
      ok: true,
      winners,
      note: 'Pesan giveaway di Discord tidak otomatis di-edit. Gunakan /giveaway end di Discord untuk update embed.',
    });
  } catch (err) {
    next(err);
  }
});

router.post('/:guildId/giveaways/:id/reroll', async (req, res, next) => {
  try {
    const ref = req.db.collection('giveaways').doc(docId(req.params.guildId, req.params.id));
    const snap = await ref.get();
    if (!snap.exists) return res.status(404).json({ error: 'Giveaway tidak ditemukan.' });
    const data = snap.data();
    const pool = [...new Set(data.participants ?? [])];
    const winners = [];
    while (pool.length && winners.length < (data.winnersCount ?? 1)) {
      winners.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
    }
    await ref.set({ winners }, { merge: true });
    res.json({ ok: true, winners });
  } catch (err) {
    next(err);
  }
});

router.delete('/:guildId/giveaways/:id', async (req, res, next) => {
  try {
    await req.db.collection('giveaways').doc(docId(req.params.guildId, req.params.id)).delete();
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.get('/:guildId/birthdays', async (req, res, next) => {
  try {
    res.json({ birthdays: await listCollection(req.db, 'birthdays', req.params.guildId) });
  } catch (err) {
    next(err);
  }
});

router.delete('/:guildId/birthdays/:userId', async (req, res, next) => {
  try {
    await req.db.collection('birthdays').doc(docId(req.params.guildId, req.params.userId)).delete();
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.get('/:guildId/custom-commands', async (req, res, next) => {
  try {
    res.json({ commands: await listCollection(req.db, 'customCommands', req.params.guildId) });
  } catch (err) {
    next(err);
  }
});

router.post('/:guildId/custom-commands', async (req, res, next) => {
  try {
    const trigger = String(req.body?.trigger ?? '').trim().toLowerCase().replace(/^!+/, '');
    if (!trigger || !req.body?.response) return res.status(400).json({ error: 'trigger dan response wajib diisi.' });
    await req.db.collection('customCommands').doc(docId(req.params.guildId, trigger)).set({
      guildId: req.params.guildId,
      trigger,
      response: req.body.response,
      createdBy: req.body.createdBy ?? 'dashboard',
      createdAt: req.admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: req.admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.put('/:guildId/custom-commands/:trigger', async (req, res, next) => {
  try {
    const trigger = req.params.trigger.trim().toLowerCase().replace(/^!+/, '');
    await req.db.collection('customCommands').doc(docId(req.params.guildId, trigger)).set({
      response: req.body?.response,
      updatedAt: req.admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.delete('/:guildId/custom-commands/:trigger', async (req, res, next) => {
  try {
    const trigger = req.params.trigger.trim().toLowerCase().replace(/^!+/, '');
    await req.db.collection('customCommands').doc(docId(req.params.guildId, trigger)).delete();
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
