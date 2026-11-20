export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function toast(msg, opts = {}) {
  const t = document.createElement('div');
  t.className = 'toast' + (opts.error ? ' toast-error' : '');
  t.innerHTML = `<b style="--c:${opts.error ? 'var(--on-accent)' : 'var(--success)'}"></b><span>${esc(msg)}</span>`;
  t.setAttribute('role', opts.error ? 'alert' : 'status');
  const box = $('#toasts');
  box.append(t);
  // At most 2 toasts on screen (DESIGN_RULES 6.5).
  while (box.children.length > 2) box.firstElementChild.remove();
  setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 150); }, opts.ms ?? 4000);
}

// Stable ink per user id: one of the six collaborator inks in app.css (DESIGN_RULES 3.4).
// A CSS variable, so it follows light and dark mode on every client.
const INKS = ['rose', 'green', 'amber', 'cyan', 'indigo', 'plum'];
// Light-mode hex of each ink: the caret extension only accepts #rrggbb in presence data.
const INK_HEX = { rose: '#C92A62', green: '#0B7F57', amber: '#A85F00', cyan: '#0E7490', indigo: '#3E63DD', plum: '#9E3FA8' };
export function inkFor(id = '') {
  let h = 0;
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return INKS[h % INKS.length];
}
export const colorFor = (id) => `var(--ink-${inkFor(id)})`;
export const inkHex = (ink) => INK_HEX[ink] || INK_HEX.indigo;
// Paint value for a presence user: the token when we know the ink, else their hex.
export const paintOf = (user) => (INKS.includes(user?.ink) ? `var(--ink-${user.ink})` : user?.color || 'var(--ink-indigo)');

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
