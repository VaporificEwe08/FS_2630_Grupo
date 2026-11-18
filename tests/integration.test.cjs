const { test } = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const { Pool } = require('pg');

test('registro, sesión y reporte persisten en PostgreSQL', { skip: !process.env.DATABASE_URL }, async () => {
  const port = 32000 + Math.floor(Math.random() * 1000);
  const base = `http://127.0.0.1:${port}`;
  const server = spawn(process.execPath, [path.join(__dirname, '..', 'scripts', 'dev-server.cjs')], {
    env: { ...process.env, PORT: String(port) }, stdio: 'pipe',
  });
  try {
    let healthy = false;
    for (let attempt = 0; attempt < 40; attempt++) {
      try {
        const response = await fetch(`${base}/api/health`);
        if (response.ok) { healthy = true; break; }
      } catch { /* Esperar el arranque. */ }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    assert.ok(healthy, 'La API debe conectar con PostgreSQL');
    assert.equal((await fetch(base)).status, 200);
    const email = `test-${randomUUID()}@example.com`;
    const post = (url, data, cookie = '') => fetch(`${base}${url}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', cookie, Origin: base }, body: JSON.stringify(data),
    });
    const registration = await post('/api/auth', { action: 'register', name: 'Estudiante', email, password: 'clave-segura-123' });
    assert.equal(registration.status, 200);
    const cookie = registration.headers.get('set-cookie').split(';')[0];
    const user = (await registration.json()).user;
    assert.equal(user.email, email);
    assert.equal(user.isAdmin, false);
    assert.equal((await post('/api/auth', { action: 'register', name: 'Otro', email, password: 'clave-segura-123' })).status, 409);
    assert.equal((await (await fetch(`${base}/api/auth`, { headers: { cookie } })).json()).user.email, email);
    assert.equal((await fetch(`${base}/api/reports?mine=1`)).status, 401);
    const denied = await post('/api/reports', { type: 'OTRO', location: 'Calle 50', description: 'Basura acumulada en andén' });
    assert.equal(denied.status, 401);
    const badOrigin = await fetch(`${base}/api/reports`, { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'https://evil.example', cookie }, body: JSON.stringify({ type: 'OTRO', location: 'Calle 50', description: 'Basura acumulada en andén' }) });
    assert.equal(badOrigin.status, 403);
    const created = await post('/api/reports', { type: 'ESCOMBROS', location: 'Calle 50 con Carrera 7', description: 'Escombros bloquean el andén', coordinates: { latitude: 4.65, longitude: -74.08 } }, cookie);
    assert.equal(created.status, 201);
    const report = (await created.json()).report;
    assert.match(report.reference, /^ECO-\d{6,}$/);
    assert.equal(report.status, 'RECIBIDO');
    assert.equal(report.coordinates.latitude, 4.65);
    const list = (await (await fetch(`${base}/api/reports`)).json()).reports;
    assert.ok(list.some((item) => item.reference === report.reference));
    const mine = (await (await fetch(`${base}/api/reports?mine=1`, { headers: { cookie } })).json()).reports;
    assert.deepEqual(mine.map((item) => item.reference), [report.reference]);
    const secondEmail = `test-${randomUUID()}@example.com`;
    const second = await post('/api/auth', { action: 'register', name: 'Otra persona', email: secondEmail, password: 'otra-clave-segura' });
    const secondCookie = second.headers.get('set-cookie').split(';')[0];
    const secondMine = (await (await fetch(`${base}/api/reports?mine=1`, { headers: { cookie: secondCookie } })).json()).reports;
    assert.deepEqual(secondMine, []);
    assert.equal((await post('/api/report-status', { id: report.id, status: 'EN_GESTION' })).status, 401);
    assert.equal((await post('/api/report-status', { id: report.id, status: 'EN_GESTION' }, cookie)).status, 403);
    assert.equal((await post('/api/report-status', { id: report.id, status: 'EN_GESTION' }, secondCookie)).status, 403);
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    try {
      await pool.query('UPDATE users SET is_admin = TRUE WHERE id = $1', [user.id]);
    } finally { await pool.end(); }
    assert.equal((await (await fetch(`${base}/api/auth`, { headers: { cookie } })).json()).user.isAdmin, true);
    assert.equal((await post('/api/report-status', { id: report.id, status: 'INVALIDO' }, cookie)).status, 400);
    assert.equal((await post('/api/report-status', { id: '999999999999999999', status: 'EN_GESTION' }, cookie)).status, 404);
    const changed = await post('/api/report-status', { id: report.id, status: 'EN_GESTION' }, cookie);
    assert.equal(changed.status, 200);
    assert.equal((await post('/api/report-status', { id: report.id, status: 'EN_GESTION' }, cookie)).status, 409);
    assert.equal((await post('/api/report-status', { id: report.id, status: 'RESUELTO' }, cookie)).status, 200);
    assert.equal((await post('/api/report-status', { id: report.id, status: 'RECIBIDO' }, cookie)).status, 200);
    const updated = (await (await fetch(`${base}/api/reports?mine=1`, { headers: { cookie } })).json()).reports[0];
    assert.equal(updated.status, 'RECIBIDO');
    assert.deepEqual(updated.history.map((event) => event.status), ['RECIBIDO', 'EN_GESTION', 'RESUELTO', 'RECIBIDO']);
    assert.equal(updated.history[1].actor, user.name);
    assert.equal((await post('/api/report-status', { id: report.id, status: 'RESUELTO' }, secondCookie)).status, 403);
    assert.equal((await post('/api/auth', { action: 'logout' }, cookie)).status, 200);
    assert.equal((await (await fetch(`${base}/api/auth`, { headers: { cookie } })).json()).user, null);
    const login = await post('/api/auth', { action: 'login', email, password: 'clave-segura-123' });
    assert.equal(login.status, 200);
    assert.equal((await login.json()).user.isAdmin, true);
  } finally {
    server.kill();
  }
});
