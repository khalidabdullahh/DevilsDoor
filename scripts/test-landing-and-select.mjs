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

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
