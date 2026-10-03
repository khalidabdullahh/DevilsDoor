/**
 * The Devil's Door world: one WebGL canvas, four "sets" that the scroll director switches between.
 *   journey : red moon, ridges, the giant torii, then a tunnel of gates   (scenes 01-03)
 *   quad    : full-screen art planes with shader transitions + weather    (scenes 04-06: shinobi, realms)
 *   door    : the giant door, light shafts, the thing behind it           (scenes 07-08)
 * Everything is drawn procedurally or from art that already exists in the repo.
 * Needs the global THREE (r128, vendored).
 */
import * as S from './shaders.js';

export function createWorld({ canvas, low }) {
  const THREE = window.THREE;
  const OCT = low ? 3 : 5;
  const withNoise = (frag) => 'precision highp float;\n#define OCT ' + OCT + '\n' + S.NOISE + frag;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
  const C3 = (r, g, b) => new THREE.Color(r, g, b);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !low, alpha: false, powerPreference: 'high-performance' });
  renderer.setClearColor(0x030306, 1);
  let dpr = Math.min(window.devicePixelRatio || 1, low ? 1.4 : 1.8);
  renderer.setPixelRatio(dpr);

  let W = 1, H = 1, aspect = 1;

  // ------------------------------------------------------------------ helpers
  function shaderMat(vert, frag, uniforms, extra) {
    return new THREE.ShaderMaterial(Object.assign({ uniforms, vertexShader: vert, fragmentShader: frag }, extra || {}));
  }

  function particleLayer(count, cfg) {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3), rnd = new Float32Array(count * 4);
    for (let i = 0; i < pos.length; i++) pos[i] = Math.random();
    for (let i = 0; i < rnd.length; i++) rnd[i] = Math.random();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aRand', new THREE.BufferAttribute(rnd, 4));
    const u = {
      uTime: { value: 0 }, uSize: { value: cfg.size }, uScale: { value: 600 }, uSpeed: { value: cfg.speed || 1 }, uSway: { value: cfg.sway || 0 },
      uBox: { value: V3(...cfg.box) }, uCenter: { value: V3(...cfg.center) }, uVel: { value: V3(...cfg.vel) },
      uColor: { value: C3(...cfg.color) }, uColor2: { value: C3(...cfg.color2) }, uOpacity: { value: cfg.opacity }, uStreak: { value: cfg.streak || 0 }
    };
    const m = shaderMat(S.PARTICLE_VERT, S.PARTICLE_FRAG, u, { transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
    const pts = new THREE.Points(g, m);
    pts.frustumCulled = false;
    return { pts, u };
  }
  const particleScale = () => (H * dpr) / (2 * Math.tan((50 * Math.PI) / 360));

  const texCache = new Map();
  function loadTexture(url) {
    if (texCache.has(url)) return texCache.get(url);
    const p = new Promise((resolve) => {
      new THREE.TextureLoader().load(url, (t) => {
        t.minFilter = THREE.LinearFilter; t.magFilter = THREE.LinearFilter; t.generateMipmaps = false;
        resolve(t);
      }, undefined, () => resolve(null));
    });
    texCache.set(url, p);
    return p;
  }
  const blackTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 2; return new THREE.CanvasTexture(c); })();

  // ================================================================== JOURNEY (gate + tunnel)
  const sceneJ = new THREE.Scene();
  const camJ = new THREE.PerspectiveCamera(50, 1, 0.1, 600);
  sceneJ.add(camJ);

  const backdrop = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2),
    shaderMat(S.FULLSCREEN_VERT, withNoise(S.BACKDROP_FRAG), {
      uTime: { value: 0 }, uAspect: { value: 1 }, uReveal: { value: 0 }, uDolly: { value: 0 }, uTunnel: { value: 0 }, uHz: { value: 0.3 }, uMouse: { value: new THREE.Vector2() }
    }, { depthTest: false, depthWrite: false })
  );
  backdrop.frustumCulled = false;
  backdrop.renderOrder = -100;
  sceneJ.add(backdrop);

  // torii geometry (shared by every gate)
  function kasagiShape(width, thick, rise) {
    const shape = new THREE.Shape();
    const steps = 18, hw = width / 2;
    const yb = (x) => Math.pow(x / hw, 2) * rise;
    shape.moveTo(-hw, yb(-hw) + thick * 0.3);
    for (let i = 0; i <= steps; i++) { const x = -hw + (width * i) / steps; shape.lineTo(x, yb(x) + thick + (Math.abs(x) / hw) * 0.5); }
    for (let i = steps; i >= 0; i--) { const x = -hw + (width * i) / steps; shape.lineTo(x, yb(x)); }
    return shape;
  }
  const toriiParts = [];
  (function buildTorii() {
    const h = 12, span = 11.2;
    const addCyl = (x, lean) => { const g = new THREE.CylinderGeometry(0.58, 0.78, h, 14); g.translate(0, h / 2, 0); g.rotateZ(lean); g.translate(x, 0, 0); toriiParts.push(g); };
    addCyl(-span / 2, -0.02); addCyl(span / 2, 0.02);
    const kas = new THREE.ExtrudeGeometry(kasagiShape(17.4, 1.15, 1.7), { depth: 1.5, bevelEnabled: false });
    kas.translate(0, h + 0.1, -0.75); toriiParts.push(kas);
    const cap = new THREE.ExtrudeGeometry(kasagiShape(17.9, 0.34, 1.75), { depth: 1.9, bevelEnabled: false });
    cap.translate(0, h + 1.28, -0.95); toriiParts.push(cap);
    const nuki = new THREE.BoxGeometry(span + 1.9, 0.52, 0.8); nuki.translate(0, h - 2.5, 0); toriiParts.push(nuki);
    const gaku = new THREE.BoxGeometry(0.95, 2.2, 0.6); gaku.translate(0, h - 1.15, 0); toriiParts.push(gaku);
    [-1, 1].forEach((s) => { const base = new THREE.CylinderGeometry(0.95, 1.05, 0.7, 14); base.translate(s * span / 2, 0.1, 0); toriiParts.push(base); });
  })();

  const silMat = shaderMat(S.SIL_VERT, S.SIL_FRAG, {
    uBase: { value: C3(0.04, 0.006, 0.011) }, uRim: { value: C3(0.95, 0.15, 0.1) }, uFog: { value: C3(0.12, 0.025, 0.04) },
    uLightV: { value: V3(0, 0, 1) }, uFogNear: { value: 40 }, uFogFar: { value: 300 }, uGlow: { value: 1 }, uGroundFog: { value: 2.5 }
  });
  const makeTorii = (scale) => {
    const g = new THREE.Group();
    toriiParts.forEach((geo) => g.add(new THREE.Mesh(geo, silMat)));
    g.scale.setScalar(scale);
    return g;
  };
  const GATE_Z = -32;
  const mainGate = makeTorii(1.18);
  mainGate.position.set(0, 0, GATE_Z);
  sceneJ.add(mainGate);

  const tunnelGates = [];
  const TUNNEL_N = low ? 7 : 11;
  for (let k = 0; k < TUNNEL_N; k++) {
    const g = makeTorii(0.8);
    g.position.set(0, 0, -64 - k * 15);
    sceneJ.add(g);
    tunnelGates.push(g);
  }

  // lantern glows hanging in the tunnel gates (one draw call)
  const lanternMat = shaderMat(`
    uniform float uScale, uTime; attribute float aPhase; varying float vF;
    void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * mv; gl_PointSize = 1.5 * uScale / max(-mv.z, 0.1); vF = 0.75 + 0.25 * sin(uTime * 3.0 + aPhase * 20.0); }`,
  `precision highp float; varying float vF; void main(){ float d = length(gl_PointCoord - 0.5) * 2.0; float a = pow(smoothstep(1.0, 0.0, d), 2.2); gl_FragColor = vec4(vec3(1.0, 0.22, 0.1) * a * vF * 1.4, a * vF); }`,
  { uScale: { value: 600 }, uTime: { value: 0 } }, { transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
  const lanterns = (() => {
    const pos = [], ph = [];
    tunnelGates.forEach((g, k) => { [-4.1, 4.1].forEach((x) => { pos.push(x * 0.8, 8.4, g.position.z + 0.5); ph.push(k * 0.37 + x); }); pos.push(0, 8.6, g.position.z + 0.5); ph.push(k); });
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('aPhase', new THREE.Float32BufferAttribute(ph, 1));
    const p = new THREE.Points(geo, lanternMat);
    p.frustumCulled = false;
    sceneJ.add(p);
    return p;
  })();

  // ground: dark, with a faintly lit road down the middle
  const road = new THREE.Mesh(new THREE.PlaneGeometry(7, 300), new THREE.MeshBasicMaterial({ color: 0x0d0307 }));
  road.rotation.x = -Math.PI / 2; road.position.set(0, 0.02, -120);
  sceneJ.add(road);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), new THREE.MeshBasicMaterial({ color: 0x030105 }));
  ground.rotation.x = -Math.PI / 2; ground.position.set(0, 0, -120);
  ground.visible = false;
  sceneJ.add(ground);

  // the lone shinobi on a rock, in front of the gate
  const rock = (() => {
    const g = new THREE.IcosahedronGeometry(1, 1);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) { const k = 0.8 + Math.sin(i * 12.9898) * 0.25; p.setXYZ(i, p.getX(i) * k, p.getY(i) * k * 0.8, p.getZ(i) * k); }
    g.computeVertexNormals();
    const m = new THREE.Mesh(g, silMat);
    m.scale.set(2.4, 1.1, 1.7); m.position.set(-1.9, 0.1, -26);
    sceneJ.add(m);
    return m;
  })();
  const shinobiU = { uTex: { value: blackTex }, uRim: { value: C3(0.95, 0.16, 0.1) }, uFog: { value: C3(0.12, 0.025, 0.04) }, uTexel: { value: new THREE.Vector2(1 / 640, 1 / 640) }, uFogNear: { value: 40 }, uFogFar: { value: 300 }, uOpacity: { value: 1 } };
  const shinobi = new THREE.Mesh(new THREE.PlaneGeometry(3.3, 3.3), shaderMat(S.CUT_VERT, S.CUT_FRAG, shinobiU, { transparent: true, depthWrite: false }));
  shinobi.position.set(-1.9, 2.4, -26);
  sceneJ.add(shinobi);

  // embers drifting through the whole journey
  const embersJ = particleLayer(low ? 260 : 650, { size: 0.16, box: [80, 28, 150], center: [0, 12, -40], vel: [0.5, 1.1, 0.2], sway: 2.2, color: [1.0, 0.45, 0.16], color2: [0.9, 0.1, 0.06], opacity: 0.95 });
  sceneJ.add(embersJ.pts);

  // foreground (attached to the camera): bare branches + grass, they move faster than everything else
  function branchTexture(seed) {
    const c = document.createElement('canvas'); c.width = low ? 512 : 1024; c.height = low ? 256 : 512;
    const g = c.getContext('2d'); g.scale(c.width / 1024, c.height / 512);
    let s = seed; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
    g.strokeStyle = '#000'; g.lineCap = 'round';
    (function branch(x, y, a, len, w, d) {
      if (d > 6 || len < 9) return;
      const x2 = x + Math.cos(a) * len, y2 = y + Math.sin(a) * len;
      g.lineWidth = w; g.beginPath(); g.moveTo(x, y);
      g.quadraticCurveTo((x + x2) / 2 + (rnd() - 0.5) * len * 0.3, (y + y2) / 2 + (rnd() - 0.5) * len * 0.3, x2, y2); g.stroke();
      const n = d < 2 ? 2 : (rnd() < 0.5 ? 2 : 3);
      for (let i = 0; i < n; i++) branch(x2, y2, a + (rnd() - 0.5) * 1.15 + (i - 0.5) * 0.4, len * (0.66 + rnd() * 0.16), w * 0.68, d + 1);
    }(-30, 30, 0.3, 330, 24, 0));
    for (let i = 0; i < 3; i++) (function branch(x, y, a, len, w, d) {
      if (d > 5 || len < 9) return;
      const x2 = x + Math.cos(a) * len, y2 = y + Math.sin(a) * len;
      g.lineWidth = w; g.beginPath(); g.moveTo(x, y); g.lineTo(x2, y2); g.stroke();
      branch(x2, y2, a + (rnd() - 0.5), len * 0.72, w * 0.7, d + 1); if (rnd() < 0.6) branch(x2, y2, a - 0.6 + rnd() * 0.3, len * 0.6, w * 0.65, d + 1);
    }(80 + i * 160, -10, 0.9 + rnd() * 0.5, 150 + rnd() * 90, 11, 0));
    const t = new THREE.CanvasTexture(c); return t;
  }
  function grassTexture(seed) {
    const c = document.createElement('canvas'); c.width = 1024; c.height = 160;
    const g = c.getContext('2d'); g.fillStyle = '#000';
    let s = seed; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < (low ? 160 : 300); i++) {
      const x = rnd() * 1024, h = 30 + rnd() * 120, lean = (rnd() - 0.5) * 50, w = 2.5 + rnd() * 5;
      g.beginPath(); g.moveTo(x - w, 160); g.quadraticCurveTo(x + lean * 0.3, 160 - h * 0.6, x + lean, 160 - h); g.quadraticCurveTo(x + lean * 0.3 + w, 160 - h * 0.5, x + w, 160); g.fill();
    }
    g.fillRect(0, 150, 1024, 10);
    return new THREE.CanvasTexture(c);
  }
  const fgMat = (tex) => shaderMat(S.UV_VERT, S.SPRITE_FRAG, { uTex: { value: tex }, uOpacity: { value: 1 } }, { transparent: true, depthTest: false, depthWrite: false });
  const branchL = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), fgMat(branchTexture(7)));
  const branchR = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), fgMat(branchTexture(31)));
  branchR.scale.x = -1;
  const grass = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), fgMat(grassTexture(5)));
  [branchL, branchR, grass].forEach((m, i) => { m.renderOrder = 60 + i; camJ.add(m); });
  function layoutForeground() {
    const dist = 3, halfH = dist * Math.tan((camJ.fov * Math.PI) / 360), halfW = halfH * aspect;
    const bw = Math.min(halfW * 0.78, halfH * 2.2), bh = bw / 2;
    branchL.scale.set(bw, bh, 1); branchL.position.set(-halfW + bw / 2, halfH - bh / 2 + 0.02, -dist);
    branchR.scale.set(-bw, bh, 1); branchR.position.set(halfW - bw / 2, halfH - bh / 2 + 0.02, -dist);
    const gw = halfW * 2.1, gh = gw * 0.16;
    grass.scale.set(gw, Math.min(gh, halfH * 0.5), 1); grass.position.set(0, -halfH + Math.min(gh, halfH * 0.5) / 2 - 0.02, -dist);
  }

  const lightW = V3(0, 0.38, -1).normalize();
  const camPathPts = [[0, 0], [0.2, -12], [0.42, -52], [1, -228]];
  function pathZ(u) {
    for (let i = 1; i < camPathPts.length; i++) {
      if (u <= camPathPts[i][0]) { const a = camPathPts[i - 1], b = camPathPts[i]; return lerp(a[1], b[1], (u - a[0]) / (b[0] - a[0])); }
    }
    return camPathPts[camPathPts.length - 1][1];
  }

  function updateJourney(s) {
    const u = s.u;
    const z = pathZ(u);
    camJ.fov = aspect < 0.8 ? 66 : 50;
    camJ.aspect = aspect;
    camJ.updateProjectionMatrix();
    const camY = 1.6 + Math.sin(s.t * 0.6) * 0.03 + s.mouse.y * 0.12;
    camJ.position.set(s.mouse.x * 0.5, camY, z);
    const tY = lerp(5.6, 3.2, smooth(0.08, 0.55, u));
    camJ.lookAt(s.mouse.x * 1.1, tY, z - 30);
    camJ.updateMatrixWorld();

    // keep the painted horizon glued to the 3D ground
    const pitch = Math.atan((tY - camY) / 30);
    const hz = clamp(0.5 - (0.5 * Math.tan(pitch)) / Math.tan((camJ.fov * Math.PI) / 360), 0.05, 0.6);
    const bu = backdrop.material.uniforms;
    bu.uTime.value = s.t; bu.uAspect.value = aspect; bu.uReveal.value = s.reveal; bu.uHz.value = hz;
    bu.uDolly.value = smooth(0, 0.42, u); bu.uTunnel.value = smooth(0.4, 0.52, u);
    bu.uMouse.value.set(s.mouse.x, s.mouse.y);

    const tunnel = bu.uTunnel.value;
    const su = silMat.uniforms;
    su.uFog.value.setRGB(lerp(0.12, 0.012, tunnel), lerp(0.024, 0.0, tunnel), lerp(0.04, 0.012, tunnel));
    su.uLightV.value.copy(lightW).transformDirection(camJ.matrixWorldInverse);
    su.uGlow.value = lerp(1, 0.25, tunnel);
    su.uRim.value.setRGB(0.95, lerp(0.15, 0.1, tunnel), lerp(0.1, 0.09, tunnel));
    su.uFogFar.value = lerp(300, 130, tunnel);
    shinobiU.uFog.value.copy(su.uFog.value);
    shinobi.visible = rock.visible = u < 0.5;
    mainGate.visible = z > GATE_Z - 60;

    embersJ.u.uTime.value = s.t; embersJ.u.uCenter.value.set(camJ.position.x, 11, z - 35);
    embersJ.u.uScale.value = particleScale();
    embersJ.u.uOpacity.value = 0.95 * s.reveal;
    lanternMat.uniforms.uTime.value = s.t; lanternMat.uniforms.uScale.value = particleScale();
    lanterns.visible = u > 0.3;
    road.visible = true;

    // foreground trees only exist before the gate
    const fg = 1 - smooth(0.2, 0.36, u);
    branchL.material.uniforms.uOpacity.value = branchR.material.uniforms.uOpacity.value = fg * s.reveal;
    grass.material.uniforms.uOpacity.value = fg * s.reveal;
    branchL.rotation.z = Math.sin(s.t * 0.35) * 0.012 + s.mouse.x * 0.01;
    branchR.rotation.z = -Math.sin(s.t * 0.3 + 1.0) * 0.012 + s.mouse.x * 0.01;
    branchL.position.x += 0; // layout sets base; parallax below
    const px = s.mouse.x * 0.08;
    branchL.position.x = branchL.userData.bx + px; branchR.position.x = branchR.userData.bx + px; grass.position.x = px * 0.6;
  }

  // ================================================================== QUAD (heroes + realms)
  const sceneQ = new THREE.Scene();
  const camQ = new THREE.PerspectiveCamera(50, 1, 0.1, 50);
  camQ.position.set(0, 0, 5);
  const planeGeo = new THREE.PlaneGeometry(1, 1);
  const charU = { uA: { value: blackTex }, uB: { value: blackTex }, uMix: { value: 0 }, uTime: { value: 0 }, uAspect: { value: 1 }, uAnchorX: { value: 0.62 }, uZoom: { value: 1.06 }, uFlash: { value: 0 }, uLight: { value: 0 }, uHas: { value: 1 }, uAccA: { value: C3(0.6, 0.3, 1) }, uAccB: { value: C3(1, 0.5, 0.2) }, uMouse: { value: new THREE.Vector2() } };
  const charPlane = new THREE.Mesh(planeGeo, shaderMat(S.UV_VERT, withNoise(S.CHAR_FRAG), charU));
  const realmU = { uA: { value: blackTex }, uB: { value: blackTex }, uS: { value: 0 }, uPanA: { value: 0.3 }, uPanB: { value: 0.3 }, uAspect: { value: 1 }, uTime: { value: 0 }, uImgAspect: { value: 1600 / 894 }, uZoom: { value: 1.12 }, uHasA: { value: 1 }, uHasB: { value: 1 }, uTintA: { value: C3(1, 1, 1) }, uTintB: { value: C3(1, 1, 1) } };
  const realmPlane = new THREE.Mesh(planeGeo, shaderMat(S.UV_VERT, withNoise(S.REALM_FRAG), realmU));
  sceneQ.add(charPlane, realmPlane);

  const fx = particleLayer(low ? 120 : 280, { size: 0.09, box: [11, 7, 5], center: [0, 0, 2.6], vel: [0.1, 0.3, 0], sway: 0.3, color: [1, 0.5, 0.2], color2: [1, 0.2, 0.1], opacity: 0.8 });
  sceneQ.add(fx.pts);
  const PRESETS = {
    violet: { vel: [0.02, 0.18, 0], color: [0.62, 0.35, 1.0], color2: [0.35, 0.6, 1.0], size: 0.07, opacity: 0.7, sway: 0.5, streak: 0, speed: 1 },
    ember:  { vel: [0.08, 0.5, 0], color: [1.0, 0.55, 0.18], color2: [1.0, 0.2, 0.08], size: 0.075, opacity: 0.95, sway: 0.35, streak: 0, speed: 1 },
    rain:   { vel: [-0.15, -3.2, 0], color: [0.55, 0.7, 1.0], color2: [0.8, 0.9, 1.0], size: 0.2, opacity: 0.55, sway: 0, streak: 1, speed: 1 },
    petal:  { vel: [-0.25, -0.22, 0], color: [0.95, 0.12, 0.25], color2: [0.7, 0.05, 0.12], size: 0.08, opacity: 0.85, sway: 0.7, streak: 0, speed: 1 },
    mote:   { vel: [0.05, 0.06, 0], color: [0.7, 0.9, 1.0], color2: [0.5, 0.8, 1.0], size: 0.1, opacity: 0.6, sway: 0.5, streak: 0, speed: 1 },
    spore:  { vel: [0.03, 0.14, 0], color: [0.3, 1.0, 0.55], color2: [0.7, 1.0, 0.3], size: 0.075, opacity: 0.85, sway: 0.6, streak: 0, speed: 1 },
    gold:   { vel: [0.04, 0.12, 0], color: [1.0, 0.8, 0.35], color2: [1.0, 0.6, 0.2], size: 0.07, opacity: 0.85, sway: 0.4, streak: 0, speed: 1 },
    wisp:   { vel: [0.0, 0.2, 0], color: [0.6, 0.35, 1.0], color2: [0.9, 0.5, 1.0], size: 0.11, opacity: 0.6, sway: 0.7, streak: 0, speed: 1 },
    ash:    { vel: [-0.05, -0.3, 0], color: [0.85, 0.85, 0.9], color2: [0.6, 0.6, 0.7], size: 0.07, opacity: 0.7, sway: 0.4, streak: 0, speed: 1 },
    blood:  { vel: [0.1, 0.22, 0], color: [1.0, 0.1, 0.1], color2: [0.8, 0.05, 0.08], size: 0.08, opacity: 0.9, sway: 0.5, streak: 0, speed: 1 }
  };
  const HERO_FX = ['violet', 'ember', 'rain', 'petal'];
  const REALM_FX = ['gold', 'mote', 'spore', 'blood', 'gold', 'ember', 'wisp', 'gold', 'ash', 'blood'];
  function applyPreset(a, b, t) {
    const A = PRESETS[a], B = PRESETS[b], u = fx.u;
    u.uVel.value.set(lerp(A.vel[0], B.vel[0], t), lerp(A.vel[1], B.vel[1], t), 0);
    u.uColor.value.setRGB(lerp(A.color[0], B.color[0], t), lerp(A.color[1], B.color[1], t), lerp(A.color[2], B.color[2], t));
    u.uColor2.value.setRGB(lerp(A.color2[0], B.color2[0], t), lerp(A.color2[1], B.color2[1], t), lerp(A.color2[2], B.color2[2], t));
    u.uSize.value = lerp(A.size, B.size, t); u.uOpacity.value = lerp(A.opacity, B.opacity, t); u.uSway.value = lerp(A.sway, B.sway, t);
    u.uStreak.value = t < 0.5 ? A.streak : B.streak;
  }
  const hex3 = (h) => { const c = new THREE.Color(h); return c; };
  let lightningT = 0, lightningNext = 3;

  function layoutQuad() {
    const dist = 5, h = 2 * dist * Math.tan((50 * Math.PI) / 360), w = h * aspect;
    charPlane.scale.set(w, h, 1); realmPlane.scale.set(w, h, 1);
    camQ.aspect = aspect; camQ.updateProjectionMatrix();
    charU.uAspect.value = aspect; realmU.uAspect.value = aspect;
    charU.uAnchorX.value = aspect > 1.1 ? 0.62 : 0.5;
    charU.uZoom.value = aspect > 1.1 ? 1.06 : Math.max(1.0, 0.62 / aspect * 1.0);
  }

  const heroTex = [null, null, null, null], realmTex = new Array(10).fill(null);
  const heroInfo = [{ acc: '#a855f7' }, { acc: '#f97316' }, { acc: '#38bdf8' }, { acc: '#f43f5e' }];
  const realmAcc = ['#ef4444', '#06b6d4', '#10b981', '#f43f5e', '#10b981', '#e11d48', '#8b5cf6', '#38bdf8', '#f59e0b', '#dc2626'];

  function updateHeroes(s) {
    const T = clamp(s.heroT, 0, 3), i = Math.min(3, Math.floor(T)), f = T - i, j = Math.min(3, i + 1);
    const mix = i === j ? 0 : smooth(0.66, 0.98, f);
    charPlane.visible = true; realmPlane.visible = false;
    charU.uA.value = heroTex[i] || blackTex; charU.uB.value = heroTex[j] || blackTex;
    charU.uMix.value = mix; charU.uTime.value = s.t;
    charU.uFlash.value = Math.pow(Math.sin(Math.PI * mix), 3);
    charU.uAccA.value.copy(hex3(heroInfo[i].acc)); charU.uAccB.value.copy(hex3(heroInfo[j].acc));
    charU.uMouse.value.set(-s.mouse.x, -s.mouse.y);
    charU.uZoom.value = (aspect > 1.1 ? 1.04 : Math.max(1.0, 0.62 / aspect)) + 0.05 * f;
    // Raijin: lightning flashes
    const raijinWeight = (i === 2 ? 1 - mix : 0) + (j === 2 ? mix : 0);
    lightningNext -= s.dt;
    if (lightningNext < 0) { lightningT = 1; lightningNext = 2.5 + Math.random() * 4; }
    lightningT = Math.max(0, lightningT - s.dt * 4);
    charU.uLight.value = raijinWeight * lightningT * lightningT * (0.6 + 0.4 * Math.sin(s.t * 40));
    applyPreset(HERO_FX[i], HERO_FX[j], mix);
  }

  function updateRealms(s) {
    const R = clamp(s.realmT, 0, 9), i = Math.min(9, Math.floor(R)), f = R - i, j = Math.min(9, i + 1);
    const slide = i === j ? 0 : smooth(0.62, 1.0, f);
    charPlane.visible = false; realmPlane.visible = true;
    realmU.uA.value = realmTex[i] || blackTex; realmU.uB.value = realmTex[j] || blackTex;
    realmU.uS.value = slide; realmU.uTime.value = s.t;
    realmU.uPanA.value = lerp(0.2, 0.8, Math.min(1, f / 0.9));
    realmU.uPanB.value = 0.2;
    realmU.uZoom.value = 1.12 + 0.0 * f;
    const tA = hex3(realmAcc[i]), tB = hex3(realmAcc[j]);
    realmU.uTintA.value.setRGB(lerp(1, 0.78 + tA.r * 0.3, 0.55), lerp(1, 0.78 + tA.g * 0.3, 0.55), lerp(1, 0.78 + tA.b * 0.3, 0.55));
    realmU.uTintB.value.setRGB(lerp(1, 0.78 + tB.r * 0.3, 0.55), lerp(1, 0.78 + tB.g * 0.3, 0.55), lerp(1, 0.78 + tB.b * 0.3, 0.55));
    applyPreset(REALM_FX[i], REALM_FX[j], slide);
  }

  function updateQuad(s) {
    if (s.quad === 'heroes') updateHeroes(s); else updateRealms(s);
    fx.u.uTime.value = s.t; fx.u.uScale.value = particleScale();
    camQ.position.set(s.mouse.x * 0.12, s.mouse.y * 0.08, 5);
    camQ.lookAt(0, 0, 0);
  }

  // ================================================================== DOOR
  const sceneD = new THREE.Scene();
  sceneD.fog = new THREE.FogExp2(0x030306, 0.018);
  const camD = new THREE.PerspectiveCamera(50, 1, 0.1, 400);
  const stone = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d');
    g.fillStyle = '#777'; g.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 2600; i++) { const v = 90 + Math.random() * 120; g.fillStyle = `rgb(${v},${v},${v})`; g.fillRect(Math.random() * 256, Math.random() * 256, 1 + Math.random() * 3, 1 + Math.random() * 3); }
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
  })();
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x1b1613, roughness: 0.95, metalness: 0.05, bumpMap: stone, bumpScale: 1.6 });
  const box = (w, h, d, x, y, z, mat) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); sceneD.add(m); return m; };
  box(2.6, 18, 2.8, -6.3, 9, 0, frameMat); box(2.6, 18, 2.8, 6.3, 9, 0, frameMat);
  box(16, 2.6, 3, 0, 16.8, 0, frameMat);
  [-1, 1].forEach((s) => box(3.4, 0.9, 3.6, s * 6.3, 0.45, 0, frameMat));
  const roofMat = shaderMat(S.SIL_VERT, S.SIL_FRAG, { uBase: { value: C3(0.03, 0.01, 0.014) }, uRim: { value: C3(0.9, 0.13, 0.09) }, uFog: { value: C3(0.012, 0.003, 0.01) }, uLightV: { value: V3(0, 0.3, -1) }, uFogNear: { value: 40 }, uFogFar: { value: 220 }, uGlow: { value: 1 }, uGroundFog: { value: -5 } });
  const roof = new THREE.Mesh(new THREE.ExtrudeGeometry(kasagiShape(24, 1.5, 2.6), { depth: 3.4, bevelEnabled: false }), roofMat);
  roof.position.set(0, 18.3, -1.7); sceneD.add(roof);

  function leafTextures(side) {
    const Wd = 512, Hd = 1024;
    const a = document.createElement('canvas'); a.width = Wd; a.height = Hd; const g = a.getContext('2d');
    g.fillStyle = '#17110e'; g.fillRect(0, 0, Wd, Hd);
    for (let k = 0; k < 6; k++) { const x = (k * Wd) / 6; g.fillStyle = `rgb(${24 + (k % 2) * 6},${17 + (k % 3) * 3},${13})`; g.fillRect(x + 2, 0, Wd / 6 - 4, Hd); }
    for (let i = 0; i < 380; i++) { g.strokeStyle = `rgba(0,0,0,${0.15 + Math.random() * 0.25})`; g.lineWidth = 1; const x = Math.random() * Wd, y = Math.random() * Hd; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (Math.random() - 0.5) * 4, y + 30 + Math.random() * 90); g.stroke(); }
    [90, 512, 934].forEach((y) => { g.fillStyle = '#0a0a0e'; g.fillRect(0, y - 34, Wd, 68); g.fillStyle = '#26262d'; for (let x = 20; x < Wd; x += 48) { g.beginPath(); g.arc(x, y - 18, 5, 0, 7); g.arc(x, y + 18, 5, 0, 7); g.fill(); } });
    const e = document.createElement('canvas'); e.width = Wd; e.height = Hd; const h = e.getContext('2d');
    h.fillStyle = '#000'; h.fillRect(0, 0, Wd, Hd);
    const cx = side < 0 ? Wd : 0, cy = 512;   // the sigil is centered on the seam between the leaves
    h.strokeStyle = '#ff3a22'; h.lineCap = 'round';
    h.lineWidth = 9; h.beginPath(); h.arc(cx, cy, 190, 0, 7); h.stroke();
    h.lineWidth = 5; h.beginPath(); h.arc(cx, cy, 150, 0, 7); h.stroke();
    for (let k = 0; k < 24; k++) { const an = (k / 24) * 6.2832, r1 = 196, r2 = 196 + (k % 2 ? 22 : 40); h.lineWidth = 4; h.beginPath(); h.moveTo(cx + Math.cos(an) * r1, cy + Math.sin(an) * r1); h.lineTo(cx + Math.cos(an) * r2, cy + Math.sin(an) * r2); h.stroke(); }
    h.lineWidth = 8; h.beginPath(); h.moveTo(cx - 130, cy); h.quadraticCurveTo(cx, cy - 95, cx + 130, cy); h.quadraticCurveTo(cx, cy + 95, cx - 130, cy); h.stroke();
    h.fillStyle = '#ff3a22'; h.beginPath(); h.ellipse(cx, cy, 20, 60, 0, 0, 7); h.fill();
    for (let k = 0; k < 14; k++) { // glowing cracks spreading from the seam
      let x = cx, y = 80 + Math.random() * 860; h.lineWidth = 2 + Math.random() * 2; h.beginPath(); h.moveTo(x, y);
      for (let s = 0; s < 9; s++) { x += (side < 0 ? -1 : 1) * (14 + Math.random() * 26); y += (Math.random() - 0.5) * 50; h.lineTo(x, y); } h.stroke();
    }
    const ta = new THREE.CanvasTexture(a), te = new THREE.CanvasTexture(e);
    return { ta, te };
  }
  const leafMats = [];
  const leaves = [-1, 1].map((side) => {
    const { ta, te } = leafTextures(side);
    const mat = new THREE.MeshStandardMaterial({ map: ta, bumpMap: ta, bumpScale: 1.2, emissiveMap: te, emissive: new THREE.Color(1, 0.22, 0.12), emissiveIntensity: 0.35, roughness: 0.82, metalness: 0.2 });
    leafMats.push(mat);
    const pivot = new THREE.Group();
    pivot.position.set(side * 5, 0, 0);
    const leaf = new THREE.Mesh(new THREE.BoxGeometry(5, 15, 0.8), mat);
    leaf.position.set(-side * 2.5, 7.5, 0);
    pivot.add(leaf);
    // iron knocker ring
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.11, 10, 28), new THREE.MeshStandardMaterial({ color: 0x1a1a20, metalness: 0.8, roughness: 0.4 }));
    ring.position.set(-side * 0.9, 6.2, 0.55);
    pivot.add(ring);
    sceneD.add(pivot);
    return pivot;
  });

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(240, 240), new THREE.MeshStandardMaterial({ color: 0x07050a, roughness: 0.34, metalness: 0.35 }));
  floor.rotation.x = -Math.PI / 2; sceneD.add(floor);

  // the space behind the door
  const interior = new THREE.Mesh(new THREE.BoxGeometry(10, 15, 80), new THREE.MeshBasicMaterial({ color: 0x040204, side: THREE.BackSide }));
  interior.position.set(0, 7.5, -41); sceneD.add(interior);
  const additive = { transparent: true, depthWrite: false, blending: THREE.AdditiveBlending };
  const glowU = { uColor: { value: C3(1, 0.16, 0.08) }, uA: { value: 0 } };
  const farGlow = new THREE.Mesh(new THREE.PlaneGeometry(20, 28), shaderMat(S.UV_VERT, S.GLOW_FRAG, glowU, additive));
  farGlow.position.set(0, 7.5, -58); sceneD.add(farGlow);
  const spillU = { uColor: { value: C3(1, 0.12, 0.06) }, uA: { value: 0 } };
  const spill = new THREE.Mesh(new THREE.PlaneGeometry(14, 34), shaderMat(S.UV_VERT, S.GLOW_FRAG, spillU, additive));
  spill.rotation.x = -Math.PI / 2; spill.position.set(0, 0.04, 14); sceneD.add(spill);

  const shaftU = { uOpen: { value: 0 }, uTime: { value: 0 }, uColor: { value: C3(1, 0.2, 0.1) } };
  const shaftMat = shaderMat(S.UV_VERT, withNoise(S.SHAFT_FRAG), shaftU, Object.assign({ side: THREE.DoubleSide }, additive));
  const shafts = new THREE.Group(); shafts.position.set(0, 7.5, 0.6); sceneD.add(shafts);
  for (let k = 0; k < 9; k++) {
    const pivot = new THREE.Group(); pivot.rotation.z = (k / 9) * Math.PI * 2 + 0.3;
    const len = 20 + (k % 3) * 8, m = new THREE.Mesh(new THREE.PlaneGeometry(1.6 + (k % 4) * 0.8, len), shaftMat);
    m.position.set(0, len / 2, 0); pivot.add(m); shafts.add(pivot);
  }
  const eyeU = { uOn: { value: 0 }, uBlink: { value: 1 } };
  const eyeMat = shaderMat(S.UV_VERT, S.EYE_FRAG, eyeU, additive);
  [-1.3, 1.3].forEach((x) => { const e = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 0.95), eyeMat); e.position.set(x, 8.2, -13); sceneD.add(e); });
  const mistU = { uTime: { value: 0 }, uA: { value: 0 }, uColor: { value: C3(0.9, 0.1, 0.06) } };
  const mistMat = shaderMat(S.UV_VERT, withNoise(S.MIST_FRAG), mistU, additive);
  [0.9, 2.6, 4.6].forEach((y, k) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(60 - k * 8, 14), mistMat); m.rotation.x = -Math.PI / 2; m.position.set(0, y * 0.4 + 0.2, 4 + k * 3); sceneD.add(m); });

  const doorLight = new THREE.PointLight(0xff2a14, 0, 70, 1.6); doorLight.position.set(0, 7.5, -4); sceneD.add(doorLight);
  const faceLight = new THREE.PointLight(0x5a6aa0, 0.7, 60, 1.5); faceLight.position.set(0, 9, 22); sceneD.add(faceLight);
  sceneD.add(new THREE.AmbientLight(0x1a1424, 0.8));
  const embersD = particleLayer(low ? 120 : 300, { size: 0.12, box: [26, 18, 40], center: [0, 8, 6], vel: [0.1, 0.7, 0.45], sway: 1.2, color: [1.0, 0.4, 0.14], color2: [0.9, 0.1, 0.06], opacity: 0.0 });
  sceneD.add(embersD.pts);
  let blinkT = 4;

  function updateDoor(s) {
    const open = clamp(s.open, 0, 1), eased = open * open * (3 - 2 * open);
    const ang = eased * 1.75;
    leaves[0].rotation.y = ang; leaves[1].rotation.y = -ang;
    camD.aspect = aspect; camD.fov = aspect < 0.8 ? 64 : 50; camD.updateProjectionMatrix();
    const rumble = (open > 0.05 && open < 0.7 ? 1 : 0) * (0.5 + 0.5 * Math.sin(s.t * 38)) * 0.05 * Math.sin(open * 3.14);
    const z = s.camZ;
    camD.position.set(s.mouse.x * 0.8 + rumble, lerp(7.2, 7.6, open) + s.mouse.y * 0.3 + rumble, z);
    camD.lookAt(s.mouse.x * 0.8, 7.6, z - 30);
    leafMats.forEach((m) => { m.emissiveIntensity = 0.25 + 0.2 * Math.sin(s.t * 1.7) * 0.5 + open * 1.4 + s.doorGlow * 0.5; });
    shaftU.uOpen.value = Math.pow(smooth(0.04, 0.85, open), 1.4) * s.light; shaftU.uTime.value = s.t;
    glowU.uA.value = smooth(0.1, 0.95, open) * 0.95 * s.light; spillU.uA.value = smooth(0.05, 0.9, open) * 0.7 * s.light;
    mistU.uA.value = smooth(0.2, 1, open) * 0.5 * s.light; mistU.uTime.value = s.t;
    doorLight.intensity = smooth(0.0, 0.95, open) * 9 * s.light;
    faceLight.intensity = 0.7 * (1 - s.darken * 0.85);
    sceneD.fog.density = 0.018 + s.darken * 0.01;
    blinkT -= s.dt; const blink = blinkT < 0 ? clamp(1 - Math.sin(clamp((-blinkT) / 0.18, 0, 1) * Math.PI), 0.06, 1) : 1; if (blinkT < -0.2) blinkT = 3.5 + Math.random() * 3;
    eyeU.uBlink.value = blink; eyeU.uOn.value = smooth(0.8, 0.96, open) * s.eyes;
    embersD.u.uTime.value = s.t; embersD.u.uScale.value = particleScale(); embersD.u.uOpacity.value = smooth(0.15, 0.9, open) * 0.95 * s.light;
    embersD.u.uCenter.value.set(0, 8, camD.position.z - 14);
    roofMat.uniforms.uFog.value.setRGB(0.012, 0.003, 0.01);
    roofMat.uniforms.uLightV.value.set(0, 0.3, -1).transformDirection(camD.matrixWorldInverse);
  }

  // ================================================================== public API
  function resize(w, h) {
    W = Math.max(1, w); H = Math.max(1, h); aspect = W / H;
    renderer.setPixelRatio(dpr);
    renderer.setSize(W, H, false);
    camJ.aspect = aspect; camJ.updateProjectionMatrix();
    layoutForeground();
    branchL.userData.bx = branchL.position.x; branchR.userData.bx = branchR.position.x;
    layoutQuad();
  }

  function render(s) {
    if (s.mode === 'journey') { updateJourney(s); renderer.render(sceneJ, camJ); }
    else if (s.mode === 'quad') { updateQuad(s); renderer.render(sceneQ, camQ); }
    else { updateDoor(s); renderer.render(sceneD, camD); }
  }

  const api = {
    renderer, resize, render,
    setDpr(v) { dpr = v; resize(W, H); },
    getDpr: () => dpr,
    async loadShinobi() {
      // The sketch has holes inside the body. Flood-fill the background from the borders so everything
      // else becomes solid: a clean black silhouette instead of scribbles.
      const img = await new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = '/src/assets/web/hero-01-kage-ryu.webp'; });
      if (!img) return;
      const w = img.naturalWidth, h = img.naturalHeight, c = document.createElement('canvas'); c.width = w; c.height = h;
      const g = c.getContext('2d'); g.drawImage(img, 0, 0);
      const d = g.getImageData(0, 0, w, h), px = d.data, seen = new Uint8Array(w * h), stack = [];
      const push = (x, y) => { const k = y * w + x; if (!seen[k] && px[k * 4 + 3] < 40) { seen[k] = 1; stack.push(k); } };
      for (let x = 0; x < w; x++) { push(x, 0); push(x, h - 1); }
      for (let y = 0; y < h; y++) { push(0, y); push(w - 1, y); }
      while (stack.length) { const k = stack.pop(), x = k % w, y = (k / w) | 0; if (x > 0) push(x - 1, y); if (x < w - 1) push(x + 1, y); if (y > 0) push(x, y - 1); if (y < h - 1) push(x, y + 1); }
      for (let k = 0; k < w * h; k++) { px[k * 4] = px[k * 4 + 1] = px[k * 4 + 2] = 0; px[k * 4 + 3] = seen[k] ? 0 : 255; }
      g.putImageData(d, 0, 0);
      const out = document.createElement('canvas'); out.width = w; out.height = h; const og = out.getContext('2d'); og.filter = 'blur(1.2px)'; og.drawImage(c, 0, 0);
      const t = new THREE.CanvasTexture(out); t.minFilter = THREE.LinearFilter; t.generateMipmaps = false;
      shinobiU.uTex.value = t; shinobiU.uTexel.value.set(1 / w, 1 / h);
    },
    async loadHero(i) { if (heroTex[i]) return; const t = await loadTexture(`/src/assets/web/char-0${i + 1}.webp`); if (t) heroTex[i] = t; },
    async loadRealm(i) {
      if (i < 0 || i > 9 || realmTex[i]) return;
      const t = await loadTexture(`/src/assets/web/realm-${String(i + 1).padStart(2, '0')}-lg.webp`); if (t) realmTex[i] = t;
    },
    keepRealms(center) {   // free GPU memory: only the realms near the camera stay in memory
      for (let i = 0; i < 10; i++) if (realmTex[i] && Math.abs(i - center) > 2) {
        const url = `/src/assets/web/realm-${String(i + 1).padStart(2, '0')}-lg.webp`;
        realmTex[i].dispose(); realmTex[i] = null; texCache.delete(url);
      }
    },
    realmReady: (i) => !!realmTex[i],
    heroReady: (i) => !!heroTex[i]
  };
  return api;
}
