import { BaseLevel } from './BaseLevel.js';
import { ShadowNinjaEnemy } from '../entities/ShadowNinjaEnemy.js';

/**
 * Level 09 — "Hall of 1000 Blades" (Blade Fortress Biome).
 * Features multiple synchronized pendulum axes and deadly blade gauntlets.
 */
export class Level09_Blades extends BaseLevel {
  constructor() {
    super(9, 'Hall of 1000 Blades', 'cavern', 1900, 900);
    this.playerStartX = 100;
    this.playerStartY = 480;
    this._build();
  }

  _build() {
    // 1. Blade Fortress Platforms
    this.solids.push({ x: 280, y: 540, width: 560, height: 350, tag: 'blade_ground_1', active: true });
    this.solids.push({ x: 780, y: 480, width: 320, height: 400, tag: 'blade_ledge_1', active: true });
    this.solids.push({ x: 1220, y: 440, width: 340, height: 400, tag: 'blade_ledge_2', active: true });
    this.solids.push({ x: 1600, y: 540, width: 440, height: 350, tag: 'blade_ground_2', active: true });

    // Ceiling
    this.solids.push({ x: 900, y: 120, width: 1800, height: 120, tag: 'blade_roof', active: true });

    // 2. Triple Synchronized Pendulum Battleaxes
    this.pendulumAxes.push({
      anchorX: 580,
      anchorY: 120,
      length: 240,
      angle: 0,
      speed: 3.0
    });

    this.pendulumAxes.push({
      anchorX: 980,
      anchorY: 120,
      length: 240,
      angle: Math.PI / 2,
      speed: 3.2
    });

    this.pendulumAxes.push({
      anchorX: 1420,
      anchorY: 120,
      length: 240,
      angle: Math.PI,
      speed: 2.8
    });

    // 3. Hazards & Props
    this.hazards.push({ x: 580, y: 524, width: 90, height: 24, tag: 'spike_pit_1', active: true });
    this.hazards.push({ x: 980, y: 524, width: 90, height: 24, tag: 'spike_pit_2', active: true });
    this.hazards.push({ x: 1420, y: 524, width: 85, height: 24, tag: 'spike_pit_3', active: true });

    this.lanterns.push({ x: 180, y: 500 });
    this.lanterns.push({ x: 1550, y: 500 });

    // 4. Enemies
    const spear = new ShadowNinjaEnemy(780, 426, 680, 900, 'spear');
    const scout = new ShadowNinjaEnemy(1220, 386, 1100, 1340, 'scout');
    this.enemies.push(spear);
    this.enemies.push(scout);
  }
}
