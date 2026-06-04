# Phase 1 — Leveling & XP System

## Context
Bot Discord gaming community, discord.js v14, Firebase Firestore via `client.db` dan `client.dbAdmin`.
Jangan ubah file yang tidak disebutkan. Buat plan dulu sebelum nulis code.

## Existing Files (Jangan Diubah Kecuali Disebutkan)
- `src/index.js` — sudah ada `client.db` dan `client.dbAdmin`
- `src/events/guildMemberAdd.js`
- `src/events/guildCreate.js` — nanti tambahkan default leveling config di sini
- `src/utils/welcomeCard.js`
- Semua file moderation yang sudah ada

---

## Yang Harus Dibuat / Diubah

### 1. Firestore Collection: `userLevels`

Document ID: `{guildId}_{userId}`

```js
{
  guildId: String,
  userId: String,
  xp: Number,             // total XP sepanjang masa
  level: Number,          // level saat ini
  totalMessages: Number,  // total pesan yang dihitung XP-nya
  voiceMinutes: Number,   // total menit di voice channel
  lastMessageAt: Timestamp,  // untuk cooldown XP
  weeklyXp: Number,       // XP minggu ini, direset tiap Senin
  weeklyReset: Timestamp, // kapan terakhir weekly reset
}
```

### 2. Tambahan ke `guildConfigs/{guildId}`

```js
levelingEnabled: Boolean,       // default: true
xpPerMessage: Number,           // default: 15
xpCooldownSeconds: Number,      // default: 60
levelUpChannelId: String,       // null = kirim di channel yang sama
levelRoles: Array,              // [{ level: 5, roleId: "..." }]
voiceXpEnabled: Boolean,        // default: true
voiceXpPerMinute: Number,       // default: 5
```

### 3. Tambahan di `src/events/guildCreate.js`

Tambahkan field leveling ke default document yang sudah ada:
```js
levelingEnabled: true,
xpPerMessage: 15,
xpCooldownSeconds: 60,
levelUpChannelId: null,
levelRoles: [],
voiceXpEnabled: true,
voiceXpPerMinute: 5,
```

---

## File Baru yang Harus Dibuat

### `src/events/messageCreate.js`
Logic XP dari pesan:

1. Cek `guildConfig.levelingEnabled` — kalau false, return
2. Cek cooldown: bandingkan `lastMessageAt` dari Firestore dengan `Date.now()`
   - Kalau belum lewat `xpCooldownSeconds`, skip (jangan tambah XP)
   - Cooldown disimpan di **Firestore** (bukan in-memory)
3. Tambah XP: `xp += guildConfig.xpPerMessage`, `weeklyXp += xpPerMessage`
4. Hitung level baru pakai formula: `level = Math.floor(0.1 * Math.sqrt(xp))`
5. Kalau level naik:
   - Cek `levelRoles` — kalau ada role untuk level ini, assign ke member
   - Kirim embed level up ke `levelUpChannelId` (atau channel saat ini kalau null)
   - Embed warna hijau `#57F287`, mention user, tampilkan level baru
6. Update Firestore: `xp`, `level`, `totalMessages`, `lastMessageAt`, `weeklyXp`
7. Update `activityLogs/{guildId}_{userId}_{date}` — increment `messageCount`

### `src/events/voiceStateUpdate.js`
Logic XP dari voice channel:

1. Cek `guildConfig.voiceXpEnabled`
2. Track waktu user join voice dengan **in-memory Map**: `voiceSessions.set(userId, Date.now())`
3. Saat user leave voice:
   - Hitung durasi dalam menit
   - Tambah XP: `durasi * guildConfig.voiceXpPerMinute`
   - Update `userLevels`: `xp`, `voiceMinutes`, `weeklyXp`
   - Cek level up (sama seperti messageCreate)
4. Update `activityLogs` — increment `voiceMinutes`

> Catatan: voice session tracking pakai in-memory Map (bukan Firestore) karena data ini temporer dan tidak perlu persist.

### `src/commands/utility/rank.js`
Slash command `/rank [user]`:

1. Ambil data `userLevels/{guildId}_{userId}` dari Firestore
2. Hitung XP yang dibutuhkan untuk level berikutnya:
   - XP untuk level N: `(N / 0.1)^2`
   - Progress ke level berikutnya: `(xp - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)`
3. Generate rank card via canvas (lihat spec desain di bawah)
4. Reply dengan gambar PNG

**Rank Card Design (canvas 800x200px):**
- Background: gradient gelap `#1a1a2e` → `#16213e` (sama kayak welcome card)
- Border: `#5865F2`, 3px
- Kiri: avatar circle (radius 70px), posisi x:100 y:100
- Avatar ring: warna sesuai level (hijau <10, biru <20, ungu <30, emas >=30)
- Tengah-kanan:
  - Username bold 28px putih
  - `Level {N}` — 18px warna aksen
  - Progress bar XP: lebar 400px, tinggi 20px, rounded, warna `#5865F2`, background `#2B2D31`
  - Teks di bawah progress bar: `{currentXP} / {nextLevelXP} XP`
- Pojok kanan atas: `Rank #N` (posisi di leaderboard guild ini)

### `src/commands/utility/leaderboard.js`
Slash command `/leaderboard [periode]`:

- Option `periode`: `all` (default) | `weekly`
- Ambil top 10 dari Firestore `userLevels` order by `xp` atau `weeklyXp`
- Reply embed dengan list bernomor:
  ```
  🥇 #1 Username — Level 25 — 12,500 XP
  🥈 #2 Username — Level 22 — 10,200 XP
  🥉 #3 Username — Level 20 — 9,800 XP
  4. Username — Level 18 — ...
  ```
- Embed warna `#5865F2`
- Footer: "Reset tiap Senin 00:00 WIB" (untuk weekly)

### `src/jobs/weeklyReset.js`
Cron job reset weekly XP:

- Jalankan pakai `node-cron`: `cron.schedule('0 0 * * 1', ...)` — setiap Senin jam 00:00
- Query semua `userLevels` yang `weeklyXp > 0`
- Batch update: set `weeklyXp = 0`, `weeklyReset = serverTimestamp()`
- Log ke console: `✅ Weekly XP reset selesai — {count} users direset`
- Install dependency: `npm install node-cron`

### `src/utils/activityLogger.js`
Helper function untuk update `activityLogs`:

```js
// activityLogs/{guildId}_{userId}_{YYYY-MM-DD}
async function logActivity(db, guildId, userId, { messages = 0, voiceMinutes = 0, commands = 0 }) {
  const date = new Date().toISOString().split('T')[0];
  const docId = `${guildId}_${userId}_${date}`;
  await db.collection('activityLogs').doc(docId).set({
    guildId, userId, date,
    messageCount: admin.firestore.FieldValue.increment(messages),
    voiceMinutes: admin.firestore.FieldValue.increment(voiceMinutes),
    commandsUsed: admin.firestore.FieldValue.increment(commands),
  }, { merge: true });
}
module.exports = { logActivity };
```

---

## Modifikasi `src/index.js`

Tambahkan import dan jalankan cron job di bagian bawah, setelah `client.login`:

```js
const { startWeeklyReset } = require('./jobs/weeklyReset');
// Setelah client.login(...)
client.once('ready', () => {
  startWeeklyReset(client);
});
```

---

## Formula Level

```js
// XP → Level
function xpToLevel(xp) {
  return Math.floor(0.1 * Math.sqrt(xp));
}

// Level → XP minimum yang dibutuhkan
function levelToXp(level) {
  return Math.pow(level / 0.1, 2);
}
```

Contoh:
- Level 1 = 100 XP
- Level 5 = 2,500 XP
- Level 10 = 10,000 XP
- Level 20 = 40,000 XP

---

## Dependencies Baru

```bash
npm install node-cron
```

`canvas` sudah terinstall, tidak perlu install lagi.

---

## File yang Harus Dikembalikan

1. `src/index.js` (tambah cron job init)
2. `src/events/guildCreate.js` (tambah leveling defaults)
3. `src/events/messageCreate.js` (file baru)
4. `src/events/voiceStateUpdate.js` (file baru)
5. `src/commands/utility/rank.js` (file baru)
6. `src/commands/utility/leaderboard.js` (file baru)
7. `src/jobs/weeklyReset.js` (file baru)
8. `src/utils/activityLogger.js` (file baru)

---

## Yang TIDAK Boleh Diubah

- `src/commands/moderation/*` — semua file moderation
- `src/events/guildMemberAdd.js`
- `src/events/guildMemberRemove.js`
- `src/events/interactionCreate.js`
- `src/events/clientReady.js`
- `src/utils/welcomeCard.js`
- Command loader dan event loader di `index.js`
- Inisialisasi Firebase di `index.js`
