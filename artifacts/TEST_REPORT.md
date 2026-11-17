# TEST REPORT – Backend & Logic tính toán

## 1. Phạm vi kiểm thử

Kiểm thử module Backend tính toán của hệ thống Vườn Toán, bao gồm:

- Module `server/math-logic.js`: tính toán và chấm điểm.
- Bộ sinh bài toán ngẫu nhiên sử dụng dữ liệu trong `server/fixtures/estimate-fixtures.json`.
- Kiểm tra 12 câu hỏi mẫu từ EST-01 đến EST-12.
- API `GET /api/math/generate`.
- API `POST /api/math/score`.
- API `GET /api/math/history`.
- Kiểm tra lưu và truy xuất lịch sử làm bài bằng SQLite.

## 2. Quy tắc nghiệp vụ

- Hỗ trợ các phép tính cộng, trừ, nhân và chia.
- Các toán hạng là số nguyên dương.
- Phép trừ không tạo kết quả âm hoặc bằng 0.
- Phép chia phải chia hết, không có số dư.
- Ước lượng được làm tròn đến hàng chục gần nhất.
- Chấp nhận ước lượng có sai lệch tối đa 5 đơn vị.
- Sai lệch từ 6 đơn vị trở lên được đánh giá không đạt.
- Kết quả tính toán phải trùng khớp hoàn toàn với đáp án do Server xác định.
- Mỗi tiêu chí đạt được 1 điểm, tổng điểm tối đa 2.
- API Generate không được gửi đáp án đúng xuống Frontend.
- Kết quả chấm được lưu vào SQLite.
- API History chỉ trả về lịch sử của người dùng đang đăng nhập.

## 3. Danh sách test case

| ID | Nội dung kiểm thử | Kết quả mong đợi |
|---|---|---|
| UT-01 | Kiểm tra phép cộng, trừ, nhân, chia | Trả kết quả chính xác |
| UT-02 | Chia cho 0 | Từ chối dữ liệu |
| UT-03 | Phép trừ có kết quả không dương | Từ chối dữ liệu |
| UT-04 | Phép chia có dư | Từ chối dữ liệu |
| UT-05 | Sinh 1.000 bài toán | Dữ liệu hợp lệ |
| UT-06 | Ước lượng đúng và tính đúng | Đạt 2 điểm |
| UT-07 | Ước lượng sai và tính sai | Đạt 0 điểm |
| UT-08 | Đầu vào âm, thập phân hoặc thiếu | Từ chối dữ liệu |
| UT-09 | Kiểm tra đủ 12 câu fixture | Đủ 12 câu hợp lệ |
| UT-10 | Kiểm tra đáp án mẫu trong fixture | Kết quả chấm khớp dữ liệu mẫu |
| UT-11 | Sai lệch ước lượng đúng 5 | Đạt tiêu chí ước lượng |
| UT-12 | Sai lệch ước lượng đúng 6 | Không đạt tiêu chí ước lượng |
| API-01 | GET Generate | Trả câu hỏi, không lộ đáp án |
| API-02 | POST Score | Chấm điểm chính xác |
| API-03 | POST Score lưu SQLite | Lưu được kết quả |
| API-04 | GET History | Đọc lại lịch sử đã lưu |
| API-05 | History khi chưa đăng nhập | Trả HTTP 401 |

## 4. Cách chạy kiểm thử

Yêu cầu Node.js 18 trở lên.

Chạy toàn bộ test:

```bash
npm test
```

Chạy riêng kiểm thử logic:

```bash
node --test tests/math-logic.test.js
```

Chạy riêng kiểm thử Backend:

```bash
node --test tests/estimation.test.js
```

## 5. Kết quả kiểm thử

Các kết quả dưới đây cần được cập nhật sau khi chạy kiểm thử thực tế trên repository.

| Chỉ tiêu | Kết quả |
|---|---|
| Tổng test case dự kiến | 17 |
| Test case đã thực thi | Chờ kiểm thử |
| Passed | Chờ kiểm thử |
| Failed | Chờ kiểm thử |
| Kiểm thử trên repository | Chưa xác nhận |

## 6. Kết luận

Bộ kiểm thử được xây dựng nhằm xác nhận tính chính xác của logic tính toán, khả năng sinh bài toán, chức năng chấm điểm và lưu trữ lịch sử làm bài.

Các trường hợp kiểm thử tập trung vào việc phát hiện lỗi chia cho 0, kết quả không hợp lệ, sai lệch ước lượng và lỗi xử lý dữ liệu giữa Frontend và Backend.

Sau khi chạy toàn bộ `npm test`, cập nhật kết quả Passed/Failed thực tế để xác nhận mức độ hoàn thành.
