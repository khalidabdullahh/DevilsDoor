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
`index.html` (+ identical copy `website/index.html`) is a lavender poster-style hero (APPROVED by the founder, 2026-10-05; do not restyle without asking). Layout: the founder cutout portrait is **exactly centred** in front of the headline; headline = `WELCOME TO` (slate) + `DEVIL'S DOOR` (flat bright gold `--gold:#ffb800`, **no glow / text-shadow**); Play Now -> `/game`. Styles in `website/css/landing.css`, headline fitting in `website/js/hero-fit.js` (scales each line to one slab width), display font Dela Gothic One (self-hosted, OFL). The earlier scroll-driven WebGL journey is kept at `/cinematic` (`cinematic.html`).

**Mobile fullscreen / landscape (`src/js/immersive.js`, `manifest.webmanifest`)** — browsers allow fullscreen and orientation lock only right after a user tap, so it is tap-driven, never automatic:
- Landing (`data-gate="true"`): touch devices see a one-tap "PLAY FULL SCREEN" gate; portrait phones see "ROTATE YOUR PHONE". "Continue anyway" skips (remembered per session).
- **Fullscreen must be asked only ONCE.** A browser leaves fullscreen on every page navigation, so on touch devices `website/js/play.js` does NOT navigate: PLAY NOW opens `/game` in a full-viewport `<iframe allow="fullscreen">` inside the landing document (the landing document keeps the fullscreen the player already granted). The game's HOME button calls `window.ddGoHome()` (defined in `immersive.js`) which `postMessage`s the parent to close the frame; browser Back also closes it. Desktop (mouse) still navigates normally to `/game`. Opening `/game` directly (bookmark/PWA) keeps the old behaviour: first tap silently requests fullscreen; `immersive.js` returns early inside an iframe.
- iPhone Safari has no page Fullscreen API and no orientation lock: it only gets the rotate prompt. Installing via "Add to Home Screen" uses `manifest.webmanifest` (`display: fullscreen`, `orientation: landscape`).

### 6.2 Selection Pages Plan (Landing -> Character -> Realm -> Game)
**Goal:** The in-game select screens load WebP assets to eliminate memory bloat and lag.

**Locked decisions (from Founder Khalid Abdullah):**
1. Realms stay **exactly** as they are: same 10 artworks, names, and order (data from `SCENE_ROSTER`).
2. **(Amended 2026-10-05)** The landing stays the lavender poster. The in-game screens (Shinobi, Realm, HUD buttons) use a dark mobile-game UI (hero on a pedestal, framed panels, bevelled gold CTA) built from `src/css/ui-kit.css`; the landing's gold + ember accents and Dela Gothic One + Barlow Condensed are the bridge between the two looks.
3. Heroes are shown as real characters: transparent cutout in front of the big name, slow breathing float, small parallax, accent colour per hero from `CHARACTER_ROSTER`, real stats (speed, jump, hearts, power, stealth) as bars.
4. Data strictly from `CHARACTER_ROSTER`, `SCENE_ROSTER`, and the economy.
5. Flow: `/` -> `/select/character` -> `/select/realm` -> `/game`, with back buttons and 3-step indicator.
6. Performance: only selected item and ±2 neighbours load images (`loadWindow` in `src/js/ui/selectLayout.js`); thumbnails are tiny WebP; animate only `transform`/`opacity`.

**Implementation Status:**
- [x] 1. Light assets done: `src/assets/web/select-hero-0N.webp` and `realm-NN-sm.webp`.
- [x] 2. In-game character & realm select overhauled with stat bars, particle aura, lore, difficulty stars, and reactive backdrop.
- [x] 3. Realm picker lightweight: one big preview + 240px WebP thumbnail strip; only the selected realm and ±1 neighbour preload (`loadWindow`); `SceneRoster.js` derives `preview` / `thumb` / `blur` WebP paths from `image` (files in `src/assets/backgrounds/web/`).
- [x] 4. UI kit + restyled Shinobi / Realm screens + bevelled touch buttons (section 8).
- [x] 5. Dedicated standalone `/select/character` & `/select/realm` routes with poster aesthetic, stat gauges, and localStorage hand-off to `/game`.
- [~] 6. Enemy portrait art: 5 of 7 delivered and wired as flavour art (see 8.6); Cursed Monk and Oni Boss missing. (Originally: Option C, enemies deferred.) Prompt pack ready: `docs/ART_PROMPTS.md` (style block, 7 enemy prompts, UI piece prompts, hand-off checklist). Enemy roster for art: Shadow Ronin, Oni Guard, Cursed Monk, Crimson Assassin, Shadow Sentry, Oni Boss (Shadow Entity), Shadow Devil. In-game enemies stay code-drawn; AI art is for portraits/cards only.
- [x] 7. **Flow decided (2026-10-05, see 8.5):** Landing -> in-game select screens. (Previously an open question:) standalone poster-style `/select/character` and `/select/realm` pages exist (commit fbda45f), but the landing's PLAY NOW goes straight to `/game` (in-game dark-UI select screens, section 8). Both look different (lavender poster vs dark game UI). Founder must decide which flow is final before either is removed or linked.

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

---

## 8. v2.4 — UI Kit, Shinobi/Realm Screens, Touch Buttons (2026-10-05)

> **Status**: IMPLEMENTED — pending founder visual approval on a real phone.

### 8.1 What changed
- **`src/css/ui-kit.css`** (loaded after `game.css`): design tokens (`--dd-gold`, `--dd-ember`, `--dd-panel`, `--dd-display`, `--dd-ui`, `--sel-accent`), `.dd-btn` / `.vnext-primary-cta` bevelled gold CTA, pills, `.dd-panel`, pedestal, dots, touch/HUD button bevel. Fonts are self-hosted in `src/assets/fonts/`. To retheme, change tokens here, not individual rules.
- **Shinobi screen** (`CharacterSelect.js`): one hero on stage standing on a CSS pedestal (`.dd-pedestal`), name in the hero's accent colour (`--sel-accent`), info + SPD/PWR/STL bars in a left panel, big CTA bottom-right (landscape grid; stacked in portrait), dots to switch, swipe/arrows still work. Uses `hero.portrait` (alpha-cleaned `hero-0N-<name>-sel.webp`, ~100 KB) instead of the 1.4 MB sketch PNG. Stat bars were previously 0px wide (flex bug) and are fixed.
- **Realm screen** (`SceneSelect.js`): framed preview + thumbnails left, info panel + ENTER REALM right (landscape), accent from `scene.accentColor`.
- **Touch controls**: markup, IDs and `TouchControls.js` logic unchanged; only CSS look (dark bevelled round buttons, coloured rim per action via `--rim`, gloss, press-down). No `backdrop-filter`.
- **Game-ready checks**: `npm test`, `test:landing`, `test:hud`, `test:gameplay`, `test:world` all pass.

### 8.2 Constraints (DO NOT REVERT)
- Landing page remains lavender; never apply `ui-kit.css` to `index.html` / `website/`.
- Animate only `transform` / `opacity`; no `backdrop-filter`, no large `filter: blur()` layers on select screens or HUD (phone lag).
- Keep the 10 realms (art, names, order) and the 4 heroes unchanged; roster data stays the single source of truth (`stats`, `accentColor`, etc.).
- Do not hardcode colours in JS for select screens: set `--sel-accent` / `--sel-glow` and let CSS react.
- After editing `src/index.html` run `node scripts/sync-shells.js` (mirrors `game.html`, `play.html`, `dist-crazygames/`).

### 8.3 Files touched
```
src/css/ui-kit.css                 <- NEW: tokens, buttons, panels, select + touch styles
src/assets/fonts/*.woff2           <- NEW: self-hosted display/UI fonts for the game
src/assets/web/hero-0N-*-sel.webp  <- NEW: alpha-cleaned hero cutouts
src/js/immersive.js                <- NEW: fullscreen / landscape helper
manifest.webmanifest               <- NEW: installable fullscreen landscape app
src/js/ui/CharacterSelect.js       <- pedestal, dots, --sel-accent, portrait art
src/js/ui/SceneSelect.js           <- big preview + thumbnail strip, --sel-accent
src/js/data/CharacterRoster.js     <- derived `portrait` field
src/js/data/SceneRoster.js         <- derived `preview` / `thumb` / `blur` fields
website/index.html, website/css/landing.css, website/js/hero-fit.js <- landing
scripts/sync-shells.js             <- dist path rewrites for ui-kit.css / immersive.js
```

### 8.5 v2.5 — Reference-exact select screens (2026-10-05)
Founder's reference: a mobile-game lobby (profile plate top-left, icon column, name over the hero on a pedestal, power plaque, big orange BATTLE-style button). Implemented with REAL data only (no fake missions/shop buttons):
- **Flow (decided):** Landing -> in-game Shinobi screen -> Realm screen -> game. The standalone poster pages `/select/*` (commit fbda45f) remain in the repo but are NOT linked; do not link them without founder approval.
- **Shinobi screen:** `.dd-profile` plate (avatar = selected hero, step 1/2 bar), `.dd-side` HOME icon button, hero name + title above the hero, `.dd-power` plaque (SPD+PWR+STL+jump from `CHARACTER_ROSTER`), left info/stat panel, orange `.vnext-primary-cta` with sword icon and "10 REALMS AWAIT" sub-bar. Backdrop = blurred realm art (`scene_02_*_blur.webp`) + hero accent glow.
- **Realm screen:** same plate (avatar = chosen hero, step 2/2), banner with REALM tag + dark name strip with gold underline (`.dd-banner-*`), thumbnails, ENTER REALM CTA.
- Idea backlog from the reference that needs real features first: Mission / Shop / Bag icons, BOSS button, daily reward.

### 8.6 v2.6 — Painted art pass (2026-10-05)
AI-generated art (prompts: `docs/ART_PROMPTS.md`) is cut out with **`scripts/key-art.py`** (green screen -> transparent WebP; `--kind enemy|button`, `--mirror`). Re-run it for every new asset so edges and green spill are handled the same way.
- **Touch buttons** now use painted discs: `src/assets/web/btn-{left,right,jump,slash,shuriken,dash}.webp` (256px; Right = mirrored Left). CSS block "v2.6 Painted touch buttons" in `ui-kit.css` sets them as `background-image` on `#touch-*`, hides the SVG icon + label (the art contains the icon) and keeps press = `transform` + `brightness`. The older CSS bevel is the fallback. `TouchControls.js` is unchanged.
- **Enemy portraits** `src/assets/web/enemy-0N-*.webp` + `src/js/data/EnemyRoster.js` (`ENEMY_ROSTER`, `randomEnemy()`): Shadow Ronin, Crimson Assassin, Oni Guard, Shadow Sentry, Shadow Devil (the red eye was removed on the founder's request: the source image was inpainted + re-textured so only the dark shadow remains, then keyed with `key-art.py`). Used as flavour art only: a random one on the loading screen (`.dd-loading-foe`) and above the Game Over card (`.dd-modal-foe`, `UIManager._setModalFoe`). It is NOT "who killed you" (not tracked). In-game enemies are still code-drawn.
- **Still missing art:** Cursed Monk, Oni Boss (Shadow Entity), top-right HUD icons (settings / sound / restart / fullscreen), pedestal/panel textures.
- Rule: keep each portrait <= ~110 KB and each button <= ~20 KB.

### 8.4 Next ideas (not started)
- Painted art pass: generate enemy portraits + UI textures from `docs/ART_PROMPTS.md`, then wire them in (keep CSS as the fallback).
- Cooldown ring on Dash / Shuriken buttons (needs cooldown values exposed from the player).
- Optional AI-generated button / frame / pedestal textures (WebP) for a hand-painted look.
- Enemy portraits (Option B) once art exists.
