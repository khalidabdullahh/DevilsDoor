# 📐 Implementation Plan 12 — 10 Cinematic 4K Realms Gallery & Mip-Mapped Parallax Engine

> [!INFO] ⛩️ **DEVIL'S DOOR ARCHIVAL VAULT** · `MILESTONE PLAN 12`
> **Status**: `COMPLETED` 🟢 · **Target Version**: `v2.2.1` · **Maintainer**: `Khalid Abdullah`  
> **Direct Navigation**: [[⛩️_00_MASTER_INDEX|⛩️ Master Hub]] · **Prompt Ledger**: [[Prompt_22_10_Cinematic_4K_Realms_Expansion_&_MipMap_Renderer|📝 Prompt 22]]  
> **Tags**: `#project/devils-door` `#scenes` `#realms` `#rendering` `#mipmap` `#economy` `#v2-2`

---

## 🎯 1. Architectural Scope & Goals

Upgrade Devil's Door visual engine and level selection to **v2.2.1** featuring:
1. **10 Master 4K Cinematic Realms** (Sunset Sanctuary to Blood Moon Sanctuary).
2. **Multi-Tier 4K/2K/1K Mipmap Rendering** in `NinjaArashiRenderer.js` with bicubic interpolation.
3. **16:9 Cinematic Gallery Carousel** in `SceneSelect.js` with edge peek for adjacent realms.
4. **Progressive Economy Unlocks** (0, 500, 700, 1000, 1200, 1500, 2000, 2500, 3000, 3500 pts).

---

## 💻 2. Component Implementation Blueprints

### A. Data Schema (`src/js/data/SceneRoster.js`)
Configured 10 realm descriptors with serial numbers, titles, prices, asset routes, and hex aura tokens.

### B. Renderer Optimization (`src/js/render/NinjaArashiRenderer.js`)
- Dynamically queries canvas physical height to select `1K`, `2K`, or `4K` pre-filtered buffer.
- Seamless horizontal parallax wrapping using single modulo calculations.

### C. Selection Stage UI (`src/js/ui/SceneSelect.js`)
- Slide track with touch swipe and keyboard left/right controls.
- Real-time point wallet validation and rewarded video integration.

---

## 🧪 3. Verification Plan

### Automated Tests
- Run `npm test`: 74/74 tests verify all 10 realm assets and economy persistence.
- Production routing: 10/10 endpoints return HTTP 200 OK.

---
*Related: [[⛩️_00_MASTER_INDEX]], [[Biomes_Atmospheric_Palettes_&_Dynamic_Hazards]], [[v2.2.0_Master_Edition_New_Heroes_&_HD_Scenes]]*
