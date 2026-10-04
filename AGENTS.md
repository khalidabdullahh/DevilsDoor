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

## 5. Landing page: current `index.html` is the poster-style hero

`index.html` (+ identical copy `website/index.html`) is now a single poster-style hero: huge headline, the founder's cutout portrait in front of it, Play Now -> `/game`. Styles in `website/css/landing.css`, headline fitting in `website/js/hero-fit.js`, display font Dela Gothic One (self-hosted, OFL). The earlier scroll-driven WebGL journey is kept, unchanged, at `/cinematic` (`cinematic.html`); the rules below describe that page.

## 5b. Cinematic landing (`cinematic.html`): read this before touching it

**Status and next steps:** [`docs/LANDING_ROADMAP.md`](docs/LANDING_ROADMAP.md). **What the founder asked for:** [`docs/LANDING_BRIEF.md`](docs/LANDING_BRIEF.md). Creative rule: *atmosphere over UI, cinematic transition over another card, visual storytelling over more text.*

**What it is.** A scroll-driven journey. `index.html` is 6 tall `<section class="scene">` elements, each with a sticky 100svh `.stage`. One fixed WebGL canvas (`#world`) sits behind them. No build step, no framework: native ES modules + vendored Three.js r128 (`website/js/vendor/three.min.js`, global `THREE`) + self-hosted fonts (Cinzel + Barlow Condensed, `website/fonts/`).

| File | Job |
|------|-----|
| `index.html` (+ identical copy `website/index.html`, keep both in sync) | semantic content for every scene; real hero/realm data; works as a plain page without JS |
| `website/css/cinema.css` | design system. Two layouts: **cinema** (`html.js:not(.static)`) and **static** (default / `html.static`) |
| `website/js/cinema/main.js` | scroll director: smoothed scroll -> per-scene progress -> world state, text reveals (`data-in`/`data-out`), active hero/realm, HUD, veil (black dips between worlds), intro clock, adaptive DPR, texture streaming |
| `website/js/cinema/world.js` | the 3 WebGL sets: **journey** (moon, ridges, torii, gate tunnel), **quad** (full-screen hero art with shader dissolve, realm slide, weather), **door** |
| `website/js/cinema/shaders.js` | all GLSL (WebGL1) |
| `scripts/test-landing-and-select.mjs` | 37 static checks; names/stats on the page are compared with the game's own rosters (`CHARACTER_ROSTER`, `SCENE_ROSTER`, `NinjaArashiPlayer`) so they cannot drift |
| `scripts/visual/` | real-browser screenshot tool + Pages-like dev server (see below) |

**Rules**
1. **Never edit the game from the landing work.** `/game`, `src/js/**` stay untouched. Every CTA is a plain `<a href="/game">`.
2. **No fake game facts.** Hero names/titles/stats and realm names come from the game data (a test enforces it). Stats shown are real: speed, jump, hearts.
3. Content must stay readable **without JS/WebGL**: scroll-driven hiding (`[data-in]`) is allowed only under `html.js:not(.static)`.
4. No external hosts (fonts, Three.js are self-hosted). New art goes in `src/assets/web/` as WebP under a **new file name** (`/src/assets/*` is cached for a year as immutable).
5. Run `npm run test:all` before every commit. A green test run says nothing about how it *looks*: **look at screenshots**.

**Look at it (do this after every visual change)**
```bash
cd /tmp && mkdir br && cd br && npm i @sparticuz/chromium puppeteer-core      # once, not a project dependency
NODE_PATH=/tmp/br/node_modules node <repo>/scripts/visual/shot.mjs desk 1366 768 0 0 0.1 0.3 0.6 0.9
NODE_PATH=/tmp/br/node_modules node <repo>/scripts/visual/shot.mjs phone 390 844 1 0 0.3 0.6
# images land in /tmp/shots. Run `npm run serve` for a local Pages-like server on :8080.
```
Headless WebGL is software-rendered (~1-3 fps): judge **composition and bugs, not speed**. `?debug` exposes `window.__cinema` (scene positions, `skipIntro()`).

**Cloudflare Pages gotchas (they already broke production once)**
- Pages serves `game.html` at `/game` by itself. A rewrite like `/game /game.html 200` (the old `_redirects`, now deleted) loops forever (`ERR_TOO_MANY_REDIRECTS`). Never rewrite to `.html`.
- If several `_headers` rules match one URL, Cloudflare **joins** same-name headers with commas (two `Cache-Control` values, `Access-Control-Allow-Origin: *, *`). Keep rules disjoint.
- Limits: 25 MiB per file, 20,000 files. Do not commit zip/video build artifacts.
- No secrets in the repo or in chat logs: a GitHub token was pasted in a chat once; it must stay revoked.

