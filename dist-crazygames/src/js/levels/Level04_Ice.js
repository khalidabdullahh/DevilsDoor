import { BaseLevel } from './BaseLevel.js';
import { ShadowNinjaEnemy } from '../entities/ShadowNinjaEnemy.js';

/**
 * Level 04 — "Frozen Abyss" (Glacial Ice Biome).
 * Features hanging icicles, snow mist, and snowy bridge traversal.
 */
export class Level04_Ice extends BaseLevel {
  constructor() {
    super(4, 'Frozen Abyss', 'ice', 1900, 900);
    this.playerStartX = 100;
    this.playerStartY = 480;
    this._build();
  }

  _build() {
    // 1. Ice Platforms
    this.solids.push({ x: 280, y: 540, width: 560, height: 350, tag: 'ice_ledge_1', active: true });
    this.solids.push({ x: 800, y: 480, width: 340, height: 400, tag: 'ice_ledge_mid', active: true });
    this.solids.push({ x: 1420, y: 540, width: 760, height: 350, tag: 'ice_ledge_2', active: true });

    // Upper Ice Bridge
    this.solids.push({ x: 1100, y: 360, width: 260, height: 20, tag: 'ice_bridge', active: true });

    // Ceiling with Hanging Icicles
    this.solids.push({ x: 900, y: 120, width: 1800, height: 120, tag: 'ice_ceiling', active: true });
    this.hazards.push({ x: 550, y: 130, width: 140, height: 30, tag: 'ceiling_spikes', active: true });
    this.hazards.push({ x: 1250, y: 130, width: 160, height: 30, tag: 'ceiling_spikes', active: true });

    // 2. Props & Hazards
    this.hazards.push({ x: 600, y: 524, width: 90, height: 24, tag: 'ice_pit', active: true });
    this.hazards.push({ x: 1020, y: 524, width: 85, height: 24, tag: 'floor_spikes', active: true });

    this.lanterns.push({ x: 160, y: 500 });
    this.lanterns.push({ x: 720, y: 440 });
    this.lanterns.push({ x: 1350, y: 500 });

    // 3. Enemies
    const spear1 = new ShadowNinjaEnemy(760, 426, 680, 920, 'spear');
    const spear2 = new ShadowNinjaEnemy(1380, 486, 1260, 1580, 'spear');
    this.enemies.push(spear1);
    this.enemies.push(spear2);
  }
}
