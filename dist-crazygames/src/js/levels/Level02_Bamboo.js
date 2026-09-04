import { BaseLevel } from './BaseLevel.js';
import { ShadowNinjaEnemy } from '../entities/ShadowNinjaEnemy.js';

/**
 * Level 02 — "Whispering Bamboo" (Emerald Teal Bamboo Biome).
 * Features dense bamboo silhouettes, roadside Hokora shrines, and dual scout encounters.
 */
export class Level02_Bamboo extends BaseLevel {
  constructor() {
    super(2, 'Whispering Bamboo', 'bamboo', 1900, 900);
    this.playerStartX = 100;
    this.playerStartY = 480;
    this._build();
  }

  _build() {
    // 1. Terrain Ledges
    this.solids.push({ x: 300, y: 540, width: 600, height: 350, tag: 'bamboo_ground_1', active: true });
    this.solids.push({ x: 850, y: 460, width: 350, height: 400, tag: 'bamboo_mid_ledge', active: true });
    this.solids.push({ x: 1400, y: 540, width: 800, height: 350, tag: 'bamboo_ground_2', active: true });

    // High Branch Scaffolds
    this.solids.push({ x: 600, y: 340, width: 220, height: 24, tag: 'high_branch', active: true });
    this.solids.push({ x: 1100, y: 320, width: 200, height: 24, tag: 'high_branch_2', active: true });

    // 2. Props, Hokora Stone Shrines & Lanterns (Screenshot 4 Match)
    this.lanterns.push({ x: 180, y: 500 });
    this.lanterns.push({ x: 740, y: 420 });
    this.lanterns.push({ x: 1300, y: 500 });
    this.urns.push({ x: 520, y: 540 });
    this.urns.push({ x: 880, y: 460 });
    this.hokoraShrines.push({ x: 1020, y: 460 });

    // 3. Hazards
    this.hazards.push({ x: 640, y: 524, width: 80, height: 24, tag: 'bamboo_pit', active: true });
    this.hazards.push({ x: 1060, y: 524, width: 90, height: 24, tag: 'floor_spikes', active: true });

    // 4. Enemies
    const scout1 = new ShadowNinjaEnemy(550, 486, 420, 680, 'scout');
    const scout2 = new ShadowNinjaEnemy(1350, 486, 1200, 1550, 'scout');
    this.enemies.push(scout1);
    this.enemies.push(scout2);
  }
}
