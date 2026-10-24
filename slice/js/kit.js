// Cartoon UI kit (glossy buttons, panels, ribbon, tiles, stars, icons) + the bright "floating islands" art used by the
// realm / level selection screens. 100% procedural (canvas), drawn in the style of casual-game vector UI.
const TAU = Math.PI * 2;
export const SANS = '"Arial Rounded MT Bold","Baloo 2","Fredoka","Trebuchet MS","Segoe UI",Roboto,system-ui,sans-serif';
const OUT = 'rgba(8,40,110,0.55)';
const COLORS = {
  blue: ['#6bd0ff', '#1d7fe4', '#0b3c96'], green: ['#b2f052', '#4cb01c', '#216808'], purple: ['#dc9aff', '#8c40e4', '#4a1a94'],
  orange: ['#ffdc66', '#f49a14', '#965008'], red: ['#ff7272', '#e61a1a', '#8a0808'], pink: ['#ffa6d6', '#ea4fa0', '#8d1f5c'], gray: ['#e2e6ee', '#a0a8b8', '#5a6272'],
};

function cv(scene, key, w, h, draw) {
  if (scene.textures.exists(key)) scene.textures.remove(key);
  const t = scene.textures.createCanvas(key, w, h); draw(t.getContext('2d'), w, h); t.refresh();
}
function rr(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
// path-appending rounded rect (rr() starts a new path, which breaks multi-shape glyphs)
function rrp(c, x, y, w, h, r) { c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
function lin(c, y0, y1, a, b) { const g = c.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, a); g.addColorStop(1, b); return g; }

// ---------- icon glyphs: white with a dark-blue outline
function paint(c, m, lw = 0, rule) {
  if (m === 'o') { c.lineJoin = c.lineCap = 'round'; c.strokeStyle = OUT; c.lineWidth = lw + 9; c.stroke(); c.fillStyle = OUT; c.fill(rule); }
  else { c.fillStyle = '#fff'; c.fill(rule); if (lw) { c.lineJoin = c.lineCap = 'round'; c.strokeStyle = '#fff'; c.lineWidth = lw; c.stroke(); } }
}
function strokeP(c, m, lw) { c.lineJoin = c.lineCap = 'round'; c.strokeStyle = m === 'o' ? OUT : '#fff'; c.lineWidth = m === 'o' ? lw + 9 : lw; c.stroke(); }
const GLYPH = {
  home: (c, m) => { c.beginPath(); c.moveTo(32, 8); c.lineTo(5, 32); c.lineTo(13, 32); c.lineTo(13, 55); c.lineTo(26, 55); c.lineTo(26, 40); c.lineTo(38, 40); c.lineTo(38, 55); c.lineTo(51, 55); c.lineTo(51, 32); c.lineTo(59, 32); c.closePath(); paint(c, m, 2); },
  play: (c, m) => { c.beginPath(); c.moveTo(20, 11); c.lineTo(54, 32); c.lineTo(20, 53); c.closePath(); paint(c, m, 6); },
  refresh: (c, m) => { c.beginPath(); c.arc(32, 36, 18, -0.35, 4.5); strokeP(c, m, 10); c.beginPath(); c.moveTo(24, 2); c.lineTo(48, 17); c.lineTo(24, 32); c.closePath(); paint(c, m, 3); },
  gear: (c, m) => { c.beginPath(); for (let i = 0; i < 16; i++) { const r = i % 2 ? 19 : 26, a = i * Math.PI / 8; c.lineTo(32 + r * Math.cos(a), 32 + r * Math.sin(a)); } c.closePath(); c.moveTo(40, 32); c.arc(32, 32, 8, 0, TAU, true); paint(c, m, 2, 'evenodd'); },
  list: (c, m) => { c.beginPath(); for (const y of [16, 32, 48]) { c.moveTo(17, y); c.arc(12, y, 5, 0, TAU); rrp(c, 24, y - 4.5, 34, 9, 4.5); } paint(c, m, 1); },
  sound: (c, m) => { c.beginPath(); c.moveTo(6, 24); c.lineTo(19, 24); c.lineTo(34, 11); c.lineTo(34, 53); c.lineTo(19, 40); c.lineTo(6, 40); c.closePath(); paint(c, m, 2); c.beginPath(); c.arc(34, 32, 13, -0.75, 0.75); strokeP(c, m, 5); c.beginPath(); c.arc(34, 32, 22, -0.75, 0.75); strokeP(c, m, 5); },
  mute: (c, m) => { c.beginPath(); c.moveTo(6, 24); c.lineTo(19, 24); c.lineTo(34, 11); c.lineTo(34, 53); c.lineTo(19, 40); c.lineTo(6, 40); c.closePath(); paint(c, m, 2); c.beginPath(); c.moveTo(43, 22); c.lineTo(58, 42); c.moveTo(58, 22); c.lineTo(43, 42); strokeP(c, m, 6); },
  lock: (c, m) => { c.beginPath(); c.arc(32, 26, 11, Math.PI, TAU); strokeP(c, m, 7); rr(c, 13, 27, 38, 29, 7); paint(c, m, 2); },
  left: (c, m) => { c.beginPath(); c.moveTo(7, 32); c.lineTo(30, 9); c.lineTo(30, 23); c.lineTo(57, 23); c.lineTo(57, 41); c.lineTo(30, 41); c.lineTo(30, 55); c.closePath(); paint(c, m, 3); },
  right: (c, m) => { c.beginPath(); c.moveTo(57, 32); c.lineTo(34, 9); c.lineTo(34, 23); c.lineTo(7, 23); c.lineTo(7, 41); c.lineTo(34, 41); c.lineTo(34, 55); c.closePath(); paint(c, m, 3); },
  pad: (c, m) => { rr(c, 5, 18, 54, 28, 14); paint(c, m, 2); if (m === 'f') { c.fillStyle = '#2f62b8'; c.fillRect(16, 28, 14, 5); c.fillRect(20.5, 23.5, 5, 14); c.beginPath(); c.arc(44, 28, 3.4, 0, TAU); c.arc(50, 34, 3.4, 0, TAU); c.fill(); } },
  close: (c, m) => { c.beginPath(); c.moveTo(14, 14); c.lineTo(50, 50); c.moveTo(50, 14); c.lineTo(14, 50); strokeP(c, m, 9); },
  pause: (c, m) => { c.beginPath(); rrp(c, 14, 10, 13, 44, 4); rrp(c, 37, 10, 13, 44, 4); paint(c, m, 2); },
  help: (c, m) => { c.font = 'bold 54px Arial, sans-serif'; c.textAlign = 'center'; c.lineJoin = 'round'; if (m === 'o') { c.strokeStyle = OUT; c.lineWidth = 12; c.strokeText('?', 32, 50); } c.fillStyle = m === 'o' ? OUT : '#fff'; c.fillText('?', 32, 50); },
};
function starPath(c, cx, cy, ro, ri) { c.beginPath(); for (let i = 0; i < 10; i++) { const r = i % 2 ? ri : ro, a = -Math.PI / 2 + i * Math.PI / 5; c.lineTo(cx + r * Math.cos(a), cy + r * Math.sin(a)); } c.closePath(); }

// ---------- procedural islands (one per realm theme)
function rock(c, w, hTop) {
  c.beginPath(); c.moveTo(18, hTop); c.quadraticCurveTo(10, hTop + 60, 56, hTop + 100); c.quadraticCurveTo(80, hTop + 112, 92, hTop + 138); c.quadraticCurveTo(110, hTop + 156, 124, hTop + 128);
  c.quadraticCurveTo(140, hTop + 112, 170, hTop + 96); c.quadraticCurveTo(212, hTop + 62, w - 18, hTop); c.closePath();
  c.fillStyle = lin(c, hTop, hTop + 150, '#b07a4c', '#5b3a2c'); c.fill(); c.lineWidth = 4; c.strokeStyle = '#3a2218'; c.stroke();
  c.strokeStyle = 'rgba(255,220,170,0.25)'; c.lineWidth = 3; for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(34 + i * 6, hTop + 22 + i * 24); c.quadraticCurveTo(120, hTop + 34 + i * 24, w - 34 - i * 6, hTop + 18 + i * 24); c.stroke(); }
}
function cap(c, w, y, top, hi, edge) {
  c.beginPath(); c.ellipse(w / 2, y, w / 2 - 6, 40, 0, 0, TAU); c.fillStyle = lin(c, y - 40, y + 40, hi, top); c.fill(); c.lineWidth = 4; c.strokeStyle = edge; c.stroke();
  c.fillStyle = 'rgba(255,255,255,0.18)'; c.beginPath(); c.ellipse(w / 2 - 20, y - 14, 70, 14, 0, 0, TAU); c.fill();
}
const tree = (c, x, y, s, col, trunk = '#6a4524') => { c.fillStyle = trunk; c.fillRect(x - 3 * s, y - 12 * s, 6 * s, 14 * s); c.fillStyle = col; for (const [dx, dy, r] of [[0, -26, 14], [-10, -18, 11], [10, -18, 11]]) { c.beginPath(); c.arc(x + dx * s, y + dy * s, r * s, 0, TAU); c.fill(); } };
const pine = (c, x, y, s, col, snow) => { c.fillStyle = '#5a3a20'; c.fillRect(x - 2 * s, y - 6 * s, 4 * s, 8 * s); for (let i = 0; i < 3; i++) { c.fillStyle = col; c.beginPath(); c.moveTo(x - (16 - i * 3) * s, y - (4 + i * 14) * s); c.lineTo(x, y - (24 + i * 14) * s); c.lineTo(x + (16 - i * 3) * s, y - (4 + i * 14) * s); c.closePath(); c.fill(); if (snow) { c.fillStyle = '#fff'; c.beginPath(); c.moveTo(x - 6 * s, y - (14 + i * 14) * s); c.lineTo(x, y - (24 + i * 14) * s); c.lineTo(x + 6 * s, y - (14 + i * 14) * s); c.closePath(); c.fill(); } } };
const ISLANDS = {
  moon: (c, w) => { cap(c, w, 150, '#2a6c92', '#6cc0de', '#123a56'); c.fillStyle = 'rgba(190,230,255,0.35)'; c.beginPath(); c.arc(168, 62, 40, 0, TAU); c.fill(); c.fillStyle = '#f1f9ff'; c.beginPath(); c.arc(168, 62, 24, 0, TAU); c.fill(); c.strokeStyle = '#0c2a40'; c.lineWidth = 4; c.lineCap = 'round'; for (const [x, h] of [[58, 70], [76, 90], [94, 62]]) { c.beginPath(); c.moveTo(x, 150); c.lineTo(x + 3, 150 - h); c.stroke(); c.lineWidth = 2; for (let k = 1; k < 4; k++) { c.beginPath(); c.moveTo(x + 3, 150 - h + k * 16); c.lineTo(x + 18, 150 - h + k * 16 + 8); c.stroke(); } c.lineWidth = 4; } c.fillStyle = '#0c2a40'; c.fillRect(126, 118, 38, 30); c.beginPath(); c.moveTo(116, 120); c.lineTo(145, 96); c.lineTo(174, 120); c.closePath(); c.fill(); c.fillStyle = '#ffd27a'; c.fillRect(138, 128, 12, 14); },
  sunset: (c, w) => { cap(c, w, 150, '#e0801e', '#ffcb62', '#8a3a0a'); const g = c.createRadialGradient(150, 70, 4, 150, 70, 70); g.addColorStop(0, 'rgba(255,236,160,0.95)'); g.addColorStop(1, 'rgba(255,150,60,0)'); c.fillStyle = g; c.fillRect(70, 0, 160, 140); c.fillStyle = '#fff1c0'; c.beginPath(); c.arc(150, 76, 22, 0, TAU); c.fill(); c.fillStyle = '#c4201e'; c.fillRect(96, 92, 9, 58); c.fillRect(150, 92, 9, 58); c.beginPath(); c.moveTo(84, 90); c.quadraticCurveTo(128, 100, 172, 90); c.lineTo(168, 78); c.quadraticCurveTo(128, 90, 88, 78); c.closePath(); c.fill(); c.fillRect(100, 106, 54, 6); pine(c, 54, 150, 1.1, '#2b6a2a'); pine(c, 200, 152, 0.9, '#2b6a2a'); },
  frost: (c, w) => { cap(c, w, 150, '#d7efff', '#ffffff', '#6a9cc0'); c.fillStyle = '#9ec6e6'; c.beginPath(); c.moveTo(40, 146); c.lineTo(98, 54); c.lineTo(156, 146); c.closePath(); c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.moveTo(80, 82); c.lineTo(98, 54); c.lineTo(116, 82); c.lineTo(106, 78); c.lineTo(98, 90); c.lineTo(90, 78); c.closePath(); c.fill(); c.fillStyle = '#b8d8f0'; c.beginPath(); c.moveTo(120, 146); c.lineTo(168, 84); c.lineTo(214, 146); c.closePath(); c.fill(); pine(c, 54, 152, 0.9, '#2f7a5a', true); pine(c, 222, 150, 0.8, '#2f7a5a', true); },
  ember: (c, w) => { cap(c, w, 150, '#6a3434', '#a85a4a', '#2a1212'); c.fillStyle = '#4a2424'; c.beginPath(); c.moveTo(64, 146); c.lineTo(112, 62); c.lineTo(148, 62); c.lineTo(196, 146); c.closePath(); c.fill(); c.strokeStyle = '#1e0e0e'; c.lineWidth = 4; c.stroke(); c.fillStyle = '#ff6a1a'; c.beginPath(); c.ellipse(130, 62, 20, 7, 0, 0, TAU); c.fill(); c.fillStyle = '#ffd04a'; c.beginPath(); c.ellipse(130, 61, 11, 4, 0, 0, TAU); c.fill(); c.strokeStyle = '#ff7a22'; c.lineWidth = 6; c.lineCap = 'round'; c.beginPath(); c.moveTo(124, 66); c.quadraticCurveTo(110, 100, 122, 140); c.stroke(); c.fillStyle = 'rgba(70,60,60,0.7)'; for (const [x, y, r] of [[124, 40, 12], [138, 26, 14], [150, 10, 12]]) { c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); } },
  jade: (c, w) => { cap(c, w, 150, '#4eb23c', '#9cec62', '#1e5a18'); tree(c, 66, 150, 1.6, '#2d8a2a'); tree(c, 118, 144, 2.1, '#3aa036'); tree(c, 176, 152, 1.5, '#2d8a2a'); tree(c, 214, 148, 1.2, '#3aa036'); },
  dunes: (c, w) => { cap(c, w, 150, '#eab84a', '#ffe08a', '#946414'); c.fillStyle = '#d8a238'; c.beginPath(); c.moveTo(30, 150); c.quadraticCurveTo(90, 96, 150, 150); c.fill(); c.fillStyle = '#c9902c'; c.beginPath(); c.moveTo(120, 150); c.quadraticCurveTo(190, 84, 250, 150); c.fill(); c.fillStyle = '#3a9a3a'; c.strokeStyle = '#1e5a1e'; c.lineWidth = 3; for (const [x, h] of [[66, 54], [204, 64]]) { c.beginPath(); rr(c, x - 7, 150 - h, 14, h, 7); c.fill(); c.stroke(); c.beginPath(); rr(c, x - 22, 150 - h * 0.7, 10, h * 0.35, 5); rr(c, x + 12, 150 - h * 0.6, 10, h * 0.3, 5); c.fill(); } },
};

export function makeKit(scene) {
  // glossy rounded buttons (9-slice friendly), round + square icon buttons
  for (const [name, [a, b, d]] of Object.entries(COLORS)) {
    cv(scene, 'ki_' + name, 112, 112, (c) => {
      c.fillStyle = 'rgba(255,255,255,0.9)'; c.beginPath(); c.arc(56, 62, 50, 0, TAU); c.fill();
      c.fillStyle = d; c.beginPath(); c.arc(56, 54, 50, 0, TAU); c.fill();
      c.fillStyle = lin(c, 8, 100, a, b); c.beginPath(); c.arc(56, 54, 45, 0, TAU); c.fill();
      c.fillStyle = 'rgba(255,255,255,0.34)'; c.beginPath(); c.ellipse(56, 34, 33, 17, 0, 0, TAU); c.fill();
    });
    cv(scene, 'ks_' + name, 112, 112, (c) => {
      c.fillStyle = 'rgba(255,255,255,0.9)'; rr(c, 6, 14, 100, 92, 24); c.fill();
      c.fillStyle = d; rr(c, 4, 4, 104, 98, 24); c.fill();
      c.fillStyle = lin(c, 8, 98, a, b); rr(c, 8, 8, 96, 90, 21); c.fill();
      c.fillStyle = 'rgba(255,255,255,0.34)'; rr(c, 14, 12, 84, 30, 14); c.fill();
    });
  }
  // panels
  cv(scene, 'k_ribbon', 520, 120, (c) => {
    c.fillStyle = '#7c1f0a'; c.beginPath(); c.moveTo(0, 22); c.lineTo(70, 22); c.lineTo(70, 100); c.lineTo(0, 100); c.lineTo(26, 61); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(520, 22); c.lineTo(450, 22); c.lineTo(450, 100); c.lineTo(520, 100); c.lineTo(494, 61); c.closePath(); c.fill();
    c.fillStyle = '#a82a0e'; c.fillRect(46, 78, 36, 24); c.fillRect(438, 78, 36, 24);
    c.fillStyle = '#7c1f0a'; rr(c, 50, 4, 420, 92, 18); c.fill();
    c.fillStyle = lin(c, 8, 92, '#ff6c3a', '#d8360e'); rr(c, 54, 8, 412, 84, 15); c.fill();
    c.fillStyle = 'rgba(255,255,255,0.3)'; rr(c, 62, 11, 396, 26, 12); c.fill();
    c.strokeStyle = '#fff'; c.lineWidth = 3; c.globalAlpha = 0.55; rr(c, 60, 14, 400, 72, 12); c.stroke(); c.globalAlpha = 1;
  });
  for (const [key, cols] of [['k_tile', ['#ff6a36', '#e03a0a', '#7c1f0a']], ['k_tile_lock', ['#b8bcc6', '#7c8392', '#3c4352']]]) {
    cv(scene, key, 112, 112, (c) => {
      c.fillStyle = cols[2]; rr(c, 0, 0, 112, 112, 22); c.fill();
      c.fillStyle = '#fff'; rr(c, 4, 4, 104, 104, 19); c.fill();
      c.fillStyle = lin(c, 8, 104, cols[0], cols[1]); rr(c, 8, 8, 96, 96, 16); c.fill();
      c.fillStyle = 'rgba(255,255,255,0.24)'; rr(c, 12, 11, 88, 30, 12); c.fill();
    });
  }
  cv(scene, 'k_star', 56, 56, (c) => { starPath(c, 28, 30, 25, 11); c.fillStyle = lin(c, 4, 54, '#ffee70', '#ffb21c'); c.fill(); c.lineWidth = 4; c.strokeStyle = '#b8620a'; c.lineJoin = 'round'; c.stroke(); c.fillStyle = 'rgba(255,255,255,0.55)'; c.beginPath(); c.ellipse(21, 18, 6, 3.4, -0.7, 0, TAU); c.fill(); });
  cv(scene, 'k_star_off', 56, 56, (c) => { starPath(c, 28, 30, 25, 11); c.fillStyle = 'rgba(58,66,90,0.62)'; c.fill(); c.lineWidth = 4; c.strokeStyle = 'rgba(20,26,40,0.7)'; c.lineJoin = 'round'; c.stroke(); });
  for (const [k, fn] of Object.entries(GLYPH)) cv(scene, 'ic_' + k, 64, 64, (c) => { c.save(); fn(c, 'o'); c.restore(); c.save(); fn(c, 'f'); c.restore(); });
  for (const [k, fn] of Object.entries(ISLANDS)) cv(scene, 'isl_' + k, 260, 290, (c, w) => { rock(c, w, 148); fn(c, w); });

  // bright sky with distant mountains (realm map) and the grassy backdrop (level select)
  cv(scene, 'k_sky', 1440, 600, (c, W, H) => {
    c.fillStyle = lin(c, 0, H, '#4aa9ea', '#d2f0ff'); c.fillRect(0, 0, W, H);
    c.fillStyle = 'rgba(80,150,210,0.55)'; for (const [x, w, h] of [[120, 190, 230], [380, 150, 170], [1080, 180, 250], [1300, 220, 200]]) { c.beginPath(); c.moveTo(x - w, H); c.quadraticCurveTo(x - w * 0.3, H - h, x, H - h - 20); c.quadraticCurveTo(x + w * 0.3, H - h, x + w, H); c.closePath(); c.fill(); }
    c.fillStyle = 'rgba(255,255,255,0.8)'; for (const [x, y, s] of [[260, 70, 1], [820, 110, 1.3], [1180, 60, 0.9], [520, 150, 0.8]]) { for (const [dx, dy, r] of [[0, 0, 26], [28, 6, 20], [-26, 8, 18], [8, -10, 20]]) { c.beginPath(); c.arc(x + dx * s, y + dy * s, r * s, 0, TAU); c.fill(); } }
  });
  cv(scene, 'k_clouds', 1280, 220, (c, W, H) => {
    for (const [col, off, amp] of [['rgba(190,226,248,0.95)', 70, 1], ['#ffffff', 110, 1.15]]) { c.fillStyle = col; c.beginPath(); c.moveTo(0, H); for (let x = 0; x <= W; x += 8) c.lineTo(x, off + 22 * Math.sin(x / 64 * amp) + 12 * Math.sin(x / 23 + off)); c.lineTo(W, H); c.closePath(); c.fill(); }
    c.fillStyle = '#ffffff'; for (let x = -40; x < W + 80; x += 86) { c.beginPath(); c.arc(x, 150 + (x % 3) * 6, 46, 0, TAU); c.fill(); }
  });
  cv(scene, 'k_lvl_bg', 1440, 600, (c, W, H) => {
    c.fillStyle = lin(c, 0, H, '#46a8ec', '#bfe6fb'); c.fillRect(0, 0, W, H);
    c.fillStyle = '#4e95e0'; for (const [x, r] of [[200, 190], [700, 230], [1180, 200]]) { c.beginPath(); c.ellipse(x, H - 90, r, 120, 0, Math.PI, TAU); c.fill(); }
    const bush = (x, y, s, a, b) => { for (const [dx, dy, r] of [[0, 0, 90], [-70, 34, 70], [72, 40, 66], [0, 70, 76]]) { c.fillStyle = lin(c, y + (dy - r) * s, y + (dy + r) * s, a, b); c.beginPath(); c.arc(x + dx * s, y + dy * s, r * s, 0, TAU); c.fill(); } c.fillStyle = '#7a4a24'; c.fillRect(x - 24 * s, y + 120 * s, 48 * s, 90 * s); };
    bush(70, H - 330, 0.95, '#a8e83a', '#4aaa18'); bush(W - 90, H - 330, 1.0, '#a8e83a', '#4aaa18'); bush(250, H - 250, 0.6, '#8ad22a', '#3a9a12'); bush(W - 270, H - 260, 0.6, '#8ad22a', '#3a9a12');
    c.fillStyle = '#9a6234'; c.fillRect(0, H - 66, W, 66);
    c.fillStyle = 'rgba(70,40,20,0.35)'; for (const [x, y, r] of [[120, H - 30, 14], [520, H - 24, 10], [900, H - 34, 16], [1250, H - 26, 12]]) { c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); }
    c.fillStyle = lin(c, H - 90, H - 56, '#8fe838', '#52b218'); c.beginPath(); c.moveTo(0, H - 56); for (let x = 0; x <= W; x += 40) c.arc(x + 20, H - 62, 20, Math.PI, TAU); c.lineTo(W, H - 90); c.lineTo(0, H - 90); c.closePath(); c.fill();
  });
}


// Exact-size textures (no 9-slice: Phaser's NineSlice is WebGL-only and stretches corners).
export function btnTexture(scene, color, w, h) {
  const key = `kb_${color}_${w}x${h}`;
  if (!scene.textures.exists(key)) {
    const [a, b, d] = COLORS[color], r = Math.min(26, h / 2.4);
    cv(scene, key, w + 6, h + 14, (c) => {
      c.fillStyle = 'rgba(255,255,255,0.9)'; rr(c, 4, 12, w, h, r); c.fill();
      c.fillStyle = d; rr(c, 2, 2, w, h, r); c.fill();
      c.fillStyle = lin(c, 5, h - 1, a, b); rr(c, 5, 5, w - 6, h - 6, r - 3); c.fill();
      c.fillStyle = 'rgba(255,255,255,0.34)'; rr(c, 11, 8, w - 18, Math.min(28, h * 0.36), Math.min(13, h * 0.17)); c.fill();
      c.fillStyle = 'rgba(0,0,0,0.09)'; rr(c, 5, 2 + h * 0.66, w - 6, h * 0.34 - 3, Math.min(12, h * 0.15)); c.fill();
    });
  }
  return key;
}
export function panelTexture(scene, kind, w, h) {
  const key = `kp_${kind}_${w}x${h}`;
  if (!scene.textures.exists(key)) cv(scene, key, w, h, (c) => {
    if (kind === 'light') {
      c.fillStyle = '#7c1f0a'; rr(c, 0, 0, w, h, 40); c.fill();
      c.fillStyle = lin(c, 3, h - 3, '#ff6a36', '#d8360e'); rr(c, 3, 3, w - 6, h - 6, 37); c.fill();
      c.fillStyle = '#ffffff'; rr(c, 14, 14, w - 28, h - 28, 28); c.fill();
      c.fillStyle = lin(c, 18, h - 18, '#c4ecff', '#86cdf0'); rr(c, 18, 18, w - 36, h - 36, 24); c.fill();
    } else {
      c.fillStyle = '#4a2610'; rr(c, 0, 0, w, h, 30); c.fill();
      c.fillStyle = lin(c, 3, h - 3, '#d89448', '#a8612a'); rr(c, 3, 3, w - 6, h - 6, 27); c.fill();
      c.strokeStyle = 'rgba(80,40,14,0.35)'; c.lineWidth = 3; for (let y = 24; y < h - 8; y += 26) { c.beginPath(); c.moveTo(8, y); c.quadraticCurveTo(w / 2, y + (y % 3) * 2 - 2, w - 8, y); c.stroke(); }
      c.fillStyle = lin(c, 14, h - 14, '#f1b564', '#c9803a'); rr(c, 14, 14, w - 28, h - 28, 20); c.fill();
      c.strokeStyle = '#7a4318'; c.lineWidth = 3; rr(c, 14, 14, w - 28, h - 28, 20); c.stroke();
    }
  });
  return key;
}

// ---------- GameObject factories
export function ctext(scene, x, y, str, size, o = {}) {
  return scene.add.text(x, y, str, { fontFamily: SANS, fontSize: size + 'px', fontStyle: 'bold', color: o.color || '#ffffff', stroke: o.stroke || '#0b3a8a', strokeThickness: o.thick ?? Math.max(3, Math.round(size * 0.2)), align: 'center', letterSpacing: o.spacing || 0 }).setOrigin(0.5).setShadow(0, Math.max(2, size * 0.07), 'rgba(0,30,90,0.45)', 0, true, true);
}
function pressable(scene, c, w, h, cb, sfxClick) {
  const z = scene.add.zone(0, 0, w, h).setInteractive({ useHandCursor: true }); c.add(z);
  z.on('pointerdown', () => { c.setScale(c._s * 0.93); });
  const up = () => c.setScale(c._s);
  z.on('pointerout', up); z.on('pointerup', () => { up(); if (c._on) { if (sfxClick) sfxClick(); cb && cb(); } });
  return z;
}
export function kButton(scene, x, y, w, h, color, label, cb, icon, sfxClick) {
  const c = scene.add.container(x, y); c._s = 1; c._on = true;
  c.add(scene.add.image(0, 0, btnTexture(scene, color, w, h)).setOrigin(0.5, (2 + h / 2) / (h + 14)));
  const hasIcon = !!icon, ox = hasIcon ? h * 0.34 : 0;
  if (hasIcon) c.add(scene.add.image(-w / 2 + h * 0.62, -h * 0.04, 'ic_' + icon).setDisplaySize(h * 0.56, h * 0.56));
  if (label) c.add(ctext(scene, ox, -h * 0.05, label, Math.round(h * (hasIcon ? 0.38 : 0.42)), { stroke: '#' + (COLORS[color][2]).slice(1) }));
  pressable(scene, c, w, h, cb, sfxClick); c.setSize(w, h); return c;
}
export function kIcon(scene, x, y, size, color, icon, cb, shape = 'ki', sfxClick) {
  const c = scene.add.container(x, y); c._s = 1; c._on = true;
  c.add(scene.add.image(0, 0, shape + '_' + color).setDisplaySize(size, size));
  c.icon = scene.add.image(0, -size * 0.04, 'ic_' + icon).setDisplaySize(size * 0.6, size * 0.6); c.add(c.icon);
  pressable(scene, c, size, size, cb, sfxClick); c.setSize(size, size); return c;
}
export const kPanel = (scene, x, y, w, h, kind = 'light') => scene.add.image(x, y, panelTexture(scene, kind, Math.round(w), Math.round(h)));
export function kRibbon(scene, x, y, w, text, size) {
  const c = scene.add.container(x, y), img = scene.add.image(0, 0, 'k_ribbon'); img.setScale(w / 520); c.add(img);
  c.add(ctext(scene, 0, -2, text, size || Math.round(w * 0.075), { stroke: '#7c1f0a', thick: Math.round((size || w * 0.075) * 0.22) })); return c;
}
export function starRow(scene, x, y, n, size, total = 3) {
  const c = scene.add.container(x, y);
  for (let i = 0; i < total; i++) c.add(scene.add.image((i - (total - 1) / 2) * size * 1.05, i === 1 ? -size * 0.08 : 0, i < n ? 'k_star' : 'k_star_off').setDisplaySize(size, size));
  return c;
}
