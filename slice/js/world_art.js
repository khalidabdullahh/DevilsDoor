// Procedural world art for the Sunset Shrine realm. Everything is drawn to canvas textures at boot,
// so the slice has zero binary art dependencies and loads instantly.

const TAU = Math.PI * 2;
let seed = 7;
const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };

function cv(scene, key, w, h, draw) {
  const t = scene.textures.createCanvas(key, w, h);
  draw(t.getContext('2d'), w, h);
  t.refresh();
}
function radial(c, x, y, r, stops) {
  const g = c.createRadialGradient(x, y, 0, x, y, r);
  stops.forEach(([o, col]) => g.addColorStop(o, col));
  c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2);
}
function ridge(c, W, base, spec, top, bot, depth) {
  c.beginPath(); c.moveTo(0, base + depth);
  for (let x = 0; x <= W; x += 4) { let y = base; for (const [k, a, ph] of spec) y -= a * Math.sin(TAU * k * x / W + ph); c.lineTo(x, y); }
  c.lineTo(W, base + depth); c.closePath();
  const g = c.createLinearGradient(0, base - 90, 0, base + depth); g.addColorStop(0, top); g.addColorStop(1, bot);
  c.fillStyle = g; c.fill();
}
function pine(c, x, base, h, col) {
  c.fillStyle = col;
  c.fillRect(x - 2.5, base - h * 0.2, 5, h * 0.2);
  const tiers = 4;
  for (let i = 0; i < tiers; i++) {
    const y0 = base - h * 0.15 - (i * h * 0.78) / tiers, w = (h * 0.33) * (1 - i / (tiers + 0.6)), ht = (h * 0.4);
    c.beginPath(); c.moveTo(x - w, y0); c.lineTo(x, y0 - ht); c.lineTo(x + w, y0); c.closePath(); c.fill();
  }
}
function bamboo(c, x, base, h, col) {
  c.strokeStyle = col; c.lineWidth = 4; c.lineCap = 'round';
  c.beginPath(); c.moveTo(x, base); c.quadraticCurveTo(x + h * 0.06, base - h * 0.5, x + h * 0.02, base - h); c.stroke();
  for (let i = 1; i < 5; i++) { const y = base - h * i * 0.2; c.fillRect(x - 3 + i * 0.4, y, 7, 2); }
  c.lineWidth = 2; for (let i = 0; i < 4; i++) { const y = base - h * (0.4 + i * 0.16); c.beginPath(); c.moveTo(x + 2, y); c.quadraticCurveTo(x + 18, y - 6, x + 30, y + 8); c.stroke(); }
}
function pagoda(c, x, base, s, col) {
  c.fillStyle = col;
  c.fillRect(x - 9 * s, base - 120 * s, 18 * s, 120 * s);
  for (let i = 0; i < 4; i++) {
    const y = base - 40 * s - i * 40 * s, w = (46 - i * 7) * s;
    c.beginPath(); c.moveTo(x - w, y); c.quadraticCurveTo(x - w * 0.5, y - 4 * s, x - w * 0.55, y - 16 * s); c.lineTo(x + w * 0.55, y - 16 * s); c.quadraticCurveTo(x + w * 0.5, y - 4 * s, x + w, y); c.lineTo(x + w * 0.7, y + 5 * s); c.lineTo(x - w * 0.7, y + 5 * s); c.closePath(); c.fill();
  }
  c.fillRect(x - 1.5 * s, base - 215 * s, 3 * s, 40 * s);
}

export function makeWorldArt(scene) {
  cv(scene, 'pix', 4, 4, (c) => { c.fillStyle = '#fff'; c.fillRect(0, 0, 4, 4); });

  // ---- SKY
  cv(scene, 'sky', 1280, 720, (c, W, H) => {
    const g = c.createLinearGradient(0, 0, 0, H);
    [[0, '#1a0b34'], [0.1, '#431852'], [0.2, '#8e2c58'], [0.3, '#d44c3c'], [0.4, '#f67830'], [0.48, '#ffaa52'], [0.58, '#ffd89a'], [1, '#ffd89a']].forEach(([o, col]) => g.addColorStop(o, col));
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    for (let i = 0; i < 70; i++) { c.fillStyle = `rgba(255,235,220,${0.15 + rnd() * 0.5})`; c.fillRect(rnd() * W, rnd() * H * 0.35, 1.4, 1.4); }
    radial(c, 900, 270, 480, [[0, 'rgba(255,240,190,0.95)'], [0.18, 'rgba(255,190,110,0.55)'], [0.5, 'rgba(255,120,60,0.15)'], [1, 'rgba(255,100,60,0)']]);
    c.fillStyle = '#fff6d6'; c.beginPath(); c.arc(900, 270, 70, 0, TAU); c.fill();
    for (let i = 0; i < 9; i++) {
      const y = 120 + rnd() * 330, x = rnd() * W, w = 200 + rnd() * 380;
      const lit = y > 300;
      c.fillStyle = lit ? 'rgba(255,150,80,0.30)' : 'rgba(40,10,50,0.45)';
      c.beginPath(); c.ellipse(x, y, w, 9 + rnd() * 10, 0, 0, TAU); c.fill();
      c.fillStyle = lit ? 'rgba(60,15,45,0.35)' : 'rgba(80,25,60,0.35)';
      c.beginPath(); c.ellipse(x + 30, y + 10, w * 0.7, 6, 0, 0, TAU); c.fill();
    }
  });

  // ---- MOUNTAINS (seamless)
  cv(scene, 'mtn_far', 1280, 420, (c, W) => ridge(c, W, 250, [[2, 55, 0.3], [5, 22, 1.2], [11, 8, 2.4]], '#8a3a58', '#5a2848', 300));
  cv(scene, 'mtn_mid', 1280, 420, (c, W) => ridge(c, W, 290, [[3, 42, 2], [7, 18, 0.4], [13, 7, 1]], '#5a2850', '#341638', 300));
  cv(scene, 'mtn_near', 1280, 420, (c, W) => ridge(c, W, 330, [[4, 26, 1], [9, 12, 2.5], [17, 5, 0.2]], '#321636', '#1c0c26', 300));

  // ---- FOREST / PAGODA SILHOUETTE BAND
  seed = 31;
  cv(scene, 'trees', 1280, 520, (c, W, H) => {
    const col = '#1c0e26';
    pagoda(c, 330, H, 0.9, '#1c0e26');
    pagoda(c, 1010, H, 0.62, '#1c0e26');
    c.fillStyle = col; c.strokeStyle = col;
    for (let i = 0; i < 16; i++) {
      const x = 30 + (i * (W - 60)) / 16 + rnd() * 30, h = 70 + rnd() * 110;
      if (rnd() < 0.7) pine(c, x, H, h, col); else bamboo(c, x, H, h, col);
    }
    c.fillRect(0, H - 22, W, 22);
  });

  // ---- FOG (seamless)
  seed = 5;
  cv(scene, 'fog', 1280, 260, (c, W, H) => {
    for (let i = 0; i < 14; i++) {
      const x = rnd() * W, y = 60 + rnd() * 140, rw = 160 + rnd() * 220, rh = 24 + rnd() * 40;
      for (const o of [-W, 0, W]) {
        c.save(); c.translate(x + o, y); c.scale(rw / rh, 1);
        radial(c, 0, 0, rh, [[0, 'rgba(255,170,130,0.22)'], [1, 'rgba(255,170,130,0)']]);
        c.restore();
      }
    }
  });

  // ---- FOREGROUND GRASS (seamless-ish: blades kept inside)
  seed = 77;
  cv(scene, 'fg', 1280, 190, (c, W, H) => {
    c.fillStyle = '#06030a';
    c.fillRect(0, H - 26, W, 26);
    for (let i = 0; i < 150; i++) {
      const x = rnd() * W, h = 24 + rnd() * 80, w = 3 + rnd() * 5, lean = (rnd() - 0.5) * 26;
      c.beginPath(); c.moveTo(x - w, H - 24); c.quadraticCurveTo(x + lean * 0.3, H - 24 - h * 0.6, x + lean, H - 24 - h); c.quadraticCurveTo(x + w * 0.2 + lean * 0.5, H - 24 - h * 0.5, x + w, H - 24); c.fill();
    }
  });

  // ---- GROUND TILES
  seed = 11;
  const stone = (c, w, h, y0) => {
    const g = c.createLinearGradient(0, y0, 0, y0 + h); g.addColorStop(0, '#2b1830'); g.addColorStop(1, '#150b1d');
    c.fillStyle = g; c.fillRect(0, y0, w, h);
    c.strokeStyle = 'rgba(0,0,0,0.35)'; c.lineWidth = 1.5;
    for (let i = 0; i < 3; i++) { const y = y0 + 14 + i * 20; c.beginPath(); c.moveTo(0, y); c.lineTo(w, y + (rnd() - 0.5) * 4); c.stroke(); }
    for (let i = 0; i < 2; i++) { const x = rnd() * w; c.beginPath(); c.moveTo(x, y0 + rnd() * 20); c.lineTo(x + (rnd() - 0.5) * 8, y0 + 40 + rnd() * 24); c.stroke(); }
    c.fillStyle = 'rgba(255,150,100,0.05)'; for (let i = 0; i < 6; i++) c.fillRect(rnd() * w, y0 + rnd() * h, 2, 2);
  };
  cv(scene, 'tile_fill', 64, 64, (c) => stone(c, 64, 64, 0));
  cv(scene, 'tile_top', 64, 84, (c) => {
    stone(c, 64, 64, 20);
    c.fillStyle = '#3a2038'; c.fillRect(0, 20, 64, 7);
    c.fillStyle = 'rgba(255,140,80,0.85)'; c.fillRect(0, 19, 64, 2.5);
    c.fillStyle = '#07040b';
    for (let i = 0; i < 9; i++) { const x = 3 + i * 7 + rnd() * 3, h = 8 + rnd() * 14; c.beginPath(); c.moveTo(x - 2, 21); c.lineTo(x + (rnd() - 0.5) * 6, 20 - h); c.lineTo(x + 2.5, 21); c.fill(); }
  });
  cv(scene, 'plat', 64, 30, (c) => {
    const g = c.createLinearGradient(0, 0, 0, 22); g.addColorStop(0, '#3c2030'); g.addColorStop(1, '#1b0d1b');
    c.fillStyle = g; c.fillRect(0, 2, 64, 20);
    c.fillStyle = 'rgba(255,140,80,0.85)'; c.fillRect(0, 1, 64, 2.5);
    c.strokeStyle = 'rgba(0,0,0,0.4)'; c.lineWidth = 1.4; for (const x of [16, 32, 48]) { c.beginPath(); c.moveTo(x, 4); c.lineTo(x, 22); c.stroke(); }
    c.fillStyle = '#120912'; c.fillRect(6, 22, 6, 7); c.fillRect(52, 22, 6, 7);
  });
  cv(scene, 'spike', 64, 32, (c) => {
    c.fillStyle = '#1a0e22'; c.fillRect(0, 26, 64, 6);
    for (let i = 0; i < 4; i++) {
      const x = i * 16; c.fillStyle = '#2a1a30'; c.beginPath(); c.moveTo(x + 1, 28); c.lineTo(x + 8, 2); c.lineTo(x + 15, 28); c.fill();
      c.fillStyle = '#e6dcee'; c.beginPath(); c.moveTo(x + 5.6, 11); c.lineTo(x + 8, 2); c.lineTo(x + 10.4, 11); c.fill();
    }
  });

  // ---- LANTERN CHECKPOINT
  const lantern = (key, on) => cv(scene, key, 64, 120, (c) => {
    c.fillStyle = '#0d0710'; c.fillRect(29, 50, 6, 70);
    c.fillRect(18, 112, 28, 8);
    c.beginPath(); c.moveTo(10, 34); c.lineTo(32, 14); c.lineTo(54, 34); c.lineTo(48, 38); c.lineTo(16, 38); c.closePath(); c.fill();
    c.fillRect(14, 38, 36, 34);
    c.fillStyle = on ? '#ffb347' : '#35242c'; c.fillRect(20, 44, 24, 22);
    if (on) { radial(c, 32, 55, 30, [[0, 'rgba(255,200,110,0.9)'], [1, 'rgba(255,160,60,0)']]); c.fillStyle = '#fff1c4'; c.fillRect(25, 49, 14, 12); }
    c.fillStyle = '#0d0710'; c.fillRect(31, 44, 2, 22); c.fillRect(20, 54, 24, 2);
    c.fillRect(14, 72, 36, 5);
  });
  lantern('cp_off', false); lantern('cp_on', true);

  // ---- DEVIL'S DOOR (torii) + portal glow
  cv(scene, 'door', 300, 340, (c, W, H) => {
    const red = '#4a0a12', dark = '#12060c';
    c.fillStyle = red; c.fillRect(34, 70, 28, 270); c.fillRect(238, 70, 28, 270);
    c.fillStyle = dark; c.fillRect(30, 300, 36, 40); c.fillRect(234, 300, 36, 40);
    c.fillStyle = red; c.beginPath(); c.moveTo(0, 54); c.quadraticCurveTo(150, 84, 300, 54); c.lineTo(292, 28); c.quadraticCurveTo(150, 56, 8, 28); c.closePath(); c.fill();
    c.fillStyle = dark; c.beginPath(); c.moveTo(0, 54); c.quadraticCurveTo(150, 84, 300, 54); c.lineTo(296, 46); c.quadraticCurveTo(150, 76, 4, 46); c.closePath(); c.fill();
    c.fillStyle = red; c.fillRect(54, 108, 192, 16);
    c.fillStyle = 'rgba(255,140,90,0.7)'; c.fillRect(34, 70, 3, 230); c.fillRect(238, 70, 3, 230);
  });
  cv(scene, 'portal', 190, 210, (c, W, H) => {
    radial(c, W / 2, H / 2 + 20, 120, [[0, 'rgba(255,230,190,1)'], [0.25, 'rgba(255,90,50,0.95)'], [0.7, 'rgba(140,10,40,0.6)'], [1, 'rgba(60,0,30,0)']]);
  });

  // ---- FX
  cv(scene, 'glow', 128, 128, (c) => radial(c, 64, 64, 64, [[0, 'rgba(255,255,255,1)'], [0.35, 'rgba(255,255,255,0.35)'], [1, 'rgba(255,255,255,0)']]));
  cv(scene, 'dot', 12, 12, (c) => radial(c, 6, 6, 6, [[0, '#fff'], [0.6, 'rgba(255,255,255,0.8)'], [1, 'rgba(255,255,255,0)']]));
  cv(scene, 'spark', 36, 6, (c) => { const g = c.createLinearGradient(0, 0, 36, 0); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(1, '#fff'); c.fillStyle = g; c.beginPath(); c.moveTo(0, 3); c.lineTo(36, 0.5); c.lineTo(36, 5.5); c.closePath(); c.fill(); });
  cv(scene, 'ring', 128, 128, (c) => { c.strokeStyle = '#fff'; c.lineWidth = 5; c.beginPath(); c.arc(64, 64, 58, 0, TAU); c.stroke(); });
  cv(scene, 'slashfx', 200, 200, (c) => {
    const g = c.createLinearGradient(40, 100, 190, 100); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.6, 'rgba(255,240,230,0.9)'); g.addColorStop(1, '#fff');
    c.fillStyle = g; c.beginPath(); c.arc(40, 100, 130, -1.0, 1.0); c.arc(52, 100, 108, 0.95, -0.95, true); c.closePath(); c.fill();
  });
  cv(scene, 'shuriken', 28, 28, (c) => {
    c.translate(14, 14); c.fillStyle = '#dfe5f2';
    for (let i = 0; i < 4; i++) { c.rotate(Math.PI / 2); c.beginPath(); c.moveTo(0, 0); c.lineTo(3, -4); c.lineTo(13, 0); c.lineTo(3, 4); c.closePath(); c.fill(); }
    c.fillStyle = '#c4202a'; c.beginPath(); c.arc(0, 0, 3, 0, TAU); c.fill();
  });
  cv(scene, 'arrow', 46, 8, (c) => {
    c.strokeStyle = '#efe6d6'; c.lineWidth = 2; c.beginPath(); c.moveTo(2, 4); c.lineTo(40, 4); c.stroke();
    c.fillStyle = '#efe6d6'; c.beginPath(); c.moveTo(38, 0.5); c.lineTo(46, 4); c.lineTo(38, 7.5); c.fill();
    c.fillStyle = '#c4202a'; c.beginPath(); c.moveTo(0, 0); c.lineTo(8, 4); c.lineTo(0, 8); c.lineTo(3, 4); c.fill();
  });
  cv(scene, 'fireball', 64, 64, (c) => radial(c, 32, 32, 32, [[0, '#fff6d0'], [0.3, '#ffb030'], [0.65, 'rgba(230,60,20,0.8)'], [1, 'rgba(160,20,10,0)']]));
  cv(scene, 'orb', 40, 40, (c) => { radial(c, 20, 20, 20, [[0, '#ffffff'], [0.25, '#8ff4ff'], [0.6, 'rgba(60,200,255,0.4)'], [1, 'rgba(60,200,255,0)']]); });
  cv(scene, 'vignette', 1280, 720, (c, W, H) => radial(c, W / 2, H / 2, 820, [[0, 'rgba(8,0,16,0)'], [0.6, 'rgba(8,0,16,0.03)'], [1, 'rgba(8,0,16,0.6)']]));
  cv(scene, 'warn', 64, 64, (c) => { c.fillStyle = '#ff3030'; c.shadowColor = '#ff3030'; c.shadowBlur = 8; c.beginPath(); c.moveTo(26, 6); c.lineTo(38, 6); c.lineTo(35, 40); c.lineTo(29, 40); c.closePath(); c.fill(); c.beginPath(); c.arc(32, 50, 5, 0, TAU); c.fill(); });
}
