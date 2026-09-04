/**
 * CharacterRoster — Official 6-Hero Playable Roster for Devil's Door.
 * Each character has their own standalone solo full-body artwork:
 * 1. #01 Shadow Ninja (Protagonist)
 * 2. #02 Shadow Ronin (Swordsman)
 * 3. #03 Oni Warrior (Heavy Armored Brute)
 * 4. #04 Cursed Monk (Spectral Sorcerer)
 * 5. #05 Crimson Assassin (Dual Scythe Stalker)
 * 6. #06 Shadow Entity (Demonic Void Entity)
 */
export const CHARACTER_ROSTER = [
  {
    id: 'shadow_ninja',
    number: '#01',
    name: 'SHADOW NINJA',
    role: 'PROTAGONIST',
    tagline: '"The silent wanderer of the Domain."',
    description: 'An agile shinobi master equipped with a pointed cowl hood, voluminous flowing crimson scarf, and lethal katana dash-slashes.',
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
    image: './src/assets/characters/solo/hero_01_shadow_ninja.png',
    accentColor: '#ef4444',
    glowColor: 'rgba(239, 68, 68, 0.45)'
  },
  {
    id: 'shadow_ronin',
    number: '#02',
    name: 'SHADOW RONIN',
    role: 'ELITE SWORDSMAN',
    tagline: '"A master of the blade wandering the eternal mist."',
    description: 'A disciplined wandering samurai wearing a conical straw Kasa hat and long flowing haori coat.',
    trait: {
      name: 'IAIJUTSU STANCE',
      type: 'Counter / Precision',
      desc: 'Devastating quick-draw dual katana strikes and high blade poise.'
    },
    stats: {
      speed: 85,
      jump: 80,
      damage: 95,
      defense: 85
    },
    status: 'unlocked',
    cost: 0,
    image: './src/assets/characters/solo/hero_02_shadow_ronin.png',
    accentColor: '#38bdf8',
    glowColor: 'rgba(56, 189, 248, 0.45)'
  },
  {
    id: 'oni_guard',
    number: '#03',
    name: 'ONI WARRIOR',
    role: 'HEAVY BRUTE',
    tagline: '"Forged in demonic flames, unrelenting in battle."',
    description: 'A hulking demon warrior encased in spiky plate armor and wielding a massive spiked Kanabo iron club.',
    trait: {
      name: 'HYPER-ARMOR SLAM',
      type: 'Area Denial / Shockwave',
      desc: 'Heavy hyper-armor defense with crushing ground Kanabo slams.'
    },
    stats: {
      speed: 65,
      jump: 75,
      damage: 100,
      defense: 100
    },
    status: 'unlocked',
    cost: 0,
    image: './src/assets/characters/solo/hero_03_oni_warrior.png',
    accentColor: '#f59e0b',
    glowColor: 'rgba(245, 158, 11, 0.45)'
  },
  {
    id: 'cursed_monk',
    number: '#04',
    name: 'CURSED MONK',
    role: 'SPECTRAL SORCERER',
    tagline: '"Bound by ancient sutras and dark spirits."',
    description: 'A floating necromancer monk in tattered robes surrounded by an orbiting halo of dark prayer orbs.',
    trait: {
      name: 'NECROMANCY & ORB HALO',
      type: 'Levitation / Projectiles',
      desc: 'Floating levitation physics and continuous orbiting dark curse prayer orbs.'
    },
    stats: {
      speed: 80,
      jump: 95,
      damage: 90,
      defense: 70
    },
    status: 'unlocked',
    cost: 0,
    image: './src/assets/characters/solo/hero_04_cursed_monk.png',
    accentColor: '#a855f7',
    glowColor: 'rgba(168, 85, 247, 0.45)'
  },
  {
    id: 'crimson_assassin',
    number: '#05',
    name: 'CRIMSON ASSASSIN',
    role: 'SHADOW STALKER',
    tagline: '"Strikes from the shadows with twin scythes."',
    description: 'A lethal acrobat wearing a split half-red demon mask and wielding dual curved Kama scythes.',
    trait: {
      name: 'TWIN REAPERS FLURRY',
      type: 'Rapid Multi-Hit',
      desc: 'Ultra-fast acrobatic sprint speed and rapid dual scythe flurry slashes.'
    },
    stats: {
      speed: 100,
      jump: 90,
      damage: 90,
      defense: 65
    },
    status: 'unlocked',
    cost: 0,
    image: './src/assets/characters/solo/hero_05_crimson_assassin.png',
    accentColor: '#e11d48',
    glowColor: 'rgba(225, 29, 72, 0.45)'
  },
  {
    id: 'shadow_entity',
    number: '#06',
    name: 'SHADOW ENTITY',
    role: 'DEMONIC PHANTOM',
    tagline: '"Born from the void of the Devil\'s Door."',
    description: 'A legendary phantom composed of levitating obsidian crystal shards orbiting a pulsing crimson void singularity.',
    trait: {
      name: 'VOID SINGULARITY',
      type: 'Void Surge / Shards',
      desc: 'Floating crystal flight and devastating crimson void wave eruptions.'
    },
    stats: {
      speed: 90,
      jump: 100,
      damage: 100,
      defense: 90
    },
    status: 'unlocked',
    cost: 0,
    image: './src/assets/characters/solo/hero_06_shadow_entity.png',
    accentColor: '#9333ea',
    glowColor: 'rgba(147, 51, 234, 0.5)'
  }
];
