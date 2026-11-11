# ĐẶC TẢ YÊU CẦU DẠNG TOÁN: ƯỚC LƯỢNG TRƯỚC KHI TÍNH ĐÚNG (LỚP 3)

## 1. Mục tiêu & Chuẩn kiến thức kỹ năng (GDPT 2018)
- Đối tượng: Học sinh Tiểu học Lớp 3.
- Mục tiêu: Rèn luyện năng lực ước lượng kết quả phép tính trước khi thực hiện tính toán chi tiết, giúp hình thành tư duy kiểm chứng nhanh kết quả và hạn chế lỗi tính toán sai lệch lớn.
- Phạm vi kiến thức: Phép cộng, phép trừ không nhớ và có nhớ trong phạm vi 1.000.

---

## 2. Quy tắc sư phạm & Tiêu chí dung sai (Tolerance)

### 2.1. Quy tắc làm tròn số (Estimation Heuristic)
1. Làm tròn đến hàng chục (với số có 2 chữ số):
   - Chữ số hàng đơn vị >= 5: làm tròn lên hàng chục kế tiếp (ví dụ: 37 -> 40, 65 -> 70).
   - Chữ số hàng đơn vị < 5: làm tròn xuống hàng chục gần nhất (ví dụ: 52 -> 50, 84 -> 80).
2. Làm tròn đến hàng trăm (với số có 3 chữ số):
   - Hai chữ số tận cùng >= 50: làm tròn lên hàng trăm kế tiếp (ví dụ: 368 -> 400).
   - Hai chữ số tận cùng < 50: làm tròn xuống (ví dụ: 324 -> 300).

### 2.2. Tiêu chuẩn đánh giá ước lượng hợp lệ (Server-Side Tolerance Rules)
Một giá trị ước lượng E của học sinh được công nhận là Hợp lệ (Ước lượng tốt) khi thỏa mãn một trong hai điều kiện:
- Khớp quy tắc làm tròn chuẩn: E = round(A) ± round(B).
- Nằm trong dung sai khoảng cách với kết quả đúng (R = A ± B):
  - Phép tính trong phạm vi 100: |E - R| <= 10.
  - Phép tính trong phạm vi 1.000: |E - R| <= 50.

---

## 3. Quy trình làm bài 2 bước (Two-Phase Flow)
1. Bước 1 — Nhập ước lượng: Học sinh quan sát phép tính và nhập số ước lượng vào ô "Ước lượng của em". Nhấn nút "Xác nhận ước lượng".
2. Bước 2 — Khóa & Tính đúng: Ô ước lượng lập tức bị khóa (readonly / disabled) để bảo đảm tính trung thực sư phạm. Ô "Kết quả chính xác" được kích hoạt để học sinh đặt tính và nhập đáp số cuối cùng.

---

## 4. Hợp đồng API (API Contracts)

### 4.1. Sinh câu hỏi (Question Generator API)
- Endpoint: GET /api/estimation/generate
- Query Params (tùy chọn): type=addition|subtraction & level=100|1000
- Response Payload (200 OK):
{
  "success": true,
  "data": {
    "question_id": "EST_2026_Q01",
    "prompt": "Ước lượng trước kết quả, sau đó tính đáp số chính xác:",
    "operand_a": 38,
    "operand_b": 53,
    "operator": "+",
    "level": 100
  }
}

### 4.2. Chấm điểm bài làm (Server-Side Evaluation API)
- Endpoint: POST /api/estimation/submit
- Request Payload:
{
  "question_id": "EST_2026_Q01",
  "estimate_val": 90,
  "exact_val": 91
}
- Response Payload (200 OK):
{
  "success": true,
  "data": {
    "exact_result": 91,
    "is_estimate_valid": true,
    "is_exact_valid": true,
    "score": 10,
    "feedback": {
      "estimate": "Giỏi lắm! 38 gần 40, 53 gần 50, ước lượng khoảng 90 rất hợp lý.",
      "exact": "Chính xác: 38 + 53 = 91."
    }
  }
}

---

## 5. Yêu cầu phi chức năng (Non-Functional Requirements - NFR)
- NFR-01 (Thời gian phản hồi): Server xử lý sinh đề và chấm điểm trả kết quả trong thời gian <= 300 ms.
- NFR-02 (UX Tiểu học): Phông chữ lớn (>= 20px), màu sắc tươi sáng, nút bấm to tối thiểu 44x44 px để học sinh thao tác dễ dàng trên màn hình cảm ứng hoặc chuột máy tính.
- NFR-03 (Bảo mật & Trung thực sư phạm): Không trả đáp án chính xác hoặc khoảng dung sai trong payload câu hỏi xuống client nhằm ngăn chặn việc gian lận bằng Inspect/DevTools.

---

## 6. Tiêu chí nghiệm thu (Acceptance Criteria)
1. Sinh đề ngẫu nhiên đảm bảo tổng phép cộng <= 1000; phép trừ luôn có số bị trừ >= số trừ (kết quả không âm).
2. Giao diện khóa ô nhập ước lượng sau khi học sinh bấm xác nhận, sau đó mới cho phép nhập đáp án chính xác.
3. Chấm điểm độc lập tại server: học sinh chỉ nhận điểm tối đa khi cả ước lượng hợp lệ (trong khoảng dung sai) và đáp số chính xác 100%.
4. 100% test cases trong thư mục tests/ vượt qua kiểm thử tự động trên hệ thống CI.