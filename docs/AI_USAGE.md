# NHẬT KÝ SỬ DỤNG GENAI TRONG DỰ ÁN VƯỜN TOÁN LỚP 3

- Học phần: Kỹ thuật Phần mềm Ứng dụng (KTPMUD) - Học kỳ 2026.1
- Bài kiểm tra: BKT-2 Hack Marathon (Track B: Vườn Toán Lớp 3)
- Nhóm thực hiện: Nhóm 05

---

## Nguyên tắc sử dụng AI của nhóm
1. AI chỉ đóng vai trò hỗ trợ phân tích sư phạm, gợi ý khung tài liệu đặc tả, và sinh các bộ test cases biên.
2. Mọi kiến trúc hệ thống, logic sinh số, tính dung sai và mã nguồn đều do các thành viên tự đọc hiểu, kiểm thử độc lập và chịu trách nhiệm.

---

## Bảng theo dõi sử dụng GenAI (AI Usage Tracking Log)

| STT | Ngày | Người thực hiện | Model / Công cụ | Mục đích sử dụng | Prompt chính | Người kiểm chứng | Đánh giá & Điều chỉnh thực tế |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | 09/11/2026 | Nguyễn Thành Đạt | ChatGPT (GPT-4o) | Lên khung đặc tả sư phạm dạng bài ước lượng lớp 3 | "Xây dựng đặc tả yêu cầu cho bài toán ước lượng trước khi tính đúng cho học sinh lớp 3 theo chuẩn GDPT 2018" | Nguyễn Thành Đạt | Loại bỏ các yêu cầu làm tròn số thập phân; bổ sung dung sai cho phép tính trong phạm vi 100 và 1000. |
| 2 | 10/11/2026 | Lưu Nhật Nam | GitHub Copilot | Gợi ý logic sinh số ngẫu nhiên không âm | "Write JavaScript function to generate subtraction operands where minuend >= subtrahend within 1000" | Lưu Nhật Nam | Kiểm tra và thêm ràng buộc để số bị trừ luôn lớn hơn hoặc bằng số trừ, tránh trường hợp kết quả bị âm. |
| 3 | 10/11/2026 | Lê Đức Hoàng | Claude 3.5 Sonnet | Gợi ý bố cục CSS nút bấm to cho học sinh tiểu học | "Thiết kế giao diện 2 bước trực quan cho trẻ em lớp 3 bằng HTML/CSS kích thước nút bấm thân thiện" | Lê Đức Hoàng | Chỉnh lại font chữ thành kích thước 22px, màu sắc tương phản tươi sáng phù hợp với theme Vườn Toán. |
| 4 | 11/11/2026 | Nguyễn Thành Đạt | ChatGPT | Sinh các test cases kiểm thử dung sai | "Generate Mocha unit test cases testing estimation tolerance calculation boundary" | Nguyễn Thành Đạt | Chọn lọc 15 ca kiểm thử biên hợp lệ, loại trừ các ca có giá trị đầu vào sai kiểu dữ liệu. |