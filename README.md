# Realtime Collaborator: frontend

Giao diện soạn tài liệu cùng nhóm theo thời gian thực, nói chuyện trực tiếp với backend NestJS + Yjs
ở repo [`Realtime-collaborator`](https://github.com/vyhuynhnguyenvy16/Realtime-collaborator). Không có dữ liệu giả:
mọi tài khoản, tài liệu, quyền truy cập và nội dung đều đi qua API thật.

## Người dùng làm được gì

Bản đang chạy: https://realtime-collaborator-frontend.vy-huynhnguyenvy-42b.workers.dev
(API: https://api-production-0890c4ce.up.railway.app, deploy trên Railway).

- Tạo tài khoản với tên hiển thị, đổi tên trong menu tài khoản. Đăng xuất thu hồi phiên trên máy chủ.
- Xem, tìm, lọc (của tôi, được chia sẻ), tạo, đổi tên, xoá tài liệu; rời tài liệu người khác chia sẻ.
- Soạn cùng lúc: chữ của người khác hiện ngay; thấy con trỏ, tên và vị trí của từng người trên lề phải.
- “Đã lưu” chỉ hiện khi máy chủ xác nhận đã ghi vào database.
- Viết tiếp khi mất mạng; thay đổi tự gửi khi có mạng lại.
- Chia sẻ bằng email với quyền Biên tập hoặc Người xem, đổi quyền, gỡ quyền. Thay đổi quyền và tên tài liệu
  áp dụng ngay cho người đang mở; người bị gỡ quyền bị đóng tài liệu.
- Lịch sử phiên bản: lưu bản có tên, xem lại bản cũ, khôi phục cho mọi người (bản hiện tại được giữ lại).

Còn chờ backend: bình luận và nhật ký ai sửa gì. Xem **[API_GAPS.md](API_GAPS.md)**.

## Chạy trên máy

Cần Node.js 22.18 trở lên và backend đang chạy (mặc định `http://localhost:3000`, đã bật CORS cho `http://localhost:5173`).

```bash
cp .env.example .env      # sửa VITE_API_URL nếu backend chạy chỗ khác
npm install
npm run dev               # http://localhost:5173
```

## Build và deploy lên Cloudflare (miễn phí)

Frontend là trang tĩnh sau khi build, deploy được lên Cloudflare Workers static assets:

```bash
npm run build             # dùng VITE_API_URL trong .env.production (API trên Railway)
npx cf auth login         # lần đầu
npx cf deploy dist        # hoặc: npm run deploy
```

Hoặc kéo thả thư mục `dist` vào Cloudflare dashboard (Workers & Pages > Create > tải lên file tĩnh).
`public/_headers` đặt header bảo mật và cache. Nhớ thêm domain frontend vào `CORS_ORIGINS` của backend.

## Cấu trúc

| Đường dẫn | Vai trò |
|---|---|
| `src/config.js` | Địa chỉ API/WS từ biến môi trường; cờ `FEATURES` cho tính năng chờ API |
| `.env.production` | Địa chỉ API production cho `npm run build` |
| `src/lib/api.js` | Gọi REST, lưu token, tự refresh khi gặp 401 |
| `src/lib/provider.js` | Provider Yjs cho gateway `/realtime` (giao thức `{ event, data }`), tự nối lại, gửi bù khi có mạng |
| `src/views/` | Đăng nhập, danh sách tài liệu, editor (Tiptap + Yjs, tải sau), hộp thoại chia sẻ |
| `src/styles/app.css` | Hệ thiết kế: bàn cobalt, giấy trắng, mỗi người một màu mực |
| `API_GAPS.md` | Những gì backend cần bổ sung, theo mức ưu tiên |

## Giao thức realtime

Gateway NestJS (`WsAdapter`) dùng frame JSON `{ event, data }`:

| Chiều | event | data |
|---|---|---|
| client → server | `join` | `{ documentId, yjsClientId }` |
| client → server | `update` | `{ documentId, update: number[], id }` |
| client → server | `awareness` | `{ documentId, update: number[] }` |
| server → client | `sync` | `{ documentId, state: number[], role }` (toàn bộ state, sau `join`) |
| server → client | `update`, `awareness` | `{ documentId, update: number[] }` |
| server → client | `ack` | `{ documentId, id }` update đã được ghi vào database |
| server → client | `role`, `meta` | quyền của tôi đổi / tên tài liệu đổi |
| server → client | `error` | `{ message, id? }` ví dụ `ReadOnly`, `PersistFailed` |
| server → client | đóng `1008` | `Unauthorized` (token) hoặc `Forbidden` (không có quyền / bị gỡ quyền / tài liệu bị xoá) |
