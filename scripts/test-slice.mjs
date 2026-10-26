// Static regression checks for the game (no browser needed).
import fs from 'node:fs';
import { buildLevel, LEVEL_COUNT, LEVEL_META, G, ROWS } from '../slice/js/level.js';
import { calcStars, isUnlocked, starsFor, record } from '../slice/js/progress.js';

let pass = 0, fail = 0;
const ok = (name, cond) => { cond ? pass++ : fail++; console.log((cond ? 'PASS  ' : 'FAIL  ') + name); };

const player = fs.readFileSync('slice/js/player.js', 'utf8');
const scenes = fs.readFileSync('slice/js/scenes.js', 'utf8');
ok('Player initialises dropUntil (one-way platforms compare against it; undefined made them non-solid)', /this\.dropUntil\s*=\s*0/.test(player));
ok('platform collider guards a missing dropUntil', /pl\.dropUntil \|\| 0/.test(scenes));
ok('restart keeps realm + level (scene.restart without data resets to level 1)', !/this\.scene\.restart\(\)/.test(scenes));

ok('5 levels defined', LEVEL_COUNT === 5 && LEVEL_META.length === 5);
for (let id = 1; id <= LEVEL_COUNT; id++) {
  const lv = buildLevel(id), starts = lv.ents.filter((e) => e.t === 'start').length, doors = lv.ents.filter((e) => e.t === 'door').length;
  ok(`level ${id} (${lv.meta.name}): one start, one door, boss only on the last level`, starts === 1 && doors === 1 && lv.doorCol > 0 && lv.hasBoss === (id === LEVEL_COUNT));
  // platforms over a PIT form a chain you must jump along: max jump ~200px (3 tiles up), run reach ~300px
  const overPit = (p) => !lv.grid[G * lv.cols + p.c] && !lv.grid[G * lv.cols + p.c + p.w - 1];
  const plats = lv.oneways.filter(overPit).sort((a, b) => a.c - b.c);
  let reachable = true, worst = '';
  for (let i = 1; i < plats.length; i++) {
    const a = plats[i - 1], b = plats[i], gap = b.c - (a.c + a.w), rise = a.r - b.r;
    if (gap > 6) continue;
    if (gap > 3 || rise > 3) { reachable = false; worst = `plat@${a.c}->plat@${b.c} gap=${gap} rise=${rise}`; }
  }
  ok(`level ${id}: pit platform chains are jumpable ${worst}`, reachable);
  // ground must exist right after every pit section, and at the very start
  ok(`level ${id}: ground under the start and under the door`, lv.grid[G * lv.cols + lv.ents.find((e) => e.t === 'start').c] === 1 && lv.grid[G * lv.cols + lv.doorCol] === 1);
}

// ---- no level replays another: every section (except the plain start/exit/boss) is used by exactly one level
const SHARED = new Set(['start', 'exit', 'boss']), use = {};
LEVEL_META.forEach((m) => m.secs.forEach((k) => { if (!SHARED.has(k)) (use[k] = use[k] || new Set()).add(m.id); }));
const reused = Object.entries(use).filter(([, v]) => v.size > 1).map(([k]) => k);
ok('no section is reused by two levels' + (reused.length ? ' (reused: ' + reused.join(', ') + ')' : ''), reused.length === 0);
ok('every level has at least 2 unique sections of its own', LEVEL_META.every((m) => m.secs.filter((k) => !SHARED.has(k)).length >= 2));
ok('every level has its own atmosphere or is the plain first level', LEVEL_META.filter((m) => m.mood && (m.mood.tint != null || m.mood.rain)).length >= 4);

// ---- reachability: can you get from the start to the Devil's Door? (jump+double jump ~4 tiles across / 4 up, wall-jump near tall walls)
function reachable(lv) {
  const surf = [];
  for (let c = 0; c < lv.cols; c++) for (let r = 0; r < ROWS; r++) if (lv.grid[r * lv.cols + c] && (r === 0 || !lv.grid[(r - 1) * lv.cols + c])) surf.push({ c, r });
  for (const p of lv.oneways) for (let k = 0; k < p.w; k++) surf.push({ c: p.c + k, r: p.r });
  const wall = new Set(); // columns with >= 6 solid cells stacked above the ground line = wall-jump columns
  for (let c = 0; c < lv.cols; c++) { let n = 0; for (let r = G - 1; r >= 0 && lv.grid[r * lv.cols + c]; r--) n++; let m = 0; for (let r = 9; r >= 0 && lv.grid[r * lv.cols + c]; r--) m++; if (n >= 6 || m >= 6) wall.add(c); }
  const nearWall = (c) => wall.has(c) || wall.has(c - 1) || wall.has(c + 1);
  const key = (s) => s.c + ',' + s.r, start = lv.ents.find((e) => e.t === 'start'), goal = { c: lv.doorCol, r: G };
  const seen = new Set([key({ c: start.c, r: G })]), q = [{ c: start.c, r: G }];
  while (q.length) {
    const a = q.shift(); if (a.c === goal.c && a.r === goal.r) return true;
    for (const b of surf) {
      const dx = Math.abs(b.c - a.c); if (dx > 5 || seen.has(key(b))) continue;
      const rise = a.r - b.r; // >0 = target is higher
      const jump = (dx <= 5 && rise <= 3) || (dx <= 3 && rise <= 4);   // 4 empty tiles at +3 rows, or 2 empty tiles at +4 rows
      if (jump || ((nearWall(a.c) || nearWall(b.c)) && rise <= 12)) { seen.add(key(b)); q.push(b); }
    }
  }
  return false;
}
for (let id = 1; id <= LEVEL_COUNT; id++) ok(`level ${id}: the Devil's Door is reachable from the start (<=4 empty tiles at +3 rows, wall-jump near tall walls)`, reachable(buildLevel(id)));

// progress / stars
ok('stars: perfect = 3, one death = 2, many deaths = 1', calcStars({ deaths: 0, orbs: 20, total: 24 }) === 3 && calcStars({ deaths: 1, orbs: 0, total: 24 }) === 2 && calcStars({ deaths: 5, orbs: 24, total: 24 }) === 1);
ok('level 1 is always unlocked, level 2 needs level 1 done', isUnlocked('moon', 1) && !isUnlocked('moon', 2) || starsFor('moon', 1) > 0);
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
