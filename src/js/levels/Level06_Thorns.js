import { BaseLevel } from './BaseLevel.js';
import { ShadowNinjaEnemy } from '../entities/ShadowNinjaEnemy.js';

/**
 * Level 06 — "Crimson Thorns" (Thorn Forest Biome).
 * Features hanging demon pods and dense thorn pit hazards.
 */
export class Level06_Thorns extends BaseLevel {
  constructor() {
    super(6, 'Crimson Thorns', 'boss', 1900, 900);
    this.playerStartX = 100;
    this.playerStartY = 480;
    this._build();
  }

  _build() {
    // 1. Terrain Ledges
    this.solids.push({ x: 280, y: 540, width: 560, height: 350, tag: 'thorn_ground_1', active: true });
    this.solids.push({ x: 800, y: 460, width: 320, height: 400, tag: 'thorn_mid_rock', active: true });
    this.solids.push({ x: 1420, y: 540, width: 760, height: 350, tag: 'thorn_ground_2', active: true });

    // High Branch
    this.solids.push({ x: 1100, y: 340, width: 220, height: 24, tag: 'thorn_branch', active: true });

    // 2. Traps & Hazards
    this.hazards.push({ x: 600, y: 524, width: 95, height: 24, tag: 'thorn_pit_1', active: true });
    this.hazards.push({ x: 1040, y: 524, width: 95, height: 24, tag: 'thorn_pit_2', active: true });
    this.hazards.push({ x: 1380, y: 524, width: 75, height: 24, tag: 'floor_spikes', active: true });

    this.lanterns.push({ x: 160, y: 500 });
    this.lanterns.push({ x: 740, y: 420 });
    this.lanterns.push({ x: 1350, y: 500 });

    // 3. Enemies
    const scout1 = new ShadowNinjaEnemy(760, 406, 680, 920, 'scout');
    const scout2 = new ShadowNinjaEnemy(1450, 486, 1300, 1650, 'scout');
    this.enemies.push(scout1);
    this.enemies.push(scout2);
  }
}
