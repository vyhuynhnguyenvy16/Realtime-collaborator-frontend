# Hướng dẫn cho AI làm việc trong repo này

Mọi thay đổi giao diện (HTML, CSS, màu, chữ, khoảng cách, chuyển động, component) **phải** tuân theo
[`DESIGN_RULES.md`](DESIGN_RULES.md). Tóm tắt những luật hay bị vi phạm nhất:

- Chỉ dùng token trong `:root` (mục 10). Không viết mã hex, cỡ chữ px, ms hay bo góc trực tiếp trong component.
- Cỡ chữ chỉ có 8 bậc (12 / 14 / 16 / 18 / 20 / 24 / 30 / 36px); chữ giao diện 16px; không chữ < 12px.
- Nền trung tính; màu nhấn indigo chỉ cho hành động chính, liên kết, mục đang chọn, vòng focus; tối đa 1 nút chính mỗi màn hình.
- Màu của con người (6 mực) chỉ cho con trỏ, avatar, pin; không dùng cho giao diện.
- Chuyển động: chỉ `opacity` và `transform`, dùng `--dur-*` và `--ease-enter` / `--ease-exit`, vào chậm hơn ra, ≤ 400ms; tôn trọng `prefers-reduced-motion`.
- WCAG 2.2 AA: chữ ≥ 4.5 : 1, viền control và icon ≥ 3 : 1, vòng focus 2px, vùng chạm ≥ 24px (mục tiêu 40–44px).
- Xong việc khi đã chạy checklist mục 11 và chụp màn hình 1440px + 390px, sáng + tối.

Giao thức backend và danh sách API còn thiếu: `README.md`, `API_GAPS.md`.
