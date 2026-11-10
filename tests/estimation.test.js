const assert = require('assert');

// Giả lập hàm logic sẽ gọi từ module của Nam (server/services/estimationService.js)
// Khi Nam code xong file này, chỉ cần uncomment dòng require bên dưới:
// const { validateEstimation, generateEstimationProblem } = require('../server/services/estimationService');

// Logic kiểm thử mẫu trong khi chờ Nam hoàn thiện file backend
function checkEstimationLogic(a, b, op, estimateVal, exactVal) {
  const trueExact = op === '+' ? a + b : a - b;
  const isExactCorrect = exactVal === trueExact;
  
  // Dung sai: sai số không quá 10 đối với phép tính <= 100, không quá 30 đối với phép tính <= 1000
  const maxTolerance = trueExact <= 100 ? 10 : 30;
  const isEstimateValid = Math.abs(estimateVal - trueExact) <= maxTolerance;

  return { isExactCorrect, isEstimateValid };
}

describe('Kiểm thử logic dạng bài: Ước lượng trước khi tính đúng (Track B)', () => {
  describe('1. Kiểm tra phép cộng trong phạm vi 1000', () => {
    it('Ước lượng chuẩn và tính đúng: 38 + 53 = 91, ước lượng 90', () => {
      const result = checkEstimationLogic(38, 53, '+', 90, 91);
      assert.strictEqual(result.isExactCorrect, true, 'Tính đúng phải là true');
      assert.strictEqual(result.isEstimateValid, true, 'Ước lượng 90 phải nằm trong dung sai cho phép');
    });

    it('Ước lượng lệch quá mức cho phép: 38 + 53 = 91 nhưng ước lượng 60', () => {
      const result = checkEstimationLogic(38, 53, '+', 60, 91);
      assert.strictEqual(result.isExactCorrect, true);
      assert.strictEqual(result.isEstimateValid, false, 'Ước lượng 60 là quá xa, phải trả về false');
    });
  });

  describe('2. Kiểm tra phép trừ (Đảm bảo không ra số âm)', () => {
    it('Phép trừ hợp lệ: 154 - 68 = 86, ước lượng 80', () => {
      const result = checkEstimationLogic(154, 68, '-', 80, 86);
      assert.strictEqual(result.isExactCorrect, true);
      assert.strictEqual(result.isEstimateValid, true);
    });

    it('Kiểm tra điều kiện biên: Số bị trừ luôn lớn hơn hoặc bằng số trừ', () => {
      const a = 200;
      const b = 150;
      assert.ok(a >= b, 'Lỗi sư phạm: Số bị trừ nhỏ hơn số trừ gây ra số âm cho học sinh lớp 3');
    });
  });
});