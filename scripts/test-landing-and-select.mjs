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

// ---- 4. Cinematic landing page: static integrity checks (no browser needed) ----
{
  const fs = await import('node:fs');
  const { spawnSync } = await import('node:child_process');
  const { CHARACTER_ROSTER } = await import('../src/js/data/CharacterRoster.js');
  const { SCENE_ROSTER } = await import('../src/js/data/SceneRoster.js');
  const { NinjaArashiPlayer } = await import('../src/js/entities/NinjaArashiPlayer.js');
  const root = new URL('../', import.meta.url);
  const read = (p) => fs.readFileSync(new URL(p, root), 'utf8');
  const exists = (p) => fs.existsSync(new URL('.' + p, root));
  const size = (p) => fs.statSync(new URL('.' + p, root)).size;
  const decode = (t) => t.replace(/&#39;/g, "'").replace(/&amp;/g, '&');
  const html = read('index.html'), css = read('website/css/cinema.css'), main = read('website/js/cinema/main.js'), world = read('website/js/cinema/world.js');

  ok('website/index.html is an exact copy of index.html', html === read('website/index.html'));
  ok('exactly one <h1>', (html.match(/<h1[\s>]/g) || []).length === 1);
  ok('6 scroll scenes and an 8-chapter HUD rail', (html.match(/data-scene="/g) || []).length === 6 && (html.match(/data-ch="/g) || []).length === 8);
  ok('PLAY GAME / ENTER THE GAME all point at /game', (html.match(/href="\/game"/g) || []).length >= 3);
  ok('no external hosts (fonts and Three.js are self-hosted)', !/googleapis|gstatic|cdnjs|unpkg|jsdelivr/.test(html + css + main + world));

  // every local file the page needs exists
  const refs = new Set([...html.matchAll(/(?:src|href|srcset)="(\/[^"#?]+\.[a-z0-9]+)"/gi)].map((m) => m[1]));
  [...css.matchAll(/url\('(\/[^']+)'\)/g)].forEach((m) => refs.add(m[1]));
  [...world.matchAll(/'(\/src\/assets\/web\/[^']+)'/g)].forEach((m) => refs.add(m[1]));
  [...world.matchAll(/`(\/src\/assets\/web\/[^`$]+)/g)].forEach((m) => refs.add(m[1]));
  const missing = [...refs].filter((r) => /\.[a-z0-9]+$/i.test(r) && !exists(r)); // template-literal prefixes have no extension: checked separately below
  ok(`all ${refs.size} local files referenced by the page / CSS / world exist`, missing.length === 0, missing.join(', '));
  ok('every large realm + hero WebP used by the WebGL world exists', Array.from({ length: 10 }, (_, i) => exists(`/src/assets/web/realm-${String(i + 1).padStart(2, '0')}-lg.webp`)).every(Boolean) && [1, 2, 3, 4].every((i) => exists(`/src/assets/web/char-0${i}.webp`)));

  // fonts: exactly two families (brief: 1 display + 1 UI)
  const families = new Set([...css.matchAll(/font-family: '([^']+)'; font-weight/g)].map((m) => m[1]));
  ok('exactly 2 self-hosted font families (Cinzel + Barlow Condensed), 5 woff2 files', families.size === 2 && [...css.matchAll(/@font-face/g)].length === 5, [...families].join(', '));

  // real game data: names, titles, stats and realm names must match the game (single source of truth)
  const heroes = [...html.matchAll(/<li class="hero-item"[^>]*data-hero="([^"]+)"[^>]*data-speed="(\d+)" data-jump="(\d+)" data-hearts="(\d+)"[\s\S]*?<h3 class="hero-name">([^<]+)<\/h3>\s*<p class="hero-title">([^<]+)<\/p>/g)];
  ok('4 heroes on the page', heroes.length === 4);
  CHARACTER_ROSTER.forEach((c, i) => {
    const h = heroes[i]; if (!h) return;
    const p = new NinjaArashiPlayer(0, 0, c.id);
    ok(`hero ${c.name}: name, title and in-game stats (speed ${p.moveSpeed}, jump ${p.jumpForce}, hearts ${p.maxHealth}) match the game`,
      h[1] === c.id && decode(h[5]) === c.name && decode(h[6]) === c.title && +h[2] === p.moveSpeed && +h[3] === p.jumpForce && +h[4] === p.maxHealth,
      `(page: ${h[5]} / ${h[6]} / ${h[2]} ${h[3]} ${h[4]})`);
  });
  const realmNames = [...html.matchAll(/<h3 class="realm-name">([^<]+)<\/h3>/g)].map((m) => decode(m[1]));
  ok('10 realms, same names and order as SceneRoster', JSON.stringify(realmNames) === JSON.stringify(SCENE_ROSTER.map((r) => r.name)), realmNames.length + ' realms');

  // robustness: nothing may depend on JS to be readable
  ok('scroll-driven hiding ([data-in] opacity 0) is scoped to html.js:not(.static)', !/(^|\n)\s*\[data-in\]/.test(css) && /html\.js:not\(\.static\) \[data-in\]\s*\{\s*opacity: 0/.test(css));
  ok('static (no-JS) layout exists in CSS', /html:not\(\.js\)/.test(css) && /html\.static/.test(css));
  ok('cinema falls back to static for reduced-motion, data-saver, no WebGL, no Three.js', /prefers-reduced-motion/.test(main) && /saveData/.test(main) && /webglOk/.test(main) && /window\.THREE/.test(main) && /goStatic/.test(main));
  ok('static images are lazy-loaded', (html.match(/loading="lazy"/g) || []).length >= 14);

  // code health
  const files = fs.readdirSync(new URL('website/js/cinema/', root)).filter((f) => f.endsWith('.js'));
  const bad = files.filter((f) => spawnSync(process.execPath, ['--input-type=module', '--check'], { input: read('website/js/cinema/' + f) }).status !== 0);
  ok(`all ${files.length} cinema modules parse (ES modules)`, bad.length === 0, bad.join(', '));
  ok('Three.js is vendored with its license and loaded by a deferred script', exists('/website/js/vendor/three.min.js') && exists('/website/js/vendor/three.LICENSE.txt') && /three\.min\.js" defer/.test(html));
  ok('first-load budget: HTML + CSS + JS + Three.js < 900 KB raw', Math.round((size('/index.html') + size('/website/css/cinema.css') + size('/website/js/vendor/three.min.js') + files.reduce((a, f) => a + size('/website/js/cinema/' + f), 0)) / 1024) < 900);
  ok('old landing files that nothing uses are gone (landing.js, scene3d.js, landing3d.css)', !exists('/website/js/landing.js') && !exists('/website/js/scene3d.js') && !exists('/website/css/landing3d.css'));
  ok('no /game or /play rewrite in _redirects (they loop on Cloudflare Pages; the file may be absent)', !exists('/_redirects') || !/^\/(game|play)\s/m.test(read('_redirects')));
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
