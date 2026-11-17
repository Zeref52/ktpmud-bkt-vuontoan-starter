'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Logic thuần cho bài toán thực tế lớp 3.
 * Không phụ thuộc Express/SQLite để có thể Unit Test độc lập.
 */
const OPERATORS = Object.freeze(['+', '-', '×', '÷']);
const FIXTURE_PATH = path.join(__dirname, 'fixtures', 'estimate.json');

let fixtureIndex = 0;

function loadEstimateFixtures() {
  const content = fs.readFileSync(FIXTURE_PATH, 'utf8');
  const data = JSON.parse(content);

  if (!Array.isArray(data.items) || data.items.length === 0) {
    throw new Error('File server/fixtures/estimate.json không có câu hỏi.');
  }

  return data.items;
}

function generateFixtureProblem() {
  const fixtures = loadEstimateFixtures();

  const item = fixtures[fixtureIndex % fixtures.length];
  fixtureIndex++;

  const actualResult = calculate(item.a, item.b, item.operator);
  const actualEstimate = Math.round(actualResult / 10) * 10;

  if (
    actualResult !== item.expectedResult ||
    actualEstimate !== item.expectedEstimate
  ) {
    throw new Error(`Dữ liệu fixture ${item.id} không hợp lệ.`);
  }

  return {
    questionId: item.id,
    a: item.a,
    b: item.b,
    operator: item.operator,
    prompt: item.prompt,
    expectedResult: item.expectedResult,
    expectedEstimate: item.expectedEstimate,
    estimateAcceptRange: item.estimateAcceptRange,
  };
}

function randomInt(min, max, rng = Math.random) {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function calculate(a, b, operator) {
  if (!Number.isSafeInteger(a) || !Number.isSafeInteger(b) || a <= 0 || b <= 0) {
    throw new TypeError('Hai số của bài toán phải là số nguyên dương.');
  }

  let result;
  switch (operator) {
    case '+': result = a + b; break;
    case '-': result = a - b; break;
    case '×': result = a * b; break;
    case '÷':
      if (b === 0) throw new RangeError('Không thể chia cho 0.');
      if (a % b !== 0) throw new RangeError('Phép chia phải có thương là số nguyên.');
      result = a / b;
      break;
    default:
      throw new TypeError('Phép tính không được hỗ trợ.');
  }

  if (!Number.isSafeInteger(result) || result <= 0) {
    throw new RangeError('Kết quả bài toán phải là số nguyên dương.');
  }
  return result;
}

function buildStory(a, b, operator, rng) {
  const nouns = [
    { singular: 'quyển sách', plural: 'quyển sách', place: 'thư viện' },
    { singular: 'quả cam', plural: 'quả cam', place: 'cửa hàng trái cây' },
    { singular: 'chiếc bút', plural: 'chiếc bút', place: 'lớp học' },
    { singular: 'nhãn vở', plural: 'nhãn vở', place: 'nhà sách' },
  ];
  const item = nouns[randomInt(0, nouns.length - 1, rng)];

  if (operator === '+') {
    return `Ở ${item.place} có ${a} ${item.plural}, sau đó được bổ sung thêm ${b} ${item.plural}. Hỏi có tất cả bao nhiêu ${item.plural}?`;
  }
  if (operator === '-') {
    return `Ở ${item.place} có ${a} ${item.plural}, đã sử dụng hoặc bán đi ${b} ${item.plural}. Hỏi còn lại bao nhiêu ${item.plural}?`;
  }
  if (operator === '×') {
    return `Có ${a} hộp, mỗi hộp có ${b} ${item.plural}. Hỏi có tất cả bao nhiêu ${item.plural}?`;
  }
  return `Có ${a} ${item.plural} được chia đều cho ${b} bạn. Hỏi mỗi bạn nhận được bao nhiêu ${item.plural}?`;
}

/** Sinh một bài toán có phép tính và kết quả luôn là số nguyên dương. */
function generateMathProblem(rng = Math.random, options = {}) {
  if (options.useFixtures) {
    return generateFixtureProblem();
  }
  const operator = OPERATORS[randomInt(0, OPERATORS.length - 1, rng)];
  let a;
  let b;

  switch (operator) {
    case '+':
      a = randomInt(120, 480, rng);
      b = randomInt(100, 450, rng);
      break;
    case '-':
      a = randomInt(200, 900, rng);
      b = randomInt(1, a - 1, rng);
      break;
    case '×':
      a = randomInt(2, 9, rng);
      b = randomInt(2, 9, rng);
      break;
    case '÷': {
      b = randomInt(2, 9, rng);
      const quotient = randomInt(2, 9, rng);
      a = b * quotient;
      break;
    }
    default:
      throw new Error('Không thể sinh phép tính.');
  }

  const result = calculate(a, b, operator);
  return {
    a,
    b,
    operator,
    prompt: buildStory(a, b, operator, rng),
    // Dùng nội bộ ở server; API chỉ gửi prompt và các toán hạng cho trình duyệt.
    expectedResult: result,
    expectedEstimate: Math.round(result / 10) * 10,
  };
}

function toAnswer(value, fieldName, allowZero = true) {
  const parsed = typeof value === 'string' && value.trim() !== '' ? Number(value) : value;
  if (!Number.isSafeInteger(parsed) || parsed < (allowZero ? 0 : 1)) {
    throw new TypeError(`${fieldName} phải là số nguyên${allowZero ? ' không âm' : ' dương'}.`);
  }
  return parsed;
}

/**
 * Chấm 2 tiêu chí:
 * - Ước lượng: làm tròn đáp án đến hàng chục, chấp nhận sai số tối đa 5.
 * - Tính đúng: đáp án học sinh phải trùng kết quả chính xác.
 */
function scoreMathAnswer({ a, b, operator, uoc_luong, ket_qua_dung }) {
  const expectedResult = calculate(a, b, operator);
  const estimate = toAnswer(uoc_luong, 'uoc_luong');
  const exactAnswer = toAnswer(ket_qua_dung, 'ket_qua_dung');

  const expectedEstimate = Math.round(expectedResult / 10) * 10;
  const estimateCorrect = Math.abs(estimate - expectedEstimate) <= 5;
  const exactCorrect = exactAnswer === expectedResult;

  const score = Number(estimateCorrect) + Number(exactCorrect);

  return {
    uoc_luong_dung: estimateCorrect,
    tinh_dung: exactCorrect,

    danh_gia: [
      estimateCorrect ? 'Đạt ước lượng' : 'Chưa đạt ước lượng',
      exactCorrect ? 'Tính đúng' : 'Chưa tính đúng',
    ],

    ket_qua_uoc_luong: expectedEstimate,
    ket_qua_chinh_xac: expectedResult,
    diem: score,
    tong_diem: 2,

    estimateCorrect,
    exactCorrect,
    expectedEstimate,
    expectedResult,
    score,
  };
}

module.exports = {
  OPERATORS,
  calculate,
  generateMathProblem,
  generateFixtureProblem,
  loadEstimateFixtures,
  scoreMathAnswer,
};
