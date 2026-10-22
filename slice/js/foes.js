import { sfx, setBossMode } from './sfx.js';
const R = (x, y, w, h) => new Phaser.Geom.Rectangle(x, y, w, h);
const hit = Phaser.Geom.Intersects.RectangleToRectangle;

class Foe extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, key, o) {
    super(scene, x, y, key, 'idle_0');
    scene.add.existing(this); scene.physics.add.existing(this);
    this.fh = o.fh || 192; this.k = o.scale || 0.5;
    this.setOrigin(0.5, (this.fh - 8) / this.fh).setScale(this.k).setDepth(18);
    this.body.setSize(o.bw, o.bh).setOffset((this.fh * (o.fw ? o.fw / this.fh : 1) - o.bw) / 2, this.fh - 8 - o.bh).setMaxVelocity(500, 1000);
    this.key = key; this.hp = this.maxHp = o.hp; this.dead = false; this.state = 'idle'; this.t = 0; this.facing = -1; this.spawnX = x; this.stun = 0;
    this.warnIcon = scene.add.image(x, y, 'warn').setScale(0.55).setDepth(40).setVisible(false);
  }
  hurtbox() { const b = this.body; return R(b.x, b.y, b.width, b.height); }
  get pl() { return this.scene.player; }
  dx() { return this.pl.x - this.x; }
  dy() { return this.pl.y - this.y; }
  face(d) { this.facing = d >= 0 ? 1 : -1; this.setFlipX(this.facing < 0); }
  onGround() { return this.body.blocked.down || this.body.touching.down; }
  setAnim(n, dur) { const k = this.key + '_' + n; if (this.anims.currentAnim?.key !== k || !this.anims.isPlaying) this.anims.play(k, true); if (dur) this.anims.msPerFrame = (dur * 1000) / this.anims.getTotalFrames(); }
  flash() { this.setTintFill(0xffffff); this.scene.time.delayedCall(70, () => this.active && this.clearTint()); }
  warn(on) { this.warnIcon.setVisible(on); if (on) this.warnIcon.setPosition(this.x, this.y - this.k * 190); }
  takeHit(dmg, dir) {
    if (this.dead) return;
    const s = this.scene; this.hp -= dmg; this.flash(); sfx.hit();
    s.fx.burst(this.x, this.y - 40 * this.k * 2, 10, 0xff3a2a); s.fx.spark(this.x, this.y - 42, 6);
    if (this.hp <= 0) return this.die(dir);
    this.onHurt(dir);
  }
  onHurt(dir) { this.stun = 0.3; this.state = 'hurt'; this.warn(false); this.body.setVelocity(dir * 240, -180); }
  die(dir) {
    this.dead = true; this.warn(false); const s = this.scene;
    this.body.setVelocity(dir * 260, -300); this.anims.play(this.key + '_dead'); this.clearTint();
    s.fx.burst(this.x, this.y - 40, 22, 0xff2a2a); s.fx.ink(this.x, this.y - 40, 16);
    s.hitStop(120); s.slowmo(0.35, 260); s.shake(8, 160); sfx.die(); s.kills++;
    s.time.delayedCall(1600, () => { s.tweens.add({ targets: this, alpha: 0, duration: 500, onComplete: () => { this.warnIcon.destroy(); this.destroy(); } }); });
  }
  // parry: the player's slash meets our attack
  parried() {
    const s = this.scene; this.state = 'stun'; this.stun = 0.9; this.warn(false); this.clearTint();
    this.body.setVelocity(-this.facing * 320, -120);
    s.fx.spark((this.x + this.pl.x) / 2, this.pl.y - 52, 14); s.fx.ring((this.x + this.pl.x) / 2, this.pl.y - 52, 0.7); sfx.clash(); s.hitStop(120); s.shake(6, 120);
    s.fx.text(this.x, this.y - 130, 'PARRY', '#ffe28a'); this.pl.invul = Math.max(this.pl.invul, 0.3);
  }
}

export class Ronin extends Foe {
  constructor(scene, x, y) { super(scene, x, y, 'ronin', { hp: 2, bw: 56, bh: 160 }); this.dir = 1; this.hitDone = false; }
  edgeAhead(d) { const s = this.scene.level; return s.solidAt(this.x + d * 44, this.y + 8); }
  update(time, delta) {
    if (this.dead) return; const dt = delta / 1000, b = this.body; this.t += dt;
    const dx = this.dx(), ad = Math.abs(dx), near = ad < 380 && Math.abs(this.dy()) < 130 && !this.pl.dead;
    switch (this.state) {
      case 'idle': case 'patrol': {
        this.state = 'patrol';
        if (near) { this.state = 'chase'; this.t = 0; sfx.warn(); break; }
        const nd = this.dir; if (!this.edgeAhead(nd) || b.blocked.left || b.blocked.right || Math.abs(this.x - this.spawnX) > 150) this.dir *= -1;
        b.setVelocityX(this.dir * 58); this.face(this.dir); this.setAnim('walk');
        break; }
      case 'chase': {
        this.face(dx);
        if (!near && this.t > 1.2) { this.state = 'patrol'; break; }
        if (ad < 100) { this.state = 'windup'; this.t = 0; b.setVelocityX(0); this.warn(true); sfx.warn(); break; }
        if (this.edgeAhead(this.facing)) { b.setVelocityX(this.facing * 178); this.setAnim('run'); } else { b.setVelocityX(0); this.setAnim('idle'); }
        break; }
      case 'windup': {
        this.setAnim('windup'); b.setVelocityX(0); this.warn(true);
        this.setTint(Math.floor(this.t * 14) % 2 ? 0xff7766 : 0xffffff);
        if (this.t > 0.52) { this.clearTint(); this.warn(false); this.state = 'attack'; this.t = 0; this.hitDone = false; b.setVelocityX(this.facing * 280); this.setAnim('attack', 0.22); sfx.swish(2); this.scene.fx.slash(this.x + this.facing * 46, this.y - 48, this.facing, 1, true); }
        break; }
      case 'attack': {
        b.setVelocityX(b.velocity.x * 0.93);
        const rect = R(this.facing > 0 ? this.x : this.x - 96, this.y - 90, 96, 94);
        const sr = this.pl.slashRect();
        if (!this.hitDone && sr && hit(sr, rect)) { this.hitDone = true; this.parried(); break; }
        if (!this.hitDone && hit(rect, R(this.pl.body.x, this.pl.body.y, this.pl.body.width, this.pl.body.height))) { this.hitDone = true; this.pl.hurt(1, this.x); }
        if (this.t > 0.22) { this.state = 'recover'; this.t = 0; this.setAnim('idle'); }
        break; }
      case 'recover': b.setVelocityX(0); if (this.t > 0.6) { this.state = 'chase'; this.t = 0; } break;
      case 'hurt': case 'stun': this.setAnim('hurt'); this.stun -= dt; b.setVelocityX(b.velocity.x * 0.9); if (this.stun <= 0) { this.state = 'chase'; this.t = 0; this.clearTint(); } break;
    }
    if (this.state === 'stun') this.setTint(0xaab4ff); 
  }
}

export class Archer extends Foe {
  constructor(scene, x, y) { super(scene, x, y, 'archer', { hp: 1, bw: 52, bh: 156 }); this.cool = 1 + Math.random(); this.aimPt = { x: 0, y: 0 }; }
  update(time, delta) {
    if (this.dead) return; const dt = delta / 1000, b = this.body; this.t += dt; this.cool -= dt;
    const dx = this.dx(), dy = this.dy(), see = Math.abs(dx) < 640 && Math.abs(dy) < 300 && !this.pl.dead;
    b.setVelocityX(0);
    switch (this.state) {
      case 'idle': this.setAnim('idle'); if (see) this.face(dx); if (see && this.cool <= 0) { this.state = 'aim'; this.t = 0; sfx.warn(); } break;
      case 'aim': {
        this.face(dx); this.setAnim('aim', 0.85);
        if (this.t < 0.6) this.aimPt = { x: this.pl.x, y: this.pl.y - 46 };
        const g = this.scene.gfx, ox = this.x + this.facing * 30, oy = this.y - 52, a = 0.35 + 0.5 * (this.t / 0.85);
        g.lineStyle(this.t < 0.6 ? 1.5 : 3, 0xff3030, a); g.lineBetween(ox, oy, this.aimPt.x, this.aimPt.y);
        if (this.t >= 0.85) { this.fire(); this.state = 'shoot'; this.t = 0; }
        break; }
      case 'shoot': this.setAnim('shoot'); if (this.t > 0.35) { this.state = 'idle'; this.cool = 1.8 + Math.random() * 0.8; } break;
      case 'hurt': case 'stun': this.setAnim('hurt'); this.stun -= dt; if (this.stun <= 0) { this.state = 'idle'; this.cool = 0.6; this.clearTint(); } break;
    }
    if (this.state === 'stun') this.setTint(0xaab4ff);
  }
  fire() { const ox = this.x + this.facing * 30, oy = this.y - 52, a = Math.atan2(this.aimPt.y - oy, this.aimPt.x - ox); this.scene.spawnArrow(ox, oy, a, 560); sfx.arrow(); }
  parried() { this.takeHit(1, this.facing * -1); }
}

export class Oni extends Foe {
  constructor(scene, x, y) {
    super(scene, x, y, 'oni', { hp: 16, scale: 0.65, fh: 340, bw: 140, bh: 230 });
    this.setOrigin(0.5, 332 / 340); this.body.setOffset((340 - 140) / 2, 332 - 230); this.state = 'sleep'; this.name = 'ONI WARLORD';
    this.phase2 = false; this.pattern = 0; this.hitDone = false; this.impact = false; this.leapVX = 0; this.vuln = 0; this.facing = -1;
  }
  wake() { if (this.state !== 'sleep') return; this.state = 'intro'; this.t = 0; setBossMode(true); const s = this.scene; s.events.emit('boss', { name: this.name, hp: this.hp, max: this.maxHp }); }
  takeHit(dmg, dir) {
    if (this.dead || this.state === 'intro' || this.state === 'sleep') return;
    const s = this.scene; this.hp -= dmg * (this.vuln > 0 ? 1.5 : 1); this.flash(); sfx.hit();
    s.fx.burst(this.x, this.y - 110, 12, 0xff6a2a); s.fx.spark(this.x, this.y - 100, 7);
    s.events.emit('boss', { name: this.name, hp: Math.max(0, this.hp), max: this.maxHp });
    if (this.hp <= 0) return this.die(dir);
    if (!this.phase2 && this.hp <= this.maxHp * 0.5) { this.phase2 = true; this.state = 'enrage'; this.t = 0; s.shake(10, 500); sfx.roar(); this.body.setVelocityX(0); }
  }
  die() {
    this.dead = true; const s = this; const sc = this.scene; setBossMode(false);
    this.body.setVelocity(0, 0); this.body.setAllowGravity(true); this.anims.play('oni_dead'); this.clearTint(); this.warn(false);
    sc.slowmo(0.22, 1700); sc.shake(14, 900); sc.flash(0.9, 0xffffff); sfx.roar(); sc.kills++;
    for (let i = 0; i < 6; i++) sc.time.delayedCall(i * 160, () => { sc.fx.burst(this.x + (Math.random() - 0.5) * 120, this.y - 40 - Math.random() * 160, 26, 0xffa030); sc.fx.ink(this.x, this.y - 100, 8); });
    sc.events.emit('boss', null); sc.onBossDead();
  }
  pickPattern() {
    this.face(this.dx());
    const ad = Math.abs(this.dx()), r = Math.random();
    if (this.phase2 && r < 0.3) return this.go('fire');
    if (ad > 420 && r < 0.6) return this.go('leap');
    if (ad < 230) return this.go('windup');
    return this.go(r < 0.45 ? 'leap' : 'walk');
  }
  go(st) { this.state = st; this.t = 0; this.hitDone = false; this.impact = false; }
  update(time, delta) {
    if (this.dead) { this.body.setVelocityX(this.body.velocity.x * 0.9); return; }
    const dt = delta / 1000, b = this.body, sp = this.phase2 ? 1.3 : 1, ground = this.onGround(); this.t += dt; this.vuln = Math.max(0, this.vuln - dt);
    if (this.state === 'sleep') { this.setAnim('idle'); return; }
    if (this.phase2) this.setTint(0xff9a8a); else if (this.vuln > 0) this.setTint(0xffe0a0); else this.clearTint();
    switch (this.state) {
      case 'intro': this.setAnim('roar'); b.setVelocityX(0); if (this.t > 0.1 && !this.roared) { this.roared = true; sfx.roar(); this.scene.shake(8, 900); this.scene.flash(0.15, 0xff0000); } if (this.t > 1.6) this.pickPattern(); break;
      case 'enrage': this.setAnim('roar'); if (this.t > 1.1) this.pickPattern(); break;
      case 'idle': this.setAnim('idle'); if (this.t > 0.5) this.pickPattern(); break;
      case 'walk': this.face(this.dx()); this.setAnim('walk', 0.7 / sp); b.setVelocityX(this.facing * 120 * sp); if (this.t > 1.2 || Math.abs(this.dx()) < 170) this.go('windup'); break;
      case 'windup': this.face(this.dx()); this.setAnim('windup'); b.setVelocityX(0); this.warn(true); if (Math.floor(this.t * 12) % 2 === 0) this.setTint(0xff6a5a);
        if (this.t > 0.85 / sp) { this.warn(false); this.go('slam'); this.setAnim('slam', 0.3); sfx.swish(2); }
        break;
      case 'slam': {
        b.setVelocityX(0);
        if (!this.impact && this.t > 0.16) {
          this.impact = true; const s = this.scene, cx = this.x + this.facing * 150, gy = this.y;
          sfx.slam(); s.shake(14, 380); s.fx.dust(cx, gy, 16, 2.4); s.fx.ring(cx, gy - 10, 1.6); s.fx.burst(cx, gy - 10, 18, 0xffa040);
          s.spawnWave(cx, gy, 1, 430 * sp); s.spawnWave(cx, gy, -1, 430 * sp);
          if (this.phase2) { s.time.delayedCall(450, () => !this.dead && (s.spawnWave(cx, gy, 1, 340), s.spawnWave(cx, gy, -1, 340))); }
          const r = R(cx - 130, gy - 90, 260, 100); const pr = R(this.pl.body.x, this.pl.body.y, this.pl.body.width, this.pl.body.height);
          if (hit(r, pr)) this.pl.hurt(1, cx, 1.4);
        }
        if (this.t > 0.5) { this.go('recover'); this.vuln = 1.3; } break; }
      case 'recover': this.setAnim('idle'); b.setVelocityX(0); if (this.t > 1.2 / sp) this.go('idle'); break;
      case 'leap': {
        if (this.t < 0.45) { this.face(this.dx()); this.setAnim('windup'); b.setVelocityX(0); this.setTint(0xffb0a0); }
        else if (!this.impact && this.t < 0.5 + dt * 2 && ground) { this.impact = true; this.leapAir = true; const dx = this.dx(); b.setVelocity(Phaser.Math.Clamp(dx / 0.85, -520, 520), -880); sfx.roar(); this.scene.fx.dust(this.x, this.y, 10, 2); }
        else if (this.impact) { this.setAnim('leap'); if (ground && this.t > 0.7) { this.impact = false; this.scene.shake(13, 340); sfx.slam(); this.scene.fx.dust(this.x, this.y, 18, 2.6); this.scene.fx.ring(this.x, this.y - 10, 1.8);
          this.scene.spawnWave(this.x, this.y, 1, 400 * sp); this.scene.spawnWave(this.x, this.y, -1, 400 * sp);
          const r = R(this.x - 120, this.y - 100, 240, 110), pr = R(this.pl.body.x, this.pl.body.y, this.pl.body.width, this.pl.body.height); if (hit(r, pr)) this.pl.hurt(1, this.x, 1.4);
          this.go('recover'); this.vuln = 1.0; b.setVelocityX(0); } }
        break; }
      case 'fire': {
        this.face(this.dx()); this.setAnim('roar'); b.setVelocityX(0);
        if (!this.impact && this.t > 0.7) { this.impact = true; const s = this.scene, ox = this.x + this.facing * 60, oy = this.y - 170, a0 = Math.atan2(this.pl.y - 50 - oy, this.pl.x - ox); sfx.roar();
          [-0.32, 0, 0.32].forEach((o, i) => s.time.delayedCall(i * 140, () => !this.dead && s.spawnFire(ox, oy, a0 + o, 400))); }
        if (this.t > 1.5) this.go('idle'); break; }
    }
  }
}
