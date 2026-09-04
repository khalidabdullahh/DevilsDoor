import { BaseLevel } from './BaseLevel.js';
import { ShadowNinjaEnemy } from '../entities/ShadowNinjaEnemy.js';

/**
 * Level 07 — "Golden Dunes" (Desert Sunset Biome — Screenshot 1 Match).
 * Features burning campfires and desert ridge platforms.
 */
export class Level07_Desert extends BaseLevel {
  constructor() {
    super(7, 'Golden Dunes', 'desert', 1900, 900);
    this.playerStartX = 100;
    this.playerStartY = 480;
    this._build();
  }

  _build() {
    // 1. Terrain Ledges & Slopes
    this.solids.push({ x: 300, y: 540, width: 600, height: 350, tag: 'desert_ground_1', active: true });
    this.solids.push({ x: 860, y: 460, width: 360, height: 400, tag: 'desert_cliff', active: true });
    this.solids.push({ x: 1440, y: 540, width: 720, height: 350, tag: 'desert_ground_2', active: true });

    // Wooden Scaffold
    this.solids.push({ x: 1080, y: 360, width: 220, height: 20, tag: 'wood_scaffold', active: true });

    // 2. Burning Campfires (Screenshot 1 Match)
    this.campfires.push({ x: 420, y: 540 });
    this.campfires.push({ x: 920, y: 460 });

    // 3. Hazards & Props
    this.hazards.push({ x: 640, y: 524, width: 90, height: 24, tag: 'desert_pit', active: true });
    this.hazards.push({ x: 1300, y: 524, width: 85, height: 24, tag: 'floor_spikes', active: true });

    this.lanterns.push({ x: 180, y: 500 });
    this.lanterns.push({ x: 1480, y: 500 });

    // 4. Enemies
    const scout = new ShadowNinjaEnemy(540, 486, 460, 680, 'scout');
    const spear = new ShadowNinjaEnemy(1380, 486, 1220, 1600, 'spear');
    this.enemies.push(scout);
    this.enemies.push(spear);
  }
}
