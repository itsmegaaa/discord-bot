# ABNRML Bot Documentation

Dokumentasi resmi untuk **ABNRML Bot**, bot Discord multifungsi untuk membantu pengelolaan komunitas, moderasi, automasi, engagement, dan insight server melalui web dashboard.

**Created & Developed by Rivaldy Taufikqul Hakim**

---

## 1. Overview

ABNRML Bot dibuat untuk membantu admin dan moderator mengelola server Discord dengan lebih rapi, cepat, dan terpusat.

Bot ini mendukung beberapa fitur utama:

- Welcome dan goodbye system
- Auto role untuk member baru
- Leveling dan XP system
- Voice XP
- Role reward berdasarkan level
- Moderation tools
- AutoMod filter
- Logging server
- Giveaway management
- Birthday reminder
- Custom commands
- Web dashboard
- Server insights dan statistik aktivitas

Dashboard utama:

```txt
https://discord-bot-eta-ten.vercel.app
```

Backend API:

```txt
https://discord-bot-production-2e68.up.railway.app
```

---

## 2. Quick Start

### 2.1 Invite Bot ke Server

Gunakan OAuth2 invite link bot dari Discord Developer Portal atau link invite yang sudah dibuat oleh owner bot.

Format invite:

```txt
https://discord.com/oauth2/authorize?client_id=1511121737688023120&permissions=8&scope=bot+applications.commands
```

Keterangan:

- `client_id`: Application ID bot
- `permissions=8`: Administrator permission
- `scope=bot+applications.commands`: Mengundang bot dan mengaktifkan slash commands

Catatan: permission Administrator paling mudah untuk setup awal. Setelah bot stabil, permission bisa dipersempit sesuai kebutuhan server.

### 2.2 Syarat Admin Server

Akun Discord yang digunakan untuk login dashboard harus punya permission:

```txt
Manage Server
```

Jika akun tidak punya permission tersebut, server tidak akan muncul di dashboard.

### 2.3 Login Dashboard

1. Buka dashboard.
2. Klik **Login with Discord**.
3. Authorize akses Discord.
4. Pilih server yang ingin dikonfigurasi.
5. Masuk ke halaman dashboard server.

---

## 3. Required Bot Permissions

Agar semua fitur berjalan normal, bot membutuhkan permission berikut:

### Permission umum

- View Channels
- Send Messages
- Embed Links
- Attach Files
- Read Message History
- Use Slash Commands

### Welcome dan goodbye

- View Channels
- Send Messages
- Embed Links
- Attach Files

### Auto role

- Manage Roles

Catatan penting: role bot harus berada di atas role yang ingin diberikan otomatis. Kalau role bot lebih rendah, Discord akan menolak aksi tersebut. Klasik, hierarki digital tetap saja feodal.

### Moderation

- Moderate Members
- Kick Members
- Ban Members
- Manage Messages
- View Audit Log

### AutoMod

- Manage Messages
- Moderate Members
- View Channels
- Send Messages

### Giveaway

- Send Messages
- Embed Links
- Add Reactions
- Read Message History

### Logging

- View Audit Log
- View Channels
- Send Messages
- Embed Links

---

## 4. Dashboard Guide

Dashboard adalah pusat konfigurasi bot. Fitur dashboard hanya bisa diakses oleh user yang login Discord dan punya permission **Manage Server** di server target.

### 4.1 Select Server

Halaman ini menampilkan server Discord yang memenuhi syarat:

1. Bot sudah ada di server.
2. Server sudah tercatat di database bot.
3. User yang login punya permission **Manage Server**.

Jika server tidak muncul, cek bagian **Troubleshooting**.

---

## 5. Welcome System

Welcome System digunakan untuk menyambut member baru dan mengirim pesan ketika member keluar.

### Fitur

- Enable/disable welcome system
- Pilih welcome channel
- Custom welcome message
- Enable/disable welcome card
- Pilih goodbye channel
- Custom goodbye message
- Auto role untuk member baru

### Contoh Welcome Message

```txt
Welcome {user} to {server}! Kamu adalah member ke-{count}. Jangan lupa baca rules ya.
```

### Placeholder yang disarankan

```txt
{user}    = mention user
{server}  = nama server
{count}   = jumlah member
```

Catatan: pastikan implementasi bot memang mendukung placeholder tersebut. Jika belum, placeholder bisa ditambahkan di handler welcome event.

### Tips Setup

- Buat channel khusus seperti `#welcome`.
- Pastikan bot punya permission Send Messages di channel tersebut.
- Jika menggunakan welcome card, pastikan bot punya permission Attach Files.
- Untuk auto role, pastikan role bot lebih tinggi dari role yang diberikan.

---

## 6. Leveling System

Leveling System digunakan untuk memberi XP kepada member berdasarkan aktivitas pesan dan voice.

### Fitur

- Enable/disable leveling
- Enable/disable voice XP
- Set XP per message
- Set cooldown XP
- Set voice XP per minute
- Pilih level up channel
- Role reward berdasarkan level
- Reset semua XP

### Rekomendasi Config Awal

```txt
XP per message: 15
Cooldown: 60 seconds
Voice XP per minute: 5
```

### Role Reward

Role reward memungkinkan bot memberikan role ketika member mencapai level tertentu.

Contoh:

```txt
Level 5  → Active Member
Level 10 → Regular
Level 20 → Veteran
```

### Tips

- Jangan set XP terlalu besar jika server ramai.
- Gunakan cooldown agar member tidak spam chat demi XP.
- Role reward sebaiknya dibuat bertahap agar engagement lebih natural.

---

## 7. Moderation

Moderation membantu admin dan moderator mengelola pelanggaran member.

### Fitur

- Mod log channel
- Warn management
- Delete warning
- Integrasi dengan data warn logs

### Mod Log

Pilih channel khusus untuk menyimpan catatan moderation.

Contoh channel:

```txt
#mod-log
#staff-log
#moderation-log
```

### Tips

- Channel mod log sebaiknya hanya bisa dilihat staff.
- Jangan campur mod log dengan general logging agar tidak berantakan.
- Gunakan nama channel yang jelas supaya staff tidak main tebak-tebakan seperti debug tengah malam.

---

## 8. AutoMod

AutoMod membantu memfilter perilaku yang mengganggu secara otomatis.

### Fitur

- Enable/disable AutoMod
- Bad words filter
- Anti spam
- Anti link
- Anti mass mention
- Auto timeout
- Bypass roles

### Bad Words Filter

Masukkan daftar kata yang ingin diblokir, dipisahkan koma.

Contoh:

```txt
kata1, kata2, kata3
```

### Anti Spam

Gunakan threshold untuk membatasi spam pesan.

Contoh:

```txt
Anti spam threshold: 5
```

Artinya, user yang mengirim pesan terlalu cepat/melebihi batas bisa terkena tindakan sesuai konfigurasi bot.

### Anti Link

Gunakan fitur ini untuk memblokir link yang tidak diizinkan.

Allowed domains contoh:

```txt
youtube.com, discord.com, github.com
```

### Anti Mass Mention

Mencegah user melakukan mention massal.

Contoh threshold:

```txt
Mass mention threshold: 5
```

### Auto Timeout

Jika aktif, bot bisa memberi timeout otomatis setelah user melanggar threshold tertentu.

Contoh:

```txt
Auto timeout threshold: 3
Auto timeout duration: 10 minutes
```

### Bypass Roles

Role yang masuk bypass tidak akan terkena filter AutoMod.

Contoh bypass role:

```txt
Admin
Moderator
Trusted Member
```

---

## 9. Logging

Logging mencatat aktivitas penting di server.

### Event yang bisa dicatat

- Message edit
- Message delete
- Voice activity
- Member join
- Member leave
- Role changes
- Moderation actions

### Setup

1. Buat channel `#server-log`.
2. Pastikan hanya staff yang bisa melihat channel.
3. Pilih channel tersebut di dashboard.
4. Aktifkan event log yang dibutuhkan.

### Tips

- Jangan aktifkan semua log jika server sangat ramai, kecuali memang butuh.
- Pisahkan mod log dan server log jika ingin lebih rapi.
- Gunakan channel private agar data aktivitas tidak terlihat semua member.

---

## 10. Giveaway

Giveaway membantu admin membuat dan mengelola event hadiah.

### Fitur

- Join giveaway via button atau reaction
- Giveaway log channel
- Melihat giveaway aktif
- Melihat giveaway selesai
- End giveaway lebih awal
- Reroll winner
- Delete giveaway

### Join Type

Tersedia dua mode:

```txt
button
reaction
```

Rekomendasi: gunakan `button` untuk pengalaman yang lebih modern dan jelas.

### Tips Giveaway

- Gunakan channel khusus seperti `#giveaway`.
- Pastikan hadiah, durasi, dan jumlah pemenang jelas.
- Gunakan reroll jika pemenang tidak valid atau tidak merespons.
- Simpan log giveaway untuk transparansi.

---

## 11. Birthday Reminder

Birthday Reminder membantu server merayakan ulang tahun member.

### Fitur

- Enable/disable birthday system
- Pilih birthday channel
- Pilih birthday role
- Melihat daftar birthday
- Delete data birthday member

### Setup

1. Buat channel `#birthday`.
2. Buat role seperti `Birthday`.
3. Pilih channel dan role di dashboard.
4. Simpan konfigurasi.

### Tips

- Pastikan birthday role tidak punya permission berlebihan.
- Gunakan channel yang santai dan mudah dilihat member.
- Jika data birthday bersifat sensitif, jelaskan ke member bagaimana data digunakan.

---

## 12. Custom Commands

Custom Commands memungkinkan admin membuat command sederhana untuk respons otomatis.

### Cara Kerja

Admin menambahkan trigger dan response dari dashboard.

Contoh:

```txt
Trigger: rules
Response: Silakan baca rules di #rules.
```

User bisa memanggil:

```txt
!rules
```

Bot akan membalas dengan response yang sudah disimpan.

### Contoh Custom Commands

```txt
!rules     → Menampilkan peraturan server
!sosmed    → Menampilkan link sosial media komunitas
!jadwal    → Menampilkan jadwal event
!partner   → Menampilkan info partnership
!help      → Menampilkan bantuan dasar
```

### Tips

- Jangan buat trigger terlalu panjang.
- Hindari trigger yang mirip agar member tidak bingung.
- Gunakan custom commands untuk informasi yang sering ditanyakan.

---

## 13. Insights

Insights membantu admin melihat statistik server.

### Data yang tersedia

- Total messages
- Active members
- Total voice minutes
- Message change percentage
- Top members
- Channel activity
- Hourly activity

### Periode

Dashboard menyediakan filter periode seperti:

```txt
today
week
month
```

### Cara Pakai

Gunakan insight untuk melihat:

- Channel paling aktif
- Member paling aktif
- Jam ramai server
- Aktivitas voice
- Perubahan engagement

### Tips

- Gunakan data insights untuk menentukan jam event.
- Pantau channel yang terlalu sepi atau terlalu ramai.
- Jangan gunakan data untuk mempermalukan member. Statistik itu alat, bukan pentungan.

---

## 14. Commands

ABNRML Bot berfokus pada dashboard-first configuration. Beberapa fitur dikonfigurasi lewat dashboard, sementara command digunakan untuk interaksi cepat di Discord.

### Custom Commands

Custom command menggunakan format:

```txt
!trigger
```

Contoh:

```txt
!rules
!sosmed
!jadwal
```

### Slash Commands

Jika slash commands sudah didaftarkan, command akan muncul saat mengetik:

```txt
/
```

di Discord.

Jika slash commands belum muncul:

1. Pastikan bot di-invite dengan scope `applications.commands`.
2. Tunggu beberapa menit.
3. Kick dan invite ulang bot jika perlu.
4. Pastikan command registration/deploy command sudah dijalankan di backend/bot.

### Daftar Slash Commands

Semua slash commands yang terdaftar:

**🛡️ Moderation**
`/ban`, `/kick`, `/warn`, `/warns`, `/mute`, `/purge`, `/raid`, `/automod`, `/logging`

**📈 Leveling**
`/rank`, `/leaderboard`

**🎉 Giveaway & Poll**
`/giveaway`, `/poll`

**🎂 Analytics & Birthday**
`/insights`, `/birthday`, `/config`

**🎮 Fun & Community**
`/afk`, `/cc`, `/ship`, `/profile`, `/setbio`

**🔐 Privacy**
`/mydata`, `/exportmydata`, `/deletemydata`

**⚙️ Reaction Roles**
`/reactionrole`

**📚 Core**
`/help`

---

## 15. Admin Setup Checklist

Gunakan checklist ini setelah bot masuk server.

```txt
[ ] Bot sudah masuk server
[ ] Bot punya role dengan permission cukup
[ ] Role bot berada di atas role auto role/reward
[ ] Akun admin punya Manage Server
[ ] Server muncul di dashboard
[ ] Welcome channel sudah dipilih
[ ] Goodbye channel sudah dipilih
[ ] Auto role sudah dites
[ ] Leveling sudah dikonfigurasi
[ ] Level up channel sudah dipilih
[ ] Role reward sudah dites
[ ] Mod log channel sudah dibuat
[ ] AutoMod sudah dites
[ ] Logging sudah aktif
[ ] Giveaway channel sudah siap
[ ] Birthday channel sudah siap
[ ] Custom commands dasar sudah dibuat
[ ] Dashboard dapat menyimpan konfigurasi
```

---

## 16. Troubleshooting

### Server tidak muncul di dashboard

Penyebab umum:

- Bot belum masuk ke server.
- User yang login tidak punya permission Manage Server.
- Server belum tercatat di database bot.
- Firestore collection `guildConfigs` belum punya document untuk server tersebut.
- Bot menggunakan Firebase project yang berbeda dari dashboard.

Solusi:

1. Pastikan bot sudah di-invite ke server.
2. Pastikan akun Discord admin punya Manage Server.
3. Pastikan document `guildConfigs/{guildId}` ada di Firestore.
4. Login ulang dashboard.

### Dashboard error saat login Discord

Cek:

- Discord OAuth redirect URI sudah benar.
- `VITE_DISCORD_CLIENT_ID` sudah benar.
- `VITE_DISCORD_REDIRECT_URI` mengarah ke `/login`.
- Domain production sudah masuk Discord Developer Portal.

Redirect URI production:

```txt
https://discord-bot-eta-ten.vercel.app/login
```

### Error Firebase Auth

Cek:

- Firebase Authentication sudah diaktifkan.
- Frontend dan backend memakai project Firebase yang sama.
- `VITE_FIREBASE_PROJECT_ID` sama dengan `serviceAccountKey.json` project ID.
- Authorized domain sudah berisi domain dashboard.

Authorized domain yang disarankan:

```txt
localhost
discord-bot-eta-ten.vercel.app
```

### Dashboard error Request Failed atau Fetch Failed

Cek:

- Backend Railway aktif.
- `VITE_BOT_API_URL` mengarah ke URL Railway backend.
- Backend punya env `FIREBASE_SERVICE_ACCOUNT`.
- Backend punya env `DASHBOARD_URL`.
- CORS backend mengizinkan domain dashboard.

Backend API production:

```txt
https://discord-bot-production-2e68.up.railway.app
```

Test endpoint:

```txt
https://discord-bot-production-2e68.up.railway.app/api/auth/guilds
```

Jika hasilnya:

```json
{"error":"Bearer token wajib diisi."}
```

itu berarti API hidup.

### Bot offline

Cek:

- Railway service bot masih running.
- Token Discord benar.
- Bot tidak terkena rate limit atau crash.
- Log Railway tidak menampilkan error.
- Environment variable `TOKEN` tersedia untuk proses bot.

### Welcome message tidak terkirim

Cek:

- Welcome system aktif.
- Welcome channel sudah dipilih.
- Bot punya permission Send Messages.
- Bot punya permission View Channel.
- Channel tidak private dari role bot.

### Auto role gagal

Cek:

- Bot punya permission Manage Roles.
- Role bot lebih tinggi dari role yang ingin diberikan.
- Role target tidak di atas role bot.
- Auto role sudah disimpan di dashboard.

### Leveling tidak jalan

Cek:

- Leveling aktif.
- Bot punya Message Content Intent jika sistem membaca pesan.
- XP cooldown tidak terlalu tinggi.
- Bot online.
- Channel tidak dikecualikan oleh konfigurasi khusus.

### Logging tidak muncul

Cek:

- Logging aktif.
- Log channel sudah dipilih.
- Bot punya permission melihat event terkait.
- Bot punya permission Send Messages di log channel.

---

## 17. Privacy & Data

ABNRML Bot dapat menyimpan data yang dibutuhkan untuk menjalankan fitur server.

Data yang mungkin disimpan:

- Server ID
- Server name
- Channel ID
- Role ID
- User ID
- Welcome/goodbye config
- Level dan XP data
- Moderation warning logs
- Giveaway data
- Birthday data
- Custom command data
- Activity insights

Bot tidak membutuhkan password Discord user. Login dashboard menggunakan OAuth Discord dan Firebase custom token.

Admin server disarankan memberi tahu member jika fitur seperti leveling, birthdays, atau moderation logs digunakan.

---

## 18. Security Notes

Untuk owner/developer bot:

- Jangan commit `.env`
- Jangan commit `serviceAccountKey.json`
- Jangan expose `FIREBASE_SERVICE_ACCOUNT`
- Jangan expose `API_SECRET`
- Jangan menaruh secret di variable `VITE_*`
- Gunakan Railway env untuk backend secret
- Gunakan Vercel env hanya untuk frontend config
- Rotasi token jika pernah bocor
- Gunakan permission bot secukupnya jika production sudah stabil

---

## 19. Recommended Server Structure

Contoh struktur channel untuk server komunitas:

```txt
INFO
├─ #welcome
├─ #rules
├─ #announcement
├─ #faq

COMMUNITY
├─ #general
├─ #media
├─ #bot-command
├─ #giveaway
├─ #birthday

VOICE
├─ General Voice
├─ Chill Room
├─ Event Room

STAFF
├─ #staff-chat
├─ #mod-log
├─ #server-log
├─ #bot-log
```

---

## 20. Credits

**ABNRML Bot**  
Created & Developed by **Rivaldy Taufikqul Hakim**

Built with:

- Discord.js
- Firebase
- Railway
- Vercel
- React
- Vite

---

## 21. Changelog Template

Gunakan format ini untuk update bot.

```md
## v1.0.0

### Added
- Initial dashboard release
- Welcome system
- Leveling system
- AutoMod
- Logging
- Giveaway
- Birthday reminder
- Custom commands
- Server insights

### Fixed
- Discord OAuth login
- Firebase custom token integration
- Railway backend API connection

### Changed
- Improved dashboard deployment setup
```

---

## 22. Support

Jika ada bug atau fitur tidak berjalan:

1. Cek permission bot.
2. Cek dashboard config.
3. Cek status backend.
4. Cek log Railway.
5. Hubungi owner/developer bot.

Owner/Developer:

```txt
Rivaldy Taufikqul Hakim
```

