# Quy tắc thiết kế giao diện — Realtime Collaborator

Tài liệu này là **luật** cho mọi người và mọi AI khi sửa hoặc thiết kế mới giao diện của dự án.
Mỗi con số ở đây đều có nguồn (mục 13). Khi cần một giá trị chưa có, chọn giá trị gần nhất trong thang đo,
**không tự đặt số mới**.

- **PHẢI** = bắt buộc. Vi phạm thì sửa trước khi coi là xong.
- **NÊN** = mặc định. Chỉ làm khác khi có lý do ghi rõ trong commit hoặc PR.
- **KHÔNG** = cấm.

---

## 0. Cách AI dùng tài liệu này

1. Đọc mục 1 (nguyên tắc) và mục 11 (Definition of Done) trước khi đụng vào CSS hay HTML.
2. Chỉ dùng **token** ở mục 10 (`var(--…)`). **KHÔNG** viết mã màu hex, cỡ chữ, thời lượng hay bo góc trực tiếp trong rule CSS của component.
3. Một thay đổi giao diện chỉ được coi là xong khi:
   - đã chụp màn hình ở 1440px và 390px;
   - đã xem cả chế độ sáng lẫn tối;
   - đã đi qua checklist ở mục 11.
4. Nếu yêu cầu của người dùng mâu thuẫn với luật này, làm theo người dùng và ghi lại điểm lệch.

---

## 1. Năm nguyên tắc cốt lõi

1. **Nội dung là nhân vật chính.** Tài liệu đang soạn phải là vùng lớn nhất, sáng nhất và tĩnh nhất trên màn hình.
   Chrome (thanh trên, khung bên, menu) lùi về phía sau: màu trung tính, không hoạ tiết.
2. **Một màu nhấn duy nhất.** Màu thương hiệu (indigo) chỉ dùng cho hành động chính, liên kết, trạng thái chọn và vòng focus.
   **KHÔNG** dùng nó làm màu nền diện rộng. Màu còn lại thuộc về **con người**: mỗi cộng tác viên một "mực".
3. **Hệ thống thay cho cảm hứng.** Mọi cỡ chữ, khoảng cách, màu, bo góc, thời lượng chuyển động đều lấy từ một thang đo có giới hạn.
   Refactoring UI (Adam Wathan & Steve Schoger) khuyên đặt hệ thống trước, ví dụ 8–10 sắc độ cho mỗi màu và một thang cỡ chữ,
   để không phải quyết định lại mỗi lần thiết kế.
4. **Khả năng tiếp cận là sàn, không phải trần.** WCAG 2.2 mức AA là tối thiểu, không có ngoại lệ.
5. **Chuyển động để giải thích, không để trang trí.** Apple HIG cảnh báo rằng animation thừa hoặc quá đà làm người dùng
   phân tâm và thấy rời rạc. Mỗi animation phải trả lời được câu hỏi "nó cho người dùng biết điều gì?".

---

## 2. Chữ (typography)

### 2.1 Phông chữ

| Vai trò | Phông | Lý do |
|---|---|---|
| Giao diện (nút, nhãn, danh sách, menu) | **Be Vietnam Pro** | Do Lâm Bảo, Tony Le và ViệtAnh Nguyễn thiết kế, dấu tiếng Việt được tinh chỉnh riêng; mã nguồn mở OFL |
| Nội dung tài liệu (thân bài trong editor) | **Literata** | Serif dành cho đọc dài, có đủ dấu tiếng Việt |
| Số liệu, mã | `ui-monospace, "SF Mono", Menlo, Consolas, monospace` | Chỉ dùng cho mã thật, **KHÔNG** dùng cho nhãn |

- **PHẢI** dùng tối đa 2 họ phông (không tính monospace).
- **PHẢI** có fallback: `"Be Vietnam Pro", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`.
- **PHẢI** chỉ tải các độ đậm đang dùng: **400, 500, 600, 700**. **KHÔNG** dùng 100–300, vì nét mảnh khó đọc.
  Apple HIG cũng nhắc: dùng nét mảnh thì phải tăng cỡ chữ lên.
- **PHẢI** đặt `font-display: swap` để chữ hiện ngay bằng phông dự phòng.
- **PHẢI** chọn phông có đủ dấu tiếng Việt (ă â đ ê ô ơ ư và 5 dấu thanh). Kiểm tra bằng câu: *"Tiếng Việt có dấu: Ửng hồng, Ỷ lại, Đường xa."*

### 2.2 Thang cỡ chữ

Chỉ dùng **8 bậc** dưới đây. Cách bậc tối thiểu khoảng 15–25%: Refactoring UI khuyên hai giá trị cạnh nhau trong thang
không nên gần nhau hơn khoảng 25%.

| Token | Cỡ | Line-height | Độ đậm | Dùng cho |
|---|---|---|---|---|
| `--text-xs` | 12px | 16px | 500 | Chú thích, thời gian, số đếm. **Nhỏ nhất được phép** |
| `--text-sm` | 14px | 20px | 400/500 | Nhãn form, metadata, dòng phụ trong danh sách, tooltip |
| `--text-md` | 16px | 24px | 400 | **Chữ giao diện mặc định**: nút, ô nhập, danh sách, đoạn văn |
| `--text-lg` | 18px | 28px | 400 | **Thân bài tài liệu** (Literata), lời dẫn |
| `--text-xl` | 20px | 28px | 600 | Tiêu đề hộp thoại, tiêu đề khung bên |
| `--text-2xl` | 24px | 32px | 600 | Tiêu đề trang (danh sách tài liệu), H2 trong tài liệu |
| `--text-3xl` | 30px | 38px | 700 | H1 trong tài liệu, tiêu đề màn hình trống |
| `--text-4xl` | 36px | 44px | 700 | Chỉ cho màn hình đăng nhập hoặc trang giới thiệu |

Căn cứ:
- Material Design 3 đặt Body Large ở 16px / line-height 24px / độ đậm 400.
- Apple đặt cỡ mặc định 17pt cho iOS, tối thiểu 11pt.
- Butterick (*Practical Typography*) khuyên chữ thân bài trên web cỡ 15–25px.

Luật kèm theo:
- **KHÔNG** dùng cỡ lẻ (12.5px, 13.5px, 17.5px…), cũng **KHÔNG** dùng cỡ nằm ngoài bảng.
- **KHÔNG** dùng chữ nhỏ hơn 12px cho bất cứ thứ gì người dùng cần đọc.
- **PHẢI** viết cỡ chữ bằng `rem` (1rem = 16px), để người dùng phóng chữ trong trình duyệt thì giao diện phóng theo.
- Trong một component **NÊN** dùng tối đa 2–3 cỡ chữ. Tạo phân cấp bằng **độ đậm và màu** (`--text` vs `--text-2`) trước, rồi mới tăng cỡ.

### 2.3 Dòng và đoạn

- **Độ dài dòng**: Butterick khuyên trung bình 45–90 ký tự, tính cả dấu cách. Thân bài tài liệu **PHẢI** có `max-width: 68ch`.
- **Line-height**: Butterick khuyên 120–145% cỡ chữ. Luật cụ thể:
  - Chữ giao diện: 1.5.
  - Thân bài tài liệu (Literata 18px): 1.6, vì tiếng Việt có dấu chồng ở cả trên lẫn dưới nên cần thoáng hơn chuẩn Latin.
  - Tiêu đề: 1.2–1.3.
- Khoảng cách giữa các đoạn trong tài liệu: `0.75em`. **KHÔNG** thụt đầu dòng.
- Căn trái. **KHÔNG** căn đều hai bên (justify) trên web.
- `letter-spacing`: chỉ tiêu đề ≥24px dùng `-0.01em`; còn lại để 0.
- Số đổi liên tục (thời gian, số người, số phiên bản) **PHẢI** dùng `font-variant-numeric: tabular-nums` để không nhảy chữ.

### 2.4 Cấm

- **KHÔNG** viết HOA toàn bộ cho nhãn, nút hay tiêu đề nhỏ. Viết hoa chữ cái đầu câu (sentence case).
- **KHÔNG** in nghiêng, đổi màu hay gạch chân một từ trong tiêu đề để "nhấn".
- **KHÔNG** dùng font monospace cho nhãn hay metadata để trông "kỹ thuật".

---

## 3. Màu sắc

### 3.1 Cách tổ chức: thang 12 bậc, dùng theo vai trò

Dự án dùng mô hình của **Radix Colors** (WorkOS): mỗi màu có 12 bậc, mỗi bậc thiết kế cho một việc.

| Bậc | Việc |
|---|---|
| 1–2 | Nền ứng dụng, nền phụ |
| 3–5 | Nền component: thường, hover, đang chọn |
| 6–8 | Viền: phân cách nhạt, viền component, viền khi hover |
| 9–10 | Nền đặc (nút chính) và nền đặc khi hover |
| 11 | Chữ độ tương phản thấp (chữ phụ) |
| 12 | Chữ độ tương phản cao (chữ chính) |

Bảng màu: **Slate** (xám hơi lạnh, làm nền và chữ) + **Indigo** (màu nhấn duy nhất).
Refactoring UI khuyên xám nên pha chút sắc màu, không dùng xám trung tính tuyệt đối. Slate có sẵn chút xanh, hợp với indigo.

Component **KHÔNG** gọi bậc số trực tiếp. Component chỉ dùng **token theo vai trò** (mục 3.2).

### 3.2 Token màu (giá trị đã kiểm tra độ tương phản)

| Token | Sáng | Tối | Dùng cho |
|---|---|---|---|
| `--bg` | `#F9F9FB` (slate 2) | `#111113` (slate 1) | Nền ứng dụng, phía sau trang giấy |
| `--surface` | `#FFFFFF` | `#18191B` (slate 2) | Trang giấy, thẻ, hộp thoại, khung bên |
| `--surface-sunken` | `#F0F0F3` (slate 3) | `#212225` (slate 3) | Ô nhập, vùng lõm, thanh lề |
| `--hover` | `#E8E8EC` (slate 4) | `#272A2D` (slate 4) | Nền khi hover của mục danh sách hoặc nút ghost |
| `--border` | `#D9D9E0` (slate 6) | `#363A3F` (slate 6) | Đường phân cách **trang trí** |
| `--border-strong` | `#8B8D98` (slate 9) | `#696E77` (slate 9) | Viền ô nhập, checkbox, select: **viền giúp nhận ra control** |
| `--text` | `#1C2024` (slate 12) | `#EDEEF0` (slate 12) | Chữ chính |
| `--text-2` | `#60646C` (slate 11) | `#B0B4BA` (slate 11) | Chữ phụ, metadata, placeholder |
| `--accent` | `#3E63DD` (indigo 9) | `#3E63DD` | Nền nút chính, trạng thái chọn đặc |
| `--accent-hover` | `#3358D4` (indigo 10) | `#3358D4` | Nút chính khi hover |
| `--accent-text` | `#3A5BC7` (indigo 11) | `#9EB1FF` (indigo 11) | Liên kết, chữ màu nhấn, icon đang chọn |
| `--accent-soft` | `#EDF2FE` (indigo 3) | `#182449` (indigo 3) | Nền mục đang chọn, nền huy hiệu |
| `--focus` | `#3E63DD` | `#9EB1FF` | Vòng focus |
| `--on-accent` | `#FFFFFF` | `#FFFFFF` | Chữ trên nền `--accent` |

Độ tương phản đo bằng công thức WCAG:

| Cặp màu | Sáng | Tối | Yêu cầu |
|---|---|---|---|
| `--text` trên `--surface` | 16.4 : 1 | 15.2 : 1 | 4.5 : 1 |
| `--text-2` trên `--surface` | 5.9 : 1 | 8.5 : 1 | 4.5 : 1 |
| `--text-2` trên `--surface-sunken` | 5.2 : 1 | 7.6 : 1 | 4.5 : 1 |
| `--accent-text` trên `--surface` | 6.0 : 1 | 8.5 : 1 | 4.5 : 1 |
| `--on-accent` trên `--accent` | 5.2 : 1 | 5.2 : 1 | 4.5 : 1 |
| `--on-accent` trên `--accent-hover` | 6.0 : 1 | 6.0 : 1 | 4.5 : 1 |
| `--border-strong` trên `--surface` | 3.3 : 1 | 3.4 : 1 | 3 : 1 (control) |
| `--border` trên `--surface` | 1.4 : 1 | 1.5 : 1 | Chỉ dùng trang trí |

### 3.3 Màu trạng thái

| Trạng thái | Chữ / icon (sáng) | Nền nhạt (sáng) | Chữ / icon (tối) |
|---|---|---|---|
| Thành công (đã lưu) | `#18794E` | `#E6F6EB` | `#3DD68C` |
| Cảnh báo (mất kết nối) | `#9A5700` | `#FFF7C2` | `#FFCA16` |
| Lỗi | `#CE2C31` | `#FFEBEC` | `#FF9592` |

Tất cả cặp chữ/nền trên đều ≥ 4.5 : 1.

- **PHẢI** kèm icon hoặc chữ cho trạng thái. WCAG 1.4.1 cấm dùng màu làm cách **duy nhất** để truyền thông tin.
- **KHÔNG** dùng màu trạng thái làm màu người dùng, và ngược lại.

### 3.4 Mực của cộng tác viên (con trỏ, avatar, pin trên lề)

6 mực, gán ổn định theo `userId` (hàm `colorFor`). Nhãn tên trên con trỏ: ở chế độ sáng chữ trắng trên nền mực,
ở chế độ tối chữ `#111113` trên mực sáng.

| Mực | Sáng | Tối | Chữ trắng trên mực (sáng) | Mực trên `--surface` (tối) |
|---|---|---|---|---|
| rose | `#C92A62` | `#FF7BA8` | 5.3 | 7.3 |
| green | `#0B7F57` | `#4FD6A4` | 5.0 | 9.6 |
| amber | `#A85F00` | `#FFB547` | 4.9 | 10.0 |
| cyan | `#0E7490` | `#3BC9DB` | 5.4 | 8.9 |
| indigo | `#3E63DD` | `#9EB1FF` | 5.2 | 8.5 |
| plum | `#9E3FA8` | `#E29BEA` | 5.6 | 8.5 |

- Mực chỉ xuất hiện ở **dấu vết của con người**: con trỏ, vùng chọn (độ mờ 20%), avatar, pin trên lề hiện diện.
- **KHÔNG** dùng mực cho nút, nền hay viền của giao diện.

### 3.5 Chế độ tối

- **PHẢI** hỗ trợ `prefers-color-scheme` và cho người dùng chọn tay qua `data-theme`.
- **KHÔNG** dùng nền `#000` thuần, cũng **KHÔNG** dùng chữ `#FFF` thuần trên nền tối.
  Material khuyên bề mặt tối `#121212` và màu nhấn đã giảm độ bão hoà; chữ trắng tinh trên nền tối bị "rung" và nhoè.
- Ở chế độ tối, độ cao (elevation) thể hiện bằng **bề mặt sáng hơn** (`--surface` sáng hơn `--bg`), không bằng bóng đổ.
- Ở chế độ tối, màu nhấn và mực dùng tông sáng, ít bão hoà (bảng trên đã chọn sẵn).

### 3.6 Trạng thái tương tác (state layer)

Material Design 3 phủ một lớp cùng màu nội dung lên component, với độ mờ cố định:

| Trạng thái | Lớp phủ |
|---|---|
| Hover | 8% |
| Focus, nhấn (pressed) | 12% |
| Kéo (drag) | 16% |
| Vô hiệu (disabled) | `opacity: 0.38`, không phản hồi hover hay nhấn |

Ví dụ hover cho nút ghost: `background: color-mix(in srgb, currentColor 8%, transparent)`.

### 3.7 Phân bổ màu trên một màn hình

- Khoảng ≥ 90% diện tích là trung tính (`--bg`, `--surface`, chữ).
- Màu nhấn chỉ ở 1 nút chính, liên kết và mục đang chọn.
- Mực người dùng chỉ ở nơi có người.
- Mỗi màn hình có **tối đa 1 nút nền đặc màu nhấn**. Các hành động khác dùng nút viền hoặc nút ghost.

---

## 4. Khoảng cách và bố cục

### 4.1 Thang khoảng cách (bội số của 4px)

Thang này tương tự IBM Carbon (2, 4, 8, 12, 16, 24, 32, 40, 48px…) và hệ thống thiết kế của chính phủ Mỹ USWDS (bội số 8px).

| Token | Giá trị | Dùng cho |
|---|---|---|
| `--space-1` | 4px | Icon cạnh chữ, khoảng hở trong chip |
| `--space-2` | 8px | Khoảng giữa các nút trong một nhóm; giữa nhãn và ô nhập |
| `--space-3` | 12px | Padding ngang của nút nhỏ; khoảng giữa các mục danh sách |
| `--space-4` | 16px | Padding của thẻ hoặc khung; khoảng giữa các trường form |
| `--space-6` | 24px | Padding hộp thoại; khoảng giữa các nhóm |
| `--space-8` | 32px | Khoảng giữa các khối lớn |
| `--space-12` | 48px | Lề trên và dưới của trang giấy |
| `--space-16` | 64px | Khoảng thở ở màn hình trống hoặc đăng nhập |

- **PHẢI** dùng token. **KHÔNG** dùng 5, 6, 10, 14, 18, 22px…
- **Gần thì liên quan**: khoảng cách *trong* một nhóm phải nhỏ hơn khoảng cách *giữa* các nhóm.
  Refactoring UI: khi dùng khoảng trống để gom nhóm, luôn để khoảng quanh nhóm lớn hơn khoảng bên trong nhóm.
- **Bắt đầu với nhiều khoảng trắng rồi bớt dần**, không làm ngược lại.

### 4.2 Bo góc: chỉ 3 giá trị

| Token | Giá trị | Dùng cho |
|---|---|---|
| `--radius-sm` | 6px | Nút, ô nhập, chip vuông, mục danh sách |
| `--radius-md` | 10px | Thẻ, trang giấy, menu, toast |
| `--radius-lg` | 14px | Hộp thoại, bottom sheet |
| `--radius-full` | 999px | Avatar, chip trạng thái dạng viên thuốc |

Phần tử lồng bên trong phải có bo góc ≤ phần tử bọc ngoài.

### 4.3 Độ cao (bóng đổ): 3 mức

| Token | Giá trị (sáng) | Dùng cho |
|---|---|---|
| `--shadow-1` | `0 1px 2px rgb(16 24 40 / .06)` | Trang giấy trên nền `--bg` |
| `--shadow-2` | `0 4px 12px rgb(16 24 40 / .08), 0 1px 3px rgb(16 24 40 / .06)` | Menu, toast, popover |
| `--shadow-3` | `0 16px 40px rgb(16 24 40 / .14)` | Hộp thoại |

Ở chế độ tối, giảm bóng xuống gần bằng 0 và thay bằng bề mặt sáng hơn cộng viền `--border`.

### 4.4 Vùng chạm và kích thước control

- WCAG 2.2 (tiêu chí 2.5.8, mức AA): vùng chạm tối thiểu **24 × 24 CSS px**.
- Apple khuyên 44 × 44pt; Material khuyên 48dp.
- Luật của dự án:
  - Nút và ô nhập **cao 40px** trên desktop, **44px** trên màn hình ≤ 980px.
  - Nút chỉ có icon rộng tối thiểu 40px.
  - **KHÔNG** có vùng chạm nào nhỏ hơn 24px.

### 4.5 Breakpoint

| Tên | Chiều rộng | Bố cục |
|---|---|---|
| Điện thoại | < 600px | Một cột. Khung bên thành bottom sheet. Ẩn chữ trên nút icon. |
| Máy tính bảng | 600–979px | Một cột + khung bên phủ lên (overlay) |
| Desktop | ≥ 980px | Trang giấy + khung bên cố định, thu gọn được |

- **PHẢI** kiểm tra ở 390px và 1440px; không có cuộn ngang.
- Trang giấy là vùng lớn nhất. Khung bên rộng 320px, mặc định đóng, nhớ trạng thái đóng/mở.

---

## 5. Chuyển động

### 5.1 Nguyên tắc

- **Nhanh và chính xác.** Apple HIG: phản hồi bằng animation ngắn và chính xác thì nhẹ nhàng, không gây phiền,
  và thường truyền tải thông tin tốt hơn animation nổi bật.
- **Không animation cho thao tác lặp liên tục** (gõ phím, đổi tab, bật/tắt). Apple HIG khuyên tránh thêm chuyển động cho tương tác diễn ra thường xuyên.
- **Có lý do.** Chỉ animate để cho thấy: cái gì xuất hiện hay biến mất, nó đến từ đâu, cái gì vừa đổi.
- **Thời lượng theo khoảng cách.** NN/g: hầu hết animation nên nằm trong 100–500ms, tuỳ độ phức tạp và quãng đường di chuyển.
  Phần tử đi càng xa thì animation càng dài.
- **Ngưỡng cảm nhận.** NN/g: phản hồi trong 0.1 giây thì người dùng thấy như tức thì; quá 1 giây là mất mạch suy nghĩ.
  Phản hồi cho cú nhấp **PHẢI** bắt đầu trong ≤ 100ms.

### 5.2 Token thời lượng

Theo IBM Carbon: fast-01 70ms, fast-02 110ms, moderate-01 150ms, moderate-02 240ms, slow-01 400ms.

| Token | Giá trị | Dùng cho |
|---|---|---|
| `--dur-1` | 70ms | Nhấn nút, bật/tắt, đổi màu khi hover |
| `--dur-2` | 110ms | Mờ dần (fade), tooltip, thoát của phần tử nhỏ |
| `--dur-3` | 150ms | Menu, dropdown mở; chuyển giữa các view |
| `--dur-4` | 240ms | Hộp thoại, khung bên, toast xuất hiện |
| `--dur-5` | 400ms | Thay đổi lớn hiếm khi xảy ra (bottom sheet toàn màn hình) |

- **KHÔNG** vượt 400ms cho bất kỳ chuyển động giao diện nào.
- **PHẢI** để chiều thoát (exit) nhanh hơn chiều vào (enter), khoảng 60–70% thời lượng.

### 5.3 Token đường cong (easing)

| Token | Giá trị | Nguồn | Dùng cho |
|---|---|---|---|
| `--ease-standard` | `cubic-bezier(0.2, 0, 0, 1)` | Material 3, standard | Phần tử di chuyển hoặc đổi kích thước trong màn hình |
| `--ease-enter` | `cubic-bezier(0.05, 0.7, 0.1, 1)` | Material 3, emphasized decelerate | Phần tử **xuất hiện**: hộp thoại, khung bên, toast |
| `--ease-exit` | `cubic-bezier(0.3, 0, 0.8, 0.15)` | Material 3, emphasized accelerate | Phần tử **biến mất** |
| `--ease-linear` | `linear` | | Chỉ cho đổi màu, đổi độ mờ, thanh tiến trình |

**KHÔNG** dùng `ease`, `ease-in-out` mặc định hay đường cong nảy (bounce, overshoot) trong ứng dụng làm việc.

### 5.4 Công thức cho từng tình huống (áp dụng y nguyên)

| Tình huống | Vào | Ra |
|---|---|---|
| Hover nút hoặc mục danh sách | `background-color` `--dur-1` `--ease-linear` | như vào |
| Nhấn nút | `transform: scale(.98)` `--dur-1` | trả về `--dur-1` |
| Menu, dropdown, tooltip | `opacity 0→1` + `translateY(-4px)→0`, `--dur-3` `--ease-enter` | `opacity` `--dur-2` `--ease-exit` |
| Hộp thoại | `opacity 0→1` + `scale(.96)→1`, `--dur-4` `--ease-enter`; nền mờ `opacity` `--dur-4` | `opacity` + `scale(.98)`, `--dur-3` `--ease-exit` |
| Khung bên (desktop) | `translateX(16px)→0` + `opacity`, `--dur-4` `--ease-enter` | `--dur-3` `--ease-exit` |
| Bottom sheet (điện thoại) | `translateY(100%)→0`, `--dur-4` `--ease-enter` | `--dur-3` `--ease-exit` |
| Toast | `translateY(8px)→0` + `opacity`, `--dur-4` `--ease-enter` | `opacity` `--dur-2` |
| Chuyển màn hình (danh sách → editor) | Crossfade `opacity` `--dur-3`. **KHÔNG** trượt cả trang | |
| Mục mới vào danh sách | Nền `--accent-soft` mờ dần về trong suốt trong 1.2s (tín hiệu "mới") | |
| Nhãn tên trên con trỏ | Hiện ngay; sau 2.5s không hoạt động thì thu thành chấm, `opacity` `--dur-3` | |
| Trạng thái "Đang lưu…" | Chấm nhịp `opacity` 1s, chỉ khi thật sự đang chờ máy chủ | |

- **CHỈ** animate `opacity` và `transform` (cùng `background-color` và `color` cho hover).
  **KHÔNG** animate `width`, `height`, `top`, `left`, `margin`, vì chúng ép trình duyệt tính lại bố cục và gây giật.
- **KHÔNG** có animation lặp vô hạn, trừ chỉ báo đang tải hoặc đang lưu.
- **KHÔNG** có parallax, cuộn bị chiếm quyền (scroll-jacking), hiệu ứng "fade-up" cho từng khối khi cuộn.
- **KHÔNG** có thứ gì nhấp nháy quá 3 lần mỗi giây (WCAG 2.3.1).

### 5.5 Giảm chuyển động

WCAG 2.3.3 yêu cầu tắt được animation do tương tác gây ra, kỹ thuật C39 dùng `prefers-reduced-motion`.
Tinh thần là **giảm, không xoá**:

```css
@media (prefers-reduced-motion: reduce) {
  :root { --dur-3: 1ms; --dur-4: 1ms; --dur-5: 1ms; }
  /* Giữ fade ngắn (opacity --dur-2) để vẫn thấy cái gì vừa xuất hiện; bỏ mọi translate/scale. */
  *, *::before, *::after { scroll-behavior: auto !important; }
}
```

**KHÔNG** tắt cả chỉ báo đang tải; người dùng vẫn cần biết hệ thống đang làm việc.

---

## 6. Component

### 6.1 Nút

| Loại | Kiểu | Khi nào |
|---|---|---|
| Chính | Nền `--accent`, chữ `--on-accent`, hover `--accent-hover` | Tối đa 1 trên mỗi màn hình hoặc hộp thoại |
| Phụ | Nền `--surface`, viền `--border-strong`, chữ `--text` | Hành động thứ hai |
| Ghost | Không nền, chữ `--text` hoặc `--text-2`, hover lớp phủ 8% | Thanh công cụ, hành động phụ trong danh sách |
| Nguy hiểm | Nền `#CE2C31`, chữ trắng | Chỉ ở bước xác nhận xoá |

- Cao 40px (44px trên mobile), padding ngang `--space-4`, chữ `--text-md` độ đậm 500, `--radius-sm`.
- Icon trong nút 16px, cách chữ `--space-2`.
- Nhãn nút là **động từ cụ thể**: "Lưu phiên bản", "Thêm người". **KHÔNG** ghi "OK" hay "Gửi".
  Cùng một hành động thì dùng cùng một từ trong suốt luồng: nút "Xoá" thì toast báo "Đã xoá".
- Đang xử lý: giữ nguyên độ rộng, đổi nhãn ("Đang lưu…"), `aria-busy="true"`, chặn bấm lại.

### 6.2 Ô nhập

- Cao 40px (44px mobile), nền `--surface`, viền 1px `--border-strong`, `--radius-sm`, padding ngang `--space-3`, chữ `--text-md`.
  Chữ 16px còn giúp iOS không tự phóng to màn hình khi focus.
- Nhãn luôn hiển thị, nằm phía trên ô (`--text-sm`, độ đậm 500, cách ô `--space-2`). **KHÔNG** dùng placeholder thay nhãn.
- Lỗi: viền và chữ màu lỗi, thông báo ngay dưới ô nói **cách sửa**, `aria-invalid` + `aria-describedby`.
- Kiểm tra (validate) khi rời ô hoặc khi gửi, **KHÔNG** kiểm tra theo từng phím gõ.

### 6.3 Focus

- **PHẢI** có vòng focus nhìn thấy được cho mọi phần tử tương tác: `outline: 2px solid var(--focus); outline-offset: 2px`.
  WCAG 2.2 (2.4.13) yêu cầu vòng focus dày tối thiểu 2px và tương phản 3 : 1.
- Chỉ hiện vòng focus khi dùng bàn phím (`:focus-visible`). **KHÔNG** bao giờ viết `outline: none` mà không có thay thế.

### 6.4 Hộp thoại

- Rộng 480px (nhỏ) hoặc 640px (vừa), `--radius-lg`, `--shadow-3`, padding `--space-6`.
- Nền mờ phía sau: `rgb(16 24 40 / .4)` (sáng) hoặc `rgb(0 0 0 / .6)` (tối).
- Tiêu đề `--text-xl` 600. Nút ở chân, căn phải: nút phụ trước, nút chính sau cùng.
- Đóng được bằng Esc, nút ×, và nút huỷ. Focus vào phần tử đầu tiên; đóng thì trả focus về nút đã mở hộp thoại.

### 6.5 Toast

- Góc dưới bên phải (desktop) hoặc dưới giữa (mobile). `--surface` đảo màu (nền `--text`, chữ `--surface`), `--radius-md`, `--shadow-2`.
- Tối đa 2 toast cùng lúc, tự ẩn sau 4s. Toast có hành động (Hoàn tác) giữ 6s.
- Vùng chứa toast có `aria-live="polite"`.

### 6.6 Avatar và hiện diện

- 28px trong thanh trên, 32px trong danh sách người. Chữ cái đầu `--text-xs` 600. Nền là mực của người đó.
- Viền 2px màu nền bên dưới để các avatar xếp chồng tách nhau. Hiển thị tối đa 4 avatar, phần còn lại gom thành "+N".
- Chấm trạng thái 8px: xanh = đang hoạt động, xám = không hoạt động. Luôn có `title` hoặc chữ đi kèm.

### 6.7 Danh sách tài liệu

- Mỗi hàng cao 52px: icon 20px, tên (`--text-md` 500), chủ sở hữu và thời gian (`--text-sm` `--text-2`).
- Hover dùng nền `--hover`. Hành động phụ (chia sẻ, xoá) luôn hiện trên thiết bị cảm ứng, chỉ hiện khi hover hoặc focus trên desktop.

### 6.8 Icon

- Một bộ duy nhất, nét (outline) 1.5px, đầu nét tròn. Cỡ 16px (trong chữ), 20px (nút), 24px (trống hoặc minh hoạ nhỏ).
- Icon đứng một mình **PHẢI** có `aria-label`. Icon trang trí có `aria-hidden="true"`.

### 6.9 Trạng thái trống, đang tải, lỗi

- **Trống**: một câu nói đây là gì + một nút hành động. Ví dụ: "Bạn chưa có tài liệu nào" + [Tạo tài liệu].
- **Đang tải** < 1s: không hiện gì. Từ 1s trở lên: skeleton đúng hình dạng nội dung, **không** dùng spinner giữa màn hình.
- **Lỗi**: nói chuyện gì xảy ra và cách sửa, có nút "Thử lại". **KHÔNG** xin lỗi chung chung.

---

## 7. Chữ trong giao diện (microcopy tiếng Việt)

- Viết như người hướng dẫn: câu ngắn, động từ rõ, ngôi "bạn".
- Gọi tên theo cách người dùng hiểu: "Gỡ quyền truy cập", không phải "Revoke ACL".
- Lỗi nói **cách sửa**: "Mật khẩu cần ít nhất 6 ký tự", không phải "Mật khẩu không hợp lệ".
- Trạng thái lưu phải trung thực: "Đã lưu" chỉ khi máy chủ xác nhận (`ack`).
- **KHÔNG** dùng dấu "→" cuối nhãn, **KHÔNG** nối metadata bằng " · " quá 2 mục, **KHÔNG** đặt nhãn nhỏ viết hoa phía trên mọi tiêu đề.

---

## 8. Khả năng tiếp cận (WCAG 2.2 AA)

- Tương phản chữ ≥ 4.5 : 1 (chữ lớn ≥ 24px, hoặc ≥ 18.67px đậm: ≥ 3 : 1). Viền control, icon và vòng focus ≥ 3 : 1.
  WebAIM lưu ý không được làm tròn lên: `#777777` trên nền trắng chỉ đạt 4.47 : 1, tức là **trượt**.
- Mọi chức năng dùng được bằng bàn phím. Thứ tự Tab theo thứ tự đọc. Có liên kết "Bỏ qua tới nội dung chính".
- Vùng chạm ≥ 24px (mục 4.4).
- Nội dung giữ nguyên khi phóng chữ 200%. Dùng `rem`, không khoá chiều cao chứa chữ.
- Trạng thái thay đổi (đã lưu, mất kết nối, người mới vào) được thông báo qua `role="status"` hoặc `aria-live`.
- HTML ngữ nghĩa trước, ARIA sau: `<button>` cho hành động, `<a>` cho điều hướng, `<dialog>` cho hộp thoại.

---

## 9. Những lỗi đã mắc trong giao diện hiện tại (phải sửa)

Kiểm tra `src/styles/app.css` ngày 2026-11-20:

| Vấn đề | Hiện tại | Vi phạm | Sửa thành |
|---|---|---|---|
| Nền chrome màu cobalt bão hoà phủ toàn màn hình, thêm hoạ tiết chấm | `--desk:#2B3FD6` + `radial-gradient` | Nguyên tắc 1–2, mục 3.7 | `--bg` trung tính; bỏ hoạ tiết; màu nhấn chỉ cho hành động |
| Chế độ tối dùng nền xanh đậm bão hoà | `#121845` | Mục 3.5 | `#111113` / `#18191B` |
| Quá nhiều cỡ chữ | **18 cỡ khác nhau**, gồm 12.5, 13.5, 17.5px | Mục 2.2 | 8 bậc token |
| Chữ giao diện mặc định 15px | `font:15px/1.5` | Mục 2.2 | 16px (`--text-md`) |
| Mã màu viết trực tiếp | **45 mã hex**, ví dụ `#fff`, `#1B2A9E`, `#7CF0B8` | Mục 0 | Token mục 10 |
| Viền nút ghost trắng 28% trên nền cobalt | Khoảng 2.2 : 1 | WCAG 1.4.11 (cần 3 : 1) | Viền `--border-strong` trên nền trung tính |
| Thời lượng chuyển động tuỳ hứng | 13 giá trị khác nhau, 120–500ms, một đường cong cho mọi thứ | Mục 5.2–5.3 | 5 token thời lượng + 3 đường cong vào/ra |
| Hộp thoại, menu, khung bên bật tắt cụt, không có chuyển tiếp | `<dialog>` hiện ngay | Mục 5.4 | Công thức hộp thoại / khung bên / menu |
| Animate thuộc tính gây tính lại bố cục | `transition: top .5s`, `height .18s` | Mục 5.4 | `transform` |
| Giảm chuyển động bằng cách tắt hết | `animation:none!important; transition:none!important` cho mọi thứ | Mục 5.5 | Giảm, giữ fade ngắn và chỉ báo đang tải |
| Bo góc lẻ tẻ | 2, 4, 8, 12px và nhiều kiểu bất đối xứng | Mục 4.2 | 6 / 10 / 14 / 999px |
| Màu cộng tác trùng màu thương hiệu | Mực "của tôi" = cobalt của chrome | Mục 3.4 | Mực indigo chỉ là 1 trong 6 mực người dùng; chrome trung tính |

---

## 10. Token CSS (nguồn sự thật duy nhất)

Dán vào đầu `src/styles/app.css`. Component chỉ được dùng các biến này.

```css
:root {
  color-scheme: light dark;

  /* Chữ */
  --font-ui: "Be Vietnam Pro", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  --font-doc: "Literata", Georgia, "Times New Roman", serif;
  --font-mono: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
  --text-xs: .75rem;   --lh-xs: 1rem;
  --text-sm: .875rem;  --lh-sm: 1.25rem;
  --text-md: 1rem;     --lh-md: 1.5rem;
  --text-lg: 1.125rem; --lh-lg: 1.75rem;
  --text-xl: 1.25rem;  --lh-xl: 1.75rem;
  --text-2xl: 1.5rem;  --lh-2xl: 2rem;
  --text-3xl: 1.875rem;--lh-3xl: 2.375rem;
  --text-4xl: 2.25rem; --lh-4xl: 2.75rem;

  /* Màu: sáng | tối */
  --bg:             light-dark(#F9F9FB, #111113);
  --surface:        light-dark(#FFFFFF, #18191B);
  --surface-sunken: light-dark(#F0F0F3, #212225);
  --hover:          light-dark(#E8E8EC, #272A2D);
  --border:         light-dark(#D9D9E0, #363A3F);
  --border-strong:  light-dark(#8B8D98, #696E77);
  --text:           light-dark(#1C2024, #EDEEF0);
  --text-2:         light-dark(#60646C, #B0B4BA);
  --accent:         #3E63DD;
  --accent-hover:   #3358D4;
  --accent-text:    light-dark(#3A5BC7, #9EB1FF);
  --accent-soft:    light-dark(#EDF2FE, #182449);
  --on-accent:      #FFFFFF;
  --focus:          light-dark(#3E63DD, #9EB1FF);
  --success:        light-dark(#18794E, #3DD68C);  --success-soft: light-dark(#E6F6EB, #113B29);
  --warning:        light-dark(#9A5700, #FFCA16);  --warning-soft: light-dark(#FFF7C2, #302008);
  --danger:         light-dark(#CE2C31, #FF9592);  --danger-soft:  light-dark(#FFEBEC, #3B1219);

  /* Mực cộng tác viên */
  --ink-rose:   light-dark(#C92A62, #FF7BA8);
  --ink-green:  light-dark(#0B7F57, #4FD6A4);
  --ink-amber:  light-dark(#A85F00, #FFB547);
  --ink-cyan:   light-dark(#0E7490, #3BC9DB);
  --ink-indigo: light-dark(#3E63DD, #9EB1FF);
  --ink-plum:   light-dark(#9E3FA8, #E29BEA);
  --on-ink:     light-dark(#FFFFFF, #111113);

  /* Khoảng cách */
  --space-1: .25rem; --space-2: .5rem; --space-3: .75rem; --space-4: 1rem;
  --space-6: 1.5rem; --space-8: 2rem; --space-12: 3rem; --space-16: 4rem;

  /* Hình dạng và độ cao */
  --radius-sm: 6px; --radius-md: 10px; --radius-lg: 14px; --radius-full: 999px;
  --shadow-1: 0 1px 2px rgb(16 24 40 / .06);
  --shadow-2: 0 4px 12px rgb(16 24 40 / .08), 0 1px 3px rgb(16 24 40 / .06);
  --shadow-3: 0 16px 40px rgb(16 24 40 / .14);
  --control-h: 2.5rem;

  /* Chuyển động */
  --dur-1: 70ms; --dur-2: 110ms; --dur-3: 150ms; --dur-4: 240ms; --dur-5: 400ms;
  --ease-standard: cubic-bezier(.2, 0, 0, 1);
  --ease-enter:    cubic-bezier(.05, .7, .1, 1);
  --ease-exit:     cubic-bezier(.3, 0, .8, .15);
}
:root[data-theme="light"] { color-scheme: light; }
:root[data-theme="dark"]  { color-scheme: dark;  --shadow-1: none; --shadow-2: 0 0 0 1px var(--border); --shadow-3: 0 0 0 1px var(--border); }
@media (max-width: 979px) { :root { --control-h: 2.75rem; } }
@media (prefers-reduced-motion: reduce) { :root { --dur-3: 1ms; --dur-4: 1ms; --dur-5: 1ms; } }
```

---

## 11. Definition of Done cho mọi thay đổi giao diện

- [ ] Không có mã hex, px cỡ chữ, ms hay bo góc viết trực tiếp ngoài khối token (`grep -nE "#[0-9a-fA-F]{3,6}|[0-9]+ms" src/styles` chỉ ra kết quả trong khối `:root`).
- [ ] Chỉ dùng cỡ chữ trong 8 bậc; không có chữ < 12px.
- [ ] Mỗi màn hình có tối đa 1 nút chính màu nhấn.
- [ ] Mọi cặp chữ/nền mới đạt ≥ 4.5 : 1, viền control và icon đạt ≥ 3 : 1, đã đo ở cả sáng lẫn tối.
- [ ] Mọi phần tử tương tác: có hover, có vòng focus 2px, vùng chạm ≥ 24px (mục tiêu 40–44px).
- [ ] Chuyển động dùng token, chỉ `opacity` và `transform`, vào chậm hơn ra, ≤ 400ms; đã thử với "Giảm chuyển động".
- [ ] Đã chụp màn hình 1440px và 390px, sáng và tối; không cuộn ngang, không chữ tràn, không chồng lấn.
- [ ] Đi được hết luồng bằng bàn phím; Esc đóng hộp thoại và trả focus.
- [ ] Chữ tiếng Việt có dấu hiển thị đúng, không bị cắt dấu trên hay dưới (kiểm tra line-height và `overflow: hidden`).
- [ ] Nhãn nút là động từ; thông báo lỗi nói cách sửa; trạng thái "Đã lưu" trung thực.

---

## 12. Khi thiết kế một màn hình mới từ đầu

1. Viết ra người dùng muốn **làm xong việc gì** trên màn hình này, rồi liệt kê nội dung và hành động. Chưa vẽ bố cục.
2. Chọn **một** hành động chính. Mọi thứ khác là phụ.
3. Dựng bằng chữ và khoảng trắng trước (chỉ `--text`, `--text-2`, `--surface`). Đúng thứ bậc rồi mới thêm màu.
4. Thêm màu nhấn cho hành động chính, mực cho dấu vết con người, màu trạng thái cho trạng thái.
5. Thêm chuyển động cho đúng 3 thời điểm: xuất hiện, biến mất, phản hồi. Không thêm gì khác.
6. Chạy checklist mục 11.

---

## 13. Nguồn

| Chủ đề | Nguồn |
|---|---|
| Cỡ chữ mặc định và tối thiểu, kích thước control | Apple, *Human Interface Guidelines*: Typography, Accessibility — developer.apple.com/design/human-interface-guidelines |
| Chuyển động ngắn, chính xác, không lạm dụng | Apple HIG: Motion |
| Thang chữ (Body Large 16/24), đường cong easing, lớp phủ trạng thái, chế độ tối | Google, *Material Design 3* — m3.material.io; Material Dark theme — m2.material.io/design/color/dark-theme |
| Token thời lượng, chuyển động productive và expressive, thang khoảng cách | IBM, *Carbon Design System*: Motion, Spacing — carbondesignsystem.com |
| Thang khoảng cách bội số 8px | U.S. Web Design System — designsystem.digital.gov/design-tokens/spacing-units |
| Tương phản, vùng chạm, vòng focus, giảm chuyển động | W3C, *WCAG 2.2* (1.4.3, 1.4.11, 2.4.13, 2.5.8, 2.3.3, kỹ thuật C39) — w3.org/WAI; WebAIM, *Contrast and Color Accessibility* |
| Thời lượng animation 100–500ms; giới hạn phản hồi 0.1 / 1 / 10 giây | Nielsen Norman Group: *Executing UX Animations: Duration and Motion Characteristics*; *Response Times: The 3 Important Limits* (Jakob Nielsen) |
| Cỡ chữ thân bài, line-height 120–145%, độ dài dòng 45–90 ký tự | Matthew Butterick, *Practical Typography* — practicaltypography.com |
| Thang hệ thống, khoảng cách gom nhóm, xám có sắc màu | Adam Wathan & Steve Schoger, *Refactoring UI* (2018) |
| Thang màu 12 bậc theo vai trò; bảng màu Slate và Indigo | WorkOS, *Radix Colors* — radix-ui.com/colors |
| Phông Be Vietnam Pro | Lâm Bảo, Tony Le, ViệtAnh Nguyễn — github.com/bettergui/BeVietnamPro, Google Fonts |
