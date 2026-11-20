# Realtime Collaborator: frontend

Giao diện soạn tài liệu cùng nhóm theo thời gian thực, nói chuyện trực tiếp với backend NestJS + Yjs
ở repo [`Realtime-collaborator`](https://github.com/vyhuynhnguyenvy16/Realtime-collaborator). Không có dữ liệu giả:
mọi tài khoản, tài liệu, quyền truy cập và nội dung đều đi qua API thật.

## Người dùng làm được gì

- Tạo tài khoản, đăng nhập. Phiên tự làm mới bằng refresh token.
- Xem, tìm, lọc (của tôi, được chia sẻ), tạo, đổi tên, xoá tài liệu.
- Soạn cùng lúc: chữ của người khác hiện ngay; thấy con trỏ, tên và vị trí của từng người trên lề phải.
- Viết tiếp khi mất mạng; thay đổi tự gửi khi có mạng lại.
- Chia sẻ cho người khác với quyền Biên tập hoặc Người xem, đổi quyền. Người xem chỉ đọc.

Những tính năng giao diện đã thiết kế nhưng còn chờ backend (lịch sử phiên bản, bình luận, chia sẻ bằng email, gỡ quyền…)
được tắt bằng cờ `FEATURES` trong `src/config.js`. Danh sách đầy đủ và cách bổ sung ở **[API_GAPS.md](API_GAPS.md)**.

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
VITE_API_URL=https://api.ten-mien-cua-ban.com npm run build
npx cf auth login         # lần đầu
npx cf deploy dist        # hoặc: npm run deploy
```

Hoặc kéo thả thư mục `dist` vào Cloudflare dashboard (Workers & Pages > Create > tải lên file tĩnh).
`public/_headers` đặt header bảo mật và cache. Nhớ thêm domain frontend vào `CORS_ORIGINS` của backend.

## Cấu trúc

| Đường dẫn | Vai trò |
|---|---|
| `src/config.js` | Địa chỉ API/WS từ biến môi trường; cờ `FEATURES` cho tính năng chờ API |
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
| client → server | `update`, `awareness` | `{ documentId, update: number[] }` |
| server → client | `sync` | `{ documentId, state: number[] }` (toàn bộ state, sau `join`) |
| server → client | `update`, `awareness` | `{ documentId, update: number[] }` |
| server → client | đóng `1008` | `Unauthorized` (token) hoặc `Forbidden` (không có quyền) |
