import { BaseLevel } from './BaseLevel.js';
import { ShadowNinjaEnemy } from '../entities/ShadowNinjaEnemy.js';

/**
 * Level 03 — "Cavern of Claws" (Lilac Cavern Biome).
 * Features swinging pendulum battleaxes and cavern stalactite traps.
 */
export class Level03_Cavern extends BaseLevel {
  constructor() {
    super(3, 'Cavern of Claws', 'cavern', 1900, 900);
    this.playerStartX = 100;
    this.playerStartY = 480;
    this._build();
  }

  _build() {
    // 1. Cavern Platforms
    this.solids.push({ x: 320, y: 540, width: 640, height: 350, tag: 'cavern_floor_1', active: true });
    this.solids.push({ x: 920, y: 500, width: 380, height: 400, tag: 'cavern_step', active: true });
    this.solids.push({ x: 1460, y: 540, width: 700, height: 350, tag: 'cavern_floor_2', active: true });

    // Cavern Ceiling
    this.solids.push({ x: 900, y: 140, width: 1800, height: 140, tag: 'cavern_roof', active: true });

    // 2. Swinging Pendulum Battleaxes (Screenshot 5 Match)
    this.pendulumAxes.push({
      anchorX: 680,
      anchorY: 140,
      length: 220,
      angle: 0,
      speed: 2.6
    });

    this.pendulumAxes.push({
      anchorX: 1180,
      anchorY: 140,
      length: 220,
      angle: Math.PI / 2,
      speed: 2.8
    });

    // 3. Spikes & Props
    this.hazards.push({ x: 680, y: 524, width: 80, height: 24, tag: 'pit_spikes', active: true });
    this.hazards.push({ x: 1180, y: 484, width: 75, height: 24, tag: 'step_spikes', active: true });

    this.lanterns.push({ x: 220, y: 500 });
    this.lanterns.push({ x: 1400, y: 500 });
    this.urns.push({ x: 420, y: 540 });
    this.urns.push({ x: 960, y: 500 });

    // 4. Enemies
    const spearman = new ShadowNinjaEnemy(850, 446, 760, 1050, 'spear');
    const scout = new ShadowNinjaEnemy(1520, 486, 1380, 1680, 'scout');
    this.enemies.push(spearman);
    this.enemies.push(scout);
  }
}
