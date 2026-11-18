const { ready } = require('../lib/db.cjs');
const { hashPassword, verifyPassword, createSession, clearSession, currentUser, publicUser } = require('../lib/auth.cjs');
const { HttpError, send, method, sameOrigin, body, handle } = require('../lib/http.cjs');

module.exports = handle(async (req, res) => {
  method(req, ['GET', 'POST']);
  if (req.method === 'GET') return send(res, 200, { user: await currentUser(req) });
  sameOrigin(req);
  const input = await body(req);
  if (input.action === 'logout') {
    await clearSession(req, res);
    return send(res, 200, { user: null });
  }
  if (!['register', 'login'].includes(input.action)) throw new HttpError(400, 'Acción no válida');
  const email = String(input.email || '').trim().toLowerCase();
  const password = String(input.password || '');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) throw new HttpError(400, 'Correo inválido');
  if (password.length < 8 || password.length > 128) throw new HttpError(400, 'La contraseña debe tener entre 8 y 128 caracteres');
  const db = await ready();
  let user;
  if (input.action === 'register') {
    const name = String(input.name || '').trim();
    if (name.length < 2 || name.length > 80) throw new HttpError(400, 'El nombre debe tener entre 2 y 80 caracteres');
    try {
      const result = await db.query('INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email, is_admin', [name, email, await hashPassword(password)]);
      user = publicUser(result.rows[0]);
    } catch (error) {
      if (error.code === '23505') throw new HttpError(409, 'Este correo ya está registrado');
      throw error;
    }
  } else {
    const result = await db.query('SELECT id, name, email, password_hash, is_admin FROM users WHERE email = $1', [email]);
    const found = result.rows[0];
    if (!found || !(await verifyPassword(password, found.password_hash))) throw new HttpError(401, 'Correo o contraseña incorrectos');
    user = publicUser(found);
  }
  await createSession(req, res, user.id);
  send(res, 200, { user });
});
