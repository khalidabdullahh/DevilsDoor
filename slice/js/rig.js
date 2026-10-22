// Procedural silhouette rig. Characters are drawn from joint angles (forward kinematics)
// so every animation frame is a clean dark silhouette with a warm rim light, Ninja-Arashi style.
// Angle convention: 0 = pointing straight down, +x = forward (character faces right), PI = up.

const TAU = Math.PI * 2;
export const SC = 1.85;
const BODY = '#08060c';
const BACK = '#1c1426';
const T = 21, SH = 21, AU = 17, AF = 17;

function line(c, ax, ay, bx, by, w, col) {
  c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round'; c.lineJoin = 'round';
  c.beginPath(); c.moveTo(ax, ay); c.lineTo(bx, by); c.stroke();
}
function poly(c, pts, col) {
  c.fillStyle = col; c.beginPath(); c.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]);
  c.closePath(); c.fill();
}

export function drawRig(c, p, st, fw, fh) {
  const k = (st.k || 1) * SC, w = st.w || 1, bw = st.bw || 1;
  c.save();
  c.translate(fw / 2 + (p.ox || 0), fh - 8);
  if (p.rot) c.rotate(p.rot);
  c.scale(k, k);
  const legs = p.legs, arms = p.arms;
  const hx = p.hx || 0;
  let hy = p.hipY;
  if (hy == null) {
    const d = Math.max(T * Math.cos(legs[0][0]) + SH * Math.cos(legs[0][1]), T * Math.cos(legs[1][0]) + SH * Math.cos(legs[1][1]));
    hy = -d + (p.dy || 0);
  }
  const t = p.lean || 0, tilt = p.tilt || 0;
  const fx = Math.cos(t), fy = Math.sin(t), ux = Math.sin(t), uy = -Math.cos(t);
  const pt = (a, b) => [hx + fx * a + ux * b, hy + fy * a + uy * b];
  const TH = 30 * (st.th || 1);
  const neck = pt(0, TH);
  const hc = [neck[0] + 8.5 * (st.hs || 1) * Math.sin(t + tilt), neck[1] - 8.5 * (st.hs || 1) * Math.cos(t + tilt)];
  const wind = p.wind == null ? 0.3 : p.wind, ph = p.ph || 0;

  // ---- back-mounted sword (ninja)
  if (st.backSword) {
    const a = pt(5, 3), b = pt(-13, TH + 15);
    line(c, a[0], a[1], b[0], b[1], 3.6, BACK);
    const h = pt(-11, TH + 9);
    line(c, h[0], h[1], b[0], b[1], 4.2, '#2d2238');
  }
  // sheath at waist (ronin/archer)
  if (st.sheath) {
    const a = pt(-9, 1), b = pt(17, -9);
    line(c, a[0], a[1], b[0], b[1], 3.4, BACK);
  }

  const hand = [];
  const arm = (i, col) => {
    const [a, b] = arms[i];
    const s = i ? pt(-1, TH - 4) : pt(1.5, TH - 3);
    const ex = s[0] + Math.sin(a) * AU, ey = s[1] + Math.cos(a) * AU;
    const hxn = ex + Math.sin(b) * AF, hyn = ey + Math.cos(b) * AF;
    line(c, s[0], s[1], ex, ey, 6.8 * w, col);
    line(c, ex, ey, hxn, hyn, 5.6 * w, col);
    c.fillStyle = col; c.beginPath(); c.arc(hxn, hyn, 3.4 * w, 0, TAU); c.fill();
    hand[i] = [hxn, hyn];
  };
  const leg = (i, col) => {
    const [a, b] = legs[i];
    const x0 = hx + (i ? -2 : 2);
    const kx = x0 + Math.sin(a) * T, ky = hy + Math.cos(a) * T;
    const ax = kx + Math.sin(b) * SH, ay = ky + Math.cos(b) * SH;
    line(c, x0, hy, kx, ky, 9.5 * w, col);
    line(c, kx, ky, ax, ay, 7.4 * w, col);
    line(c, ax, ay + 0.5, ax + 5.5, ay + 1, 5.2 * w, col);
  };

  arm(1, BACK);
  leg(1, BACK);

  // ---- scarf / sash tail (behind body)
  if (st.scarf) {
    const n = 8, top = [], bot = [];
    const droop = (1 - Math.min(1, wind)) * 4.5;
    for (let i = 0; i <= n; i++) {
      const s = i / n;
      const x = neck[0] - 1.5 - i * (5.2 * (0.5 + wind * 0.6));
      const y = neck[1] + 2 + i * droop + Math.sin(ph + i * 0.85) * (1.2 + 3.2 * wind) * s;
      const wd = 3.4 * (1 - s * 0.7);
      top.push([x, y - wd]); bot.push([x, y + wd]);
    }
    poly(c, top.concat(bot.reverse()), st.scarf);
  }
  // hood knot / ponytail tail
  if (st.knot) {
    const a = hc;
    poly(c, [[a[0] - 6, a[1] - 3], [a[0] - 20 - wind * 5, a[1] + 1 + Math.sin(ph) * 2 * wind + (1 - wind) * 4], [a[0] - 6, a[1] + 3]], BODY);
  }

  // ---- skirt / hakama
  if (st.skirt) {
    const sw = p.sway || 0, d = st.skirt;
    poly(c, [[hx - 7, hy - 3], [hx + 7, hy - 3], [hx + 11 + sw, hy + d], [hx - 11 + sw * 0.6, hy + d]], BODY);
  }

  // ---- torso
  {
    const b = bw;
    poly(c, [pt(-5.2 * b, -1), pt(5.2 * b, -1), pt(7.6 * b, TH * 0.82), pt(5.4 * b, TH), pt(-5.4 * b, TH), pt(-7.6 * b, TH * 0.82)], BODY);
    if (st.belt) { poly(c, [pt(-5.6 * b, 0), pt(5.6 * b, 0), pt(5.6 * b, 4.5), pt(-5.6 * b, 4.5)], st.belt); }
    if (st.belly) { const bc = pt(2, 9); c.fillStyle = BODY; c.beginPath(); c.ellipse(bc[0], bc[1], 10 * b, 9, 0, 0, TAU); c.fill(); }
  }
  leg(0, BODY);

  // ---- head
  {
    const hs = st.hs || 1, r = 8.5 * hs;
    c.fillStyle = BODY; c.beginPath(); c.arc(hc[0], hc[1], r, 0, TAU); c.fill();
    if (st.kasa) {
      const kk = st.kasa;
      poly(c, [[hc[0], hc[1] - 19 * kk], [hc[0] + 17 * kk, hc[1] - 2.5], [hc[0] + 9 * kk, hc[1] - 1.2], [hc[0] - 9 * kk, hc[1] - 1.2], [hc[0] - 17 * kk, hc[1] - 2.5]], BODY);
    }
    if (st.horns) {
      poly(c, [[hc[0] - 3, hc[1] - r + 1], [hc[0] - 9, hc[1] - r - 14], [hc[0] + 1, hc[1] - r + 2]], BODY);
      poly(c, [[hc[0] + 3, hc[1] - r + 1], [hc[0] + 11, hc[1] - r - 12], [hc[0] + 7, hc[1] - r + 3]], BODY);
      line(c, hc[0] - 9, hc[1] - r - 14, hc[0] - 2, hc[1] - r + 1, 0.8, '#c9b5a0');
      line(c, hc[0] + 11, hc[1] - r - 12, hc[0] + 6, hc[1] - r + 2, 0.8, '#c9b5a0');
    }
    // face patch + glowing eyes
    const ex = hc[0] + 3.2 * hs, ey = hc[1] + 0.2;
    c.fillStyle = '#1c1426'; c.beginPath(); c.ellipse(ex + 1.5, ey, 5.2 * hs, 2.6 * hs, 0, 0, TAU); c.fill();
    c.save(); c.shadowColor = st.eye; c.shadowBlur = 10; c.fillStyle = st.eye;
    for (const o of [0, 4.1 * hs]) {
      c.beginPath(); c.moveTo(ex + o - 1.6, ey - 0.4); c.lineTo(ex + o + 1.8, ey - 1.3); c.lineTo(ex + o + 1.4, ey + 0.8); c.closePath(); c.fill();
    }
    c.restore();
    if (st.fangs) { line(c, ex + 3, ey + 4, ex + 3.5, ey + 7, 1.2, '#ddd0bd'); line(c, ex + 7, ey + 4, ex + 7.5, ey + 7, 1.2, '#ddd0bd'); }
  }

  arm(0, BODY);

  // ---- held items
  const wa = p.wArm == null ? 0 : p.wArm;
  if (p.w != null && hand[wa]) {
    const [hx0, hy0] = hand[wa], dx = Math.sin(p.w), dy = Math.cos(p.w);
    if (st.weapon === 'club') {
      const len = 56, ex = hx0 + dx * len, ey = hy0 + dy * len, nx = -dy, ny = dx;
      const pts = [[hx0 + nx * 2.2, hy0 + ny * 2.2], [ex + nx * 8.5, ey + ny * 8.5], [ex - nx * 8.5, ey - ny * 8.5], [hx0 - nx * 2.2, hy0 - ny * 2.2]];
      poly(c, pts, BODY);
      c.strokeStyle = '#4a3555'; c.lineWidth = 1; c.beginPath(); c.moveTo(pts[0][0], pts[0][1]); c.lineTo(pts[1][0], pts[1][1]); c.lineTo(pts[2][0], pts[2][1]); c.lineTo(pts[3][0], pts[3][1]); c.stroke();
      c.fillStyle = '#6b5878';
      for (let i = 0; i < 6; i++) { const s = 0.45 + (i % 3) * 0.2, side = i < 3 ? 1 : -1; c.beginPath(); c.arc(hx0 + dx * len * s + nx * 7.5 * s * side, hy0 + dy * len * s + ny * 7.5 * s * side, 1.5, 0, TAU); c.fill(); }
    } else if (st.weapon === 'bow') {
      // bow held at hand, vertical arc, string pulled back by p.draw
      const d = p.draw || 0, bx = hx0 + 2, by = hy0;
      c.strokeStyle = '#2a2030'; c.lineWidth = 2.4; c.beginPath(); c.moveTo(bx - 3, by - 20); c.quadraticCurveTo(bx + 11, by, bx - 3, by + 20); c.stroke();
      const sx = bx - 3 - d * 17;
      c.strokeStyle = '#d8d0c8'; c.lineWidth = 0.7; c.beginPath(); c.moveTo(bx - 3, by - 20); c.lineTo(sx, by); c.lineTo(bx - 3, by + 20); c.stroke();
      if (d > 0.05) { line(c, sx, by, bx + 12, by, 1.1, '#e8e0d4'); poly(c, [[bx + 12, by - 2], [bx + 17, by], [bx + 12, by + 2]], '#e8e0d4'); }
    } else {
      // katana
      const bl = 50, sx = hx0 + dx * 5, sy = hy0 + dy * 5, tx = hx0 + dx * (5 + bl), ty = hy0 + dy * (5 + bl);
      line(c, hx0 - dx * 4, hy0 - dy * 4, sx, sy, 4.4, BODY);
      line(c, sx - dy * 3.4, sy + dx * 3.4, sx + dy * 3.4, sy - dx * 3.4, 1.8, '#6b5a40');
      c.save(); if (p.glow) { c.shadowColor = '#9db4ff'; c.shadowBlur = 8; }
      line(c, sx, sy, tx, ty, 2.5, '#eef1fa'); c.restore();
      line(c, sx + dy * 0.9, sy - dx * 0.9, tx + dy * 0.9, ty - dx * 0.9, 0.9, '#7f89a8');
    }
  }
  c.restore();
}

// ---------- sprite-sheet builder: renders every pose into one canvas texture + registers frames + animations
export function makeSheet(scene, key, st, specs, fw, fh) {
  const total = specs.reduce((s, a) => s + a.n, 0);
  const cols = Math.max(1, Math.floor(4096 / fw)), rows = Math.ceil(total / cols);
  const tex = scene.textures.createCanvas(key, cols * fw, rows * fh);
  const ctx = tex.getContext();
  const A = document.createElement('canvas'); A.width = fw; A.height = fh;
  const B = document.createElement('canvas'); B.width = fw; B.height = fh;
  const a = A.getContext('2d'), b = B.getContext('2d');
  let idx = 0;
  for (const sp of specs) {
    const names = [];
    for (let i = 0; i < sp.n; i++) {
      const x = (idx % cols) * fw, y = Math.floor(idx / cols) * fh;
      a.clearRect(0, 0, fw, fh);
      drawRig(a, sp.pose(i, sp.n), st, fw, fh);
      b.globalCompositeOperation = 'source-over'; b.clearRect(0, 0, fw, fh); b.drawImage(A, 0, 0);
      b.globalCompositeOperation = 'source-in'; b.fillStyle = st.rim || 'rgba(255,150,80,0.9)'; b.fillRect(0, 0, fw, fh);
      ctx.drawImage(B, x + 3, y - 2.5);
      ctx.drawImage(A, x, y);
      const name = sp.name + '_' + i;
      tex.add(name, 0, x, y, fw, fh);
      names.push(name);
      idx++;
    }
    if (!scene.anims.exists(key + '_' + sp.name)) {
      scene.anims.create({ key: key + '_' + sp.name, frames: names.map((n) => ({ key, frame: n })), frameRate: sp.fps || 10, repeat: sp.loop ? -1 : 0 });
    }
  }
  tex.refresh();
  return tex;
}

// ---------- pose helpers
const mk = (o) => Object.assign({ lean: 0, legs: [[0.2, 0.1], [-0.2, -0.1]], arms: [[0.3, 0.7], [-0.1, 0.3]], wind: 0.3 }, o);
const runLegs = (ph, amp) => {
  const f = (x) => [amp * Math.sin(x), amp * Math.sin(x) - (0.25 + 1.25 * Math.max(0, Math.cos(x)))];
  return [f(ph), f(ph + Math.PI)];
};

export const NINJA = { k: 1, w: 1.12, eye: '#ff2a2a', scarf: '#c4202a', knot: true, backSword: true, belt: '#6e1420', hs: 1 };
export const NINJA_SPECS = [
  { name: 'idle', n: 4, fps: 6, loop: true, pose: (i, n) => { const b = Math.sin(i / n * TAU); return mk({ lean: 0.1 + 0.02 * b, dy: 0.6 * b, ph: i, legs: [[0.28, 0.1], [-0.32, -0.12]], arms: [[0.45, 1.0 + 0.1 * b], [-0.15, 0.35]], wind: 0.12 + 0.1 * b }); } },
  { name: 'run', n: 8, fps: 16, loop: true, pose: (i, n) => { const ph = i / n * TAU; return mk({ lean: 0.46, ph: ph * 2, legs: runLegs(ph, 0.75), arms: [[-1.15 + 0.15 * Math.sin(ph), -1.4], [-0.95 + 0.15 * Math.sin(ph + Math.PI), -1.25]], wind: 1.3 }); } },
  { name: 'jump', n: 1, fps: 1, pose: () => mk({ lean: 0.1, legs: [[1.0, -0.35], [-0.35, -1.2]], arms: [[2.3, 2.7], [-2.4, -2.7]], hipY: -40, wind: 0.8 }) },
  { name: 'fall', n: 1, fps: 1, pose: () => mk({ lean: 0.02, legs: [[0.55, 0.4], [-0.4, -0.55]], arms: [[1.7, 1.9], [-1.5, -1.7]], hipY: -42, wind: 1.1, ph: 1 }) },
  { name: 'wall', n: 1, fps: 1, pose: () => mk({ lean: -0.02, legs: [[0.75, -0.1], [0.25, -0.95]], arms: [[2.75, 2.95], [0.6, 1.4]], hipY: -38, wind: 0.2 }) },
  { name: 'dash', n: 1, fps: 1, pose: () => mk({ lean: 1.3, legs: [[-0.9, -1.1], [-1.25, -1.4]], arms: [[-1.5, -1.6], [-1.35, -1.5]], hipY: -34, wind: 1.6, hx: -4 }) },
  { name: 'slash1', n: 4, fps: 22, pose: (i) => [
      mk({ lean: -0.12, legs: [[0.5, 0.3], [-0.55, -0.6]], arms: [[-2.7, -2.5], [-0.3, 0.2]], w: -2.5, glow: 1 }),
      mk({ lean: 0.05, legs: [[0.55, 0.3], [-0.55, -0.6]], arms: [[2.9, 2.8], [-0.3, 0.3]], w: 2.7, glow: 1 }),
      mk({ lean: 0.38, legs: [[0.95, 0.55], [-0.75, -0.9]], arms: [[1.5, 1.45], [-0.5, -0.2]], w: 1.4, glow: 1, wind: 1 }),
      mk({ lean: 0.32, legs: [[0.9, 0.5], [-0.7, -0.85]], arms: [[1.2, 0.95], [-0.5, -0.2]], w: 0.95, wind: 0.9 })][i] },
  { name: 'slash2', n: 4, fps: 22, pose: (i) => [
      mk({ lean: 0.28, legs: [[0.85, 0.5], [-0.7, -0.8]], arms: [[1.0, 0.6], [-0.5, -0.1]], w: 0.3, glow: 1 }),
      mk({ lean: 0.35, legs: [[1.0, 0.6], [-0.8, -0.95]], arms: [[1.5, 1.3], [-0.5, -0.2]], w: 1.2, glow: 1 }),
      mk({ lean: 0.2, legs: [[0.9, 0.5], [-0.75, -0.9]], arms: [[2.3, 2.2], [-0.4, 0.1]], w: 2.2, glow: 1, wind: 1 }),
      mk({ lean: 0.08, legs: [[0.7, 0.4], [-0.6, -0.7]], arms: [[2.8, 2.7], [-0.3, 0.2]], w: 2.7, wind: 0.8 })][i] },
  { name: 'slash3', n: 4, fps: 20, pose: (i) => [
      mk({ lean: -0.15, legs: [[0.4, 0.2], [-0.6, -0.65]], arms: [[1.2, 1.9], [-0.8, -0.3]], w: 1.57, hx: -3 }),
      mk({ lean: 0.5, legs: [[1.15, 0.8], [-0.85, -1.0]], arms: [[1.55, 1.57], [-0.2, 0.3]], w: 1.57, glow: 1, wind: 1.3, hx: 4 }),
      mk({ lean: 0.55, legs: [[1.2, 0.85], [-0.9, -1.05]], arms: [[1.55, 1.57], [-0.2, 0.3]], w: 1.57, glow: 1, wind: 1.3, hx: 6 }),
      mk({ lean: 0.3, legs: [[0.8, 0.5], [-0.6, -0.7]], arms: [[1.2, 1.2], [-0.4, 0.0]], w: 1.2, hx: 3 })][i] },
  { name: 'throw', n: 3, fps: 22, pose: (i) => [
      mk({ lean: -0.1, arms: [[-2.3, -2.0], [-0.3, 0.3]], legs: [[0.4, 0.2], [-0.45, -0.5]] }),
      mk({ lean: 0.15, arms: [[2.0, 1.7], [-0.3, 0.3]], legs: [[0.55, 0.3], [-0.5, -0.55]] }),
      mk({ lean: 0.2, arms: [[1.6, 1.55], [-0.3, 0.3]], legs: [[0.6, 0.35], [-0.5, -0.55]] })][i] },
  { name: 'hurt', n: 1, fps: 1, pose: () => mk({ lean: -0.45, tilt: -0.2, legs: [[0.6, 0.3], [-0.25, -0.7]], arms: [[2.2, 2.4], [-1.9, -2.1]], hipY: -38, wind: 0.8 }) },
  { name: 'dead', n: 3, fps: 9, pose: (i) => mk({ lean: -0.4 - i * 0.1, rot: -[0.5, 1.1, 1.5][i], ox: [10, 45, 80][i], legs: [[0.4, 0.2], [-0.2, -0.5]], arms: [[2.0, 2.2], [-1.8, -2.0]], hipY: -34 + i * 4, wind: 0.2, ph: i }) },
];

export const RONIN = { k: 1.02, eye: '#ff4a2a', kasa: 1, sheath: true, skirt: 24, hs: 1.02, weapon: 'katana', belt: '#3a1a22', bw: 1.05 };
const ronLegs = (ph, amp) => runLegs(ph, amp);
export const RONIN_SPECS = [
  { name: 'idle', n: 2, fps: 3, loop: true, pose: (i) => mk({ lean: 0.04 + i * 0.02, dy: i * 0.8, legs: [[0.2, 0.05], [-0.22, -0.08]], arms: [[0.35, 0.55], [-0.1, 0.2]], sway: i, wind: 0 }) },
  { name: 'walk', n: 6, fps: 8, loop: true, pose: (i, n) => { const ph = i / n * TAU; return mk({ lean: 0.1, legs: ronLegs(ph, 0.5), arms: [[0.45, 0.65], [-0.25, 0.15]], sway: Math.sin(ph) * 3, wind: 0 }); } },
  { name: 'run', n: 6, fps: 13, loop: true, pose: (i, n) => { const ph = i / n * TAU; return mk({ lean: 0.3, legs: ronLegs(ph, 0.72), arms: [[0.5, 0.9], [-0.6, -0.2]], sway: -Math.sin(ph) * 5, wind: 0.8 }); } },
  { name: 'windup', n: 1, fps: 1, pose: () => mk({ lean: -0.2, legs: [[0.45, 0.2], [-0.5, -0.5]], arms: [[2.9, 2.85], [2.2, 2.5]], w: 2.85, wArm: 0, sway: 3 }) },
  { name: 'attack', n: 3, fps: 18, pose: (i) => [
      mk({ lean: 0.1, legs: [[0.6, 0.3], [-0.5, -0.55]], arms: [[2.4, 2.3], [2.0, 2.2]], w: 2.3 }),
      mk({ lean: 0.42, legs: [[1.0, 0.6], [-0.8, -0.95]], arms: [[1.4, 1.3], [1.2, 1.3]], w: 1.3, sway: -6 }),
      mk({ lean: 0.4, legs: [[1.0, 0.6], [-0.8, -0.95]], arms: [[0.9, 0.8], [0.8, 0.8]], w: 0.8, sway: -6 })][i] },
  { name: 'hurt', n: 1, fps: 1, pose: () => mk({ lean: -0.4, legs: [[0.5, 0.3], [-0.25, -0.65]], arms: [[2.0, 2.3], [-1.7, -2.0]], hipY: -38, sway: 4 }) },
  { name: 'dead', n: 3, fps: 8, pose: (i) => mk({ lean: -0.4, rot: -[0.5, 1.1, 1.5][i], ox: [10, 45, 80][i], legs: [[0.4, 0.2], [-0.2, -0.5]], arms: [[2.0, 2.2], [-1.8, -2.0]], hipY: -34 + i * 4, sway: 3 }) },
];

export const ARCHER = { k: 0.98, eye: '#ff5a2a', kasa: 0.8, skirt: 22, hs: 1, weapon: 'bow', belt: '#3a2a1a' };
export const ARCHER_SPECS = [
  { name: 'idle', n: 2, fps: 3, loop: true, pose: (i) => mk({ lean: 0.05, dy: i * 0.7, legs: [[0.25, 0.1], [-0.3, -0.12]], arms: [[1.57, 1.57], [0.4, 0.8]], w: 1.57, wArm: 0, draw: 0, wind: 0 }) },
  { name: 'aim', n: 3, fps: 4, pose: (i) => mk({ lean: 0.06, legs: [[0.35, 0.15], [-0.4, -0.2]], arms: [[1.57, 1.57], [1.2 - i * 0.1, 2.5 + i * 0.1]], w: 1.57, wArm: 0, draw: 0.4 + i * 0.3, wind: 0 }) },
  { name: 'shoot', n: 1, fps: 1, pose: () => mk({ lean: 0.0, legs: [[0.35, 0.15], [-0.4, -0.2]], arms: [[1.57, 1.57], [0.9, 1.0]], w: 1.57, wArm: 0, draw: 0, wind: 0 }) },
  { name: 'hurt', n: 1, fps: 1, pose: () => mk({ lean: -0.4, legs: [[0.5, 0.3], [-0.25, -0.65]], arms: [[2.0, 2.3], [-1.7, -2.0]], hipY: -38 }) },
  { name: 'dead', n: 3, fps: 8, pose: (i) => mk({ lean: -0.4, rot: -[0.5, 1.1, 1.5][i], ox: [10, 45, 80][i], legs: [[0.4, 0.2], [-0.2, -0.5]], arms: [[2.0, 2.2], [-1.8, -2.0]], hipY: -34 + i * 4 }) },
];

export const ONI = { k: 1.75, eye: '#ffb020', horns: true, fangs: true, belly: true, skirt: 22, hs: 1.25, bw: 1.55, w: 1.5, th: 0.95, weapon: 'club', belt: '#5a1010', rim: 'rgba(255,110,60,0.95)' };
export const ONI_SPECS = [
  { name: 'idle', n: 4, fps: 5, loop: true, pose: (i, n) => { const b = Math.sin(i / n * TAU); return mk({ lean: 0.12, dy: b * 0.8, legs: [[0.3, 0.1], [-0.35, -0.12]], arms: [[0.8, 0.7 + 0.1 * b], [-0.4, 0.1]], w: 0.5, wArm: 0, sway: b * 2 }); } },
  { name: 'walk', n: 6, fps: 7, loop: true, pose: (i, n) => { const ph = i / n * TAU; return mk({ lean: 0.18, legs: runLegs(ph, 0.55), arms: [[0.7, 0.6], [-0.3, 0.1]], w: 0.55, wArm: 0, sway: Math.sin(ph) * 3 }); } },
  { name: 'windup', n: 1, fps: 1, pose: () => mk({ lean: -0.3, legs: [[0.5, 0.25], [-0.55, -0.6]], arms: [[2.9, 3.0], [2.4, 2.7]], w: 3.0, wArm: 0, sway: 3 }) },
  { name: 'slam', n: 3, fps: 14, pose: (i) => [
      mk({ lean: 0.2, legs: [[0.7, 0.4], [-0.6, -0.7]], arms: [[2.0, 1.9], [1.7, 1.8]], w: 1.9, wArm: 0 }),
      mk({ lean: 0.55, legs: [[0.9, 0.5], [-0.75, -0.85]], arms: [[0.9, 0.5], [0.8, 0.5]], w: 0.5, wArm: 0 }),
      mk({ lean: 0.6, legs: [[0.9, 0.5], [-0.75, -0.85]], arms: [[0.7, 0.3], [0.6, 0.3]], w: 0.3, wArm: 0 })][i] },
  { name: 'leap', n: 1, fps: 1, pose: () => mk({ lean: 0.15, legs: [[1.0, -0.4], [-0.3, -1.1]], arms: [[2.6, 2.8], [2.3, 2.6]], w: 2.8, wArm: 0, hipY: -40 }) },
  { name: 'hurt', n: 1, fps: 1, pose: () => mk({ lean: -0.35, legs: [[0.5, 0.3], [-0.3, -0.6]], arms: [[1.0, 0.9], [-1.0, -0.8]], w: 0.9, wArm: 0, hipY: -40 }) },
  { name: 'roar', n: 1, fps: 1, pose: () => mk({ lean: -0.25, tilt: -0.3, legs: [[0.5, 0.25], [-0.5, -0.55]], arms: [[2.6, 2.7], [-2.5, -2.7]], w: 2.7, wArm: 0 }) },
  { name: 'dead', n: 3, fps: 6, pose: (i) => mk({ lean: -0.3, rot: -[0.4, 0.9, 1.45][i], ox: [20, 80, 150][i], legs: [[0.4, 0.2], [-0.3, -0.5]], arms: [[1.5, 1.5], [-1.5, -1.7]], w: 1.0, wArm: 0, hipY: -36 + i * 4 }) },
];
