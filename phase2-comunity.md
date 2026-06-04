# Phase 2 — Community & Fun

## Context
Bot Discord gaming community, discord.js v14, Firebase Firestore via `client.db` dan `client.dbAdmin`.
Branch: `feature/phase2-community`
Buat plan dulu sebelum nulis code.

## Existing Structure (Jangan Diubah Kecuali Disebutkan)
- Semua file Phase 1 (leveling, rank, leaderboard, activityLogger, weeklyReset)
- Semua file moderation
- Semua events yang sudah ada

---

## Fitur yang Harus Dibuat

---

### 1. GIVEAWAY SYSTEM

#### Slash Commands
```
/giveaway start channel:#channel durasi:String hadiah:String winners:Integer
/giveaway end message_id:String
/giveaway reroll message_id:String
/giveaway list
```

#### Behavior
- `/giveaway start`:
  - Parse durasi dari string: `1h`, `30m`, `1d`, `7d` dll
  - Kirim embed ke channel yang dipilih dengan info hadiah, jumlah winner, waktu berakhir
  - Default join pakai **Button Component** ("🎉 Join Giveaway")
  - Simpan ke Firestore `giveaways/{guildId}_{messageId}`
  - Schedule auto-end pakai `setTimeout` (in-memory) — saat bot restart, cek giveaway aktif di Firestore dan re-schedule

- Auto-end saat waktu habis:
  - Ambil semua `participants` dari Firestore
  - Random pilih sejumlah `winnersCount` winner
  - Edit embed original: warna jadi abu-abu, tampilkan nama winner
  - Kirim pesan baru mention para winner
  - Set `ended: true` di Firestore

- `/giveaway end`: force end sebelum waktu habis
- `/giveaway reroll`: random pilih winner baru dari participants yang sama
- `/giveaway list`: tampilkan semua giveaway aktif di server ini

#### Firestore Schema
```js
// giveaways/{guildId}_{messageId}
{
  guildId: String,
  channelId: String,
  messageId: String,
  prize: String,
  winnersCount: Number,
  endsAt: Timestamp,
  hostId: String,
  ended: Boolean,
  winners: Array,         // userId[]
  participants: Array,    // userId[]
  joinType: String,       // "button" | "reaction" — default "button", bisa diubah via guildConfigs
}
```

#### Tambahan ke `guildConfigs`
```js
giveawayJoinType: String,   // "button" | "reaction", default: "button"
giveawayLogChannelId: String,
```

#### Re-schedule saat Bot Startup
Di `src/events/clientReady.js`, setelah bot ready:
- Query semua `giveaways` yang `ended: false` dan `endsAt > now`
- Re-schedule `setTimeout` untuk masing-masing

---

### 2. POLL SYSTEM

#### Slash Commands
```
/poll pertanyaan:String opsi1:String opsi2:String [opsi3:String] [opsi4:String] [durasi:String]
/poll end message_id:String
```

#### Behavior
- Kirim embed dengan tombol per opsi (maksimal 4 opsi = 4 buttons dalam 1 ActionRow)
- Tiap tombol label: opsi text + counter vote saat ini
- Satu user hanya bisa vote sekali — cek `voterIds` sebelum tambah vote
- Kalau user klik opsi yang sudah dipilih → toggle off (unvote)
- Update tombol secara real-time setiap ada vote (edit message)
- Auto-close saat durasi habis (opsional, kalau durasi tidak diisi = manual close)
- Saat close: edit embed tampilkan hasil final + persentase tiap opsi

#### Firestore Schema
```js
// polls/{guildId}_{messageId}
{
  guildId: String,
  channelId: String,
  messageId: String,
  question: String,
  options: Array,     // [{ label: String, votes: Number, voterIds: String[] }]
  endsAt: Timestamp,  // null kalau tidak ada durasi
  ended: Boolean,
  createdBy: String,
}
```

---

### 3. AFK SYSTEM

#### Slash Commands
```
/afk [alasan:String]
/afk remove
```

#### Behavior
- `/afk`: simpan status AFK user ke Firestore, rename user di server jadi `[AFK] username`
- Saat user yang AFK mengirim pesan: otomatis hapus status AFK, rename balik, kirim pesan "Welcome back, {user}! Kamu AFK selama X menit"
- Saat ada yang mention user yang AFK: bot reply "⚠️ {user} sedang AFK: {alasan} (sejak X menit lalu)"
- Cek mention di `messageCreate.js` yang sudah ada — tambahkan logic AFK di sana
- Rename pakai `member.setNickname()` — wrap dalam try/catch, kalau gagal (bot kurang permission) skip rename tapi AFK tetap aktif

#### Firestore Schema
```js
// afkUsers/{guildId}_{userId}
{
  guildId: String,
  userId: String,
  reason: String,
  since: Timestamp,
  originalNickname: String,
}
```

---

### 4. BIRTHDAY SYSTEM

#### Slash Commands
```
/birthday set hari:Integer bulan:Integer
/birthday remove
/birthday check [user:User]
/birthday list
```

#### Behavior
- Simpan tanggal lahir user ke Firestore
- Cron job harian jam 08:00 WIB (`0 8 * * *`) cek siapa yang ulang tahun hari ini
- Kalau ada:
  - Kirim embed ke `birthdayChannelId` mention user, warna pink `#FF6B9D`
  - Assign `birthdayRoleId` ke user (kalau diset)
  - Remove role setelah 24 jam pakai `setTimeout`

#### Firestore Schema
```js
// birthdays/{guildId}_{userId}
{
  guildId: String,
  userId: String,
  day: Number,
  month: Number,
}
```

#### Tambahan ke `guildConfigs`
```js
birthdayChannelId: String,
birthdayRoleId: String,
birthdayEnabled: Boolean,  // default: true
```

#### Job Baru
Buat `src/jobs/birthdayChecker.js` — cron job harian, dipanggil dari `index.js` sama seperti `weeklyReset`.

---

### 5. SHIP CALCULATOR

#### Slash Command
```
/ship user1:User user2:User
```

#### Behavior
- Generate persentase kecocokan 0–100% berdasarkan hash dari kedua userId (deterministik — hasil selalu sama untuk pasangan yang sama)
- Reply embed dengan:
  - Nama kedua user + persentase
  - Progress bar visual dari emoji ❤️
  - Komentar otomatis berdasarkan range:
    - 0–20: "Kayaknya ga cocok 😬"
    - 21–50: "Lumayan..."
    - 51–80: "Ada chemistry nih! 👀"
    - 81–100: "Jodoh banget! 💕"
- No Firestore, pure stateless

---

### 6. CUSTOM COMMANDS

#### Slash Commands
```
/cc add trigger:String response:String
/cc remove trigger:String
/cc list
/cc edit trigger:String response:String
```

#### Behavior
- Admin only (`PermissionFlagsBits.ManageGuild`)
- Simpan ke Firestore `customCommands/{guildId}_{trigger}`
- Di `messageCreate.js`: cek apakah pesan cocok dengan trigger yang ada
  - Prefix default `!` — user ketik `!rules` → bot reply response
  - Trigger case-insensitive
  - Cache custom commands per guild di in-memory Map, invalidate cache saat ada perubahan

#### Firestore Schema
```js
// customCommands/{guildId}_{trigger}
{
  guildId: String,
  trigger: String,
  response: String,
  createdBy: String,
  createdAt: Timestamp,
  updatedAt: Timestamp,
}
```

---

## Modifikasi File yang Sudah Ada

### `src/events/messageCreate.js` (dari Phase 1)
Tambahkan di bagian atas handler (sebelum XP logic):
1. Cek AFK: kalau user yang kirim pesan sedang AFK → hapus status AFK, rename balik
2. Cek mention: kalau pesan mention user yang AFK → reply notif AFK
3. Cek custom commands: kalau pesan mulai dengan `!` → cek `customCommands` cache

### `src/events/clientReady.js`
Tambahkan setelah bot ready:
1. Re-schedule semua giveaway aktif dari Firestore
2. Start birthday checker cron job

### `src/events/guildCreate.js`
Tambahkan default config Phase 2:
```js
giveawayJoinType: 'button',
giveawayLogChannelId: null,
birthdayChannelId: null,
birthdayRoleId: null,
birthdayEnabled: true,
```

### `src/index.js`
Tambahkan import birthday checker:
```js
const { startBirthdayChecker } = require('./jobs/birthdayChecker');
// panggil di dalam client.once('ready', ...)
```

---

## Semua Firestore Collections Phase 2

| Collection | Keterangan |
|------------|------------|
| `giveaways` | Data giveaway per guild |
| `polls` | Data poll per guild |
| `afkUsers` | Status AFK user per guild |
| `birthdays` | Tanggal lahir user per guild |
| `customCommands` | Custom command per guild |

---

## Dependencies Baru
Tidak ada — `node-cron` sudah diinstall di Phase 1.

---

## File yang Harus Dikembalikan

### File Baru
1. `src/commands/utility/giveaway.js`
2. `src/commands/utility/poll.js`
3. `src/commands/utility/afk.js`
4. `src/commands/utility/birthday.js`
5. `src/commands/utility/ship.js`
6. `src/commands/utility/cc.js`
7. `src/jobs/birthdayChecker.js`

### File Dimodifikasi
8. `src/events/messageCreate.js`
9. `src/events/clientReady.js`
10. `src/events/guildCreate.js`
11. `src/index.js`

---

## Yang TIDAK Boleh Diubah
- Semua file moderation (`ban.js`, `kick.js`, `mute.js`, `warn.js`, `warns.js`, `purge.js`)
- `src/events/guildMemberAdd.js`
- `src/events/guildMemberRemove.js`
- `src/events/interactionCreate.js`
- `src/utils/welcomeCard.js`
- `src/utils/activityLogger.js`
- `src/jobs/weeklyReset.js`
- `src/commands/utility/rank.js`
- `src/commands/utility/leaderboard.js`
- Command loader dan event loader di `index.js`
- Inisialisasi Firebase di `index.js`
