# Deployment Guide

## Frontend Vercel

Deploy the dashboard as a static Vite app.

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
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_APP_ID=
VITE_DISCORD_CLIENT_ID=
VITE_DISCORD_REDIRECT_URI=https://discord-bot-eta-ten.vercel.app/login
VITE_BOT_API_URL=https://your-backend-api-domain.example.com
```

After changing Vercel env variables, redeploy the project. Vite reads `VITE_*`
variables during build.

Do not set backend secrets in Vercel frontend env. Never expose
`FIREBASE_SERVICE_ACCOUNT` or `API_SECRET` to the browser.

## Discord Developer Portal

OAuth2 redirect URI must include exactly:

```txt
https://discord-bot-eta-ten.vercel.app/login
```

Do not use random Vercel preview deployment domains for OAuth unless you also add
each preview URL to Discord Developer Portal.

## Backend Deployment

Deploy the backend API separately from the static dashboard.

Recommended platforms:

- Railway
- Render
- Fly.io
- VPS

Backend start command:

```bash
npm run api
```

Required backend env:

```env
FIREBASE_SERVICE_ACCOUNT=
API_SECRET=
DASHBOARD_URL=https://discord-bot-eta-ten.vercel.app
API_PORT=3000
```

`FIREBASE_SERVICE_ACCOUNT` must be the Firebase Admin SDK service account JSON as
a single-line JSON string. Do not commit the real value.

`VITE_BOT_API_URL` in the dashboard must point to this deployed backend API URL.
The frontend Vercel domain is not the backend API unless you explicitly deploy an
API there.
