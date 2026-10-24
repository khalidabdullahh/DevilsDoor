// Levels are composed from handcrafted sections (each one teaches/tests one idea), so every level stays hand-designed.
//   intro   move + jump + first pit        double  double-jump platforms over a pit
//   chimney wall-jump climb                spikes  spike run + checkpoint
//   combat  ronin duel + archer tower      archers platforms across a pit under archer fire
//   gauntlet ronin pair + archer + checkpoints     exit  Devil's Door     boss  Oni Warlord arena + door
export const TILE = 64, ROWS = 16, G = 12;

export const LEVEL_META = [
  { id: 1, name: 'First Steps', blurb: 'Run, jump and double-jump over the gap.', secs: ['intro', 'double', 'exit'] },
  { id: 2, name: 'Chimney Climb', blurb: 'Wall-jump up the shaft. Mind the spikes.', secs: ['start', 'chimney', 'spikes', 'exit'] },
  { id: 3, name: 'Ronin Road', blurb: 'Parry the ronin. Cross under archer fire.', secs: ['start', 'combat', 'archers', 'gauntlet', 'exit'] },
  { id: 4, name: 'The Gauntlet', blurb: 'Everything you learned, back to back.', secs: ['intro', 'double', 'chimney', 'spikes', 'combat', 'archers', 'gauntlet', 'exit'] },
  { id: 5, name: 'Oni Warlord', blurb: 'Face the demon and open the Devil\'s Door.', secs: ['start', 'spikes', 'combat', 'gauntlet', 'boss'] },
];
export const LEVEL_COUNT = LEVEL_META.length;
const WIDTH = { intro: 34, start: 12, double: 12, chimney: 26, spikes: 12, combat: 20, archers: 14, gauntlet: 15, exit: 12, boss: 27 };

export function buildLevel(id = 1) {
  const meta = LEVEL_META[(id - 1) % LEVEL_COUNT];
  const cols = meta.secs.reduce((s, k) => s + WIDTH[k], 0);
  const grid = new Uint8Array(cols * ROWS);
  const oneways = [], spikes = [], ents = [];
  const set = (c, r) => { if (c >= 0 && c < cols && r >= 0 && r < ROWS) grid[r * cols + c] = 1; };
  const ground = (c1, c2) => { for (let c = c1; c <= c2; c++) for (let r = G; r < ROWS; r++) set(c, r); };
  const block = (c1, c2, r1, r2) => { for (let c = c1; c <= c2; c++) for (let r = r1; r <= r2; r++) set(c, r); };
  const plat = (c, r, w) => oneways.push({ c, r, w });
  const spk = (c1, c2, r = G - 1) => { for (let c = c1; c <= c2; c++) spikes.push({ c, r }); };
  const ent = (t, c, r, o = {}) => ents.push(Object.assign({ t, c, r }, o));
  const orbs = (pts) => pts.forEach(([c, r]) => ent('orb', c, r));
  const arc = (c0, c1, r, h, n) => { const o = []; for (let i = 0; i < n; i++) { const s = i / (n - 1); o.push([c0 + (c1 - c0) * s, r - Math.sin(s * Math.PI) * h]); } orbs(o); };
  let arenaStart = -1, doorCol = -1;

  const S = {
    intro(x) {
      ground(x, x + 11); ground(x + 15, x + 33); ent('start', x + 3, G);
      orbs([[x + 6, 11], [x + 7, 11], [x + 8, 11], [x + 9, 11]]); arc(x + 11, x + 16, 11, 2.2, 6); orbs([[x + 19, 11], [x + 20, 11], [x + 21, 11]]);
    },
    start(x) { ground(x, x + 11); ent('start', x + 3, G); orbs([[x + 6, 11], [x + 7, 11], [x + 8, 11], [x + 9, 11]]); },
    double(x) { plat(x + 1, 10, 2); plat(x + 5, 8, 2); plat(x + 9, 10, 2); arc(x, x + 12, 9.5, 3.2, 8); },   // pit: no ground
    chimney(x) {
      ground(x, x + 25); block(x + 6, x + 6, 2, 9); block(x + 10, x + 10, 2, 11);
      orbs([[x + 8, 10.5], [x + 7.4, 8.4], [x + 8.6, 6.6], [x + 7.4, 4.8], [x + 8.6, 3.2]]);
      plat(x + 12, 6, 2); plat(x + 15, 9, 2); orbs([[x + 10, 1], [x + 12.5, 5], [x + 15.5, 8]]);
    },
    spikes(x) {
      ground(x, x + 11); ent('cp', x + 1, G); spk(x + 4, x + 5); spk(x + 8, x + 8); plat(x + 6, 9, 2);
      orbs([[x + 4, 9.4], [x + 5, 8.8], [x + 6.5, 8], [x + 7.5, 8.8], [x + 8, 9.6]]);
    },
    combat(x) {
      ground(x, x + 19); ent('ronin', x + 6, G); ent('ronin', x + 11, G); block(x + 17, x + 19, 9, 11); ent('archer', x + 18, 9);
      orbs([[x + 8, 11], [x + 9, 11], [x + 14, 11], [x + 15, 11]]);
    },
    archers(x) { plat(x + 1, 10, 2); plat(x + 4, 8, 2); plat(x + 7, 10, 2); plat(x + 10, 8, 2); arc(x, x + 14, 9, 2.4, 7); },   // pit: no ground
    gauntlet(x) {
      ground(x, x + 14); ent('cp', x + 1, G); ent('ronin', x + 6, G); ent('ronin', x + 9, G); block(x + 12, x + 13, 9, 11); ent('archer', x + 12.5, 9);
      orbs([[x + 4, 11], [x + 7, 11], [x + 10, 10]]); ent('cp', x + 14, G);
    },
    exit(x) { ground(x, x + 11); ent('door', x + 7, G); doorCol = x + 7; block(x + 11, x + 11, 0, 11); orbs([[x + 3, 11], [x + 4, 11], [x + 5, 11]]); },
    boss(x) { ground(x, x + 26); block(x + 26, x + 26, 0, 11); ent('boss', x + 15, G); ent('door', x + 23, G); arenaStart = x; doorCol = x + 23; },
  };
  let x = 0;
  for (const k of meta.secs) { S[k](x); x += WIDTH[k]; }

  const solidAt = (px, py) => {
    const c = Math.floor(px / TILE), r = Math.floor(py / TILE);
    return c >= 0 && c < cols && r >= 0 && r < ROWS && grid[r * cols + c] === 1;
  };
  return { id, meta, cols, grid, oneways, spikes, ents, solidAt, arenaStart, doorCol, hasBoss: arenaStart >= 0 };
}
