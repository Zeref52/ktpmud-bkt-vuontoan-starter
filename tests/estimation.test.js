'use strict';

const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

// Mỗi lần chạy test dùng SQLite riêng, không đụng vào data/vuon-toan.db của nhóm.
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'vuontoan-estimate-test-'));
process.env.DB_PATH = path.join(tempDir, 'test.db');

const express = require('express');
const db = require('../server/db');
const api = require('../server/api');
const { attachUser, issueToken } = require('../server/auth');
const { calculate, scoreMathAnswer } = require('../server/math-logic');

const app = express();
app.use(express.json());
app.use(attachUser(db));
app.use('/api', api);

let server;
let baseUrl;
let token;

before(async () => {
  const student = db.prepare("SELECT id FROM users WHERE username='hocsinh01'").get();
  assert.ok(student, 'DB test phải seed được tài khoản học sinh mẫu');
  token = issueToken({ id: student.id, role: 'student' });
  await new Promise(resolve => {
    server = app.listen(0, '127.0.0.1', resolve);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  if (server) {
    if (typeof server.closeAllConnections === 'function') server.closeAllConnections();
    await new Promise((resolve, reject) => server.close(err => err ? reject(err) : resolve()));
  }
  db.close();
  fs.rmSync(tempDir, { recursive: true, force: true });
});

function authHeaders() {
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

test('Boundary: sai lệch đúng 5 được chấp nhận, sai lệch 6 bị từ chối', () => {
  // 125 + 230 = 355, làm tròn hàng chục thành 360.
  const accepted = scoreMathAnswer({
    a: 125, b: 230, operator: '+',
    uoc_luong: 365, ket_qua_dung: 355,
  });
  const rejected = scoreMathAnswer({
    a: 125, b: 230, operator: '+',
    uoc_luong: 366, ket_qua_dung: 355,
  });

  assert.equal(accepted.ket_qua_uoc_luong, 360);
  assert.equal(accepted.uoc_luong_dung, true);
  assert.equal(rejected.uoc_luong_dung, false);
});

test('GET /api/math/generate không trả đáp án đúng xuống client', async () => {
  const response = await fetch(`${baseUrl}/api/math/generate`, { headers: authHeaders() });
  assert.equal(response.status, 200);
  const body = await response.json();

  assert.ok(body.questionId);
  assert.ok(body.question.prompt);
  assert.ok(Number.isInteger(body.question.a));
  assert.ok(Number.isInteger(body.question.b));
  assert.ok(body.question.operator);
  assert.equal(Object.hasOwn(body.question, 'expectedResult'), false);
  assert.equal(Object.hasOwn(body.question, 'expectedEstimate'), false);
  assert.equal(Object.hasOwn(body, 'answer'), false);
});

test('POST /api/math/score chấm bài và GET /api/math/history đọc lại được sau khi lưu SQLite', async () => {
  const generatedResponse = await fetch(`${baseUrl}/api/math/generate`, { headers: authHeaders() });
  assert.equal(generatedResponse.status, 200);
  const generated = await generatedResponse.json();
  const { a, b, operator } = generated.question;
  const exact = calculate(a, b, operator);
  const estimate = Math.round(exact / 10) * 10;

  const scoreResponse = await fetch(`${baseUrl}/api/math/score`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({
      questionId: generated.questionId,
      uoc_luong: estimate,
      ket_qua_dung: exact,
    }),
  });
  assert.equal(scoreResponse.status, 200);
  const score = await scoreResponse.json();
  assert.equal(score.uoc_luong_dung, true);
  assert.equal(score.tinh_dung, true);
  assert.equal(score.diem, 2);

  const historyResponse = await fetch(`${baseUrl}/api/math/history`, { headers: authHeaders() });
  assert.equal(historyResponse.status, 200);
  const history = await historyResponse.json();
  const saved = history.attempts.find(item => item.questionId === generated.questionId);

  assert.ok(saved, 'Lượt chấm vừa thực hiện phải có trong lịch sử');
  assert.equal(saved.uoc_luong, estimate);
  assert.equal(saved.ket_qua_dung, exact);
  assert.equal(saved.uoc_luong_dung, true);
  assert.equal(saved.tinh_dung, true);
});

test('History API yêu cầu đăng nhập', async () => {
  const response = await fetch(`${baseUrl}/api/math/history`);
  assert.equal(response.status, 401);
});

test('Fixture có đúng 12 câu, phép tính khớp đáp án và không sinh kết quả âm/chia dư', () => {
  const fixturePath = path.join(__dirname, '..', 'server', 'fixtures', 'estimate.json');
  const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));
  assert.equal(fixture.questions.length, 12);

  for (const question of fixture.questions) {
    const actual = calculate(question.a, question.b, question.operator);
    assert.equal(actual, question.expectedResult, question.id);
    assert.equal(Math.round(actual / 10) * 10, question.expectedEstimate, question.id);
  }
});
