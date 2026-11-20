import './styles/app.css';
import { $, $$, toast } from './lib/ui.js';
import { getSession, logout } from './lib/api.js';
import { initAuth, showAuth } from './views/auth.js';
import { initDocs, showDocs } from './views/docs.js';
import { initShare } from './views/share.js';
import { nameFromEmail, initial } from './lib/ui.js';

// Hash routes: #/login  #/register  #/docs  #/doc/<id>  #/no-access
const TITLES = { auth: 'Đăng nhập', docs: 'Tài liệu của bạn', editor: 'Tài liệu', 'no-access': 'Không mở được tài liệu', 'not-found': 'Không có trang này' };

function show(view) {
  $$('[data-view]').forEach((el) => (el.hidden = el.dataset.view !== view));
  document.body.className = 'v-' + view;
  $('#deskbar').hidden = view === 'editor' || view === 'auth';
  const main = document.querySelector(`[data-view="${view}"] [id^=main-content]`);
  $('#skip').href = view === 'editor' ? '#editorHost' : '#' + (main?.id || '');
  document.title = `${TITLES[view]} · Realtime Collaborator`;
  $('.me-menu').open = false;
}

function paintAccount() {
  const u = getSession()?.user;
  if (!u) return;
  const name = nameFromEmail(u.email);
  $('#meAv').textContent = initial(name);
  $('#meName').textContent = name;
  $('#meEmail').textContent = u.email;
  $('#meId').textContent = u.id;
  $('#naEmail').textContent = u.email;
}

export function route() {
  const hash = location.hash.replace(/^#\/?/, '');
  const [page, id] = hash.split('/');
  const authed = !!getSession()?.user;
  if (page !== 'doc') editorMod?.closeEditor();

  if (page === 'login' || page === 'register') {
    if (authed) return go('docs');
    show('auth'); return showAuth(page);
  }
  if (!authed) {
    sessionStorage.setItem('rc-after-login', location.hash);
    return go('login');
  }
  paintAccount();
  if (page === '' || page === 'docs') { show('docs'); return showDocs(); }
  if (page === 'doc' && id) { show('editor'); return loadEditor().then((m) => m.openEditor(decodeURIComponent(id))); }
  if (page === 'no-access') return show('no-access');
  show('not-found');
}

// The editor (Tiptap + Yjs) is the heavy part: load it only when a document opens.
let editorMod = null;
async function loadEditor() {
  if (!editorMod) { editorMod = await import('./views/editor.js'); editorMod.initEditor({ go }); }
  return editorMod;
}

export function go(path) {
  const h = '#/' + path;
  if (location.hash === h) route(); else location.hash = h;
}

$('#logout').addEventListener('click', () => { logout(); toast('Đã đăng xuất'); go('login'); });
$('#copyId').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(getSession()?.user?.id || ''); toast('Đã sao chép mã người dùng'); }
  catch { toast('Trình duyệt chặn sao chép. Hãy bôi đen mã rồi sao chép.', { error: true }); }
});
document.addEventListener('click', (e) => { const m = $('.me-menu'); if (m.open && !m.contains(e.target)) m.open = false; });
$$('[data-close]').forEach((b) => b.addEventListener('click', () => b.closest('dialog').close()));
$$('[id^=main-content]').forEach((e) => (e.tabIndex = -1));

initAuth({ go });
initDocs({ go });
initShare();
addEventListener('hashchange', route);
route();
