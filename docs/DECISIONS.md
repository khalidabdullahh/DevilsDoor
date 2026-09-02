# DECISIONS.md — Architecture Decision Records (ADRs)

> **PROJECT**: DEVIL'S DOOR  
> **FOUNDER**: Khalid Abdullah

---

## ADR-001: Modular ESM Architecture with Zero-Build Requirement

- **Date**: 2026-09-01
- **Status**: LOCKED
- **Context**: We need a game architecture that is contributor-friendly, fast to iterate, runs directly in modern browsers without heavy bundling toolchains, and scales cleanly to 100+ levels.
- **Decision**: Use native ECMAScript Modules (`import` / `export`) with standard HTML5 Canvas/WebGL rendering.
- **Consequences**: Instant local testing via `python3 -m http.server`, zero dependency vulnerabilities from fragile bundler plugins, and clean modular code organization.

---

## ADR-002: Procedural Web Audio Synthesis

- **Date**: 2026-09-01
- **Status**: LOCKED
- **Context**: Loading dozens of external `.wav`/`.mp3` files adds network latency, bundle weight, asset licensing risks, and potential playback delays on mobile.
- **Decision**: Implement all sound effects (jumps, lands, katana slashes, clashes, stone collapses, portal hums, death disintegrations) procedurally using the Web Audio API (`AudioContext`, `OscillatorNode`, `GainNode`, `BiquadFilterNode`).
- **Consequences**: Zero audio asset downloads, instant playback latency, and dynamic parameter modulation during gameplay.

---

## ADR-003: Data-Driven Deception Engine (Trigger-Condition-Action)

- **Date**: 2026-09-01
- **Status**: LOCKED
- **Context**: Hardcoding level-specific traps inside the player or game update loop causes spaghetti code and makes adding 100+ levels unmaintainable.
- **Decision**: Separate level logic into a data-driven Deception Engine utilizing declarative Triggers, Conditions, and Actions.
- **Consequences**: Levels are defined as clean configuration objects that can be serialized, validated, and extended by open-source contributors safely.

---

## ADR-004: Original Door Deception Mechanics

- **Date**: 2026-09-01
- **Status**: LOCKED
- **Context**: Other games have used repetitive tropes (such as the door rising into the sky). Devil's Door must establish a completely original identity.
- **Decision**: Forbid copying old door behaviors. The Door system must support varied original subversions (decoy portals, polarity locks, dimensional shifts, reverse approach requirements).
- **Consequences**: Preserves unique brand identity and prevents player fatigue.

---

## ADR-005: System-Aware Light/Dark Theme for Marketing Website

- **Date**: 2026-09-01
- **Status**: LOCKED
- **Context**: The official website must appeal to both desktop and mobile users while maintaining accessible contrast in both bright daylight and dark environments.
- **Decision**: Implement CSS custom properties with automatic system preference detection (`prefers-color-scheme`) and a 3-way toggle (System / Light / Dark).
- **Consequences**: Seamless modern UX matching top-tier indie game web portals.

---

## ADR-006: 3D Engine Migration to Babylon.js for Production Ninja Action-Platformer

- **Date**: 2026-09-02
- **Status**: LOCKED
- **Context**: The game requires a premium 3D dark fantasy visual benchmark (inspired by Ninja Arashi 2 / Shadow Blade), true perspective depth, volumetric fog, dynamic lighting/shadows, and stylized 3D ninja character mesh with katana combat.
- **Decision**: Migrate the rendering architecture to **Babylon.js** (supporting WebGPU with automatic WebGL fallback) with a side-focused cinematic 3D camera.
- **Consequences**: Delivers high-fidelity 3D graphics, procedural particle VFX, dynamic katana combat, and seamless cross-platform performance across desktop and mobile.
