// Realm selection (floating-island map) and level selection (star grid). Bright cartoon style, built from kit.js.
import { W, H } from './view.js';
import { kButton, kIcon, kPanel, kRibbon, starRow, ctext, SANS } from './kit.js';
import { LEVEL_META, LEVEL_COUNT } from './level.js';
import { starsFor, isUnlocked, realmStars } from './progress.js';
import { sfx, toggleMute, initAudio, isMuted } from './sfx.js';
import { goImmersive } from './immersive.js';

export const REALMS = [
  { id: 'moon', name: 'Moonlit Gorge', playable: true },
  { id: 'sunset', name: 'Sunset Shrine', playable: true },
  { id: 'frost', name: 'Frost Peak', playable: false },
  { id: 'ember', name: 'Ember Crater', playable: false },
  { id: 'jade', name: 'Jade Forest', playable: false },
  { id: 'dunes', name: 'Golden Dunes', playable: false },
];
const click = () => sfx.click();

function unlock(scene) { scene.input.once('pointerdown', () => { initAudio(); if (scene.sys.game.device.input.touch) goImmersive(); }); scene.input.keyboard.once('keydown', () => initAudio()); }
function toast(scene, msg) {
  const c = scene.add.container(W / 2, H - 70).setDepth(90).setAlpha(0);
  const g = scene.add.graphics(); const t = ctext(scene, 0, 0, msg, 20, { thick: 4 }); const w = t.width + 50;
  g.fillStyle(0x0b2a5a, 0.92); g.fillRoundedRect(-w / 2, -22, w, 44, 22); g.lineStyle(3, 0xffffff, 0.85); g.strokeRoundedRect(-w / 2, -22, w, 44, 22); c.add([g, t]);
  scene.tweens.add({ targets: c, alpha: 1, y: H - 84, duration: 180, yoyo: true, hold: 1100, onComplete: () => c.destroy() });
}
function soundButton(scene, x, y, size) {
  const b = kIcon(scene, x, y, size, 'purple', isMuted() ? 'mute' : 'sound', () => { const m = toggleMute(); b.icon.setTexture(m ? 'ic_mute' : 'ic_sound'); }, 'ki', click);
  return b;
}
export function showHelp(scene) {
  const touch = scene.sys.game.device.input.touch;
  const layer = scene.add.container(0, 0).setDepth(100);
  const dim = scene.add.rectangle(0, 0, W, H, 0x021028, 0.7).setOrigin(0).setInteractive();
  const pw = Math.min(W - 80, 640), ph = Math.min(H - 60, 420);
  const panel = kPanel(scene, W / 2, H / 2, pw, ph, 'wood');
  const lines = touch
    ? ['◀ ▶   run', '⤒   jump (tap again in the air = double jump)', 'Hug a wall and jump = wall jump', '⚔   slash (tap 3x for a combo)', '≫   dash (brief invincibility)', '✦   throw a shuriken', 'Slash into an enemy attack to PARRY it']
    : ['A / D   run', 'W / Space   jump (twice = double jump, wall = wall jump)', 'J   slash (3-hit combo)    K   dash    L   shuriken', 'Slash into an enemy attack to PARRY it', 'P / Esc   pause    M   mute'];
  const txt = scene.add.text(W / 2, H / 2 + 8, lines.join('\n'), { fontFamily: SANS, fontSize: Math.round(Math.min(20, pw / 30)) + 'px', fontStyle: 'bold', color: '#3a1a08', align: 'left', lineSpacing: 12, wordWrap: { width: pw - 90 } }).setOrigin(0.5);
  const rib = kRibbon(scene, W / 2, H / 2 - ph / 2 + 6, Math.min(360, pw * 0.7), 'HOW TO PLAY', 30);
  const close = kIcon(scene, W / 2 + pw / 2 - 26, H / 2 - ph / 2 + 30, 54, 'red', 'close', () => layer.destroy(), 'ki', click);
  layer.add([dim, panel, txt, rib, close]);
}

// ============================================================ REALM MAP
export class RealmScene extends Phaser.Scene {
  constructor() { super('Realms'); }
  create() {
    this.cameras.main.fadeIn(350); unlock(this);
    this.add.image(0, 0, 'k_sky').setOrigin(0).setDepth(-10);
    this.back = this.add.tileSprite(0, H - 210, W, 220, 'k_clouds').setOrigin(0).setAlpha(0.65).setDepth(1);
    this.front = this.add.tileSprite(0, H - 150, W, 220, 'k_clouds').setOrigin(0).setDepth(40);
    const sw = Phaser.Math.Clamp(W * 0.15, 128, 188), sh = sw * 290 / 260;
    const fx = [0.12, 0.285, 0.455, 0.625, 0.795, 0.925];
    this.isl = REALMS.map((r, i) => {
      const x = W * fx[i], y = H * (i % 2 ? 0.63 : 0.40);
      const c = this.add.container(x, y).setDepth(10);
      const img = this.add.image(0, 0, 'isl_' + r.id).setOrigin(0.5, 150 / 290).setDisplaySize(sw, sh);
      if (!r.playable) img.setTint(0x7f8ea6);
      c.add(img);
      const pw = sw * 0.98, py = sh * 0.3;
      const plate = this.add.graphics(); plate.fillStyle(0x4a2610, 1); plate.fillRoundedRect(-pw / 2, py - 15, pw, 30, 10); plate.fillStyle(0xd89448, 1); plate.fillRoundedRect(-pw / 2 + 3, py - 12, pw - 6, 24, 8); plate.lineStyle(2, 0x7a4318, 1); plate.strokeRoundedRect(-pw / 2 + 3, py - 12, pw - 6, 24, 8);
      c.add(plate); c.add(ctext(this, 0, py, r.name.toUpperCase(), Math.round(sw * 0.09), { stroke: '#4a2610', thick: 3 }));
      if (r.playable) { const st = realmStars(r.id, LEVEL_COUNT); c.add(this.add.image(-34, py + 26, 'k_star').setDisplaySize(22, 22)); c.add(ctext(this, 12, py + 26, st + ' / ' + LEVEL_COUNT * 3, 17, { stroke: '#0b3a8a', thick: 3 })); }
      else { const lk = this.add.image(0, -sh * 0.06, 'ic_lock').setDisplaySize(sw * 0.34, sw * 0.34); c.add(lk); c.add(ctext(this, 0, py + 26, 'COMING SOON', 14, { stroke: '#2a3242', thick: 3 })); }
      this.tweens.add({ targets: c, y: y + 7, duration: 1700 + i * 140, yoyo: true, repeat: -1, ease: 'Sine.easeInOut', delay: i * 180 });
      const hit = this.add.zone(0, -sh * 0.12, sw * 0.9, sh * 0.8).setInteractive({ useHandCursor: true }); c.add(hit);
      hit.on('pointerover', () => this.focus(i)); hit.on('pointerup', () => this.choose(i));
      c.r = r; c.baseScale = 1; return c;
    });
    this.drawBridges(sw, sh);
    kRibbon(this, W / 2, 56, Math.min(420, W * 0.4), 'CHOOSE REALM', 34).setDepth(60);
    soundButton(this, 50, H - 50, 58).setDepth(60);
    kIcon(this, W - 50, H - 50, 58, 'green', 'help', () => showHelp(this), 'ki', click).setDepth(60);
    this.sel = REALMS.findIndex((r) => r.id === (this.registry.get('lastRealm') || 'moon')); if (this.sel < 0) this.sel = 0; this.focus(this.sel);
    const k = this.input.keyboard;
    k.on('keydown-LEFT', () => this.focus((this.sel + REALMS.length - 1) % REALMS.length)); k.on('keydown-RIGHT', () => this.focus((this.sel + 1) % REALMS.length));
    k.on('keydown-ENTER', () => this.choose(this.sel)); k.on('keydown-SPACE', () => this.choose(this.sel));
  }
  drawBridges(sw, sh) {
    const g = this.add.graphics().setDepth(5);
    for (let i = 0; i < this.isl.length - 1; i++) {
      const a = this.isl[i], b = this.isl[i + 1], ax = a.x + sw * 0.36, ay = a.y - 4, bx = b.x - sw * 0.36, by = b.y - 4, mx = (ax + bx) / 2, my = Math.max(ay, by) + 22;
      const pts = []; for (let t = 0; t <= 1.001; t += 0.05) pts.push({ x: (1 - t) * (1 - t) * ax + 2 * (1 - t) * t * mx + t * t * bx, y: (1 - t) * (1 - t) * ay + 2 * (1 - t) * t * my + t * t * by });
      g.lineStyle(3, 0x5a3a1e, 1); g.strokePoints(pts.map((p) => ({ x: p.x, y: p.y - 14 })));
      for (let k = 0; k < pts.length - 1; k++) {
        const p = pts[k], q = pts[k + 1], ang = Math.atan2(q.y - p.y, q.x - p.x);
        g.save(); g.translateCanvas(p.x, p.y); g.rotateCanvas(ang);
        g.fillStyle(0x6a3f1a, 1); g.fillRoundedRect(-1, -7, 14, 14, 3); g.fillStyle(0xc98a48, 1); g.fillRoundedRect(0, -6, 11, 12, 3); g.lineStyle(1.5, 0x3a2210, 1); g.strokeRoundedRect(0, -6, 11, 12, 3);
        g.restore();
        if (k % 3 === 1) { g.lineStyle(2, 0x5a3a1e, 1); g.lineBetween(p.x, p.y, p.x, p.y - 14); }
      }
    }
  }
  focus(i) {
    this.sel = i;
    this.isl.forEach((c, k) => { const on = k === i; c.setScale(on ? 1.08 : 1); c.setDepth(on ? 20 : 10); });
  }
  choose(i) {
    const r = REALMS[i]; click();
    if (!r.playable) { toast(this, r.name + ' is coming soon'); this.tweens.add({ targets: this.isl[i], angle: { from: -3, to: 3 }, duration: 60, yoyo: true, repeat: 3, onComplete: () => this.isl[i].setAngle(0) }); return; }
    this.registry.set('lastRealm', r.id);
    this.cameras.main.fadeOut(250); this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('Levels', { realm: r.id }));
  }
  update(t, d) { this.front.tilePositionX += d * 0.012; this.back.tilePositionX -= d * 0.006; }
}

// ============================================================ LEVEL GRID
export class LevelScene extends Phaser.Scene {
  constructor() { super('Levels'); }
  init(data) { this.realm = data.realm || 'moon'; }
  create() {
    this.cameras.main.fadeIn(300); unlock(this);
    this.add.image(0, 0, 'k_lvl_bg').setOrigin(0).setDepth(-10);
    const realm = REALMS.find((r) => r.id === this.realm) || REALMS[0];
    const pw = Math.min(W * 0.66, 820), ph = H * 0.7, cx = W / 2, cy = H * 0.5;
    kPanel(this, cx, cy, pw, ph, 'light').setDepth(1);
    kRibbon(this, cx, cy - ph / 2 + 4, Math.min(pw * 0.78, 520), realm.name.toUpperCase(), 34).setDepth(5);
    const cols = 5, ts = Math.min(92, (pw - 90) / cols - 10), gx = ts + 14, gy = ts + 46;
    const x0 = cx - gx * (cols - 1) / 2, y0 = cy - ph / 2 + 94;
    this.tiles = [];
    for (let i = 0; i < cols * 2; i++) {
      const lvl = i + 1, x = x0 + (i % cols) * gx, y = y0 + Math.floor(i / cols) * gy, real = lvl <= LEVEL_COUNT;
      const open = real && isUnlocked(this.realm, lvl), st = real ? starsFor(this.realm, lvl) : 0;
      const c = this.add.container(x, y).setDepth(3); c._s = 1;
      c.add(this.add.image(0, 0, open ? 'k_tile' : 'k_tile_lock').setDisplaySize(ts, ts));
      if (open) c.add(ctext(this, 0, -ts * 0.04, String(lvl), Math.round(ts * 0.5), { stroke: '#7c1f0a', thick: Math.round(ts * 0.1) }));
      else c.add(this.add.image(0, -ts * 0.02, 'ic_lock').setDisplaySize(ts * 0.52, ts * 0.52));
      c.add(starRow(this, 0, ts * 0.78, st, ts * 0.27));
      const z = this.add.zone(0, 0, ts, ts + 20).setInteractive({ useHandCursor: true }); c.add(z);
      z.on('pointerdown', () => c.setScale(0.93)); z.on('pointerout', () => c.setScale(1)); z.on('pointerover', () => this.hint(lvl, real, open));
      z.on('pointerup', () => { c.setScale(1); this.pick(lvl, real, open); });
      this.tiles.push({ lvl, real, open, c });
    }
    this.cap = ctext(this, cx, cy + ph / 2 - 52, '', 19, { stroke: '#0b3a8a', thick: 4 }).setDepth(4);
    const nextLvl = this.nextTodo(); this.hint(nextLvl, true, true);
    const by = cy + ph / 2 + 8, bs = 66;
    kIcon(this, cx - 150, by, bs, 'blue', 'home', () => this.leave(), 'ki', click).setDepth(6);
    soundButton(this, cx - 50, by, bs).setDepth(6);
    kIcon(this, cx + 50, by, bs, 'orange', 'help', () => showHelp(this), 'ki', click).setDepth(6);
    kIcon(this, cx + 150, by, bs, 'red', 'play', () => this.pick(nextLvl, true, true), 'ki', click).setDepth(6);
    const playable = REALMS.filter((r) => r.playable), pi = playable.findIndex((r) => r.id === this.realm);
    if (playable.length > 1) {
      kIcon(this, cx - pw / 2 - 44, cy, 62, 'red', 'left', () => this.go(playable[(pi + playable.length - 1) % playable.length].id), 'ki', click).setDepth(6);
      kIcon(this, cx + pw / 2 + 44, cy, 62, 'red', 'right', () => this.go(playable[(pi + 1) % playable.length].id), 'ki', click).setDepth(6);
    }
    this.input.keyboard.on('keydown-ESC', () => this.leave());
  }
  nextTodo() { for (let l = 1; l <= LEVEL_COUNT; l++) if (isUnlocked(this.realm, l) && starsFor(this.realm, l) === 0) return l; return 1; }
  hint(lvl, real, open) {
    if (!real) { this.cap.setText('More levels coming soon'); return; }
    const m = LEVEL_META[lvl - 1]; this.cap.setText(open ? `LEVEL ${lvl}  ·  ${m.name}\n${m.blurb}` : `LEVEL ${lvl}  ·  locked\nFinish level ${lvl - 1} first`);
  }
  pick(lvl, real, open) {
    click();
    if (!real || !open) { toast(this, real ? 'Finish the previous level first' : 'Coming soon'); const t = this.tiles[lvl - 1]; if (t) this.tweens.add({ targets: t.c, x: t.c.x + 5, duration: 50, yoyo: true, repeat: 3 }); return; }
    this.cameras.main.fadeOut(250); this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('Game', { realm: this.realm, level: lvl }));
  }
  go(realm) { this.cameras.main.fadeOut(180); this.cameras.main.once('camerafadeoutcomplete', () => this.scene.restart({ realm })); }
  leave() { this.cameras.main.fadeOut(200); this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('Realms')); }
}
