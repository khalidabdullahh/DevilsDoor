/**
 * SceneRoster — Official 4K Realms Roster for Devil's Door v2.2 (vNext Master Edition).
 * High-definition cinematic realms in fixed serial order:
 * 01 — SUNSET SANCTUARY [FREE]
 * 02 — MOONLIGHT CITADEL [500 POINTS]
 * 03 — SHADOW SCYTHE GROVE [700 POINTS]
 * 04 — RUBY CRYSTAL ABYSS [1000 POINTS]
 */
export const SCENE_ROSTER = [
  {
    id: 'sunset_torii',
    serial: '01',
    number: 'REALM 01',
    name: 'SUNSET SANCTUARY',
    price: 0,
    isFree: true,
    image: '/src/assets/backgrounds/scene_01_sunset_torii.jpg',
    accentColor: '#ef4444',
    glowColor: 'rgba(239, 68, 68, 0.6)'
  },
  {
    id: 'moonlight_ruins',
    serial: '02',
    number: 'REALM 02',
    name: 'MOONLIGHT CITADEL',
    price: 500,
    isFree: false,
    image: '/src/assets/backgrounds/scene_02_moonlight_ruins.jpg',
    accentColor: '#06b6d4',
    glowColor: 'rgba(6, 182, 212, 0.6)'
  },
  {
    id: 'scythe_chasm',
    serial: '03',
    number: 'REALM 03',
    name: 'SHADOW SCYTHE GROVE',
    price: 700,
    isFree: false,
    image: '/src/assets/backgrounds/scene_03_scythe_chasm.jpg',
    accentColor: '#10b981',
    glowColor: 'rgba(16, 185, 129, 0.6)'
  },
  {
    id: 'crystal_abyss',
    serial: '04',
    number: 'REALM 04',
    name: 'RUBY CRYSTAL ABYSS',
    price: 1000,
    isFree: false,
    image: '/src/assets/backgrounds/scene_04_crystal_abyss.jpg',
    accentColor: '#f43f5e',
    glowColor: 'rgba(244, 63, 94, 0.6)'
  }
];
