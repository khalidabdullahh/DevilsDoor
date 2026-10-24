// Synthesised SFX + generative ambience (WebAudio). Placeholder until real recorded audio is dropped in.
let ctx = null, master = null, noiseBuf = null, muted = false, bossMode = false, musicTimer = null, beat = 0;

export function initAudio() {
  if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  ctx = new AC();
  master = ctx.createGain(); master.gain.value = muted ? 0 : 0.55; master.connect(ctx.destination);
  noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  startMusic();
}
export const isMuted = () => muted;
export function toggleMute() { muted = !muted; if (master) master.gain.value = muted ? 0 : 0.55; return muted; }
export function setBossMode(on) { bossMode = on; }

function tone(type, f0, f1, dur, vol = 0.2, delay = 0) {
  if (!ctx) return;
  const t = ctx.currentTime + delay, o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.05);
}
function noise(dur, f0, f1, vol = 0.2, q = 1, type = 'bandpass', delay = 0) {
  if (!ctx) return;
  const t = ctx.currentTime + delay, s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
  s.buffer = noiseBuf; s.loop = true; f.type = type; f.Q.value = q;
  f.frequency.setValueAtTime(f0, t); f.frequency.exponentialRampToValueAtTime(Math.max(40, f1), t + dur);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(f); f.connect(g); g.connect(master); s.start(t); s.stop(t + dur + 0.05);
}

export const sfx = {
  swish(i = 0) { noise(0.16, 1800 + i * 500, 5200 + i * 800, 0.22, 2.2); },
  hit() { noise(0.12, 2600, 500, 0.4, 0.8); tone('square', 220, 70, 0.12, 0.22); tone('sine', 120, 45, 0.18, 0.4); },
  clash() { tone('triangle', 1700, 1100, 0.3, 0.25); tone('square', 2400, 1800, 0.15, 0.12); noise(0.1, 6000, 3000, 0.3, 1.5, 'highpass'); },
  jump() { tone('sine', 300, 620, 0.14, 0.12); noise(0.1, 800, 2200, 0.07, 1); },
  land() { noise(0.12, 500, 160, 0.2, 0.7, 'lowpass'); },
  dash() { noise(0.22, 700, 4200, 0.28, 1.4); },
  throw() { noise(0.12, 2400, 6500, 0.15, 3); },
  orb() { tone('sine', 880, 1320, 0.16, 0.14); tone('sine', 1320, 1760, 0.2, 0.1, 0.07); },
  hurt() { tone('sawtooth', 260, 70, 0.28, 0.3); noise(0.2, 900, 200, 0.3, 0.6); },
  die() { tone('sawtooth', 200, 40, 0.6, 0.3); noise(0.5, 1200, 100, 0.35, 0.5); },
  arrow() { noise(0.18, 3000, 1500, 0.18, 3); tone('triangle', 900, 500, 0.1, 0.1); },
  warn() { tone('square', 740, 740, 0.07, 0.07); tone('square', 988, 988, 0.1, 0.07, 0.08); },
  slam() { tone('sine', 140, 30, 0.5, 0.7); noise(0.4, 900, 80, 0.5, 0.6, 'lowpass'); },
  roar() { tone('sawtooth', 110, 55, 0.8, 0.3); tone('sawtooth', 115, 50, 0.8, 0.25); noise(0.8, 600, 150, 0.3, 0.5); },
  cp() { [523, 659, 784].forEach((f, i) => tone('triangle', f, f, 0.5, 0.12, i * 0.09)); },
  win() { [392, 523, 659, 784, 1047].forEach((f, i) => tone('triangle', f, f * 1.01, 0.7, 0.14, i * 0.13)); },
  click() { tone('triangle', 620, 880, 0.07, 0.16); tone('sine', 1240, 1240, 0.05, 0.06, 0.02); },
  gate() { tone('sine', 70, 40, 1.2, 0.5); noise(1.0, 300, 80, 0.3, 0.6, 'lowpass'); },
};

// Hirajoshi scale koto plucks + (boss) taiko. No wind/noise bed: it was heard as a constant "sho sho".
function startMusic() {
  if (!ctx) return;

  const scale = [0, 2, 3, 7, 8], root = 146.8; // D3
  const step = () => {
    if (!ctx) return;
    beat++;
    if (ctx.state === 'running' && !muted) {
      if (bossMode) {
        tone('sine', 110, 40, 0.3, 0.45); noise(0.12, 300, 90, 0.2, 0.5, 'lowpass');
        if (beat % 2) tone('sine', 85, 38, 0.25, 0.3, 0.27);
        if (beat % 4 === 0) { const n = scale[(Math.random() * 5) | 0]; tone('triangle', root * 2 * Math.pow(2, n / 12), root * 2 * Math.pow(2, n / 12), 0.6, 0.1); }
      } else {
        if (beat % 6 === 1) tone('sine', root / 2, root / 2, 2.6, 0.08);
        if (Math.random() < 0.55) { const n = scale[(Math.random() * 5) | 0] + (Math.random() < 0.3 ? 12 : 0), f = root * 2 * Math.pow(2, n / 12); tone('triangle', f, f * 0.995, 1.1, 0.05); }
      }
    }
    musicTimer = setTimeout(step, bossMode ? 540 : 900 + Math.random() * 500);
  };
  step();
}
