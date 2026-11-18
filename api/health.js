const { ready } = require('../lib/db.cjs');
const { send, handle } = require('../lib/http.cjs');

module.exports = handle(async (_req, res) => {
  await (await ready()).query('SELECT 1');
  send(res, 200, { status: 'ok' });
});
