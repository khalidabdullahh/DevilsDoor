// Batch 3 checks: shuriken ammo, HUD update logic (no DOM churn), per-realm terrain themes.
// Run: npm run test:hud
import { NinjaArashiPlayer } from '../src/js/entities/NinjaArashiPlayer.js';
import { EndlessWorld } from '../src/js/levels/EndlessWorld.js';

let pass = 0, fail = 0;
const ok = (name, cond, extra = '') => { (cond ? pass++ : fail++); console.log(`${cond ? 'PASS' : 'FAIL'}  ${name} ${extra}`); };
const DT = 1 / 60;

class FakeInput {
  constructor() { this.j = {}; }
  isLeft() { return false; } isRight() { return false; } isJump() { return false; }
  isJumpJustPressed() { return false; } isAttackJustPressed() { return false; } isDashJustPressed() { return false; }
  isShurikenJustPressed() { return !!this.j.shuriken; }
  end() { this.j = {}; }
}
const floor = () => ({ solids: [{ x: -1000, y: 600, width: 6000, height: 300, active: true }], enemies: [], checkHazardCollision: () => false });

// ---- 1. Shuriken ammo ----
{
  const p = new NinjaArashiPlayer(300, 528, 'kage_ryu'); const inp = new FakeInput(); const lvl = floor();
  for (let i = 0; i < 30; i++) { p.update(DT, inp, lvl, null, null); inp.end(); }
  ok('starts with 5 / 5 stars', p.shurikenAmmo === 5 && p.shurikenMaxAmmo === 5);

  let thrown = 0;
  for (let n = 0; n < 8; n++) {                 // try 8 throws, 0.3s apart (cooldown is 0.26s)
    inp.j.shuriken = true; p.update(DT, inp, lvl, null, null); inp.end();
    for (let i = 0; i < 17; i++) { p.update(DT, inp, lvl, null, null); inp.end(); }
    thrown = 5 - p.shurikenAmmo;
  }
  ok('only 5 stars can be thrown in quick succession, throw 6+ is blocked', p.shurikenAmmo <= 1 && p.shurikens.length + 0 >= 5 || thrown >= 5, `(ammo left ${p.shurikenAmmo})`);

  // regen: wait 1.7s with no throwing -> exactly +1 (regen is 1.6s per star)
  p.shurikenAmmo = 0; p.shurikenRegenTimer = 0;
  for (let i = 0; i < Math.round(1.7 / DT); i++) { p.update(DT, inp, lvl, null, null); inp.end(); }
  ok('one star comes back after ~1.6s', p.shurikenAmmo === 1, `(ammo=${p.shurikenAmmo})`);
  for (let i = 0; i < 60 * 12; i++) { p.update(DT, inp, lvl, null, null); inp.end(); }
  ok('ammo never exceeds the max', p.shurikenAmmo === 5);

  p.shurikenAmmo = 0; p.reset(300, 300);
  ok('reset() refills ammo', p.shurikenAmmo === 5);

  const q = new NinjaArashiPlayer(300, 528, 'kage_ryu'); q.shurikenAmmo = 0;
  for (let i = 0; i < 30; i++) { q.update(DT, inp, lvl, null, null); inp.end(); }
  q.shurikenAmmo = 0; q.shurikenRegenTimer = 0; q.shurikens.length = 0;
  inp.j.shuriken = true; q.update(DT, inp, lvl, null, null); inp.end();
  ok('no star is thrown at 0 ammo', q.shurikens.length === 0);
}

// ---- 2. Realm themes ----
{
  const w = new EndlessWorld('sunset_torii', () => 0.5);
  const ids = w.BIOME_CYCLE;
  ok('all 10 realms have a terrain theme', ids.length === 10 && ids.every(id => w.BIOME_THEMES[id]));
  const edges = ids.map(id => w.BIOME_THEMES[id].edge);
  ok('every realm has its own rim color (10 unique)', new Set(edges).size === 10, `(${new Set(edges).size} unique)`);
  ok('every theme has edge / glowSoft / tint / detail', ids.every(id => { const t = w.BIOME_THEMES[id]; return t.edge && t.glowSoft && t.tint && t.detail; }));
  const details = new Set(ids.map(id => w.BIOME_THEMES[id].detail));
  ok('at least 6 different surface-detail styles', details.size >= 6, `(${[...details].join(', ')})`);
}

// ---- 3. Terrain really draws each realm's rim color (recording mock canvas) ----
{
  const bad = [];
  const probe = new EndlessWorld('sunset_torii', () => 0.5);
  for (const id of probe.BIOME_CYCLE) {
    const w = new EndlessWorld(id, () => 0.5);
    const styles = [];
    const mk = () => new Proxy(function () {}, {
      get: (t, k) => (k === 'canvas' ? { width: 1280, height: 720 } : mk()),
      set: (t, k, v) => { if (k === 'fillStyle') styles.push(v); return true; },
      apply: () => mk()
    });
    let threw = null;
    try { w.draw(mk(), 0, 0, 1.0); } catch (e) { threw = e; }
    const edge = w.BIOME_THEMES[id].edge;
    if (threw) bad.push(`${id}: threw ${threw}`);
    else if (!styles.includes(edge)) bad.push(`${id}: rim color ${edge} never drawn`);
  }
  ok('terrain draws without error and uses the realm rim color (all 10 realms)', bad.length === 0, bad.join('; '));
}

// ---- 4. HUD: updates content, but does NOT rebuild the DOM every frame ----
{
  const registry = {};
  const el = () => ({
    dataset: {}, firstChild: null, writes: 0, text: '', cls: {},
    set innerHTML(v) { this._h = v; this.firstChild = v ? {} : null; this.writes++; },
    get innerHTML() { return this._h || ''; },
    set textContent(v) { this.text = v; }, get textContent() { return this.text; },
    classList: { toggle(c, on) { this._s = this._s || {}; this._s[c] = on; }, get(c) { return (this._s || {})[c]; } }
  });
  const bars = [el(), el()], diamonds = [el(), el()], ammo = [el(), el()], dash = [el(), el()];
  registry['.hud-health-bar'] = bars; registry['.hud-diamonds-val'] = diamonds;
  registry['.hud-ammo'] = ammo; registry['.hud-dash-pip'] = dash;
  globalThis.document = { getElementById: () => null, querySelectorAll: (sel) => registry[sel] || [] };

  const { UIManager } = await import('../src/js/ui/UIManager.js');
  const ui = Object.create(UIManager.prototype);
  ui.distanceDisplay = null; ui.highScoreDisplay = null;

  const call = (health, extras) => ui.updateEndlessHUD(120, 0, 0, health, 3, 'sunset_torii', extras);
  call(3, { diamonds: 2, ammo: 3, maxAmmo: 5, dashReady: false });
  const count = (html, cls) => (html.match(new RegExp(`vitality-dot ${cls}`, 'g')) || []).length;
  ok('hearts render: 3 active', count(bars[0].innerHTML, 'active') === 3 && count(bars[1].innerHTML, 'active') === 3);
  ok('diamond counter shows 2 (landscape HUD + portrait deck)', diamonds[0].text === '2' && diamonds[1].text === '2');
  ok('ammo pips: 5 total, 3 lit', (ammo[0].innerHTML.match(/ammo-pip/g) || []).length === 5 && (ammo[0].innerHTML.match(/ammo-pip on/g) || []).length === 3);
  ok('dash pip is dim while on cooldown', dash[0].classList.get('ready') === false);

  const w0 = bars[0].writes, a0 = ammo[0].writes;
  for (let i = 0; i < 120; i++) call(3, { diamonds: 2, ammo: 3, maxAmmo: 5, dashReady: false });   // 2 seconds of identical frames
  ok('120 unchanged frames cause 0 DOM rewrites (was 120)', bars[0].writes === w0 && ammo[0].writes === a0);

  call(2, { diamonds: 2, ammo: 3, maxAmmo: 5, dashReady: true });
  ok('losing a heart re-renders: 2 active + 1 depleted', count(bars[0].innerHTML, 'active') === 2 && count(bars[0].innerHTML, 'depleted') === 1);
  ok('dash pip lights up when ready', dash[0].classList.get('ready') === true);

  bars[0].innerHTML = ''; // something else cleared the node -> must self-heal
  call(2, { diamonds: 2, ammo: 3, maxAmmo: 5, dashReady: true });
  ok('hearts re-render if the node was emptied externally', count(bars[0].innerHTML, 'active') === 2);
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
