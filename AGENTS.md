# AGENTS.md — Agent & Developer Workflow Guide

> **PROJECT**: DEVIL'S DOOR  
> **TAGLINE**: REACH THE DOOR. TRUST NOTHING.  
> **FOUNDER & LEAD MAINTAINER**: Khalid Abdullah  
> **CANONICAL REPOSITORY**: `https://github.com/khalidabdullahh/DevilsDoor`

---

## 1. Role & Identity

When contributing to Devil's Door as an autonomous AI agent or contributor, you operate as a:
- **Senior Game Engineer**
- **Deception Systems Architect**
- **UX & Gameplay Feel Specialist**
- **High-Standard Open-Source Maintainer**

Always uphold the core identity:
- **Originality**: Zero plagiarism. Do not copy code, visual identifiers, or trap sequences from *Level Devil*, *Oops!*, or other titles.
- **Fairness & Learnability**: "EVERY DEATH MUST TEACH SOMETHING." The player must understand why failure occurred and be able to adapt immediately.
- **Clean Architecture**: Modular separation of Physics, Deception Engine, Level Definitions, Renderer, Audio, and UI.

---

## 2. Source of Truth & Locked Decisions

Before modifying or designing mechanics:
1. Consult [`docs/MASTER_CONTEXT.md`](docs/MASTER_CONTEXT.md) for locked design constraints and core principles.
2. Consult [`docs/DECISIONS.md`](docs/DECISIONS.md) to review past Architecture Decision Records (ADRs).
3. Do not silently reverse locked architectural decisions or compromise the founder-led governance model.

---

## 3. Workflow for Agents & Contributors

Follow the systematic cycle:

```
INSPECT -> PLAN -> IMPLEMENT -> TEST -> REVIEW -> COMMIT -> PUSH -> DEPLOY
```

### Critical Rules for Execution:
1. **Never Assume State**: Inspect directory structure and existing code before proposing modifications.
2. **Preserve Modularity**: Do not lump unrelated gameplay logic or level scripts into monolithic files.
3. **Validate Uniqueness**: Every new level must have an entry in [`docs/LEVEL_DESIGN_BIBLE.md`](docs/LEVEL_DESIGN_BIBLE.md) verifying its unique mechanic, player expectation, deception, and solution.
4. **Run Automated Integrity Checks**: Execute `node scripts/test-integrity.js` before submitting changes.
5. **No Secrets**: Never commit or log API keys, private credentials, or environment secrets.

---

## 4. Code Standards & Architecture

- **JavaScript/ESM**: Write clean, modern ECMAScript modules with explicit imports and exports.
- **2.5D Renderer**: Keep rendering logic strictly decoupled from physical collision boxes and state triggers.
- **Deception Engine**: Implement new traps by defining data-driven triggers (`Trigger`), conditions (`Condition`), and actions (`Action`) rather than embedding hardcoded hacks inside the main player loop.
- **Audio Synthesis**: Use `AudioManager` procedural methods so the game remains completely self-contained without bulky binary audio files.
- **Responsive Layout**: Ensure UI overlay, touch D-pad, and action buttons scale cleanly across mobile viewports (360x640 to 430x932) and desktop screens (1080p, 1440p, 4K).

---

## 5. Founder Governance

All contributions are subject to review and final authority by **Khalid Abdullah**. Refer to [`GOVERNANCE.md`](GOVERNANCE.md) for details on curated merging and product protection.

---

## 6. Landing Page & Standalone Selection Pages Architecture

### 6.1 Landing Page (`index.html`)
`index.html` (+ identical copy `website/index.html`) is a poster-style hero: huge headline, founder cutout portrait, Play Now -> `/game`. Styles in `website/css/landing.css`, headline fitting in `website/js/hero-fit.js`, display font Dela Gothic One (self-hosted, OFL). The earlier scroll-driven WebGL journey is kept at `/cinematic` (`cinematic.html`).

### 6.2 Selection Pages Plan (Landing -> Character -> Realm -> Game)
**Goal:** The in-game select screens load WebP assets to eliminate memory bloat and lag.

**Locked decisions (from Founder Khalid Abdullah):**
1. Realms stay **exactly** as they are: same 10 artworks, names, and order (data from `SCENE_ROSTER`).
2. Pages follow the landing look: lavender frame, black rounded border, huge slate type, orange accent, Dela Gothic One + Barlow Condensed (`website/css/landing.css` tokens).
3. Heroes are shown as real characters: transparent cutout in front of the big name, slow breathing float, small parallax, accent colour per hero from `CHARACTER_ROSTER`, real stats (speed, jump, hearts, power, stealth) as bars.
4. Data strictly from `CHARACTER_ROSTER`, `SCENE_ROSTER`, and the economy.
5. Flow: `/` -> `/select/character` -> `/select/realm` -> `/game`, with back buttons and 3-step indicator.
6. Performance: only selected item and ±2 neighbours load images (`loadWindow` in `src/js/ui/selectLayout.js`); thumbnails are tiny WebP; animate only `transform`/`opacity`.

**Implementation Status:**
- [x] 1. Light assets done: `src/assets/web/select-hero-0N.webp` and `realm-NN-sm.webp`.
- [x] 2. In-game character & realm select overhauled with stat bars, particle aura, lore, difficulty stars, and reactive backdrop.
- [ ] 3. Dedicated standalone `/select/character` & `/select/realm` routes.

### 6.3 Cinematic Landing (`cinematic.html`)
Status & guidelines in [`docs/LANDING_ROADMAP.md`](docs/LANDING_ROADMAP.md) and [`docs/LANDING_BRIEF.md`](docs/LANDING_BRIEF.md). Creative rule: *atmosphere over UI, cinematic transition over another card, visual storytelling over more text.*

---

## 7. Active Overhaul — Visual Quality & Performance (v2.3)

> **Status**: COMPLETED & LIVE — Approved by Khalid Abdullah (2026-10-04)  
> **Scope**: Landing page performance, Character/Realm Selection cinematic upgrade, In-game realm depth, HUD improvements.

### 7.1 What Was Changed & Why

#### Phase 1 — Landing Page Performance
- Split into lightning-fast poster hero on `/` and full 3D scroll journey on `/cinematic`.

#### Phase 2 — Character Selection (`src/js/ui/CharacterSelect.js`, `src/js/data/CharacterRoster.js`)
- Added `stats: { speed, power, stealth }` to every character in `CharacterRoster.js`.
- Character select screen shows: animated particle aura (canvas overlay), CSS clip-path name reveal on switch, backdrop reactive to `glowColor`, and a SPEED / POWER / STEALTH stat bar strip below the CTA.

#### Phase 3 — Realm Selection (`src/js/ui/SceneSelect.js`, `src/js/data/SceneRoster.js`)
- Added `lore`, `difficulty` (1-5), and `particleType` fields to every scene in `SceneRoster.js`.
- Realm select screen shows: 1-line lore tagline, difficulty star rating (★), and atmospheric CSS particle animation in backdrop matching the realm's `particleType`.

#### Phase 4 — In-Game Realm Depth (`src/js/render/NinjaArashiRenderer.js`)
- **3-Layer Parallax Silhouettes**: Replaced single-layer dark fill with FAR (0.08x, opacity 0.45) / MID (0.18x, opacity 0.65) / NEAR (0.35x, opacity 0.85) depth layers, each with biome-specific shapes.
- **Ground Reflection Sheen**: Thin gradient strip at platform level, biome-tinted, pulsing with `Math.sin(time)`.
- **Atmospheric Depth Haze**: Horizontal gradient band at screen 40-60% height, `opacity ≈ 0.15`.
- **Enhanced Particles**: 3 size tiers per biome, biome-specific shapes (embers/snow/spores/ash).
- **Time-of-day Lighting Pulse**: overlay brightness oscillates with `Math.sin(time * 0.3)`.

#### Phase 5 — HUD (`src/js/ui/UIManager.js`, `src/css/game.css`)
- `--hud-accent-live` CSS variable set per biome on every HUD update — health dots and ammo pips inherit this color.
- Distance display pulses (600ms glow class) every 1000m milestone.
- Last health dot (1 HP) triggers rapid danger pulse animation + red tint.
- Depleted dots render with `clip-path` cracked visual.

### 7.2 Architectural Constraints (DO NOT REVERT)
- `NinjaArashiRenderer._drawParallaxSilhouettes` must stay 3-layer. Do not collapse back to a single layer.
- `CharacterRoster.js` entries must include `stats.speed`, `stats.power`, `stats.stealth` (0-100).
- `SceneRoster.js` entries must include `lore`, `difficulty` (number 1-5), `particleType` string.
- `--hud-accent-live` is the single source of truth for HUD accent color. Do not hardcode colors in UIManager.

### 7.3 Files Modified in This Overhaul
```
src/js/data/CharacterRoster.js   ← Data: stats field added
src/js/data/SceneRoster.js       ← Data: lore, difficulty, particleType added
src/js/ui/CharacterSelect.js     ← UI: particle aura, name animation, stat bars
src/js/ui/SceneSelect.js         ← UI: lore line, difficulty stars, atmospheric particles
src/js/render/NinjaArashiRenderer.js ← Renderer: 3-layer parallax, shimmer, haze, enhanced particles
src/js/ui/UIManager.js           ← HUD: --hud-accent-live, danger pulse, distance flash
src/css/game.css                 ← Styles: all new visual features
```
