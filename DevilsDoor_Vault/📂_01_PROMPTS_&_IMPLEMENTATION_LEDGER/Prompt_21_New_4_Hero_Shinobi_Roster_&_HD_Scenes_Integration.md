# 📝 Prompt 21: New 4-Hero Shinobi Roster, HD Scenes & Point Unlock Economy

> [!INFO] ⛩️ **DEVIL'S DOOR ARCHIVAL VAULT** · `PROMPT LEDGER 21`
> **Status**: `COMPLETED` 🟢 · **Target Version**: `v2.2.0` · **Maintainer**: `Khalid Abdullah`  
> **Direct Navigation**: [[⛩️_00_MASTER_INDEX|⛩️ Master Hub]] · [[Prompt_20_Continuous_Integration_Production_Server_Validation|◀ Previous]] · **Formal Plan**: [[Plan_11_New_4_Hero_Shinobi_Roster_HD_Scenes_&_Point_Unlocks|📐 Plan 11]]  
> **Tags**: `#project/devils-door` `#characters` `#scenes` `#point-unlocks` `#v2-2`

---

## 🗣️ User Prompt & Requirement Statement

> [!QUOTE] **Founder's Directive:**  
> "Integrate the 4 brand new high-definition Shinobi heroes and the 4K concept scenes into Devil's Door. Add character sketch artworks, visual auras, custom weapons (Dual Shadow Katanas, Molten Flame Odachi, Lightning Ninjatos, Crimson Sickle Kama), balanced stats, and a progressive in-game Point Unlock Economy (Free, 500 pts, 700 pts, 1000 pts)."

---

## 🥷 1. New 4-Hero Shinobi Specifications

| # | Hero ID | Name & Title | Aura & Color | Weaponry | Price | Stats (Spd/Jmp/Dmg/Hp) |
|:---:|:---|:---|:---|:---|:---:|:---:|
| **#01** | `kage_ryu` | **KAGE-RYU**<br/>*Shadow Shinobi* | Void Shadow<br/>`#a855f7` | Dual Shadow Katanas & Void Shurikens | **FREE** | Speed: 95 · Jump: 90 · Dmg: 85 · HP: 80 |
| **#02** | `ryujin` | **RYUJIN**<br/>*Dragon Ninja* | Dragon Flame<br/>`#f97316` | Molten Flame Odachi & Dragon Fire | **500 Pts** | Speed: 80 · Jump: 78 · Dmg: 100 · HP: 100 |
| **#03** | `raijin` | **RAIJIN**<br/>*Lightning Ronin* | Storm Lightning<br/>`#38bdf8` | Dual Lightning Ninjatos & Chain Shurikens | **700 Pts** | Speed: 90 · Jump: 88 · Dmg: 90 · HP: 85 |
| **#04** | `tsukuyomi` | **TSUKUYOMI**<br/>*Crimson Kunoichi* | Blood Moon<br/>`#ef4444` | Dual Crimson Sickle Scythes (Kama) | **1000 Pts** | Speed: 100 · Jump: 95 · Dmg: 85 · HP: 70 |

---

## ⛩️ 2. The 4 HD Concept Scenes (`Scene/` & `src/assets/backgrounds/`)

1. **Scene 01: Sunset Torii Sanctuary** (`scene_01_sunset_torii.jpg` / `1788505329637.png`)
   - Twilight crimson/orange sky gradient, Torii gate silhouette, multi-tier pagoda fortress, and water wet-sheen floor.
2. **Scene 02: Moonlight Ruins & Shrines** (`scene_02_moonlight_ruins.jpg` / `1788505337832.png`)
   - Ethereal blue full moon, ancient stone obelisks, glowing cyan runes, carved Oni demon pillars.
3. **Scene 03: Scythe Chasm & Demonic Saws** (`scene_03_scythe_chasm.jpg` / `1788505348466.png`)
   - Violet-lilac mist, thorny red demon tentacles, giant spinning serrated skull-saw blade wheels.
4. **Scene 04: Crystal Abyss & Waterfalls** (`scene_04_crystal_abyss.jpg` / `1788505357144.png`)
   - Turquoise glowing fog, floating dark crystal shards, vertical waterfall cascades with rising water mist.

---

## 💻 3. Complete Code Implementation (`src/js/data/CharacterRoster.js`)

```javascript
export const CHARACTER_ROSTER = [
  {
    id: 'kage_ryu',
    serial: '01',
    number: '#01',
    name: 'KAGE-RYU',
    title: 'SHADOW SHINOBI',
    price: 0,
    isFree: true,
    image: '/src/assets/characters/sketch/hero_01_kage_ryu_sketch.png',
    sketchImage: '/src/assets/characters/sketch/hero_01_kage_ryu_sketch.png',
    accentColor: '#a855f7',
    glowColor: 'rgba(168, 85, 247, 0.7)',
    auraType: 'void_shadow',
    speed: 95,
    jump: 90
  },
  {
    id: 'ryujin',
    serial: '02',
    number: '#02',
    name: 'RYUJIN',
    title: 'DRAGON NINJA',
    price: 500,
    isFree: false,
    image: '/src/assets/characters/sketch/hero_02_ryujin_sketch.png',
    sketchImage: '/src/assets/characters/sketch/hero_02_ryujin_sketch.png',
    accentColor: '#f97316',
    glowColor: 'rgba(249, 115, 22, 0.7)',
    auraType: 'dragon_flame',
    speed: 80,
    jump: 78
  },
  {
    id: 'raijin',
    serial: '03',
    number: '#03',
    name: 'RAIJIN',
    title: 'LIGHTNING RONIN',
    price: 700,
    isFree: false,
    image: '/src/assets/characters/sketch/hero_03_raijin_sketch.png',
    sketchImage: '/src/assets/characters/sketch/hero_03_raijin_sketch.png',
    accentColor: '#38bdf8',
    glowColor: 'rgba(56, 189, 248, 0.7)',
    auraType: 'storm_lightning',
    speed: 90,
    jump: 88
  },
  {
    id: 'tsukuyomi',
    serial: '04',
    number: '#04',
    name: 'TSUKUYOMI',
    title: 'CRIMSON KUNOICHI',
    price: 1000,
    isFree: false,
    image: '/src/assets/characters/sketch/hero_04_tsukuyomi_sketch.png',
    sketchImage: '/src/assets/characters/sketch/hero_04_tsukuyomi_sketch.png',
    accentColor: '#ef4444',
    glowColor: 'rgba(239, 68, 68, 0.7)',
    auraType: 'blood_moon',
    speed: 100,
    jump: 95
  }
];
```

---

## 🧪 4. Verification & Testing
- Hand-drawn sketch artworks and concept images verified in `Characters/` and `src/assets/`.
- Price unlock logic tested with local score accumulation and persistence in `SaveStateManager`.

---
*Related: [[⛩️_00_MASTER_INDEX]], [[Playable_Shinobi_Roster_Dossier]], [[Biomes_Atmospheric_Palettes_&_Dynamic_Hazards]], [[Plan_11_New_4_Hero_Shinobi_Roster_HD_Scenes_&_Point_Unlocks]]*
