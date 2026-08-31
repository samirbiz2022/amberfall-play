// Serves the browser build to anything on the same wifi.
//
// Unity's WebGL loader fetches its data with a content encoding the plain
// static hosts do not set, so the build carries the decompression fallback and
// this only has to get the bytes and the type right.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript',
  '.wasm': 'application/wasm', '.json': 'application/json',
  '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.data': 'application/octet-stream', '.unityweb': 'application/octet-stream',
  '.symbols': 'application/octet-stream',
};

http.createServer((req, res) => {
  let rel = decodeURIComponent(req.url.split('?')[0]);
  if (rel === '/') rel = '/index.html';
  const file = path.join(ROOT, rel);
  if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    res.writeHead(404); res.end('not found'); return;
  }
  res.writeHead(200, {
    'Content-Type': TYPES[path.extname(file)] ?? 'application/octet-stream',
    'Cache-Control': 'no-store',
  });
  fs.createReadStream(file).pipe(res);
}).listen(8080, '0.0.0.0', () => console.log('serving on 8080'));
