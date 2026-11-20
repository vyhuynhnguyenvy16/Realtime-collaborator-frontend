import { $, esc, colorFor, avatarHtml, setBusy, toast, displayName } from '../lib/ui.js';
import { getDocument, shareByEmail, setRole, removeAccess, getSession } from '../lib/api.js';

const ROLE = { OWNER: 'Chủ sở hữu', EDITOR: 'Biên tập', VIEWER: 'Người xem' };
const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
let docId = null, accesses = [], onChanged = () => {};

export function initShare() {
  $('#inviteForm').addEventListener('submit', onInvite);
  $('#accessList').addEventListener('change', onRoleChange);
  $('#accessList').addEventListener('click', onRemove);
  $('#copyLink').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(`${location.origin}${location.pathname}#/doc/${docId}`); toast('Đã sao chép đường dẫn'); }
    catch { toast('Trình duyệt chặn sao chép. Hãy sao chép từ thanh địa chỉ.', { error: true }); }
  });
}

export async function openShare(id, title, changed) {
  docId = id; onChanged = changed || (() => {});
  $('#shareDoc').textContent = title;
  $('#invErr').textContent = ''; $('#invEmail').value = '';
  $('#accessList').innerHTML = '<li class="hint">Đang tải…</li>';
  $('#shareDlg').showModal();
  $('#invEmail').focus();
  await load();
}

async function load() {
  try { accesses = (await getDocument(docId)).accesses; render(); }
  catch (err) { $('#accessList').innerHTML = `<li class="err">${esc(err.message)}</li>`; }
}

function render() {
  const me = getSession()?.user?.id;
  $('#accessList').innerHTML = accesses.map((a) => {
    const name = a.userId === me ? `${displayName(a.user)} (bạn)` : displayName(a.user);
    const roleCtl = a.role === 'OWNER' ? `<small class="own">${ROLE.OWNER}</small>`
      : `<label class="sr" for="acc-${a.userId}">Quyền của ${esc(name)}</label><select id="acc-${a.userId}" data-u="${a.userId}">
          <option value="EDITOR" ${a.role === 'EDITOR' ? 'selected' : ''}>Biên tập</option>
          <option value="VIEWER" ${a.role === 'VIEWER' ? 'selected' : ''}>Người xem</option></select>
         <button class="ib rm" type="button" data-rm="${a.userId}" aria-label="Gỡ quyền của ${esc(name)}" title="Gỡ quyền truy cập">×</button>`;
    return `<li>${avatarHtml(name, colorFor(a.userId))}<div><b>${esc(name)}</b><small>${esc(a.user.email)}</small></div>${roleCtl}</li>`;
  }).join('');
}

async function onInvite(e) {
  e.preventDefault();
  const email = $('#invEmail').value.trim().toLowerCase(), role = $('#invRole').value;
  const err = !email ? 'Nhập email của người cần thêm.'
    : !EMAIL.test(email) ? 'Email chưa đúng định dạng.'
    : email === getSession()?.user?.email ? 'Đây là email của bạn.'
    : accesses.some((a) => a.user.email === email) ? 'Người này đã có quyền truy cập. Đổi quyền ở danh sách bên dưới.' : '';
  if (err) { $('#invErr').textContent = err; $('#invEmail').focus(); return; }
  const btn = $('#invGo');
  setBusy(btn, true, 'Đang thêm…');
  try {
    const added = await shareByEmail(docId, email, role);
    $('#invEmail').value = ''; $('#invErr').textContent = '';
    toast(`Đã thêm ${displayName(added.user)} với quyền ${ROLE[role]}`);
    await load(); onChanged();
  } catch (ex) {
    $('#invErr').textContent = ex.status === 404
      ? `Chưa có tài khoản nào dùng ${email}. Nhờ họ tạo tài khoản trước rồi thêm lại.` : ex.message;
  } finally { setBusy(btn, false); }
}

async function onRoleChange(e) {
  const userId = e.target.dataset.u; if (!userId) return;
  const role = e.target.value;
  try { await setRole(docId, userId, role); toast(`Đã đổi quyền thành ${ROLE[role]}`); await load(); onChanged(); }
  catch (ex) { toast(ex.message, { error: true }); await load(); }
}

async function onRemove(e) {
  const b = e.target.closest('[data-rm]'); if (!b) return;
  const a = accesses.find((x) => x.userId === b.dataset.rm);
  b.disabled = true;
  try {
    await removeAccess(docId, a.userId);
    toast(`Đã gỡ quyền của ${displayName(a.user)}. Nếu họ đang mở tài liệu, tài liệu sẽ đóng lại.`);
    await load(); onChanged();
  } catch (ex) { b.disabled = false; toast(ex.message, { error: true }); }
}
