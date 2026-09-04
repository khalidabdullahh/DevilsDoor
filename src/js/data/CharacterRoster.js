/**
 * CharacterRoster — Official 4-Hero Playable Roster for Devil's Door v2.1.
 * High-definition solo character artwork and unique combat specializations:
 * 1. #01 Kage-Ryu (Void Shadow Shinobi)
 * 2. #02 Ryujin (Dragon-Flame Demonic Ninja)
 * 3. #03 Raijin (Storm Lightning Ronin)
 * 4. #04 Tsukuyomi (Crimson Kunoichi)
 */
export const CHARACTER_ROSTER = [
  {
    id: 'kage_ryu',
    number: '#01',
    name: 'KAGE-RYU',
    role: 'VOID SHADOW SHINOBI',
    tagline: '"Silent death from the abyssal void."',
    description: 'A master shinobi clad in matte-black armor and pointed cowl hood, striking from the shadows with dual katanas and void energy.',
    trait: {
      name: 'VOID DASH & TRIPLE SHURIKEN',
      type: 'Agility / Stealth',
      desc: 'High movement speed, somersault double-jump, and rapid void-infused shuriken volleys.'
    },
    stats: {
      speed: 95,
      jump: 90,
      damage: 85,
      defense: 80
    },
    status: 'unlocked',
    cost: 0,
    image: '/src/assets/characters/solo/hero_01_kage_ryu.png',
    accentColor: '#a855f7',
    glowColor: 'rgba(168, 85, 247, 0.5)'
  },
  {
    id: 'ryujin',
    number: '#02',
    name: 'RYUJIN',
    role: 'DRAGON-FLAME DEMONIC NINJA',
    tagline: '"Forged in dragon flames, unrelenting in fury."',
    description: 'A hulking warrior encased in dragon-scale armor and horned Oni mask, swinging a massive molten fire katana.',
    trait: {
      name: 'DRAGON CLEAVE & FLAME AURA',
      type: 'Heavy Damage / Juggernaut',
      desc: 'High vitality, devastating burning flame slash trails, and bonus damage resistance.'
    },
    stats: {
      speed: 75,
      jump: 75,
      damage: 100,
      defense: 95
    },
    status: 'unlocked',
    cost: 0,
    image: '/src/assets/characters/solo/hero_02_ryujin.png',
    accentColor: '#f97316',
    glowColor: 'rgba(249, 115, 22, 0.5)'
  },
  {
    id: 'raijin',
    number: '#03',
    name: 'RAIJIN',
    role: 'STORM LIGHTNING RONIN',
    tagline: '"The thunder god wanders beneath the straw hat."',
    description: 'A disciplined ronin ninja wearing a conical Kasa hat and electric rune plates, dual-wielding lightning-infused blades.',
    trait: {
      name: 'THUNDER SLASH & CHAIN SPARKS',
      type: 'Counter / Electric AoE',
      desc: 'High-speed lightning dash slashes and electric shuriken projectiles that shock obstacles.'
    },
    stats: {
      speed: 90,
      jump: 85,
      damage: 90,
      defense: 85
    },
    status: 'unlocked',
    cost: 0,
    image: '/src/assets/characters/solo/hero_03_raijin.png',
    accentColor: '#38bdf8',
    glowColor: 'rgba(56, 189, 248, 0.5)'
  },
  {
    id: 'tsukuyomi',
    number: '#04',
    name: 'TSUKUYOMI',
    role: 'CRIMSON KUNOICHI',
    tagline: '"Crescent reaper dancing under the blood moon."',
    description: 'A lethal acrobat wearing a porcelain half-mask and wielding twin crimson Kama sickle scythes with blazing agility.',
    trait: {
      name: 'TWIN REAPERS FLURRY & MOONFLIP',
      type: 'Acrobatic / Multi-Hit',
      desc: 'Maximum acrobatic sprint speed, elevated double-jump flips, and rapid curved scythe slashes.'
    },
    stats: {
      speed: 100,
      jump: 95,
      damage: 85,
      defense: 70
    },
    status: 'unlocked',
    cost: 0,
    image: '/src/assets/characters/solo/hero_04_tsukuyomi.png',
    accentColor: '#f43f5e',
    glowColor: 'rgba(244, 63, 94, 0.5)'
  }
];

