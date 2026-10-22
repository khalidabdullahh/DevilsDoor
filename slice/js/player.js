import { readIntent } from './input.js';
import { sfx } from './sfx.js';

const RUN = 410, JUMP_V = -850, DJUMP_V = -720, WALL_V = -790, WALL_VX = 350, DASH_V = 760, DASH_T = 0.17;
const ATK = [{ dur: 0.26, reach: 96, dmg: 1, lunge: 150 }, { dur: 0.26, reach: 100, dmg: 1, lunge: 150 }, { dur: 0.36, reach: 130, dmg: 2, lunge: 300 }];

export class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'ninja', 'idle_0');
    scene.add.existing(this); scene.physics.add.existing(this);
    this.setOrigin(0.5, 184 / 192).setScale(0.5).setDepth(20);
    this.body.setSize(56, 160).setOffset(68, 24).setMaxVelocity(700, 1100);
    this.maxHp = 3; this.hp = 3;
    this.state = 'idle'; this.facing = 1;
    this.coyote = 0; this.jbuf = 0; this.airJumps = 1; this.airDash = true; this.cutting = false;
    this.dashT = 0; this.dashCd = 0; this.invul = 0; this.lock = 0;
    this.atkT = 0; this.atkCombo = 0; this.atkDur = 0; this.atkCd = 0; this.comboWin = 0; this.atkHit = false; this.hitSet = new Set();
    this.thrCd = 0; this.hurtT = 0; this.deadT = 0; this.dustT = 0; this.ghostT = 0; this.lastSafe = { x, y }; this.safeT = 0;
    this.prevVy = 0; this.wasGround = false; this.wallDir = 0;
    this.on('animationcomplete', () => {});
  }

  get center() { return { x: this.x, y: this.y - 42 }; }
  get dead() { return this.state === 'dead'; }

  play2(name, dur) {
    const key = 'ninja_' + name;
    if (this.anims.currentAnim?.key !== key || !this.anims.isPlaying) this.anims.play(key, true);
    if (dur) this.anims.msPerFrame = (dur * 1000) / this.anims.getTotalFrames();
  }

  update(time, delta, keys) {
    const s = this.scene, dt = Math.min(delta, 50) / 1000, b = this.body;
    const inp = this.dead ? { x: 0, down: false, jump: false, jumpHeld: false, attack: false, dash: false, throw: false } : readIntent(keys);
    const ground = b.blocked.down || b.touching.down;
    this.invul = Math.max(0, this.invul - dt); this.dashCd -= dt; this.atkCd -= dt; this.thrCd -= dt; this.comboWin -= dt; this.lock -= dt;
    this.coyote = ground ? 0.12 : this.coyote - dt;
    this.jbuf = inp.jump ? 0.17 : this.jbuf - dt;
    if (ground) { this.airJumps = 1; this.airDash = true; this.cutting = false; }

    // landing
    if (ground && !this.wasGround && this.prevVy > 420) { s.fx.dust(this.x, this.y, 6, 1); sfx.land(); if (this.prevVy > 800) s.shake(3, 90); }
    this.wasGround = ground; this.prevVy = b.velocity.y;

    // safe spot memory (for pit/spike respawn)
    this.safeT -= dt;
    if (ground && this.safeT <= 0 && s.level.solidAt(this.x - 56, this.y + 6) && s.level.solidAt(this.x + 56, this.y + 6)) { this.lastSafe = { x: this.x, y: this.y - 2 }; this.safeT = 0.25; }

    if (this.dead) { this.deadT += dt; b.setVelocityX(b.velocity.x * 0.9); return; }

    // ---- state machine
    if (this.state === 'hurt') {
      this.hurtT -= dt;
      if (this.hurtT <= 0) this.state = 'idle';
    } else if (this.state === 'dash') {
      this.dashT -= dt; b.setVelocity(this.facing * DASH_V, 0);
      this.ghostT -= dt; if (this.ghostT <= 0) { s.fx.ghost(this); this.ghostT = 0.035; }
      if (this.dashT <= 0) { this.state = 'idle'; b.setVelocityX(this.facing * RUN * 0.8); }
    } else if (this.state === 'attack') {
      this.atkT += dt;
      const a = ATK[this.atkCombo - 1], p = this.atkT / a.dur;
      if (!this.atkHit && p >= 0.4) { this.atkHit = true; this.strike(a); }
      if (this.atkT >= a.dur) { this.state = 'idle'; this.comboWin = 0.32; this.atkCd = 0.02; }
      if (inp.jump && this.coyote > 0) { this.state = 'idle'; }
      if (inp.dash && this.dashCd <= 0) { this.startDash(); }
      b.setVelocityX(b.velocity.x * Math.pow(0.001, dt));
    }

    if (this.state !== 'hurt' && this.state !== 'dash') {
      // horizontal
      if (this.lock <= 0 && this.state !== 'attack') {
        const target = inp.x * RUN, k = ground ? 18 : 9;
        b.setVelocityX(b.velocity.x + (target - b.velocity.x) * Math.min(1, k * dt));
        if (inp.x) this.facing = inp.x;
      }
      // wall slide
      const pushWall = (b.blocked.left && inp.x < 0) || (b.blocked.right && inp.x > 0);
      const wall = !ground && pushWall && b.velocity.y > 0 && this.state !== 'attack';
      this.wallDir = wall ? (b.blocked.left ? -1 : 1) : 0;
      if (wall) { b.setVelocityY(Math.min(b.velocity.y, 95)); this.facing = this.wallDir; if (Math.random() < 0.3) s.fx.dust(this.x + this.wallDir * 14, this.y - 30, 1, 0.4); }
      // jump
      if (this.jbuf > 0) {
        if (inp.down && s.dropThrough(this)) { this.jbuf = 0; }
        else if (this.coyote > 0) { this.doJump(JUMP_V); this.coyote = 0; s.fx.dust(this.x, this.y, 5, 1); }
        else if (wall) { b.setVelocity(-this.wallDir * WALL_VX, WALL_V); this.facing = -this.wallDir; this.lock = 0.16; this.airJumps = 1; this.jbuf = 0; this.cutting = false; sfx.jump(); s.fx.dust(this.x + this.wallDir * 14, this.y - 30, 6, 1); }
        else if (this.airJumps > 0) { this.airJumps--; this.doJump(DJUMP_V); s.fx.ring(this.x, this.y - 6, 0.55); }
      }
      // variable jump height
      if (!inp.jumpHeld && b.velocity.y < -260 && this.cutting) { b.setVelocityY(b.velocity.y * 0.58); this.cutting = false; }
      // dash
      if (inp.dash && this.dashCd <= 0 && this.state !== 'attack' && (ground || this.airDash)) this.startDash();
      // attack
      if (inp.attack && this.atkCd <= 0 && this.state !== 'attack') this.startAttack(inp);
      // throw
      if (inp.throw && this.thrCd <= 0 && this.state !== 'attack') this.doThrow();
      // run dust
      if (ground && Math.abs(b.velocity.x) > 200) { this.dustT -= dt; if (this.dustT <= 0) { s.fx.dust(this.x - this.facing * 10, this.y, 1, 0.6); this.dustT = 0.1; } }
    }

    // ---- animation
    this.setFlipX(this.facing < 0);
    let anim = 'idle';
    if (this.state === 'hurt') anim = 'hurt';
    else if (this.state === 'dash') anim = 'dash';
    else if (this.state === 'attack') anim = 'slash' + this.atkCombo;
    else if (this.state === 'throw') anim = 'throw';
    else if (this.wallDir) anim = 'wall';
    else if (!ground) anim = b.velocity.y < 0 ? 'jump' : 'fall';
    else if (Math.abs(b.velocity.x) > 40) anim = 'run';
    if (this.state === 'attack') this.play2(anim, ATK[this.atkCombo - 1].dur);
    else if (anim === 'throw') this.play2(anim, 0.2);
    else this.play2(anim);
    if (this.state === 'throw') { this.thrT -= dt; if (this.thrT <= 0) this.state = 'idle'; }
    if (this.invul > 0 && this.state !== 'dash') this.setAlpha(Math.floor(this.invul * 20) % 2 ? 0.45 : 1); else this.setAlpha(1);
  }

  slashRect() {
    if (this.state !== 'attack') return null;
    const a = ATK[this.atkCombo - 1], p = this.atkT / a.dur;
    if (p < 0.2 || p > 0.9) return null;
    return new Phaser.Geom.Rectangle(this.facing > 0 ? this.x - 10 : this.x - a.reach, this.y - 96, a.reach + 10, 100);
  }

  doJump(v) { this.body.setVelocityY(v); this.jbuf = 0; this.cutting = true; sfx.jump(); }

  startDash() {
    this.state = 'dash'; this.dashT = DASH_T; this.dashCd = 0.5; this.invul = Math.max(this.invul, DASH_T + 0.08);
    if (!(this.body.blocked.down || this.body.touching.down)) this.airDash = false;
    sfx.dash(); this.scene.fx.dust(this.x, this.y, 4, 1); this.scene.shake(2, 60); this.ghostT = 0;
  }

  startAttack(inp) {
    const nxt = this.comboWin > 0 && this.atkCombo < 3 ? this.atkCombo + 1 : 1;
    this.atkCombo = nxt; this.state = 'attack'; this.atkT = 0; this.atkHit = false; this.hitSet.clear();
    if (inp.x) this.facing = inp.x;
    const a = ATK[nxt - 1]; this.body.setVelocityX(this.facing * a.lunge);
    sfx.swish(nxt - 1);
  }

  // damage window of a slash: foes + enemy projectiles inside the front rectangle
  strike(a) {
    const s = this.scene, dir = this.facing;
    const x0 = dir > 0 ? this.x - 10 : this.x - a.reach, rect = new Phaser.Geom.Rectangle(x0, this.y - 96, a.reach + 10, 100);
    s.fx.slash(this.x + dir * 44, this.y - 46, dir, this.atkCombo);
    let hit = false;
    for (const f of s.foes) {
      if (f.dead || this.hitSet.has(f)) continue;
      if (Phaser.Geom.Intersects.RectangleToRectangle(rect, f.hurtbox())) { this.hitSet.add(f); f.takeHit(a.dmg, dir); hit = true; }
    }
    for (const pr of s.projectiles.getChildren()) {
      if (!pr.active || pr.friendly || !pr.deflectable) continue;
      if (Phaser.Geom.Rectangle.Contains(rect, pr.x, pr.y)) { pr.friendly = true; pr.body.setVelocity(-pr.body.velocity.x * 1.2, -pr.body.velocity.y * 1.2); pr.rotation += Math.PI; s.fx.spark(pr.x, pr.y, 6); sfx.clash(); s.hitStop(60); hit = true; }
    }
    if (hit) { s.hitStop(this.atkCombo === 3 ? 95 : 60); s.shake(this.atkCombo === 3 ? 7 : 4, 110); this.body.setVelocityX(-dir * 40); }
  }

  doThrow() {
    this.state = 'throw'; this.thrT = 0.2; this.thrCd = 0.42;
    this.scene.spawnShuriken(this.x + this.facing * 24, this.y - 52, this.facing);
    sfx.throw();
  }

  hurt(n, srcX, force = 1) {
    if (this.invul > 0 || this.dead) return false;
    const s = this.scene;
    this.hp -= n; this.invul = 1.1; s.events.emit('hp', this.hp);
    s.fx.burst(this.x, this.y - 44, 14, 0xff2a2a); s.hitStop(110); s.shake(9, 200); s.flash(0.22); sfx.hurt();
    if (this.hp <= 0) { this.die(); return true; }
    this.state = 'hurt'; this.hurtT = 0.32; this.atkCombo = 0;
    const d = this.x < srcX ? -1 : 1; this.body.setVelocity(d * 380 * force, -340);
    return true;
  }

  die() {
    this.state = 'dead'; this.deadT = 0; this.anims.play('ninja_dead'); this.setAlpha(1);
    const s = this.scene; sfx.die(); s.slowmo(0.3, 900); s.deaths++; s.events.emit('hp', 0);
    s.time.delayedCall(1100, () => s.respawn());
  }

  respawnAt(x, y) {
    this.state = 'idle'; this.hp = this.maxHp; this.invul = 1.5; this.body.setVelocity(0, 0); this.body.reset(x, y);
    this.atkCombo = 0; this.dashT = 0; this.setAlpha(1); this.scene.events.emit('hp', this.hp);
  }
}
