/**
 * CharacterRoster — Official Roster Definition for Devil's Door.
 * Data source for Character Selection, in-game player instantiation, traits, and unlocks.
 */
export const CHARACTER_ROSTER = [
  {
    id: 'shadow_ninja',
    number: '#01',
    name: 'SHADOW NINJA',
    role: 'PROTAGONIST',
    tagline: '"The silent wanderer of the Domain."',
    description: 'An agile shinobi master equipped with a flowing crimson scarf and lethal katana dash-slashes.',
    trait: {
      name: 'AGILITY & CHAYA DASH',
      type: 'Mobility / Slashing',
      desc: 'High movement speed, double somersault flip, and high-speed cleaving dash.'
    },
    stats: {
      speed: 95,
      jump: 90,
      damage: 85,
      defense: 75
    },
    status: 'unlocked',
    cost: 0,
    image: '/src/assets/characters/hero_shadow_ninja.png',
    accentColor: '#ef4444',
    glowColor: 'rgba(239, 68, 68, 0.45)'
  },
  {
    id: 'shadow_ronin',
    number: '#02',
    name: 'SHADOW RONIN',
    role: 'ELITE WARRIOR',
    tagline: '"A master of the blade wandering the eternal mist."',
    description: 'A disciplined wandering swordsman wearing a conical straw Kasa hat and dark haori coat.',
    trait: {
      name: 'IAIJUTSU STANCE',
      type: 'Counter / Precision',
      desc: 'Devastating quick-draw katana strikes and disciplined counter-parry stances.'
    },
    stats: {
      speed: 80,
      jump: 80,
      damage: 95,
      defense: 85
    },
    status: 'unlocked',
    cost: 0,
    image: '/src/assets/characters/enemy_shadow_ronin.png',
    accentColor: '#38bdf8',
    glowColor: 'rgba(56, 189, 248, 0.45)'
  },
  {
    id: 'oni_guard',
    number: '#03',
    name: 'ONI GUARD',
    role: 'HEAVY BRUTE',
    tagline: '"Forged in demonic flames, unrelenting in battle."',
    description: 'A hulking demonic samurai encased in spiky plate armor and wielding a massive spiked Kanabo iron club.',
    trait: {
      name: 'HYPER-ARMOR SLAM',
      type: 'Area Denial / Shockwave',
      desc: 'Uninterruptible heavy armor with massive ground shockwave slams.'
    },
    stats: {
      speed: 60,
      jump: 70,
      damage: 100,
      defense: 100
    },
    status: 'locked',
    cost: 500,
    image: '/src/assets/characters/enemy_oni_guard.png',
    accentColor: '#f59e0b',
    glowColor: 'rgba(245, 158, 11, 0.45)'
  },
  {
    id: 'cursed_monk',
    number: '#04',
    name: 'CURSED MONK',
    role: 'SPECTRAL SORCERER',
    tagline: '"Bound by ancient sutras and dark spirits."',
    description: 'A levitating necromancer monk surrounded by an orbiting halo of dark cursed prayer orbs.',
    trait: {
      name: 'NECROMANCY & ORB HALO',
      type: 'Ranged / Projectiles',
      desc: 'Floating levitation mobility and homing dark shadow prayer orbs.'
    },
    stats: {
      speed: 75,
      jump: 95,
      damage: 90,
      defense: 70
    },
    status: 'locked',
    cost: 1000,
    image: '/src/assets/characters/character_roster_hd.png',
    accentColor: '#a855f7',
    glowColor: 'rgba(168, 85, 247, 0.45)'
  },
  {
    id: 'crimson_assassin',
    number: '#05',
    name: 'CRIMSON ASSASSIN',
    role: 'SHADOW STALKER',
    tagline: '"Strikes from the shadows with twin scythes."',
    description: 'A lethal assassin wearing a split demon mask and wielding dual curved Kama scythes in reverse grip.',
    trait: {
      name: 'TWIN REAPERS FLURRY',
      type: 'Rapid Multi-Hit',
      desc: 'Ultra-fast acrobatic sprints and rapid multi-slash blade flurries.'
    },
    stats: {
      speed: 100,
      jump: 90,
      damage: 90,
      defense: 65
    },
    status: 'locked',
    cost: 1500,
    image: '/src/assets/characters/character_roster.png',
    accentColor: '#e11d48',
    glowColor: 'rgba(225, 29, 72, 0.45)'
  }
];
