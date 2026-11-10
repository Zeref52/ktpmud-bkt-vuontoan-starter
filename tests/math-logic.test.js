'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  calculate,
  generateMathProblem,
  scoreMathAnswer,
} = require('../server/math-logic');

test('calculate hỗ trợ cộng, trừ, nhân và chia chính xác', () => {
  assert.equal(calculate(125, 230, '+'), 355);
  assert.equal(calculate(500, 175, '-'), 325);
  assert.equal(calculate(8, 7, '×'), 56);
  assert.equal(calculate(72, 8, '÷'), 9);
});

test('calculate từ chối chia cho 0', () => {
  assert.throws(() => calculate(12, 0, '÷'), /số nguyên dương/);
});

test('calculate từ chối kết quả âm hoặc bằng 0', () => {
  assert.throws(() => calculate(10, 10, '-'), /số nguyên dương/);
  assert.throws(() => calculate(10, 11, '-'), /số nguyên dương/);
});

test('calculate từ chối phép chia có dư', () => {
  assert.throws(() => calculate(10, 3, '÷'), /thương là số nguyên/);
});

test('generator sinh 1.000 bài toán hợp lệ, kết quả luôn dương và phép chia không có dư', () => {
  let seed = 0;
  const rng = () => {
    seed = (seed + 137) % 997;
    return seed / 997;
  };

  for (let i = 0; i < 1000; i += 1) {
    const question = generateMathProblem(rng);
    assert.ok(question.a > 0 && Number.isInteger(question.a));
    assert.ok(question.b > 0 && Number.isInteger(question.b));
    assert.ok(question.expectedResult > 0 && Number.isInteger(question.expectedResult));
    assert.ok(question.prompt.length > 20);
    if (question.operator === '÷') {
      assert.equal(question.a % question.b, 0);
    }
  }
});

test('scoring công nhận ước lượng trong sai số 5 và đáp án chính xác', () => {
  const result = scoreMathAnswer({
    a: 125,
    b: 230,
    operator: '+',
    uoc_luong: 360,
    ket_qua_dung: 355,
  });
  assert.equal(result.uoc_luong_dung, true);
  assert.equal(result.tinh_dung, true);
  assert.equal(result.diem, 2);
  assert.deepEqual(result.danh_gia, ['Đạt ước lượng', 'Tính đúng']);
});

test('scoring phân biệt đúng/sai giữa ước lượng và tính chính xác', () => {
  const result = scoreMathAnswer({
    a: 125,
    b: 230,
    operator: '+',
    uoc_luong: 300,
    ket_qua_dung: 350,
  });
  assert.equal(result.uoc_luong_dung, false);
  assert.equal(result.tinh_dung, false);
  assert.equal(result.diem, 0);
});

test('scoring từ chối dữ liệu đầu vào âm, thập phân hoặc thiếu', () => {
  assert.throws(() => scoreMathAnswer({ a: 10, b: 5, operator: '-', uoc_luong: -1, ket_qua_dung: 5 }));
  assert.throws(() => scoreMathAnswer({ a: 10, b: 5, operator: '-', uoc_luong: 5.5, ket_qua_dung: 5 }));
  assert.throws(() => scoreMathAnswer({ a: 10, b: 5, operator: '-', uoc_luong: 5 }));
});
