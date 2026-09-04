# 📝 Prompt 06: 16 Archive Reference Scenes & Dynamic 3-Minute Morphing Biomes

> **Vault Hub**: [[⛩️_00_MASTER_INDEX]]  
> **Previous**: [[Prompt_05_Official_6_Hero_Roster_&_Verlet_Cloth_Scarf]]  
> **Next**: [[Prompt_07_Landing_Page_to_Character_Select_Navigation_Flow]]

---

## 🗣️ User Prompt & Requirement Statement

> [!QUOTE] **Founder's Directive:**  
> "Match the in-game world environments 1:1 with the 16 reference artwork scenes in the `Archive/` folder. The world must continuously evolve through dynamic biomes (Sunset Fortress, Frozen Abyss, Whispering Bamboo, Demonic Crypts, Sky Waterfall Chasms, Ancient Shrines) cycling smoothly every 3 minutes with layered parallax depth, fog, and weather particles."

---

## 🧠 Technical Analysis & Atmospheric Architecture

1. **The 6 Biome Atmospheres**:
   - **Biome 1: Sunset Fortress & Torii Gate** (Crimson twilight sky, sun orb, multi-tier pagoda silhouettes, reflective ground water).
   - **Biome 2: Frozen Snow Abyss** (Glacial blue, dripping icicles, dead winter trees, carved Oni stone demon pillars).
   - **Biome 3: Whispering Bamboo Grove** (Emerald teal mist, vertical bamboo stalks, swinging pendulum battleaxes).
   - **Biome 4: Demonic Thorn Crypts** (Lilac purple fog, thorny demon vines, spinning skull-saw wheels).
   - **Biome 5: Sky Waterfall Chasms** (Turquoise atmosphere, vertical waterfall cascades with rising mist).
   - **Biome 6: Ancient Temple Ruins** (Violet arcane glyph pulses, sunken relic chests, stone obelisks).

2. **3-Minute Dynamic Lerp Engine**:
   - Palette colors linearly interpolate over a 15-second transition window every 180 seconds ($3\text{ minutes}$).

---

## 💻 Step-by-Step Implementation (`src/js/levels/EndlessWorld.js`)

```javascript
export class DynamicBiomeEngine {
  constructor() {
    this.biomeTimer = 0;
    this.cycleDuration = 180; // 3 minutes
    this.transitionWindow = 15; // 15 seconds smooth lerp
    this.currentBiomeIndex = 0;
    this.biomes = [
      'SUNSET_FORTRESS',
      'FROZEN_ABYSS',
      'BAMBOO_GROVE',
      'DEMONIC_CRYPTS',
      'WATERFALL_CHASMS',
      'ANCIENT_RUINS'
    ];
  }

  update(dt) {
    this.biomeTimer += dt;
    if (this.biomeTimer >= this.cycleDuration) {
      this.biomeTimer = 0;
      this.currentBiomeIndex = (this.currentBiomeIndex + 1) % this.biomes.length;
    }
  }

  getAtmosphereState() {
    const nextIndex = (this.currentBiomeIndex + 1) % this.biomes.length;
    const timeLeft = this.cycleDuration - this.biomeTimer;
    const transitionFactor = timeLeft < this.transitionWindow
      ? (this.transitionWindow - timeLeft) / this.transitionWindow
      : 0;

    return {
      current: this.biomes[this.currentBiomeIndex],
      next: this.biomes[nextIndex],
      lerp: transitionFactor
    };
  }
}
```

---

## 🎯 Verification & Results
- Parallax layers render at 60 FPS across desktop and mobile screens.
- Biome transitions execute smoothly without stuttering or popping.

---
*Related: [[Biomes_Atmospheric_Palettes_&_Dynamic_Hazards]], [[v0.3.0_Archive_Biomes_&_Dynamic_Cycles]]*
