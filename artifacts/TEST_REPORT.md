# TEST REPORT – Backend & Logic tính toán

## 1. Phạm vi kiểm thử

Kiểm thử đơn vị cho module `server/math-logic.js`, gồm:

- Hàm tính toán cộng, trừ, nhân, chia.
- Bộ sinh bài toán ngẫu nhiên theo ngữ cảnh thực tế, phù hợp mức Toán lớp 3.
- Hàm chấm hai tiêu chí `uoc_luong` và `ket_qua_dung`.
- Kiểm tra dữ liệu không hợp lệ, phép chia cho 0, phép chia có dư và kết quả không dương.

## 2. Quy tắc nghiệp vụ

- Bài toán được sinh với các phép cộng, trừ, nhân, chia.
- Các toán hạng là số nguyên dương; phép trừ luôn có số bị trừ lớn hơn số trừ.
- Phép chia được tạo từ thương và số chia nên luôn chia hết.
- Ước lượng là kết quả làm tròn đến hàng chục; chấp nhận sai số tối đa 5.
- Tính đúng yêu cầu đáp án trùng khớp hoàn toàn với kết quả do server tính.
- Server giữ thông tin đáp án của câu hỏi trong bộ nhớ; API sinh đề không gửi đáp án đúng xuống trình duyệt.

## 3. Danh sách test case

| ID | Nội dung | Kết quả mong đợi |
|---|---|---|
| UT-01 | Tính cộng, trừ, nhân, chia | Trả về kết quả chính xác |
| UT-02 | Chia cho 0 | Từ chối dữ liệu |
| UT-03 | Phép trừ có kết quả âm hoặc bằng 0 | Từ chối dữ liệu |
| UT-04 | Phép chia có dư | Từ chối dữ liệu |
| UT-05 | Sinh 1.000 bài toán | Tất cả toán hạng/kết quả hợp lệ, dương; phép chia hết |
| UT-06 | Ước lượng trong sai số và đáp án chính xác | Đạt cả hai tiêu chí |
| UT-07 | Ước lượng sai và đáp án chính xác sai | Không đạt cả hai tiêu chí |
| UT-08 | Đầu vào âm, thập phân hoặc thiếu | Từ chối dữ liệu |

## 4. Cách chạy

Yêu cầu Node.js 18 trở lên:

```bash
npm test
```

Hoặc chạy riêng:

```bash
node --test tests/math-logic.test.js
```

## 5. Kết quả

Đã chạy thực tế bằng lệnh `node --test tests/math-logic.test.js` trên module và bộ test đã chuẩn bị. Kết quả: 8 test Passed, 0 test Failed. Sau khi tích hợp vào repository, chạy lại `npm test` để xác nhận trong môi trường của nhóm.

| Chỉ tiêu | Kết quả |
|---|---|
| Tổng test case | 8 |
| Test case đã định nghĩa | 8 |
| Passed | 8 |
| Failed | 0 |
| Test chạy thực tế trên repository gốc | Chưa chạy (chưa tích hợp vào repo) |

