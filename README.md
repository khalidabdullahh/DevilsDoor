# DEVIL'S DOOR

> **REACH THE DOOR. TRUST NOTHING.**  
> *FROM THE CREATORS OF AUREX*

[![License: MIT](https://img.shields.io/badge/License-MIT-crimson.svg)](LICENSE)
[![CI Status](https://img.shields.io/badge/CI-Passing-emerald.svg)](.github/workflows/ci.yml)
[![Founder](https://img.shields.io/badge/Founder-Khalid%20Abdullah-blueviolet.svg)](https://github.com/khalidabdullahh)
[![Engine](https://img.shields.io/badge/Engine-2.5D%20WebGL%20%2F%20Canvas-orange.svg)](src/)

---

## 🚪 Overview

**Devil's Door** is an original, production-grade 2.5D deceptive platformer designed around subverting player expectations while keeping mechanics discoverable, learnable, and fair.

Your objective appears simple: **Reach the Door.**  
The challenge: The world, routes, hazards, rules, and even the Door will challenge your assumptions.

### Core Tenet
> **EVERY DEATH MUST TEACH SOMETHING.**  
> The ideal reaction after failure is: *"Ah. Now I understand what happened."*

---

## 🌟 Highlights & Key Features

- **Original 2.5D Presentation**: Atmospheric isometric-perspective styling, soft volumetric lighting, dynamic shadows, and high contrast gameplay clarity.
- **Data-Driven Deception Engine**: Reusable Trigger $\to$ Condition $\to$ Event $\to$ Result pipeline powering subtle environmental shifts, deceptive routes, and dynamic hazards.
- **Dynamic Door System**: Modular behaviors (decoy doors, phase-locked exits, reverse-polarity passages, dimensional triggers). *Zero copied mechanics.*
- **The Shadow Devil**: A mysterious, minimalist entity lingering in the background—watching, shifting rules, and directing atmospheric events.
- **Zero-Dependency Web Audio Synthesizer**: Custom procedural sound FX and dark ambient drones generated natively via the Web Audio API with zero external audio assets.
- **Mobile-First Touch & Desktop Controls**: Smooth keyboard (`WASD` / Arrow keys / `Space`), Gamepad support, and touch controls responsive across all aspect ratios.
- **System-Aware Landing Page**: High-performance marketing portal supporting system preference and manual System / Light / Dark modes.

---

## 🎮 Quick Start & Local Play

Devil's Door is built with zero-heavy-tooling modular ESM, allowing instant testing without complex compilation steps.

```bash
# Clone the repository
git clone https://github.com/khalidabdullahh/DevilsDoor.git
cd DevilsDoor

# Run local HTTP server (using Python 3, Node, or any static server)
python3 -m http.server 8080

# Or with Node npx
# npx serve .
```

- Open `http://localhost:8080/website/` to view the official landing page.
- Open `http://localhost:8080/src/` to jump straight into the game.

### Controls
| Action | Keyboard | Touch / Mobile |
|---|---|---|
| **Move Left** | `A` or `Left Arrow` | On-screen Left D-Pad |
| **Move Right** | `D` or `Right Arrow` | On-screen Right D-Pad |
| **Jump** | `W`, `Up Arrow`, or `Space` | On-screen `JUMP` Button |
| **Restart Level** | `R` | Top HUD `↻` Button |
| **Pause / Menu** | `Escape` or `P` | Top HUD `⏸` Button |

---

## 🏛️ World Progression: The Devil's Domain

Devil's Domain is a single continuous deceptive reality divided into thematic acts:

1. **Act I — Discovery**: Fundamental movement, initial assumptions, and introductory subversions.
2. **Act II — Suspicion**: Timing traps, speed-punishment, and stillness requirements.
3. **Act III — Deception**: Decoy doors, false paths, and environmental camouflage.
4. **Act IV — Adaptation**: Dynamic phase-shifting platforms and polarity reversals.
5. **Act V — Mastery**: Multi-layered deceptions and precision timing.
6. **Act VI — The Devil**: Direct interaction and avoidance of the Shadow Devil's gaze.
7. **Act VII — Endgame**: The culmination of all deceptive disciplines.

---

## 📖 Documentation Suite

All architectural decisions, mechanics, and design guidelines are thoroughly documented:

- [MASTER_CONTEXT.md](docs/MASTER_CONTEXT.md) — Primary source of truth, locked decisions, and architecture.
- [GAMEPLAY_SPEC.md](docs/GAMEPLAY_SPEC.md) — Physics parameters, movement curves, and game loop specifications.
- [DECEPTION_ENGINE.md](docs/DECEPTION_ENGINE.md) — Technical specification of the trigger-action engine.
- [MECHANICS_LIBRARY.md](docs/MECHANICS_LIBRARY.md) — Complete library of platform, hazard, and switch mechanics.
- [VISUAL_BIBLE.md](docs/VISUAL_BIBLE.md) — 2.5D visual direction, lighting, color families, and contrast standards.
- [LEVEL_DESIGN_BIBLE.md](docs/LEVEL_DESIGN_BIBLE.md) — Level design rules, uniqueness matrix, and pacing.
- [MONETIZATION.md](docs/MONETIZATION.md) — Ethical, non-intrusive monetization strategy.
- [ANALYTICS.md](docs/ANALYTICS.md) — Privacy-conscious gameplay telemetry.
- [ROADMAP.md](docs/ROADMAP.md) — Development milestones from Phase 0 to Phase 12.
- [DECISIONS.md](docs/DECISIONS.md) — Architecture Decision Records (ADRs).

---

## 👥 Governance & Contribution

- **Founder & Project Owner**: [Khalid Abdullah](https://github.com/khalidabdullahh)
- **Role**: Founder & Chief Developer / Lead Maintainer
- **Model**: Open Development + Curated Merging + Founder Final Authority

See [GOVERNANCE.md](GOVERNANCE.md) and [CONTRIBUTING.md](CONTRIBUTING.md) for full details.

---

## 📄 License

Distributed under the [MIT License](LICENSE). Copyright © 2026 Khalid Abdullah (Aurex).
