const { ready } = require('../lib/db.cjs');
const { requireAdmin } = require('../lib/auth.cjs');
const { HttpError, send, method, sameOrigin, body, handle } = require('../lib/http.cjs');

const statuses = new Set(['RECIBIDO', 'EN_GESTION', 'RESUELTO']);

module.exports = handle(async (req, res) => {
  method(req, ['POST']);
  sameOrigin(req);
  const admin = await requireAdmin(req);
  const input = await body(req);
  const id = String(input.id || '');
  if (!/^[1-9]\d{0,17}$/.test(id) || !statuses.has(input.status)) {
    throw new HttpError(400, 'Reporte o estado inválido');
  }
  const db = await ready();
  const changed = await db.query(`
    WITH updated AS (
      UPDATE reports SET status = $2 WHERE id = $1 AND status <> $2 RETURNING id
    ), logged AS (
      INSERT INTO report_status_events (report_id, status, actor_user_id)
      SELECT id, $2, $3 FROM updated RETURNING report_id
    )
    SELECT report_id FROM logged
  `, [id, input.status, admin.id]);
  if (!changed.rowCount) {
    const existing = await db.query('SELECT id FROM reports WHERE id = $1', [id]);
    if (!existing.rowCount) throw new HttpError(404, 'Reporte no encontrado');
    throw new HttpError(409, 'El reporte ya tiene ese estado');
  }
  send(res, 200, { id, status: input.status });
});
