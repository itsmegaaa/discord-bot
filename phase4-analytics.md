# Phase 4 — Analytics & Media

## Context
Bot Discord gaming community, discord.js v14, Firebase Firestore via `client.db` dan `client.dbAdmin`.
Branch: `feature/phase4-analytics`
Buat plan dulu sebelum nulis code.

## Existing Structure (Jangan Diubah Kecuali Disebutkan)
- Semua file Phase 1, 2, 3
- `src/utils/activityLogger.js` — sudah mencatat `activityLogs` sejak Phase 1
- `src/utils/welcomeCard.js` — canvas sudah tersedia
- `src/commands/utility/rank.js` — rank card canvas sudah ada di Phase 1

---

## Fitur yang Harus Dibuat

---

### 1. MEMBER INSIGHTS

#### Behavior
Insights ditampilkan sebagai **embed teks di Discord** — data mentah untuk dashboard web nanti.
Tidak ada grafik gambar di Discord, cukup angka dan tabel teks.

#### Slash Commands
```
/insights server [periode:String]     → statistik keseluruhan server
/insights member [user:User]          → statistik individual member
/insights topmembers [periode:String] → top 10 member paling aktif
/insights channels                    → channel paling ramai
/insights hours                       → jam tersibuk dalam sehari
```

**Option `periode`:** `today` | `week` (default) | `month` | `alltime`

#### `/insights server`
Embed fields:
- Total pesan minggu ini vs minggu lalu (+ persentase naik/turun)
- Total member aktif (yang kirim minimal 1 pesan)
- Total menit di voice channel
- Jam tersibuk hari ini
- Channel paling ramai minggu ini

#### `/insights member [user]`
Embed fields:
- Total pesan (alltime + periode ini)
- Total menit voice (alltime + periode ini)
- Level & XP (dari `userLevels`)
- Rata-rata pesan per hari
- Hari paling aktif dalam seminggu terakhir
- Pertama kali aktif (tanggal pertama ada di `activityLogs`)

#### `/insights topmembers`
List 10 member dengan `messageCount` tertinggi dalam periode yang dipilih.
Format embed:
```
🥇 #1 Username — 342 pesan · 120 menit voice
🥈 #2 Username — 289 pesan · 45 menit voice
...
```

#### `/insights channels`
Query `activityLogs` — tapi ini butuh tracking per channel.
**Catatan:** `activityLogs` saat ini hanya track per user, bukan per channel.
Untuk channel insights, tambahkan collection baru `channelLogs`.

#### `/insights hours`
Tampilkan distribusi aktivitas per jam (00:00–23:00) dalam 7 hari terakhir.
Format: tabel teks ASCII sederhana di embed.
```
00:00 ██░░░░░░░░  12 pesan
01:00 █░░░░░░░░░   6 pesan
...
12:00 ████████░░  89 pesan
```

#### Firestore Collections Baru
```js
// channelLogs/{guildId}_{channelId}_{YYYY-MM-DD}
{
  guildId: String,
  channelId: String,
  date: String,         // "2025-06-01"
  messageCount: Number,
  hourlyBuckets: Array, // [0,0,12,5,...] — 24 elemen, index = jam
}

// serverStats/{guildId}_{YYYY-MM-DD}
{
  guildId: String,
  date: String,
  totalMessages: Number,
  totalVoiceMinutes: Number,
  uniqueActiveMembers: Number,
  memberJoins: Number,
  memberLeaves: Number,
}
```

#### Modifikasi `src/utils/activityLogger.js`
Extend `logActivity()` untuk juga update:
1. `channelLogs/{guildId}_{channelId}_{date}` — increment `messageCount` dan `hourlyBuckets[currentHour]`
2. `serverStats/{guildId}_{date}` — increment `totalMessages` atau `totalVoiceMinutes`

Signature baru:
```js
async function logActivity(db, dbAdmin, guildId, userId, channelId, activity) {
  // activity: { messages, voiceMinutes, commands }
}
```

**Perhatian:** Update signature ini berarti semua caller di `messageCreate.js` dan `voiceStateUpdate.js` harus diupdate juga — tambahkan `channelId` sebagai parameter.

#### Express API Endpoints (untuk Dashboard Phase 5)
```
GET /api/guilds/:guildId/insights/summary?periode=week
GET /api/guilds/:guildId/insights/members?periode=week&limit=10
GET /api/guilds/:guildId/insights/channels?periode=week
GET /api/guilds/:guildId/insights/hours?days=7
GET /api/guilds/:guildId/insights/server-stats?days=30
```

---

### 2. IMAGE GENERATOR

#### A. Rank Card (Upgrade dari Phase 1)
Upgrade `src/commands/utility/rank.js` — tambahkan opsi style:

```
/rank [user:User] [style:String]
```

**Option `style`:** `default` | `minimal` | `dark`

Perbedaan style:
- `default` — sudah ada dari Phase 1 (dark gradient + progress bar)
- `minimal` — background putih/abu muda, font gelap, clean
- `dark` — full hitam, aksen warna sesuai level (hijau/biru/ungu/emas)

Warna ring avatar sesuai level (sudah ada di Phase 1):
- Level < 10: `#57F287` hijau
- Level < 20: `#5865F2` biru
- Level < 30: `#9B59B6` ungu
- Level >= 30: `#F1C40F` emas

#### B. Profile Card (Baru)
```
/profile [user:User]
```

Canvas 800x400px — lebih besar dari rank card karena lebih banyak info.

**Layout:**
```
┌─────────────────────────────────────────┐
│  [AVATAR 120px]  Username               │
│                  Joined: 12 Jan 2024    │
│                  Level 15 · 8,500 XP    │
├─────────────────────────────────────────┤
│  📨 342 Pesan    🎙️ 120 Menit Voice     │
│  ⚠️ 0 Warn       🏆 Rank #5 di Server   │
├─────────────────────────────────────────┤
│  [BADGES ROW]                           │
│  🎮 Gamer  🎂 Ultah  ⭐ Top Member      │
└─────────────────────────────────────────┘
```

**Badges otomatis berdasarkan kondisi:**
| Badge | Kondisi |
|-------|---------|
| 🎮 Veteran | Member server > 1 tahun |
| ⭐ Top Member | Rank #1-3 di leaderboard |
| 🎂 Ulang Tahun | Hari ini ulang tahunnya |
| 🛡️ Moderator | Punya permission ManageMessages |
| 👑 Admin | Punya permission Administrator |
| 💬 Chatter | Total pesan > 1000 |
| 🎙️ Voice Master | Total voice > 1000 menit |
| ⚡ Level Up | Naik level dalam 24 jam terakhir |

**Data yang dibutuhkan:**
- `userLevels/{guildId}_{userId}` — XP, level, totalMessages, voiceMinutes
- `warnLogs` — hitung total warn user
- `birthdays/{guildId}_{userId}` — cek ulang tahun
- `member.joinedAt` — dari Discord API langsung

#### Background Profile Card
- Default: dark gradient sama seperti welcome card
- Simpan preference style di `userProfiles` collection (opsional, bisa skip dulu)

#### Firestore Schema Baru (Opsional)
```js
// userProfiles/{guildId}_{userId}
{
  guildId: String,
  userId: String,
  rankCardStyle: String,   // "default" | "minimal" | "dark"
  profileBio: String,      // max 100 karakter, set via /setbio
  updatedAt: Timestamp,
}
```

Tambahkan command:
```
/setbio teks:String    → simpan bio ke userProfiles
```

---

## Modifikasi File yang Sudah Ada

### `src/utils/activityLogger.js`
- Tambah parameter `channelId`
- Tambah update `channelLogs` dan `serverStats`

### `src/events/messageCreate.js`
- Update pemanggilan `logActivity()` — tambahkan `message.channelId`

### `src/events/voiceStateUpdate.js`
- Update pemanggilan `logActivity()` — tambahkan `channelId` dari voice channel

### `src/commands/utility/rank.js`
- Tambah option `style`
- Implement tiga style canvas

### `src/events/guildMemberAdd.js`
- Update `serverStats`: increment `memberJoins`

### `src/events/guildMemberRemove.js`
- Update `serverStats`: increment `memberLeaves`

---

## File Baru yang Harus Dibuat

### Commands
1. `src/commands/utility/insights.js` — semua subcommand insights
2. `src/commands/utility/profile.js` — profile card
3. `src/commands/utility/setbio.js` — set bio (opsional)

### API
4. `src/api/routes/insights.js` — Express routes untuk dashboard

---

## File Dimodifikasi

5. `src/utils/activityLogger.js`
6. `src/events/messageCreate.js`
7. `src/events/voiceStateUpdate.js`
8. `src/events/guildMemberAdd.js`
9. `src/events/guildMemberRemove.js`
10. `src/commands/utility/rank.js`
11. `src/api/server.js` — daftarkan routes insights baru

---

## Yang TIDAK Boleh Diubah
- Semua file moderation
- `src/commands/utility/giveaway.js`, `poll.js`, `afk.js`, `birthday.js`, `ship.js`, `cc.js`
- `src/commands/utility/leaderboard.js`
- `src/utils/welcomeCard.js`
- `src/utils/logger.js`
- `src/utils/ipLoggerDomains.js`
- `src/jobs/weeklyReset.js`
- `src/jobs/birthdayChecker.js`
- `src/events/interactionCreate.js`
- `src/events/clientReady.js`
- Command loader, event loader, inisialisasi Firebase di `index.js`

---

## Catatan Penting untuk Codex

1. **`activityLogger.js` signature berubah** — pastikan semua caller diupdate serentak, jangan ada yang masih pakai signature lama

2. **Profile card butuh banyak Firestore read** — implementasi harus pakai `Promise.all()` untuk parallel fetch, bukan sequential await satu-satu

3. **Canvas font** — tetap pakai `Arial` (sama seperti Phase 1), jangan introduce font baru

4. **Express API routes** — semua endpoint insights harus ada validasi `guildId` dan auth header `x-api-secret` sama seperti routes yang sudah ada
