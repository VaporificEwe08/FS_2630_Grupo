const crypto = require('node:crypto');
const { promisify } = require('node:util');
const { ready } = require('./db.cjs');
const { HttpError } = require('./http.cjs');

const scrypt = promisify(crypto.scrypt);
const SESSION_AGE = 7 * 24 * 60 * 60;

async function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const key = await scrypt(password, salt, 64);
  return `${salt}:${key.toString('hex')}`;
}

async function verifyPassword(password, saved) {
  const [salt, hex] = String(saved).split(':');
  if (!salt || !hex || !/^[a-f0-9]{128}$/.test(hex)) return false;
  const key = await scrypt(password, salt, 64);
  return crypto.timingSafeEqual(key, Buffer.from(hex, 'hex'));
}

function tokenHash(token) { return crypto.createHash('sha256').update(token).digest('hex'); }

function cookie(req, token) {
  const secure = req.headers['x-forwarded-proto'] === 'https' || req.socket?.encrypted ||
    !/^(localhost|127\.0\.0\.1)(:\d+)?$/.test(String(req.headers.host || ''));
  return `ecobogota_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${token ? SESSION_AGE : 0}${secure ? '; Secure' : ''}`;
}

function tokenFrom(req) {
  const pair = String(req.headers.cookie || '').split(';').map((part) => part.trim()).find((part) => part.startsWith('ecobogota_session='));
  return pair?.slice('ecobogota_session='.length) || '';
}

async function currentUser(req) {
  const token = tokenFrom(req);
  if (!/^[a-f0-9]{64}$/.test(token)) return null;
  const db = await ready();
  const result = await db.query(`SELECT users.id, users.name, users.email FROM sessions JOIN users ON users.id = sessions.user_id WHERE token_hash = $1 AND expires_at > now()`, [tokenHash(token)]);
  return result.rows[0] || null;
}

async function requireUser(req) {
  const user = await currentUser(req);
  if (!user) throw new HttpError(401, 'Inicia sesión para publicar un reporte');
  return user;
}

async function createSession(req, res, userId) {
  const token = crypto.randomBytes(32).toString('hex');
  await (await ready()).query('INSERT INTO sessions (token_hash, user_id, expires_at) VALUES ($1, $2, now() + interval \'7 days\')', [tokenHash(token), userId]);
  res.setHeader('Set-Cookie', cookie(req, token));
}

async function clearSession(req, res) {
  const token = tokenFrom(req);
  if (/^[a-f0-9]{64}$/.test(token)) await (await ready()).query('DELETE FROM sessions WHERE token_hash = $1', [tokenHash(token)]);
  res.setHeader('Set-Cookie', cookie(req, ''));
}

module.exports = { hashPassword, verifyPassword, createSession, clearSession, currentUser, requireUser };
