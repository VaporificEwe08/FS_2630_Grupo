const { ready } = require('../lib/db.cjs');
const { requireUser } = require('../lib/auth.cjs');
const { HttpError, send, method, sameOrigin, body, handle } = require('../lib/http.cjs');

const types = new Set(['BASURA_NO_RECOGIDA', 'CONTENEDOR_LLENO', 'ESCOMBROS', 'OTRO']);

function mapReport(row) {
  return {
    id: String(row.id), reference: `ECO-${String(row.id).padStart(6, '0')}`,
    type: row.type, location: row.location, description: row.description,
    coordinates: row.latitude === null ? null : { latitude: row.latitude, longitude: row.longitude },
    status: row.status, createdAt: row.created_at,
    history: [{ status: 'RECIBIDO', at: row.created_at, actor: 'EcoBogotá+' }],
  };
}

module.exports = handle(async (req, res) => {
  method(req, ['GET', 'POST']);
  const db = await ready();
  if (req.method === 'GET') {
    const result = await db.query('SELECT id, type, location, description, latitude, longitude, status, created_at FROM reports ORDER BY created_at DESC LIMIT 100');
    return send(res, 200, { reports: result.rows.map(mapReport) });
  }
  sameOrigin(req);
  const user = await requireUser(req);
  const input = await body(req);
  const type = String(input.type || '');
  const location = String(input.location || '').trim();
  const description = String(input.description || '').trim();
  if (!types.has(type) || location.length < 5 || location.length > 100 || description.length < 10 || description.length > 300) {
    throw new HttpError(400, 'Completa la ubicación y la descripción (10 a 300 caracteres)');
  }
  let latitude = null;
  let longitude = null;
  if (input.coordinates !== null && input.coordinates !== undefined) {
    if (typeof input.coordinates.latitude !== 'number' || typeof input.coordinates.longitude !== 'number') throw new HttpError(400, 'Coordenadas inválidas');
    latitude = Number(input.coordinates.latitude);
    longitude = Number(input.coordinates.longitude);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      throw new HttpError(400, 'Coordenadas inválidas');
    }
  }
  const result = await db.query('INSERT INTO reports (user_id, type, location, description, latitude, longitude) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, type, location, description, latitude, longitude, status, created_at', [user.id, type, location, description, latitude, longitude]);
  send(res, 201, { report: mapReport(result.rows[0]) });
});
