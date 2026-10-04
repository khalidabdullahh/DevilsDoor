/**
 * CharacterRoster — Official 4-Hero Roster for Devil's Door v2.3 (Visual Overhaul).
 * v2.3 additions: stats.power, stats.stealth fields for CharacterSelect stat bars.
 * High-definition hand-drawn sketch & 3D character artwork in fixed serial order:
 * 01 — KAGE-RYU (SHADOW SHINOBI) [FREE]
 * 02 — RYUJIN (DRAGON NINJA) [FREE]
 * 03 — RAIJIN (LIGHTNING RONIN) [FREE]
 * 04 — TSUKUYOMI (CRIMSON KUNOICHI) [FREE]
 */
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
    jump: 90,
    // v2.3: stat bars shown in CharacterSelect
    stats: { speed: 95, power: 70, stealth: 98 }
  },
  {
    id: 'ryujin',
    serial: '02',
    number: '#02',
    name: 'RYUJIN',
    title: 'DRAGON NINJA',
    price: 0,
    isFree: true,
    image: '/src/assets/characters/sketch/hero_02_ryujin_sketch.png',
    sketchImage: '/src/assets/characters/sketch/hero_02_ryujin_sketch.png',
    accentColor: '#f97316',
    glowColor: 'rgba(249, 115, 22, 0.7)',
    auraType: 'dragon_flame',
    speed: 80,
    jump: 78,
    stats: { speed: 80, power: 92, stealth: 65 }
  },
  {
    id: 'raijin',
    serial: '03',
    number: '#03',
    name: 'RAIJIN',
    title: 'LIGHTNING RONIN',
    price: 0,
    isFree: true,
    image: '/src/assets/characters/sketch/hero_03_raijin_sketch.png',
    sketchImage: '/src/assets/characters/sketch/hero_03_raijin_sketch.png',
    accentColor: '#38bdf8',
    glowColor: 'rgba(56, 189, 248, 0.7)',
    auraType: 'storm_lightning',
    speed: 90,
    jump: 88,
    stats: { speed: 90, power: 78, stealth: 72 }
  },
  {
    id: 'tsukuyomi',
    serial: '04',
    number: '#04',
    name: 'TSUKUYOMI',
    title: 'CRIMSON KUNOICHI',
    price: 0,
    isFree: true,
    image: '/src/assets/characters/sketch/hero_04_tsukuyomi_sketch.png',
    sketchImage: '/src/assets/characters/sketch/hero_04_tsukuyomi_sketch.png',
    accentColor: '#ef4444',
    glowColor: 'rgba(239, 68, 68, 0.7)',
    auraType: 'blood_moon',
    speed: 100,
    jump: 95,
    stats: { speed: 100, power: 85, stealth: 88 }
  }
];
