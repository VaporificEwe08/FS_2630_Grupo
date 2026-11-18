class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

function send(res, status, value, headers = {}) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers });
  res.end(JSON.stringify(value));
}

function method(req, allowed) {
  if (!allowed.includes(req.method)) throw new HttpError(405, 'Método no permitido');
}

function sameOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) return;
  let parsed;
  try { parsed = new URL(origin); } catch { throw new HttpError(403, 'Origen no permitido'); }
  if (parsed.host !== req.headers.host) throw new HttpError(403, 'Origen no permitido');
}

async function body(req) {
  if (!String(req.headers['content-type'] || '').startsWith('application/json')) throw new HttpError(415, 'Se requiere JSON');
  if (req.body && typeof req.body === 'object') return req.body;
  let input = '';
  for await (const chunk of req) {
    input += chunk;
    if (input.length > 4096) throw new HttpError(413, 'Solicitud demasiado grande');
  }
  try { return JSON.parse(input); } catch { throw new HttpError(400, 'JSON inválido'); }
}

function handle(fn) {
  return async (req, res) => {
    try { await fn(req, res); }
    catch (error) {
      if (error.status) send(res, error.status, { error: error.message });
      else {
        console.error(error);
        send(res, 503, { error: 'Servicio temporalmente no disponible' });
      }
    }
  };
}

module.exports = { HttpError, send, method, sameOrigin, body, handle };
