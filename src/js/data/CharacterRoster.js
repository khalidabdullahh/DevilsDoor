/**
 * CharacterRoster — Official 4-Hero Roster for Devil's Door v2.2 (vNext Master Edition).
 * High-definition hand-drawn sketch & 3D character artwork in fixed serial order:
 * 01 — KAGE-RYU (SHADOW SHINOBI) [FREE]
 * 02 — RYUJIN (DRAGON NINJA) [500 POINTS]
 * 03 — RAIJIN (LIGHTNING RONIN) [700 POINTS]
 * 04 — TSUKUYOMI (CRIMSON KUNOICHI) [1000 POINTS]
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
