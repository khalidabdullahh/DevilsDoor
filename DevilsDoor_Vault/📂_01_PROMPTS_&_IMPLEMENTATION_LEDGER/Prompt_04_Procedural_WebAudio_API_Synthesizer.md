---
title: "Prompt 04: Zero-Asset Procedural Web Audio API Synthesizer"
aliases: ["Prompt 04", "Audio Synthesizer"]
tags:
  - prompt-log
  - audio
  - webaudio
  - project/devils-door
created: 2026-09-02
status: completed
---

# 📝 Prompt 04: Zero-Asset Procedural Web Audio API Synthesizer (0 KB Assets)

> **Vault Hub**: [[⛩️_00_MASTER_INDEX]]  
> **Previous**: [[Prompt_03_Trigger_Condition_Action_Deception_Engine]]  
> **Next**: [[Prompt_05_Official_6_Hero_Roster_&_Verlet_Cloth_Scarf]]

---

## 🗣️ User Prompt & Requirement Statement

> [!QUOTE] **Founder's Directive:**  
> "Avoid external sound files (MP3/WAV/OGG) to keep the repository and build bundle ultra-light and fast loading. Build a real-time procedural Web Audio API synthesizer capable of generating all sound effects, ambient drones, and UI musical feedback programmatically."

---

## 🧠 Technical Formulation

1. **Oscillator Nodes**: Sine, Triangle, Square, and Sawtooth waveforms with dynamic frequency exponential ramps.
2. **Procedural Noise Generator**: Algorithmic white/pink/brown noise buffer creation for slashes, footsteps, and crumbling stone.
3. **Envelope Shaping (ADSR)**: Precise attack, decay, sustain, and release curves via `GainNode` audio parameters.

---

## 💻 Step-by-Step Implementation (`src/js/core/audio.js`)

```javascript
export class SoundSynthesizer {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
  }

  init() {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioCtx();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.4, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);
  }

  playKatanaSlash() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    // 1. Noise Burst for Blade Friction
    const buffer = this.createNoiseBuffer(0.08);
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2400, now);
    filter.frequency.exponentialRampToValueAtTime(300, now + 0.08);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

    noise.connect(filter).connect(gain).connect(this.masterGain);
    noise.start(now);
  }

  createNoiseBuffer(seconds) {
    const length = this.ctx.sampleRate * seconds;
    const buffer = this.ctx.createBuffer(1, length, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }
}
```

---

## 🎯 Verification & Results
- Total Audio Download Payload: **0.00 KB**.
- Zero decoding latency or browser audio buffer bottlenecks.

---
*Related: [[Procedural_Audio_Synthesis_Bible]], [[Architecture_Decision_Records_ADRs]]*
