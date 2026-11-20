import { $, esc, colorFor, avatarHtml, setBusy, toast } from '../lib/ui.js';
import { getDocument, shareDocument, getSession } from '../lib/api.js';

const ROLE = { OWNER: 'Chủ sở hữu', EDITOR: 'Biên tập', VIEWER: 'Người xem' };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
let docId = null, accesses = [], onChanged = () => {};

export function initShare() {
  $('#inviteForm').addEventListener('submit', onInvite);
  $('#accessList').addEventListener('change', onRoleChange);
  $('#copyLink').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(`${location.origin}${location.pathname}#/doc/${docId}`); toast('Đã sao chép đường dẫn'); }
    catch { toast('Trình duyệt chặn sao chép. Hãy sao chép từ thanh địa chỉ.', { error: true }); }
  });
}

export async function openShare(id, title, changed) {
  docId = id; onChanged = changed || (() => {});
  $('#shareDoc').textContent = title;
  $('#invErr').textContent = ''; $('#invId').value = '';
  $('#accessList').innerHTML = '<li class="hint">Đang tải…</li>';
  $('#shareDlg').showModal();
  $('#invId').focus();
  await load();
}

async function load() {
  try { accesses = (await getDocument(docId)).accesses; render(); }
  catch (err) { $('#accessList').innerHTML = `<li class="err">${esc(err.message)}</li>`; }
}

function render() {
  const me = getSession()?.user?.id;
  // TODO(api): include each member's email (and name) in GET /documents/:id accesses.
  const order = { OWNER: 0, EDITOR: 1, VIEWER: 2 };
  $('#accessList').innerHTML = [...accesses].sort((a, b) => order[a.role] - order[b.role]).map((a) => {
    const isMe = a.userId === me;
    const label = isMe ? 'Bạn' : `Người dùng ${a.userId.slice(0, 8)}`;
    const roleCtl = a.role === 'OWNER' ? `<small>${ROLE.OWNER}</small>`
      : `<label class="sr" for="acc-${a.userId}">Quyền của ${esc(label)}</label><select id="acc-${a.userId}" data-u="${a.userId}">
          <option value="EDITOR" ${a.role === 'EDITOR' ? 'selected' : ''}>Biên tập</option>
          <option value="VIEWER" ${a.role === 'VIEWER' ? 'selected' : ''}>Người xem</option></select>`;
    // TODO(api): DELETE /documents/:id/access/:userId to offer "Gỡ quyền truy cập".
    return `<li>${avatarHtml(label, colorFor(a.userId))}<div><b>${esc(label)}</b><small title="${a.userId}">${a.userId}</small></div>${roleCtl}</li>`;
  }).join('');
}

async function onInvite(e) {
  e.preventDefault();
  const userId = $('#invId').value.trim(), role = $('#invRole').value;
  const err = !userId ? 'Dán mã người dùng của người cần thêm.'
    : !UUID.test(userId) ? 'Mã người dùng chưa đúng. Mã có dạng 8-4-4-4-12 ký tự, ví dụ 3b8b7e2b-52c6-….'
    : userId === getSession()?.user?.id ? 'Đây là mã của chính bạn.'
    : accesses.some((a) => a.userId === userId) ? 'Người này đã có quyền truy cập. Đổi quyền ở danh sách bên dưới.' : '';
  if (err) { $('#invErr').textContent = err; return; }
  const btn = $('#invGo');
  setBusy(btn, true, 'Đang thêm…');
  try {
    await shareDocument(docId, userId, role);
    $('#invId').value = ''; $('#invErr').textContent = '';
    toast(`Đã thêm người dùng với quyền ${ROLE[role]}`);
    await load(); onChanged();
  } catch (ex) {
    $('#invErr').textContent = ex.status === 404 ? 'Không có tài khoản nào với mã này.' : ex.message;
  } finally { setBusy(btn, false); }
}

async function onRoleChange(e) {
  const userId = e.target.dataset.u; if (!userId) return;
  const role = e.target.value;
  try { await shareDocument(docId, userId, role); toast(`Đã đổi quyền thành ${ROLE[role]}`); await load(); onChanged(); }
  catch (ex) { toast(ex.message, { error: true }); await load(); }
}
