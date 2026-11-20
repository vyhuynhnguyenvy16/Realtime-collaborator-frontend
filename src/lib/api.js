import { API_URL } from '../config.js';

// Tokens from POST /auth/login|register: { accessToken (15m), refreshToken (7d) }.
const KEY = 'rc-session';
let session = load();

function load() { try { return JSON.parse(localStorage.getItem(KEY)) || null; } catch { return null; } }
function save(s) { session = s; try { s ? localStorage.setItem(KEY, JSON.stringify(s)) : localStorage.removeItem(KEY); } catch {} }

export const getSession = () => session;
export const getAccessToken = () => session?.accessToken || null;

export class ApiError extends Error {
  constructor(status, message, body) { super(message); this.status = status; this.body = body; }
}

// Nest returns { message: string | string[], error, statusCode }.
const messageOf = (body, fallback) => {
  const m = body?.message;
  return Array.isArray(m) ? m.join(' ') : m || fallback;
};

function tokenExpiresSoon(token) {
  try {
    const { exp } = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return exp * 1000 - Date.now() < 30_000;
  } catch { return true; }
}

let refreshing = null;
export async function refreshAccessToken() {
  if (!session?.refreshToken) throw new ApiError(401, 'Phiên đăng nhập đã hết.');
  refreshing ??= (async () => {
    try {
      const res = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: session.refreshToken }),
      });
      if (!res.ok) { save(null); throw new ApiError(401, 'Phiên đăng nhập đã hết. Hãy đăng nhập lại.'); }
      const { accessToken } = await res.json();
      save({ ...session, accessToken });
      return accessToken;
    } finally { refreshing = null; }
  })();
  return refreshing;
}

// Fresh access token for REST and for the WebSocket ?token= query.
export async function freshToken() {
  if (!session) throw new ApiError(401, 'Chưa đăng nhập.');
  return tokenExpiresSoon(session.accessToken) ? refreshAccessToken() : session.accessToken;
}

export async function request(path, { method = 'GET', body, auth = true, retry = true } = {}) {
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (auth) headers.Authorization = `Bearer ${await freshToken()}`;
  let res;
  try {
    res = await fetch(`${API_URL}${path}`, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
  } catch {
    throw new ApiError(0, `Không kết nối được máy chủ (${API_URL}). Kiểm tra mạng hoặc thử lại sau.`);
  }
  if (res.status === 401 && auth && retry) {
    await refreshAccessToken();
    return request(path, { method, body, auth, retry: false });
  }
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) throw new ApiError(res.status, messageOf(data, `Lỗi ${res.status}`), data);
  return data;
}

/* ---- auth ---- */
async function storeTokens(tokens) {
  save({ ...tokens });
  const me = await request('/auth/me');           // { id, email }
  save({ ...tokens, user: me });
  return me;
}
export async function login(email, password) {
  return storeTokens(await request('/auth/login', { method: 'POST', body: { email, password }, auth: false }));
}
export async function register(email, password) {
  return storeTokens(await request('/auth/register', { method: 'POST', body: { email, password }, auth: false }));
}
// TODO(api): POST /auth/logout to revoke the refresh token server-side.
export function logout() { save(null); }

/* ---- documents ---- */
export const listDocuments = () => request('/documents');
export const getDocument = (id) => request(`/documents/${encodeURIComponent(id)}`);
export const createDocument = (title) => request('/documents', { method: 'POST', body: { title } });
export const renameDocument = (id, title) => request(`/documents/${encodeURIComponent(id)}`, { method: 'PATCH', body: { title } });
export const deleteDocument = (id) => request(`/documents/${encodeURIComponent(id)}`, { method: 'DELETE' });
// Upserts DocumentAccess: also used to change an existing member's role.
export const shareDocument = (id, userId, role) =>
  request(`/documents/${encodeURIComponent(id)}/share`, { method: 'POST', body: { userId, role } });
