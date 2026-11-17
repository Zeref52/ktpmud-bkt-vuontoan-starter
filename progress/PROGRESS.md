# PROGRESS — nhom05 — Track B
- Starter: ktpmud-bkt-vuontoan-starter · tag bkt-2026-v1 (commit `057a48205f50f0f30d6260be1a44b343a167a3e7`)
- Fork: https://github.com/Zeref52/ktpmud-bkt-vuontoan-starter

> **Ghi chú nộp bổ sung:** mục PC-1 dưới đây được tạo và nộp **bổ sung ngày 16/11/2026**, sau buổi
> PC-1 ngày 11/11/2026, theo Progress Check v1.0.6 (PC-1 được nộp bổ sung sau 11:30, không giới hạn
> thời gian). Nội dung phản ánh **tình trạng tại thời điểm nộp bổ sung** (code trên `main` đến commit
> `6e03914`), không phải tình trạng lúc 11:30 ngày 11/11.
>
> Alias dùng trong file (vai trò · GitHub): **BA** · `Zeref52` (phân tích yêu cầu, đặc tả, dữ liệu synthetic, kiểm thử, CI, tài liệu),
> **BE** · `namfa7071-hash` (backend, logic chấm), **FE** · `lehoangg12339-oss` (giao diện dạng bài). Không ghi họ tên/MSSV.

## PC-1 — 11/11/2026
### 1.1. Tiến độ theo acceptance criteria
<!-- Track B: B-01…B-12 (đề thi Mục 8.3). Đủ mọi mã. -->
Ký hiệu link: `C:<sha>` = https://github.com/Zeref52/ktpmud-bkt-vuontoan-starter/commit/<sha>

| Mã | Trạng thái (Chưa / Đang / Xong) | Bằng chứng (commit / CI / file) | Ghi chú |
|---|---|---|---|
| B-01 | Đang | `public/estimate-exact.html` (C:d4faf27), `public/assets/js/components/estimate-exact.js` (C:715908e) | Trang đã có nhưng **chưa có link** từ luồng học hiện có (`game.html` / `muc-luc.html`), hiện vẫn là trang rời |
| B-02 | Đang | `server/fixtures/estimate-fixtures.json` — 12 câu `EST-01…EST-12` (commit PC-1 này); `generateMathProblem(rng)` (C:02cee8f) | Đã có 12 fixture synthetic phủ 4 phép tính, đối chiếu khớp `scoreMathAnswer` (36/36 mẫu chấm). **Chưa có test tự động** đọc fixture; UI vẫn dùng 5 câu cố định |
| B-03 | Đang | `server/math-logic.js` → `scoreMathAnswer` (C:02cee8f); `docs/ESTIMATION_FEATURE_SPEC.md` v2.0 (commit PC-1 này) | Đã chốt 1 quy tắc: làm tròn kết quả đến hàng chục, đạt khi lệch ≤ 5. Spec v2.0 và server đã khớp; **UI vẫn chấm riêng theo lệch ≤ 20%** → FE sửa khi chuyển sang gọi API |
| B-04 | Đang | `server/api.js` → `GET /api/math/generate` chỉ trả `a, b, operator, prompt` (C:d24a19e) | API đạt, nhưng UI hiện **chưa gọi API** mà tự tính đáp án ở client (`answerOf` trong `estimate-exact.js`) |
| B-05 | Đang | `server/api.js` → `POST /api/math/score` chấm tại server (C:d24a19e) | Đề chỉ giữ trong `Map` bộ nhớ (TTL 30 phút), **chưa lưu kết quả vào SQLite**; restart server mất trạng thái. UI chỉ gửi tổng điểm qua `/api/game-scores` có sẵn |
| B-06 | Đang | `scoreMathAnswer` trả `danh_gia: ['Đạt ước lượng' / 'Chưa đạt ước lượng', 'Tính đúng' / 'Chưa tính đúng']`; test `scoring phân biệt đúng/sai…` trong `tests/math-logic.test.js` (C:f1edeb9) | Server đã tách 2 phản hồi; UI chưa hiển thị phản hồi từ server |
| B-07 | Xong | `git diff --stat bkt-2026-v1 6e03914 -- server/auth.js data/seed.json Dockerfile DEPLOY.md` → rỗng | Không đụng auth/session/tài khoản mẫu/deployment. Chỉ thêm route mới trong `server/api.js`, không sửa `/api/auth/*`, `/api/teacher/*`, `/api/admin/*` |
| B-08 | Đang | `tests/math-logic.test.js` — 8 test: normal (tính 4 phép), invalid (chia 0, chia dư, âm, thập phân, thiếu), scoring đúng/sai (C:f1edeb9) | Thiếu test **biên** của dung sai (đúng ±5 / ±6) và test API (`/api/math/*`). `tests/estimation.test.js` đang test hàm cục bộ trong file, không test code thật → sẽ thay |
| B-09 | Xong | `package.json` `"test": "node --test"` (C:df5a25c); CI run xanh: https://github.com/Zeref52/ktpmud-bkt-vuontoan-starter/actions/runs/43052984615 | Chạy lại từ clean clone ngày 16/11: `npm ci && npm test` → 11 pass, 0 fail (Node 22) |
| B-10 | Xong | `.github/workflows/ci.yml` (commit PC-1 này): trigger `push` + `pull_request`, chạy `npm ci` và `npm test` | Link run CI mới ghi trong `source-ref.json` của PR #27 |
| B-11 | Đang | Tài khoản dùng `hocsinh01…99` synthetic; không có `.env`/token trong repo | `docs/AI_USAGE.md` (C:b71c1f7) ghi **họ tên thật** thành viên → đã thay bằng alias trong commit PC-1 này (vẫn còn trong lịch sử commit `b71c1f7`) |
| B-12 | Đang | `estimate-exact.js`: `fieldset/legend/label`, `:focus-visible`, `aria-live` cho thông báo (C:715908e) | Chưa kiểm thử đủ luồng bằng bàn phím; chưa có thông báo lỗi khi API/mạng lỗi (vì UI chưa gọi API) |

### 1.2. Sửa đổi bắt buộc từ Checkpoint 1
Không có — nhóm chưa nộp Checkpoint 1 (hạn cuối 08/11) nên không có nhận xét ❗ nào để sửa.

Các yêu cầu sửa nhận qua PR nộp bài (`fossbk-spec/ktpmud-project#27`, comment ngày 11/11 và 16/11):

| Mục | Trạng thái | Bằng chứng |
|---|---|---|
| Tạo `progress/PROGRESS.md` trên fork code | Xong | File này |
| `source-ref.json`: thay 6 giá trị `REPLACE_VOI_…` | Xong | PR #27, nhánh `submission-track-b-nhom05` |
| `README.md` bài nộp: điền nhóm, tóm tắt, hướng dẫn | Xong | PR #27 |
| 5 file `artifacts/` còn `TODO` | Xong (bản đầu, cập nhật tiếp đến Freeze) | PR #27 |
| Chuyển PR #27 sang Draft, sửa mô tả PR (nhóm, Track B, link fork) | Đang | PR #27 |

### 1.3. Timeline dự kiến đến khi hoàn thành
| Việc | Vai trò phụ trách | Mốc (CP2 15/11 · M3 · Freeze 19/11 · M4 20/11) | Ngày dự kiến |
|---|---|---|---|
| Chốt 1 quy tắc chấm, spec v2.0 + DECISIONS ADR-02 (B-03) — **xong trong commit PC-1** | BA | M3 | 17/11 |
| CI đổi `npm install` → `npm ci` (B-10) — **xong trong commit PC-1** | BA | M3 | 17/11 |
| Soạn 12 câu synthetic `server/fixtures/estimate-fixtures.json` (B-02) — **xong trong commit PC-1** | BA | M3 | 17/11 |
| Checklist kiểm thử thủ công `docs/MANUAL_TEST_CHECKLIST.md` — **xong trong commit PC-1** | BA | M3 | 17/11 |
| Thêm link dạng bài vào `game.html` / luồng học (B-01) | FE | M3 | 17/11 |
| UI gọi `GET /api/math/generate` + `POST /api/math/score`, bỏ tính đáp án ở client, hiển thị phản hồi 2 phần từ server (B-04, B-06) | FE, BE | M3 | 18/11 |
| Lưu kết quả chấm vào SQLite, đọc lại sau refresh (B-05) | BE | M3 | 18/11 |
| Test tự động đọc 12 fixture, kiểm tra 36 mẫu chấm (B-02, B-08) | BE | M3 | 18/11 |
| Draft PR #27 có check `validate` xanh | BA | PC-2 | trước 11:30 18/11 |
| Test API `/api/math/*`, thay `tests/estimation.test.js` (B-04, B-08) | BE | M3 | 19/11 trưa |
| Chạy checklist thủ công MT-01…MT-15, chụp ảnh, cập nhật TEST_REPORT | BA | Freeze | 19/11 |
| Kiểm tra luồng bàn phím, thông báo lỗi API (B-12) | FE | M3 | 19/11 |
| Hoàn thiện artifacts, README, slide/demo ≤ 7 phút | Cả nhóm | Freeze | 19/11 |
| Tag `bkt-2026-nhom05-rc1`, cập nhật `source-ref.json` | BA | Freeze | 23:59 19/11 |
| Chuyển PR #27 sang Ready for review | BA | M4 | 20/11 |

### 1.4. Rủi ro / đang vướng
- Nộp PC-1 muộn; thời gian còn lại đến Freeze (19/11) ngắn so với số AC đang "Đang".
- Spec đã được thống nhất với server (v2.0), nhưng UI vẫn chấm theo quy tắc riêng; nếu FE chưa chuyển sang gọi API kịp thì B-03, B-04, B-06 vẫn chưa đạt.
- Lưu kết quả (B-05) cần thêm bảng/cột trong SQLite — phải làm mà không đụng `server/auth.js`, session, tài khoản mẫu (B-07).
- Họ tên thật đã từng được commit trong `docs/AI_USAGE.md` (commit `b71c1f7`); đã sửa ở bản hiện tại nhưng không force-push xoá lịch sử.

### 1.5. Câu hỏi cho GV
- Q1: Với B-05, nhóm có được thêm bảng mới (vd `estimate_attempts`) trong `server/db.js` không, hay bắt buộc ghi vào bảng `attempts` hiện có qua `POST /api/submissions`?
- Q2: Họ tên thật còn trong lịch sử commit `b71c1f7` (đã sửa ở HEAD) có cần xử lý thêm không, khi quy định không cho force-push?

### 1.6. Phân công (alias hoặc vai trò, KHÔNG ghi họ tên/MSSV)
| Alias / vai trò (GitHub) | Đầu việc chính | Commit/PR tiêu biểu |
|---|---|---|
| BA (`Zeref52`) | Đặc tả dạng bài (spec v2.0), 12 câu synthetic, checklist kiểm thử, CI, tài liệu nộp bài, PROGRESS | `b71c1f7`, `6e03914`, commit PC-1, PR `fossbk-spec/ktpmud-project#27` |
| BE (`namfa7071-hash`) | `server/math-logic.js`, route `/api/math/*`, unit test logic | `02cee8f`, `d24a19e`, `df5a25c`, `f1edeb9` |
| FE (`lehoangg12339-oss`) | Trang + component "Ước lượng rồi tính đúng" | `d4faf27`, `715908e` |

## PC-2 — 18/11/2026
### 2.1. Đối chiếu timeline PC-1
| Việc (theo bảng 1.3) | Kế hoạch | Thực tế | Lệch & lý do |
|---|---|---|---|
### 2.2. Tiến độ theo acceptance criteria (cập nhật toàn bộ bảng 1.1)
| Mã | Trạng thái | Bằng chứng | Ghi chú |
|---|---|---|---|
### 2.3. Sẵn sàng nộp bài (đề thi Mục 6)
| Deliverable | Có / Chưa | Đường dẫn |
|---|---|---|
| README.md (cài đặt / chạy / test) | | |
| REQUIREMENTS.md | | |
| DECISIONS.md / ADR | | |
| Test tự động + CI xanh | | |
| TEST_REPORT.md | | |
| SECURITY_PRIVACY_CHECKLIST.md | | |
| AI_USE.md | | |
| CONTRIBUTIONS.md | | |
| Slide / demo script ≤ 7 phút | | |
| Draft PR vào `ktpmud-project`, check `validate` xanh | | |
### 2.4. Việc còn lại đến Freeze (23:59 19/11)
| Việc | Vai trò phụ trách | Hạn |
|---|---|---|
### 2.5. Rủi ro / câu hỏi cho GV
- 
## Kết quả cuối — Freeze 19/11/2026
- Tag: bkt-2026-nhom05-rc1 · SHA: 
- Trạng thái cuối từng mã AC: (cập nhật bảng 2.2 hoặc ghi "như 2.2 trừ: …")
- Những việc trong timeline chưa hoàn thành và lý do:
