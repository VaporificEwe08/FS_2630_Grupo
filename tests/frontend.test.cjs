const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('la página contiene el formulario de registro y la API compartida', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'app', 'index.html'), 'utf8');
  const js = fs.readFileSync(path.join(__dirname, '..', 'app', 'app.js'), 'utf8');
  assert.match(html, /id="authForm"/);
  assert.match(html, /id="reportForm"/);
  assert.match(html, /id="myReportsButton"/);
  assert.match(js, /request\('\/api\/auth'/);
  assert.match(js, /request\('\/api\/reports'/);
  assert.match(js, /\/api\/reports\?mine=1/);
  assert.doesNotMatch(js, /localStorage/);
});
