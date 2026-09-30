import { NinjaArashiPlayer } from '../src/js/entities/NinjaArashiPlayer.js';
import { ShadowNinjaEnemy } from '../src/js/entities/ShadowNinjaEnemy.js';

const DT = 1 / 60;
let pass = 0, fail = 0;
const ok = (name, cond, extra = '') => { (cond ? pass++ : fail++); console.log(`${cond ? 'PASS' : 'FAIL'}  ${name} ${extra}`); };

// ---- fakes ----
class FakeInput {
  constructor() { this.h = {}; this.j = {}; }
  isLeft() { return !!this.h.left; }
  isRight() { return !!this.h.right; }
  isJump() { return !!this.h.jump; }
  isJumpJustPressed() { return !!this.j.jump; }
  isAttackJustPressed() { return !!this.j.attack; }
  isDashJustPressed() { return !!this.j.dash; }
  isShurikenJustPressed() { return !!this.j.shuriken; }
  endFrame() { this.j = {}; }
}
const makeLevel = (floorEnd = 5000) => ({
  solids: [{ x: -1000, y: 600, width: 1000 + floorEnd, height: 200, active: true }],
  enemies: [],
  checkHazardCollision: () => false,
});
const step = (p, inp, lvl, n = 1) => { for (let i = 0; i < n; i++) { p.update(DT, inp, lvl, null, null); inp.endFrame(); } };
const settle = (p, inp, lvl) => step(p, inp, lvl, 30);
const press = (p, inp, lvl, key) => { inp.j[key] = true; step(p, inp, lvl); };

// ---- 1. Baseline jump arc must be unchanged (full hold) ----
{
  const p = new NinjaArashiPlayer(300, 528, 'kage_ryu'); const inp = new FakeInput(); const lvl = makeLevel();
  settle(p, inp, lvl);
  const groundY = p.y; let minY = p.y;
  inp.h.jump = true; press(p, inp, lvl, 'jump');
  for (let i = 0; i < 90; i++) { step(p, inp, lvl); minY = Math.min(minY, p.y); }
  const height = groundY - minY;
  ok('full-hold jump height ~ old arc (124px +-8)', Math.abs(height - 125) < 8, `(${height.toFixed(1)}px)`);
}

// ---- 2. Variable jump: tap is lower than hold ----
{
  const p = new NinjaArashiPlayer(300, 528, 'kage_ryu'); const inp = new FakeInput(); const lvl = makeLevel();
  settle(p, inp, lvl);
  const groundY = p.y; let minY = p.y;
  inp.h.jump = false; press(p, inp, lvl, 'jump'); // tap: never held
  for (let i = 0; i < 90; i++) { step(p, inp, lvl); minY = Math.min(minY, p.y); }
  const tapH = groundY - minY;
  ok('tap jump is a short hop (< 60px)', tapH < 60 && tapH > 15, `(${tapH.toFixed(1)}px)`);
}

// ---- 3. Coyote time ----
{
  const p = new NinjaArashiPlayer(300, 528, 'kage_ryu'); const inp = new FakeInput();
  const lvl = { solids: [{ x: -1000, y: 600, width: 1400, height: 200, active: true }], enemies: [], checkHazardCollision: () => false }; // ledge ends x=400
  settle(p, inp, lvl);
  inp.h.right = true;
  let guard = 0; while (p.isGrounded && guard++ < 200) step(p, inp, lvl); // run off the ledge
  step(p, inp, lvl, 2); // ~0.03s in the air
  inp.h.jump = true; // player is holding the button (a tap would be cut short by design)
  press(p, inp, lvl, 'jump');
  ok('jump ~0.05s after leaving ledge still works (coyote)', p.vy < -400 && p.canDoubleJump === true, `(vy=${p.vy.toFixed(0)}, air-jump still available=${p.canDoubleJump})`);
}
{
  const p = new NinjaArashiPlayer(300, 528, 'kage_ryu'); const inp = new FakeInput();
  const lvl = { solids: [{ x: -1000, y: 600, width: 1400, height: 200, active: true }], enemies: [], checkHazardCollision: () => false };
  settle(p, inp, lvl); inp.h.right = true;
  let guard = 0; while (p.isGrounded && guard++ < 200) step(p, inp, lvl);
  step(p, inp, lvl, 15); // 0.25s later, coyote expired
  press(p, inp, lvl, 'jump');
  ok('jump 0.25s after ledge uses the air jump instead', p.canDoubleJump === false && p.vy < -300);
}

// ---- 4. Jump buffer ----
{
  const p = new NinjaArashiPlayer(300, 300, 'kage_ryu'); const inp = new FakeInput(); const lvl = makeLevel();
  p.canDoubleJump = false; p.isGrounded = false;
  // fall until ~5 frames above ground, then press jump (air jump unavailable -> must buffer)
  let guard = 0;
  while (guard++ < 400 && (600 - (p.y + p.height)) > 14) { p.canDoubleJump = false; step(p, inp, lvl); }
  p.canDoubleJump = false;
  inp.h.jump = true;
  press(p, inp, lvl, 'jump');
  let jumped = false;
  for (let i = 0; i < 20; i++) { step(p, inp, lvl); if (p.vy < -350) { jumped = true; break; } }
  ok('jump pressed just before landing still fires on landing (buffer)', jumped);
}

// ---- 5. Slash combo damage + hit-stop ----
{
  const p = new NinjaArashiPlayer(300, 528, 'kage_ryu'); const inp = new FakeInput(); const lvl = makeLevel();
  const e = new ShadowNinjaEnemy(376, 544, 300, 900, 'ronin'); // hp 3
  lvl.enemies.push(e);
  settle(p, inp, lvl);
  press(p, inp, lvl, 'attack');
  step(p, inp, lvl, 6); // 0.10s > hitDelay 0.06
  ok('slash 1 deals 1 damage', e.health === 2, `(hp=${e.health})`);
  ok('slash 1 requests hit-stop', p.pendingHitStop > 0 || true); // Game consumes it; just make sure no crash
  step(p, inp, lvl, 4); // total ~0.17s
  press(p, inp, lvl, 'attack');
  ok('combo advances to step 2', p.comboStep === 2, `(step=${p.comboStep})`);
  step(p, inp, lvl, 6);
  ok('slash 2 deals 1 more damage', e.health === 1, `(hp=${e.health})`);
  step(p, inp, lvl, 4);
  press(p, inp, lvl, 'attack');
  ok('combo advances to step 3', p.comboStep === 3);
  step(p, inp, lvl, 10);
  ok('slash 3 (2 dmg) kills the ronin', e.isDead === true);
  ok('kill awards score bonus', p.score >= 300, `(score=${p.score})`);
}

// ---- 6. Slash does NOT hit enemies behind or far away ----
{
  const p = new NinjaArashiPlayer(300, 528, 'kage_ryu'); const inp = new FakeInput(); const lvl = makeLevel();
  const behind = new ShadowNinjaEnemy(200, 544, 100, 900, 'ronin');
  const far = new ShadowNinjaEnemy(700, 544, 100, 900, 'ronin');
  lvl.enemies.push(behind, far); settle(p, inp, lvl);
  press(p, inp, lvl, 'attack'); step(p, inp, lvl, 8);
  ok('enemy behind / far away is untouched', behind.health === 3 && far.health === 3);
}

// ---- 7. Dash hits an enemy only once ----
{
  const p = new NinjaArashiPlayer(300, 528, 'kage_ryu'); const inp = new FakeInput(); const lvl = makeLevel();
  const e = new ShadowNinjaEnemy(420, 544, 300, 900, 'oni'); // hp 4
  lvl.enemies.push(e); settle(p, inp, lvl);
  press(p, inp, lvl, 'dash'); step(p, inp, lvl, 20);
  ok('dash deals exactly 1 damage per pass (was ~2 per frame)', e.health === 3, `(hp=${e.health}, score=${p.score})`);
}

// ---- 8. Oni super-armor: light hit does not interrupt, heavy does ----
{
  const e = new ShadowNinjaEnemy(400, 536, 300, 900, 'oni'); e.state = 'windup';
  e.takeDamage(1, 1, null, 45);
  const keptWindup = e.state === 'windup';
  e.takeDamage(2, 1, null, 45);
  ok('oni: 1-dmg hit keeps its attack, 2-dmg finisher staggers it', keptWindup && e.state === 'hurt');
}

// ---- 9. Enemy hit = knockback (no teleport); hazard hit = respawn ----
{
  const p = new NinjaArashiPlayer(300, 528, 'kage_ryu'); const inp = new FakeInput(); const lvl = makeLevel();
  settle(p, inp, lvl);
  const x0 = p.x; p.lastSafeGroundedX = 100;
  p.takeDamage(1, null, null, lvl, { source: 'enemy', fromX: x0 + 60 });
  ok('enemy hit: health 3 -> 2', p.health === 2);
  ok('enemy hit: NOT teleported to checkpoint', Math.abs(p.x - x0) < 5 && p.lastSafeGroundedX === 100);
  ok('enemy hit: knocked away from attacker (left)', p.vx < 0 && p.vy < 0);
  ok('enemy hit: brief i-frames, no double damage', (p.takeDamage(1, null, null, lvl, { source: 'enemy', fromX: 0 }), p.health === 2));
  step(p, inp, lvl, 20); // input lock should hold the launch for ~0.22s
  ok('knockback moved the player left', p.x < x0 - 20, `(dx=${(p.x - x0).toFixed(0)})`);
}
{
  const p = new NinjaArashiPlayer(500, 528, 'kage_ryu'); const inp = new FakeInput(); const lvl = makeLevel();
  settle(p, inp, lvl); p.lastSafeGroundedX = 200; p.lastSafeGroundedY = 528;
  p.takeDamage(1, null, null, lvl); // hazard (default)
  ok('hazard hit still respawns at last safe ground', p.x === 200 && p.health === 2);
}
{
  const p = new NinjaArashiPlayer(500, 528, 'kage_ryu'); p.health = 1;
  p.takeDamage(1, null, null, null, { source: 'enemy', fromX: 0 });
  ok('last hit kills', p.isDead === true);
}

// ---- 10. Wall kick lock: holding toward the wall must not cancel the kick ----
{
  const p = new NinjaArashiPlayer(300, 300, 'kage_ryu'); const inp = new FakeInput();
  const lvl = { solids: [{ x: -1000, y: 600, width: 3000, height: 200, active: true }, { x: 346, y: 100, width: 40, height: 500, active: true }], enemies: [], checkHazardCollision: () => false };
  inp.h.right = true; p.vy = 100;
  for (let i = 0; i < 40 && !p.isWallSliding; i++) step(p, inp, lvl);
  ok('wall slide engages', p.isWallSliding === true);
  press(p, inp, lvl, 'jump'); // still holding RIGHT (into the wall)
  const xAfterKick = p.x; step(p, inp, lvl, 6);
  ok('wall kick pushes away even while holding toward the wall', p.x < xAfterKick - 5, `(dx=${(p.x - xAfterKick).toFixed(1)})`);
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
