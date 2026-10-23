// Static regression checks for the /slice game (no browser needed).
import fs from 'node:fs';
import { buildLevel, COLS, G } from '../slice/js/level.js';

let pass = 0, fail = 0;
const ok = (name, cond) => { cond ? pass++ : fail++; console.log((cond ? 'PASS  ' : 'FAIL  ') + name); };

const player = fs.readFileSync('slice/js/player.js', 'utf8');
const scenes = fs.readFileSync('slice/js/scenes.js', 'utf8');
ok('Player initialises dropUntil (one-way platform collider compares against it; undefined made platforms non-solid)', /this\.dropUntil\s*=\s*0/.test(player));
ok('platform collider guards a missing dropUntil', /pl\.dropUntil \|\| 0/.test(scenes));

// Platforms over a PIT form a chain you must jump along: max jump ~200px (3 tiles up), run reach ~300px.
// (Platforms standing over solid ground are optional shortcuts, so they are not part of the chain.)
const lv = buildLevel();
const overPit = (p) => !lv.grid[G * COLS + p.c] && !lv.grid[G * COLS + p.c + p.w - 1];
const plats = lv.oneways.filter(overPit).sort((a, b) => a.c - b.c);
let reachable = plats.length > 0, worst = '';
for (let i = 1; i < plats.length; i++) {
  const a = plats[i - 1], b = plats[i];
  const gap = b.c - (a.c + a.w);            // empty tiles between them
  if (gap > 6) continue;                    // different pit
  const rise = a.r - b.r;                   // >0 means b is higher
  if (gap > 3 || rise > 3) { reachable = false; worst = `plat@${a.c}->plat@${b.c} gap=${gap} rise=${rise}`; }
}
ok('platform chains over pits are jumpable (gap<=3 tiles, rise<=3 tiles)' + (worst ? ' ' + worst : ''), reachable);
ok('level has one-way platforms and ground tiles', lv.oneways.length > 0 && lv.grid.some(Boolean));
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
