# 📐 Implementation Plan 11 — New 4-Hero Shinobi Roster, 4K HD Concept Scenes & Point Unlock Economy

> [!INFO] ⛩️ **DEVIL'S DOOR ARCHIVAL VAULT** · `MILESTONE PLAN 11`
> **Status**: `COMPLETED` 🟢 · **Target Version**: `v2.2.0` · **Maintainer**: `Khalid Abdullah`  
> **Direct Navigation**: [[⛩️_00_MASTER_INDEX|⛩️ Master Hub]] · **Prompt Ledger**: [[Prompt_21_New_4_Hero_Shinobi_Roster_&_HD_Scenes_Integration|📝 Prompt 21]]  
> **Tags**: `#project/devils-door` `#characters` `#scenes` `#point-economy` `#v2-2`

---

## 🎯 1. Goal & Architectural Scope

Upgrade Devil's Door to **v2.2 (vNext Master Edition)** featuring the official 4-Hero Shinobi roster (**Kage-Ryu**, **Ryujin**, **Raijin**, and **Tsukuyomi**) with high-resolution sketch and concept artwork, 4 atmospheric 4K scenes, custom visual glow auras, distinct weapons, and an integrated in-game Point Unlock Economy (Free, 500 pts, 700 pts, 1000 pts).

---

## 📋 2. User Requirements Breakdown

1. **4 Master Shinobi Heroes**:
   - `#01 KAGE-RYU (Shadow Shinobi)` [FREE]: Agility / Stealth assassin with dual shadow katanas, throwing kunai bandolier, and void shadow aura (`#a855f7`).
   - `#02 RYUJIN (Dragon Ninja)` [500 Points]: Heavy damage juggernaut with dragon-scale samurai armor, horned Oni mask, molten flame odachi (`#f97316`).
   - `#03 RAIJIN (Lightning Ronin)` [700 Points]: Stance counter-attack master with conical Kasa hat, glowing electric-blue runes, dual lightning ninjatos (`#38bdf8`).
   - `#04 TSUKUYOMI (Crimson Kunoichi)` [1000 Points]: Ultra-fast acrobatic assassin with silver porcelain half-mask, dynamic ponytail, dual crimson sickle scythes (`#ef4444`).
2. **4 HD Concept Scenes (`Scene/` & `src/assets/backgrounds/`)**:
   - `Scene 01: Sunset Torii Sanctuary`
   - `Scene 02: Moonlight Ruins & Shrines`
   - `Scene 03: Scythe Chasm & Demonic Saws`
   - `Scene 04: Crystal Abyss & Waterfalls`
3. **Point Unlock & Persistence**:
   - Points earned through distance and runs unlock heroes progressively and persist in `SaveStateManager`.

---

## 💻 3. Proposed Changes by Component

### 1. Data & Asset Layer
#### [NEW] [`Characters/01_kage_ryu_shadow_shinobi.jpg`](file:///Users/khalidabdullah/AntiGravity/DevilsDoor/Characters/01_kage_ryu_shadow_shinobi.jpg)
#### [NEW] [`Characters/02_ryujin_dragon_ninja.jpg`](file:///Users/khalidabdullah/AntiGravity/DevilsDoor/Characters/02_ryujin_dragon_ninja.jpg)
#### [NEW] [`Characters/03_raijin_lightning_ronin.jpg`](file:///Users/khalidabdullah/AntiGravity/DevilsDoor/Characters/03_raijin_lightning_ronin.jpg)
#### [NEW] [`Characters/04_tsukuyomi_crimson_kunoichi.jpg`](file:///Users/khalidabdullah/AntiGravity/DevilsDoor/Characters/04_tsukuyomi_crimson_kunoichi.jpg)
#### [NEW] [`Scene/1788505329637.png`](file:///Users/khalidabdullah/AntiGravity/DevilsDoor/Scene/1788505329637.png) to [`Scene/1788505357144.png`](file:///Users/khalidabdullah/AntiGravity/DevilsDoor/Scene/1788505357144.png)
#### [MODIFY] [`src/js/data/CharacterRoster.js`](file:///Users/khalidabdullah/AntiGravity/DevilsDoor/src/js/data/CharacterRoster.js)
- Register 4 heroes with prices, serial numbers, sketch images, aura types, and attribute balances.

### 2. UI & Character Selection Stage
#### [MODIFY] [`src/js/ui/CharacterSelect.js`](file:///Users/khalidabdullah/AntiGravity/DevilsDoor/src/js/ui/CharacterSelect.js)
- Display character sketch previews, point cost unlock buttons, lock/unlock state badges, and dynamic aura glows.

### 3. Background Parallax Renderer
#### [MODIFY] [`src/js/render/NinjaArashiRenderer.js`](file:///Users/khalidabdullah/AntiGravity/DevilsDoor/src/js/render/NinjaArashiRenderer.js)
- Integrate 4 HD background images with smooth parallax scrolling and color grading.

---

## 🧪 4. Verification Plan

### Automated Tests
- Run `npm test`: Verify 51/51 integrity checks and character data schema validation.
- Verify that image asset paths resolve without 404 errors.

### Manual Verification
- Test character carousel with keyboard/touch navigation.
- Verify point unlock accumulation across multiple gameplay runs.

---
*Related: [[⛩️_00_MASTER_INDEX]], [[Playable_Shinobi_Roster_Dossier]], [[Biomes_Atmospheric_Palettes_&_Dynamic_Hazards]]*
