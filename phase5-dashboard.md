# Phase 5 — Web Dashboard

## Context
Dashboard web untuk Discord bot gaming community.
Bot sudah live di Railway dengan Express API internal.
Frontend dibangun terpisah dan di-deploy ke Vercel.
Branch: `feature/phase5-dashboard`
Buat plan dulu sebelum nulis code.

---

## Stack

| Layer | Teknologi |
|-------|-----------|
| Frontend | React + Vite + Tailwind CSS |
| Auth | Firebase Auth + Discord OAuth2 |
| Database | Firestore (sama dengan bot) |
| Bot API | Express yang sudah ada di bot (Railway) |
| Hosting Frontend | Vercel |
| Hosting Bot+API | Railway (sudah ada) |

---

## Design System

**Tema: Dark ala Discord**

```
Warna utama:
--bg-primary:    #1e1f22   ← sidebar
--bg-secondary:  #2b2d31   ← content area
--bg-tertiary:   #313338   ← card/input background
--bg-hover:      #35373c   ← hover state
--text-primary:  #f2f3f5
--text-secondary:#b5bac1
--text-muted:    #80848e
--accent:        #5865f2   ← Discord blurple, tombol utama
--accent-hover:  #4752c4
--danger:        #ed4245
--success:       #57f287
--warning:       #fee75c

Border: 1px solid rgba(255,255,255,0.06)
Border radius: 8px (card), 4px (input), 20px (pill/badge)
Font: Inter, system-ui, sans-serif
```

**Komponen UI yang harus konsisten di semua halaman:**
- `<Toggle />` — switch on/off custom, bukan HTML checkbox
- `<ChannelSelect />` — dropdown searchable, tampilkan ikon # atau 🔊
- `<RoleSelect />` — dropdown searchable, tampilkan warna role
- `<SaveButton />` — tombol simpan dengan loading state + toast sukses/gagal
- `<Card />` — container section dengan border subtle
- `<Badge />` — label kecil (enabled/disabled, premium, dll)

---

## Auth Flow

1. User buka dashboard → klik "Login with Discord"
2. Firebase Auth + Discord OAuth2 provider
3. Setelah login, fetch daftar guild user dari Discord API:
   `GET https://discord.com/api/users/@me/guilds`
   dengan header `Authorization: Bearer {discord_access_token}`
4. Filter guild: `(guild.permissions & 0x20) !== 0` (MANAGE_GUILD)
5. Fetch daftar guild yang sudah ada bot-nya dari:
   `GET {BOT_API_URL}/api/guilds` dengan header `x-api-secret`
6. Intersect keduanya → tampilkan hanya server yang user adalah admin DAN bot sudah ada
7. User pilih server → simpan `selectedGuildId` di React state/localStorage
8. Semua request API berikutnya pakai `guildId` tersebut

**Session management:**
- Firebase Auth handle token refresh otomatis
- Discord access token disimpan di Firebase Auth custom claims atau Firestore `sessions/{uid}`
- Kalau token expired → redirect ke login

---

## Folder Structure

```
discord-dashboard/
├── src/
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Toggle.jsx
│   │   │   ├── ChannelSelect.jsx
│   │   │   ├── RoleSelect.jsx
│   │   │   ├── SaveButton.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── Badge.jsx
│   │   │   └── Toast.jsx
│   │   ├── layout/
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Topbar.jsx
│   │   │   └── PageWrapper.jsx
│   │   └── shared/
│   │       ├── ServerSelector.jsx
│   │       └── LoadingSkeleton.jsx
│   ├── pages/
│   │   ├── Landing.jsx
│   │   ├── Login.jsx
│   │   ├── ServerList.jsx
│   │   └── dashboard/
│   │       ├── Welcome.jsx
│   │       ├── Leveling.jsx
│   │       ├── Moderation.jsx
│   │       ├── AutoMod.jsx
│   │       ├── Logging.jsx
│   │       ├── Giveaway.jsx
│   │       ├── Birthday.jsx
│   │       ├── CustomCommands.jsx
│   │       └── Insights.jsx
│   ├── hooks/
│   │   ├── useGuildConfig.js    ← fetch + save guildConfigs
│   │   ├── useChannels.js       ← fetch channel list dari bot API
│   │   ├── useRoles.js          ← fetch role list dari bot API
│   │   └── useAuth.js           ← Firebase Auth wrapper
│   ├── lib/
│   │   ├── firebase.js          ← Firebase init
│   │   ├── botApi.js            ← helper fetch ke Express bot API
│   │   └── discordApi.js        ← helper fetch ke Discord API
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── router/
│   │   └── index.jsx            ← React Router v6
│   ├── App.jsx
│   └── main.jsx
├── .env.local
├── vite.config.js
└── vercel.json
```

---

## Environment Variables (.env.local)

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_APP_ID=
VITE_DISCORD_CLIENT_ID=
VITE_BOT_API_URL=          # e.g. https://bot.railway.app
VITE_BOT_API_SECRET=       # shared secret untuk auth ke bot API
```

---

## Routing (React Router v6)

```
/                          → Landing.jsx (publik)
/login                     → Login.jsx (publik)
/servers                   → ServerList.jsx (auth required)
/dashboard/:guildId/welcome         → Welcome.jsx
/dashboard/:guildId/leveling        → Leveling.jsx
/dashboard/:guildId/moderation      → Moderation.jsx
/dashboard/:guildId/automod         → AutoMod.jsx
/dashboard/:guildId/logging         → Logging.jsx
/dashboard/:guildId/giveaway        → Giveaway.jsx
/dashboard/:guildId/birthday        → Birthday.jsx
/dashboard/:guildId/commands        → CustomCommands.jsx
/dashboard/:guildId/insights        → Insights.jsx
```

Route `/dashboard/*` harus:
1. Cek auth — kalau tidak login, redirect ke `/login`
2. Cek `guildId` valid — kalau tidak ada di daftar guild user, redirect ke `/servers`

---

## Sidebar Layout

```
┌─────────────────┐
│ 🤖 BotName      │  ← nama bot + avatar
│ ServerName  ▼   │  ← server selector dropdown
├─────────────────┤
│ 👋 Welcome      │
│ ⭐ Leveling     │
│ 🛡️ Moderation   │
│ 🤖 Auto Mod     │
│ 📋 Logging      │
│ 🎉 Giveaway     │
│ 🎂 Birthday     │
│ ⚙️ Commands     │
│ 📊 Insights     │
├─────────────────┤
│ 🔗 Invite Bot   │
│ 🚪 Logout       │
└─────────────────┘
```

Sidebar collapse ke icon-only di layar < 768px.

---

## Halaman Dashboard — Detail

### `/dashboard/:guildId/welcome`

**Fetch:** `GET /api/guilds/:guildId/config`

**Sections:**

**Welcome System**
- Toggle: Enable Welcome System
- `<ChannelSelect />` Welcome Channel
- Textarea: Welcome Message (hint variabel `{user}` `{server}` `{count}`)
- Toggle: Enable Welcome Card (gambar)
- Toggle: Enable Goodbye Message
- `<ChannelSelect />` Goodbye Channel
- Textarea: Goodbye Message

**Auto Role**
- Toggle: Enable Auto Role
- `<RoleSelect />` Role yang diberikan saat join

**Save button** → `POST /api/guilds/:guildId/config`

---

### `/dashboard/:guildId/leveling`

**Fetch:** `GET /api/guilds/:guildId/config`

**Sections:**

**XP Settings**
- Toggle: Enable Leveling
- Slider + input: XP per pesan (1–50, default 15)
- Slider + input: Cooldown detik (10–300, default 60)
- Toggle: Enable Voice XP
- Slider + input: XP per menit voice (1–20, default 5)
- `<ChannelSelect />` Level Up Notification Channel

**Role Rewards**
- Tabel dinamis: Level → Role
  - Tiap baris: input number (level) + `<RoleSelect />` + tombol hapus baris
  - Tombol "Add Role Reward" tambah baris baru
- Tampilkan baris yang sudah ada dari `levelRoles` array

**Danger Zone**
- Tombol "Reset All XP" — minta konfirmasi modal sebelum eksekusi
- `DELETE /api/guilds/:guildId/levels` → reset semua `userLevels` guild ini

---

### `/dashboard/:guildId/moderation`

**Fetch:** `GET /api/guilds/:guildId/config`

**Sections:**

**Mod Log**
- `<ChannelSelect />` Mod Log Channel
- Toggle grid per event: Log Bans, Log Kicks, Log Mutes, Log Warns

**Warn Management**
- Tabel: list semua warn aktif di server ini
  - Kolom: Username, Alasan, Moderator, Tanggal, Aksi (hapus)
- Fetch dari `GET /api/guilds/:guildId/warns`
- Tombol hapus per baris → `DELETE /api/guilds/:guildId/warns/:warnId`

---

### `/dashboard/:guildId/automod`

**Fetch:** `GET /api/guilds/:guildId/automod`

**Sections:**

**General**
- Toggle: Enable Auto Moderation

**Filters**
- Toggle: Bad Words Filter
  - Input tag: ketik kata → Enter → tambah ke list, klik X untuk hapus
- Toggle: Anti Spam
  - Input: Max pesan per 5 detik
- Toggle: Anti Link
  - Input tag: Allowed Domains (whitelist)
- Toggle: Anti Mass Mention
  - Input: Max mention per pesan

**Auto Punishment**
- Toggle: Auto Timeout setelah X warn
  - Input: Jumlah warn sebelum timeout
  - Input: Durasi timeout (menit)

**Bypass Roles**
- `<RoleSelect />` multiple — role yang exempt dari automod

**Save** → `POST /api/guilds/:guildId/automod`

---

### `/dashboard/:guildId/logging`

**Fetch:** `GET /api/guilds/:guildId/config`

**Sections:**

**Log Channel**
- `<ChannelSelect />` Log Channel

**Event Toggles** — grid 2 kolom:
- Message Edit
- Message Delete
- Voice Activity
- Member Join
- Member Leave
- Role Changes
- Mod Actions

**Save** → `POST /api/guilds/:guildId/config`

---

### `/dashboard/:guildId/giveaway`

**Fetch:** `GET /api/guilds/:guildId/giveaways`

**Sections:**

**Active Giveaways**
- List card per giveaway aktif:
  - Hadiah, channel, jumlah winner, waktu berakhir (countdown)
  - Tombol "End Early" → `POST /api/guilds/:guildId/giveaways/:id/end`
  - Tombol "Delete" → `DELETE /api/guilds/:guildId/giveaways/:id`

**Ended Giveaways**
- List card per giveaway selesai (7 hari terakhir):
  - Hadiah, winner names, tanggal selesai
  - Tombol "Reroll" → `POST /api/guilds/:guildId/giveaways/:id/reroll`

**Settings**
- Select: Default join type (Button / Reaction)
- `<ChannelSelect />` Giveaway Log Channel

---

### `/dashboard/:guildId/birthday`

**Fetch:** `GET /api/guilds/:guildId/birthdays`

**Sections:**

**Settings**
- Toggle: Enable Birthday System
- `<ChannelSelect />` Birthday Channel
- `<RoleSelect />` Birthday Role (sementara, 24 jam)

**Birthday List**
- Tabel: semua member yang sudah set birthday
  - Kolom: Username, Tanggal, Aksi (hapus)
- Fetch dari `GET /api/guilds/:guildId/birthdays`
- Upcoming birthdays section: yang ultah 7 hari ke depan

---

### `/dashboard/:guildId/commands`

**Fetch:** `GET /api/guilds/:guildId/custom-commands`

**Sections:**

**Custom Commands List**
- Tabel: Trigger, Response (truncated), Dibuat oleh, Tanggal
- Tombol edit per baris → inline edit form
- Tombol hapus per baris

**Add New Command**
- Input: Trigger (tanpa prefix, otomatis `!`)
- Textarea: Response
- Tombol Simpan → `POST /api/guilds/:guildId/custom-commands`

---

### `/dashboard/:guildId/insights`

**Fetch:** Multiple endpoint paralel (`Promise.all`)

**Sections:**

**Server Overview** — 4 stat cards sejajar:
- Total Pesan (minggu ini vs minggu lalu, + persentase)
- Member Aktif minggu ini
- Total Menit Voice
- Member Join vs Leave

**Top Members** — tabel top 10:
- Rank, avatar, username, pesan, voice menit, level
- Filter: week / month / alltime

**Channel Activity** — list channel paling ramai:
- Nama channel + bar visual relative ke channel terramai

**Hourly Activity** — heatmap teks:
- 24 jam dalam sehari, warna intensitas berdasarkan aktivitas
- Tampilkan sebagai grid 6×4 (4 blok 6 jam)

**Periode selector** di pojok kanan atas: Today / Week / Month

---

## Bot API Endpoints Baru yang Diperlukan

Tambahkan ke `src/api/server.js` di bot:

```
GET  /api/guilds                              → list semua guild yang ada bot-nya
GET  /api/guilds/:guildId/warns               → list semua warnLogs guild ini
DELETE /api/guilds/:guildId/warns/:warnId     → hapus satu warn
DELETE /api/guilds/:guildId/levels            → reset semua userLevels guild ini
GET  /api/guilds/:guildId/giveaways           → list giveaways (aktif + 7 hari terakhir)
POST /api/guilds/:guildId/giveaways/:id/end   → force end giveaway
POST /api/guilds/:guildId/giveaways/:id/reroll → reroll giveaway
DELETE /api/guilds/:guildId/giveaways/:id     → delete giveaway
GET  /api/guilds/:guildId/birthdays           → list semua birthdays guild ini
DELETE /api/guilds/:guildId/birthdays/:userId → hapus birthday user
GET  /api/guilds/:guildId/custom-commands     → list custom commands
POST /api/guilds/:guildId/custom-commands     → create custom command
PUT  /api/guilds/:guildId/custom-commands/:trigger → update custom command
DELETE /api/guilds/:guildId/custom-commands/:trigger → delete custom command
```

Semua endpoint harus:
- Validasi header `x-api-secret`
- Return JSON
- Handle error dengan status code yang tepat (404, 400, 500)

---

## `vercel.json`

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

SPA routing — semua path diarahkan ke `index.html` biar React Router yang handle.

---

## File yang Harus Dibuat

### Frontend (semua di `discord-dashboard/`)
1. `src/main.jsx`
2. `src/App.jsx`
3. `src/router/index.jsx`
4. `src/context/AuthContext.jsx`
5. `src/lib/firebase.js`
6. `src/lib/botApi.js`
7. `src/lib/discordApi.js`
8. `src/hooks/useAuth.js`
9. `src/hooks/useGuildConfig.js`
10. `src/hooks/useChannels.js`
11. `src/hooks/useRoles.js`
12. `src/components/ui/Toggle.jsx`
13. `src/components/ui/ChannelSelect.jsx`
14. `src/components/ui/RoleSelect.jsx`
15. `src/components/ui/SaveButton.jsx`
16. `src/components/ui/Card.jsx`
17. `src/components/ui/Badge.jsx`
18. `src/components/ui/Toast.jsx`
19. `src/components/layout/Sidebar.jsx`
20. `src/components/layout/Topbar.jsx`
21. `src/components/layout/PageWrapper.jsx`
22. `src/components/shared/ServerSelector.jsx`
23. `src/components/shared/LoadingSkeleton.jsx`
24. `src/pages/Landing.jsx`
25. `src/pages/Login.jsx`
26. `src/pages/ServerList.jsx`
27. `src/pages/dashboard/Welcome.jsx`
28. `src/pages/dashboard/Leveling.jsx`
29. `src/pages/dashboard/Moderation.jsx`
30. `src/pages/dashboard/AutoMod.jsx`
31. `src/pages/dashboard/Logging.jsx`
32. `src/pages/dashboard/Giveaway.jsx`
33. `src/pages/dashboard/Birthday.jsx`
34. `src/pages/dashboard/CustomCommands.jsx`
35. `src/pages/dashboard/Insights.jsx`
36. `vite.config.js`
37. `vercel.json`
38. `tailwind.config.js`
39. `package.json`

### Bot (tambahan di repo bot yang sudah ada)
40. `src/api/server.js` — tambah endpoint baru yang disebutkan di atas

---

## Yang TIDAK Boleh Diubah di Bot
- Semua file event, command, utils, jobs yang sudah ada
- Inisialisasi Firebase dan Discord client di `index.js`
- Firestore schema yang sudah ada

---

## Catatan Penting untuk Codex

1. **CORS** — Express bot harus set CORS header yang allow origin dari Vercel domain lo. Tambahkan di `src/api/server.js`:
   ```js
   const cors = require('cors');
   app.use(cors({ origin: process.env.DASHBOARD_URL }));
   ```

2. **Discord OAuth2 token** — Discord access token dari Firebase Auth harus di-pass ke Discord API untuk fetch guild list. Pastiin scope OAuth2 mencakup `identify` dan `guilds`.

3. **Loading skeleton** — setiap halaman harus tampilkan skeleton loader saat data sedang di-fetch, bukan halaman kosong atau spinner penuh.

4. **Optimistic UI** — saat user klik Save, langsung update UI dulu baru tunggu response API. Kalau API error, rollback ke nilai sebelumnya.

5. **Mobile sidebar** — di layar < 768px, sidebar collapse. Hamburger menu di topbar untuk toggle.

6. **`npm install`** — dependencies yang diperlukan:
   ```
   react react-dom react-router-dom
   firebase
   tailwindcss autoprefixer postcss
   @headlessui/react        ← untuk dropdown/modal accessible
   lucide-react             ← icons
   ```
