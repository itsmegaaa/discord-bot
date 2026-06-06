const cron = require('node-cron');

function startWeeklyReset(client) {
  if (!client.db || !client.dbAdmin) {
    console.warn('Weekly XP reset tidak aktif: Firestore belum tersedia.');
    return;
  }

  cron.schedule('0 0 * * 1', async () => {
    try {
      const timestamp = client.dbAdmin.firestore.FieldValue.serverTimestamp();
      const snapshot = await client.db
        .collection('userLevels')
        .where('weeklyXp', '>', 0)
        .get();

      /** Firestore membatasi satu batch maksimal 500 operasi. */
      const FIRESTORE_BATCH_LIMIT = 500;
      let batch = client.db.batch();
      let batchSize = 0; // Dihitung per batch, di-reset setiap FIRESTORE_BATCH_LIMIT
      let count = 0;     // Total dokumen yang direset (untuk logging)

      for (const doc of snapshot.docs) {
        batch.update(doc.ref, {
          weeklyXp: 0,
          weeklyReset: timestamp,
        });

        batchSize += 1;
        count += 1;

        if (batchSize === FIRESTORE_BATCH_LIMIT) {
          await batch.commit();
          batch = client.db.batch();
          batchSize = 0;
        }
      }

      if (batchSize > 0) {
        await batch.commit();
      }

      console.log(`✅ Weekly XP reset selesai - ${count} users direset`);
    } catch (err) {
      console.error('❌ Gagal reset weekly XP:', err);
    }
  }, {
    timezone: 'Asia/Jakarta',
  });

  console.log('Weekly XP reset job aktif.');
}

module.exports = { startWeeklyReset };
