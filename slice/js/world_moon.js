// "Moonlit Gorge" realm: cold teal night, huge moon, karst spires, bamboo + broadleaf silhouettes, rope-bridge planks.
// Everything procedural, same texture keys as the sunset realm so the rest of the game does not care which one is active.
const TAU = Math.PI * 2;
let seed = 3;
const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };

function cv(scene, key, w, h, draw) {
  if (scene.textures.exists(key)) scene.textures.remove(key);
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
  const g = c.createLinearGradient(0, base - 80, 0, base + depth); g.addColorStop(0, top); g.addColorStop(1, bot);
  c.fillStyle = g; c.fill();
}
function cloud(c, x, y, w, rgb, a) {
  const n = 6 + ((rnd() * 4) | 0);
  for (let i = 0; i < n; i++) {
    const cx = x + (rnd() - 0.5) * w, cy = y + (rnd() - 0.5) * w * 0.1, ry = w * (0.045 + rnd() * 0.04), rx = ry * (3.2 + rnd() * 2.2);
    c.save(); c.translate(cx, cy); c.scale(rx / ry, 1);
    radial(c, 0, 0, ry, [[0, `rgba(${rgb},${a})`], [1, `rgba(${rgb},0)`]]);
    c.restore();
  }
}
function spire(c, cx, base, w, h) {
  const t = base - h, hw = w / 2;
  c.beginPath(); c.moveTo(cx - hw * 1.3, base + 40);
  c.bezierCurveTo(cx - hw * 1.0, base - h * 0.3, cx - hw * 0.6, base - h * 0.7, cx - hw * 0.52, base - h * 0.9);
  c.bezierCurveTo(cx - hw * 0.5, t - 6, cx + hw * 0.1, t - 16, cx + hw * 0.42, base - h * 0.93);
  c.bezierCurveTo(cx + hw * 0.62, base - h * 0.68, cx + hw * 1.0, base - h * 0.3, cx + hw * 1.3, base + 40);
  c.closePath();
  const g = c.createLinearGradient(0, t, 0, base); g.addColorStop(0, '#88adc4'); g.addColorStop(0.6, '#547a93'); g.addColorStop(1, '#35586f');
  c.fillStyle = g; c.fill();
  c.strokeStyle = 'rgba(200,232,250,0.28)'; c.lineWidth = 2; c.stroke();
}
function broadleaf(c, x, base, h, col) {
  c.fillStyle = col; c.strokeStyle = col; c.lineCap = 'round';
  c.beginPath(); c.moveTo(x - h * 0.05, base); c.quadraticCurveTo(x - h * 0.02, base - h * 0.4, x - h * 0.03, base - h * 0.62);
  c.lineTo(x + h * 0.035, base - h * 0.62); c.quadraticCurveTo(x + h * 0.03, base - h * 0.4, x + h * 0.06, base); c.closePath(); c.fill();
  for (let i = 0; i < 4; i++) { c.lineWidth = h * 0.03; c.beginPath(); c.moveTo(x, base - h * 0.5); c.quadraticCurveTo(x + (i - 1.5) * h * 0.14, base - h * 0.62, x + (i - 1.5) * h * 0.26, base - h * (0.74 + rnd() * 0.06)); c.stroke(); }
  for (let i = 0; i < 18; i++) {
    const a = rnd() * TAU, r = rnd() * h * 0.3, rad = h * (0.08 + rnd() * 0.1);
    c.beginPath(); c.arc(x + Math.cos(a) * r * 1.35, base - h * 0.76 + Math.sin(a) * r * 0.62, rad, 0, TAU); c.fill();
  }
}
function bamboo(c, x, base, h, col) {
  c.strokeStyle = col; c.fillStyle = col; c.lineCap = 'round';
  c.lineWidth = 4.5; c.beginPath(); c.moveTo(x, base); c.quadraticCurveTo(x + h * 0.05, base - h * 0.5, x + h * 0.02, base - h); c.stroke();
  for (let i = 1; i < 7; i++) c.fillRect(x - 3.5 + i * 0.5, base - h * i * 0.14, 8, 2.4);
  c.lineWidth = 2.2;
  for (let i = 0; i < 6; i++) { const y = base - h * (0.36 + i * 0.11), d = i % 2 ? 1 : -1; c.beginPath(); c.moveTo(x + 2, y); c.quadraticCurveTo(x + d * 22, y - 8, x + d * 40, y + 10); c.stroke(); }
}
function hut(c, x, base, s, col) {
  c.fillStyle = col;
  c.fillRect(x - 46 * s, base - 70 * s, 6 * s, 70 * s); c.fillRect(x + 40 * s, base - 70 * s, 6 * s, 70 * s);
  c.beginPath(); c.moveTo(x - 78 * s, base - 62 * s); c.quadraticCurveTo(x - 30 * s, base - 78 * s, x, base - 112 * s); c.quadraticCurveTo(x + 30 * s, base - 78 * s, x + 78 * s, base - 62 * s);
  c.lineTo(x + 64 * s, base - 60 * s); c.lineTo(x - 64 * s, base - 60 * s); c.closePath(); c.fill();
  for (let i = 0; i < 12; i++) c.fillRect(x + 84 * s + i * 11 * s, base - 46 * s + (i % 2) * 3 * s, 6 * s, 46 * s);
  c.fillRect(x + 78 * s, base - 34 * s, 140 * s, 4 * s);
}

export function makeMoonArt(scene) {
  seed = 3;
  // ---- SKY (native 1440x600, never stretched, so the moon stays round)
  cv(scene, 'sky', 1440, 600, (c, W, H) => {
    const g = c.createLinearGradient(0, 0, 0, H);
    [[0, '#030814'], [0.2, '#081a31'], [0.4, '#12334e'], [0.58, '#24546d'], [0.72, '#4d889e'], [0.86, '#8fbbca'], [1, '#b8d8de']].forEach(([o, col]) => g.addColorStop(o, col));
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    for (let i = 0; i < 110; i++) { c.fillStyle = `rgba(222,240,255,${0.15 + rnd() * 0.6})`; c.fillRect(rnd() * W, rnd() * H * 0.42, 1.3, 1.3); }
    radial(c, 330, 172, 430, [[0, 'rgba(228,244,255,0.95)'], [0.14, 'rgba(178,216,240,0.55)'], [0.4, 'rgba(112,166,206,0.2)'], [1, 'rgba(70,120,170,0)']]);
    const mg = c.createRadialGradient(316, 159, 8, 330, 172, 68); mg.addColorStop(0, '#ffffff'); mg.addColorStop(0.7, '#e4f1fa'); mg.addColorStop(1, '#bcd4e6');
    c.fillStyle = mg; c.beginPath(); c.arc(330, 172, 68, 0, TAU); c.fill();
    c.fillStyle = 'rgba(150,176,200,0.3)'; for (const [dx, dy, r] of [[-20, -10, 13], [16, 18, 18], [-6, 26, 8], [24, -22, 7]]) { c.beginPath(); c.arc(330 + dx, 172 + dy, r, 0, TAU); c.fill(); }
    for (let i = 0; i < 15; i++) { const x = rnd() * W, y = 50 + rnd() * 320, w = 220 + rnd() * 420; cloud(c, x, y, w, '5,16,32', 0.5); cloud(c, x + 10, y - w * 0.03, w * 0.9, Math.hypot(x - 330, y - 172) < 520 ? '196,226,248' : '120,160,196', 0.26); }
  });

  // ---- KARST SPIRES + MISTY HILLS (seamless, 1280 wide)
  cv(scene, 'mtn_far', 1280, 420, (c, W, H) => {
    seed = 11; const sp = [];
    for (let i = 0; i < 9; i++) sp.push({ cx: (i + 0.5) * W / 9 + (rnd() - 0.5) * 70, w: 54 + rnd() * 70, h: 120 + rnd() * 110 });
    for (const s of sp) for (const o of [-W, 0, W]) spire(c, s.cx + o, 336, s.w, s.h);
    const g = c.createLinearGradient(0, 240, 0, H); g.addColorStop(0, 'rgba(130,180,200,0)'); g.addColorStop(0.55, 'rgba(130,180,200,0.6)'); g.addColorStop(1, 'rgba(140,190,205,0.95)');
    c.fillStyle = g; c.fillRect(0, 240, W, H - 240);
  });
  cv(scene, 'mtn_mid', 1280, 420, (c, W) => ridge(c, W, 300, [[3, 36, 1.4], [7, 15, 0.3], [13, 6, 2]], '#2f5a72', '#15303f', 300));
  cv(scene, 'mtn_near', 1280, 420, (c, W) => ridge(c, W, 338, [[4, 24, 2.2], [9, 10, 0.8], [17, 4, 1.5]], '#14293a', '#08121b', 300));

  // ---- SILHOUETTE BAND: bamboo, broadleaf trees, little hut + fence
  cv(scene, 'trees', 1280, 520, (c, W, H) => {
    seed = 41; const col = '#071420';
    for (const [x, h] of [[44, 300], [86, 250], [128, 330], [170, 270]]) bamboo(c, x, H, h, col);
    broadleaf(c, 650, H, 250, col); broadleaf(c, 905, H, 330, col); broadleaf(c, 1195, H, 210, col);
    hut(c, 980, H, 0.9, col);
    for (const [x, h] of [[470, 190], [560, 150], [1075, 230]]) bamboo(c, x, H, h, col);
    c.fillStyle = col; c.fillRect(0, H - 22, W, 22);
  });

  // ---- MIST (seamless)
  seed = 5;
  cv(scene, 'fog', 1280, 260, (c, W, H) => {
    for (let i = 0; i < 16; i++) {
      const x = rnd() * W, y = 60 + rnd() * 140, rw = 170 + rnd() * 240, rh = 26 + rnd() * 44;
      for (const o of [-W, 0, W]) { c.save(); c.translate(x + o, y); c.scale(rw / rh, 1); radial(c, 0, 0, rh, [[0, 'rgba(172,212,232,0.26)'], [1, 'rgba(172,212,232,0)']]); c.restore(); }
    }
  });

  // ---- FOREGROUND: dark grass + tall bamboo blades
  seed = 77;
  cv(scene, 'fg', 1280, 190, (c, W, H) => {
    c.fillStyle = '#02070e'; c.fillRect(0, H - 26, W, 26);
    for (let i = 0; i < 150; i++) {
      const x = rnd() * W, h = 24 + rnd() * 84, w = 3 + rnd() * 5, lean = (rnd() - 0.5) * 26;
      c.beginPath(); c.moveTo(x - w, H - 24); c.quadraticCurveTo(x + lean * 0.3, H - 24 - h * 0.6, x + lean, H - 24 - h); c.quadraticCurveTo(x + w * 0.2 + lean * 0.5, H - 24 - h * 0.5, x + w, H - 24); c.fill();
    }
  });

  // ---- GROUND TILES (cold stone + moonlit rim)
  seed = 11;
  const stone = (c, w, h, y0) => {
    const g = c.createLinearGradient(0, y0, 0, y0 + h); g.addColorStop(0, '#1d3850'); g.addColorStop(1, '#0a1520');
    c.fillStyle = g; c.fillRect(0, y0, w, h);
    c.strokeStyle = 'rgba(0,0,0,0.4)'; c.lineWidth = 1.5;
    for (let i = 0; i < 3; i++) { const y = y0 + 14 + i * 20; c.beginPath(); c.moveTo(0, y); c.lineTo(w, y + (rnd() - 0.5) * 4); c.stroke(); }
    for (let i = 0; i < 2; i++) { const x = rnd() * w; c.beginPath(); c.moveTo(x, y0 + rnd() * 20); c.lineTo(x + (rnd() - 0.5) * 8, y0 + 40 + rnd() * 24); c.stroke(); }
    c.fillStyle = 'rgba(150,210,255,0.06)'; for (let i = 0; i < 6; i++) c.fillRect(rnd() * w, y0 + rnd() * h, 2, 2);
  };
  cv(scene, 'tile_fill', 64, 64, (c) => stone(c, 64, 64, 0));
  cv(scene, 'tile_top', 64, 84, (c) => {
    stone(c, 64, 64, 20);
    c.fillStyle = '#2c4b66'; c.fillRect(0, 20, 64, 7);
    c.fillStyle = 'rgba(150,220,255,0.9)'; c.fillRect(0, 19, 64, 2.5);
    c.fillStyle = '#030a11';
    for (let i = 0; i < 9; i++) { const x = 3 + i * 7 + rnd() * 3, h = 8 + rnd() * 14; c.beginPath(); c.moveTo(x - 2, 21); c.lineTo(x + (rnd() - 0.5) * 6, 20 - h); c.lineTo(x + 2.5, 21); c.fill(); }
  });
  // plank bridge piece
  cv(scene, 'plat', 64, 34, (c) => {
    const g = c.createLinearGradient(0, 2, 0, 16); g.addColorStop(0, '#5a4130'); g.addColorStop(0.2, '#2e1f15'); g.addColorStop(1, '#150d09');
    c.fillStyle = g; c.fillRect(0, 2, 64, 14);
    c.fillStyle = 'rgba(150,215,255,0.85)'; c.fillRect(0, 1, 64, 2.4);
    c.strokeStyle = 'rgba(0,0,0,0.55)'; c.lineWidth = 1.5; for (const x of [15, 31, 47]) { c.beginPath(); c.moveTo(x, 3); c.lineTo(x, 16); c.stroke(); }
    c.fillStyle = '#0d0806'; for (let i = 0; i < 5; i++) { c.beginPath(); c.moveTo(i * 14 + 4, 16); c.lineTo(i * 14 + 8, 22 + (i % 2) * 5); c.lineTo(i * 14 + 11, 16); c.fill(); }
    c.strokeStyle = '#1d130c'; c.lineWidth = 2; c.beginPath(); c.moveTo(0, 16); c.quadraticCurveTo(32, 32, 64, 16); c.stroke();
    c.fillStyle = '#0d0806'; c.fillRect(5, 16, 5, 14); c.fillRect(54, 16, 5, 14);
  });
  cv(scene, 'spike', 64, 32, (c) => {
    c.fillStyle = '#0c1824'; c.fillRect(0, 26, 64, 6);
    for (let i = 0; i < 4; i++) { const x = i * 16; c.fillStyle = '#1b3044'; c.beginPath(); c.moveTo(x + 1, 28); c.lineTo(x + 8, 2); c.lineTo(x + 15, 28); c.fill(); c.fillStyle = '#e2eef8'; c.beginPath(); c.moveTo(x + 5.6, 11); c.lineTo(x + 8, 2); c.lineTo(x + 10.4, 11); c.fill(); }
  });
}
