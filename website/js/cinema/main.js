/**
 * Scroll director for the landing page.
 *
 * The page is a stack of tall <section class="scene"> elements, each with a sticky 100svh .stage.
 * Scrolling through a scene gives progress 0..1. This file turns scroll into:
 *   - the WebGL world's state (camera, dissolves, door angle, ...)   -> world.js
 *   - text reveals (data-in / data-out), the active hero / realm, HUD, black "veil" between worlds
 * No library: native scroll stays untouched (touch scrolling is never hijacked), the position is only
 * smoothed on the way to the GPU.
 */
import { createWorld } from './world.js';

const root = document.documentElement;
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const coarse = window.matchMedia('(pointer: coarse)').matches;
const saveData = !!(navigator.connection && navigator.connection.saveData);
const low = coarse || (navigator.hardwareConcurrency || 4) <= 4 || window.innerWidth < 700;

function webglOk() {
  try { const c = document.createElement('canvas'); return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl'))); } catch (e) { return false; }
}

// ---------------------------------------------------------------- static fallback
// No WebGL / reduced motion / data saver / Three.js blocked: the same content as a normal page.
function goStatic() {
  root.classList.add('static');
  $('#veil') && ($('#veil').style.display = 'none');
  $$('.void-line').forEach((el) => el.classList.remove('is-out'));
}
if (reduceMotion || saveData || !webglOk() || !window.THREE) { goStatic(); throw new Error('cinema: static mode'); }

// ---------------------------------------------------------------- setup
const canvas = $('#world');
const veilEl = $('#veil');
let world;
try { world = createWorld({ canvas, low }); } catch (e) { console.warn('cinema: WebGL init failed', e); goStatic(); throw e; }

if (window.matchMedia('(pointer: fine)').matches) root.classList.add('pointer-fine');

// film grain tile, generated once (no extra download)
(function grain() {
  const c = document.createElement('canvas'); c.width = c.height = 160;
  const g = c.getContext('2d'), d = g.createImageData(160, 160);
  for (let i = 0; i < d.data.length; i += 4) { const v = Math.random() * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; }
  g.putImageData(d, 0, 0);
  $('.grain').style.setProperty('--grain', 'url(' + c.toDataURL('image/png') + ')');
}());

// ---------------------------------------------------------------- measuring
const sc = {};
$$('[data-scene]').forEach((el) => { sc[el.dataset.scene] = { el, top: 0, h: 0, span: 1, texts: $$('[data-in]', el) }; });
let vh = window.innerHeight;
function measure() {
  const stage = $('.stage');
  vh = stage ? stage.offsetHeight || window.innerHeight : window.innerHeight;
  for (const k in sc) {
    const s = sc[k], r = s.el.getBoundingClientRect();
    s.top = r.top + window.scrollY; s.h = s.el.offsetHeight; s.span = Math.max(1, s.h - vh);
  }
}

let cw = 0, ch = 0;
function resizeCanvas(force) {
  const w = canvas.clientWidth, h = canvas.clientHeight;
  // phone URL bars change the height constantly: ignore small height changes so we do not re-allocate every scroll
  if (!force && w === cw && Math.abs(h - ch) < 120) return;
  cw = w; ch = h;
  world.resize(w, h);
}

// ---------------------------------------------------------------- state
const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
window.addEventListener('pointermove', (e) => {
  if (e.pointerType === 'touch') return;
  mouse.tx = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.ty = -((e.clientY / window.innerHeight) * 2 - 1);
  cursor.tx = e.clientX; cursor.ty = e.clientY;
  cursorEl && cursorEl.classList.add('on');
}, { passive: true });

const cursorEl = $('#cursor');
const cursor = { x: 0, y: 0, tx: 0, ty: 0 };

let y = window.scrollY;             // smoothed scroll
let T = 0;                          // intro clock (seconds)
let started = false, introSkipped = false;

const els = {
  voidLine: $('#void-line'), gateCopy: $('#gate-copy'), cue: $('#scroll-cue'),
  heroItems: $$('.hero-item'), realmItems: $$('.realm-item'), realmsTitle: $('#realms-title'),
  pips: $$('#realm-pips i'), railLinks: $$('#rail a'), progress: $('#progress i'), pipsWrap: $('#realm-pips')
};
let activeHero = -1, activeRealm = -1, activeChapter = -1, voidOut = false;

function setActive(list, idx, current) {
  if (idx === current) return current;
  list.forEach((el, i) => el.classList.toggle('is-active', i === idx));
  return idx;
}

// generic text choreography: element fades in at data-in, out at data-out (both are scene progress 0..1)
function runTexts(s, p) {
  for (const el of s.texts) {
    const a = parseFloat(el.dataset.in), b = parseFloat(el.dataset.out);
    const inn = smooth(a, a + 0.07, p), out = b > 1 ? 0 : smooth(b - 0.07, b, p);
    const o = inn * (1 - out);
    el.style.opacity = o.toFixed(3);
    el.style.transform = (el.classList.contains('line') || el.id === 'h-door' || el.classList.contains('facts')) && !el.classList.contains('facts')
      ? 'translate(-50%, calc(-50% + ' + ((1 - inn) * 26 - out * 20).toFixed(1) + 'px)) scale(' + (1 + (1 - inn) * 0.03 + out * 0.02).toFixed(4) + ')'
      : (el.id === 'h-door' || el.classList.contains('door-eyebrow')) ? 'translateY(' + ((1 - inn) * 24).toFixed(1) + 'px)' : '';
    el.style.pointerEvents = o > 0.4 ? 'auto' : 'none';
  }
}

// ---------------------------------------------------------------- HUD
function updateHud(g, chapter) {
  els.progress.style.setProperty('--p', g.toFixed(4));
  if (chapter !== activeChapter) {
    activeChapter = chapter;
    els.railLinks.forEach((a) => a.classList.toggle('is-on', Number(a.dataset.ch) === chapter));
  }
}
function scrollToScene(name, at) {
  const s = sc[name]; if (!s) return;
  window.scrollTo({ top: Math.round(s.top + (at || 0) * s.span), behavior: 'smooth' });
}
els.railLinks.forEach((a) => a.addEventListener('click', (e) => {
  e.preventDefault(); scrollToScene(a.getAttribute('href').slice(1), parseFloat(a.dataset.at || '0'));
}));
$$('[data-go]').forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); scrollToScene(a.dataset.go, 0.02); }));

// ---------------------------------------------------------------- the frame
let last = performance.now(), slow = 0, frames = 0, ready = false;
const S = { t: 0, dt: 0.016, mouse: { x: 0, y: 0 }, mode: 'journey', quad: 'heroes', reveal: 0, u: 0, heroT: 0, realmT: 0, open: 0, camZ: 36, light: 1, darken: 0, eyes: 0, doorGlow: 0 };

function frame(now) {
  requestAnimationFrame(frame);
  if (document.hidden) { last = now; return; }
  // the intro runs on real time (a slow device must not stretch it); physics-like smoothing uses a clamped dt
  const rawDt = Math.min(1, (now - last) / 1000), dt = Math.min(0.05, rawDt); last = now;

  // smoothed scroll, mouse, cursor
  y += (window.scrollY - y) * (1 - Math.exp(-dt * 8));
  if (Math.abs(window.scrollY - y) < 0.3) y = window.scrollY;
  mouse.x += (mouse.tx - mouse.x) * (1 - Math.exp(-dt * 4)); mouse.y += (mouse.ty - mouse.y) * (1 - Math.exp(-dt * 4));
  if (cursorEl) { cursor.x += (cursor.tx - cursor.x) * (1 - Math.exp(-dt * 10)); cursor.y += (cursor.ty - cursor.y) * (1 - Math.exp(-dt * 10)); cursorEl.style.transform = 'translate3d(' + cursor.x.toFixed(1) + 'px,' + cursor.y.toFixed(1) + 'px,0)'; }

  // intro clock; scrolling early speeds it up, reloading deep in the page skips it
  if (ready) T += rawDt * (window.scrollY > 30 && T < 7 ? 5 : 1);
  const P = (n) => clamp((y - sc[n].top) / sc[n].span, 0, 1);
  const pg = P('gate'), ps = P('shadow'), ph = P('shinobi'), pr = P('realms'), pd = P('door'), pe = P('entry');

  // handoffs between worlds happen in the middle of the window where one stage slides out and the next slides in
  const bShadow = sc.shadow.top, bHero = sc.shinobi.top - vh * 0.5, bRealm = sc.realms.top - vh * 0.5, bDoor = sc.door.top - vh * 0.5;
  const mode = y < bHero ? 'journey' : (y < bDoor ? 'quad' : 'door');
  const quad = y < bRealm ? 'heroes' : 'realms';

  // veil: black in the middle of each handoff (not between gate -> shadow, nor door -> final: those are one continuous camera move)
  const dip = (b) => 1 - smooth(0, 1, Math.abs(y - b) / (vh * 0.42));
  const introVeil = 1 - smooth(2.4, 4.4, T);
  const veil = Math.max(introVeil, dip(bHero), dip(bRealm), dip(bDoor));
  veilEl.style.opacity = veil.toFixed(3);

  // ---- journey
  const yb = bShadow, yc = sc.shadow.top + sc.shadow.span;
  S.u = y < yb ? 0.42 * clamp((y - sc.gate.top) / (yb - sc.gate.top), 0, 1) : 0.42 + 0.58 * clamp((y - yb) / (yc - yb), 0, 1);
  S.reveal = smooth(3.0, 7.5, T);

  // ---- heroes
  S.heroT = clamp((ph - 0.06) / 0.72, 0, 1) * 3;
  const hi = Math.min(3, Math.floor(S.heroT)), hf = S.heroT - hi;
  const heroIdx = hf > 0.82 && hi < 3 ? hi + 1 : hi;
  activeHero = setActive(els.heroItems, mode === 'quad' && quad === 'heroes' ? heroIdx : -1, activeHero);

  // ---- realms
  S.realmT = clamp((pr - 0.1) / 0.86, 0, 1) * 9;
  const ri = Math.min(9, Math.floor(S.realmT)), rf = S.realmT - ri;
  const realmIdx = rf > 0.82 && ri < 9 ? ri + 1 : ri;
  const realmsOn = quad === 'realms' && pr > 0.085;
  activeRealm = setActive(els.realmItems, realmsOn ? realmIdx : -1, activeRealm);
  els.pips.forEach((p, i) => p.classList.toggle('on', realmsOn && i === realmIdx));
  els.pipsWrap.style.opacity = realmsOn && pr < 0.985 ? 1 : 0;
  els.realmsTitle.style.opacity = (quad === 'realms' ? smooth(0.02, 0.05, pr) * (1 - smooth(0.07, 0.1, pr)) : 0).toFixed(3);
  els.realmsTitle.style.transform = 'translateY(calc(-50% + ' + ((1 - smooth(0.02, 0.06, pr)) * 24).toFixed(1) + 'px))';

  // ---- door + final
  S.open = y < sc.entry.top - vh * 0.2 ? smooth(0.3, 0.8, pd) : 1;
  S.camZ = y < sc.entry.top ? lerp(36, 17, smooth(0.0, 0.55, pd)) - 9 * smooth(0.8, 1.0, pd) : 8 - 30 * smooth(0.0, 0.5, pe);
  S.eyes = smooth(0.85, 1.0, pd) * (1 - smooth(0.2, 0.5, pe));
  S.light = 1 - 0.0 * pe; S.darken = 1 - smooth(0.0, 0.25, pd); S.doorGlow = smooth(0.5, 1, pd);

  // ---- texts
  for (const k in sc) runTexts(sc[k], P(k));
  const gateOp = smooth(5.6, 7.4, T) * (1 - smooth(0.1, 0.3, pg));
  els.gateCopy.style.opacity = gateOp.toFixed(3);
  els.gateCopy.style.transform = 'translate3d(0,' + (-(1 - (1 - smooth(0.1, 0.3, pg))) * 40 + (1 - smooth(5.6, 7.4, T)) * 24).toFixed(1) + 'px,0) scale(' + (1 + smooth(0.1, 0.3, pg) * 0.06).toFixed(4) + ')';
  els.gateCopy.style.pointerEvents = gateOp > 0.4 ? 'auto' : 'none';
  els.cue.classList.toggle('on', T > 8.2 && window.scrollY < 40);
  if (!voidOut && T > 2.6) { voidOut = true; els.voidLine.classList.add('is-out'); }

  // ---- HUD
  const g = clamp(y / Math.max(1, document.documentElement.scrollHeight - window.innerHeight), 0, 1);
  const chapter = y < bShadow - vh * 0.5 ? (pg < 0.1 && T < 7.5 ? 0 : 1)
    : y < bHero ? 2 : y < bRealm ? 3 : y < sc.realms.top - vh * 0.5 + sc.realms.span * 0.1 ? 4 : y < bDoor ? 5 : y < sc.entry.top - vh * 0.5 ? 6 : 7;
  updateHud(g, chapter);

  // ---- stream textures near where we are
  if (T > 0.5) {
    world.loadShinobi && !frame.shin && (frame.shin = true, world.loadShinobi());
    if (y > sc.gate.top + sc.gate.h * 0.3 || T > 6) for (let i = 0; i < 4; i++) world.loadHero(i);
    if (y > bHero - vh * 4) { for (let i = Math.max(0, ri - 1); i <= Math.min(9, ri + 2); i++) world.loadRealm(i); world.keepRealms(ri); }
  }

  // ---- render
  S.t = now / 1000; S.dt = dt; S.mouse.x = mouse.x; S.mouse.y = mouse.y; S.mode = mode; S.quad = quad;
  world.render(S);

  if (!ready) { ready = true; root.classList.add('world-ready'); }
  window.__cinema && (window.__cinema.S = S);

  // adaptive resolution: if we are slow for ~1.5s, drop the pixel ratio a step (never below 1)
  frames++; slow = lerp(slow, dt * 1000, 0.05);
  if (frames % 90 === 0 && slow > 26 && world.getDpr() > 1) world.setDpr(Math.max(1, world.getDpr() - 0.25));
}

// ---------------------------------------------------------------- boot
function boot() {
  measure(); resizeCanvas(true);
  if (window.scrollY > window.innerHeight * 0.4) { T = 100; voidOut = true; els.voidLine.classList.add('is-out'); }
  if (new URLSearchParams(location.search).has('debug')) window.__cinema = { sc, S, measure, skipIntro: () => { T = 100; voidOut = true; els.voidLine.classList.add('is-out'); } };
  requestAnimationFrame((t) => { last = t; frame(t); });
}
let rz = 0;
window.addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(() => { measure(); resizeCanvas(false); }); });
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { measure(); });
window.addEventListener('load', () => { measure(); resizeCanvas(true); });
boot();
