/**
 * SceneRoster — Official 4K Realms Roster for Devil's Door v2.3 (Visual Overhaul).
 * v2.3 additions per entry: lore (tagline string), difficulty (1-5 number), particleType string.
 * particleType values: 'ember' | 'snow' | 'spore' | 'ash' | 'mist' | 'petal'
 * High-definition cinematic realms in fixed serial order.
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
    glowColor: 'rgba(239, 68, 68, 0.6)',
    lore: 'Where the last sun bleeds before darkness claims the horizon.',
    difficulty: 1,
    particleType: 'ember'
  },
  {
    id: 'moonlight_ruins',
    serial: '02',
    number: 'REALM 02',
    name: 'MOONLIGHT CITADEL',
    price: 0,
    isFree: true,
    image: '/src/assets/backgrounds/scene_02_moonlight_ruins.jpg',
    accentColor: '#06b6d4',
    glowColor: 'rgba(6, 182, 212, 0.6)',
    lore: 'Ancient stone remembers what the living have forgotten.',
    difficulty: 2,
    particleType: 'mist'
  },
  {
    id: 'scythe_chasm',
    serial: '03',
    number: 'REALM 03',
    name: 'SHADOW SCYTHE GROVE',
    price: 0,
    isFree: true,
    image: '/src/assets/backgrounds/scene_03_scythe_chasm.jpg',
    accentColor: '#10b981',
    glowColor: 'rgba(16, 185, 129, 0.6)',
    lore: 'Every blade of grass hides the edge of a deeper death.',
    difficulty: 2,
    particleType: 'spore'
  },
  {
    id: 'crystal_abyss',
    serial: '04',
    number: 'REALM 04',
    name: 'RUBY CRYSTAL ABYSS',
    price: 0,
    isFree: true,
    image: '/src/assets/backgrounds/scene_04_crystal_abyss.jpg',
    accentColor: '#f43f5e',
    glowColor: 'rgba(244, 63, 94, 0.6)',
    lore: 'Crimson shards do not shatter — they slice those who seek them.',
    difficulty: 3,
    particleType: 'ember'
  },
  {
    id: 'bamboo_mist',
    serial: '05',
    number: 'REALM 05',
    name: 'SHADOW BAMBOO GROVE',
    price: 0,
    isFree: true,
    image: '/src/assets/backgrounds/scene_05_bamboo_mist.png',
    accentColor: '#10b981',
    glowColor: 'rgba(16, 185, 129, 0.6)',
    lore: 'The mist does not conceal — it reveals your fear.',
    difficulty: 3,
    particleType: 'petal'
  },
  {
    id: 'crimson_temple',
    serial: '06',
    number: 'REALM 06',
    name: 'CRIMSON PAGODA',
    price: 0,
    isFree: true,
    image: '/src/assets/backgrounds/scene_06_crimson_temple.png',
    accentColor: '#e11d48',
    glowColor: 'rgba(225, 29, 72, 0.6)',
    lore: 'Each pillar was stained by a shinobi who believed they were ready.',
    difficulty: 3,
    particleType: 'ash'
  },
  {
    id: 'underworld_gate',
    serial: '07',
    number: 'REALM 07',
    name: "DEVIL'S GATE ABYSS",
    price: 0,
    isFree: true,
    image: '/src/assets/backgrounds/scene_07_underworld_gate.png',
    accentColor: '#8b5cf6',
    glowColor: 'rgba(139, 92, 246, 0.6)',
    lore: 'The gate opens. Only those who deserve it find the other side.',
    difficulty: 4,
    particleType: 'spore'
  },
  {
    id: 'celestial_ruins',
    serial: '08',
    number: 'REALM 08',
    name: 'CELESTIAL DRAGON RUINS',
    price: 0,
    isFree: true,
    image: '/src/assets/backgrounds/scene_08_celestial_ruins.png',
    accentColor: '#38bdf8',
    glowColor: 'rgba(56, 189, 248, 0.6)',
    lore: 'Gods fell here. Their bones form the floor beneath your feet.',
    difficulty: 4,
    particleType: 'snow'
  },
  {
    id: 'shadow_peak',
    serial: '09',
    number: 'REALM 09',
    name: 'OBSIDIAN PEAK',
    price: 0,
    isFree: true,
    image: '/src/assets/backgrounds/scene_09_shadow_peak.png',
    accentColor: '#f59e0b',
    glowColor: 'rgba(245, 158, 11, 0.6)',
    lore: 'Climb until your hands bleed. The peak does not care.',
    difficulty: 4,
    particleType: 'ash'
  },
  {
    id: 'blood_moon',
    serial: '10',
    number: 'REALM 10',
    name: 'BLOOD MOON SANCTUARY',
    price: 0,
    isFree: true,
    image: '/src/assets/backgrounds/scene_10_blood_moon.png',
    accentColor: '#dc2626',
    glowColor: 'rgba(220, 38, 38, 0.6)',
    lore: 'The moon turns red when it witnesses what you are about to do.',
    difficulty: 5,
    particleType: 'ash'
  }
];
