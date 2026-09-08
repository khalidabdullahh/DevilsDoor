# 📝 Prompt 22: 10 Cinematic 4K Realms Expansion, Mip-Mapped Parallax & Gallery Carousel

> [!INFO] ⛩️ **DEVIL'S DOOR ARCHIVAL VAULT** · `PROMPT LEDGER 22`
> **Status**: `COMPLETED` 🟢 · **Target Version**: `v2.2.1` · **Maintainer**: `Khalid Abdullah`  
> **Direct Navigation**: [[⛩️_00_MASTER_INDEX|⛩️ Master Hub]] · [[Prompt_21_New_4_Hero_Shinobi_Roster_&_HD_Scenes_Integration|◀ Previous]] · **Formal Plan**: [[Plan_12_10_Cinematic_4K_Realms_Gallery_&_MipMap_Visual_Engine|📐 Plan 12]]  
> **Tags**: `#project/devils-door` `#scenes` `#realms` `#gallery` `#mipmap` `#parallax` `#v2-2`

---

## 🗣️ User Prompt & Requirement Statement

> [!QUOTE] **Founder's Directive:**  
> "Expand the Devil's Door scene roster from 4 to 10 full 4K realms. Integrate all 10 background artworks (Sunset Sanctuary, Moonlight Citadel, Shadow Scythe Grove, Ruby Crystal Abyss, Shadow Bamboo Grove, Crimson Pagoda, Devil's Gate Abyss, Celestial Dragon Ruins, Obsidian Peak, Blood Moon Sanctuary). Implement multi-tier 4K/2K/1K mipmap downscaling for ultra-crisp performance, cinematic 16:9 carousel gallery navigation with adjacent edge peek, and progressive point unlocks up to 3500 points."

---

## ⛩️ 1. Complete 10-Realm Specification & Economy Matrix

| # | Realm ID | Realm Name | Unlock Price | Accent Color | Asset File Route |
|:---:|:---|:---|:---:|:---:|:---|
| **01** | `sunset_torii` | **SUNSET SANCTUARY** | **FREE** | `#ef4444` | `src/assets/backgrounds/scene_01_sunset_torii.jpg` |
| **02** | `moonlight_ruins` | **MOONLIGHT CITADEL** | **500 Pts** | `#06b6d4` | `src/assets/backgrounds/scene_02_moonlight_ruins.jpg` |
| **03** | `scythe_chasm` | **SHADOW SCYTHE GROVE** | **700 Pts** | `#10b981` | `src/assets/backgrounds/scene_03_scythe_chasm.jpg` |
| **04** | `crystal_abyss` | **RUBY CRYSTAL ABYSS** | **1000 Pts** | `#f43f5e` | `src/assets/backgrounds/scene_04_crystal_abyss.jpg` |
| **05** | `bamboo_mist` | **SHADOW BAMBOO GROVE** | **1200 Pts** | `#10b981` | `src/assets/backgrounds/scene_05_bamboo_mist.png` |
| **06** | `crimson_temple` | **CRIMSON PAGODA** | **1500 Pts** | `#e11d48` | `src/assets/backgrounds/scene_06_crimson_temple.png` |
| **07** | `underworld_gate` | **DEVIL'S GATE ABYSS** | **2000 Pts** | `#8b5cf6` | `src/assets/backgrounds/scene_07_underworld_gate.png` |
| **08** | `celestial_ruins` | **CELESTIAL DRAGON RUINS** | **2500 Pts** | `#38bdf8` | `src/assets/backgrounds/scene_08_celestial_ruins.png` |
| **09** | `shadow_peak` | **OBSIDIAN PEAK** | **3000 Pts** | `#f59e0b` | `src/assets/backgrounds/scene_09_shadow_peak.png` |
| **10** | `blood_moon` | **BLOOD MOON SANCTUARY** | **3500 Pts** | `#dc2626` | `src/assets/backgrounds/scene_10_blood_moon.png` |

---

## 💻 2. Technical Implementation Architecture

### A. Mip-Map Image Pyramid Generation (`NinjaArashiRenderer.js`)
Pre-allocates offscreen canvases at 50% and 25% resolutions (`4K`, `2K`, `1K`) to prevent downsampling shimmering and optimize GPU bandwidth on high-DPI displays:

```javascript
_createMipLevels(img) {
  const srcW = img.naturalWidth || img.width || 3840;
  const srcH = img.naturalHeight || img.height || 2160;

  // 2K Tier (1920 wide - High-DPI Landscape)
  const c2k = document.createElement("canvas");
  c2k.width = Math.round(srcW * 0.5);
  c2k.height = Math.round(srcH * 0.5);
  const ctx2k = c2k.getContext("2d");
  ctx2k.imageSmoothingEnabled = true;
  ctx2k.imageSmoothingQuality = "high";
  ctx2k.drawImage(img, 0, 0, c2k.width, c2k.height);

  // 1K Tier (960 wide - High-DPI Mobile Portrait)
  const c1k = document.createElement("canvas");
  c1k.width = Math.round(srcW * 0.25);
  c1k.height = Math.round(srcH * 0.25);
  const ctx1k = c1k.getContext("2d");
  ctx1k.imageSmoothingEnabled = true;
  ctx1k.imageSmoothingQuality = "high";
  ctx1k.drawImage(c2k, 0, 0, c1k.width, c1k.height);

  return { "4k": img, "2k": c2k, "1k": c1k };
}
```

### B. Cinematic Gallery Carousel with Edge Peek (`SceneSelect.js`)
Implements center card focus with adjacent scene peek using percentage transform offsets:

```javascript
const itemWidthPercent = 82;
const offsetPercent = -this.selectedIndex * (itemWidthPercent + 3);
track.style.transform = `translateX(${offsetPercent}%)`;
```

---

## 🧪 3. Verification & Test Suite
- `npm test`: 74/74 System Integrity, Economy & Roster Checks Passed.
- Production Vercel Routing: 10/10 Endpoints Validated.

---
*Related: [[⛩️_00_MASTER_INDEX]], [[Biomes_Atmospheric_Palettes_&_Dynamic_Hazards]], [[Plan_12_10_Cinematic_4K_Realms_Gallery_&_MipMap_Visual_Engine]]*
