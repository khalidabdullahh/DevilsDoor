import { BaseLevel } from './BaseLevel.js';
import { ShadowNinjaEnemy } from '../entities/ShadowNinjaEnemy.js';

/**
 * Level 08 — "The Burning Pagoda" (Pagoda Inferno Biome).
 * Features multi-tier pagoda temple roofs and vertical ascent.
 */
export class Level08_Pagoda extends BaseLevel {
  constructor() {
    super(8, 'The Burning Pagoda', 'boss', 1900, 900);
    this.playerStartX = 100;
    this.playerStartY = 480;
    this._build();
  }

  _build() {
    // 1. Pagoda Tier Platforms
    this.solids.push({ x: 260, y: 540, width: 520, height: 350, tag: 'pagoda_base', active: true });
    this.solids.push({ x: 620, y: 440, width: 280, height: 26, tag: 'pagoda_tier_1', active: true });
    this.solids.push({ x: 920, y: 340, width: 280, height: 26, tag: 'pagoda_tier_2', active: true });
    this.solids.push({ x: 1220, y: 440, width: 280, height: 26, tag: 'pagoda_tier_3', active: true });
    this.solids.push({ x: 1560, y: 540, width: 480, height: 350, tag: 'pagoda_end_ground', active: true });

    // 2. Burning Campfires & Lanterns
    this.campfires.push({ x: 920, y: 340 });
    this.lanterns.push({ x: 180, y: 500 });
    this.lanterns.push({ x: 620, y: 400 });
    this.lanterns.push({ x: 1220, y: 400 });
    this.lanterns.push({ x: 1500, y: 500 });

    // 3. Hazards
    this.hazards.push({ x: 550, y: 524, width: 80, height: 24, tag: 'floor_spikes_1', active: true });
    this.hazards.push({ x: 1380, y: 524, width: 80, height: 24, tag: 'floor_spikes_2', active: true });

    // 4. Enemies
    const scout1 = new ShadowNinjaEnemy(620, 386, 520, 720, 'scout');
    const scout2 = new ShadowNinjaEnemy(1220, 386, 1120, 1320, 'scout');
    this.enemies.push(scout1);
    this.enemies.push(scout2);
  }
}
