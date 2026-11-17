# CHECKLIST KIỂM THỬ THỦ CÔNG — Dạng bài "Ước lượng rồi tính đúng"

Người soạn: BA (nhóm 05). Chạy trên commit Freeze, ghi kết quả vào `TEST_REPORT.md` kèm ảnh chụp màn hình.

## Chuẩn bị
```bash
npm ci
npm run reset-db
npm start          # http://localhost:3000
```
Đăng nhập `hocsinh01` / `123456`. Dùng Chrome, mở DevTools bằng F12.

## Danh sách kiểm thử

| ID | AC | Bước thực hiện | Kết quả mong đợi | Đạt? | Ảnh |
|---|---|---|---|---|---|
| MT-01 | B-01 | Vào `game.html`, tìm và bấm thẻ/link "Ước lượng rồi tính đúng" | Mở được trang dạng bài, không phải gõ URL tay | | |
| MT-02 | B-04 | DevTools → tab Network → tải đề mới → bấm request `generate` → tab Response | Chỉ có `questionId`, `a`, `b`, `operator`, `prompt`. Không có `expectedResult`/`expectedEstimate` | | |
| MT-03 | B-04 | DevTools → tab Sources → tìm `answerOf` hoặc danh sách câu cố định trong `estimate-exact.js` | Không còn code tự tính đáp án ở trình duyệt | | |
| MT-04 | B-03, B-06 | Đề 245 + 138: ước lượng `380`, kết quả `383` | Hiện "Đạt ước lượng" và "Tính đúng", 2/2 điểm | | |
| MT-05 | B-03 | Ước lượng lệch +5 so với ước lượng chuẩn (vd `385`) | "Đạt ước lượng" | | |
| MT-06 | B-03 | Ước lượng lệch +6 (vd `386`) | "Chưa đạt ước lượng" | | |
| MT-07 | B-06 | Ước lượng đạt nhưng kết quả sai | Hai dòng phản hồi khác nhau: "Đạt ước lượng" và "Chưa tính đúng" | | |
| MT-08 | — | Sau khi bấm "Xác nhận ước lượng", thử sửa ô ước lượng | Ô bị khoá, không sửa được | | |
| MT-09 | B-05 | Làm xong 1 câu → F5 tải lại trang | Lịch sử / kết quả câu vừa làm vẫn hiển thị | | |
| MT-10 | B-05 | Tắt server (Ctrl+C) → `npm start` lại → đăng nhập → mở trang | Lịch sử vẫn còn (đã lưu SQLite) | | |
| MT-11 | B-12 | Không dùng chuột: Tab để di chuyển, gõ số, Enter để xác nhận và nộp | Hoàn thành được một câu chỉ bằng bàn phím; viền focus nhìn thấy rõ | | |
| MT-12 | B-12 | Nhập `-5`, `3.5`, hoặc để trống rồi nộp | Thông báo lỗi tiếng Việt dễ hiểu, không crash | | |
| MT-13 | B-12 | DevTools → Network → chọn "Offline" → nộp bài | Thông báo kiểu "Không kết nối được máy chủ", không treo trang | | |
| MT-14 | B-07 | Chạy `git diff --stat bkt-2026-v1 HEAD -- server/auth.js data/seed.json Dockerfile DEPLOY.md` | Không in ra gì | | |
| MT-15 | B-09 | Clone repo mới vào thư mục khác → `npm ci` → `npm test` | Tất cả test pass | | |

## Ghi kết quả
- Mỗi dòng ghi "Đạt" / "Không đạt" kèm tên file ảnh (vd `MT-04.png`).
- Dòng nào không đạt: ghi lại lỗi, báo BE/FE sửa trước 18:00 ngày 19/11, rồi test lại.
