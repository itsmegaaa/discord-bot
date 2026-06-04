# Discord Bot — Feature Roadmap
> Komunitas Gaming · 800+ Member · discord.js v14 · Firebase Firestore · React Vite Dashboard

---

## Status Saat Ini ✅
Fitur yang sudah selesai dibangun:
- Welcome System + Auto Role + Goodbye Message
- Moderation: `/ban` `/kick` `/mute` `/warn` `/warns` `/purge`
- Firebase Admin + `client.db` + `client.dbAdmin` sudah terpasang
- Firestore collections aktif: `guildConfigs`, `warnLogs`

---

## ⚠️ Pondasi — Harus Dijaga Setiap Phase

Sebelum mulai phase apapun, pastikan aturan ini selalu diikuti:

1. **Semua config per-server masuk ke `guildConfigs/{guildId}`** — jangan buat collection config terpisah per fitur
2. **Schema Firestore konsisten** — field names snake_case, semua timestamp pakai `client.dbAdmin.firestore.FieldValue.serverTimestamp()`
3. **Akses Firestore selalu via `client.db`** — jangan `require('firebase-admin')` langsung di event/command file
4. **Express API selalu up-to-date** — setiap fitur baru yang punya config, tambahkan endpoint GET/POST-nya

---

## Phase 1 — Engagement Core
> Target: bikin member aktif dan kompetitif

### Fitur
| Fitur | Deskripsi |
|-------|-----------|
| **Leveling & XP** | XP tiap kirim pesan, naik level otomatis, cooldown per pesan |
| **Rank Card** | `/rank` generate gambar rank card via canvas |
| **Leaderboard** | `/leaderboard` top 10 XP, bisa filter weekly/monthly |
| **Role Reward** | Auto-assign role saat capai level tertentu, config via `guildConfigs` |
| **Voice XP** | User dapet XP selama aktif di voice channel |
| **Activity Logger** | Mulai catat aktivitas ke `activityLogs` — dipakai di Phase 4 & 5 |

### Firestore Collections Baru
```js
// userLevels/{guildId}_{userId}
{
  guildId: String,
  userId: String,
  xp: Number,
  level: Number,
  totalMessages: Number,
  voiceMinutes: Number,
  lastMessageAt: Timestamp,
  weeklyXp: Number,
  weeklyReset: Timestamp,
}

// activityLogs/{guildId}_{userId}_{date}
{
  guildId: String,
  userId: String,
  date: String,         // "2025-06-01"
  messageCount: Number,
  voiceMinutes: Number,
  commandsUsed: Number,
}
```

### Tambahan ke `guildConfigs`
```js
levelingEnabled: Boolean,
xpPerMessage: Number,       // default: 15
xpCooldownSeconds: Number,  // default: 60
levelUpChannelId: String,
levelRoles: Array,          // [{ level: 5, roleId: "..." }, ...]
voiceXpEnabled: Boolean,
voiceXpPerMinute: Number,   // default: 5
```

### Express API Baru
```
GET  /api/guilds/:guildId/leaderboard   → top 20 userLevels
GET  /api/guilds/:guildId/user/:userId  → data level user
```

---

## Phase 2 — Community & Fun
> Target: interaksi antar member makin seru

### Fitur
| Fitur | Deskripsi |
|-------|-----------|
| **Giveaway** | `/giveaway start` timer + jumlah winner, `/giveaway reroll` |
| **Poll System** | `/poll` multiple choice, hasil persentase, auto-close |
| **AFK System** | `/afk [alasan]` — bot auto-reply kalau user di-mention |
| **Birthday System** | `/birthday set` — auto ucapin HBD + role sementara |
| **Ship Calculator** | `/ship @user1 @user2` — fun command, no DB |
| **Custom Commands** | Admin buat command custom via dashboard |

### Firestore Collections Baru
```js
// giveaways/{guildId}_{messageId}
{
  guildId, channelId, messageId,
  prize: String,
  winnersCount: Number,
  endsAt: Timestamp,
  hostId: String,
  ended: Boolean,
  winners: Array,
  participants: Array,
}

// polls/{guildId}_{messageId}
{
  guildId, channelId, messageId,
  question: String,
  options: Array,     // [{ label, votes, voterIds }]
  endsAt: Timestamp,
  ended: Boolean,
}

// afkUsers/{guildId}_{userId}
{
  guildId, userId,
  reason: String,
  since: Timestamp,
}

// birthdays/{guildId}_{userId}
{
  guildId, userId,
  day: Number,
  month: Number,
}

// customCommands/{guildId}_{trigger}
{
  guildId,
  trigger: String,
  response: String,
  createdBy: String,
  createdAt: Timestamp,
}
```

### Tambahan ke `guildConfigs`
```js
birthdayChannelId: String,
birthdayRoleId: String,
giveawayLogChannelId: String,
```

---

## Phase 3 — Security & Moderation+
> Target: server aman dari raid, spam, dan konten berbahaya

### Fitur
| Fitur | Deskripsi |
|-------|-----------|
| **Auto Moderation** | Filter kata kasar, anti-spam, anti-link, anti-mention massal |
| **Logging System** | Log message edit/delete, voice join/leave, role changes, ban/kick |
| **Anti-Raid** | Deteksi join massal → auto-lockdown → notif admin |
| **IP Logger Protection** | Deteksi & hapus link domain grabify, iplogger, dll |

### Firestore Collections Baru
```js
// automodConfigs/{guildId}
{
  guildId,
  enabled: Boolean,
  badWords: Array,
  antiSpam: Boolean,
  antiSpamThreshold: Number,    // max pesan per 5 detik
  antiLink: Boolean,
  allowedDomains: Array,
  antiMassMention: Boolean,
  massMentionThreshold: Number,
  antiRaid: Boolean,
  raidThreshold: Number,        // max join per 10 detik
  raidAction: String,           // "lockdown" | "kick" | "ban"
  logChannelId: String,
}
```

### Tambahan ke `guildConfigs`
```js
logChannelId: String,
logMessageEdit: Boolean,
logMessageDelete: Boolean,
logVoiceActivity: Boolean,
logRoleChanges: Boolean,
logMemberJoinLeave: Boolean,
logModActions: Boolean,
```

### Express API Baru
```
GET  /api/guilds/:guildId/automod     → return automodConfigs
POST /api/guilds/:guildId/automod     → update automodConfigs
```

---

## Phase 4 — Analytics & Media
> Target: insight server + konten visual

### Fitur
| Fitur | Deskripsi |
|-------|-----------|
| **Member Insights** | Siapa paling aktif, jam ramai, channel tersibuk — dari `activityLogs` |
| **Image Generator** | Rank card custom, kartu profil — extend dari welcome card |

### Express API Baru
```
GET  /api/guilds/:guildId/insights/activity    → agregat activityLogs
GET  /api/guilds/:guildId/insights/popular     → channel & jam tersibuk
GET  /api/guilds/:guildId/insights/members     → top active members
```

> Catatan: `activityLogs` sudah mulai dicollect sejak Phase 1, jadi data sudah ada saat Phase 4 dibangun.

---

## Phase 5 — Web Dashboard
> Target: admin bisa setting semua fitur tanpa sentuh kode

### Stack
| Layer | Teknologi |
|-------|-----------|
| Frontend | React + Vite + Tailwind CSS |
| Auth | Firebase Auth + Discord OAuth2 |
| Database | Firestore (sama dengan bot) |
| Bot API | Express (sudah dibangun bertahap per phase) |
| Hosting | Vercel (frontend) + Railway (bot + Express) |

### Halaman Dashboard
| Route | Isi |
|-------|-----|
| `/` | Landing page — fitur bot, tombol invite, login |
| `/dashboard` | Daftar server yang bisa dikelola |
| `/dashboard/:guildId/welcome` | Setting welcome/goodbye/auto-role |
| `/dashboard/:guildId/leveling` | Setting XP, cooldown, role rewards |
| `/dashboard/:guildId/moderation` | Setting mod-log, warn, ban |
| `/dashboard/:guildId/automod` | Setting auto-mod, anti-raid, filter kata |
| `/dashboard/:guildId/logging` | Toggle log tiap event |
| `/dashboard/:guildId/giveaway` | Lihat & kelola giveaway aktif |
| `/dashboard/:guildId/birthday` | Setting channel & role birthday |
| `/dashboard/:guildId/commands` | Kelola custom commands |
| `/dashboard/:guildId/insights` | Grafik aktivitas, member aktif, jam ramai |

### Auth Flow
1. User klik "Login with Discord" → Firebase Auth + Discord OAuth2
2. Fetch daftar guild user dari Discord API
3. Filter guild dengan permission `MANAGE_GUILD`
4. Filter lagi — hanya tampilkan guild yang bot-nya sudah ada
5. User pilih server → masuk ke halaman setting

### Aturan Keamanan Firestore Rules
```
- User hanya bisa baca/tulis `guildConfigs/{guildId}` kalau mereka admin di guild tersebut
- `userLevels`, `warnLogs`, `activityLogs` — read only dari dashboard
- `automodConfigs` — write hanya dari bot (via Express) atau admin guild
```

---

## Ringkasan Semua Firestore Collections

| Collection | Mulai Dipakai | Akses Dashboard |
|------------|---------------|-----------------|
| `guildConfigs` | ✅ Sudah ada | Read + Write |
| `warnLogs` | ✅ Sudah ada | Read only |
| `userLevels` | Phase 1 | Read only |
| `activityLogs` | Phase 1 | Read only |
| `giveaways` | Phase 2 | Read only |
| `polls` | Phase 2 | Read only |
| `afkUsers` | Phase 2 | Read only |
| `birthdays` | Phase 2 | Read + Write |
| `customCommands` | Phase 2 | Read + Write |
| `automodConfigs` | Phase 3 | Read + Write |

---

## Timeline Ringkas

```
Sekarang   →  Selesaikan fix dari code review (ban, warn, guildCreate, dll)
Phase 1    →  Leveling & XP + Voice XP + Activity Logger
Phase 2    →  Giveaway, Poll, AFK, Birthday, Ship, Custom Commands
Phase 3    →  Auto Mod, Logging System, Anti-Raid, IP Logger
Phase 4    →  Member Insights, Image Generator
Phase 5    →  Web Dashboard (bisa mulai paralel dari Phase 3)
```
