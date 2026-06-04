# Bug Fix — Phase 1 sampai Phase 5

## Context
Bot Discord gaming community, discord.js v14, Firebase Firestore via `client.db` dan `client.dbAdmin`.
Branch: `fix/bugs-phase1-5`
Buat plan dulu sebelum nulis code.

---

## Daftar Bug yang Harus Diperbaiki

---

### FIX 1 — `src/index.js`: Double-fire event `clientReady`

**Masalah:**
Di `index.js` ada dua tempat yang handle event `clientReady`:
1. Event loader otomatis load `src/events/clientReady.js`
2. Di bawahnya ada `client.once('clientReady', ...)` manual yang panggil `startWeeklyReset` dan `startBirthdayChecker`

Ini inkonsisten — `clientReady.js` tidak memanggil kedua fungsi itu, jadi cron job hanya aktif dari handler manual. Tapi kalau urutan berubah atau event loader berubah, bisa double-fire.

**Fix:**
1. Hapus blok `client.once('clientReady', ...)` dari `index.js`
2. Hapus import `startBirthdayChecker` dan `startWeeklyReset` dari `index.js`
3. Tambahkan pemanggilan keduanya di dalam `src/events/clientReady.js`, di bagian paling bawah fungsi `execute`, setelah register commands dan cache guild:

```js
// Di src/events/clientReady.js, di dalam execute():
const { startWeeklyReset } = require('../jobs/weeklyReset');
const { startBirthdayChecker } = require('../jobs/birthdayChecker');

startWeeklyReset(client);
startBirthdayChecker(client);
```

---

### FIX 2 — `src/events/messageCreate.js`: Spam tracker memory leak

**Masalah:**
`spamTracker` adalah `Map` yang tidak pernah dibersihkan. Setiap user yang kirim pesan akan menambah entri. Setelah bot berjalan berminggu-minggu dengan 800+ member aktif, Map ini akan terus tumbuh di RAM tanpa batas.

**Fix:**
Tambahkan periodic cleanup di bagian atas file (setelah deklarasi `spamTracker`):

```js
const spamTracker = new Map();

// Bersihkan entri lama setiap 10 menit
setInterval(() => {
  const cutoff = Date.now() - 10000;
  for (const [key, timestamps] of spamTracker.entries()) {
    const filtered = timestamps.filter((t) => t > cutoff);
    if (filtered.length === 0) spamTracker.delete(key);
    else spamTracker.set(key, filtered);
  }
}, 10 * 60 * 1000);
```

---

### FIX 3 — `src/events/voiceStateUpdate.js`: Kondisi leave tidak jelas

**Masalah:**
Kondisi untuk mendeteksi user leave voice channel:
```js
if (!oldState.channelId || newState.channelId) return;
```
Logika ini secara teknis benar tapi sangat membingungkan dan rawan salah edit di masa depan.

**Fix:**
Ganti dengan kondisi yang lebih eksplisit:

```js
// ❌ Sebelum — membingungkan
if (!oldState.channelId || newState.channelId) return;

// ✅ Sesudah — jelas
const isLeave = Boolean(oldState.channelId) && !newState.channelId;
if (!isLeave) return;
```

---

### FIX 4 — `src/utils/activityLogger.js`: Race condition `uniqueActiveMembers`

**Masalah:**
Fungsi `updateServerStats` melakukan dua operasi Firestore terpisah yang tidak atomic:
```js
await docRef.set(payload, { merge: true });
// ... lalu ...
const snapshot = await docRef.get();
await docRef.set({ uniqueActiveMembers: activeMemberIds.length }, { merge: true });
```
Kalau dua user kirim pesan bersamaan, `uniqueActiveMembers` bisa salah hitung karena read-modify-write tidak dalam satu transaksi.

**Fix:**
Jadikan satu transaksi Firestore. Ganti `updateServerStats` menjadi:

```js
async function updateServerStats(db, dbAdmin, guildId, userId, date, { messages, voiceMinutes, memberJoins = 0, memberLeaves = 0 }) {
  const docRef = db.collection('serverStats').doc(`${guildId}_${date}`);
  const increment = dbAdmin.firestore.FieldValue.increment;

  if (userId && messages > 0) {
    // Perlu transaksi untuk update uniqueActiveMembers secara akurat
    await db.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(docRef);
      const data = snapshot.exists ? snapshot.data() : {};
      const activeMemberIds = new Set(Array.isArray(data.activeMemberIds) ? data.activeMemberIds : []);
      activeMemberIds.add(userId);

      transaction.set(docRef, {
        guildId,
        date,
        totalMessages: increment(messages),
        totalVoiceMinutes: increment(voiceMinutes),
        memberJoins: increment(memberJoins),
        memberLeaves: increment(memberLeaves),
        activeMemberIds: [...activeMemberIds],
        uniqueActiveMembers: activeMemberIds.size,
      }, { merge: true });
    });
  } else {
    // Tanpa userId, tidak perlu transaksi
    await docRef.set({
      guildId,
      date,
      totalMessages: increment(messages),
      totalVoiceMinutes: increment(voiceMinutes),
      memberJoins: increment(memberJoins),
      memberLeaves: increment(memberLeaves),
    }, { merge: true });
  }
}
```

---

### FIX 5 — `src/api/routes/guilds.js`: `endGiveawayByMessageId` dengan `fakeClient`

**Masalah:**
```js
const fakeClient = { db: req.db, channels: { fetch: async () => null } };
```
`channels.fetch` selalu return `null`, jadi saat giveaway diakhiri dari dashboard, pesan giveaway di Discord **tidak akan pernah di-edit** menjadi "Ended". Hanya Firestore yang di-update, tapi embed di Discord tetap menampilkan giveaway aktif.

**Fix:**
Jangan gunakan `endGiveawayByMessageId` dari dashboard karena fungsi itu butuh Discord client aktif untuk edit message. Ganti dengan implementasi langsung di route yang hanya update Firestore:

```js
router.post('/:guildId/giveaways/:id/end', async (req, res, next) => {
  try {
    const docRef = req.db.collection('giveaways').doc(docId(req.params.guildId, req.params.id));
    const snap = await docRef.get();
    if (!snap.exists) return res.status(404).json({ error: 'Giveaway tidak ditemukan.' });

    const data = snap.data();
    if (data.ended) return res.status(400).json({ error: 'Giveaway sudah berakhir.' });

    const pool = [...new Set(data.participants ?? [])];
    const winners = [];
    while (pool.length && winners.length < (data.winnersCount ?? 1)) {
      winners.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
    }

    await docRef.set({ ended: true, winners }, { merge: true });

    // Catatan: embed di Discord tidak akan di-edit karena dashboard tidak punya akses Discord client.
    // Bot akan mendeteksi perubahan ini saat ada interaksi berikutnya atau bisa ditambahkan
    // endpoint webhook ke bot di masa depan.

    res.json({ ok: true, winners });
  } catch (err) {
    next(err);
  }
});
```

Tambahkan komentar di response:
```json
{ "ok": true, "winners": [...], "note": "Pesan giveaway di Discord tidak otomatis di-edit. Gunakan /giveaway end di Discord untuk update embed." }
```

---

### FIX 6 — `src/api/routes/auth.js`: Tidak ada validasi & cap `expiresIn`

**Masalah:**
```js
expiresAt: Date.now() + Number(expiresIn ?? 3600) * 1000,
```
Tidak ada validasi tipe atau batas maksimum. Kalau `expiresIn` bernilai sangat besar, session tidak pernah expire.

**Fix:**
Tambahkan validasi dan cap maksimum 7 hari:

```js
const MAX_EXPIRY_SECONDS = 7 * 24 * 60 * 60; // 7 hari
const DEFAULT_EXPIRY_SECONDS = 3600; // 1 jam

const rawExpiry = Number(expiresIn);
const safeExpiry = Number.isFinite(rawExpiry) && rawExpiry > 0
  ? Math.min(rawExpiry, MAX_EXPIRY_SECONDS)
  : DEFAULT_EXPIRY_SECONDS;

expiresAt: Date.now() + safeExpiry * 1000,
```

---

### FIX 7 — `src/commands/utility/giveaway.js`: `rescheduleActiveGiveaways` tanpa limit

**Masalah:**
```js
const snapshot = await client.db
  .collection('giveaways')
  .where('ended', '==', false)
  .where('endsAt', '>', now)
  .get();
```
Tidak ada limit. Kalau ada ratusan giveaway aktif di banyak server, query ini bisa lambat dan berat saat bot startup.

**Fix:**
Tambahkan limit yang reasonable. Kalau ada lebih dari 100 giveaway aktif, log warning:

```js
async function rescheduleActiveGiveaways(client) {
  if (!client.db || !client.dbAdmin) return;

  const now = client.dbAdmin.firestore.Timestamp.now();
  const snapshot = await client.db
    .collection('giveaways')
    .where('ended', '==', false)
    .where('endsAt', '>', now)
    .limit(200)  // ← tambahkan limit
    .get();

  if (snapshot.size >= 200) {
    console.warn('⚠️ Jumlah giveaway aktif >= 200, beberapa mungkin tidak di-reschedule.');
  }

  snapshot.docs.forEach((doc) => scheduleGiveaway(client, doc.data()));
  console.log(`Giveaway aktif dijadwalkan ulang: ${snapshot.size}`);
}
```

---

### FIX 8 — `.gitignore`: `*.md` di-ignore

**Masalah:**
```
*.md
```
Baris ini membuat **semua file `.md`** (termasuk `ROADMAP.md`, `PLAN.md`, README, dll) tidak ter-commit ke Git.

**Fix:**
Hapus baris `*.md` dari `.gitignore`. Kalau memang ada file `.md` tertentu yang tidak mau di-commit, specify secara eksplisit:

```gitignore
# Sebelum
*.md

# Sesudah — hapus baris *.md
# Kalau ada file MD tertentu yang mau di-ignore, tulis spesifik:
# PLAN_PHASE_*.md
```

---

## File yang Harus Diubah

1. `src/index.js` — hapus `client.once('clientReady', ...)` dan dua import jobs
2. `src/events/clientReady.js` — tambahkan `startWeeklyReset` dan `startBirthdayChecker`
3. `src/events/messageCreate.js` — tambahkan spam tracker cleanup interval
4. `src/events/voiceStateUpdate.js` — ganti kondisi leave jadi lebih eksplisit
5. `src/utils/activityLogger.js` — perbaiki `updateServerStats` jadi atomic
6. `src/api/routes/guilds.js` — ganti implementasi end giveaway, hapus `fakeClient`
7. `src/api/routes/auth.js` — tambahkan validasi dan cap `expiresIn`
8. `src/commands/utility/giveaway.js` — tambahkan `.limit(200)` di `rescheduleActiveGiveaways`
9. `.gitignore` — hapus baris `*.md`

---

## Yang TIDAK Boleh Diubah

- Semua file commands yang tidak disebutkan di atas
- `src/utils/welcomeCard.js`
- `src/utils/guildCache.js`
- `src/utils/logger.js`
- `src/utils/raidState.js`
- `src/utils/ipLoggerDomains.js`
- `src/utils/analytics.js`
- `src/jobs/weeklyReset.js`
- `src/jobs/birthdayChecker.js`
- `src/api/server.js`
- `src/api/routes/insights.js`
- Semua events yang tidak disebutkan
- Schema Firestore yang sudah ada

---

## Catatan untuk Codex

- Untuk FIX 1, pastikan tidak ada import `startWeeklyReset` dan `startBirthdayChecker` yang tersisa di `index.js` setelah dihapus
- Untuk FIX 4, `activeMemberIds` di Firestore adalah array yang bisa membesar — ini acceptable untuk server 800 member (sekitar 800 string ID per dokumen per hari), tapi tambahkan komentar TODO untuk migrasi ke counter terpisah jika server tumbuh > 10.000 member
- Untuk FIX 5, tambahkan komentar yang jelas di route dan di dashboard frontend (kalau ada) bahwa end dari dashboard hanya update Firestore, bukan edit embed Discord
- Untuk FIX 8, pastikan tidak ada file `.md` yang suddenly muncul di git status setelah perubahan ini — cek dengan `git status` dulu
