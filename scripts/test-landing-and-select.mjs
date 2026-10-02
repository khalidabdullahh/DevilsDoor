// Batch 4 checks: select-screen layout helpers, lazy realm backgrounds, landing-page integrity.
// Run: npm run test:landing
import { characterCardLayout, loadWindow } from '../src/js/ui/selectLayout.js';

let pass = 0, fail = 0;
const ok = (name, cond, extra = '') => { (cond ? pass++ : fail++); console.log(`${cond ? 'PASS' : 'FAIL'}  ${name} ${extra}`); };

// ---- 1. Hero coverflow layout ----
{
  const c = characterCardLayout(0), l = characterCardLayout(-1), r = characterCardLayout(1), far = characterCardLayout(3);
  ok('centered hero: full opacity, biggest, on top', c.opacity === 1 && c.zIndex === 10 && c.transform.includes('scale(1.22)'));
  ok('neighbours are mirrored (left tilts +18deg, right -18deg)', l.transform.includes('translateX(-160px)') && l.transform.includes('rotateY(18deg)') && r.transform.includes('translateX(160px)') && r.transform.includes('rotateY(-18deg)'));
  ok('neighbours dimmer than center, far cards dimmest', l.opacity < c.opacity && far.opacity < l.opacity);
  ok('z-order falls with distance', c.zIndex > l.zIndex && l.zIndex > far.zIndex);
}

// ---- 2. Lazy image window ----
{
  ok('first realm loads 0..2', JSON.stringify(loadWindow(0, 10)) === '[0,1,2]');
  ok('middle realm loads 5 images (i-2..i+2)', JSON.stringify(loadWindow(5, 10)) === '[3,4,5,6,7]');
  ok('last realm loads 7..9', JSON.stringify(loadWindow(9, 10)) === '[7,8,9]');
  ok('never more than 5 of 10 (was: all 10)', Array.from({ length: 10 }, (_, i) => loadWindow(i, 10).length).every(n => n <= 5));
}

// ---- 3. Renderer loads realm backgrounds on demand ----
{
  const loads = [];
  globalThis.window = { devicePixelRatio: 1, innerWidth: 1280, innerHeight: 720, addEventListener() {} };
  globalThis.Image = class { set src(v) { loads.push(v); queueMicrotask(() => this.onload && this.onload()); } };
  // Recursive mock: any property is a function, any call returns another mock (canvas 2D context etc.)
  const mock = () => new Proxy(function () {}, { get: (t, k) => (k === 'then' ? undefined : mock()), set: () => true, apply: () => mock() });
  globalThis.document = { createElement: () => mock() };
  const { NinjaArashiRenderer } = await import('../src/js/render/NinjaArashiRenderer.js');
  NinjaArashiRenderer.prototype._createMipLevels = function (img) { return { '4k': img }; }; // skip real canvases in Node

  const canvas = new Proxy({}, { get: (t, k) => (k === 'getContext' ? () => mock() : k === 'getBoundingClientRect' ? () => ({ width: 1280, height: 720 }) : undefined), set: () => true });
  const r = new NinjaArashiRenderer(canvas);
  await Promise.resolve();
  ok('startup loads only the default realm (was all 10)', loads.length === 1 && loads[0].includes('scene_01_sunset_torii'), `(${loads.length} image)`);

  await r.loadBackground('blood_moon');
  ok('picking a realm loads exactly that realm', loads.length === 2 && loads[1].includes('scene_10_blood_moon'));
  await r.loadBackground('blood_moon');
  ok('asking again does not reload it', loads.length === 2);

  await r.loadBackground('crimson_temple');
  ok('older realm is evicted, default stays (memory stays flat)', !r.bgImages.blood_moon && !!r.bgImages.crimson_temple && !!r.bgImages.sunset_torii, `(decoded: ${Object.keys(r.bgImages).join(', ')})`);

  const p1 = r.loadBackground('shadow_peak'), p2 = r.loadBackground('shadow_peak');
  ok('concurrent requests share one load', p1 === p2);
  await p1;
  ok('unknown realm id is ignored safely', (await r.loadBackground('nope')) === undefined);
}

// ---- 4. Landing page integrity (static checks on the HTML + assets) ----
{
  const { readFileSync, existsSync, statSync } = await import('node:fs');
  const { Script } = await import('node:vm');
  const root = new URL('../', import.meta.url);
  const read = (p) => readFileSync(new URL(p, root), 'utf8');
  const size = (p) => statSync(new URL(p, root)).size;
  const html = read('index.html');

  ok('website/index.html is an exact copy of index.html', html === read('website/index.html'));
  ok('exactly one <h1> (there was none)', (html.match(/<h1[\s>]/g) || []).length === 1);
  ok('has <main id="main">, skip link and an aria-hidden 3D canvas', /<main id="main">/.test(html) && /class="skip-link"/.test(html) && /<canvas id="scene3d" aria-hidden="true">/.test(html));

  // every local file the page references must exist
  const refs = [...html.matchAll(/(?:src|href|srcset)="(\/[^"#?]+\.[a-z0-9]+)"/gi)].map(m => m[1]);
  const missing = [...new Set(refs)].filter(r => !existsSync(new URL('.' + r, root)));
  ok(`all ${new Set(refs).size} local assets referenced by index.html exist`, missing.length === 0, missing.join(', '));

  // weight: the page used to load ~11MB of PNG/JPG
  // only <img> / <source> are fetched when the page renders (favicon / touch-icon <link>s are not)
  const rendered = [...html.matchAll(/<(?:img|source)\b[^>]*?\b(?:src|srcset)="(\/[^"]+)"/g)].map(m => m[1]);
  const imgs = [...new Set(rendered.filter(r => /\.(webp|png|jpe?g)$/i.test(r)))];
  // PNG/JPG next to a WebP <source> are fallbacks for browsers without WebP: never fetched otherwise
  const fallbacks = ['/src/assets/branding/master_cover.jpg', '/src/assets/branding/logo.png'];
  const loaded = imgs.filter(r => !fallbacks.includes(r));
  const kb = Math.round(loaded.reduce((a, r) => a + size('.' + r), 0) / 1024);
  ok('images the page loads total < 1.3MB (was ~11MB)', kb < 1300, `(${kb} KB)`);
  ok('no multi-MB sketch / background originals referenced', !/characters\/sketch\/|backgrounds\/scene_/.test(html));
  ok('10 realm tiles, each with its own WebP', (html.match(/class="realm-tile"/g) || []).length === 10 && Array.from({ length: 10 }, (_, i) => `/src/assets/web/realm-${String(i + 1).padStart(2, '0')}.webp`).every(r => html.includes(r)));

  // copy must match the game as it is now (all heroes / realms unlocked, 10 realms, no 3-min cycle)
  const stale = ['500 PTS', '700 PTS', '1000 PTS', '3D-rendered', 'Every 180 seconds', 'volcanic', 'supersonic', 'PERSISTENT ECONOMY'].filter(t => html.includes(t));
  ok('no stale claims (prices, 3-minute cycles, 3D-rendered, ...)', stale.length === 0, stale.join(', '));

  // robustness: content must never depend on JS to be visible
  ok('reveal classes are added by JS, not hard-coded (no-JS visitors see everything)', !/class="[^"]*\breveal\b/.test(html));
  const css = read('website/css/landing3d.css'), js3d = read('website/js/scene3d.js'), jsL = read('website/js/landing.js');
  ok('reveal hiding is scoped to html.js', /\.js \.reveal\s*\{[^}]*opacity:\s*0/.test(css) && !/(^|\n)\.reveal\s*\{[^}]*opacity:\s*0/.test(css));
  ok('3D / reveal respect prefers-reduced-motion', /prefers-reduced-motion/.test(css) && /prefers-reduced-motion/.test(js3d) && /prefers-reduced-motion/.test(jsL));
  ok('no-WebGL / data-saver fallback exists', /no-webgl/.test(js3d) && /saveData/.test(jsL) && /html\.no-webgl #scene3d/.test(css));
  ok('Three.js is vendored (no CDN) with its MIT license', existsSync(new URL('website/js/vendor/three.min.js', root)) && existsSync(new URL('website/js/vendor/three.LICENSE.txt', root)) && !/cdnjs|unpkg|jsdelivr/.test(html + jsL));
  ok('Three.js is lazy-loaded (not a <script> in the HTML)', !/three\.min\.js/.test(html) && /three\.min\.js/.test(jsL));
  let parsed = true; try { new Script(js3d); new Script(jsL); } catch (e) { parsed = false; }
  ok('landing.js and scene3d.js parse', parsed);
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
