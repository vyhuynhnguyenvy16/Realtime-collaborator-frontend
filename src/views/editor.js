import * as Y from 'yjs';
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCaret from '@tiptap/extension-collaboration-caret';
import { $, esc, colorFor, displayName, avatarHtml, toast, relTime, setBusy } from '../lib/ui.js';
import { getDocument, renameDocument, getSession, listVersions, saveVersion, getVersion, restoreVersion } from '../lib/api.js';
import { GatewayProvider } from '../lib/provider.js';
import { openShare } from './share.js';

const ROLE = { OWNER: 'Chủ sở hữu', EDITOR: 'Biên tập', VIEWER: 'Người xem' };
let nav, editor = null, provider = null, ydoc = null, current = null, role = null, openToken = 0;

const pref = (k, d) => { try { const v = localStorage.getItem('rc-' + k); return v == null ? d : v === '1'; } catch { return d; } };
const keep = (k, v) => { try { localStorage.setItem('rc-' + k, v ? '1' : '0'); } catch {} };
const mqS = matchMedia('(max-width:980px)');
let panelOpen = pref('panel', false);

export function initEditor({ go }) {
  nav = go;
  $('#panelBtn').addEventListener('click', () => {
    if (isPanelOpen() && tab === 'people') return setPanel(false);
    showTab('people'); setPanel(true);
  });
  $('#versionsBtn').addEventListener('click', () => {
    if (isPanelOpen() && tab === 'versions') return setPanel(false);
    showTab('versions'); setPanel(true);
  });
  $('#tabPeople').addEventListener('click', () => showTab('people'));
  $('#tabVersions').addEventListener('click', () => showTab('versions'));
  $('.ptabs').addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    showTab(tab === 'people' ? 'versions' : 'people');
    $(tab === 'people' ? '#tabPeople' : '#tabVersions').focus();
  });
  $('#verSaveForm').addEventListener('submit', onSaveVersion);
  $('#verList').addEventListener('click', (e) => { const b = e.target.closest('[data-v]'); if (b) openVersion(b.dataset.v); });
  $('#verRestore').addEventListener('click', onRestore);
  $('#verDlg').addEventListener('close', () => { preview?.destroy(); preview = null; });
  $('#panelClose').addEventListener('click', () => { setPanel(false); $('#panelBtn').focus(); });
  $('#scrim').addEventListener('click', () => setPanel(false));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && mqS.matches) setPanel(false); });
  mqS.addEventListener('change', syncPanel);
  syncPanel();

  $('#focusBtn').addEventListener('click', (e) => {
    const on = e.currentTarget.getAttribute('aria-pressed') !== 'true';
    e.currentTarget.setAttribute('aria-pressed', on);
    $('#sheet').classList.toggle('focus', on);
    toast(on ? 'Đã ẩn con trỏ của người khác. Lề phải vẫn cho biết ai đang ở đâu.' : 'Đã hiện lại con trỏ của người khác');
  });
  $('#shareBtn').addEventListener('click', () => current && openShare(current.id, current.title, refreshAccess));
  $('#sync').addEventListener('click', () => {
    const s = provider?.status();
    toast(!s ? '' : s.state === 'synced' ? 'Mọi thay đổi đã được lưu trên máy chủ'
      : s.state === 'error' ? 'Máy chủ chưa lưu được thay đổi gần nhất. Tải lại trang để đồng bộ lại.'
      : s.state === 'sending' ? 'Đang chờ máy chủ xác nhận đã lưu'
      : s.state === 'offline' ? `Mất kết nối. ${s.pending ? 'Phần bạn vừa viết đang chờ, ' : 'Thay đổi '}sẽ tự gửi khi có mạng`
      : 'Đang kết nối tới máy chủ…');
  });

  $('#titleBtn').addEventListener('click', startRename);
  $('#titleForm').addEventListener('submit', submitRename);
  $('#titleInput').addEventListener('keydown', (e) => { if (e.key === 'Escape') endRename(); });
  $('#titleInput').addEventListener('blur', () => setTimeout(() => { if (!$('#titleForm').hidden) submitRename(new Event('submit')); }, 120));

  $('#scroller').addEventListener('scroll', () => requestAnimationFrame(layoutMargin), { passive: true });
  new ResizeObserver(() => layoutMargin()).observe($('#scroller'));
  $('#track').addEventListener('click', onTrackClick);
}

/* ---------------- open / close ---------------- */
export async function openEditor(id) {
  if (current?.id === id && provider) return;
  closeEditor();
  const token = ++openToken;
  $('#docTitle').textContent = '…';
  $('#editorHost').innerHTML = '<p class="ghost">Đang mở tài liệu…</p>';
  let doc;
  try { doc = await getDocument(id); }
  catch (err) {
    if (token !== openToken) return;
    if (err.status === 401) return nav('login');
    if (err.status === 403 || err.status === 404 || err.status === 400) return nav('no-access');
    $('#editorHost').innerHTML = `<p class="ghost">${esc(err.message)}</p>`;
    return;
  }
  if (token !== openToken) return;
  current = doc;
  const me = getSession().user;
  role = doc.role || doc.accesses.find((a) => a.userId === me.id)?.role || 'VIEWER';
  paintMeta();
  if (tab === 'versions') loadVersions();

  ydoc = new Y.Doc();
  provider = new GatewayProvider(id, ydoc, {
    readOnly: role === 'VIEWER',
    onStatus: paintStatus,
    onFatal: (reason) => {
      if (reason === 'forbidden') { toast('Bạn không còn quyền mở tài liệu này.', { error: true }); nav('no-access'); }
      else { toast('Phiên đăng nhập đã hết. Hãy đăng nhập lại.', { error: true }); nav('login'); }
    },
    onRole: (next) => {
      if (!current || next === role) return;
      const was = role; role = next;
      editor?.setEditable(role !== 'VIEWER');
      paintMeta();
      if (was) toast(role === 'VIEWER' ? 'Bạn vừa được chuyển sang quyền Người xem.' : `Bạn vừa được cấp quyền ${ROLE[role]}. Giờ bạn sửa được tài liệu.`);
    },
    onTitle: (title) => { if (current && title !== current.title) { current.title = title; paintMeta(); } },
  });

  const user = { id: me.id, name: displayName(me), color: colorFor(me.id) };
  $('#editorHost').innerHTML = '';
  editor = new Editor({
    element: $('#editorHost'),
    editable: role !== 'VIEWER',
    extensions: [
      StarterKit.configure({ undoRedo: false }),   // Yjs keeps its own history
      Placeholder.configure({ placeholder: role === 'VIEWER' ? 'Tài liệu đang trống.' : 'Bắt đầu viết… Gõ # và dấu cách để tạo tiêu đề, - để tạo danh sách.' }),
      Collaboration.configure({ document: ydoc }),
      CollaborationCaret.configure({ provider, user, render: renderCaret }),
    ],
    editorProps: { attributes: { 'aria-label': `Nội dung tài liệu ${doc.title}`, spellcheck: 'false' } },
  });
  provider.awareness.on('change', onPresence);
  editor.on('transaction', () => requestAnimationFrame(layoutMargin));
  onPresence();
}

export function closeEditor() {
  openToken++;
  editor?.destroy(); editor = null;
  provider?.destroy(); provider = null;
  ydoc?.destroy(); ydoc = null;
  current = null;
  endRename();
  if ($('#verDlg').open) $('#verDlg').close();
  versions = []; $('#verList').innerHTML = '';
}

async function refreshAccess() {
  if (!current) return;
  try { current = await getDocument(current.id); paintMeta(); } catch {}
}

/* ---------------- header + status ---------------- */
function paintMeta() {
  const canRename = role === 'OWNER' || role === 'EDITOR';
  $('#docTitle').textContent = current.title;
  document.title = `${current.title} · Realtime Collaborator`;
  $('#titleBtn').disabled = !canRename;
  $('#titleBtn').title = canRename ? 'Đổi tên tài liệu' : '';
  $('#shareBtn').hidden = role !== 'OWNER';
  $('#verSaveForm').hidden = role === 'VIEWER';
  $('#viewBanner').classList.toggle('on', role === 'VIEWER');
  $('#roleMeta').textContent = `Quyền của bạn: ${ROLE[role]}`;
  $('#membersMeta').textContent = `${current.accesses.length} người có quyền truy cập`;
}

const STATUS = { connecting: 'Đang kết nối…', synced: 'Đã lưu', sending: 'Đang lưu…', offline: 'Mất kết nối', error: 'Chưa lưu được' };
function paintStatus(s) {
  const chip = $('#sync');
  chip.dataset.s = s.state === 'synced' ? 'synced' : s.state === 'sending' ? 'sending' : s.state === 'offline' || s.state === 'error' ? 'offline' : 'reconnecting';
  $('#syncLbl').textContent = s.state === 'offline' && s.pending ? 'Mất kết nối · có thay đổi chờ gửi' : STATUS[s.state];
  $('#offBanner').classList.toggle('on', s.state === 'offline');
}

/* ---------------- presence ---------------- */
function others() {
  if (!provider) return [];
  const mine = ydoc.clientID;
  return [...provider.awareness.getStates()].filter(([cid, st]) => cid !== mine && st.user).map(([cid, st]) => ({ cid, ...st.user, hasCursor: !!st.cursor }));
}

function onPresence() {
  const list = others();
  const me = getSession()?.user;
  const meUser = { name: displayName(me), color: colorFor(me.id) };
  // Same person in two tabs shows once.
  const uniq = [...new Map(list.map((u) => [u.id, u])).values()];
  $('#avatars').innerHTML = [...uniq.slice(0, 4).map((u) => avatarHtml(u.name, u.color, `title="${esc(u.name)}"`)),
    uniq.length > 4 ? `<span class="av more" title="${uniq.length - 4} người khác">+${uniq.length - 4}</span>` : '',
    avatarHtml(meUser.name, meUser.color, `data-me title="Bạn"`)].join('');
  $('#panelCnt').textContent = uniq.length || '';
  $('#members').innerHTML = [`<div class="member">${avatarHtml(meUser.name, meUser.color)}<div><b>${esc(meUser.name)} (bạn)</b><small>${ROLE[role] || ''}</small></div></div>`,
    ...uniq.map((u) => `<div class="member">${avatarHtml(u.name, u.color)}<div><b>${esc(u.name)}</b><small>${u.hasCursor ? 'Đang ở trong tài liệu' : 'Đang xem'}</small></div></div>`)].join('');
  $('#membersHint').textContent = uniq.length ? '' : 'Chỉ có bạn đang mở tài liệu này. Gửi đường dẫn cho người đã được chia sẻ để cùng soạn.';
  requestAnimationFrame(layoutMargin);
}

// Caret: name flag shows while the person is active, then shrinks to a dot.
function renderCaret(user) {
  const caret = document.createElement('span');
  caret.className = 'rc-caret fresh';
  caret.setAttribute('aria-hidden', 'true');   // names are not part of the text
  caret.style.setProperty('--c', user.color);
  caret.dataset.uid = user.id || '';
  caret.dataset.name = user.name || '';
  const flag = document.createElement('span');
  flag.className = 'rc-flag';
  flag.textContent = user.name;
  caret.append(flag);
  setTimeout(() => caret.classList.remove('fresh'), 2600);
  return caret;
}

/* presence margin: one pin per collaborator at the height of their caret */
function layoutMargin() {
  const track = $('#track'), scroller = $('#scroller');
  if (!track || !editor) return;
  const H = scroller.scrollHeight, th = track.clientHeight, top0 = scroller.getBoundingClientRect().top;
  const seen = {};
  const pins = [...$('#editorHost').querySelectorAll('.rc-caret')].map((c) => {
    const y = c.getBoundingClientRect().top - top0 + scroller.scrollTop;
    const k = Math.round(y / 40); seen[k] = (seen[k] || 0) + 1;
    const ty = Math.min(th, (y / H) * th + (seen[k] - 1) * 30);
    const name = c.dataset.name;
    return `<button class="pin" style="--c:${c.style.getPropertyValue('--c')};top:${ty}px" data-y="${y}" aria-label="Tới chỗ ${esc(name)} đang ở">${esc(name.charAt(0).toUpperCase())}<span class="tip">${esc(name)}</span></button>`;
  }).join('');
  track.querySelectorAll('.pin').forEach((p) => p.remove());
  track.insertAdjacentHTML('beforeend', pins);
  const v = $('#view');
  v.style.top = (scroller.scrollTop / H) * th + 'px';
  v.style.height = Math.max(18, (scroller.clientHeight / H) * th) + 'px';
}
function onTrackClick(e) {
  const scroller = $('#scroller'), pin = e.target.closest('.pin');
  if (pin) { scroller.scrollTo({ top: +pin.dataset.y - scroller.clientHeight / 2, behavior: 'smooth' }); return; }
  const r = $('#track').getBoundingClientRect();
  scroller.scrollTop = ((e.clientY - r.top) / r.height) * scroller.scrollHeight - scroller.clientHeight / 2;
}

/* ---------------- panel ---------------- */
const isPanelOpen = () => (mqS.matches ? $('#panel').classList.contains('open') : panelOpen);
function setPanel(on) {
  if (mqS.matches) $('#panel').classList.toggle('open', on);
  else { panelOpen = on; keep('panel', on); }
  syncPanel();
}
function syncPanel() {
  const small = mqS.matches, open = isPanelOpen();
  $('#app').classList.toggle('panel-closed', !small && !panelOpen);
  $('#panelBtn').setAttribute('aria-expanded', open && tab === 'people');
  $('#versionsBtn').setAttribute('aria-expanded', open && tab === 'versions');
  $('#scrim').classList.toggle('on', small && $('#panel').classList.contains('open'));
  requestAnimationFrame(layoutMargin);
}

/* ---------------- rename (PATCH /documents/:id) ---------------- */
function startRename() {
  if (!current) return;
  $('#titleBtn').hidden = true; $('#titleForm').hidden = false;
  $('#titleInput').value = current.title; $('#titleInput').select();
}
function endRename() { $('#titleForm').hidden = true; $('#titleBtn').hidden = false; }
async function submitRename(e) {
  e.preventDefault();
  if (!current || $('#titleForm').hidden) return;
  const title = $('#titleInput').value.trim();
  endRename();
  if (!title || title === current.title) return;
  const old = current.title;
  current.title = title; paintMeta();
  try { await renameDocument(current.id, title); toast('Đã đổi tên tài liệu'); }
  catch (err) { current.title = old; paintMeta(); toast(err.message, { error: true }); }
}

/* ---------------- side panel tabs ---------------- */
let tab = 'people';
function showTab(next) {
  tab = next;
  const people = tab === 'people';
  $('#tabPeople').setAttribute('aria-selected', people); $('#tabPeople').tabIndex = people ? 0 : -1;
  $('#tabVersions').setAttribute('aria-selected', !people); $('#tabVersions').tabIndex = people ? -1 : 0;
  $('#panePeople').hidden = !people; $('#paneVersions').hidden = people;
  syncPanel();
  if (!people) loadVersions();
}

/* ---------------- version history ---------------- */
let versions = [], preview = null, previewId = null;
const fmt = (iso) => new Date(iso).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' });

async function loadVersions() {
  if (!current) return;
  const id = current.id;
  if (!versions.length) $('#verList').innerHTML = '<li class="hint">Đang tải…</li>';
  try { const list = await listVersions(id); if (current?.id === id) { versions = list; renderVersions(); } }
  catch (err) { $('#verList').innerHTML = `<li class="err">${esc(err.message)}</li>`; }
}

function renderVersions() {
  if (!versions.length) {
    $('#verList').innerHTML = '<li class="hint">Chưa có phiên bản nào. Bản đầu tiên sẽ được tự lưu khi tài liệu có thay đổi.</li>';
    return;
  }
  $('#verList').innerHTML = versions.map((v) => {
    const by = v.createdBy ? displayName(v.createdBy) : '';
    const auto = !v.label;
    return `<li class="${auto ? 'auto' : ''}"><button type="button" data-v="${esc(v.id)}">
      <b>${esc(auto ? 'Tự động lưu' : v.label)}</b>
      <small title="${esc(new Date(v.createdAt).toLocaleString('vi-VN'))}">${relTime(v.createdAt)}${by ? ` · ${esc(by)}` : ''}</small></button></li>`;
  }).join('');
}

async function onSaveVersion(e) {
  e.preventDefault();
  if (!current) return;
  const btn = $('#verSaveGo'), label = $('#verLabel').value.trim();
  setBusy(btn, true, 'Đang lưu…');
  try {
    const v = await saveVersion(current.id, label);
    $('#verLabel').value = '';
    versions.unshift(v); renderVersions();
    toast(`Đã lưu phiên bản “${v.label}”`);
  } catch (err) { toast(err.message, { error: true }); }
  finally { setBusy(btn, false); }
}

async function openVersion(vid) {
  if (!current) return;
  const v = versions.find((x) => x.id === vid);
  previewId = vid;
  $('#verH').textContent = v?.label || 'Bản tự động lưu';
  $('#verMeta').textContent = v ? `Lưu lúc ${fmt(v.createdAt)}${v.createdBy ? ` bởi ${displayName(v.createdBy)}` : ''}. Đây là bản chỉ xem.` : '';
  $('#verRestore').hidden = role === 'VIEWER';
  $('#verHost').innerHTML = '<p class="ghost">Đang tải…</p>';
  $('#verDlg').showModal();
  try {
    const data = await getVersion(current.id, vid);
    if (previewId !== vid) return;
    const vdoc = new Y.Doc();
    Y.applyUpdate(vdoc, new Uint8Array(data.state));
    preview?.destroy();
    $('#verHost').innerHTML = '';
    preview = new Editor({
      element: $('#verHost'),
      editable: false,
      extensions: [StarterKit.configure({ undoRedo: false }), Collaboration.configure({ document: vdoc })],
      editorProps: { attributes: { 'aria-readonly': 'true' } },
    });
    if (preview.isEmpty) $('#verHost').insertAdjacentHTML('afterbegin', '<p class="ghost">Phiên bản này trống.</p>');
  } catch (err) { $('#verHost').innerHTML = `<p class="err">${esc(err.message)}</p>`; }
}

async function onRestore() {
  if (!current || !previewId) return;
  const btn = $('#verRestore');
  setBusy(btn, true, 'Đang khôi phục…');
  try {
    await restoreVersion(current.id, previewId);
    $('#verDlg').close();
    toast('Đã khôi phục. Mọi người đang mở tài liệu đều thấy bản này. Bản trước đó được lưu là “Trước khi khôi phục”.');
    loadVersions();
  } catch (err) { toast(err.message, { error: true }); }
  finally { setBusy(btn, false); }
}
