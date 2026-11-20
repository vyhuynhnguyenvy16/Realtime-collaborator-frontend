import { $, $$, setBusy, toast } from '../lib/ui.js';
import { login, register } from '../lib/api.js';

let mode = 'login', nav;

export function initAuth({ go }) {
  nav = go;
  $('#togglePass').addEventListener('click', (e) => {
    const p = $('#fPass'), on = p.type === 'password';
    p.type = on ? 'text' : 'password';
    e.currentTarget.textContent = on ? 'Ẩn' : 'Hiện';
    e.currentTarget.setAttribute('aria-pressed', on);
  });
  $('#authForm').addEventListener('submit', onSubmit);
}

export function showAuth(m) {
  mode = m;
  $('#authH').textContent = m === 'login' ? 'Mở lại tài liệu của bạn' : 'Tạo tài khoản để cùng soạn';
  $('#authSubmit').textContent = m === 'login' ? 'Đăng nhập' : 'Tạo tài khoản';
  $('#fPass').autocomplete = m === 'login' ? 'current-password' : 'new-password';
  $('#passHint').hidden = m === 'login';
  $$('[data-auth]').forEach((a) => a.setAttribute('aria-selected', a.dataset.auth === m));
  clearErrors();
  setTimeout(() => $('#fEmail').focus(), 0);
}

function clearErrors() {
  ['eEmail', 'ePass', 'formErr'].forEach((id) => ($('#' + id).textContent = ''));
  $$('#authForm [aria-invalid]').forEach((i) => i.removeAttribute('aria-invalid'));
}
function fieldErr(input, err, msg) {
  $(err).textContent = msg;
  if (msg) { $(input).setAttribute('aria-invalid', 'true'); $(input).setAttribute('aria-describedby', err.slice(1)); }
  else $(input).removeAttribute('aria-invalid');
  return !msg;
}

async function onSubmit(e) {
  e.preventDefault();
  clearErrors();
  const email = $('#fEmail').value.trim(), password = $('#fPass').value;
  // Same rules as backend/src/auth/dto/register.dto.ts (IsEmail, MinLength 6).
  let ok = fieldErr('#fEmail', '#eEmail', !email ? 'Nhập email.' : /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) ? '' : 'Email chưa đúng định dạng.');
  ok = fieldErr('#fPass', '#ePass', !password ? 'Nhập mật khẩu.' : mode === 'register' && password.length < 6 ? 'Mật khẩu cần ít nhất 6 ký tự.' : '') && ok;
  if (!ok) { $('#authForm [aria-invalid=true]').focus(); return; }

  const btn = $('#authSubmit');
  setBusy(btn, true, mode === 'login' ? 'Đang đăng nhập…' : 'Đang tạo tài khoản…');
  try {
    await (mode === 'login' ? login(email, password) : register(email, password));
    $('#fPass').value = '';
    toast(mode === 'login' ? 'Đã đăng nhập' : 'Đã tạo tài khoản');
    const back = sessionStorage.getItem('rc-after-login');
    sessionStorage.removeItem('rc-after-login');
    if (back && back.startsWith('#/doc/')) location.hash = back; else nav('docs');
  } catch (err) {
    if (err.status === 409) fieldErr('#fEmail', '#eEmail', 'Email này đã có tài khoản. Chuyển sang Đăng nhập.');
    else $('#formErr').textContent = err.message;
  } finally {
    setBusy(btn, false);
  }
}
