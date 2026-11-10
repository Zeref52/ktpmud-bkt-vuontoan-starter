# ĐẶC TẢ DẠNG TOÁN: ƯỚC LƯỢNG TRƯỚC KHI TÍNH ĐÚNG (TOÁN LỚP 3)

## 1. Mục tiêu và Chuẩn kiến thức kỹ năng
- **Đối tượng:** Học sinh Tiểu học Lớp 3 (Chương trình GDPT 2018).
- **Mục đích:** Rèn luyện phản xạ ước lượng và làm tròn số trước khi đặt bút tính chính xác, phát hiện sớm kết quả phi lý.
- **Phạm vi phép tính:** Phép cộng, phép trừ hai số có 2 hoặc 3 chữ số (trong phạm vi 1000).

## 2. Quy tắc sư phạm làm tròn số (Estimation Heuristic)
1. **Làm tròn đến hàng chục:**
   - Chữ số hàng đơn vị $\ge 5$: làm tròn lên hàng chục tiếp theo (ví dụ: $37 \rightarrow 40$).
   - Chữ số hàng đơn vị $< 5$: làm tròn xuống (ví dụ: $52 \rightarrow 50$).
2. **Quy tắc tính ước lượng hợp lệ:**
   - Với phép tính $A + B$, giá trị ước lượng chuẩn: $E_{std} = \text{round}(A, 10) + \text{round}(B, 10)$.
   - Dung sai chấp nhận: Học sinh được coi là "Ước lượng tốt" nếu giá trị ước lượng $E$ thỏa mãn:
     $$|E - (A + B)| \le 10 \quad (\text{phép tính phạm vi 100})$$
     $$|E - (A + B)| \le 30 \quad (\text{phép tính phạm vi 1000})$$

## 3. Hợp đồng API (API Contract giữa Client & Server)

### 3.1. API Sinh đề bài
- **Endpoint:** `GET /api/questions/estimation`
- **Response (200 OK):**
```json
{
  "question_id": "EST_2026_001",
  "operand_a": 38,
  "operand_b": 53,
  "operator": "+",
  "instruction": "Hãy ước lượng kết quả trước, sau đó tính kết quả chính xác.",
  "scope": 100
}