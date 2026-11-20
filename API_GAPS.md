# Backend: phần còn thiếu

Backend ở nhánh `feat/railway-deploy-and-apis` của repo
[`Realtime-collaborator`](https://github.com/vyhuynhnguyenvy16/Realtime-collaborator) đã có mọi API
mà giao diện này dùng, và đang chạy trên Railway. File này chỉ còn những thứ chưa làm.

## Đã xong (2026-11-20)

- Chạy được và deploy được: đủ dependency, sửa DI, migration khớp schema, CORS, PORT, `/health` không lộ dữ liệu.
- Chia sẻ bằng email, danh sách thành viên kèm email và tên, gỡ quyền, rời tài liệu.
- `GET /documents` trả về quyền của tôi và chủ sở hữu; 404 và 403 tách riêng.
- Tên hiển thị (`PATCH /auth/me`), đăng xuất thu hồi refresh token.
- Lịch sử phiên bản: liệt kê, lưu, xem, khôi phục.
- Realtime: chặn Người xem gửi update, `ack` sau khi ghi DB, đẩy ngay thay đổi quyền, tên, gỡ quyền, xoá.
- Redis không bắt buộc khi chạy một instance; bỏ echo; heartbeat; giải phóng bộ nhớ khi phòng trống.

## Còn lại

| Ưu tiên | Việc | Giao diện cần gì |
|---|---|---|
| P1 | Bình luận: model `Comment` + `/documents/:id/comments` (CRUD, resolve), đẩy qua WebSocket | Bật `FEATURES.comments`, thêm tab trong khung bên |
| P1 | Ghi `user_id` vào `DocumentEvent` | Nhật ký “ai sửa gì” (`FEATURES.activity`), tên người tạo cho bản tự động lưu |
| P2 | Thông báo “có tài liệu mới được chia sẻ” (WebSocket theo user) | Hiện ngay trong danh sách, thay cho làm mới khi quay lại tab |
| P2 | Xoá mềm + khôi phục tài liệu | Nút Hoàn tác sau khi xoá |
| P2 | Mời email chưa có tài khoản (lời mời chờ) | Thêm người trước khi họ đăng ký |
| P2 | Giới hạn tần suất (login, WebSocket) | Không |
| P2 | Nhiều instance: đẩy sự kiện quyền/tên qua Redis (hiện chỉ trong một instance) | Không |
