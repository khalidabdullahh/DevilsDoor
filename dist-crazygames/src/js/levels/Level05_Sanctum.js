import { BaseLevel } from './BaseLevel.js';
import { ShadowNinjaEnemy } from '../entities/ShadowNinjaEnemy.js';

/**
 * Level 05 — "Forgotten Sanctum" (Ancient Ruins Biome).
 * Features vertical wall-jump shafts and ancient clay vessels.
 */
export class Level05_Sanctum extends BaseLevel {
  constructor() {
    super(5, 'Forgotten Sanctum', 'cavern', 1900, 900);
    this.playerStartX = 100;
    this.playerStartY = 480;
    this._build();
  }

  _build() {
    // 1. Lower Floor & Vertical Wall-Jump Shaft
    this.solids.push({ x: 300, y: 540, width: 600, height: 350, tag: 'sanctum_floor_1', active: true });
    this.solids.push({ x: 620, y: 380, width: 60, height: 260, tag: 'wall_jump_left', active: true });
    this.solids.push({ x: 740, y: 300, width: 60, height: 340, tag: 'wall_jump_right', active: true });
    this.solids.push({ x: 1000, y: 300, width: 460, height: 40, tag: 'high_sanctum_hall', active: true });
    this.solids.push({ x: 1500, y: 540, width: 600, height: 350, tag: 'sanctum_floor_2', active: true });

    // 2. Props & Lanterns
    this.lanterns.push({ x: 180, y: 500 });
    this.lanterns.push({ x: 920, y: 260 });
    this.lanterns.push({ x: 1400, y: 500 });
    this.urns.push({ x: 420, y: 540 });
    this.urns.push({ x: 880, y: 300 });
    this.urns.push({ x: 1140, y: 300 });

    // 3. Hazards
    this.hazards.push({ x: 860, y: 524, width: 140, height: 24, tag: 'sanctum_pit', active: true });
    this.hazards.push({ x: 1320, y: 524, width: 80, height: 24, tag: 'floor_spikes', active: true });

    // 4. Enemies
    const scout1 = new ShadowNinjaEnemy(450, 486, 320, 580, 'scout');
    const spear = new ShadowNinjaEnemy(1020, 246, 920, 1180, 'spear');
    this.enemies.push(scout1);
    this.enemies.push(spear);
  }
}
