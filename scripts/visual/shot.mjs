// Real-browser screenshots of the landing page (headless Chromium + software WebGL).
//   node scripts/visual/shot.mjs <tag> <width> <height> <mobile 0|1> <scroll0..1> [<scroll> ...]
//   e.g. node scripts/visual/shot.mjs desk 1366 768 0 0 0.3 0.9      -> /tmp/shots/desk_00.png ...
//   e.g. node scripts/visual/shot.mjs phone 390 844 1 0 0.3
// One-time setup (not a project dependency, it is ~60MB):  cd /tmp && mkdir br && cd br && npm i @sparticuz/chromium puppeteer-core
// then run with:  NODE_PATH=/tmp/br/node_modules node scripts/visual/shot.mjs ...   (or copy this file next to node_modules)
// NOTE: software WebGL runs at ~1-3 fps, so the intro clock is skipped (window.__cinema.skipIntro, enabled by ?debug)
//       and screenshots wait 3s after each scroll. Use it to judge composition, NOT frame rate.
import { createRequire } from 'node:module'; import fs from 'node:fs';
const require = createRequire(process.env.NODE_PATH ? process.env.NODE_PATH + '/x.js' : import.meta.url);
const chromium = (await import(require.resolve('@sparticuz/chromium'))).default;
const puppeteer = (await import(require.resolve('puppeteer-core'))).default;
const { start } = await import('./server.mjs');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const [, , tag = 'shot', w = '1366', h = '768', mobile = '0', ...pos] = process.argv;
const server = await start(0), port = server.address().port;
const browser = await puppeteer.launch({ executablePath: await chromium.executablePath(), headless: 'shell', args: [...chromium.args, '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--no-sandbox'] });
const page = await browser.newPage();
const problems = [];
page.on('pageerror', (e) => problems.push('PAGEERROR ' + e.message));
page.on('console', (m) => { if (m.type() === 'error' && !/403/.test(m.text())) problems.push('CONSOLE ' + m.text().slice(0, 300)); });
await page.setViewport({ width: +w, height: +h, deviceScaleFactor: 1, isMobile: mobile === '1', hasTouch: mobile === '1' });
await page.goto(`http://localhost:${port}/?debug`, { waitUntil: 'load', timeout: 90000 });
await sleep(3500); await page.evaluate(() => window.__cinema && window.__cinema.skipIntro()); await sleep(2500);
fs.mkdirSync('/tmp/shots', { recursive: true });
const total = (await page.evaluate(() => document.documentElement.scrollHeight)) - +h;
let i = 0;
for (const p of pos.length ? pos : ['0']) {
  await page.evaluate((y) => window.scrollTo(0, y), Math.round(total * parseFloat(p))); await sleep(3200);
  const f = `/tmp/shots/${tag}_${String(i++).padStart(2, '0')}.png`; await page.screenshot({ path: f }); console.log(f);
}
console.log('problems:', problems.length ? problems : 'none');
await browser.close(); server.close();
