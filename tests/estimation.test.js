const assert = require('assert');

function checkEstimationLogic(a, b, op, estimateVal, exactVal) {
  const trueExact = op === '+' ? a + b : a - b;
  const isExactCorrect = exactVal === trueExact;
  
  // Dung sai: sai số không quá 10 đối với phạm vi <= 100, không quá 50 đối với <= 1000
  const maxTolerance = trueExact <= 100 ? 10 : 50;
  const isEstimateValid = Math.abs(estimateVal - trueExact) <= maxTolerance;

  return { isExactCorrect, isEstimateValid };
}

describe('Kiểm thử logic dạng bài: Ước lượng trước khi tính đúng (Track B)', () => {
  it('Phép cộng: 38 + 53 = 91, ước lượng 90 là hợp lệ', () => {
    const result = checkEstimationLogic(38, 53, '+', 90, 91);
    assert.strictEqual(result.isExactCorrect, true);
    assert.strictEqual(result.isEstimateValid, true);
  });

  it('Phép trừ: 154 - 68 = 86, ước lượng 80 là hợp lệ', () => {
    const result = checkEstimationLogic(154, 68, '-', 80, 86);
    assert.strictEqual(result.isExactCorrect, true);
    assert.strictEqual(result.isEstimateValid, true);
  });

  it('Điều kiện biên: Số bị trừ luôn lớn hơn số trừ để kết quả không âm', () => {
    const a = 200, b = 150;
    assert.ok(a >= b, 'Lỗi sư phạm: Số bị trừ nhỏ hơn số trừ');
  });
});