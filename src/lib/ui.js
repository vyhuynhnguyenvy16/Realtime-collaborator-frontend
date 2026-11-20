export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function toast(msg, opts = {}) {
  const t = document.createElement('div');
  t.className = 'toast' + (opts.error ? ' toast-error' : '');
  t.innerHTML = `<b style="--c:${opts.error ? 'var(--u1)' : '#7CF0B8'}"></b><span>${esc(msg)}</span>`;
  $('#toasts').append(t);
  setTimeout(() => t.remove(), opts.ms ?? 3500);
}

// Stable colour per user id, from the collaborator inks in app.css.
const INKS = ['#C92A62', '#0B7F57', '#A85F00', '#0E7490', '#2B3FD6', '#B4357F'];
export function colorFor(id = '') {
  let h = 0;
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return INKS[h % INKS.length];
}

export const nameFromEmail = (email = '') => {
  const local = email.split('@')[0] || email;
  return local.charAt(0).toUpperCase() + local.slice(1);
};
// The name the person chose, or the part of their email before @.
export const displayName = (u) => (u?.name && u.name.trim()) || nameFromEmail(u?.email || '');
export const initial = (s = '?') => s.trim().charAt(0).toUpperCase() || '?';

export function relTime(iso) {
  const d = new Date(iso), s = (Date.now() - d) / 1000;
  if (s < 60) return 'Vừa xong';
  if (s < 3600) return `${Math.floor(s / 60)} phút trước`;
  if (s < 86400) return `${Math.floor(s / 3600)} giờ trước`;
  if (s < 172800) return 'Hôm qua';
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export const avatarHtml = (name, color, attrs = '') =>
  `<span class="av" style="--c:${color}" ${attrs}>${esc(initial(name))}</span>`;

export function setBusy(btn, busy, label) {
  if (busy) { btn.dataset.label = btn.textContent; btn.textContent = label; btn.setAttribute('aria-busy', 'true'); btn.disabled = true; }
  else { btn.textContent = btn.dataset.label || btn.textContent; btn.removeAttribute('aria-busy'); btn.disabled = false; }
}
