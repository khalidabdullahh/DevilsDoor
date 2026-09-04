---
title: "Procedural Web Audio Synthesis Bible"
aliases: ["Audio Bible", "WebAudio Formulas"]
tags:
  - architecture
  - audio
  - webaudio
  - synthesis
  - project/devils-door
created: 2026-09-04
status: active
---

# 🎵 Procedural Web Audio Synthesis Bible & Frequency Formulas

> **Vault Hub**: [[⛩️_00_MASTER_INDEX]]  
> **Related**: [[Prompt_04_Procedural_WebAudio_API_Synthesizer]]

---

## 🎛️ Audio Node Pipeline Architecture

```mermaid
graph LR
    Osc[Oscillator / Noise Buffer] --> Filter[BiquadFilterNode - Lowpass / Bandpass]
    Filter --> Envelope[GainNode - ADSR Envelope]
    Envelope --> Master[Master Gain & Dynamic Compressor]
    Master --> Output[AudioDestination (Speakers / Headphones)]
```

---

## 🔬 Frequency & Envelope Formulation Table

| Sound Cue | Base Oscillator | Frequency Curve $f(t)$ | Gain Curve $G(t)$ | Filter Configuration |
|:---|:---|:---|:---|:---|
| **Jump** | `sine` | $160 \to 320\text{ Hz}$ (exp $80\text{ms}$) | $0.35 \to 0.01$ (exp $80\text{ms}$) | None |
| **Katana Slash** | `white_noise` | None | $0.60 \to 0.01$ (exp $90\text{ms}$) | Bandpass: $2400 \to 300\text{ Hz}, Q=2.8$ |
| **Shinobi Dash** | `white_noise` | None | $0.40 \to 0.01$ (exp $140\text{ms}$) | Lowpass: $1800 \to 400\text{ Hz}$ |
| **Deception Sting**| Dual `sawtooth` | $440\text{ Hz} \pm 12\text{ Hz}$ | $0.50 \to 0.01$ (exp $350\text{ms}$) | Lowpass: $1200 \to 150\text{ Hz}$ |
| **Torii Warp Gate**| Chord (`sine`) | $523.25, 659.25, 783.99\text{ Hz}$ | $0.30 \to 0.01$ (linear $600\text{ms}$)| Highpass: $400\text{ Hz}$ |
| **Sub-Bass Drone** | `sine` + `pink` | $55.0\text{ Hz}$ | Steady $0.15$ | Lowpass: $80\text{ Hz}$ |

---
*Related: [[⛩️_00_MASTER_INDEX]], [[Prompt_04_Procedural_WebAudio_API_Synthesizer]]*
