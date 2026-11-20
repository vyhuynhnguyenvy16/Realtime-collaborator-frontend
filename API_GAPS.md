# Backend: những gì frontend cần bổ sung

Danh sách này lấy từ việc chạy thật backend [`Realtime-collaborator`](https://github.com/vyhuynhnguyenvy16/Realtime-collaborator)
(commit `5f541a3`) với frontend này, ngày 20/11/2026. Mỗi mục ghi rõ hiện trạng, vì sao frontend cần, và cách sửa gợi ý.

Trong code frontend, mọi chỗ đang chờ backend đều có comment `TODO(api)`:

```bash
grep -rn "TODO(api)" src index.html
```

Các tính năng còn chờ API được tắt bằng cờ trong `src/config.js` (`FEATURES`). Khi backend có API, bật cờ và nối vào.

---

## P0: chặn chạy thật hoặc lỗi bảo mật (nên sửa trước khi deploy)

### 1. `GET /health` làm lộ toàn bộ người dùng, kể cả `passwordHash`
`AppController.getHealth()` trả `prisma.user.findMany()` và không cần đăng nhập. Route này đè lên `HealthController`,
nên `/health` được map hai lần. Đã xác nhận: response có các trường `id, email, passwordHash, createdAt`.

**Sửa:** xoá `getHealth()` trong `src/app.controller.ts` (hoặc xoá hẳn `AppController`). `HealthController` đã đủ.

### 2. Backend không khởi động được: 3 lỗi dependency injection
Chạy `node dist/main.js` lần lượt gặp:

| Lỗi | Sửa |
|---|---|
| `RealtimeGateway` không tìm thấy `DocumentsService` | `documents.module.ts`: thêm `exports: [DocumentsService]` |
| `YjsDocumentManager` không tìm thấy `PrismaService`; `JwtService` thiếu cấu hình | `realtime.module.ts`: `imports: [JwtModule.register({}), DocumentsModule, PrismaModule]` |
| `JwtAuthGuard` không tìm thấy `AuthModuleOptions` | `auth.module.ts`: `PassportModule.register({ defaultStrategy: 'jwt' })` (hoặc bỏ `JwtAuthGuard` khỏi `providers`) |

### 3. Migration lệch với `schema.prisma`
Migration duy nhất (`20260916105738_init`) tạo bảng `"User"`, `"Document"`, `"DocumentAccess"`. Schema hiện tại map sang
`users`, `documents`, `document_access` và có thêm `document_events`, `document_snapshots`. Với database mới,
`prisma migrate deploy` tạo sai bảng và backend lỗi ngay khi truy vấn.

**Sửa:** `npx prisma migrate dev --name sync_schema` trên database local rồi commit migration mới.

### 4. `backend/package.json` thiếu dependency, lockfile lệch
- Thiếu: `yjs`, `y-protocols`, `ws`, `@nestjs/websockets`, `@nestjs/platform-ws` (dev: `@types/ws`). Hiện chúng nằm ở
  `package.json` thư mục gốc, nên `nest build` trong `backend/` báo 9 lỗi.
- `npm ci` thất bại: `Missing: typescript@5.9.3 from lock file`. Chạy `npm install` rồi commit `package-lock.json`.

### 5. Chưa bật CORS, cổng ghi cứng
Frontend chạy ở domain khác (Cloudflare) sẽ bị trình duyệt chặn mọi request.

```ts
// main.ts
app.enableCors({ origin: (process.env.CORS_ORIGINS ?? 'http://localhost:5173').split(',') });
await app.listen(process.env.PORT ?? 3000);
```

### 6. Người xem (VIEWER) vẫn gửi được thay đổi qua WebSocket
`handleUpdate` không kiểm tra quyền; frontend tự khoá editor nhưng ai cũng gửi tay được.

**Sửa:** lưu `role` vào `clientMeta` lúc `join`, và trong `handleUpdate` bỏ qua (hoặc trả `error`) nếu `role === 'VIEWER'`.

---

## P1: API cho các tính năng giao diện đang ẩn hoặc làm tạm

| # | Cần | Hiện trạng | Frontend đang làm gì | Cờ `FEATURES` |
|---|---|---|---|---|
| 7 | Chia sẻ bằng email: `POST /documents/:id/share { email, role }` hoặc `GET /users/lookup?email=` | Chỉ nhận `userId` (UUID) | Người nhận sao chép “mã người dùng” trong menu tài khoản và gửi cho chủ tài liệu | `shareByEmail` |
| 8 | `GET /documents/:id` trả kèm `accesses[].user { id, email }` | Chỉ có `userId` | Hiện “Người dùng 3b8b7e2b” | – |
| 9 | Gỡ quyền: `DELETE /documents/:id/access/:userId` (chỉ chủ sở hữu) | Chưa có | Không có nút gỡ | `removeAccess` |
| 10 | `GET /documents` trả kèm quyền của tôi và email chủ sở hữu | Chỉ có `ownerId` | Cột chủ sở hữu ghi “Bạn” hoặc “Được chia sẻ” | – |
| 11 | Phân biệt 404 và 403 ở `GET /documents/:id` | Luôn 403 | Một màn hình chung “Không mở được tài liệu này” | – |
| 12 | Lịch sử phiên bản: `GET /documents/:id/versions`, `GET .../versions/:vid`, `POST .../versions/:vid/restore`; thêm `label`, `created_by` vào `DocumentSnapshot` | Snapshot có nhưng không có API | Ẩn màn hình Lịch sử | `history` |
| 13 | `DocumentEvent.user_id` (PDF có, schema chưa có) | Không biết ai viết gì | Ẩn tab Hoạt động | `activity` |
| 14 | Bình luận: model `Comment` + `/documents/:id/comments` | Chưa có | Ẩn bình luận | `comments` |
| 15 | Tên hiển thị: `User.name` + `PATCH /auth/me` | Chỉ có email | Lấy phần trước `@` của email làm tên | `displayNames` |
| 16 | `POST /auth/logout` (thu hồi refresh token) | Chưa có | Chỉ xoá token trên máy | – |
| 17 | Báo đổi tên theo thời gian thực (ví dụ event `title` qua gateway) | Chưa có | Người khác thấy tên mới khi tải lại | – |
| 18 | `updatedAt` cập nhật khi nội dung đổi (throttle trong `persistUpdate`) | Chỉ đổi khi đổi tên | Cột ghi “Đổi tên lần cuối” | – |
| 19 | Báo “có tài liệu mới được chia sẻ với bạn” (push hoặc WS) | Chưa có | Danh sách tự tải lại khi quay lại tab | – |

---

## P2: chất lượng đồng bộ thời gian thực

20. **Không có xác nhận đã lưu.** Server không gửi ack sau `update`, nên chip “Đã lưu” thực ra là “đã gửi tới server”
    (`ws.bufferedAmount === 0`). Gợi ý: trả `{ event: 'ack', data: { documentId, clock } }` sau khi `persistUpdate` xong.
21. **Join luôn gửi toàn bộ state.** Nên dùng y-protocols sync (step 1 gửi state vector, step 2 gửi phần thiếu) để tài liệu
    lớn không phải tải lại toàn bộ mỗi lần nối lại.
22. **Mỗi cập nhật tới client 2–3 lần.** Gateway broadcast trực tiếp, rồi Redis lại phát cho cả phòng (kể cả người gửi).
    Yjs bỏ qua bản trùng nên vẫn đúng, nhưng tốn băng thông. Gợi ý: gắn `instanceId` vào message Redis và bỏ qua message
    của chính instance đó.
23. **Chưa rate limit WebSocket** (mục tuần 5 trong kế hoạch).
24. **`persistUpdate` gọi `count()` mỗi lần ghi;** với tài liệu nhiều event sẽ chậm. Nên đếm trong bộ nhớ theo document.
25. **Bị gỡ hoặc hạ quyền vẫn giữ kết nối cũ.** Khi `share` đổi quyền, gateway nên cập nhật hoặc ngắt kết nối của người đó.

---

## Hợp đồng frontend đang dùng (đã test với backend thật)

| Thao tác trên giao diện | API | Trạng thái |
|---|---|---|
| Đăng ký / Đăng nhập | `POST /auth/register`, `POST /auth/login`, rồi `GET /auth/me` | ✅ |
| Tự làm mới phiên | `POST /auth/refresh` khi access token còn dưới 30 giây hoặc gặp 401 | ✅ |
| Danh sách, tạo, đổi tên, xoá tài liệu | `GET/POST /documents`, `PATCH/DELETE /documents/:id` | ✅ |
| Chia sẻ, đổi quyền | `POST /documents/:id/share { userId, role }` (upsert) | ✅ (theo mã người dùng) |
| Soạn cùng lúc, presence, con trỏ | WS `/realtime?token=`: `join`, `update`, `awareness` / `sync`, `update`, `awareness` | ✅ |
| Viết lúc mất mạng rồi tự gửi | Sau `sync`, client gửi phần server còn thiếu (`encodeStateAsUpdate` theo state vector của server) | ✅ |

Kết quả test end-to-end hai tài khoản thật: 25/25 bước qua (đăng ký, lỗi 409/400, tạo tài liệu, chia sẻ, đồng bộ hai chiều,
hội tụ nội dung, caret và tên người khác, pin trên lề hiện diện, mất mạng rồi gửi bù, đổi tên, hạ quyền xuống Người xem,
mở tài liệu không có quyền, xoá, đăng xuất).

Để chạy được backend trong môi trường test, các sửa ở mục 2, 4, 5 đã được áp dụng tạm trên một bản sao; repo backend chưa bị thay đổi.

## Biến môi trường backend cần khi deploy

`DATABASE_URL`, `REDIS_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `CORS_ORIGINS` (domain của frontend), `PORT`.
WebSocket cần chạy sau TLS (`wss://`) khi frontend ở HTTPS.
