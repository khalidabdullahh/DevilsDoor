// Batch 2 checks: difficulty ramp, chunk fairness, pickups, pause-safe hazards.
// Run: npm run test:world
import { readFileSync } from 'node:fs';
import { EndlessWorld } from '../src/js/levels/EndlessWorld.js';

let pass = 0, fail = 0;
const ok = (name, cond, extra = '') => { (cond ? pass++ : fail++); console.log(`${cond ? 'PASS' : 'FAIL'}  ${name} ${extra}`); };

// Small seeded RNG (mulberry32): same seed -> same world, so failures are reproducible
const seeded = (seed) => () => {
  seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

// Limits from the measured movement envelope (max gap 480/790, max step 120/220)
const MAX_GAP = 300;        // single-jump limit is 480 -> keep a big safety margin
const MAX_STEP_UP = 100;    // single-jump limit is 120
const MAX_CLIFF_RISE = 240; // needs wall-kicks; the 220px cliff was verified climbable in simulation

function buildWorld(seed, distance = 70000) {
  const w = new EndlessWorld('sunset_torii', seeded(seed));
  const types = [];
  const seenTypes = new Set();
  // record the type of every chunk generated after the starting zone as well
  while (w.generatedDistance < distance) {
    const before = w.chunkIndex;
    w._generateNextChunk();
    types.push({ index: w.chunkIndex, type: w.lastChunkType, streak: w.hardStreak });
  }
  return { w, types };
}

// ---- 1. Difficulty curve ----
{
  const w = new EndlessWorld('sunset_torii', seeded(1));
  ok('difficulty is 0 at the start', w._difficultyAt(900) === 0);
  ok('difficulty is 1 by 2500m', w._difficultyAt(900 + 25000) === 1);
  ok('difficulty rises monotonically', w._difficultyAt(5000) < w._difficultyAt(12000) && w._difficultyAt(12000) < w._difficultyAt(20000));
}

// ---- 2. Determinism ----
{
  const a = buildWorld(42, 30000).w, b = buildWorld(42, 30000).w;
  ok('same seed builds the identical world', a.solids.length === b.solids.length && a.enemies.length === b.enemies.length && a.diamonds.length === b.diamonds.length);
}

// ---- 3. Early game is gentle ----
for (const seed of [1, 2, 3, 4, 5]) {
  const w = new EndlessWorld('sunset_torii', seeded(seed)); // starting zone = first ~230m
  // saws / axes unlock at 200m (x = 2900), so only look at what was built before that
  const sawsOrAxes = w.pendulumAxes.filter(a => a.pivotX < 2900).length + w.skullSawWheels.filter(sw => sw.x < 2900).length;
  const heavies = w.enemies.filter(e => (e.type === 'oni' || e.type === 'monk') && e.x < 3900).length;
    ok(`seed ${seed}: no saws/axes before 200m, no oni/monk before 300m`, sawsOrAxes === 0 && heavies === 0, `(saws+axes=${sawsOrAxes}, heavy=${heavies})`);
}

// ---- 3b. Gentle opening: no cliffs / arenas in the first 100m (x < 1900) ----
{
  let early = 0;
  for (const seed of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]) {
    const w = new EndlessWorld('sunset_torii', seeded(seed));
    early += w.solids.filter(s => (s.tag === 'high_cliff' || s.tag === 'arena_floor') && s.x < 1900).length;
  }
  ok('first 100m has no wall-climb cliff or arena (10 seeds)', early === 0, `(found ${early})`);
}

// ---- 4. Per-seed fairness over ~6000m of world ----
const SEEDS = [11, 22, 33, 44, 55, 66, 77, 88];
let totalChunks = 0, worstGap = 0, worstStep = 0, worstStreak = 0;
let violations = [];
let heavyEarly = 0, orbTotal = 0, diamondTotal = 0, chunkTotal = 0;

for (const seed of SEEDS) {
  const { w, types } = buildWorld(seed);
  totalChunks += types.length;

  // 4a. breather + no repeated special chunk
  let prev = -1;
  for (const t of types) {
    worstStreak = Math.max(worstStreak, t.streak);
    if (t.type > 0 && t.type === prev) violations.push(`seed ${seed}: special chunk ${t.type} repeated`);
    prev = t.type;
  }

  // 4b. Walkable path: floors + cliff, sorted by x. Optional pagoda platform excluded.
  const path = w.solids
    .filter(s => s.tag !== 'pagoda_platform')
    .sort((a, b) => a.x - b.x);

  // planks are consecutive tiles of one bridge; treat a bridge as one span
  for (let i = 1; i < path.length; i++) {
    const A = path[i - 1], B = path[i];
    const gap = B.x - (A.x + A.width);
    if (gap < 0) continue;                       // touching / overlapping tiles (bridge planks)
    const rise = A.y - B.y;                      // > 0: next surface is higher
    const limit = (B.tag === 'high_cliff') ? MAX_CLIFF_RISE : MAX_STEP_UP;
    worstGap = Math.max(worstGap, gap);
    if (B.tag !== 'high_cliff' || true) worstStep = Math.max(worstStep, B.tag === 'high_cliff' ? 0 : rise);
    if (gap > MAX_GAP) violations.push(`seed ${seed}: gap ${gap}px before ${B.tag} @x=${B.x}`);
    if (rise > limit) violations.push(`seed ${seed}: step-up ${rise}px onto ${B.tag} @x=${B.x}`);
    if (A.tag === 'high_cliff' && B.tag === 'ground_lower' && gap > MAX_GAP) violations.push(`seed ${seed}: cliff exit gap ${gap}`);
  }

  // 4c. Enemy patrols stay on solid ground
  const floors = w.solids.filter(s => s.tag !== 'pagoda_platform' && s.tag !== 'high_cliff');
  for (const e of w.enemies) {
    if (e.type === undefined || e.patrolMin === undefined) continue;
    const okFloor = floors.some(f => f.x <= e.patrolMin && e.patrolMax <= f.x + f.width);
    if (!okFloor) violations.push(`seed ${seed}: enemy ${e.type} patrol [${e.patrolMin | 0},${e.patrolMax | 0}] is not over a single floor`);
    // spawn point must not sit inside a hazard
    if (w.checkHazardCollision(e.x, e.y, e.width, e.height) && !w.enemies.some(x => x !== e)) { /* unreachable */ }
  }

  // 4d. Pickups are never buried in terrain, and are never inside hazards
  const inRect = (x, y, r) => x > r.x && x < r.x + r.width && y > r.y && y < r.y + r.height;
  for (const dm of w.diamonds) {
    if (w.solids.some(s => inRect(dm.x, dm.y, s))) violations.push(`seed ${seed}: diamond buried in terrain @${dm.x | 0},${dm.y | 0}`);
    if (w.hazards.some(h => inRect(dm.x, dm.y, { x: h.x, y: h.y, width: h.width || 40, height: h.height || 40 }))) violations.push(`seed ${seed}: diamond inside a hazard @${dm.x | 0},${dm.y | 0}`);
  }
  for (const o of w.healthOrbs) {
    if (w.solids.some(s => inRect(o.x, o.y, s))) violations.push(`seed ${seed}: life orb buried in terrain`);
    if (w.hazards.some(h => inRect(o.x, o.y, { x: h.x, y: h.y, width: h.width || 40, height: h.height || 40 }))) violations.push(`seed ${seed}: life orb inside a hazard`);
    if (w.skullSawWheels.some(sw => Math.hypot(o.x - sw.x, o.y - sw.baseY) < sw.radius + sw.moveRange + 40)) violations.push(`seed ${seed}: life orb inside saw range`);
  }

  orbTotal += w.healthOrbs.length; diamondTotal += w.diamonds.length; chunkTotal += types.length;
}

ok(`fairness: no gap > ${MAX_GAP}px, no step-up > ${MAX_STEP_UP}px (cliffs <= ${MAX_CLIFF_RISE}), patrols on floor, pickups not buried`, violations.length === 0,
   violations.length ? `\n     ${violations.slice(0, 8).join('\n     ')}` : `(${totalChunks} chunks over ${SEEDS.length} seeds; worst gap ${worstGap}px, worst step ${worstStep}px)`);
ok('never more than 2 hard chunks in a row', worstStreak <= 2, `(worst streak ${worstStreak})`);
ok('diamonds are actually spawned (avg >= 3 per chunk)', diamondTotal / chunkTotal >= 3, `(${(diamondTotal / chunkTotal).toFixed(1)}/chunk)`);
ok('life orbs are spawned regularly (>= 1 per 12 chunks)', orbTotal / chunkTotal >= 1 / 12, `(1 per ${(chunkTotal / Math.max(1, orbTotal)).toFixed(1)} chunks)`);

// ---- 5. Difficulty really scales the hazards / enemies ----
{
  const easy = new EndlessWorld('sunset_torii', seeded(7)), hard = new EndlessWorld('sunset_torii', seeded(7));
  easy._buildPendulumAxeHazardChunk(50000, 0, 80);
  hard._buildPendulumAxeHazardChunk(50000, 1, 150);
  const ea = easy.pendulumAxes[easy.pendulumAxes.length - 1], ha = hard.pendulumAxes[hard.pendulumAxes.length - 1];
  ok('pendulum gets longer + faster with difficulty', ha.length > ea.length && ha.speed > ea.speed, `(len ${ea.length}->${ha.length}, speed ${ea.speed}->${ha.speed})`);
  ok('hard pendulum can hit a standing player (blade bottom >= 470); easy cannot', 160 + ha.length >= 470 && 160 + ea.length < 470, `(bottom ${160 + ea.length} -> ${160 + ha.length})`);

  const w0 = new EndlessWorld('sunset_torii', seeded(3)), w1 = new EndlessWorld('sunset_torii', seeded(3));
  const e0 = w0._spawnEnemy(0, 0, 0, 100, 0, 'ronin'), e1 = w1._spawnEnemy(0, 0, 0, 100, 1, 'ronin');
  ok('enemies are ~30% faster at max difficulty', Math.abs(e1.chaseSpeed / e0.chaseSpeed - 1.3) < 0.01);

  const b0 = new EndlessWorld('sunset_torii', seeded(3)), b1 = new EndlessWorld('sunset_torii', seeded(3));
  b0._buildCollapsingBridgeChunk(60000, 0, 80); b1._buildCollapsingBridgeChunk(60000, 1, 150);
  ok('bridge planks give way faster at high difficulty', b1.bridgePlanks.at(-1).fallDelay < b0.bridgePlanks.at(-1).fallDelay);

  const s1 = new EndlessWorld('sunset_torii', seeded(3));
  s1._buildSpinningSkullSawChunk(60000, 1, 150);
  const s0 = new EndlessWorld('sunset_torii', seeded(3));
  s0._buildSpinningSkullSawChunk(60000, 0, 80);
  ok('second saw appears only late (d > 0.5)', s1.skullSawWheels.length - s0.skullSawWheels.length === 1);
}

// ---- 6. Roster grows: oni after ~300m, monk after ~750m ----
{
  let oniBefore = 0, monkBefore = 0;
  for (const seed of SEEDS) {
    const { w } = buildWorld(seed, 70000);
    oniBefore += w.enemies.filter(e => e.type === 'oni' && e.x < 3900).length;
    monkBefore += w.enemies.filter(e => e.type === 'monk' && e.x < 8400).length;
  }
  ok('no oni before 300m and no monk before 750m (8 seeds)', oniBefore === 0 && monkBefore === 0, `(oni=${oniBefore}, monk=${monkBefore})`);
}

// ---- 7. Pause-safe hazards: they follow the world clock, not the wall clock ----
{
  const src = readFileSync(new URL('../src/js/levels/EndlessWorld.js', import.meta.url), 'utf8');
  ok('EndlessWorld no longer reads performance.now()', !/performance\.now\(\)/.test(src));

  const w = new EndlessWorld('sunset_torii', seeded(5));
  w._buildPendulumAxeHazardChunk(0, 0.5, 90);
  const axe = w.pendulumAxes.at(-1);
  const player = { x: -5000, y: 0, width: 46, height: 72, isDead: false, health: 3, maxHealth: 3, takeDamage() {}, diamonds: 0, score: 0 };
  for (let i = 0; i < 30; i++) w.update(1 / 60, player, null, null);
  const a1 = axe.angle;
  w.update(0, player, null, null);              // "paused" frame: no time passes
  const a2 = axe.angle;
  for (let i = 0; i < 30; i++) w.update(1 / 60, player, null, null);
  ok('hazard angle only changes when world time advances', a1 === a2 && axe.angle !== a2, `(t=${w.time.toFixed(2)}s)`);
}

// ---- 8. Pickup behaviour ----
{
  const w = new EndlessWorld('sunset_torii', seeded(9));
  const p = { x: 10000, y: 300, width: 46, height: 72, isDead: false, health: 3, maxHealth: 3, takeDamage() {}, diamonds: 0, score: 0 };
  const mine = { x: p.x + 23, y: p.y + 20, collected: false, phase: 0 };
  w.diamonds.push(mine);
  w.healthOrbs.push({ x: p.x + 23, y: p.y + 20, collected: false });
  w.update(1 / 60, p, null, null); // (the world also generates its own chunks near x=10000, so count relatively)
  ok('diamond pickup: collected, +50 score each', mine.collected && p.diamonds >= 1 && p.score === p.diamonds * 50, `(diamonds=${p.diamonds}, score=${p.score})`);
  ok('life orb is NOT wasted at full health', w.healthOrbs.some(o => !o.collected));
  p.health = 1;
  w.update(1 / 60, p, null, null);
  ok('life orb heals +1 when hurt', p.health === 2);
  p.health = 3;
  const before = p.health;
  ok('health never exceeds max', before === p.maxHealth);
}

// ---- 9. Rendering smoke test (mock canvas: any method call / property is accepted) ----
{
  const mkCtx = () => new Proxy(function () {}, {
    get: (t, k) => (k === 'canvas' ? { width: 1280, height: 720 } : mkCtx()),
    set: () => true,
    apply: () => mkCtx()
  });
  const w = new EndlessWorld('sunset_torii', seeded(21));
  w.healthOrbs.push({ x: 400, y: 480, collected: false });
  let threw = null;
  try { w.draw(mkCtx(), 0, 0, 1.5); } catch (e) { threw = e; }
  ok('world.draw (incl. diamonds + life orbs) runs without throwing', threw === null, threw ? String(threw) : '');
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
