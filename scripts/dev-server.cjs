const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..', 'app');
const handlers = {
  '/api/auth': require('../api/auth.js'),
  '/api/reports': require('../api/reports.js'),
  '/api/health': require('../api/health.js'),
};
const files = { '/': 'index.html', '/index.html': 'index.html', '/app.js': 'app.js', '/styles.css': 'styles.css' };
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8' };

const server = http.createServer((req, res) => {
  const pathname = new URL(req.url, 'http://localhost').pathname;
  if (handlers[pathname]) return handlers[pathname](req, res);
  const filename = files[pathname];
  if (!filename) { res.writeHead(404); res.end(); return; }
  const content = fs.readFileSync(path.join(root, filename));
  res.writeHead(200, { 'Content-Type': types[path.extname(filename)], 'Cache-Control': 'no-store' });
  res.end(content);
});

server.listen(Number(process.env.PORT || 3000), '127.0.0.1', () => {
  console.log(`EcoBogotá+ en http://localhost:${server.address().port}`);
});
