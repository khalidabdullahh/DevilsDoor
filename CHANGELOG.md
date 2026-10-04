# Changelog

All notable changes to **Devil's Door** are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added
- Poster-style landing hero (`index.html`, `website/css/landing.css`, `website/js/hero-fit.js`): oversized headline, founder portrait cutout in front, orange accent, Play Now -> `/game`. The cinematic scroll journey moved to `/cinematic` (`cinematic.html`).
- Cinematic scroll-driven landing page (`index.html`, `website/css/cinema.css`, `website/js/cinema/*`): moon + torii hero, gate tunnel, shinobi showcase with shader dissolve, 10-realm horizontal journey, the Door, final entry. Self-hosted Cinzel + Barlow Condensed fonts, vendored Three.js r128.
- Gameplay: 3-hit katana combo, separate dash, coyote time / jump buffer / variable jump, knockback instead of teleport, hit-stop, shuriken ammo, difficulty ramp, diamonds + life orbs, per-realm terrain themes, HUD stats.
- Select screens: animated carousel, realm backdrop, on-demand realm backgrounds.
- `scripts/visual/` (real-browser screenshot tool, Pages-like dev server), test suites `test:gameplay`, `test:world`, `test:hud`, `test:landing`, `test:all`.
- Docs: `docs/LANDING_BRIEF.md`, `docs/LANDING_ROADMAP.md`, ADR-007 (PROPOSED).

### Fixed
- `/game` redirect loop on Cloudflare Pages (`ERR_TOO_MANY_REDIRECTS`): removed the `.html` rewrites.
- `_headers`: overlapping rules produced conflicting `Cache-Control` and an invalid CORS header.
- Dash hit enemies every frame (about 13 hits per dash); realm gallery drifted off-screen from realm 3; HUD rebuilt its DOM every frame; all 10 realm backgrounds were decoded at startup.

---

## [2.1.0] - 2026-09-04 (Current Active Version)

### Added
- **4 Official 4K Cinematic Realms**: Replaced all previous scenes with 4 high-definition 4K dark fantasy realms (`Sunset Sanctuary`, `Moonlight Citadel`, `Shadow Scythe Grove`, `Ruby Crystal Abyss`).
- **4 Legendary Playable Shinobis**: Integrated official 4-hero roster (`Kage-Ryu`, `Ryujin`, `Raijin`, `Tsukuyomi`) with bespoke models, animations, glowing eyes, afterimage trails, and signature weapon VFX.
- **Locked Realm Selection**: Removed automatic background switching during gameplay; player-selected realm remains active throughout the run with zero quality drop across Mobile Portrait, Landscape, Tablet, and Desktop.
- **CrazyGames SDK v3 & Publisher Submissions**: Completed official submissions for CrazyGames and Poki with optimized cover artworks and hover preview videos.
- **Dual-Licensing & IP Protection**: Dual license structure (`LICENSE` & `GOVERNANCE.md`) protecting trademarks, characters, artwork, and audio assets under Khalid Abdullah's exclusive commercial ownership.

---

## [2.0.0] - 2026-09-03

### Added
- **Unified Game Navigation Flow**: Direct transition from Landing Portal (`website/index.html`) to interactive Hero Character Selection stage.
- **Dynamic 6-Biome Atmosphere Engine**: 1:1 visual mapping from 16 `Archive/` reference scenes with smooth 180-second dynamic cycles and weather particle emitters.
- **In-Game Shinobi Quick-Switcher**: Dynamic character swapping modal during pause and death loops.
- **Interactive Stat Radar**: Real-time attribute visualization for Agility, Damage, Defense, and Special Power.

---

## [1.5.0] - 2026-09-03

### Added
- **6-Hero Playable Roster (`character.zip`)**: Shadow Ninja, Shadow Ronin, Oni Warrior, Cursed Monk, Crimson Assassin, and Shadow Entity.
- **Verlet Cloth Physics**: 9-node real-time scarf dynamics for Shadow Ninja and Crimson Assassin sash.
- **Combat & Poise System**: Directional attack hitboxes, dash cancels, and knockback physics.

---

## [1.0.0] - 2026-09-01

### Added
- Initial project architecture and complete open-source governance suite (`README.md`, `AGENTS.md`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, `GOVERNANCE.md`, `LICENSE`).
- Comprehensive documentation specifications in `docs/` (10 locked design bibles).
- Custom 2.5D WebGL/Canvas rendering pipeline with depth lighting, soft shadows, and color family themes.
- Responsive physics engine featuring coyote time (100ms), jump buffering (120ms), and variable jump height.
- Data-driven Deception Engine (Trigger $\to$ Condition $\to$ Action $\to$ Result).
- Modular Door system supporting dynamic deception behaviors.
- Procedural Web Audio API sound synthesizer with zero external asset dependencies.
- 5 Handcrafted prototype levels validating mechanics.
- CI automated test and integrity validation suite.
