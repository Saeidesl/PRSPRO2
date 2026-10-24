'use strict';

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(process.cwd());
const prefix = '/PRSPRO2/';
const port = Number(process.env.PMS_AUDIT_PORT || 4173);
const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

http.createServer((req, res) => {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url, 'http://127.0.0.1').pathname);
  } catch (_) {
    res.writeHead(400); res.end('Bad request'); return;
  }
  if (pathname === '/PRSPRO2') {
    res.writeHead(302, { Location: prefix }); res.end(); return;
  }
  if (!pathname.startsWith(prefix)) {
    res.writeHead(404); res.end('Not found'); return;
  }
  const relative = pathname.slice(prefix.length) || 'index.html';
  const filename = path.resolve(root, relative);
  if (filename !== root && !filename.startsWith(root + path.sep)) {
    res.writeHead(403); res.end('Forbidden'); return;
  }
  fs.stat(filename, (statError, stat) => {
    if (statError || !stat.isFile()) {
      res.writeHead(404, { 'Cache-Control': 'no-store' }); res.end('Not found'); return;
    }
    res.writeHead(200, {
      'Content-Type': mime[path.extname(filename).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff'
    });
    fs.createReadStream(filename).pipe(res);
  });
}).listen(port, '127.0.0.1', () => {
  process.stdout.write('PMS audit static server listening on 127.0.0.1:' + port + '\n');
});
