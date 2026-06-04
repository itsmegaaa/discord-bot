<div align="center">

# ⚡ ABNRML Bot

### Discord community management bot with dashboard, automation, moderation, leveling, giveaways, and server insights.

Built to keep Discord servers cleaner, safer, and more alive without making admins babysit every channel like overworked NPCs.

<br />

![Node.js](https://img.shields.io/badge/Node.js-Backend-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Discord.js](https://img.shields.io/badge/Discord.js-Bot-5865F2?style=for-the-badge&logo=discord&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-Database%20%26%20Auth-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![React](https://img.shields.io/badge/React-Dashboard-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-Frontend-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Railway](https://img.shields.io/badge/Railway-API%20Hosting-0B0D0E?style=for-the-badge&logo=railway&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-Web%20Hosting-000000?style=for-the-badge&logo=vercel&logoColor=white)

<br />

**Created & Developed by Rivaldy Taufikqul Hakim**

</div>

---

## ✨ Overview

**ABNRML Bot** is a multifunctional Discord bot built for community management, automation, engagement, and moderation.

It comes with a web dashboard, Firebase-backed data storage, Discord OAuth login, and modular server configuration.

The bot is designed for communities that want to manage their Discord server without turning every staff member into a sleep-deprived command-line goblin.

---

## 🚀 Live Services

| Service | URL |
|---|---|
| Web Dashboard | `https://discord-bot-eta-ten.vercel.app` |
| Backend API | `https://discord-bot-production-2e68.up.railway.app` |

> The backend root route may show `Cannot GET /`. That is normal. This project exposes API routes under `/api`.

API health-style check:

```txt
https://discord-bot-production-2e68.up.railway.app/api/auth/guilds
```

Expected unauthenticated response:

```json
{
  "error": "Bearer token wajib diisi."
}
```

That means the API is alive and protected. Annoying, but functional.

---

## 🧩 Core Features

### 🖥️ Web Dashboard

Manage server configuration through a clean web dashboard.

- Discord OAuth login
- Server selection
- Guild-based access control
- Firebase custom token authentication
- Dashboard-first configuration

### 👋 Welcome & Goodbye System

Welcome new members and send goodbye messages when they leave.

- Custom welcome message
- Custom goodbye message
- Welcome channel selection
- Goodbye channel selection
- Welcome card support
- Auto role for new members

### 📈 Leveling System

Increase community engagement with XP and levels.

- Message XP
- Voice XP
- XP cooldown
- Level up channel
- Role rewards
- Reset all XP

### 🛡️ Moderation

Basic moderation management for staff.

- Mod log channel
- Warn management
- Warning logs
- Delete warnings

### 🤖 AutoMod

Reduce spam and chaos before it becomes everyone’s problem.

- Bad words filter
- Anti-spam
- Anti-link
- Anti-mass mention
- Auto timeout
- Bypass roles

### 🧾 Logging

Track important server activity.

- Message edit logs
- Message delete logs
- Voice activity logs
- Member join logs
- Member leave logs
- Role change logs
- Moderation action logs

### 🎉 Giveaway

Manage giveaways from the dashboard.

- Active giveaway list
- End giveaway early
- Reroll winner
- Delete giveaway
- Button or reaction join mode

### 🎂 Birthday Reminder

Celebrate member birthdays automatically.

- Birthday channel
- Birthday role
- Birthday list
- Delete birthday data

### ⚙️ Custom Commands

Create simple text-based commands for server information.

Example:

```txt
!rules
!sosmed
!jadwal
```

### 📊 Server Insights

View server activity and engagement data.

- Total messages
- Active members
- Voice minutes
- Top members
- Channel activity
- Hourly activity
- Daily, weekly, and monthly views

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Bot Runtime | Node.js |
| Discord Library | Discord.js |
| Frontend | React + Vite |
| Styling | Tailwind CSS |
| Backend API | Express.js |
| Auth | Discord OAuth + Firebase Auth |
| Database | Firebase Firestore |
| Backend Hosting | Railway |
| Frontend Hosting | Vercel |

---

## 📁 Project Structure

```txt
discord-bot/
├─ src/
│  ├─ api/
│  │  ├─ routes/
│  │  ├─ server.js
│  │  └─ authMiddleware.js
│  ├─ commands/
│  ├─ events/
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
├─ package.json
├─ DEPLOYMENT.md
└─ README.md
```

---

## 🔗 Invite Bot

Use the OAuth2 invite URL:

```txt
https://discord.com/oauth2/authorize?client_id=1511121737688023120&permissions=8&scope=bot+applications.commands
```

### Required Scope

```txt
bot
applications.commands
```

### Default Permission

```txt
Administrator
```

`permissions=8` gives Administrator access. It is useful for development and early setup, but for production you may want to reduce permissions later. Giving everything Admin forever is convenient, and also how chaos gets a guest room.

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
- Railway account for backend hosting
- Vercel account for frontend hosting

---

## 🔐 Environment Variables

This project has two separate environments:

1. Backend API / Discord bot env
2. Frontend dashboard env

Do not mix them. Seriously. Frontend secrets are not secrets. They are browser souvenirs.

---

## 🧠 Backend Environment

Create a `.env` file in the root project:

```env
TOKEN=
API_PORT=3000
DASHBOARD_URL=https://discord-bot-eta-ten.vercel.app
API_SECRET=replace_with_random_secret
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"..."}
```

### Backend Env Explanation

| Variable | Description |
|---|---|
| `TOKEN` | Discord bot token |
| `API_PORT` | Local API port |
| `DASHBOARD_URL` | Allowed dashboard origin for CORS |
| `API_SECRET` | Backend-only secret for trusted API access |
| `FIREBASE_SERVICE_ACCOUNT` | Firebase Admin SDK service account JSON as one-line string |

Never commit:

```txt
.env
serviceAccountKey.json
```

---

## 🌐 Frontend Dashboard Environment

Create `.env` inside:

```txt
discord-dashboard/.env
```

For local development:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=dc-bot26.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=dc-bot26
VITE_FIREBASE_APP_ID=

VITE_DISCORD_CLIENT_ID=1511121737688023120
VITE_DISCORD_REDIRECT_URI=http://localhost:5173/login
VITE_BOT_API_URL=http://localhost:3000
```

For production:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=dc-bot26.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=dc-bot26
VITE_FIREBASE_APP_ID=

VITE_DISCORD_CLIENT_ID=1511121737688023120
VITE_DISCORD_REDIRECT_URI=https://discord-bot-eta-ten.vercel.app/login
VITE_BOT_API_URL=https://discord-bot-production-2e68.up.railway.app
```

### Frontend Env Explanation

| Variable | Description |
|---|---|
| `VITE_FIREBASE_API_KEY` | Firebase Web App API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID |
| `VITE_FIREBASE_APP_ID` | Firebase web app ID |
| `VITE_DISCORD_CLIENT_ID` | Discord Application ID |
| `VITE_DISCORD_REDIRECT_URI` | OAuth redirect URI |
| `VITE_BOT_API_URL` | Public backend API URL |

Do not put these in frontend env:

```env
FIREBASE_SERVICE_ACCOUNT=
API_SECRET=
TOKEN=
```

If a secret starts with `VITE_`, it is no longer secret. Congrats, the browser owns it now.

---

## 🛠️ Local Development

### 1. Install Backend Dependencies

```bash
npm install
```

### 2. Run Backend API

```bash
npm run api
```

Expected output:

```txt
Dashboard API berjalan di port 3000
```

### 3. Install Dashboard Dependencies

```bash
cd discord-dashboard
npm install
```

### 4. Run Dashboard

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

Use Firebase Console and create a project.

### 2. Enable Authentication

Go to:

```txt
Firebase Console
→ Authentication
→ Get started
```

### 3. Enable Firestore

Go to:

```txt
Firebase Console
→ Firestore Database
→ Create database
```

### 4. Create Web App

Go to:

```txt
Project Settings
→ General
→ Your apps
→ Web app
```

Copy the Firebase config into `discord-dashboard/.env`.

### 5. Generate Service Account

Go to:

```txt
Project Settings
→ Service accounts
→ Generate new private key
```

Use the JSON as `FIREBASE_SERVICE_ACCOUNT` in backend env.

### 6. Authorized Domains

Go to:

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

## 🎮 Discord Developer Portal Setup

### OAuth2 Redirects

Add these redirect URLs:

```txt
http://localhost:5173/login
https://discord-bot-eta-ten.vercel.app/login
```

### Required Bot Intents

Enable intents based on the features used by the bot:

- Server Members Intent
- Message Content Intent
- Presence Intent if needed

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

or manually select required permissions.

---

## 🚀 Deployment

### Backend API on Railway

Deploy the root project to Railway.

Start command:

```bash
npm run api
```

Required Railway env:

```env
TOKEN=
FIREBASE_SERVICE_ACCOUNT=
API_SECRET=
DASHBOARD_URL=https://discord-bot-eta-ten.vercel.app
API_PORT=3000
```

If Railway uses `PORT`, make sure the API server supports:

```js
process.env.PORT
```

Recommended fallback:

```js
const port = Number(process.env.PORT ?? process.env.API_PORT ?? 3000);
```

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

After changing Vercel env variables, redeploy the project.

Vite reads `VITE_*` variables during build. Refreshing the browser without redeploying is just modern superstition.

---

## 🗃️ Firestore Collections

The bot uses Firestore collections for configuration and feature data.

Common collections:

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

### Required Guild Config

For a server to appear in dashboard, Firestore must contain:

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

---

## 🧯 Troubleshooting

### Dashboard Blank

Check:

- Vercel root directory is `discord-dashboard`
- Build command is `npm run build`
- Output directory is `dist`
- Required `VITE_*` env variables are set
- Vercel has been redeployed after env changes

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

### Firebase: auth/configuration-not-found

Check:

- Firebase Authentication is enabled
- Dashboard env uses the same Firebase project as backend service account
- `VITE_FIREBASE_PROJECT_ID` is correct
- Authorized domains include the dashboard domain

### Fetch Failed / Request Failed

Check:

- Railway backend is running
- `VITE_BOT_API_URL` points to Railway API URL
- Backend has correct `DASHBOARD_URL`
- Backend CORS allows the dashboard domain
- Vercel was redeployed after env changes

### Server Not Showing in Dashboard

Check:

- User has Manage Server permission
- Bot is already invited to that server
- Firestore has `guildConfigs/{guildId}`
- Server ID matches Discord Guild ID
- User logged in with the correct Discord account

### Auto Role Not Working

Check:

- Bot has Manage Roles permission
- Bot role is above target role
- Auto role is configured in dashboard

### Logs Not Sending

Check:

- Logging is enabled
- Log channel is selected
- Bot has permission to view and send messages in the log channel

---

## 🛡️ Security Notes

Do not commit:

```txt
.env
serviceAccountKey.json
```

Do not expose:

```txt
TOKEN
API_SECRET
FIREBASE_SERVICE_ACCOUNT
```

Do not put backend secrets into `VITE_*` variables.

Rotate credentials immediately if they leak. The internet does not forgive. It screenshots.

---

## 📌 Roadmap

Potential future improvements:

- Public documentation site
- Public landing page
- Better command list page
- Built-in health endpoint
- Role-based dashboard access
- Audit log viewer
- More detailed analytics
- Custom dashboard themes
- Safer granular bot permissions
- Better onboarding for new servers

---

## 🤝 Credits

**ABNRML Bot**  
Created & Developed by **Rivaldy Taufikqul Hakim**

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

## 📄 License

This project is currently private/personal unless stated otherwise.

If you plan to open-source it, add a license such as:

- MIT
- Apache-2.0
- GPL-3.0

---

<div align="center">

### ABNRML Bot

Built for communities that need order, automation, and a little less admin suffering.

</div>
