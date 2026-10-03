// Static dev server that behaves like Cloudflare Pages: /game -> game.html, /play -> play.html (clean URLs).
// Run: node scripts/visual/server.mjs [port]      (default 8080)
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.json': 'application/json', '.woff2': 'font/woff2', '.mp3': 'audio/mpeg' };
export function start(port = 8080) {
  const clean = { '/game': '/game.html', '/play': '/play.html' };
  const server = http.createServer((req, res) => {
    let url = decodeURIComponent(req.url.split('?')[0]);
    url = clean[url.replace(/\/$/, '')] || (url === '/' ? '/index.html' : url);
    const f = path.join(ROOT, url);
    if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end('404'); }
    res.writeHead(200, { 'Content-Type': types[path.extname(f)] || 'application/octet-stream' });
    fs.createReadStream(f).pipe(res);
  });
  return new Promise((r) => server.listen(port, () => r(server)));
}
if (process.argv[1] === fileURLToPath(import.meta.url)) start(Number(process.argv[2]) || 8080).then((s) => console.log('http://localhost:' + s.address().port));
