# 📐 Implementation Plan 01 — Project Genesis, Governance Suite & Full 10 Design Bibles

> [!INFO] ⛩️ **DEVIL'S DOOR ARCHIVAL VAULT** · `MILESTONE PLAN 01`
> **Status**: `COMPLETED` 🟢 · **Target Version**: `v2.1.0` · **Maintainer**: `Khalid Abdullah`  
> **Direct Navigation**: [[⛩️_00_MASTER_INDEX|⛩️ Master Hub]] · **Prompt Ledger**: [[Prompt_01_Genesis_Architecture_&_Design_Bibles|📝 Prompt 01]]  
> **Tags**: `#project/devils-door` `#architecture` `#specification-bibles` `#v2-1`

---


## 🎯 1. Goal & Architectural Scope

**Devil's Door** is an original, production-grade 2.5D deceptive platformer designed around the foundational tagline:
> **"REACH THE DOOR. TRUST NOTHING."**  
> *From the creators of Aurex — Founded & Maintained by Khalid Abdullah*

The core engineering mandate is **Absolute Originality**: Devil's Door does NOT copy *Level Devil*, *Oops!*, or any other deceptive platformer in source code, artwork, character designs, level sequences, branding, or sound effects. All mechanics, physics constants, level geometry, and visual identities are built from first principles on native ECMAScript Modules (ESM) with zero build-step overhead.

---

## 🏛️ 2. Repository Governance Suite (Full Specifications)

### 2.1 `README.md` — Canonical Project Frontpage
- **Founder & Maintainer**: Khalid Abdullah
- **Canonical Repository**: `https://github.com/khalidabdullahh/DevilsDoor`
- **Live Production URL**: `https://devils-door.vercel.app/`
- **License**: Dual-License (MIT Open-Source Engine + All Rights Reserved Proprietary IP Assets)
- **Engine Architecture**: 2.5D Silhouette Canvas/WebGL rendering pipeline with dynamic depth lighting and procedural Web Audio synthesis.

### 2.2 `AGENTS.md` — AI Agent & Contributor Coding Guidelines
1. **Core Physics Immutability**: The core physics constants (`GRAVITY = 1450`, `COYOTE_TIME = 100ms`, `JUMP_BUFFER = 120ms`) must remain consistent across all feature branches.
2. **Zero-Build Native ESM**: All client code must execute directly in standard browsers using standard ES modules without mandatory Babel/Vite transpilation.
3. **Data-Driven Deception**: Never hardcode level-specific trap logic in player update loops; declare interactions via the unified JSON Deception Engine schema.

### 2.3 `CONTRIBUTING.md` & `CODE_OF_CONDUCT.md`
- Adheres to the Contributor Covenant v2.1 standard.
- Branching strategy: `main` (production release), `feat/*` (feature branches), `fix/*` (hotfixes).
- Pull requests require 100% passing tests via `npm test` (`scripts/test-integrity.js`).

### 2.4 `SECURITY.md` & `GOVERNANCE.md`
- Responsible vulnerability disclosure protocol with private reporting to Khalid Abdullah.
- Founder maintains sole architectural authority over official builds, publisher contracts, and trademark licensing (*"Devil's Door"*, *"Aurex"*).

---

## 📚 3. Complete 10 Specification Bibles (Direct In-Line Contents)

---

### 📖 Bible 1: `docs/MASTER_CONTEXT.md` — Vision & Core Principles

#### Locked Core Principles:
1. **Absolute Originality**: All mechanics, visual shaders, and level progressions are crafted from first principles.
2. **Every Death Must Teach Something**: The emotional arc after failure must be *"Ah. Now I see what happened."* Unfair, invisible, untelegraphed instant deaths without logic are strictly prohibited.
3. **Continuous World Architecture**: The game takes place in one cohesive realm—**The Devil's Domain**—with a gradual descent through Acts I to VII.
4. **Snappy & Forgiving Physics**: Precision platforming feel with coyote time, jump buffering, variable jump heights, and instant ($<80\text{ms}$) respawns.
5. **Founder Governance**: Open source engine framework with final authority retained by Khalid Abdullah.

---

### 📖 Bible 2: `docs/GAMEPLAY_SPEC.md` — Physics Constants & Core Loop

#### Core Gameplay Loop:
$$\text{Observe} \longrightarrow \text{Move} \longrightarrow \text{Encounter Deception} \longrightarrow \text{Fail / Learn} \longrightarrow \text{Retry (<80ms)} \longrightarrow \text{Adapt} \longrightarrow \text{Reach Door}$$

#### Deterministic Physics Constants:
| Constant | Value | Description |
|:---|:---:|:---|
| `GRAVITY` | $1450\text{ px/s}^2$ | Snappy downward acceleration ensuring fast descent. |
| `MAX_FALL_SPEED` | $900\text{ px/s}$ | Terminal fall velocity cap. |
| `MOVE_ACCELERATION` | $2800\text{ px/s}^2$ | Instant lateral acceleration to full sprint. |
| `MOVE_DECELERATION` | $3200\text{ px/s}^2$ | Snappy stop without slippery inertia sliding. |
| `MAX_RUN_SPEED` | $280\text{ px/s}$ | Traversal speed across platforms. |
| `JUMP_VELOCITY` | $-520\text{ px/s}$ | Initial upward jump impulse. |
| `VARIABLE_JUMP_FACTOR` | $0.45$ | Releasing jump early dampens velocity for short hops. |
| `COYOTE_TIME` | $100\text{ ms}$ | Grace window allowing jumps after walking off ledge. |
| `JUMP_BUFFER_TIME` | $120\text{ ms}$ | Queues jump input before touching the floor. |
| `RESPAWN_DELAY` | $80\text{ ms}$ | Instantaneous respawn latency preserving player flow. |

---

### 📖 Bible 3: `docs/DECEPTION_ENGINE.md` — State Machine & Triggers

The Deception Engine operates on the declarative event schema:
$$\text{Trigger} \longrightarrow \text{Condition} \longrightarrow \text{Action} \longrightarrow \text{Result}$$

#### Trigger Catalog:
- `AreaEnterTrigger`: Fires when player bounding box enters coordinate bounds.
- `PlayerJumpTrigger`: Fires whenever player executes a jump.
- `PlayerIdleTrigger`: Fires when player stands motionless $> T\text{ ms}$.
- `DoorProximityTrigger`: Fires when player approaches within $R\text{ px}$ of the Door.
- `VelocityThresholdTrigger`: Fires when player sprint velocity exceeds $V\text{ px/s}$.

#### Action Catalog:
- `ShiftTilesAction`: Moves platform blocks smoothly to new coordinates.
- `ToggleCollisionAction`: Dynamically enables/disables platform collision.
- `DecoyDoorAction`: Dissipates false door into shadow mist and reveals true exit.
- `InvertGravityAction`: Inverts world vertical gravity vector ($g = -g$).
- `DevilGazeAction`: Triggers the Shadow Devil eye gaze pulse slowing/crushing moving players.

---

### 📖 Bible 4: `docs/MECHANICS_LIBRARY.md` — Interactive Traps & Doors

#### 1. Platform Mechanics:
- **Stable Ground (`BlockSolid`)**: Dark slate bevelled block with top highlight and drop shadow.
- **Crumbling Floor (`BlockCrumble`)**: Hairline stone cracks; $0.25\text{s}$ rattle before tile falls.
- **Polarity Shift Platforms (`BlockPhase`)**: Cyan (Phase A) and Amber (Phase B); jumps toggle active solid phase.

#### 2. Hazard Mechanics:
- **Telegraphed Spikes (`HazardSpike`)**: Metallic obsidian spikes with faint crimson tip glints.
- **Velocity-Responsive Falling Trap (`HazardVelocityFall`)**: Ceiling stalactites leading player sprint speed; stopping causes it to drop harmlessly in front.
- **Shadow Gaze Pulse (`HazardDevilGaze`)**: Giant demonic eye opening in the sky; requires stopping or seeking roof shelter.

#### 3. Door Deceptions:
- **True Gate**: Glowing azure/gold Torii vortex completing the level.
- **Decoy Mimic**: Emits subtle purple smoke; vanishes or snaps shut upon touch.
- **Reverse Approach Gate**: Requires entering from the rear threshold to unlock.

---

### 📖 Bible 5: `docs/VISUAL_BIBLE.md` — 2.5D Art & Biomes

#### 6 Archive Reference Biomes (180-Second Dynamic Cycles):
1. **Sunset Fortress & Torii Gate (`images (4).jpeg`)**:
   - Sky Gradient: `#1c1032` $\to$ `#3b1238` $\to$ `#9f1239` $\to$ `#dc2626` $\to$ `#f59e0b`.
   - Visuals: Multi-tier pagoda castle silhouettes, radiant solar halo, reflective wet ground sheen.
2. **Frozen Snow Abyss & Oni Pillars (`images (3, 5, 7).jpeg`)**:
   - Sky Gradient: `#061320` $\to$ `#0f2942` $\to$ `#1e486b` $\to$ `#60a5fa`.
   - Visuals: Snow blankets, dripping icicles, dead pine branches, carved Oni demon stone pillars.
3. **Whispering Bamboo Forest (`images (14).jpeg`)**:
   - Sky Gradient: `#022119` $\to$ `#064e3b` $\to$ `#047857` $\to$ `#10b981`.
   - Visuals: Vertical bamboo stalks, swaying red crescent pendulum battleaxes.
4. **Demonic Thorn Crypts (`images (10, 17).jpeg`)**:
   - Sky Gradient: `#12071a` $\to$ `#2c103e` $\to$ `#581c87` $\to$ `#9333ea`.
   - Visuals: Castle tiled roofs, thorny demon tentacles, spinning crimson skull-saw wheels.
5. **Sky Waterfall Chasms (`images (1, 16).jpeg`)**:
   - Sky Gradient: `#032322` $\to$ `#0f4f4b` $\to$ `#0d9488` $\to$ `#2dd4bf`.
   - Visuals: Vertical waterfall cascades, turquoise mist updrafts, floating stone bridges.
6. **Ancient Temple Ruins & Shrines (`images (8, 12).jpeg`)**:
   - Sky Gradient: `#1c1917` $\to$ `#292524` $\to$ `#44403c` $\to$ `#78716c`.
   - Visuals: Glowing cyan obelisk shrines, hanging lanterns, ancient stone glyphs.

---

### 📖 Bible 6: `docs/LEVEL_DESIGN_BIBLE.md` — 5 Prototype Levels

| Level | Name | Primary Mechanic | Player Expectation | Deception / Subversion | Clue & Counterplay |
|:---:|:---|:---|:---|:---|:---|
| **01** | *The First Assumption* | Collapsing Bridge | Sprint across top bridge. | Bridge collapses safely to lower tier; jumping blindly hits ceiling spikes. | Cracks appear on top ledge; walk off to drop into safe lower passage. |
| **02** | *Patience & Peril* | Velocity Fall Trap | Sprint fast to outrun falling spikes. | Falling spikes lead player speed; sprinting guarantees death. | Spikes twitch before falling; pause $0.5\text{s}$ to let trap discharge harmlessly. |
| **03** | *The False Exit* | Decoy Portal | Reaching upper Door clears stage. | Upper Door dissolves into shadow smoke; true lower gate unlocks. | Upper door emits purple embers; approach it to unlock true passage below. |
| **04** | *Phase Shift* | Jump Polarity | Standard platform traversal. | Every jump inverts solid platform colors (Cyan $\leftrightarrow$ Amber). | Platform glyphs match player aura; time jumps to land on matching color. |
| **05** | *Gaze of the Devil* | Shadow Stealth Gaze | Normal platform navigation. | Giant Shadow Devil eye opens; moving during gaze triggers atmospheric crush. | Audio heartbeat cue and screen vignette; freeze completely while eye is open. |

---

### 📖 Bible 7: `docs/MONETIZATION.md` — Ethical Monetization Pillars
1. **Zero Paywalls on Core Progression**: All campaign levels are 100% free and completable with skill.
2. **No Forced Interstitials on Death**: Fast retries are sacred; ads never block immediate retries.
3. **Optional Rewarded Video Revives**: Players can optionally watch an ad for a second-chance revive with invulnerability.
4. **Cosmetic Supporter Pass**: One-time unlock for custom player aura glows and vortex colorways.

---

### 📖 Bible 8: `docs/ANALYTICS.md` — Privacy-First Telemetry
- **Zero PII**: No collection of IP addresses, emails, or personal identification.
- **Event Schema**:
  - `session_start` (`client_version`, `viewport_type`)
  - `level_start` (`level_id`, `attempt_number`)
  - `level_death` (`level_id`, `death_x`, `death_y`, `killer_hazard_tag`, `time_alive_s`)
  - `level_complete` (`level_id`, `total_deaths`, `total_time_s`)

---

### 📖 Bible 9: `docs/ROADMAP.md` — Project Milestones & Delivery
- **Phase 0 (Completed)**: Foundation, architecture, open-source governance suite, 10 locked bibles.
- **Phase 1 (Completed)**: Responsive kinematics physics engine with coyote time & jump buffering.
- **Phase 2 (Completed)**: Data-driven Deception Engine & modular door states.
- **Phase 3 (Completed)**: 2.5D Canvas/WebGL depth renderer & dynamic lighting.
- **Phase 4 (Completed)**: 6 Playable heroes from `character.zip` with Verlet cloth scarf physics.
- **Phase 5 (Completed)**: 16 Archive scenes & dynamic 3-minute biome cycles.
- **Phase 6 (Completed)**: Unified UI flow (Landing Page $\to$ Character Select $\to$ Endless Run).
- **Phase 7 (Completed)**: CrazyGames SDK v3 bundle, Poki developer submission & dual IP licensing.
- **Phase 8 (Active)**: Multi-phase boss battles (Void Shadow Entity at 1,000m) and 100-level expansion.

---

### 📖 Bible 10: `docs/DECISIONS.md` — Architecture Decision Records (ADRs)
- **ADR-001 (Accepted)**: Modular native ESM architecture with zero build-step overhead.
- **ADR-002 (Accepted)**: Procedural Web Audio API sound synthesis ($0\text{ KB}$ audio downloads).
- **ADR-003 (Accepted)**: Data-driven Trigger-Condition-Action deception engine.
- **ADR-004 (Accepted)**: Original door deception mechanics (decoy gates, polarity locks, shifting portals).
- **ADR-005 (Accepted)**: System-aware Light/Dark responsive tokens for marketing hub.
- **ADR-006 (Accepted)**: 3D perspective depth pipeline & WebGPU/WebGL canvas rendering.

---

## 🧪 4. Verification Plan

### Automated CI Test Suite (`scripts/test-integrity.js`)
```javascript
// Validates presence and non-empty markdown headings across all 10 specifications
const requiredSpecs = [
  'MASTER_CONTEXT.md', 'GAMEPLAY_SPEC.md', 'DECEPTION_ENGINE.md',
  'MECHANICS_LIBRARY.md', 'VISUAL_BIBLE.md', 'LEVEL_DESIGN_BIBLE.md',
  'MONETIZATION.md', 'ANALYTICS.md', 'ROADMAP.md', 'DECISIONS.md'
];
```
- **Test Output**: ✅ Passing 51/51 documentation and module integrity checks.

---
*Related: [[⛩️_00_MASTER_INDEX]], [[Prompt_01_Genesis_Architecture_&_Design_Bibles]]*
