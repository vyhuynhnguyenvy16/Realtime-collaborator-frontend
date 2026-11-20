import { $, $$, esc, relTime, setBusy, toast, displayName } from '../lib/ui.js';
import { listDocuments, createDocument, deleteDocument, removeAccess, getSession } from '../lib/api.js';
import { openShare } from './share.js';

let docs = [], filter = 'all', q = '', nav, loadErr = null;
const docIcon = '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 2.5h7l3.5 3.5v11.5H5z"/><path d="M12 2.5V6h3.5M7.5 10h5M7.5 13h5"/></svg>';
const icShare = '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="13" cy="4" r="2"/><circle cx="5" cy="9" r="2"/><circle cx="13" cy="14" r="2"/><path d="m6.8 8 4.4-2.8M6.8 10l4.4 2.8"/></svg>';
const icLeave = '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M7 3H4v12h3M11 6l3 3-3 3M14 9H7"/></svg>';
const ROLE = { OWNER: 'Bạn', EDITOR: 'Biên tập', VIEWER: 'Người xem' };
const icDel = '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M3.5 5h11M7 5V3.5h4V5M5 5l.8 10h6.4L13 5"/></svg>';

const me = () => getSession()?.user?.id;

export function initDocs({ go }) {
  nav = go;
  $$('#docFilter [data-f]').forEach((b) => b.addEventListener('click', () => {
    filter = b.dataset.f;
    $$('#docFilter [data-f]').forEach((x) => x.setAttribute('aria-selected', x === b));
    render();
  }));
  $('#docSearch').addEventListener('input', (e) => { q = e.target.value.trim(); render(); });
  $('#drows').addEventListener('click', onRowClick);
  $('#newDocBtn').addEventListener('click', () => openNew());
  $('#newForm').addEventListener('submit', onCreate);
  $('#delGo').addEventListener('click', onDelete);
  // TODO(api): no push channel for "a document was shared with you"; refresh when the tab regains focus.
  const refreshIfVisible = () => { if (!document.hidden && !$('[data-view=docs]').hidden) showDocs(); };
  document.addEventListener('visibilitychange', refreshIfVisible);
  addEventListener('focus', refreshIfVisible);
}

export async function showDocs() {
  $('#drows').setAttribute('aria-busy', 'true');
  if (!docs.length) $('#drows').innerHTML = '<div class="empty-st">Đang tải tài liệu…</div>';
  try { docs = await listDocuments(); loadErr = null; }
  catch (err) { if (err.status === 401) return nav('login'); loadErr = err.message; }
  $('#drows').removeAttribute('aria-busy');
  render();
}

function render() {
  if (loadErr) {
    $('#drows').innerHTML = `<div class="empty-st"><b>Chưa tải được danh sách</b>${esc(loadErr)}<br><button class="btn-s btn-p" id="retryDocs">Thử lại</button></div>`;
    $('#retryDocs').onclick = showDocs;
    return;
  }
  const list = docs.filter((d) =>
    (filter === 'all' || (filter === 'mine' ? d.role === 'OWNER' : d.role !== 'OWNER')) &&
    d.title.toLowerCase().includes(q.toLowerCase()));
  if (!list.length) {
    $('#drows').innerHTML = `<div class="empty-st">${
      q ? `<b>Không có tài liệu nào tên chứa “${esc(q)}”</b>Thử từ khác, hoặc tạo tài liệu mới với tên này.<br><button class="btn-s btn-p" data-create="${esc(q)}">Tạo “${esc(q)}”</button>`
      : filter === 'shared' ? `<b>Chưa ai chia sẻ tài liệu với bạn</b>Người muốn chia sẻ chỉ cần nhập email ${esc(getSession()?.user?.email || '')} của bạn.`
      : '<b>Bạn chưa có tài liệu nào</b>Tạo tài liệu đầu tiên rồi mời nhóm cùng soạn.<br><button class="btn-s btn-p" data-create="">Tạo tài liệu</button>'}</div>`;
    return;
  }
  $('#drows').innerHTML = `<div class="drow-head" aria-hidden="true"><span>Tên</span><span class="c-role">Chủ sở hữu</span><span class="c-upd">Sửa lần cuối</span><span></span></div>` +
    list.map((d) => {
      const mine = d.role === 'OWNER';
      const owner = mine ? 'Bạn' : displayName(d.owner);
      return `<div class="drow" role="listitem">
        <a class="t" href="#/doc/${encodeURIComponent(d.id)}">${docIcon}<span>${esc(d.title)}</span></a>
        <span class="c-role"><span class="role" data-r="${mine ? 'OWNER' : 'SHARED'}" title="${mine ? '' : esc(`${d.owner?.email || ''} · quyền của bạn: ${ROLE[d.role]}`)}">${esc(owner)}</span></span>
        <small class="c-upd" title="${esc(new Date(d.updatedAt).toLocaleString('vi-VN'))}">${relTime(d.updatedAt)}</small>
        <span class="acts">${mine ? `
          <button class="ib" data-share="${esc(d.id)}" aria-label="Chia sẻ ${esc(d.title)}">${icShare}</button>
          <button class="ib" data-del="${esc(d.id)}" aria-label="Xoá ${esc(d.title)}">${icDel}</button>` : `
          <button class="ib" data-leave="${esc(d.id)}" aria-label="Rời ${esc(d.title)}" title="Rời tài liệu: bạn sẽ không mở được nữa">${icLeave}</button>`}
        </span></div>`;
    }).join('');
}

function onRowClick(e) {
  const s = e.target.closest('[data-share]');
  if (s) { const d = docs.find((x) => x.id === s.dataset.share); openShare(d.id, d.title); }
  const del = e.target.closest('[data-del]');
  if (del) askDelete(del.dataset.del);
  const lv = e.target.closest('[data-leave]');
  if (lv) leave(lv);
  const c = e.target.closest('[data-create]');
  if (c) openNew(c.dataset.create);
}

function openNew(v = '') {
  $('#newTitle').value = v; $('#eNew').textContent = ''; $('#newTitle').removeAttribute('aria-invalid');
  $('#newDlg').showModal(); $('#newTitle').focus();
}
async function onCreate(e) {
  e.preventDefault();
  const title = $('#newTitle').value.trim();
  if (!title) { $('#eNew').textContent = 'Đặt tên để bạn và nhóm tìm lại được.'; $('#newTitle').setAttribute('aria-invalid', 'true'); $('#newTitle').focus(); return; }
  const btn = $('#newGo');
  setBusy(btn, true, 'Đang tạo…');
  try {
    const doc = await createDocument(title);
    docs.unshift(doc);
    $('#newDlg').close();
    nav('doc/' + doc.id);
  } catch (err) { $('#eNew').textContent = err.message; }
  finally { setBusy(btn, false); }
}

async function leave(btn) {
  const d = docs.find((x) => x.id === btn.dataset.leave);
  btn.disabled = true;
  try {
    await removeAccess(d.id, me());
    docs = docs.filter((x) => x.id !== d.id); render();
    toast(`Đã rời “${d.title}”. Nhờ chủ tài liệu chia sẻ lại nếu cần.`);
  } catch (err) { btn.disabled = false; toast(err.message, { error: true }); }
}

let delId = null;
function askDelete(id) { delId = id; $('#delName').textContent = docs.find((d) => d.id === id).title; $('#delDlg').showModal(); }
async function onDelete() {
  const btn = $('#delGo'), d = docs.find((x) => x.id === delId);
  setBusy(btn, true, 'Đang xoá…');
  try {
    await deleteDocument(delId);
    docs = docs.filter((x) => x.id !== delId);
    $('#delDlg').close(); render(); toast(`Đã xoá “${d.title}”`);
  } catch (err) { toast(err.message, { error: true }); }
  finally { setBusy(btn, false); }
}
