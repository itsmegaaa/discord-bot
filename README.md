# ⚡ ABNRML Bot

### Discord community management bot with web dashboard, modular features, moderation, leveling, giveaways, reaction roles, privacy tools, and server insights.

ABNRML Bot is built to help Discord communities manage automation, moderation, engagement, and server configuration without forcing every admin to memorize slash commands like it is some ancient curse.

![Node.js](https://img.shields.io/badge/Node.js-1f2937?style=for-the-badge&logo=node.js)
![Discord.js](https://img.shields.io/badge/Discord.js-v14-5865F2?style=for-the-badge&logo=discord)
![Firebase](https://img.shields.io/badge/Firebase-Firestore-ffca28?style=for-the-badge&logo=firebase)
![React](https://img.shields.io/badge/React-Dashboard-61dafb?style=for-the-badge&logo=react)
![Vite](https://img.shields.io/badge/Vite-Frontend-646cff?style=for-the-badge&logo=vite)
![Railway](https://img.shields.io/badge/Railway-Backend-0b0d0e?style=for-the-badge&logo=railway)
![Vercel](https://img.shields.io/badge/Vercel-Frontend-000000?style=for-the-badge&logo=vercel)

Created & Developed by **Rivaldy Taufikqul Hakim / eG4**

---

## ✨ Overview

ABNRML Bot is a multifunctional Discord bot for community management, automation, moderation, engagement, and server configuration.

The project includes:

- Discord bot worker powered by `discord.js`
- Express backend API
- React + Vite dashboard
- Discord OAuth login
- Firebase Authentication
- Firebase Firestore database
- Modular feature system
- Per-server module configuration
- Privacy and data commands
- Public Terms of Service and Privacy Policy pages

The goal is simple: make Discord server management less painful, less manual, and less dependent on someone typing commands at 3 AM like a sleep-deprived server goblin.

---

## 🔗 Live Services

| Service | URL |
|---|---|
| Web Dashboard | `https://discord-bot-eta-ten.vercel.app` |
| Backend API | `https://discord-bot-production-2e68.up.railway.app` |
| Terms of Service | `https://discord-bot-eta-ten.vercel.app/terms` |
| Privacy Policy | `https://discord-bot-eta-ten.vercel.app/privacy` |

> The backend root route may show `Cannot GET /`. That is normal. API routes live under `/api`.

API protected route check:

```txt
https://discord-bot-production-2e68.up.railway.app/api/auth/guilds
```

Expected unauthenticated response:

```json
{
  "error": "Bearer token wajib diisi."
}
```

If you see that, the API is alive and protected. Annoying, but functional.

---

## 🚀 Core Features

### 🧩 Modular System

ABNRML Bot is moving toward a module-based architecture so features can be enabled, disabled, and configured per server.

Current modular direction:

- Module registry
- Module loader
- Per-guild module settings
- Module enable/disable system
- Dashboard module manager
- Config per module
- Permission-aware feature access

Example module categories:

- Welcome
- Leveling
- Moderation
- AutoMod
- Logging
- Giveaway
- Reaction Roles
- Privacy
- Analytics
- Fun

---

### 🖥️ Web Dashboard

Manage the bot from a web dashboard instead of forcing server staff to cosplay as terminal users.

Dashboard features:

- Discord OAuth login
- Server selection
- Guild-based access control
- Firebase custom token authentication
- Dashboard-first configuration
- Module manager
- Public legal pages
- Vercel Analytics integration

---

### 👋 Welcome & Goodbye System

Automate member onboarding and departure messages.

Features:

- Custom welcome message
- Custom goodbye message
- Welcome channel selection
- Goodbye channel selection
- Welcome card support
- Auto role for new members

---

### 📈 Leveling System

Increase community engagement with XP and levels.

Features:

- Message XP
- Voice XP
- XP cooldown
- Level up channel
- Role rewards
- Rank command
- Leaderboard command
- Reset XP support

---

### 🛡️ Moderation

Basic moderation system for server staff.

Features:

- Warn management
- Warning logs
- Delete warnings
- Mod log channel
- Timeout support
- Staff-focused moderation flow

---

### 🤖 AutoMod

Reduce chaos before everyone starts pinging staff like it is a public emergency.

Features:

- Bad word filter
- Anti-spam
- Anti-link
- Anti-mass mention
- Auto timeout
- Bypass roles

---

### 🧾 Logging

Track important server activity.

Features:

- Message edit logs
- Message delete logs
- Voice activity logs
- Member join logs
- Member leave logs
- Role change logs
- Moderation action logs

---

### 🎉 Giveaway

Manage giveaways directly from commands or dashboard flow.

Features:

- Active giveaway list
- End giveaway early
- Reroll winner
- Delete giveaway
- Button or reaction join mode

---

### 🎭 Reaction Roles

Let members take roles through reactions or interaction-based setup.

Useful for:

- Gender roles
- Interest roles
- Announcement roles
- Event roles
- Community access roles

Recommended future dashboard controls:

- Select channel
- Select message
- Select emoji
- Select role
- Add/edit/delete reaction role setup

---

### 🎂 Birthday Reminder

Celebrate member birthdays automatically.

Features:

- Birthday channel
- Birthday role
- Birthday list
- Delete birthday data

---

### ⚙️ Custom Commands

Create simple text-based commands for server information.

Examples:

```txt
!rules
!sosmed
!jadwal
```

---

### 🔐 Privacy & Data Tools

The bot includes privacy-focused slash commands for user data transparency.

Commands:

```txt
/mydata
/exportmydata
/deletemydata
```

These commands help users check, export, or request deletion of supported stored data.

---

### 📊 Server Insights

View server activity and engagement data.

Features:

- Total messages
- Active members
- Voice minutes
- Top members
- Channel activity
- Hourly activity
- Daily, weekly, and monthly views

---

## 🧱 Tech Stack

| Layer | Technology |
|---|---|
| Bot Runtime | Node.js |
| Discord Library | discord.js v14 |
| Backend API | Express.js |
| Frontend | React + Vite |
| Styling | Tailwind CSS |
| Auth | Discord OAuth + Firebase Auth |
| Database | Firebase Firestore |
| Backend Hosting | Railway |
| Frontend Hosting | Vercel |
| Analytics | Vercel Analytics |

---

## 📁 Project Structure

```txt
discord-bot/
├─ src/
│  ├─ api/
│  │  ├─ routes/
│  │  ├─ server.js
│  │  └─ authMiddleware.js
│  ├─ bot/
│  │  └─ deployCommands.js
│  ├─ commands/
│  ├─ core/
│  ├─ events/
│  ├─ modules/
│  ├─ utils/
│  └─ index.js
│
├─ discord-dashboard/
│  ├─ src/
│  │  ├─ components/
│  │  ├─ context/
│  │  ├─ hooks/
│  │  ├─ lib/
│  │  ├─ pages/
│  │  └─ router/
│  ├─ package.json
│  └─ vercel.json
│
├─ tests/
├─ .env.example
├─ package.json
├─ DOCS.md
└─ README.md
```

---

## 🔌 Invite Bot

Use the OAuth2 invite URL:

```txt
https://discord.com/oauth2/authorize?client_id=1511121737688023120&permissions=8&scope=bot+applications.commands
```

Required scopes:

```txt
bot
applications.commands
```

Default permission:

```txt
Administrator
```

`permissions=8` gives Administrator access. It is useful for development and early setup. For production, reduce permissions later because giving everything Admin forever is how chaos gets a permanent guest room.

---

## ✅ Requirements

Before running this project, prepare:

- Node.js
- npm
- Discord bot application
- Firebase project
- Firebase Authentication enabled
- Firebase Firestore enabled
- Firebase Admin service account
- Railway account for backend/API hosting
- Vercel account for frontend/dashboard hosting

---

## 🔐 Environment Variables

This project has separate environments:

1. Backend API / Discord bot worker env
2. Frontend dashboard env

Do not mix them. Frontend secrets are not secrets. They are browser souvenirs.

---

## Backend / Worker Environment

Create `.env` in the root project.

```env
# API
API_PORT=3000
DASHBOARD_URL=https://discord-bot-eta-ten.vercel.app
API_SECRET=replace_with_random_secret

# Firebase Admin SDK
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"...","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"...","client_id":"..."}

# Discord Bot
TOKEN=
DISCORD_TOKEN=
DISCORD_CLIENT_ID=

# Optional server defaults
AUTO_ROLE_ID=
WELCOME_CHANNEL_ID=
RULES_CHANNEL_ID=
```

### Backend Env Explanation

| Variable | Description |
|---|---|
| `API_PORT` | Local API port |
| `DASHBOARD_URL` | Allowed dashboard origin for CORS |
| `API_SECRET` | Backend-only secret for trusted internal access |
| `FIREBASE_SERVICE_ACCOUNT` | Firebase Admin SDK service account JSON as one-line string |
| `TOKEN` | Discord bot token, kept for older code compatibility |
| `DISCORD_TOKEN` | Discord bot token |
| `DISCORD_CLIENT_ID` | Discord Application ID / Client ID |
| `AUTO_ROLE_ID` | Optional default auto role ID |
| `WELCOME_CHANNEL_ID` | Optional default welcome channel ID |
| `RULES_CHANNEL_ID` | Optional rules channel ID |

> For now, `TOKEN` and `DISCORD_TOKEN` can contain the same bot token if the code still supports both names.

Never commit:

```txt
.env
serviceAccountKey.json
```

---

## Frontend Dashboard Environment

Create `.env` inside:

```txt
discord-dashboard/.env
```

Local development:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=dc-bot26.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=dc-bot26
VITE_FIREBASE_APP_ID=

VITE_DISCORD_CLIENT_ID=1511121737688023120
VITE_DISCORD_REDIRECT_URI=http://localhost:5173/login
VITE_BOT_API_URL=http://localhost:3000
```

Production:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=dc-bot26.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=dc-bot26
VITE_FIREBASE_APP_ID=

VITE_DISCORD_CLIENT_ID=1511121737688023120
VITE_DISCORD_REDIRECT_URI=https://discord-bot-eta-ten.vercel.app/login
VITE_BOT_API_URL=https://discord-bot-production-2e68.up.railway.app
```

### Do Not Put These in Frontend Env

```env
FIREBASE_SERVICE_ACCOUNT=
API_SECRET=
TOKEN=
DISCORD_TOKEN=
```

If a secret starts with `VITE_`, it is no longer secret. Congrats, the browser owns it now.

---

## 🧪 Local Development

### 1. Install Backend Dependencies

```bash
npm install
```

### 2. Run Discord Bot Worker

```bash
npm start
```

This runs:

```bash
node src/index.js
```

### 3. Run Backend API

```bash
npm run api
```

Expected output:

```txt
Dashboard API berjalan di port 3000
```

### 4. Deploy Slash Commands

```bash
npm run deploy
```

This runs:

```bash
node src/bot/deployCommands.js
```

### 5. Run Tests

```bash
npm test
```

### 6. Install Dashboard Dependencies

```bash
cd discord-dashboard
npm install
```

### 7. Run Dashboard

```bash
npm run dev
```

Open:

```txt
http://localhost:5173
```

---

## 🔥 Firebase Setup

### 1. Create Firebase Project

Create a project from Firebase Console.

### 2. Enable Authentication

```txt
Firebase Console
→ Authentication
→ Get started
```

### 3. Enable Firestore

```txt
Firebase Console
→ Firestore Database
→ Create database
```

### 4. Create Web App

```txt
Project Settings
→ General
→ Your apps
→ Web app
```

Copy the Firebase web config into `discord-dashboard/.env`.

### 5. Generate Service Account

```txt
Project Settings
→ Service accounts
→ Generate new private key
```

Use the JSON as `FIREBASE_SERVICE_ACCOUNT` in backend env.

Convert the JSON to one line:

```bash
node -e "const fs=require('fs'); const p='./serviceAccountKey.json'; console.log(JSON.stringify(JSON.parse(fs.readFileSync(p,'utf8'))));"
```

### 6. Authorized Domains

```txt
Authentication
→ Settings
→ Authorized domains
```

Add:

```txt
localhost
discord-bot-eta-ten.vercel.app
```

---

## 🧑‍💻 Discord Developer Portal Setup

### OAuth2 Redirects

Add these redirect URLs:

```txt
http://localhost:5173/login
https://discord-bot-eta-ten.vercel.app/login
```

### Application Links

Set these in the app settings:

```txt
Terms of Service URL:
https://discord-bot-eta-ten.vercel.app/terms

Privacy Policy URL:
https://discord-bot-eta-ten.vercel.app/privacy
```

Leave these empty unless specifically implemented:

```txt
Interactions Endpoint URL:
[empty]

Linked Roles Verification URL:
[empty]
```

### Required Bot Intents

Enable based on features used:

- Server Members Intent
- Message Content Intent
- Presence Intent if needed
- Guild Message Reactions if reaction roles are used

### Invite URL Generator

Select scopes:

```txt
bot
applications.commands
```

Select permissions:

```txt
Administrator
```

or manually select required permissions for production.

---

## 🚢 Deployment

### Backend API on Railway

Deploy the root project to Railway.

Start command:

```bash
npm run api
```

Required Railway env:

```env
API_PORT=3000
DASHBOARD_URL=https://discord-bot-eta-ten.vercel.app
API_SECRET=
FIREBASE_SERVICE_ACCOUNT=
DISCORD_CLIENT_ID=
TOKEN=
DISCORD_TOKEN=
```

If Railway uses `PORT`, make sure the API server supports:

```js
process.env.PORT
```

Recommended fallback:

```js
const port = Number(process.env.PORT ?? process.env.API_PORT ?? 3000);
```

---

### Discord Bot Worker on Railway

If using a separate Railway service for the bot worker, use this start command:

```bash
npm start
```

Required Railway env:

```env
TOKEN=
DISCORD_TOKEN=
DISCORD_CLIENT_ID=
FIREBASE_SERVICE_ACCOUNT=
API_SECRET=
DASHBOARD_URL=https://discord-bot-eta-ten.vercel.app
```

Worker notes:

- `npm start` runs the bot process.
- `npm run api` runs the backend API only.
- Keep worker and API as separate services if possible.
- Do not run the dashboard from Railway. The dashboard belongs on Vercel.

---

### Frontend Dashboard on Vercel

Deploy the dashboard as a Vite static app.

Vercel settings:

```txt
Root Directory: discord-dashboard
Framework Preset: Vite
Install Command: npm install
Build Command: npm run build
Output Directory: dist
```

Required Vercel env:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=dc-bot26.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=dc-bot26
VITE_FIREBASE_APP_ID=
VITE_DISCORD_CLIENT_ID=1511121737688023120
VITE_DISCORD_REDIRECT_URI=https://discord-bot-eta-ten.vercel.app/login
VITE_BOT_API_URL=https://discord-bot-production-2e68.up.railway.app
```

After changing Vercel env variables, redeploy the project. Vite reads `VITE_*` variables during build. Refreshing the browser without redeploying is just modern superstition.

---

## 🗂️ Firestore Collections

Common collections used by the bot:

```txt
guildConfigs
guildCache
sessions
automodConfigs
warnLogs
userLevels
giveaways
birthdays
customCommands
```

Modular system may also use:

```txt
guilds/{guildId}/modules/{moduleId}
```

Example module config:

```json
{
  "enabled": true,
  "version": "1.0.0",
  "config": {
    "channelId": "1234567890"
  }
}
```

### Required Guild Config

For a server to appear in dashboard, Firestore should contain:

```txt
guildConfigs/{guildId}
```

Example document:

```json
{
  "guildName": "ABNRML COMMUNITY"
}
```

If the server does not appear in dashboard, check:

- Bot is invited to the server
- User has Manage Server permission
- `guildConfigs/{guildId}` exists
- Frontend and backend use the same Firebase project

---

## 🧪 Testing

### Test Backend API

```bash
curl https://discord-bot-production-2e68.up.railway.app/api/auth/guilds
```

Expected response:

```json
{
  "error": "Bearer token wajib diisi."
}
```

### Test Local Backend

```bash
curl http://localhost:3000/api/auth/guilds
```

Expected response:

```json
{
  "error": "Bearer token wajib diisi."
}
```

### Test Dashboard Build

```bash
cd discord-dashboard
npm run build
npm run preview
```

### Test Bot Worker

```bash
npm start
```

### Test Slash Command Deploy

```bash
npm run deploy
```

---

## 🧯 Troubleshooting

### Dashboard Blank

Check:

- Vercel root directory is `discord-dashboard`
- Build command is `npm run build`
- Output directory is `dist`
- Required `VITE_*` env variables are set
- Vercel has been redeployed after env changes
- Browser console does not show missing env/API errors

---

### Invalid OAuth2 Redirect URI

Check Discord Developer Portal:

```txt
OAuth2 → Redirects
```

Required production redirect:

```txt
https://discord-bot-eta-ten.vercel.app/login
```

Required local redirect:

```txt
http://localhost:5173/login
```

---

### Firebase: `auth/configuration-not-found`

Check:

- Firebase Authentication is enabled
- Dashboard env uses the same Firebase project as backend service account
- `VITE_FIREBASE_PROJECT_ID` is correct
- Authorized domains include the dashboard domain

---

### Fetch Failed / Request Failed

Check:

- Railway backend API is running
- `VITE_BOT_API_URL` points to the Railway API URL
- Backend has correct `DASHBOARD_URL`
- Backend CORS allows the dashboard domain
- Vercel was redeployed after env changes

---

### Worker Crash: `Cannot find module`

Example:

```txt
Cannot find module '../../commands/fun/rank'
```

Fix:

- Check the required file exists
- Fix the import/require path
- Pull latest code from GitHub
- Run `npm start` locally before redeploying

```bash
git pull
npm install
npm start
```

---

### Firebase Service Account Warning

If you see:

```txt
FIREBASE_SERVICE_ACCOUNT belum diatur di environment variable.
```

Set `FIREBASE_SERVICE_ACCOUNT` in:

- local `.env`
- Railway API service variables
- Railway worker service variables

Use one-line JSON.

---

### Server Not Showing in Dashboard

Check:

- User has Manage Server permission
- Bot is already invited to that server
- Firestore has `guildConfigs/{guildId}`
- Server ID matches Discord Guild ID
- User logged in with the correct Discord account

---

### Auto Role Not Working

Check:

- Bot has Manage Roles permission
- Bot role is above target role
- Auto role is configured in dashboard
- `AUTO_ROLE_ID` is correct if using env fallback

---

### Logs Not Sending

Check:

- Logging is enabled
- Log channel is selected
- Bot has permission to view and send messages in the log channel

---

## 🔒 Security Notes

Do not commit:

```txt
.env
serviceAccountKey.json
```

Do not expose:

```txt
TOKEN
DISCORD_TOKEN
API_SECRET
FIREBASE_SERVICE_ACCOUNT
```

Do not put backend secrets into `VITE_*` variables.

Rotate credentials immediately if they leak. The internet does not forgive. It screenshots.

---

## 🗺️ Roadmap

Planned or recommended improvements:

- Better dashboard module manager
- Module config pages
- Reaction Roles dashboard
- Public landing page
- Public documentation site
- Built-in health endpoint
- Role-based dashboard access
- Audit log viewer
- More detailed analytics
- Custom dashboard themes
- Safer granular bot permissions
- Better onboarding for new servers
- Backup and restore guild config
- Plugin safety rules

---

## 📜 License

This project currently uses the license defined in `package.json`.

If publishing publicly, make sure the license is clear and intentional.

Recommended permissive options:

- MIT
- Apache-2.0
- ISC

Avoid copying GPL-licensed code from other bot frameworks unless the project intentionally adopts GPL-compatible terms.

---

## 🙌 Credits

ABNRML Bot  
Created & Developed by **Rivaldy Taufikqul Hakim / eG4**

Built with:

- Discord.js
- Node.js
- Express.js
- Firebase
- React
- Vite
- Railway
- Vercel

---

### ABNRML Bot

Built for communities that need order, automation, and a little less admin suffering.
