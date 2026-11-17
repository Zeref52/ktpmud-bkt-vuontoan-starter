
/**
 * VƯỜN TOÁN LỚP 3 - ƯỚC LƯỢNG RỒI TÍNH ĐÚNG
 * Track B:
 * - Lấy câu hỏi từ GET /api/math/generate
 * - Gửi đáp án lên POST /api/math/score
 * - Hiển thị kết quả và điểm do server chấm
 * - Mỗi lượt chơi gồm 5 câu
 */
(function () {
  'use strict';

  const GAME_ID = 'estimate-exact';
  const TOTAL_QUESTIONS = 5;

  const STYLE_ID = 'estimate-exact-style';

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
    .ee-msg{min-height:3.2em;font-size:22px;font-weight:800;text-align:center;margin:0 0 16px}
    .ee-msg.ok{color:#006127}
    .ee-msg.bad{color:#b91c1c}
    .ee-result{background:#ecfdf5;border:3px solid #006127;border-radius:18px;padding:16px;margin:0 0 18px;font-size:19px}
    .ee-result p{margin:5px 0}
    .ee-card [hidden]{display:none!important}
  `;

  function injectStyle() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = CSS;
    document.head.appendChild(style);
  }

  function buildShell(container) {
    container.innerHTML = `
      <div class="ee-card">
        <p class="ee-progress" id="ee-progress">Đang chuẩn bị câu hỏi...</p>

        <p class="ee-problem" id="ee-problem" aria-live="polite">
          ...
        </p>

        <form id="ee-f1" autocomplete="off">
          <fieldset id="ee-s1" class="ee-step" disabled>
            <legend>Bước 1. Em ước lượng</legend>
            <label for="ee-est">Kết quả gần bằng số nào?</label>
            <input
              id="ee-est"
              class="ee-input"
              type="text"
              inputmode="numeric"
              pattern="[0-9]*"
              maxlength="12"
              required
            >
            <button type="submit" class="ee-btn">
              Chốt số ước lượng
            </button>
          </fieldset>
        </form>

        <form id="ee-f2" autocomplete="off">
          <fieldset id="ee-s2" class="ee-step" disabled>
            <legend>Bước 2. Em tính kết quả đúng</legend>
            <p class="ee-hint" id="ee-hint">
              Em chốt số ước lượng xong, ô này sẽ mở.
            </p>
            <label for="ee-ans">Đáp số của em</label>
            <input
              id="ee-ans"
              class="ee-input"
              type="text"
              inputmode="numeric"
              pattern="[0-9]*"
              maxlength="12"
              required
            >
            <button type="submit" class="ee-btn" id="ee-submit">
              Kiểm tra
            </button>
          </fieldset>
        </form>

        <div id="ee-result" class="ee-result" hidden></div>

        <p class="ee-msg" id="ee-msg" role="status" aria-live="polite"></p>

        <button type="button" class="ee-btn ee-next" id="ee-next" hidden>
          Câu tiếp theo
        </button>
      </div>
    `;
  }

  function init(container) {
    if (!window.MathAPI) {
      container.textContent = 'Không tìm thấy MathAPI. Em kiểm tra lại file api.js nhé.';
      return;
    }

    injectStyle();
    buildShell(container);

    const $ = (id) => container.querySelector('#' + id);

    const progress = $('ee-progress');
    const problem = $('ee-problem');
    const est = $('ee-est');
    const ans = $('ee-ans');
    const s1 = $('ee-s1');
    const s2 = $('ee-s2');
    const hint = $('ee-hint');
    const msg = $('ee-msg');
    const resultPanel = $('ee-result');
    const next = $('ee-next');
    const submitButton = $('ee-submit');

    let questionIndex = 0;
    let questionId = null;
    let currentQuestion = null;
    let estimate = null;

    let totalScore = 0;
    let startedAt = Date.now();

    let loading = false;
    let submitted = false;
    let nextAction = 'advance';

    function say(message, kind) {
      msg.textContent = message;
      msg.className = 'ee-msg ' + (kind || '');
    }

    function displayOperator(operator) {
      if (operator === '-') return '−';
      if (operator === '*') return '×';
      if (operator === '/') return '÷';
      return operator;
    }

    function displayQuestion(question) {
      const operator = displayOperator(question.operator);
      return `${question.a} ${operator} ${question.b} = ?`;
    }

    function setButtonsDisabled(disabled) {
      s1.disabled = disabled;
      s2.disabled = disabled;
      next.disabled = disabled;
    }

    function showLoadError(error) {
      loading = false;
      setButtonsDisabled(true);

      progress.textContent = `Câu ${questionIndex + 1} / ${TOTAL_QUESTIONS}`;
      problem.textContent = 'Chưa tải được câu hỏi';

      say(
        error.message || 'Có lỗi xảy ra khi tải câu hỏi. Em thử lại nhé.',
        'bad'
      );

      next.textContent = 'Thử tải lại';
      next.hidden = false;
      next.disabled = false;
      nextAction = 'load';
    }

    async function loadQuestion() {
      if (loading) return;

      loading = true;
      submitted = false;
      questionId = null;
      currentQuestion = null;
      estimate = null;

      setButtonsDisabled(true);
      next.hidden = true;
      resultPanel.hidden = true;

      est.value = '';
      ans.value = '';

      progress.textContent = `Đang tải câu ${questionIndex + 1} / ${TOTAL_QUESTIONS}...`;
      problem.textContent = '...';
      say('Đang lấy câu hỏi từ máy chủ...', '');

      try {
        const data = await window.MathAPI.get('/api/math/generate');

        if (!data || !data.questionId || !data.question) {
          throw new Error('Dữ liệu câu hỏi từ máy chủ không hợp lệ.');
        }

        questionId = data.questionId;
        currentQuestion = data.question;

        loading = false;

        progress.textContent = `Câu ${questionIndex + 1} / ${TOTAL_QUESTIONS}`;
        problem.textContent = displayQuestion(currentQuestion);

        s1.disabled = false;
        s2.disabled = true;

        hint.hidden = false;
        say('Em hãy quan sát phép tính và ước lượng kết quả nhé.', '');

        est.focus({ preventScroll: true });
      } catch (error) {
        showLoadError(error);
      }
    }

    function showServerResult(data) {
      const estimateCorrect = data.uoc_luong_dung === true;
      const exactCorrect = data.tinh_dung === true;

      const estimateStatus = estimateCorrect
        ? 'Đúng'
        : 'Chưa đạt';

      const exactStatus = exactCorrect
        ? 'Đúng'
        : 'Chưa đúng';

      const correctAnswer = data.ket_qua_chinh_xac;
      const estimateTarget = data.ket_qua_uoc_luong;
      const points = Number(data.diem) || 0;

      totalScore += points;

      resultPanel.innerHTML = `
        <p><strong>Kết quả từ máy chủ</strong></p>
        <p>Ước lượng: <strong>${estimateStatus}</strong></p>
        <p>Tính kết quả: <strong>${exactStatus}</strong></p>
        <p>Kết quả ước lượng tham khảo: <strong>${estimateTarget ?? '—'}</strong></p>
        <p>Đáp án chính xác: <strong>${correctAnswer ?? '—'}</strong></p>
        <p>Điểm câu này: <strong>${points}/${data.tong_diem ?? 2}</strong></p>
      `;

      resultPanel.hidden = false;

      if (estimateCorrect && exactCorrect) {
        say('Tuyệt vời! Em đã ước lượng và tính đúng.', 'ok');
      } else if (exactCorrect) {
        say('Em tính đúng rồi! Lần sau hãy thử ước lượng sát hơn nhé.', 'ok');
      } else {
        say('Chưa chính xác. Em xem lại đáp án và cố gắng ở câu tiếp theo nhé.', 'bad');
      }

      s1.disabled = true;
      s2.disabled = true;

      next.textContent =
        questionIndex < TOTAL_QUESTIONS - 1
          ? 'Câu tiếp theo'
          : 'Xem tổng kết';

      next.hidden = false;
      next.disabled = false;
      nextAction = 'advance';
      next.focus({ preventScroll: true });
    }

    function finish() {
      setButtonsDisabled(true);

      progress.textContent = 'Em đã hoàn thành trò chơi!';
      problem.textContent = `${totalScore} / ${TOTAL_QUESTIONS * 2} điểm`;

      resultPanel.hidden = false;
      resultPanel.innerHTML = `
        <p><strong>Tổng kết lượt chơi</strong></p>
        <p>Số câu đã hoàn thành: <strong>${TOTAL_QUESTIONS}</strong></p>
        <p>Tổng điểm: <strong>${totalScore}/${TOTAL_QUESTIONS * 2}</strong></p>
        <p>Thời gian làm bài: <strong>${Math.max(0, Math.round((Date.now() - startedAt) / 1000))} giây</strong></p>
      `;

      say('Chúc mừng em đã hoàn thành 5 câu hỏi!', 'ok');

      next.textContent = 'Chơi lại';
      next.hidden = false;
      next.disabled = false;
      nextAction = 'restart';
    }

    $('ee-f1').addEventListener('submit', (event) => {
      event.preventDefault();

      if (loading || submitted || !currentQuestion) return;

      const value = est.value.trim();

      if (!/^\d+$/.test(value) || !Number.isSafeInteger(Number(value))) {
        say('Em nhập một số nguyên không âm nhé.', 'bad');
        est.focus();
        return;
      }

      estimate = Number(value);

      s1.disabled = true;
      s2.disabled = false;
      hint.hidden = true;

      say(
        `Em ước lượng là ${estimate}. Bây giờ em hãy tính kết quả chính xác nhé.`,
        ''
      );

      ans.focus({ preventScroll: true });
    });

    $('ee-f2').addEventListener('submit', async (event) => {
      event.preventDefault();

      if (loading || submitted || !questionId || estimate === null) return;

      const value = ans.value.trim();

      if (!/^\d+$/.test(value) || !Number.isSafeInteger(Number(value))) {
        say('Em nhập kết quả là một số nguyên không âm nhé.', 'bad');
        ans.focus();
        return;
      }

      const exactAnswer = Number(value);

      // Khóa ngay để tránh gửi cùng một câu nhiều lần.
      submitted = true;
      loading = true;
      setButtonsDisabled(true);
      submitButton.textContent = 'Đang chấm điểm...';

      say('Đang gửi đáp án lên máy chủ để chấm điểm...', '');

      try {
        const data = await window.MathAPI.post('/api/math/score', {
          questionId: questionId,
          uoc_luong: estimate,
          ket_qua_dung: exactAnswer
        });

        loading = false;
        submitButton.textContent = 'Kiểm tra';

        if (!data || typeof data.diem !== 'number') {
          throw new Error('Máy chủ trả về kết quả không hợp lệ.');
        }

        showServerResult(data);
      } catch (error) {
        loading = false;
        submitButton.textContent = 'Kiểm tra';

        // Không gửi lại câu hỏi cũ vì máy chủ có thể đã chấm và xóa questionId.
        s1.disabled = true;
        s2.disabled = true;

        say(
          `Không nhận được kết quả chấm điểm: ${error.message}. Em có thể chuyển sang câu tiếp theo.`,
          'bad'
        );

        next.textContent =
          questionIndex < TOTAL_QUESTIONS - 1
            ? 'Bỏ qua và sang câu tiếp theo'
            : 'Xem tổng kết';

        next.hidden = false;
        next.disabled = false;
        nextAction = 'advance';
      }
    });

    next.addEventListener('click', () => {
      if (loading) return;

      if (nextAction === 'load') {
        loadQuestion();
        return;
      }

      if (nextAction === 'restart') {
        questionIndex = 0;
        totalScore = 0;
        startedAt = Date.now();
        loadQuestion();
        return;
      }

      if (questionIndex < TOTAL_QUESTIONS - 1) {
        questionIndex += 1;
        loadQuestion();
      } else {
        finish();
      }
    });

    loadQuestion();
  }

  window.initEstimateExact = function (containerId = 'estimate-exact-root') {
    const container = document.getElementById(containerId);
    if (container) init(container);
  };

  document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('estimate-exact-root')) {
      window.initEstimateExact('estimate-exact-root');
    }
  });
})();
