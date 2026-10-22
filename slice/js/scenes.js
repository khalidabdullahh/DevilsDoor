import { makeWorldArt } from './world_art.js';
import { makeSheet, NINJA, NINJA_SPECS, RONIN, RONIN_SPECS, ARCHER, ARCHER_SPECS, ONI, ONI_SPECS } from './rig.js';
import { buildLevel, TILE, COLS, ROWS, G, ARENA_START, DOOR_COL } from './level.js';
import { Player } from './player.js';
import { Ronin, Archer, Oni } from './foes.js';
import { makeKeys, pressedKey, touch } from './input.js';
import { initAudio, sfx, toggleMute, setBossMode } from './sfx.js';

import { W, H, BOUNDS_H } from './view.js';
import { goImmersive } from './immersive.js';
const WORLD_W = COLS * TILE, WORLD_H = ROWS * TILE;
const R = (x, y, w, h) => new Phaser.Geom.Rectangle(x, y, w, h);
const FONT = 'Georgia, "Hiragino Mincho ProN", "Noto Serif", serif';
const SECTIONS = { start: 3, chimney: 48, spikes: 62, combat: 73, pit: 93, gauntlet: 108, boss: 121, door: 140 };

// ============================================================ BOOT
export class BootScene extends Phaser.Scene {
  constructor() { super('Boot'); }
  preload() { this.load.image('logo', '/brand/png/devils-door-logo.png'); this.load.image('mark', '/brand/png/devils-door-mark-512.png'); }
  create() {
    makeWorldArt(this);
    makeSheet(this, 'ninja', NINJA, NINJA_SPECS, 192, 192);
    makeSheet(this, 'ronin', RONIN, RONIN_SPECS, 192, 192);
    makeSheet(this, 'archer', ARCHER, ARCHER_SPECS, 192, 192);
    makeSheet(this, 'oni', ONI, ONI_SPECS, 340, 340);
    const q = new URLSearchParams(location.search);
    document.getElementById('boot')?.remove();
    this.scene.start(q.has('go') || q.has('at') ? 'Game' : 'Menu', { at: q.get('at') });
  }
}

// ============================================================ BACKGROUND
function buildBackground(scene) {
  const L = {};
  scene.add.image(0, 0, 'sky').setOrigin(0).setScrollFactor(0).setDepth(-100).setDisplaySize(W, H);
  const ts = (key, y, h, depth, a = 1) => scene.add.tileSprite(0, y, W, h, key).setOrigin(0).setScrollFactor(0).setDepth(depth).setAlpha(a);
  L.far = ts('mtn_far', 50, 420, -90); L.mid = ts('mtn_mid', 60, 420, -80); L.near = ts('mtn_near', 70, 420, -70);
  L.fill = scene.add.rectangle(0, 468, W, 500, 0x150a1e).setOrigin(0).setScrollFactor(0).setDepth(-69);
  L.trees = ts('trees', -50, 520, -60);
  L.fog = ts('fog', 330, 260, -50, 0.9);
  L.fog2 = ts('fog', 420, 260, 6, 0.5);
  L.fg = ts('fg', H - 190, 190, 30);
  return L;
}
function updateBackground(L, cam, t) {
  const k = (BOUNDS_H - H) - cam.scrollY, x = cam.scrollX;
  L.far.tilePositionX = x * 0.06; L.far.y = 50 + k * 0.1;
  L.mid.tilePositionX = x * 0.14; L.mid.y = 60 + k * 0.18;
  L.near.tilePositionX = x * 0.26; L.near.y = 70 + k * 0.3;
  L.trees.tilePositionX = x * 0.42; L.trees.y = -50 + k * 0.55;
  L.fill.y = 468 + k * 0.55;
  L.fog.tilePositionX = x * 0.5 + t * 0.012; L.fog.y = 330 + k * 0.6;
  L.fog2.tilePositionX = x * 1.1 - t * 0.02; L.fog2.y = 420 + k * 1.0;
  L.fg.tilePositionX = x * 1.35; L.fg.y = H - 190 + k;
}

// ============================================================ MENU
export class MenuScene extends Phaser.Scene {
  constructor() { super('Menu'); }
  create() {
    this.bg = buildBackground(this);
    const hero = this.add.sprite(W * 0.23, H - 62, 'ninja').setOrigin(0.5, 184 / 192).setScale(1.35).setDepth(10);
    hero.play('ninja_idle');
    this.add.image(0, 0, 'vignette').setOrigin(0).setDepth(50).setDisplaySize(W, H);
    this.add.rectangle(0, H - 62, W, 120, 0x07040b).setOrigin(0).setDepth(9);
    const logo = this.add.image(W * 0.68, H * 0.37, 'logo').setDepth(60); logo.setScale(540 / logo.width);
    this.tweens.add({ targets: logo, y: H * 0.385, duration: 2600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    this.add.text(W * 0.68, H * 0.675, 'SUNSET SHRINE  ·  VERTICAL SLICE', { fontFamily: FONT, fontSize: '20px', color: '#ffb48a', letterSpacing: 6 }).setOrigin(0.5).setDepth(60);
    const go = this.add.text(W * 0.68, H * 0.765, this.sys.game.device.input.touch ? 'TAP TO BEGIN' : 'PRESS ANY KEY', { fontFamily: FONT, fontSize: '30px', color: '#ffffff' }).setOrigin(0.5).setDepth(60);
    this.tweens.add({ targets: go, alpha: 0.25, duration: 900, yoyo: true, repeat: -1 });
    this.add.text(W * 0.68, H * 0.855, 'MOVE A/D · JUMP W/SPACE (x2, wall-jump) · SLASH J · DASH K · SHURIKEN L', { fontFamily: 'system-ui, sans-serif', fontSize: '15px', color: '#e8c4b0' }).setOrigin(0.5).setDepth(60);
    const start = () => { initAudio(); goImmersive(); this.scene.start('Game', {}); };
    this.input.keyboard.once('keydown', start); this.input.once('pointerdown', start);
    this.cameras.main.fadeIn(600);
  }
  update(t) { updateBackground(this.bg, { scrollX: t * 0.04, scrollY: BOUNDS_H - H }, t); }
}

// ============================================================ GAME
export class GameScene extends Phaser.Scene {
  constructor() { super('Game'); }

  create(data) {
    initAudio(); setBossMode(false);
    this.ts = 1; this.frozen = false; this.kills = 0; this.deaths = 0; this.orbsGot = 0; this.runT = 0; this.won = false; this.arenaLocked = false; this.doorActive = false;
    this.level = buildLevel();
    this.physics.world.gravity.y = 1800;
    this.physics.world.setBounds(0, -400, WORLD_W, WORLD_H + 800);
    this.physics.world.setBoundsCollision(true, true, false, false);
    this.cameras.main.setBounds(0, 0, WORLD_W, BOUNDS_H);

    this.bg = buildBackground(this);
    this.gfx = this.add.graphics().setDepth(45);
    this.buildFx();
    this.buildWorld();
    this.keys = makeKeys(this);
    this.foes = []; this.projectiles = this.physics.add.group({ allowGravity: false });
    this.orbs = []; this.cps = []; this.boss = null; this.door = null;
    this.spawnEntities();

    // vignette + flash overlays are drawn in the UI scene's layer via depth on this camera too
    this.add.image(0, 0, 'vignette').setOrigin(0).setScrollFactor(0).setDepth(80).setDisplaySize(W, H);
    this.flashRect = this.add.rectangle(0, 0, W, H, 0xffffff).setOrigin(0).setScrollFactor(0).setDepth(90).setAlpha(0);

    // collisions
    this.dropUntil = 0;
    this.physics.add.collider(this.player, this.solids);
    this.physics.add.collider(this.player, this.oneways, null, (pl, pf) => this.time.now > pl.dropUntil && pl.body.velocity.y >= 0 && pl.body.bottom <= pf.body.top + 20);
    for (const f of this.foes) { this.physics.add.collider(f, this.solids); this.physics.add.collider(f, this.oneways, null, (a, b) => a.body.velocity.y >= 0); }

    const cam = this.cameras.main;
    cam.startFollow(this.player, true, 0.12, 0.1); cam.setFollowOffset(0, 40); cam.setDeadzone(40, 30);
    cam.fadeIn(500);
    this.events.emit('hp', this.player.hp);

    const at = data && data.at ? SECTIONS[data.at] : null;
    if (at) { this.player.body.reset(at * TILE, (G * TILE) - 4); if (data.at === 'door') this.boss.dead = true; this.checkpoint = { x: at * TILE, y: G * TILE - 4 }; cam.centerOn(at * TILE, G * TILE - 44); for (const c of this.cps) if (c.x < at * TILE - 60) { c.on = true; c.s.setTexture('cp_on'); } }
    if (!this.scene.isActive('UI')) this.scene.launch('UI'); else this.scene.get('UI').scene.restart();
    if (this.sys.game.device.input.touch) this.input.once('pointerdown', () => goImmersive());
    window.__dd = this;
  }

  // ---------- fx
  buildFx() {
    const em = (tex, cfg, depth = 22) => this.add.particles(0, 0, tex, Object.assign({ emitting: false }, cfg)).setDepth(depth);
    this.pDust = em('dot', { lifespan: { min: 300, max: 650 }, speed: { min: 20, max: 110 }, angle: { min: 195, max: 345 }, scale: { start: 0.9, end: 0 }, alpha: { start: 0.55, end: 0 }, tint: 0xd9a98a, gravityY: -40 });
    this.pBlood = em('dot', { lifespan: { min: 350, max: 750 }, speed: { min: 80, max: 360 }, angle: { min: 0, max: 360 }, scale: { start: 1.0, end: 0.2 }, alpha: { start: 1, end: 0 }, tint: 0xc4202a, gravityY: 700 }, 24);
    this.pInk = em('dot', { lifespan: { min: 500, max: 1100 }, speed: { min: 60, max: 280 }, angle: { min: 0, max: 360 }, scale: { start: 1.6, end: 0.3 }, alpha: { start: 0.95, end: 0 }, tint: 0x0a0510, gravityY: 500 }, 23);
    this.pEmber = em('dot', { lifespan: { min: 500, max: 1100 }, speed: { min: 80, max: 380 }, angle: { min: 0, max: 360 }, scale: { start: 0.9, end: 0 }, alpha: { start: 1, end: 0 }, tint: 0xffa040, gravityY: -80, blendMode: 'ADD' }, 24);
    this.pSpark = em('spark', { lifespan: { min: 120, max: 260 }, speed: { min: 260, max: 620 }, angle: { min: 0, max: 360 }, scale: { start: 1, end: 0.2 }, alpha: { start: 1, end: 0 }, rotate: { min: 0, max: 360 }, blendMode: 'ADD' }, 26);
    // ambient drifting embers across the whole screen
    this.add.particles(0, 0, 'dot', { x: { min: 0, max: W }, y: H + 10, lifespan: 7000, speedY: { min: -70, max: -30 }, speedX: { min: -25, max: 25 }, scale: { start: 0.55, end: 0 }, alpha: { start: 0.8, end: 0 }, tint: 0xffa862, blendMode: 'ADD', frequency: 130 }).setScrollFactor(0).setDepth(28);
    const self = this;
    this.fx = {
      dust: (x, y, n = 4) => self.pDust.emitParticleAt(x, y, n),
      burst: (x, y, n, color) => ((color === 0xff2a2a || color === 0xff3a2a) ? self.pBlood : self.pEmber).emitParticleAt(x, y, n),
      ink: (x, y, n) => self.pInk.emitParticleAt(x, y, n),
      spark: (x, y, n = 6) => self.pSpark.emitParticleAt(x, y, n),
      ring: (x, y, s = 1) => { const r = self.add.image(x, y, 'ring').setScale(0.2).setBlendMode('ADD').setDepth(26).setAlpha(0.9); self.tweens.add({ targets: r, scale: s * 1.2, alpha: 0, duration: 360, onComplete: () => r.destroy() }); },
      slash: (x, y, dir, combo, enemy) => {
        const s = self.add.image(x, y, 'slashfx').setBlendMode('ADD').setDepth(27).setFlipX(dir < 0).setOrigin(0.2, 0.5);
        s.setScale(enemy ? 0.7 : 0.85); if (enemy) s.setTint(0xff4a3a);
        s.rotation = dir * (combo === 2 ? 0.5 : combo === 3 ? 0 : -0.45); if (combo === 2) s.setFlipY(true); if (combo === 3) s.setScale(1.25, 0.55);
        s.setPosition(x - dir * 18, y);
        self.tweens.add({ targets: s, alpha: 0, scaleX: s.scaleX * 1.25, duration: 170, onComplete: () => s.destroy() });
      },
      ghost: (p) => { const g = self.add.image(p.x, p.y, 'ninja', p.frame.name).setOrigin(0.5, 184 / 192).setScale(0.5).setFlipX(p.flipX).setTint(0xb02838).setAlpha(0.6).setDepth(19); self.tweens.add({ targets: g, alpha: 0, duration: 240, onComplete: () => g.destroy() }); },
      text: (x, y, str, color = '#ffffff') => { const t = self.add.text(x, y, str, { fontFamily: FONT, fontSize: '30px', color, stroke: '#1a0408', strokeThickness: 6, fontStyle: 'bold' }).setOrigin(0.5).setDepth(60); self.tweens.add({ targets: t, y: y - 50, alpha: 0, duration: 900, onComplete: () => t.destroy() }); },
    };
  }
  shake(i, ms) { this.cameras.main.shake(ms, i * 0.0011, true); }
  flash(a, color = 0xff2a2a) { this.flashRect.setFillStyle(color).setAlpha(a); this.tweens.add({ targets: this.flashRect, alpha: 0, duration: 260 }); }
  hitStop(ms) {
    if (this.frozen) return; this.frozen = true; this.physics.world.pause(); this.anims.pauseAll();
    setTimeout(() => { if (!this.sys.isActive()) return; this.frozen = false; this.physics.world.resume(); this.anims.resumeAll(); }, ms);
  }
  slowmo(f, ms) {
    const set = (v) => { this.ts = v; this.physics.world.timeScale = 1 / v; this.anims.globalTimeScale = v; this.tweens.timeScale = v; this.time.timeScale = v; };
    set(f); setTimeout(() => { if (this.sys.isActive()) set(1); }, ms);
  }

  // ---------- world
  buildWorld() {
    const g = this.level.grid;
    this.solids = this.physics.add.staticGroup(); this.oneways = this.physics.add.staticGroup(); this.hazards = [];
    for (let r = 0; r < ROWS; r++) {
      let c = 0;
      while (c < COLS) {
        if (!g[r * COLS + c]) { c++; continue; }
        const c0 = c; while (c < COLS && g[r * COLS + c]) c++;
        const w = (c - c0) * TILE;
        this.solids.create(c0 * TILE + w / 2, r * TILE + TILE / 2, 'pix').setDisplaySize(w, TILE).refreshBody().setVisible(false);
        for (let k = c0; k < c; k++) {
          const top = r === 0 || !g[(r - 1) * COLS + k];
          if (top) this.add.image(k * TILE, r * TILE - 20, 'tile_top').setOrigin(0).setDepth(10); else this.add.image(k * TILE, r * TILE, 'tile_fill').setOrigin(0).setDepth(10);
        }
      }
    }
    for (const p of this.level.oneways) {
      const x = p.c * TILE, y = p.r * TILE, w = p.w * TILE;
      this.add.tileSprite(x, y, w, 30, 'plat').setOrigin(0).setDepth(11);
      const b = this.oneways.create(x + w / 2, y + 8, 'pix').setDisplaySize(w, 16).refreshBody().setVisible(false);
      b.body.checkCollision.down = b.body.checkCollision.left = b.body.checkCollision.right = false;
    }
    for (const s of this.level.spikes) {
      this.add.image(s.c * TILE, (s.r + 1) * TILE - 32, 'spike').setOrigin(0).setDepth(12);
      this.hazards.push(R(s.c * TILE + 8, (s.r + 1) * TILE - 24, TILE - 16, 24));
    }
  }
  dropThrough(pl) {
    const fy = pl.y;
    for (const p of this.level.oneways) {
      const top = p.r * TILE + 8;
      if (pl.x > p.c * TILE && pl.x < (p.c + p.w) * TILE && fy >= top - 4 && fy <= top + 12) { pl.dropUntil = this.time.now + 260; pl.y += 6; return true; }
    }
    return false;
  }

  spawnEntities() {
    for (const e of this.level.ents) {
      const x = (e.c + 0.5) * TILE, y = e.r * TILE;
      switch (e.t) {
        case 'start': this.player = new Player(this, x, y - 4); this.checkpoint = { x, y: y - 4 }; break;
        case 'ronin': this.foes.push(new Ronin(this, x, y - 2)); break;
        case 'archer': this.foes.push(new Archer(this, x, y - 2)); break;
        case 'boss': this.boss = new Oni(this, x, y - 2); this.bossSpawn = { x, y: y - 2 }; this.foes.push(this.boss); break;
        case 'orb': { const o = this.add.image(e.c * TILE + 32, e.r * TILE + 8, 'orb').setDepth(15).setBlendMode('ADD'); this.tweens.add({ targets: o, y: o.y - 8, duration: 900 + Math.random() * 400, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' }); this.orbs.push(o); break; }
        case 'cp': { const s = this.add.image(e.c * TILE + 32, e.r * TILE, 'cp_off').setOrigin(0.5, 1).setDepth(11); this.cps.push({ s, x: s.x, y: e.r * TILE - 4, on: false }); break; }
        case 'door':
          this.portal = this.add.image(e.c * TILE, e.r * TILE - 130, 'portal').setDepth(8).setBlendMode('ADD').setAlpha(0.12).setScale(1.2);
          this.door = this.add.image(e.c * TILE, e.r * TILE, 'door').setOrigin(0.5, 1).setDepth(9); this.doorX = e.c * TILE; break;
      }
    }
    this.totalOrbs = this.orbs.length;
  }

  // ---------- projectiles
  proj(x, y, tex, kind, o = {}) {
    const p = this.projectiles.create(x, y, tex); p.body.setAllowGravity(false);
    Object.assign(p, { kind, life: 3, friendly: false, deflectable: false, dmg: 1 }, o); return p;
  }
  spawnArrow(x, y, a, sp) { const p = this.proj(x, y, 'arrow', 'arrow', { deflectable: true }); p.rotation = a; p.body.setSize(34, 8).setVelocity(Math.cos(a) * sp, Math.sin(a) * sp); p.setDepth(21); }
  spawnFire(x, y, a, sp) { const p = this.proj(x, y, 'fireball', 'fire', { deflectable: true, life: 4 }); p.setBlendMode('ADD').setDepth(21).setScale(1.3); p.body.setCircle(16).setVelocity(Math.cos(a) * sp, Math.sin(a) * sp); sfx.arrow(); }
  spawnShuriken(x, y, dir) { const p = this.proj(x, y, 'shuriken', 'shuriken', { friendly: true, life: 0.9 }); p.setDepth(21); p.body.setSize(22, 22).setVelocity(dir * 820, 0); }
  spawnWave(x, y, dir, sp) {
    const p = this.proj(x, y - 20, 'glow', 'wave', { life: 1.3, gy: y, dir, hurtOnce: false });
    p.setTint(0xff3a20).setBlendMode('ADD').setScale(1.2, 0.9).setDepth(21); p.body.setSize(60, 60).setVelocity(dir * sp, 0);
  }

  // ---------- flow
  onBossDead() {
    this.time.delayedCall(2200, () => {
      sfx.gate(); this.shake(8, 600); if (this.gate) { this.gate.destroy(); this.gate.vis?.destroy(); this.gate = null; }
      this.doorActive = true; this.tweens.add({ targets: this.portal, alpha: 0.95, scale: 1.6, duration: 1200 });
      this.fx.text(this.doorX, this.doorY ?? G * TILE - 330, "THE DEVIL'S DOOR OPENS", '#ffcf8a');
      this.add.particles(this.doorX, G * TILE - 140, 'dot', { lifespan: 1400, speed: { min: 20, max: 90 }, angle: { min: 0, max: 360 }, scale: { start: 1, end: 0 }, tint: 0xff6a40, blendMode: 'ADD', frequency: 40 }).setDepth(9);
    });
  }
  lockArena() {
    this.arenaLocked = true; sfx.gate(); this.shake(6, 300);
    const x = ARENA_START * TILE;
    this.gate = this.solids.create(x + TILE / 2, 6 * TILE, 'pix').setDisplaySize(TILE, 12 * TILE).refreshBody().setVisible(false);
    this.gate.vis = this.add.rectangle(x + TILE / 2, 6 * TILE, TILE, 12 * TILE, 0xb01030, 0.35).setDepth(14).setBlendMode('ADD');
    this.tweens.add({ targets: this.gate.vis, alpha: 0.15, duration: 400, yoyo: true, repeat: -1 });
    this.boss.wake();
  }
  respawn() {
    if (this.won) return;
    const c = this.checkpoint; this.player.respawnAt(c.x, c.y); this.cameras.main.fadeIn(350);
    if (this.arenaLocked && !this.boss.dead) {
      this.arenaLocked = false; if (this.gate) { this.gate.vis.destroy(); this.gate.destroy(); this.gate = null; }
      const b = this.boss; b.hp = b.maxHp; b.state = 'sleep'; b.phase2 = false; b.roared = false; b.body.reset(this.bossSpawn.x, this.bossSpawn.y); b.clearTint(); b.warn(false);
      setBossMode(false); this.events.emit('boss', null);
      this.projectiles.clear(true, true);
    }
  }
  win() {
    if (this.won) return; this.won = true; sfx.win(); this.player.body.setVelocity(0, 0); this.player.anims.play('ninja_idle');
    this.flash(0.7, 0xffffff); this.slowmo(0.4, 500);
    const stars = this.deaths === 0 ? 3 : this.deaths <= 2 ? 2 : 1;
    this.events.emit('win', { time: this.runT, orbs: this.orbsGot, total: this.totalOrbs, kills: this.kills, deaths: this.deaths, stars });
  }

  update(time, delta) {
    this.gfx.clear();
    if (pressedKey(this.keys.mute)) toggleMute();
    if (pressedKey(this.keys.restart) && (this.won || this.player.dead)) { this.scene.restart(); return; }
    if (this.frozen) return;
    const d = Math.min(delta, 50) * this.ts, dt = d / 1000, pl = this.player, cam = this.cameras.main;
    if (!this.won) this.runT += dt;
    pl.update(time, d, this.keys);
    for (const f of this.foes) if (f.active) f.update(time, d);
    this.foes = this.foes.filter((f) => f.active);

    // projectiles
    const pr = R(pl.body.x, pl.body.y, pl.body.width, pl.body.height);
    for (const p of this.projectiles.getChildren()) {
      if (!p.active) continue;
      p.life -= dt; if (p.life <= 0) { p.destroy(); continue; }
      if (p.kind === 'shuriken') p.rotation += 0.55;
      if (p.kind === 'wave') {
        if (Math.random() < 0.6) this.pEmber.emitParticleAt(p.x, p.gy - Math.random() * 40, 1);
        if (this.level.solidAt(p.x + p.dir * 34, p.gy - 24)) { p.destroy(); continue; }
        if (!p.hurtOnce && Phaser.Geom.Intersects.RectangleToRectangle(R(p.x - 32, p.gy - 70, 64, 70), pr) && pl.hurt(1, p.x)) p.hurtOnce = true;
        continue;
      }
      if (this.level.solidAt(p.x, p.y)) { this.fx.spark(p.x, p.y, 4); p.destroy(); continue; }
      if (p.friendly) {
        for (const f of this.foes) if (!f.dead && Phaser.Geom.Intersects.RectangleToRectangle(R(p.x - 11, p.y - 11, 22, 22), f.hurtbox())) { f.takeHit(p.dmg, Math.sign(p.body.velocity.x) || 1); this.fx.spark(p.x, p.y, 5); p.destroy(); break; }
      } else if (Phaser.Geom.Intersects.RectangleToRectangle(R(p.x - 12, p.y - 8, 24, 16), pr)) {
        if (pl.hurt(p.dmg, p.x - Math.sign(p.body.velocity.x))) { p.destroy(); }
      }
    }

    // hazards + pits
    for (const h of this.hazards) if (Phaser.Geom.Intersects.RectangleToRectangle(h, pr) && !pl.dead && pl.invul <= 0) { this.hazardRespawn(); break; }
    if (pl.y > BOUNDS_H + 120 && !pl.dead) this.hazardRespawn();

    // orbs, checkpoints, arena, door
    for (let i = this.orbs.length - 1; i >= 0; i--) { const o = this.orbs[i]; if (Math.abs(o.x - pl.x) < 46 && Math.abs(o.y - (pl.y - 44)) < 60) { this.orbsGot++; sfx.orb(); this.fx.burst(o.x, o.y, 6, 0xffa030); o.destroy(); this.orbs.splice(i, 1); this.events.emit('orbs', this.orbsGot, this.totalOrbs); } }
    for (const c of this.cps) if (!c.on && pl.x > c.x - 30 && Math.abs(pl.y - (c.y + 4)) < 140) { c.on = true; c.s.setTexture('cp_on'); this.checkpoint = { x: c.x, y: c.y }; sfx.cp(); this.fx.burst(c.x, c.y - 70, 14, 0xffa030); this.fx.text(c.x, c.y - 140, 'CHECKPOINT', '#ffd28a'); if (pl.hp < pl.maxHp) { pl.hp++; this.events.emit('hp', pl.hp); } }
    if (!this.arenaLocked && !this.boss.dead && pl.x > (ARENA_START + 2) * TILE && !pl.dead) this.lockArena();
    if (this.doorActive && !this.won && Math.abs(pl.x - this.doorX) < 70 && !pl.dead) this.win();
    if (this.portal) this.portal.rotation += 0.004;

    cam.setFollowOffset(Phaser.Math.Linear(cam.followOffset.x, -pl.facing * 90, 0.05), 40);
    updateBackground(this.bg, cam, time);
  }
  hazardRespawn() {
    const pl = this.player; if (pl.dead) return;
    const s = pl.lastSafe, hurt = pl.hurt(1, pl.x);
    if (!pl.dead) { pl.body.reset(s.x, s.y); pl.body.setVelocity(0, 0); pl.state = 'idle'; pl.invul = Math.max(pl.invul, 1.1); }
    void hurt;
  }
}

// ============================================================ UI
export class UIScene extends Phaser.Scene {
  constructor() { super('UI'); }
  create() {
    const g = this.scene.get('Game'); this.g = g;
    this.hearts = this.add.graphics().setDepth(10); this.bossBar = this.add.graphics().setDepth(10);
    this.orbIcon = this.add.image(36, 92, 'orb').setScale(0.7).setBlendMode('ADD');
    this.orbText = this.add.text(58, 80, '0 / ' + (g.totalOrbs || 0), { fontFamily: FONT, fontSize: '24px', color: '#d8f8ff', stroke: '#06121a', strokeThickness: 4 });
    this.bossName = this.add.text(W / 2, 44, '', { fontFamily: FONT, fontSize: '24px', color: '#ffd9b0', stroke: '#2a0610', strokeThickness: 6, letterSpacing: 5 }).setOrigin(0.5).setVisible(false);
    this.timer = this.add.text(W - 22, 20, '0:00', { fontFamily: FONT, fontSize: '24px', color: '#ffe8d4', stroke: '#1a0a0a', strokeThickness: 4 }).setOrigin(1, 0);
    const hint = this.add.text(W / 2, H - 28, 'A/D move · W/Space jump (x2) · wall-jump on walls · J slash (x3) · K dash · L shuriken · slash into an enemy attack to PARRY', { fontFamily: 'system-ui, sans-serif', fontSize: '14px', color: '#f2d4c0', stroke: '#14060c', strokeThickness: 3 }).setOrigin(0.5);
    this.tweens.add({ targets: hint, alpha: 0, delay: 9000, duration: 1500 });
    const home = this.add.text(W - 120, 20, '\u2302 HOME', { fontFamily: FONT, fontSize: '20px', color: '#ffe8d4', stroke: '#1a0a0a', strokeThickness: 4 }).setOrigin(1, 0).setInteractive({ useHandCursor: true }).setDepth(20);
    home.on('pointerdown', () => { try { if (window.parent !== window) window.parent.postMessage({ type: 'dd-home' }, location.origin); else location.href = '/'; } catch (e) { location.href = '/'; } });
    this.hp = g.player ? g.player.hp : 3; this.drawHearts();
    g.events.on('hp', (v) => { this.hp = v; this.drawHearts(); });
    g.events.on('orbs', (n, t) => this.orbText.setText(n + ' / ' + t));
    g.events.on('boss', (b) => this.setBoss(b));
    g.events.on('win', (r) => this.showWin(r));
    this.events.once('shutdown', () => { g.events.off('hp'); g.events.off('orbs'); g.events.off('boss'); g.events.off('win'); });
    this.bossHp = null;
    this.pauseKey = this.input.keyboard.addKey('P'); this.escKey = this.input.keyboard.addKey('ESC');
    this.pauseText = this.add.text(W / 2, H / 2, 'PAUSED', { fontFamily: FONT, fontSize: '64px', color: '#fff', stroke: '#2a0610', strokeThickness: 8 }).setOrigin(0.5).setVisible(false).setDepth(50);
    if (this.sys.game.device.input.touch) this.buildTouch();
  }
  drawHearts() {
    const h = this.hearts; h.clear();
    for (let i = 0; i < 3; i++) {
      const x = 40 + i * 46, y = 40, on = i < this.hp;
      h.fillStyle(on ? 0xd8202e : 0x2a1a22, 1); h.lineStyle(3, on ? 0xff7a6a : 0x4a2a36, 1);
      h.fillCircle(x - 8, y - 4, 10); h.fillCircle(x + 8, y - 4, 10); h.fillTriangle(x - 18, y - 1, x + 18, y - 1, x, y + 22);
      if (on) { h.fillStyle(0xffffff, 0.35); h.fillCircle(x - 11, y - 8, 3); }
    }
  }
  setBoss(b) { this.bossHp = b; this.bossName.setVisible(!!b); if (b) this.bossName.setText(b.name); }
  showWin(r) {
    const m = Math.floor(r.time / 60), s = Math.floor(r.time % 60).toString().padStart(2, '0');
    this.add.rectangle(0, 0, W, H, 0x07020c, 0.72).setOrigin(0).setDepth(40);
    this.add.text(W / 2, H * 0.22, 'THE DOOR IS OPEN', { fontFamily: FONT, fontSize: '70px', color: '#fff0dc', stroke: '#3a0814', strokeThickness: 10, fontStyle: 'bold', padding: { x: 40, y: 40 } }).setOrigin(0.5).setDepth(41).setShadow(0, 0, '#ff3a2a', 24, true, true);
    this.add.text(W / 2, H * 0.37, '★'.repeat(r.stars) + '☆'.repeat(3 - r.stars), { fontFamily: 'system-ui', fontSize: '72px', color: '#ffcc55' }).setOrigin(0.5).setDepth(41);
    this.add.text(W / 2, H * 0.52, `Time ${m}:${s}     Orbs ${r.orbs}/${r.total}     Foes ${r.kills}     Deaths ${r.deaths}`, { fontFamily: FONT, fontSize: '28px', color: '#ffe8d4' }).setOrigin(0.5).setDepth(41);
    const t = this.add.text(W / 2, H * 0.67, this.sys.game.device.input.touch ? 'TAP TO PLAY AGAIN' : 'PRESS R TO PLAY AGAIN', { fontFamily: FONT, fontSize: '28px', color: '#ffffff' }).setOrigin(0.5).setDepth(41);
    this.tweens.add({ targets: t, alpha: 0.3, duration: 800, yoyo: true, repeat: -1 });
    this.input.once('pointerdown', () => this.g.scene.restart());
  }
  update() {
    if (this.btns) this.pollTouch();
    const g = this.g; if (!g || !g.runT) return;
    const t = g.runT, m = Math.floor(t / 60), s = Math.floor(t % 60).toString().padStart(2, '0'); this.timer.setText(m + ':' + s);
    const bb = this.bossBar; bb.clear();
    if (this.bossHp) { const w = 560, x = (W - w) / 2, y = 64, p = Math.max(0, this.bossHp.hp / this.bossHp.max); bb.fillStyle(0x12060c, 0.85).fillRect(x - 4, y - 4, w + 8, 22); bb.fillStyle(0x4a0a14, 1).fillRect(x, y, w, 14); bb.fillStyle(0xe0301e, 1).fillRect(x, y, w * p, 14); bb.fillStyle(0xffffff, 0.2).fillRect(x, y, w * p, 5); }
    if (Phaser.Input.Keyboard.JustDown(this.pauseKey) || Phaser.Input.Keyboard.JustDown(this.escKey)) {
      if (g.scene.isPaused()) { g.scene.resume(); this.pauseText.setVisible(false); } else if (g.scene.isActive()) { g.scene.pause(); this.pauseText.setVisible(true); }
    }
  }
  buildTouch() {
    this.input.addPointer(3);
    const defs = [
      ['left', 112, H - 96, 58, '◀', 0xffffff], ['right', 264, H - 96, 58, '▶', 0xffffff],
      ['attack', W - 112, H - 104, 68, '⚔', 0xff6a5a], ['jump', W - 266, H - 66, 54, '⤒', 0x8fd4ff],
      ['dash', W - 258, H - 182, 44, '≫', 0xffe08a], ['throw', W - 120, H - 214, 40, '✦', 0xd0d8f0],
    ];
    this.btns = defs.map(([id, x, y, r, label, col]) => {
      const c = this.add.circle(x, y, r, col, 0.16).setStrokeStyle(3, col, 0.55).setDepth(30);
      this.add.text(x, y, label, { fontFamily: 'system-ui', fontSize: Math.round(r * 0.55) + 'px', color: '#fff' }).setOrigin(0.5).setAlpha(0.85).setDepth(31);
      return { id, x, y, r, col, c, was: false };
    });
    this.jumpAt = -1e9;
  }
  // every frame: which buttons are under which fingers (1.5x forgiving radius, thumbs may slide between buttons)
  pollTouch() {
    const held = {};
    for (const p of this.input.manager.pointers) {
      if (!p.isDown) continue;
      let best = null, bd = 1e9;
      for (const b of this.btns) { const d = Math.hypot(p.x - b.x, p.y - b.y); if (d <= b.r * 1.5 && d < bd) { best = b; bd = d; } }
      if (best) held[best.id] = true;
    }
    const now = this.time.now;
    touch.left = !!held.left; touch.right = !!held.right;
    for (const b of this.btns) {
      const on = !!held[b.id];
      if (on && !b.was) {
        if (b.id === 'jump') { touch.edge.jump = true; this.jumpAt = now; }
        else if (b.id === 'attack') touch.edge.attack = true;
        else if (b.id === 'dash') touch.edge.dash = true;
        else if (b.id === 'throw') touch.edge.throw = true;
      }
      if (on !== b.was) b.c.setFillStyle(b.col, on ? 0.42 : 0.16);
      b.was = on;
    }
    // a quick tap still gives a proper jump: treat the button as held for 340ms minimum (~full jump)
    touch.jumpHeld = !!held.jump || now - this.jumpAt < 340;
  }
}
