import { W, H } from './view.js';
import { touch } from './input.js';
import { sfx, toggleMute, isMuted } from './sfx.js';
import { kButton, kIcon, kPanel, kRibbon, starRow, ctext } from './kit.js';

const SANS = '"Trebuchet MS","Segoe UI",Roboto,"Helvetica Neue",system-ui,sans-serif';
const GOLD = 0xf2b22a;

export class UIScene extends Phaser.Scene {
  constructor() { super('UI'); }

  create() {
    const g = this.scene.get('Game'); this.g = g;
    this.hp = g.player ? g.player.hp : 3; this.maxHp = g.player ? g.player.maxHp : 3; this.dispHp = this.hp; this.bossHp = null;
    this.buildHud(); this.buildPause(); this.banner(g);
    g.events.on('hp', (v) => { this.hp = v; });
    g.events.on('orbs', (n, t) => this.orbText.setText(n + ' / ' + t));
    g.events.on('boss', (b) => this.setBoss(b));
    g.events.on('win', (r) => this.showWin(r));
    this.events.once('shutdown', () => { g.events.off('hp'); g.events.off('orbs'); g.events.off('boss'); g.events.off('win'); });
    this.pauseKey = this.input.keyboard.addKey('P'); this.escKey = this.input.keyboard.addKey('ESC');
    if (this.sys.game.device.input.touch) this.buildTouch();
    else {
      const hint = this.add.text(W / 2, H - 26, 'A/D move · W/Space jump (x2) · wall-jump · J slash (x3) · K dash · L shuriken · slash into an enemy attack to PARRY', { fontFamily: SANS, fontSize: '14px', color: '#d6ecff', stroke: '#06101a', strokeThickness: 4 }).setOrigin(0.5);
      this.tweens.add({ targets: hint, alpha: 0, delay: 9000, duration: 1500 });
    }
  }

  banner(g) {
    const b = kRibbon(this, W / 2, -60, Math.min(440, W * 0.45), `LEVEL ${g.levelId}  ·  ${g.level.meta.name.toUpperCase()}`, 26).setDepth(20);
    this.tweens.add({ targets: b, y: 112, duration: 420, ease: 'Back.easeOut' });
    this.tweens.add({ targets: b, y: -80, alpha: 0, duration: 400, delay: 2300, onComplete: () => b.destroy() });
  }

  // ---------------------------------------------------------------- HUD
  buildHud() {
    const plate = this.add.graphics().setDepth(4);
    plate.fillStyle(0x040a14, 0.5); plate.fillRoundedRect(10, 10, 292, 112, 18);
    plate.lineStyle(2, 0xffffff, 0.08); plate.strokeRoundedRect(10, 10, 292, 112, 18);
    this.add.image(54, 54, 'mark').setDisplaySize(64, 64).setDepth(6);
    plate.lineStyle(4, GOLD, 1); plate.strokeCircle(54, 54, 34);
    plate.lineStyle(2, 0x000000, 0.5); plate.strokeCircle(54, 54, 37);
    this.add.text(100, 22, 'KAGE-RYU', { fontFamily: SANS, fontSize: '20px', fontStyle: 'bold', color: '#ffffff', stroke: '#06101a', strokeThickness: 4, letterSpacing: 2 }).setDepth(6);
    this.hpG = this.add.graphics().setDepth(6);
    this.add.image(112, 88, 'orb').setScale(0.55).setBlendMode('ADD').setDepth(6);
    this.orbText = this.add.text(134, 76, '0 / ' + (this.g.totalOrbs || 0), { fontFamily: SANS, fontSize: '19px', fontStyle: 'bold', color: '#d8f8ff', stroke: '#06121a', strokeThickness: 4 }).setDepth(6);
    const clk = this.add.graphics().setDepth(6); clk.lineStyle(2.5, 0xffe9bf, 1); clk.strokeCircle(112, 108, 8); clk.lineBetween(112, 108, 112, 103); clk.lineBetween(112, 108, 116, 110);
    this.timer = this.add.text(134, 98, '0:00', { fontFamily: SANS, fontSize: '17px', fontStyle: 'bold', color: '#ffe9bf', stroke: '#1a0a0a', strokeThickness: 4 }).setDepth(6);
    // pause button (top-right): glossy cartoon icon button
    kIcon(this, W - 46, 46, 54, 'orange', 'pause', () => this.togglePause(), 'ki', () => sfx.click()).setDepth(10);
    this.bossG = this.add.graphics().setDepth(10);
    this.bossName = this.add.text(W / 2, 30, '', { fontFamily: SANS, fontSize: '22px', fontStyle: 'bold', color: '#ffe6c4', stroke: '#2a0610', strokeThickness: 6, letterSpacing: 6 }).setOrigin(0.5).setVisible(false).setDepth(11);
  }
  drawHp() {
    const g = this.hpG; g.clear();
    this.dispHp += (this.hp - this.dispHp) * 0.18;
    const x = 100, y = 52, w = 190, h = 14, r = 7, p = Math.max(0, Math.min(1, this.dispHp / this.maxHp));
    g.fillStyle(0x070d18, 1); g.fillRoundedRect(x - 3, y - 3, w + 6, h + 6, r + 3);
    g.fillStyle(0x24344f, 1); g.fillRoundedRect(x, y, w, h, r);
    if (p > 0.01) {
      const fw = Math.max(r * 2, w * p), low = this.hp <= 1, pulse = low ? 0.75 + 0.25 * Math.sin(this.time.now / 120) : 1;
      g.fillStyle(low ? 0xe84a4a : 0x46e26c, pulse); g.fillRoundedRect(x, y, fw, h, r);
      g.fillStyle(0xffffff, 0.3); g.fillRoundedRect(x + 2, y + 2, fw - 4, h / 2 - 1, r / 2);
    }
    g.lineStyle(2, 0x070d18, 1); for (let i = 1; i < this.maxHp; i++) { const xx = x + w * i / this.maxHp; g.lineBetween(xx, y, xx, y + h); }
    g.lineStyle(2, GOLD, 0.95); g.strokeRoundedRect(x - 3, y - 3, w + 6, h + 6, r + 3);
  }
  setBoss(b) { this.bossHp = b; this.bossName.setVisible(!!b); if (b) this.bossName.setText(b.name); }
  drawBoss() {
    const bb = this.bossG; bb.clear(); if (!this.bossHp) return;
    const w = 520, x = (W - w) / 2, y = 52, p = Math.max(0, this.bossHp.hp / this.bossHp.max);
    bb.fillStyle(0x070d18, 0.9); bb.fillRoundedRect(x - 6, y - 6, w + 12, 26, 12);
    bb.fillStyle(0x4a0a14, 1); bb.fillRoundedRect(x, y, w, 14, 7);
    if (p > 0) { bb.fillStyle(0xe8321e, 1); bb.fillRoundedRect(x, y, Math.max(14, w * p), 14, 7); bb.fillStyle(0xffffff, 0.25); bb.fillRoundedRect(x + 2, y + 2, Math.max(10, w * p) - 4, 5, 3); }
    bb.lineStyle(2.5, GOLD, 0.95); bb.strokeRoundedRect(x - 6, y - 6, w + 12, 26, 12);
  }

  // ---------------------------------------------------------------- pause menu
  buildPause() {
    this.pauseLayer = this.add.container(0, 0).setDepth(60).setVisible(false);
    const dim = this.add.rectangle(0, 0, W, H, 0x021028, 0.72).setOrigin(0).setInteractive();
    const pw = 340, ph = Math.min(H - 50, 400), cy = H / 2 + 12;
    const panel = kPanel(this, W / 2, cy, pw, ph, 'wood');
    const rib = kRibbon(this, W / 2, cy - ph / 2 + 4, 280, 'PAUSED', 34);
    const bw = 250, bh = 54, y0 = cy - ph / 2 + 84, gap = 66, click = () => sfx.click();
    const g = this.g;
    this.btnResume = kButton(this, W / 2, y0, bw, bh, 'green', 'RESUME', () => this.togglePause(), 'play', click);
    this.btnRestart = kButton(this, W / 2, y0 + gap, bw, bh, 'orange', 'RESTART', () => { this.pauseLayer.setVisible(false); g.scene.resume(); g.scene.restart({ realm: g.realm, level: g.levelId }); }, 'refresh', click);
    this.btnLevels = kButton(this, W / 2, y0 + gap * 2, bw, bh, 'blue', 'LEVELS', () => { this.pauseLayer.setVisible(false); const realm = g.realm; g.scene.stop(); this.scene.start('Levels', { realm }); }, 'list', click);
    this.btnSound = kButton(this, W / 2, y0 + gap * 3, bw, bh, 'purple', isMuted() ? 'SOUND OFF' : 'SOUND ON', () => { const m = toggleMute(); this.btnSound.list[2].setText(m ? 'SOUND OFF' : 'SOUND ON'); this.btnSound.list[1].setTexture(m ? 'ic_mute' : 'ic_sound'); }, isMuted() ? 'mute' : 'sound', click);
    this.pauseLayer.add([dim, panel, rib, this.btnResume, this.btnRestart, this.btnLevels, this.btnSound]);
  }
  togglePause() {
    const g = this.g;
    if (g.scene.isPaused()) { g.scene.resume(); this.pauseLayer.setVisible(false); }
    else if (g.scene.isActive() && !g.won) { g.scene.pause(); this.pauseLayer.setVisible(true); }
  }

  // ---------------------------------------------------------------- win screen
  showWin(r) {
    const m = Math.floor(r.time / 60), sec = Math.floor(r.time % 60).toString().padStart(2, '0'), click = () => sfx.click();
    const layer = this.add.container(0, 0).setDepth(70);
    const dim = this.add.rectangle(0, 0, W, H, 0x021028, 0.74).setOrigin(0).setInteractive();
    const pw = Math.min(W - 140, 560), ph = Math.min(H - 40, 400), cy = H / 2 + 16;
    const panel = kPanel(this, W / 2, cy, pw, ph, 'light');
    const rib = kRibbon(this, W / 2, cy - ph / 2 + 4, Math.min(440, pw * 0.88), 'LEVEL COMPLETE', 34);
    const nm = ctext(this, W / 2, cy - ph / 2 + 74, `LEVEL ${r.level}  ·  ${r.name}`, 20, { stroke: '#0b3a8a', thick: 4 });
    const full = starRow(this, W / 2, cy - ph / 2 + 138, r.stars, 70); full.setScale(0.2).setAlpha(0);
    this.tweens.add({ targets: full, scale: 1, alpha: 1, duration: 450, ease: 'Back.easeOut', delay: 150 });
    const stat = ctext(this, W / 2, cy + 12, `TIME ${m}:${sec}      ORBS ${r.orbs}/${r.total}      DEATHS ${r.deaths}`, 19, { stroke: '#0b3a8a', thick: 4 });
    const hint = ctext(this, W / 2, cy + 44, r.stars < 3 ? '3 stars: no deaths + 70% orbs' : 'Perfect run!', 15, { stroke: '#0b3a8a', thick: 3 });
    const bw = r.next ? 158 : 190, bh = 54, by = cy + ph / 2 - 52;
    const items = [kButton(this, 0, by, bw, bh, 'blue', 'LEVELS', () => { layer.destroy(); this.g.scene.stop(); this.scene.start('Levels', { realm: r.realm }); }, 'list', click),
      kButton(this, 0, by, bw, bh, 'orange', 'REPLAY', () => this.g.scene.restart({ realm: r.realm, level: r.level }), 'refresh', click)];
    if (r.next) items.push(kButton(this, 0, by, bw, bh, 'green', 'NEXT', () => this.g.scene.restart({ realm: r.realm, level: r.next }), 'play', click));
    items.forEach((b, i) => b.setX(W / 2 + (i - (items.length - 1) / 2) * (bw + 8)));
    this.winButtons = items;
    layer.add([dim, panel, rib, nm, full, stat, hint, ...items]);
  }

  // ---------------------------------------------------------------- touch controls
  buildTouch() {
    this.input.addPointer(3);
    const defs = [
      ['left', 84, H - 76, 54, 'btn_left', 'chev'], ['right', 216, H - 76, 54, 'btn_right', 'chev'],
      ['attack', W - 104, H - 98, 60, 'btn_attack', 'ring'], ['jump', W - 236, H - 68, 46, 'btn_jump', 'ring'],
      ['dash', W - 212, H - 172, 38, 'btn_dash', 'ring', 'dashCd', 0.5], ['throw', W - 98, H - 214, 36, 'btn_shuriken', 'ring', 'thrCd', 0.42],
    ];
    this.cdG = this.add.graphics().setDepth(32);
    this.btns = defs.map(([id, x, y, r, tex, kind, cdProp, cdMax]) => {
      const sc = kind === 'chev' ? (r * 2.1) / 160 : (r / 72);
      const img = this.add.image(x, y, tex).setScale(sc).setAlpha(0.92).setDepth(30);
      return { id, x, y, r, img, sc, cdProp, cdMax, was: false };
    });
    this.jumpAt = -1e9;
  }
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
      if (on !== b.was) { b.img.setScale(b.sc * (on ? 0.9 : 1)).setAlpha(on ? 1 : 0.92); }
      b.was = on;
    }
    touch.jumpHeld = !!held.jump || now - this.jumpAt < 340;   // a quick tap still gives a proper jump
    // cooldown sweeps (dash / shuriken), like the reference's skill buttons
    const cd = this.cdG; cd.clear(); const pl = this.g.player;
    if (pl) for (const b of this.btns) {
      if (!b.cdProp) continue;
      const f = Math.max(0, Math.min(1, pl[b.cdProp] / b.cdMax)); if (f <= 0) continue;
      cd.fillStyle(0x000000, 0.55); cd.beginPath(); cd.moveTo(b.x, b.y); cd.arc(b.x, b.y, b.r * 0.9, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * f, false); cd.closePath(); cd.fillPath();
    }
  }

  update() {
    if (this.btns) this.pollTouch();
    const g = this.g; if (!g) return;
    this.drawHp(); this.drawBoss();
    const t = g.runT || 0, m = Math.floor(t / 60), s = Math.floor(t % 60).toString().padStart(2, '0'); this.timer.setText(m + ':' + s);
    if (Phaser.Input.Keyboard.JustDown(this.pauseKey) || Phaser.Input.Keyboard.JustDown(this.escKey)) this.togglePause();
  }
}
