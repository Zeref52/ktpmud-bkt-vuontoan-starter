/**
 * VƯỜN TOÁN LỚP 3 - DẠNG BÀI "ƯỚC LƯỢNG RỒI TÍNH ĐÚNG" (Track B)
 * Làm bài 2 bước: Ô 1 nhập số ước lượng -> chốt xong mới mở Ô 2 nhập đáp số đúng.
 * Cách dùng: trang có <div id="estimate-exact-root"></div> thì component tự chạy.
 * Cuối bài gọi MathGameScore.finish(GAME_ID, ...) nếu game-score.js đã được nạp.
 */
(function () {
  'use strict';

  const GAME_ID = 'estimate-exact';
  const POINTS_FIRST_TRY = 10;      // đúng ngay lần đầu
  const POINTS_RETRY = 5;           // đúng sau khi thử lại
  const POINTS_GOOD_ESTIMATE = 5;   // thưởng thêm nếu ước lượng sát
  const GOOD_ESTIMATE_RATIO = 0.2;  // "sát" = lệch không quá 20% đáp số

  // Thêm câu mới: thêm một dòng { a, op, b }. op là "+", "−" hoặc "×".
  const QUESTIONS = [
    { a: 48, op: '+', b: 37 },
    { a: 92, op: '−', b: 38 },
    { a: 6, op: '×', b: 47 },
    { a: 125, op: '+', b: 268 },
    { a: 504, op: '−', b: 197 }
  ];

  const STYLE_ID = 'estimate-exact-style';
  // Style riêng (tiền tố ee-) để không phụ thuộc tailwind.build.css; màu theo tông emerald/amber của Mục lục.
  const CSS = `
    .ee-card{max-width:760px;margin:0 auto;font-size:22px;line-height:1.4;color:#1e293b}
    .ee-progress{font-weight:800;color:#92400e;margin:0 0 12px}
    .ee-problem{background:#006127;color:#fff;border-radius:24px;padding:24px 12px;text-align:center;font-size:clamp(44px,11vw,80px);font-weight:800;margin:0 0 20px}
    .ee-step{min-width:0;border:4px solid #006127;border-radius:24px;background:#fff;padding:12px 20px 20px;margin:0 0 20px}
    .ee-step:disabled{border-color:#94a3b8;background:#f1f5f9;color:#475569}
    .ee-step legend{font-size:24px;font-weight:800;padding:0 8px}
    .ee-step label{display:block;font-weight:700}
    .ee-input{display:block;width:100%;box-sizing:border-box;font:inherit;font-size:40px;font-weight:700;text-align:center;padding:12px 16px;margin:8px 0 16px;border:4px solid #1e293b;border-radius:16px;background:#fff;color:#1e293b}
    .ee-step:disabled .ee-input{border-color:#94a3b8;background:#f1f5f9}
    .ee-btn{display:block;width:100%;min-height:72px;font:inherit;font-size:26px;font-weight:800;border:0;border-radius:20px;background:#f7be23;color:#1e293b;box-shadow:0 6px 0 #b58500;cursor:pointer}
    .ee-btn:active{transform:translateY(4px);box-shadow:0 2px 0 #b58500}
    .ee-btn:disabled{background:#cbd5e1;box-shadow:none;cursor:not-allowed}
    .ee-next{background:#006127;color:#fff;box-shadow:0 6px 0 #004219}
    .ee-next:active{box-shadow:0 2px 0 #004219}
    .ee-input:focus-visible,.ee-btn:focus-visible{outline:6px solid #0b57d0;outline-offset:3px}
    .ee-hint{font-size:20px;margin:0 0 8px}
    .ee-msg{min-height:3.2em;font-size:26px;font-weight:800;text-align:center;margin:0 0 16px}
    .ee-msg.ok{color:#006127}.ee-msg.bad{color:#b91c1c}
    .ee-card [hidden]{display:none!important}
  `;

  const answerOf = (q) => (q.op === '+' ? q.a + q.b : q.op === '−' ? q.a - q.b : q.a * q.b);
  const opText = (q) => `${q.a} ${q.op} ${q.b}`;

  function injectStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const el = document.createElement('style');
    el.id = STYLE_ID;
    el.textContent = CSS;
    document.head.appendChild(el);
  }

  function buildShell(container) {
    container.innerHTML = `
      <div class="ee-card">
        <p class="ee-progress" id="ee-progress"></p>
        <p class="ee-problem" id="ee-problem" aria-live="polite"></p>

        <form id="ee-f1" autocomplete="off">
          <fieldset id="ee-s1" class="ee-step">
            <legend>Bước 1. Em ước lượng</legend>
            <label for="ee-est">Kết quả gần bằng số nào?</label>
            <input id="ee-est" class="ee-input" type="text" inputmode="numeric" pattern="[0-9]*">
            <button type="submit" class="ee-btn">Chốt số ước lượng</button>
          </fieldset>
        </form>

        <form id="ee-f2" autocomplete="off">
          <fieldset id="ee-s2" class="ee-step" disabled>
            <legend>Bước 2. Em tính kết quả đúng</legend>
            <p class="ee-hint" id="ee-hint">Em chốt số ước lượng xong, ô này sẽ mở.</p>
            <label for="ee-ans">Đáp số của em</label>
            <input id="ee-ans" class="ee-input" type="text" inputmode="numeric" pattern="[0-9]*">
            <button type="submit" class="ee-btn">Kiểm tra</button>
          </fieldset>
        </form>

        <p class="ee-msg" id="ee-msg" role="status" aria-live="polite"></p>
        <button type="button" class="ee-btn ee-next" id="ee-next" hidden></button>
      </div>`;
  }

  function init(container) {
    injectStyle();
    buildShell(container);

    const $ = (id) => container.querySelector('#' + id);
    const progress = $('ee-progress'), problem = $('ee-problem'), hint = $('ee-hint'),
      est = $('ee-est'), ans = $('ee-ans'), s1 = $('ee-s1'), s2 = $('ee-s2'),
      msg = $('ee-msg'), next = $('ee-next');

    let i = 0, estimate = null, attempts = 0, score = 0, finished = false;
    let startedAt = Date.now();

    function say(text, kind) { msg.textContent = text; msg.className = 'ee-msg ' + (kind || ''); }

    function show() {
      const q = QUESTIONS[i];
      progress.textContent = `Câu ${i + 1} / ${QUESTIONS.length}`;
      problem.textContent = `${opText(q)} = ?`;
      est.value = ''; ans.value = ''; estimate = null; attempts = 0;
      s1.disabled = false; s2.disabled = true; hint.hidden = false;
      next.hidden = true; say('', '');
      est.focus({ preventScroll: true });
    }

    function restart() {
      i = 0; score = 0; finished = false; startedAt = Date.now();
      show();
    }

    function finish() {
      finished = true;
      s1.disabled = true; s2.disabled = true;
      progress.textContent = 'Em đã làm xong ' + QUESTIONS.length + ' câu!';
      problem.textContent = score + ' điểm';
      say('', '');
      if (window.MathGameScore && typeof window.MathGameScore.finish === 'function') {
        next.hidden = true;
        window.MathGameScore.finish(GAME_ID, score, startedAt);
      } else {
        next.textContent = 'Chơi lại';
        next.hidden = false;
      }
    }

    $('ee-f1').addEventListener('submit', (e) => {
      e.preventDefault();
      const v = est.value.trim();
      if (!/^\d+$/.test(v)) { say('Em nhập một số nhé, ví dụ 80.', 'bad'); return; }
      estimate = Number(v);
      s1.disabled = true; s2.disabled = false; hint.hidden = true;
      say(`Em ước lượng là ${estimate}. Giờ em tính kết quả đúng nhé.`, '');
      ans.focus({ preventScroll: true });
    });

    $('ee-f2').addEventListener('submit', (e) => {
      e.preventDefault();
      const q = QUESTIONS[i], v = ans.value.trim();
      if (!/^\d+$/.test(v)) { say('Em nhập kết quả là một số nhé.', 'bad'); return; }
      const right = answerOf(q);
      attempts += 1;
      if (Number(v) === right) {
        const close = Math.abs(estimate - right) <= right * GOOD_ESTIMATE_RATIO;
        const gained = (attempts === 1 ? POINTS_FIRST_TRY : POINTS_RETRY) + (close ? POINTS_GOOD_ESTIMATE : 0);
        score += gained;
        say(`Đúng rồi! ${opText(q)} = ${right}. Em ước lượng ${estimate}, đáp số là ${right}. ` +
          (close ? 'Em ước lượng rất sát!' : 'Lần sau em thử ước lượng sát hơn nhé.') + ` (+${gained} điểm)`, 'ok');
        s2.disabled = true;
        next.textContent = i < QUESTIONS.length - 1 ? 'Câu tiếp theo' : 'Xem kết quả';
        next.hidden = false;
        next.focus({ preventScroll: true });
      } else {
        say('Chưa đúng. Em thử tính lại nhé.', 'bad');
        ans.select();
      }
    });

    next.addEventListener('click', () => {
      if (finished) { restart(); return; }
      if (i < QUESTIONS.length - 1) { i += 1; show(); } else { finish(); }
    });

    show();
  }

  window.initEstimateExact = function (containerId = 'estimate-exact-root') {
    const container = document.getElementById(containerId);
    if (container) init(container);
  };

  document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('estimate-exact-root')) window.initEstimateExact('estimate-exact-root');
  });
})();
