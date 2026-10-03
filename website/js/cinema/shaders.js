/**
 * GLSL for the Devil's Door world. Plain GLSL ES 1.00 (WebGL1), authored in display space
 * (no color management), so what you write is what you see.
 */

// `OCT` (noise octaves) is injected per quality tier: 5 on desktop, 3 on phones.
export const NOISE = /* glsl */ `
float hash21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float vnoise(vec2 p){
  vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash21(i), hash21(i + vec2(1.0, 0.0)), f.x), mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), f.x), f.y);
}
float fbm(vec2 p){
  float v = 0.0, a = 0.5;
  for (int i = 0; i < OCT; i++) { v += a * vnoise(p); p = p * 2.03 + vec2(7.1, 3.3); a *= 0.5; }
  return v;
}
float n1(float x){ float i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f); return mix(hash21(vec2(i, 1.7)), hash21(vec2(i + 1.0, 1.7)), f); }
float ridge1(float x){ return 0.55 * n1(x) + 0.28 * n1(x * 2.3 + 11.0) + 0.12 * n1(x * 5.1 + 4.0); }
`;

export const FULLSCREEN_VERT = /* glsl */ `
varying vec2 vUv;
void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.9999, 1.0); }
`;

/** Everything "infinitely far": sky, stars, red moon, clouds, four mountain ridges, mist, lake. */
export const BACKDROP_FRAG = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform float uTime, uAspect, uReveal, uDolly, uTunnel, uHz;
uniform vec2 uMouse;
${'' /* NOISE is prepended by the caller */}

vec4 ridgeLayer(float x, float y, float base, float amp, float freq, float seed, vec3 lc, vec3 hazeC, float haze, float rimAmt){
  float r = base + amp * ridge1(x * freq + seed);
  float k = smoothstep(r + 0.003, r - 0.003, y);
  vec3 c = lc + hazeC * haze * smoothstep(r - 0.13, r, y);
  c += vec3(0.95, 0.12, 0.08) * rimAmt * smoothstep(0.014, 0.0, r - y) * step(y, r);
  return vec4(c, k);
}

void main(){
  vec2 uv = vUv;
  float hz = uHz;
  vec2 q = vec2((uv.x - 0.5) * uAspect, uv.y);

  // sky
  float t = clamp((uv.y - hz) / (1.0 - hz), 0.0, 1.0);
  vec3 col = mix(vec3(0.34, 0.05, 0.04), vec3(0.085, 0.012, 0.05), smoothstep(0.0, 0.34, t));
  col = mix(col, vec3(0.005, 0.006, 0.02), smoothstep(0.22, 0.85, t));
  col += vec3(0.05, 0.0, 0.07) * fbm(q * 2.2 + 4.0) * smoothstep(0.2, 0.7, t) * 0.8; // faint nebula

  // stars
  vec2 sp = vec2(q.x, uv.y) * 160.0;
  vec2 cell = floor(sp);
  float r = hash21(cell);
  float star = step(0.986, r) * smoothstep(0.38, 0.0, length(fract(sp) - 0.5)) * (0.55 + 0.45 * sin(uTime * (1.0 + r * 3.0) + r * 60.0));
  star *= smoothstep(hz + 0.05, hz + 0.4, uv.y);
  col += star * vec3(0.95, 0.85, 0.9) * uReveal;

  // moon (grows slowly as the camera approaches the gate)
  float zoom = 1.0 + 0.5 * uDolly;
  vec2 mc = vec2(uMouse.x * 0.012, hz + 0.245 - 0.03 * uDolly - (1.0 - uReveal) * 0.2);
  vec2 md = q - mc;
  float d = length(md);
  float R = 0.125 * zoom;
  float disc = smoothstep(R, R - 0.003, d);
  float surf = fbm(md * 9.0 / zoom + 3.0);
  vec3 moon = mix(vec3(0.62, 0.08, 0.07), vec3(1.0, 0.46, 0.24), smoothstep(0.3, 0.75, surf));
  moon *= 1.12 - 0.4 * pow(clamp(d / R, 0.0, 1.0), 3.0);
  float glow = exp(-max(d - R, 0.0) * 7.0 / zoom) * 0.8 + exp(-max(d - R, 0.0) * 2.2 / zoom) * 0.3;
  col += vec3(0.95, 0.14, 0.08) * glow * (0.3 + 0.7 * uReveal);
  col = mix(col, moon, disc * (0.2 + 0.8 * uReveal));

  // thin clouds crossing the moon
  float cl = fbm(vec2(q.x * 1.3 + uTime * 0.012 + uMouse.x * 0.02, uv.y * 7.0));
  float cmask = smoothstep(0.56, 0.82, cl) * smoothstep(hz + 0.1, hz + 0.3, uv.y) * smoothstep(0.95, 0.55, uv.y);
  col = mix(col, mix(vec3(0.03, 0.006, 0.02), vec3(0.36, 0.05, 0.05), clamp(glow, 0.0, 1.0)), cmask * 0.55);

  // lake + moon reflection (below the horizon)
  vec3 ground = mix(vec3(0.02, 0.004, 0.012), vec3(0.003, 0.0, 0.004), smoothstep(hz, 0.0, uv.y));
  float rs = exp(-abs(q.x - mc.x) * 12.0) * (0.5 + 0.5 * sin(uv.y * 240.0 - uTime * 1.6 + fbm(vec2(q.x * 22.0, uv.y * 60.0)) * 7.0));
  ground += vec3(0.85, 0.12, 0.07) * rs * clamp((hz - uv.y) * 4.0, 0.0, 1.0) * 0.3 * uReveal;
  col = mix(col, ground, smoothstep(hz + 0.004, hz - 0.004, uv.y));

  // four ridges, far -> near, with mist between them
  float px = q.x + uMouse.x * 0.006;
  float rim = glow * 0.5 * uReveal;
  vec4 L;
  L = ridgeLayer(px * 1.0 + uMouse.x * 0.01, uv.y, hz + 0.075 - 0.02 * uDolly, 0.095, 2.2, 1.0, vec3(0.20, 0.045, 0.07), vec3(0.2, 0.04, 0.05), 0.5, rim);
  col = mix(col, L.rgb, L.a);
  float m1 = fbm(vec2(q.x * 2.2 + uTime * 0.016, uv.y * 11.0));
  col += vec3(0.3, 0.05, 0.06) * m1 * smoothstep(hz - 0.01, hz + 0.05, uv.y) * smoothstep(hz + 0.15, hz + 0.04, uv.y) * 0.45 * uReveal;

  L = ridgeLayer(px * 1.0 + uMouse.x * 0.02, uv.y, hz + 0.045 - 0.03 * uDolly, 0.085, 2.9, 7.0, vec3(0.115, 0.024, 0.045), vec3(0.15, 0.03, 0.04), 0.4, rim * 0.7);
  col = mix(col, L.rgb, L.a);
  float m2 = fbm(vec2(q.x * 2.6 - uTime * 0.022, uv.y * 13.0 + 3.0));
  col += vec3(0.26, 0.04, 0.05) * m2 * smoothstep(hz - 0.03, hz + 0.02, uv.y) * smoothstep(hz + 0.1, hz + 0.01, uv.y) * 0.5 * uReveal;

  L = ridgeLayer(px * 1.0 + uMouse.x * 0.035, uv.y, hz + 0.015 - 0.04 * uDolly, 0.07, 3.8, 15.0, vec3(0.058, 0.012, 0.028), vec3(0.1, 0.02, 0.03), 0.3, rim * 0.4);
  col = mix(col, L.rgb, L.a);

  L = ridgeLayer(px * 1.0 + uMouse.x * 0.055, uv.y, hz - 0.045 - 0.05 * uDolly, 0.06, 5.0, 31.0, vec3(0.018, 0.004, 0.01), vec3(0.0), 0.0, 0.0);
  col = mix(col, L.rgb, L.a);

  // ground mist drifting in the foreground
  float m3 = fbm(vec2(q.x * 1.5 + uTime * 0.03, uv.y * 7.0 + 9.0));
  col += vec3(0.22, 0.035, 0.04) * m3 * smoothstep(hz + 0.02, hz - 0.1, uv.y) * smoothstep(0.0, hz - 0.1, uv.y) * 0.55 * uReveal;

  // after the gate: the world goes dark, a red light waits at the end of the road
  col *= mix(1.0, 0.1, uTunnel);
  col += vec3(0.55, 0.07, 0.05) * exp(-length((q - vec2(0.0, hz + 0.02)) * vec2(1.0, 1.7)) * 7.5) * uTunnel;

  col = mix(col, vec3(0.0), smoothstep(0.08, 0.0, uv.y) * 0.6);
  gl_FragColor = vec4(col, 1.0);
}
`;

/** Particles: embers, rain, petals, dust, wisps. One draw call, everything animated on the GPU. */
export const PARTICLE_VERT = /* glsl */ `
attribute vec4 aRand;
uniform float uTime, uSize, uScale, uSpeed, uSway;
uniform vec3 uBox, uCenter, uVel;
varying float vA;
varying float vR;
void main(){
  vec3 vel = uVel * (0.4 + aRand.x * 1.2);
  vec3 p = position + vel * uTime * uSpeed / uBox;
  p.x += sin(uTime * 0.4 + aRand.y * 6.28) * uSway / uBox.x;
  p = fract(p);
  vec3 world = uCenter + (p - 0.5) * uBox;
  vec4 mv = modelViewMatrix * vec4(world, 1.0);
  gl_Position = projectionMatrix * mv;
  float tw = 0.5 + 0.5 * sin(uTime * (2.0 + aRand.z * 4.0) + aRand.w * 30.0);
  gl_PointSize = uSize * (0.4 + aRand.w * 0.9) * uScale / max(-mv.z, 0.1);
  float edge = smoothstep(0.0, 0.12, p.x) * smoothstep(1.0, 0.88, p.x) * smoothstep(0.0, 0.12, p.y) * smoothstep(1.0, 0.88, p.y) * smoothstep(0.0, 0.12, p.z) * smoothstep(1.0, 0.88, p.z);
  vA = (0.35 + 0.65 * tw) * edge;
  vR = aRand.z;
}
`;
export const PARTICLE_FRAG = /* glsl */ `
precision highp float;
uniform vec3 uColor, uColor2;
uniform float uOpacity, uStreak;
varying float vA;
varying float vR;
void main(){
  vec2 c = gl_PointCoord - 0.5;
  float d = uStreak > 0.5 ? length(vec2(c.x * 6.0, c.y)) * 2.0 : length(c) * 2.0;
  float a = smoothstep(1.0, 0.0, d);
  a *= a;
  vec3 col = mix(uColor, uColor2, vR);
  gl_FragColor = vec4(col * (0.6 + 0.9 * a), a * vA * uOpacity);
}
`;

/** Dark lacquered silhouettes lit only by the moon behind them (torii, rocks, door frame). */
export const SIL_VERT = /* glsl */ `
varying vec3 vN; varying vec3 vV; varying float vDepth; varying vec3 vW;
void main(){
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vN = normalize(normalMatrix * normal);
  vV = normalize(-mv.xyz);
  vDepth = -mv.z;
  vW = (modelMatrix * vec4(position, 1.0)).xyz;
  gl_Position = projectionMatrix * mv;
}
`;
export const SIL_FRAG = /* glsl */ `
precision highp float;
varying vec3 vN; varying vec3 vV; varying float vDepth; varying vec3 vW;
uniform vec3 uBase, uRim, uFog, uLightV;
uniform float uFogNear, uFogFar, uGlow, uGroundFog;
void main(){
  vec3 n = normalize(vN);
  float ndv = max(dot(n, normalize(vV)), 0.0);
  float rim = pow(1.0 - ndv, 2.2);
  float back = max(dot(n, normalize(uLightV)), 0.0);
  vec3 col = uBase + uRim * rim * (0.25 + 1.0 * back) + vec3(0.6, 0.06, 0.05) * pow(back, 5.0) * 0.22 * uGlow;
  col = mix(col, uFog, smoothstep(uGroundFog, -1.5, vW.y) * 0.55);     // fog pooling at the base
  col = mix(col, uFog, smoothstep(uFogNear, uFogFar, vDepth));
  gl_FragColor = vec4(col, 1.0);
}
`;

/** Flat cut-out (the lone shinobi): pure black shape + red rim from the alpha edge. */
export const CUT_VERT = /* glsl */ `
varying vec2 vUv; varying float vDepth;
void main(){ vUv = uv; vec4 mv = modelViewMatrix * vec4(position, 1.0); vDepth = -mv.z; gl_Position = projectionMatrix * mv; }
`;
export const CUT_FRAG = /* glsl */ `
precision highp float;
varying vec2 vUv; varying float vDepth;
uniform sampler2D uTex; uniform vec3 uRim, uFog; uniform vec2 uTexel; uniform float uFogNear, uFogFar, uOpacity;
void main(){
  float a = texture2D(uTex, vUv).a;
  float s = 0.25 * (texture2D(uTex, vUv + vec2(uTexel.x * 4.0, 0.0)).a + texture2D(uTex, vUv - vec2(uTexel.x * 4.0, 0.0)).a + texture2D(uTex, vUv + vec2(0.0, uTexel.y * 4.0)).a + texture2D(uTex, vUv - vec2(0.0, uTexel.y * 4.0)).a);
  float edge = clamp((a - s) * 3.2, 0.0, 1.0);
  vec3 col = vec3(0.004, 0.0, 0.006) + uRim * edge;
  col = mix(col, uFog, smoothstep(uFogNear, uFogFar, vDepth));
  gl_FragColor = vec4(col, a * uOpacity);
}
`;

/** Plain textured plane that fades at its edges (foreground branches / grass). */
export const SPRITE_FRAG = /* glsl */ `
precision highp float;
varying vec2 vUv; uniform sampler2D uTex; uniform float uOpacity;
void main(){ vec4 t = texture2D(uTex, vUv); gl_FragColor = vec4(t.rgb, t.a * uOpacity); }
`;
export const UV_VERT = /* glsl */ `
varying vec2 vUv;
void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;

/** Shinobi showcase: art with a smoke-and-ember dissolve, a sword-slash flash and chromatic split. */
export const CHAR_FRAG = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform sampler2D uA, uB;
uniform float uMix, uTime, uAspect, uAnchorX, uZoom, uFlash, uLight, uHas;
uniform vec3 uAccA, uAccB;
uniform vec2 uMouse;
${'' /* NOISE prepended */}

vec4 art(sampler2D t, vec2 au, float has){
  vec3 c = texture2D(t, clamp(au, 0.0, 1.0)).rgb;
  float ex = smoothstep(0.0, 0.3, au.x) * smoothstep(1.0, 0.7, au.x);
  float ey = smoothstep(0.0, 0.09, au.y) * smoothstep(1.0, 0.91, au.y);
  return vec4(c, ex * ey * has);
}
void main(){
  vec2 c = vUv - vec2(uAnchorX, 0.5);
  c.x *= uAspect;
  vec2 au = c / uZoom + 0.5 + uMouse * 0.014;
  float ca = 0.007 * sin(3.14159 * uMix);
  vec4 A = art(uA, au, 1.0);
  vec4 B = art(uB, au, 1.0);
  A.r = art(uA, au + vec2(ca, 0.0), 1.0).r; A.b = art(uA, au - vec2(ca, 0.0), 1.0).b;
  B.r = art(uB, au + vec2(ca, 0.0), 1.0).r; B.b = art(uB, au - vec2(ca, 0.0), 1.0).b;

  float n = fbm(vUv * vec2(uAspect, 1.0) * 3.2 + vec2(0.0, uTime * 0.06));
  float dn = n * 0.82 + (1.0 - vUv.x) * 0.18;
  float tt = uMix * 1.22 - 0.08;
  float showB = 1.0 - smoothstep(tt - 0.05, tt, dn);
  float edge = smoothstep(tt - 0.075, tt - 0.04, dn) * (1.0 - smoothstep(tt - 0.04, tt + 0.012, dn));
  vec3 acc = mix(uAccA, uAccB, uMix);
  vec3 col = mix(A.rgb, B.rgb, showB);
  float alpha = mix(A.a, B.a, showB);
  col += (acc * 1.5 + vec3(0.12)) * edge * 0.55 * step(0.001, uMix) * step(uMix, 0.999);

  // sword-slash flash across the screen at the middle of the transition
  float sl = smoothstep(0.009, 0.0, abs((vUv.x - (uMix * 1.7 - 0.35)) + (vUv.y - 0.5) * 0.6));
  col += (acc * 1.2 + vec3(0.35)) * sl * uFlash * 0.8;

  col *= alpha;
  col += acc * 0.05 * (0.4 + fbm(vUv * 3.0 + uTime * 0.04)) * (1.0 - alpha);   // tinted fog where the art fades out
  col += vec3(0.5, 0.65, 1.0) * uLight * alpha * 0.55;                           // lightning flash (Raijin)
  col = (col - 0.5) * 1.1 + 0.5 * step(0.0001, alpha + 0.001);
  col = max(col, vec3(0.0));
  gl_FragColor = vec4(col, 1.0);
}
`;

/** Ten realms: the camera slides sideways from one world into the next through a band of mist. */
export const REALM_FRAG = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform sampler2D uA, uB;
uniform float uS, uPanA, uPanB, uAspect, uTime, uImgAspect, uZoom, uHasA, uHasB;
uniform vec3 uTintA, uTintB;
${'' /* NOISE prepended */}

vec2 cover(vec2 uv, float pan, float zoom){
  vec2 s = uAspect > uImgAspect ? vec2(1.0, uImgAspect / uAspect) : vec2(uAspect / uImgAspect, 1.0);
  s /= zoom;
  float mx = (1.0 - s.x) * 0.5;
  return (uv - 0.5) * s + vec2(0.5 + (pan - 0.5) * 2.0 * mx, 0.5);
}
void main(){
  float seam = 1.0 - uS;
  float w = (fbm(vec2(vUv.y * 4.0, uTime * 0.2)) - 0.5) * 0.16;
  float m = smoothstep(seam - 0.1 + w, seam + 0.1 + w, vUv.x);
  vec2 ua = cover(vUv + vec2(uS * 0.14, 0.0), uPanA, uZoom);
  vec2 ub = cover(vUv - vec2((1.0 - uS) * 0.14, 0.0), uPanB, uZoom);
  vec3 a = texture2D(uA, ua).rgb * uTintA;
  vec3 b = texture2D(uB, ub).rgb * uTintB;
  vec3 col = mix(a, b, m);
  float band = exp(-pow((vUv.x - seam - w) * 5.5, 2.0)) * sin(3.14159 * clamp(uS, 0.0, 1.0));
  col = mix(col, vec3(0.05, 0.03, 0.05) + mix(uTintA, uTintB, uS) * 0.18, band * 0.85);
  col += mix(uTintA, uTintB, m) * band * 0.18;
  col = (col - 0.5) * 1.07 + 0.5;
  col = max(col, vec3(0.0));
  gl_FragColor = vec4(col, 1.0);
}
`;

/** Door: light shafts + eyes + glow. */
export const SHAFT_FRAG = /* glsl */ `
precision highp float;
varying vec2 vUv; uniform float uOpen, uTime; uniform vec3 uColor;
${'' /* NOISE prepended */}
void main(){
  float across = smoothstep(0.5, 0.0, abs(vUv.x - 0.5));
  float along = smoothstep(0.0, 0.12, vUv.y) * smoothstep(1.0, 0.25, vUv.y);
  float n = 0.65 + 0.35 * fbm(vec2(vUv.x * 5.0 + uTime * 0.08, vUv.y * 2.0 - uTime * 0.15));
  float a = pow(across, 1.6) * along * n * uOpen;
  gl_FragColor = vec4(uColor * a * 1.3, a);
}
`;
export const EYE_FRAG = /* glsl */ `
precision highp float;
varying vec2 vUv; uniform float uOn, uBlink;
void main(){
  vec2 p = vUv - 0.5;
  float d = length(vec2(p.x * 1.0, p.y * 3.4 / max(uBlink, 0.05)));
  float core = smoothstep(0.34, 0.0, d);
  float halo = smoothstep(0.7, 0.0, length(p * vec2(1.0, 1.6)));
  vec3 col = vec3(1.0, 0.32, 0.14) * core * 2.0 + vec3(0.9, 0.08, 0.04) * halo * 0.6;
  gl_FragColor = vec4(col * uOn, (core + halo * 0.5) * uOn);
}
`;
export const GLOW_FRAG = /* glsl */ `
precision highp float;
varying vec2 vUv; uniform vec3 uColor; uniform float uA;
void main(){ float d = length(vUv - 0.5) * 2.0; float a = pow(smoothstep(1.0, 0.0, d), 2.0) * uA; gl_FragColor = vec4(uColor * a, a); }
`;
export const MIST_FRAG = /* glsl */ `
precision highp float;
varying vec2 vUv; uniform float uTime, uA; uniform vec3 uColor;
${'' /* NOISE prepended */}
void main(){
  float n = fbm(vec2(vUv.x * 4.0 + uTime * 0.05, vUv.y * 3.0 - uTime * 0.03));
  float e = smoothstep(0.0, 0.3, vUv.x) * smoothstep(1.0, 0.7, vUv.x) * smoothstep(0.0, 0.35, vUv.y) * smoothstep(1.0, 0.5, vUv.y);
  float a = smoothstep(0.35, 0.8, n) * e * uA;
  gl_FragColor = vec4(uColor * a, a);
}
`;
