/**
 * Devil's Door: landing page 3D scroll scene.
 *
 * What you see: a fixed WebGL canvas behind the page. At the top you face the Devil's Door
 * (two leaves that swing open as you start scrolling). Scrolling flies the camera forward
 * through a line of torii gates, one per section; each gate has its own realm color, and the
 * page's accent color (--accent-live) follows the gate you are approaching.
 *
 * Needs the global THREE (website/js/vendor/three.min.js, r128). Loaded lazily by landing.js.
 * Everything is plain boxes + edge lines + additive points: no textures or models to download.
 */
(function () {
  'use strict';

  var doc = document.documentElement;
  var canvas = document.getElementById('scene3d');
  if (!canvas || typeof THREE === 'undefined') { doc.classList.add('no-webgl'); return; }

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isTouch = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
  var lowEnd = isTouch || (navigator.hardwareConcurrency || 4) <= 4;

  // One gate per section / realm color: door, moonlight, scythe grove, crystal, underworld, celestial, finale
  var GATE_COLORS = [0xef4444, 0x06b6d4, 0x10b981, 0xf43f5e, 0x8b5cf6, 0xfbbf24, 0xef4444];
  var GATE_SPACING = 16;
  var CAM_START_Z = 17;
  var CAM_TRAVEL = GATE_SPACING * (GATE_COLORS.length - 1) + 12; // ends just past the last gate

  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: !lowEnd, alpha: true, powerPreference: 'high-performance' });
  } catch (e) { doc.classList.add('no-webgl'); return; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, lowEnd ? 1.25 : 1.75));
  renderer.setClearColor(0x000000, 0);

  var scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x06080e, lowEnd ? 0.03 : 0.024); // far gates fade into the page background
  var camera = new THREE.PerspectiveCamera(55, 1, 0.1, 220);

  scene.add(new THREE.AmbientLight(0x2a2f45, 1.0));
  var glowLight = new THREE.PointLight(GATE_COLORS[0], 1.6, 46);
  scene.add(glowLight);

  // ---- soft round sprite for embers / door glow ----
  function radialTexture(inner, outer) {
    var c = document.createElement('canvas');
    c.width = c.height = 128;
    var g = c.getContext('2d');
    var grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, inner);
    grad.addColorStop(1, outer);
    g.fillStyle = grad;
    g.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  }

  // ---- a torii gate: dark boxes + glowing edge lines in the realm color ----
  var hazeTex = radialTexture('rgba(255,255,255,0.9)', 'rgba(255,255,255,0)');
  function makeGate(color) {
    var group = new THREE.Group();
    // dark slabs that carry a faint glow of the gate's own color (so gates read as lit, not just outlined)
    var darkMat = new THREE.MeshStandardMaterial({ color: 0x0b0e17, roughness: 0.85, metalness: 0.2, emissive: new THREE.Color(color).multiplyScalar(0.16) });
    // colored haze behind the gate
    var haze = new THREE.Mesh(new THREE.PlaneGeometry(22, 20), new THREE.MeshBasicMaterial({ map: hazeTex, color: color, transparent: true, opacity: 0.2, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
    haze.position.set(0, 5.5, -0.9);
    group.add(haze);
    group.userData.haze = haze;
    var edgeMat = new THREE.LineBasicMaterial({ color: color, transparent: true, opacity: 0.9 });
    // [w, h, d, x, y]
    [[0.9, 9.2, 0.9, -3.6, 4.6], [0.9, 9.2, 0.9, 3.6, 4.6], [11.4, 0.75, 1.2, 0, 9.5], [8.4, 0.4, 0.7, 0, 7.7]].forEach(function (p) {
      var geo = new THREE.BoxGeometry(p[0], p[1], p[2]);
      var mesh = new THREE.Mesh(geo, darkMat);
      mesh.position.set(p[3], p[4], 0);
      group.add(mesh);
      var edges = new THREE.LineSegments(new THREE.EdgesGeometry(geo), edgeMat);
      edges.position.copy(mesh.position);
      group.add(edges);
    });
    group.userData.edgeMat = edgeMat;
    return group;
  }

  var gates = GATE_COLORS.map(function (color, i) {
    var g = makeGate(color);
    g.position.z = -i * GATE_SPACING;
    scene.add(g);
    return g;
  });

  // ---- the Devil's Door: two leaves inside the first gate + glow behind them ----
  var leafMat = new THREE.MeshStandardMaterial({ color: 0x130b0d, roughness: 0.7, metalness: 0.3, emissive: 0x1a0505 });
  var leafEdgeMat = new THREE.LineBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.9 });
  function makeLeaf(side) {
    var pivot = new THREE.Group(); // hinge on the outer edge
    var geo = new THREE.BoxGeometry(3.3, 7.6, 0.35);
    var mesh = new THREE.Mesh(geo, leafMat);
    mesh.position.set(-side * 1.65, 3.8, 0);
    pivot.add(mesh);
    var edges = new THREE.LineSegments(new THREE.EdgesGeometry(geo), leafEdgeMat);
    edges.position.copy(mesh.position);
    pivot.add(edges);
    pivot.position.set(side * 3.3, 0, -0.2);
    scene.add(pivot);
    return pivot;
  }
  var leafL = makeLeaf(-1), leafR = makeLeaf(1);

  var doorGlow = new THREE.Mesh(
    new THREE.PlaneGeometry(13, 15),
    new THREE.MeshBasicMaterial({ map: radialTexture('rgba(255,110,70,1)', 'rgba(255,40,20,0)'), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false })
  );
  doorGlow.position.set(0, 4.6, -1.4);
  scene.add(doorGlow);

  // ---- ground: dark plane, drifting grid (gives a sense of speed) and a lit path ----
  var ground = new THREE.Mesh(new THREE.PlaneGeometry(120, 260), new THREE.MeshBasicMaterial({ color: 0x05070d }));
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(0, -0.02, -60);
  scene.add(ground);

  var grid = new THREE.GridHelper(120, 60, GATE_COLORS[0], GATE_COLORS[0]);
  grid.position.set(0, 0, -50);
  grid.scale.z = 2.2;
  grid.material.transparent = true;
  grid.material.opacity = 0.16;
  scene.add(grid);

  var pathMat = new THREE.MeshBasicMaterial({ color: GATE_COLORS[0], transparent: true, opacity: 0.1, blending: THREE.AdditiveBlending, depthWrite: false });
  var path = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 260), pathMat);
  path.rotation.x = -Math.PI / 2;
  path.position.set(0, 0.01, -60);
  scene.add(path);

  // ---- embers ----
  var EMBERS = lowEnd ? 220 : 560;
  var ePos = new Float32Array(EMBERS * 3);
  var eCol = new Float32Array(EMBERS * 3);
  var eVel = new Float32Array(EMBERS);
  var tmpC = new THREE.Color();
  for (var i = 0; i < EMBERS; i++) {
    ePos[i * 3] = (Math.random() - 0.5) * 30;
    ePos[i * 3 + 1] = Math.random() * 14;
    ePos[i * 3 + 2] = 24 - Math.random() * (CAM_TRAVEL + 40);
    eVel[i] = 0.4 + Math.random() * 1.1;
    tmpC.setHex(Math.random() < 0.7 ? 0xff5a3c : 0xfbbf24);
    eCol[i * 3] = tmpC.r; eCol[i * 3 + 1] = tmpC.g; eCol[i * 3 + 2] = tmpC.b;
  }
  var eGeo = new THREE.BufferGeometry();
  eGeo.setAttribute('position', new THREE.BufferAttribute(ePos, 3));
  eGeo.setAttribute('color', new THREE.BufferAttribute(eCol, 3));
  var embers = new THREE.Points(eGeo, new THREE.PointsMaterial({
    size: 0.5, map: radialTexture('rgba(255,255,255,1)', 'rgba(255,255,255,0)'), vertexColors: true,
    transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false
  }));
  scene.add(embers);

  // ---- state ----
  var targetP = 0, curP = 0;                  // scroll progress 0..1 (raw / smoothed)
  var mouse = { x: 0, y: 0 }, mouseS = { x: 0, y: 0 };
  var accent = new THREE.Color(GATE_COLORS[0]);
  var c0 = new THREE.Color(), c1 = new THREE.Color();
  var lastCssAccent = '', lastCssTime = 0;
  var ready = false;

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function smooth(a, b, v) { var t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); }

  function readScroll() {
    var max = doc.scrollHeight - window.innerHeight;
    targetP = max > 0 ? clamp(window.scrollY / max, 0, 1) : 0;
  }

  function resize() {
    var w = window.innerWidth, h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // narrow screens: wider field of view so the gates are not cropped
    camera.fov = w / h < 0.8 ? 72 : 55;
    camera.updateProjectionMatrix();
  }

  function update(dt, time) {
    curP += (targetP - curP) * (1 - Math.exp(-dt * 5)); // inertia
    mouseS.x += (mouse.x - mouseS.x) * (1 - Math.exp(-dt * 4));
    mouseS.y += (mouse.y - mouseS.y) * (1 - Math.exp(-dt * 4));

    var z = CAM_START_Z - curP * (CAM_START_Z + CAM_TRAVEL);
    camera.position.set(mouseS.x * 0.9, 3.7 + Math.sin(curP * 38) * 0.07 + mouseS.y * 0.4, z);
    camera.lookAt(mouseS.x * 0.6, 4.1 + mouseS.y * 0.25, z - 22);

    // door opens during the first stretch of the scroll
    var open = smooth(0.0, 0.16, curP);
    leafL.rotation.y = -open * 1.45;
    leafR.rotation.y = open * 1.45;
    // The glow is additive, so it must fade out as the camera flies into it (or the screen turns solid red)
    var doorFade = clamp((z - doorGlow.position.z - 2) / 14, 0, 1);
    doorGlow.material.opacity = (0.5 + open * 0.4) * doorFade;
    doorGlow.scale.setScalar(1 + open * 0.15);

    // accent color: blend toward the gate we are approaching
    var f = clamp(-z / GATE_SPACING, 0, GATE_COLORS.length - 1);
    var i0 = Math.floor(f), i1 = Math.min(GATE_COLORS.length - 1, i0 + 1);
    c0.setHex(GATE_COLORS[i0]); c1.setHex(GATE_COLORS[i1]);
    accent.copy(c0).lerp(c1, f - i0);
    glowLight.color.copy(accent);
    glowLight.position.set(camera.position.x, 5, z - 3);
    grid.material.color.copy(accent);
    pathMat.color.copy(accent);

    // gates glow brighter as the camera nears them
    for (var g = 0; g < gates.length; g++) {
      var d = Math.abs(z - gates[g].position.z);
      var near = 1 - Math.min(1, d / 34);
      gates[g].userData.edgeMat.opacity = 0.5 + 0.5 * near;
      gates[g].userData.haze.material.opacity = (0.12 + 0.26 * near) * clamp(d / 12, 0, 1); // 0 while passing through
    }

    // let the rest of the page use the same accent (updated a few times a second, not every frame)
    if (time - lastCssTime > 160) {
      lastCssTime = time;
      var hex = '#' + accent.getHexString();
      if (hex !== lastCssAccent) { lastCssAccent = hex; doc.style.setProperty('--accent-live', hex); }
    }

    // embers drift up and sway; recycled when they leave the box
    var arr = eGeo.attributes.position.array;
    for (var e = 0; e < EMBERS; e++) {
      arr[e * 3 + 1] += eVel[e] * dt;
      arr[e * 3] += Math.sin(time * 0.0006 + e) * 0.25 * dt;
      if (arr[e * 3 + 1] > 14) arr[e * 3 + 1] = 0;
    }
    eGeo.attributes.position.needsUpdate = true;
  }

  function renderFrame() { renderer.render(scene, camera); }

  function markReady() {
    if (!ready) { ready = true; doc.classList.add('scene-ready'); }
  }

  resize();
  readScroll();
  curP = targetP;

  // ---- reduced motion: one still frame of the door, no scroll-linked camera ----
  if (reduceMotion) {
    targetP = curP = 0;
    update(0.016, 0);
    renderFrame();
    markReady();
    window.addEventListener('resize', function () { resize(); renderFrame(); });
    return;
  }

  window.addEventListener('scroll', readScroll, { passive: true });
  window.addEventListener('resize', function () { resize(); readScroll(); });
  if (!isTouch) {
    window.addEventListener('pointermove', function (e) {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -((e.clientY / window.innerHeight) * 2 - 1);
    }, { passive: true });
  }

  var running = true, last = performance.now(), lastDraw = 0;
  var minFrame = lowEnd ? 1000 / 40 : 0; // phones: cap at ~40fps to save battery

  canvas.addEventListener('webglcontextlost', function (e) {
    e.preventDefault();
    running = false;
    doc.classList.remove('scene-ready');
    doc.classList.add('no-webgl');
  });

  function frame(now) {
    if (!running) return;
    requestAnimationFrame(frame);
    if (now - lastDraw < minFrame) return;
    var dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    lastDraw = now;
    update(dt, now);
    renderFrame();
    markReady();
  }
  requestAnimationFrame(frame);
})();
