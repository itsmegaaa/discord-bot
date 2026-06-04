# Phase 3 — Security & Moderation+

## Context
Bot Discord gaming community, discord.js v14, Firebase Firestore via `client.db` dan `client.dbAdmin`.
Branch: `feature/phase3-security`
Buat plan dulu sebelum nulis code.

## Existing Structure (Jangan Diubah Kecuali Disebutkan)
- Semua file Phase 1 & Phase 2
- `src/events/messageCreate.js` — sudah ada XP logic + AFK + custom commands
- `src/commands/moderation/warn.js` — sudah ada, akan dipakai oleh auto mod

---

## Fitur yang Harus Dibuat

---

### 1. AUTO MODERATION

#### Behavior
Auto mod berjalan di `messageCreate.js` — tambahkan sebagai layer pertama sebelum XP logic.

**Urutan cek (jika salah satu trigger, langsung hapus pesan + warn otomatis):**

1. **Bad Words** — cek apakah pesan mengandung kata dari `automodConfigs.badWords` (case-insensitive, partial match)
2. **Anti-Link** — cek apakah pesan mengandung URL (`http://`, `https://`, `discord.gg/`)
   - Kecuali domain ada di `allowedDomains`
   - Kecuali user punya role yang ada di `bypassRoles`
3. **Anti-Mass Mention** — hitung jumlah mention `@user` dalam satu pesan
   - Jika melebihi `massMentionThreshold`, trigger
4. **Anti-Spam** — track pesan per user dalam sliding window 5 detik (in-memory Map)
   - Jika jumlah pesan dalam 5 detik melebihi `antiSpamThreshold`, trigger

**Saat trigger:**
1. Hapus pesan (`message.delete()`)
2. Auto-warn: panggil logic yang sama dengan `warn.js` — simpan ke `warnLogs` Firestore
3. Cek total warn user di guild ini:
   - Jika total warn >= `automodConfigs.autoTimeoutThreshold` → timeout user `automodConfigs.autoTimeoutDuration` menit
4. Kirim DM ke user: "Pesanmu dihapus karena melanggar aturan server: {alasan}"
5. Log ke `modLogChannelId` (embed merah, detail pelanggaran)

**Jangan trigger auto mod untuk:**
- Bot messages
- DM
- User dengan role di `bypassRoles`
- User dengan permission `ManageMessages` atau lebih tinggi

#### Slash Commands (Admin Only)
```
/automod enable
/automod disable
/automod badwords add kata:String
/automod badwords remove kata:String
/automod badwords list
/automod allowdomain add domain:String
/automod allowdomain remove domain:String
/automod settings
```

#### Firestore Schema
```js
// automodConfigs/{guildId}
{
  guildId: String,
  enabled: Boolean,               // default: false

  // Bad Words
  badWordsEnabled: Boolean,       // default: false
  badWords: Array,                // String[]

  // Anti-Spam
  antiSpamEnabled: Boolean,       // default: false
  antiSpamThreshold: Number,      // default: 5 (pesan per 5 detik)

  // Anti-Link
  antiLinkEnabled: Boolean,       // default: false
  allowedDomains: Array,          // String[] e.g. ["youtube.com", "discord.com"]

  // Anti-Mass Mention
  antiMassMentionEnabled: Boolean, // default: false
  massMentionThreshold: Number,    // default: 5

  // Auto Punishment
  autoTimeoutEnabled: Boolean,     // default: false
  autoTimeoutThreshold: Number,    // default: 3 (warn sebelum timeout)
  autoTimeoutDuration: Number,     // default: 10 (menit)

  // Bypass
  bypassRoles: Array,             // roleId[] yang exempt dari automod
}
```

#### Tambahan ke `guildConfigs`
```js
automodEnabled: Boolean,   // default: false — shortcut cek sebelum load automodConfigs
```

---

### 2. LOGGING SYSTEM

**Satu channel untuk semua log** (`modLogChannelId` di `guildConfigs`).

#### Events yang Di-log

**Message Events** (di `messageCreate.js` / event baru `messageUpdate.js`, `messageDelete.js`):
- Message edited: tampilkan konten sebelum & sesudah
- Message deleted: tampilkan konten yang dihapus (kalau ada di cache)

**Voice Events** (di `voiceStateUpdate.js` yang sudah ada — extend):
- Member join voice channel
- Member leave voice channel
- Member pindah voice channel

**Member Events** (extend `guildMemberAdd.js` & `guildMemberRemove.js`):
- Member join server: tampilkan akun dibuat kapan (flag akun baru < 7 hari)
- Member leave server: tampilkan role yang dimiliki saat leave

**Moderation Events** (extend command moderation yang sudah ada):
- Ban, kick, mute, warn sudah ada embed-nya — tambahkan forward ke `modLogChannelId`

**Role & Server Events** (event baru `guildMemberUpdate.js`):
- Role ditambah ke member
- Role dihapus dari member

#### Embed Format Log
Semua log embed menggunakan format konsisten:
```
Warna:
- Merah (#ED4245)   → destructive: ban, kick, delete, leave
- Kuning (#FEE75C)  → warning: warn, mute, edit
- Hijau (#57F287)   → positive: join, role added
- Abu (#95A5A6)     → neutral: voice activity

Fields wajib ada:
- User (mention + tag)
- Channel / Server (kalau relevan)
- Waktu (timestamp)
- Detail aksi
```

#### Slash Commands (Admin Only)
```
/logging channel set channel:#channel
/logging channel remove
/logging toggle message_edit on/off
/logging toggle message_delete on/off
/logging toggle voice on/off
/logging toggle member_join on/off
/logging toggle member_leave on/off
/logging toggle role_changes on/off
/logging toggle mod_actions on/off
/logging settings
```

#### Tambahan ke `guildConfigs`
```js
logChannelId: String,
logMessageEdit: Boolean,     // default: true
logMessageDelete: Boolean,   // default: true
logVoiceActivity: Boolean,   // default: false
logMemberJoin: Boolean,      // default: true
logMemberLeave: Boolean,     // default: true
logRoleChanges: Boolean,     // default: false
logModActions: Boolean,      // default: true
```

#### Helper Baru
Buat `src/utils/logger.js` — helper function untuk kirim log embed:
```js
async function sendLog(client, guildId, embed) {
  // Ambil logChannelId dari guildConfigs
  // Kirim embed ke channel tersebut
  // Kalau channel tidak ditemukan atau logChannelId null → silent fail
}
module.exports = { sendLog };
```

---

### 3. ANTI-RAID

#### Behavior
- Track join rate per guild menggunakan in-memory Map: `raidTracker.set(guildId, [timestamp, ...])`
- Di `guildMemberAdd.js` — tambahkan logic anti-raid:
  1. Push timestamp join ke array guild ini
  2. Filter array: buang timestamp yang lebih dari 10 detik yang lalu
  3. Jika jumlah join dalam 10 detik terakhir >= `raidThreshold`:
     - Set `raidMode.set(guildId, true)` in-memory
     - Kirim embed **RAID ALERT** ke `modLogChannelId` + mention `adminRoleId`
     - Embed merah dengan info: berapa join dalam berapa detik, list username yang baru join
  4. Kalau `raidMode` aktif untuk guild ini: flag member baru di log sebagai "⚠️ RAID MODE AKTIF"

- `/raid` commands untuk admin kelola raid mode manual:
```
/raid status          → cek apakah raid mode aktif
/raid lockdown on     → manual aktifkan raid mode (log semua join)
/raid lockdown off    → matikan raid mode
```

#### Firestore Schema
Tidak ada schema baru — tracking pakai in-memory Map, config masuk ke `guildConfigs`.

#### Tambahan ke `guildConfigs`
```js
antiRaidEnabled: Boolean,    // default: false
raidThreshold: Number,       // default: 10 (join per 10 detik)
adminRoleId: String,         // role yang di-mention saat raid terdeteksi
```

---

### 4. IP LOGGER PROTECTION

#### Behavior
- Di `messageCreate.js` — tambahkan cek domain setelah auto mod check
- Maintain static list domain IP logger yang dikenal di `src/utils/ipLoggerDomains.js`
- Jika pesan mengandung domain dari list tersebut:
  1. Hapus pesan
  2. Kirim DM ke user: "Link yang kamu kirim terdeteksi sebagai IP logger dan telah dihapus"
  3. Log ke `modLogChannelId`
  4. **Tidak auto-warn** (beda dari auto mod — bisa jadi user tidak tahu)

#### `src/utils/ipLoggerDomains.js`
```js
const IP_LOGGER_DOMAINS = [
  'grabify.link',
  'iplogger.org',
  'iplogger.co',
  '2no.co',
  'yip.su',
  'ps3cfw.com',
  'blasze.tk',
  'iplis.ru',
  '0x00.in',
  'gyazo.com.de',
  // tambahkan lebih banyak sesuai kebutuhan
];

module.exports = { IP_LOGGER_DOMAINS };
```

---

## Modifikasi File yang Sudah Ada

### `src/events/messageCreate.js`
Urutan logic baru (dari atas ke bawah):
1. Basic guard (bot, DM)
2. **IP Logger check** ← baru
3. **Auto Mod check** ← baru (bad words, anti-link, anti-spam, anti-mention)
4. AFK check (Phase 2)
5. Custom commands check (Phase 2)
6. XP logic (Phase 1)

### `src/events/guildMemberAdd.js`
Tambahkan:
1. **Anti-raid tracking** ← baru
2. **Logging: member join** ← baru (pakai `sendLog`)

### `src/events/guildMemberRemove.js`
Tambahkan:
1. **Logging: member leave** ← baru (pakai `sendLog`)

### `src/events/voiceStateUpdate.js`
Tambahkan:
1. **Logging: voice join/leave/move** ← baru (pakai `sendLog`)

### `src/events/guildCreate.js`
Tambahkan default config Phase 3:
```js
automodEnabled: false,
logChannelId: null,
logMessageEdit: true,
logMessageDelete: true,
logVoiceActivity: false,
logMemberJoin: true,
logMemberLeave: true,
logRoleChanges: false,
logModActions: true,
antiRaidEnabled: false,
raidThreshold: 10,
adminRoleId: null,
```

---

## File Baru yang Harus Dibuat

### Commands
1. `src/commands/moderation/automod.js`
2. `src/commands/moderation/logging.js`
3. `src/commands/moderation/raid.js`

### Events
4. `src/events/messageUpdate.js` — log pesan diedit
5. `src/events/messageDelete.js` — log pesan dihapus
6. `src/events/guildMemberUpdate.js` — log role changes

### Utils
7. `src/utils/logger.js` — helper sendLog
8. `src/utils/ipLoggerDomains.js` — static list domain

---

## File Dimodifikasi

9. `src/events/messageCreate.js`
10. `src/events/guildMemberAdd.js`
11. `src/events/guildMemberRemove.js`
12. `src/events/voiceStateUpdate.js`
13. `src/events/guildCreate.js`

---

## Yang TIDAK Boleh Diubah
- `src/commands/moderation/ban.js`, `kick.js`, `mute.js`, `warn.js`, `warns.js`, `purge.js`
- `src/commands/utility/*` semua file Phase 1 & 2
- `src/utils/welcomeCard.js`
- `src/utils/activityLogger.js`
- `src/jobs/weeklyReset.js`
- `src/jobs/birthdayChecker.js`
- `src/events/interactionCreate.js`
- `src/events/clientReady.js`
- Command loader, event loader, dan inisialisasi Firebase di `index.js`
