# ĐẶC TẢ DẠNG BÀI: ƯỚC LƯỢNG TRƯỚC KHI TÍNH ĐÚNG (LỚP 3)

> Phiên bản 2.0 — 17/11/2026 — người soạn: BA (nhóm 05).
> Bản này **thay thế** bản 1.0 (commit `b71c1f7`). Bản 1.0 mô tả endpoint `/api/estimation/*` và dung sai ±10/±50,
> không khớp với code. Bản 2.0 mô tả đúng hành vi của `server/math-logic.js` và `server/api.js`.
> Lý do chọn quy tắc: xem `DECISIONS.md` ADR-02 trong bài nộp.

## 1. Mục tiêu
- Đối tượng: học sinh lớp 3.
- Mục tiêu: học sinh **ước lượng** kết quả trước, rồi mới **tính chính xác**, để tự kiểm tra kết quả có hợp lý không.
- Phạm vi phép tính (theo generator hiện có):

| Phép tính | Số thứ nhất `a` | Số thứ hai `b` | Ràng buộc |
|---|---|---|---|
| Cộng `+` | 120 – 480 | 100 – 450 | Kết quả ≤ 930 |
| Trừ `-` | 200 – 900 | 1 – (a − 1) | Kết quả nguyên dương |
| Nhân `×` | 2 – 9 | 2 – 9 | Bảng nhân 2–9 |
| Chia `÷` | b × thương | 2 – 9 | Thương 2–9, luôn chia hết |

## 2. Quy tắc chấm (tất định — B-03)
Gọi `R` là kết quả đúng của phép tính, `E` là số ước lượng học sinh nhập, `X` là kết quả chính xác học sinh nhập.

1. **Ước lượng chuẩn:** `U = Math.round(R / 10) * 10`, tức làm tròn `R` đến hàng chục. Đơn vị 0–4 làm tròn xuống, 5–9 làm tròn lên.
2. **Ước lượng đạt** khi `|E − U| ≤ 5`.
3. **Tính đúng** khi `X === R`.
4. **Điểm:** mỗi tiêu chí đạt được 1 điểm, tổng tối đa 2 điểm. Hai tiêu chí **độc lập** với nhau (B-06).

Ví dụ:

| Phép tính | R | U | Khoảng E đạt | E = U+5 | E = U+6 |
|---|---|---|---|---|---|
| 245 + 138 | 383 | 380 | 375 – 385 | Đạt | Chưa đạt |
| 152 + 193 | 345 | 350 | 345 – 355 | Đạt | Chưa đạt |
| 7 × 8 | 56 | 60 | 55 – 65 | Đạt | Chưa đạt |
| 24 ÷ 6 | 4 | 0 | 0 – 5 | Đạt | Chưa đạt |

Trường hợp đặc biệt: khi `R < 5` thì `U = 0`. Vì đầu vào không được âm, khoảng đạt chỉ còn 0 – 5.

### 2.1. Kiểm tra đầu vào
- `E`, `X` phải là **số nguyên không âm**. Chuỗi số như `"380"` được chấp nhận và chuyển thành số.
- Số âm, số thập phân, chuỗi rỗng hoặc thiếu trường → HTTP 400 kèm thông báo tiếng Việt.

## 3. Luồng làm bài 2 bước
1. Học sinh mở dạng bài từ trang Đấu Trường Trò Chơi (`game.html`).
2. Trang gọi `GET /api/math/generate` để lấy đề. **Không có đáp án** trong response.
3. **Bước 1:** học sinh nhập số ước lượng và bấm "Xác nhận ước lượng". Ô ước lượng bị khoá.
4. **Bước 2:** học sinh nhập kết quả chính xác và bấm "Nộp bài".
5. Trang gửi `POST /api/math/score`, rồi hiển thị **2 dòng riêng**: ước lượng (đạt/chưa đạt) và tính đúng (đúng/chưa đúng), kèm ước lượng chuẩn và kết quả đúng.
6. Kết quả được lưu ở server. Tải lại trang vẫn xem được lịch sử làm bài (B-05).

## 4. Hợp đồng API

Mọi endpoint yêu cầu đăng nhập (`requireAuth` có sẵn). Chưa đăng nhập → 401.

### 4.1. `GET /api/math/generate` — sinh đề (đã có)
Response 200:
```json
{
  "questionId": "b3f1c2e4-…",
  "question": {
    "a": 245,
    "b": 138,
    "operator": "+",
    "prompt": "Ở thư viện có 245 quyển sách, sau đó được bổ sung thêm 138 quyển sách. Hỏi có tất cả bao nhiêu quyển sách?"
  }
}
```
- **Không** chứa `expectedResult` hay `expectedEstimate` (B-04).
- Đề lưu ở server, gắn với tài khoản đã nhận đề, hết hạn sau 30 phút.

### 4.2. `POST /api/math/score` — chấm bài (đã có)
Request:
```json
{ "questionId": "b3f1c2e4-…", "uoc_luong": 380, "ket_qua_dung": 383 }
```
Response 200:
```json
{
  "questionId": "b3f1c2e4-…",
  "uoc_luong_dung": true,
  "tinh_dung": true,
  "danh_gia": ["Đạt ước lượng", "Tính đúng"],
  "ket_qua_uoc_luong": 380,
  "ket_qua_chinh_xac": 383,
  "diem": 2,
  "tong_diem": 2
}
```
Lỗi:

| Mã | Khi nào | Ví dụ `error` |
|---|---|---|
| 400 | Thiếu `questionId` | `Thiếu questionId.` |
| 400 | Đầu vào sai kiểu | `uoc_luong phải là số nguyên không âm.` |
| 404 | Đề không tồn tại, hết hạn, đã chấm, hoặc thuộc tài khoản khác | `Bài toán không tồn tại, đã hết hạn hoặc không thuộc tài khoản này.` |

Mỗi đề chỉ được chấm **một lần**.

### 4.3. `GET /api/math/history` — lịch sử làm bài (BE đang làm, B-05)
Response 200 (dự kiến): danh sách các lần làm gần nhất của tài khoản hiện tại, mới nhất trước:
```json
{
  "items": [
    { "a": 245, "b": 138, "operator": "+", "uoc_luong": 380, "ket_qua_dung": 383,
      "uoc_luong_dung": true, "tinh_dung": true, "diem": 2, "created_at": "2026-11-18T03:12:00Z" }
  ]
}
```

## 5. Dữ liệu synthetic (B-02)
- File: `server/fixtures/estimate-fixtures.json`, gồm **12 câu** `EST-01` … `EST-12`, phủ cả 4 phép tính.
- Mỗi câu có `expectedResult`, `expectedEstimate`, `estimateAcceptRange` và 3 mẫu chấm: `normal`, `boundary_pass` (lệch +5), `boundary_fail` (lệch +6).
- Toàn bộ là dữ liệu tự soạn, không lấy từ học sinh thật (B-11).
- Generator `generateMathProblem(rng)` nhận `rng`, nên truyền cùng một seed sẽ sinh lại cùng một dãy đề.

| ID | Phép tính | R | U |
|---|---|---|---|
| EST-01 | 245 + 138 | 383 | 380 |
| EST-02 | 306 + 129 | 435 | 440 |
| EST-03 | 418 + 267 | 685 | 690 |
| EST-04 | 152 + 193 | 345 | 350 |
| EST-05 | 734 − 286 | 448 | 450 |
| EST-06 | 500 − 127 | 373 | 370 |
| EST-07 | 861 − 409 | 452 | 450 |
| EST-08 | 625 − 318 | 307 | 310 |
| EST-09 | 7 × 8 | 56 | 60 |
| EST-10 | 9 × 5 | 45 | 50 |
| EST-11 | 72 ÷ 9 | 8 | 10 |
| EST-12 | 24 ÷ 6 | 4 | 0 |

## 6. Ngoài phạm vi
- Không sửa `server/auth.js`, session, tài khoản mẫu, `Dockerfile`, `DEPLOY.md` (B-07).
- Không dùng LLM để sinh đề hay chấm điểm.
- Không thay đổi 4 `type` câu hỏi hiện có của hệ thống.
