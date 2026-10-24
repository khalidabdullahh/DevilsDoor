// Static regression checks for the game (no browser needed).
import fs from 'node:fs';
import { buildLevel, LEVEL_COUNT, LEVEL_META, G } from '../slice/js/level.js';
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
// progress / stars
ok('stars: perfect = 3, one death = 2, many deaths = 1', calcStars({ deaths: 0, orbs: 20, total: 24 }) === 3 && calcStars({ deaths: 1, orbs: 0, total: 24 }) === 2 && calcStars({ deaths: 5, orbs: 24, total: 24 }) === 1);
ok('level 1 is always unlocked, level 2 needs level 1 done', isUnlocked('moon', 1) && !isUnlocked('moon', 2) || starsFor('moon', 1) > 0);
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
