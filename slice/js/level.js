// Level 1: "Sunset Shrine". Handcrafted in 8 sections, each teaching/testing one idea:
// 1 move+jump  2 double-jump over a pit  3 wall-jump chimney  4 spikes+checkpoint
// 5 first combat  6 archers across a pit  7 mixed gauntlet  8 Oni boss + Devil's Door
export const TILE = 64, COLS = 150, ROWS = 16, G = 12;
export const ARENA_START = 123;   // boss gate locks when the player passes this column
export const DOOR_COL = 146;

export function buildLevel() {
  const grid = new Uint8Array(COLS * ROWS);
  const oneways = [], spikes = [], ents = [];
  const set = (c, r) => { if (c >= 0 && c < COLS && r >= 0 && r < ROWS) grid[r * COLS + c] = 1; };
  const ground = (c1, c2) => { for (let c = c1; c <= c2; c++) for (let r = G; r < ROWS; r++) set(c, r); };
  const block = (c1, c2, r1, r2) => { for (let c = c1; c <= c2; c++) for (let r = r1; r <= r2; r++) set(c, r); };
  const plat = (c, r, w) => oneways.push({ c, r, w });
  const spk = (c1, c2, r = G - 1) => { for (let c = c1; c <= c2; c++) spikes.push({ c, r }); };
  const ent = (t, c, r, o = {}) => ents.push(Object.assign({ t, c, r }, o));
  const orbs = (pts) => pts.forEach(([c, r]) => ent('orb', c, r));
  const arc = (c0, c1, r, h, n) => { const o = []; for (let i = 0; i < n; i++) { const s = i / (n - 1); o.push([c0 + (c1 - c0) * s, r - Math.sin(s * Math.PI) * h]); } orbs(o); };

  // 1. movement + first pit
  ground(0, 11); ground(15, 33);
  ent('start', 3, G);
  orbs([[6, 11], [7, 11], [8, 11], [9, 11]]);
  arc(11, 16, 11, 2.2, 6);
  orbs([[19, 11], [20, 11], [21, 11]]);

  // 2. double-jump platforms over a wide pit (cols 34-45)
  plat(35, 10, 2); plat(39, 8, 2); plat(43, 10, 2);
  arc(34, 46, 9.5, 3.2, 8);

  // 3. wall-jump chimney: walk in under the hanging left wall, climb, cross the wall top, descend
  ground(46, 92);
  block(52, 52, 2, 9);             // left wall hangs from the top; doorway on rows 10-11
  block(56, 56, 2, 11);            // right wall solid to the floor
  orbs([[54, 10.5], [53.4, 8.4], [54.6, 6.6], [53.4, 4.8], [54.6, 3.2]]);
  plat(58, 6, 2); plat(61, 9, 2);
  orbs([[56, 1], [58.5, 5], [61.5, 8]]);

  // 4. spikes + first checkpoint
  ent('cp', 63, G);
  spk(66, 67); spk(70, 70);
  plat(68, 9, 2);
  orbs([[66, 9.4], [67, 8.8], [68.5, 8], [69.5, 8.8], [70, 9.6]]);

  // 5. first combat arena (cols 72-92)
  ent('ronin', 78, G); ent('ronin', 83, G);
  block(89, 91, 9, 11); ent('archer', 90, 9);
  orbs([[80, 11], [81, 11], [86, 11], [87, 11]]);

  // 6. archers across a pit (cols 93-106)
  plat(94, 10, 2); plat(97, 8, 2); plat(100, 10, 2); plat(103, 8, 2);
  arc(93, 107, 9, 2.4, 7);
  ground(107, COLS - 1);
  ent('cp', 108, G);

  // 7. mixed gauntlet (cols 109-121)
  ent('ronin', 113, G); ent('ronin', 116, G);
  block(119, 120, 9, 11); ent('archer', 119.5, 9);
  orbs([[111, 11], [114, 11], [117, 10]]);
  ent('cp', 121, G);

  // 8. boss arena (cols 123-148) + Devil's Door
  block(COLS - 1, COLS - 1, 0, 11);          // far wall
  ent('boss', 138, G);
  ent('door', DOOR_COL, G);

  const solidAt = (px, py) => {
    const c = Math.floor(px / TILE), r = Math.floor(py / TILE);
    return c >= 0 && c < COLS && r >= 0 && r < ROWS && grid[r * COLS + c] === 1;
  };
  return { grid, oneways, spikes, ents, solidAt };
}
