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

---

## ADR-007: Cinematic, Dark-Only, Scroll-Driven Landing Page (supersedes ADR-005 for `/` only)

- **Date**: 2026-10-02
- **Status**: PROPOSED (needs founder confirmation: it reverses part of a LOCKED decision)
- **Context**: The founder asked for the landing page to be completely rebuilt as a premium, cinematic "scroll = journey" experience (see `docs/LANDING_BRIEF.md`). ADR-005 required a system-aware light/dark theme with a 3-way toggle for the marketing website.
- **Decision**: The landing page (`/`) is dark-only: its identity is a night scene lit by a red moon, and a light theme would contradict it. The game and any future content pages are unaffected. The page is built with vendored Three.js r128 + native ES modules (no build step), independent of the game engine (ADR-006 / Babylon.js), and is never loaded by the game. Without JS/WebGL/with reduced motion it degrades to a plain, readable, dark page.
- **Consequences**: No light theme or toggle on `/` (accessibility is covered by contrast, semantic HTML, keyboard access and the static fallback). Two 3D libraries exist in the repo (Babylon.js for the game, Three.js for the landing); they never load together. If the founder wants a light theme back, build it for the static layout only.

---

## ADR-008: Dark Mobile-Game UI for In-Game Screens; Landing Stays Lavender (amends ADR-007 scope notes and AGENTS.md 6.2)

- **Date**: 2026-10-05
- **Status**: ACCEPTED (founder-requested)
- **Context**: The founder wants the Shinobi and Realm screens to feel like a mobile game (hero on a pedestal, framed panels, big bevelled CTA) and the touch buttons to look realistic, while the lavender landing page is approved as-is.
- **Decision**: Introduce `src/css/ui-kit.css` as the single styling layer for in-game select screens and touch/HUD buttons. Landing page is unchanged by it. Gold/ember accents and the two self-hosted fonts connect both looks. Pure CSS/SVG first; painted textures are optional later.
- **Consequences**: Consistent, retheme-able look; phone-safe (transform/opacity only). The `/select/*` standalone routes remain a future option.
