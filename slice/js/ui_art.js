// Procedural touch-UI art: glossy ringed buttons (attack / jump / dash / shuriken) and gold chevrons.
// 160x160 textures; the UI scene scales them to the wanted radius.
const TAU = Math.PI * 2;

function cvs(scene, key, draw) {
  const t = scene.textures.createCanvas(key, 160, 160);
  draw(t.getContext('2d'));
  t.refresh();
}
function base(c, rimA, rimB, inner, glow) {
  c.save(); c.shadowColor = glow; c.shadowBlur = 16; c.fillStyle = rimB; c.beginPath(); c.arc(80, 80, 70, 0, TAU); c.fill(); c.restore();
  const g = c.createLinearGradient(0, 8, 0, 152); g.addColorStop(0, rimA); g.addColorStop(1, rimB);
  c.fillStyle = g; c.beginPath(); c.arc(80, 80, 72, 0, TAU); c.fill();
  c.fillStyle = '#080b12'; c.beginPath(); c.arc(80, 80, 64, 0, TAU); c.fill();
  const ig = c.createRadialGradient(70, 64, 6, 80, 80, 60); inner.forEach(([o, col]) => ig.addColorStop(o, col));
  c.fillStyle = ig; c.beginPath(); c.arc(80, 80, 60, 0, TAU); c.fill();
  const gl = c.createLinearGradient(0, 24, 0, 80); gl.addColorStop(0, 'rgba(255,255,255,0.4)'); gl.addColorStop(1, 'rgba(255,255,255,0)');
  c.fillStyle = gl; c.beginPath(); c.ellipse(80, 56, 44, 30, 0, 0, TAU); c.fill();
}
function chev(c, color, w, glow, dir, n, gap, half, shift) {
  c.save(); c.translate(80, 80); c.scale(dir, 1); c.lineCap = 'round'; c.lineJoin = 'round';
  if (glow) { c.shadowColor = glow; c.shadowBlur = 12; }
  c.strokeStyle = color; c.lineWidth = w;
  for (let k = 0; k < n; k++) { const x = shift + k * gap; c.beginPath(); c.moveTo(x - half * 0.45, -half); c.lineTo(x + half * 0.45, 0); c.lineTo(x - half * 0.45, half); c.stroke(); }
  c.restore();
}
function star(c, r, fill) {
  c.save(); c.translate(80, 80); c.fillStyle = fill;
  for (let i = 0; i < 4; i++) { c.rotate(Math.PI / 2); c.beginPath(); c.moveTo(0, 0); c.lineTo(r * 0.22, -r * 0.3); c.lineTo(r, 0); c.lineTo(r * 0.22, r * 0.3); c.closePath(); c.fill(); }
  c.fillStyle = 'rgba(10,20,10,0.9)'; c.beginPath(); c.arc(0, 0, r * 0.15, 0, TAU); c.fill(); c.restore();
}

export function makeUiArt(scene) {
  cvs(scene, 'btn_attack', (c) => {
    base(c, '#ffe39a', '#b4701a', [[0, '#ffc15a'], [0.55, '#ea5c1c'], [1, '#6e1c06']], '#ff8a3c');
    c.save(); c.translate(82, 80); c.rotate(-0.78);
    c.fillStyle = '#170a08'; c.beginPath(); c.moveTo(-6, 20); c.lineTo(-6, -48); c.lineTo(0, -64); c.lineTo(6, -48); c.lineTo(6, 20); c.closePath(); c.fill();
    c.fillRect(-18, 18, 36, 7); c.fillRect(-4.5, 25, 9, 30); c.beginPath(); c.arc(0, 58, 6.5, 0, TAU); c.fill();
    c.strokeStyle = 'rgba(255,214,150,0.9)'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(-6, 18); c.lineTo(-6, -48); c.lineTo(0, -63); c.stroke();
    c.restore();
    c.strokeStyle = 'rgba(255,240,205,0.85)'; c.lineWidth = 5; c.lineCap = 'round'; c.beginPath(); c.arc(80, 80, 49, 2.35, 3.95); c.stroke();
  });
  // jump = double up-chevron (drawn rotated so we can reuse chev())
  cvs(scene, 'btn_jump', (c) => {
    base(c, '#a6f4ff', '#1d78bd', [[0, '#2f78c0'], [0.6, '#123a72'], [1, '#07142c']], '#4fd0ff');
    c.save(); c.translate(80, 84); c.rotate(-Math.PI / 2); c.translate(-80, -80); chev(c, '#ffffff', 11, '#7fe4ff', 1, 2, 26, 24, -8); c.restore();
  });
  cvs(scene, 'btn_dash', (c) => {
    base(c, '#a6f4ff', '#1d78bd', [[0, '#2f78c0'], [0.6, '#123a72'], [1, '#07142c']], '#4fd0ff');
    chev(c, '#ffffff', 11, '#7fe4ff', 1, 3, 22, 24, -22);
  });
  cvs(scene, 'btn_shuriken', (c) => {
    base(c, '#ffe39a', '#a8741c', [[0, '#8be860'], [0.55, '#2a7a28'], [1, '#0a2a0c']], '#8bff5a');
    star(c, 46, '#f6f9ff');
  });
  // plain gold double chevrons (no disc) for left / right
  for (const [key, dir] of [['btn_left', -1], ['btn_right', 1]]) {
    cvs(scene, key, (c) => {
      chev(c, 'rgba(0,0,0,0.55)', 26, null, dir, 2, 38, 40, -22);
      const g = c.createLinearGradient(0, 30, 0, 130); g.addColorStop(0, '#ffe680'); g.addColorStop(1, '#eb9d0c');
      chev(c, g, 15, '#ffcf5a', dir, 2, 38, 40, -22);
    });
  }
}
