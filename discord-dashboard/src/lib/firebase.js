import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const requiredEnv = {
  VITE_FIREBASE_API_KEY: import.meta.env.VITE_FIREBASE_API_KEY,
  VITE_FIREBASE_AUTH_DOMAIN: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  VITE_FIREBASE_PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  VITE_FIREBASE_APP_ID: import.meta.env.VITE_FIREBASE_APP_ID,
  VITE_DISCORD_CLIENT_ID: import.meta.env.VITE_DISCORD_CLIENT_ID,
  VITE_BOT_API_URL: import.meta.env.VITE_BOT_API_URL,
};

const missingEnv = Object.entries(requiredEnv)
  .filter(([, value]) => !value)
  .map(([key]) => key);

export const firebaseConfigError = missingEnv.length
  ? `Firebase dashboard config belum lengkap. Missing: ${missingEnv.join(', ')}.`
  : null;

const firebaseConfig = {
  apiKey: requiredEnv.VITE_FIREBASE_API_KEY,
  authDomain: requiredEnv.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: requiredEnv.VITE_FIREBASE_PROJECT_ID,
  appId: requiredEnv.VITE_FIREBASE_APP_ID,
};

export const firebaseApp = firebaseConfigError ? null : initializeApp(firebaseConfig);
export const auth = firebaseApp ? getAuth(firebaseApp) : null;
