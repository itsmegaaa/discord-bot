import { auth } from './firebase.js';

const API_URL = (import.meta.env.VITE_BOT_API_URL || '').replace(/\/+$/, '');
const MISSING_API_URL_MESSAGE = 'Dashboard API URL belum disetel. Set VITE_BOT_API_URL di Vercel lalu redeploy.';

function isPublicPath(path) {
  return path === '/api/auth/discord';
}

async function request(path, options = {}) {
  if (!API_URL) {
    throw new Error(MISSING_API_URL_MESSAGE);
  }

  const token = options.token
    || (!isPublicPath(path) && auth.currentUser ? await auth.currentUser.getIdToken() : null);
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };
  const requestUrl = `${API_URL}${path}`;

  try {
    const response = await fetch(requestUrl, {
      ...options,
      headers,
      body: options.body && typeof options.body !== 'string' ? JSON.stringify(options.body) : options.body,
    });
    const contentType = response.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');
    const data = isJson ? await response.json().catch(() => ({})) : null;
    const text = isJson ? '' : await response.text().catch(() => '');

    if (!response.ok) {
      if (import.meta.env.DEV) {
        console.error('Dashboard API request failed', {
          method: options.method || 'GET',
          status: response.status,
          url: requestUrl,
          response: data || text.slice(0, 500),
        });
      }

      if (!isJson && text.trim().startsWith('<!DOCTYPE html')) {
        throw new Error('Request API masuk ke frontend, bukan backend. Cek VITE_BOT_API_URL dan pastikan mengarah ke backend API.');
      }

      const backendMessage = data?.error || data?.message || text.trim();
      throw new Error(backendMessage || `Backend API error (${response.status}).`);
    }

    return data || {};
  } catch (err) {
    if (err instanceof TypeError) {
      if (import.meta.env.DEV) console.error('Dashboard API network/CORS error', { url: requestUrl, error: err });
      throw new Error('Gagal menghubungi backend API. Cek VITE_BOT_API_URL, status backend, dan konfigurasi CORS.');
    }

    throw err;
  }
}

export const botApi = {
  get: (path, token) => request(path, { method: 'GET', token }),
  post: (path, body, token) => request(path, { method: 'POST', body, token }),
  put: (path, body, token) => request(path, { method: 'PUT', body, token }),
  delete: (path, token) => request(path, { method: 'DELETE', token }),
};
