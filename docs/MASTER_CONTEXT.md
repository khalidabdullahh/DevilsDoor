# MASTER_CONTEXT.md — Project Vision & Locked Decisions

> **PROJECT**: DEVIL'S DOOR  
> **TAGLINE**: REACH THE DOOR. TRUST NOTHING.  
> **FOUNDER & LEAD MAINTAINER**: Khalid Abdullah  
> **PROJECT CREDIT**: FROM THE CREATORS OF AUREX  
> **CANONICAL REPOSITORY**: `https://github.com/khalidabdullahh/DevilsDoor`

---

## 1. Executive Summary

**Devil's Door** is an original, production-quality 2.5D deceptive platformer designed to deliver surprise, curiosity, experimentation, tension, discovery, "aha!" moments, and mastery.

The player's goal in every level is straightforward: **Reach the Door**.  
However, the environment, platforms, gravity, visual cues, hazards, and the Door itself subvert traditional platformer assumptions.

---

## 2. Locked Core Principles

1. **Absolute Originality**:
   - Devil's Door does NOT copy *Level Devil*, *Oops!*, or any other deceptive platformer in source code, artwork, character designs, level sequences, branding, or sound effects.
   - All mechanics, level geometry, and visual identities are built from first principles.

2. **Every Death Must Teach Something**:
   - Deception must be discoverable and learnable.
   - The ideal emotional arc after failure is: *"Ah. Now I see what happened."*
   - Unfair, invisible, untelegraphed instant deaths without logic are strictly prohibited.

3. **Continuous World Architecture**:
   - The game takes place in one continuous, cohesive realm: **The Devil's Domain**.
   - No disjointed candy worlds or disconnected themes; rather, a gradual descent through Acts I to VII.

4. **Snappy & Forgiving Physics**:
   - Precision platforming feel with coyote time, jump buffering, and instant (<80ms) respawns.
   - Failure is attributed to player observation and assumptions, not slippery or imprecise controls.

5. **Founder-Led Governance**:
   - Open source with curated merging and final architectural authority retained by Khalid Abdullah.

---

## 3. Technology Architecture

- **Rendering**: 2.5D perspective/isometric depth rendering using WebGL/Canvas with stylized shadows, volumetric ambient lighting, and high contrast silhouettes.
- **Audio Engine**: Procedural Web Audio API sound synthesis with zero external audio assets for minimal bundle size and instant loading.
- **Architecture**: Modular ECMAScript modules (ESM) with clear separation of Physics, Deception Engine, Level Definitions, Renderer, Audio, and UI.
- **Platform Targets**: Desktop (Chrome, Firefox, Safari, Edge) and Mobile (iOS Safari, Android Chrome, Capacitor/PWA wrapper ready).

---

## 4. Locked Decisions Summary

| Decision ID | Area | Decision | Rationale |
|---|---|---|---|
| **ADR-001** | Architecture | Modular ESM + Zero-Build Canvas/WebGL 2.5D | Ensures fast local testing, easy contributor onboarding, zero dependency rot. |
| **ADR-002** | Audio | Procedural Web Audio API Synthesis | Guarantees instant load, 0KB audio assets, dynamic pitch/ambiance modulation. |
| **ADR-003** | Gameplay | Trigger-Condition-Action Deception Engine | Reusability across 100-200 levels without hardcoding hacks. |
| **ADR-004** | Door System | Modular Deceptive States (Decoy, Shift, Gate) | Avoids repeating old tropes (e.g. rising door) and delivers fresh surprises. |
| **ADR-005** | UI & Web | Semantic Tokens + System Light/Dark Theme | Premium indie aesthetic with full accessibility and responsiveness. |
