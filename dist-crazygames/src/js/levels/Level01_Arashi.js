import { BaseLevel } from './BaseLevel.js';
import { ShadowNinjaEnemy } from '../entities/ShadowNinjaEnemy.js';

/**
 * Level 01 — "The First Assumption" (Cliffside Pine Monastery).
 */
export class Level01_Arashi extends BaseLevel {
  constructor() {
    super(1, 'The First Assumption', 'desert', 1800, 900);
    this.playerStartX = 100;
    this.playerStartY = 220;
    this._build();
  }

  _build() {
    // 1. Starting Mountain Ledge
    this.solids.push({ x: 200, y: 280, width: 400, height: 450, tag: 'start_cliff', active: true });
    this.lanterns.push({ x: 80, y: 240 });
    this.lanterns.push({ x: 360, y: 240 });

    // 2. Collapsing Wooden Rope Bridge
    for (let i = 0; i < 8; i++) {
      const px = 430 + i * 50;
      const plank = {
        x: px,
        y: 280,
        originalY: 280,
        width: 46,
        height: 14,
        tag: 'collapsing_plank',
        active: true,
        isFalling: false,
        rot: 0
      };
      this.solids.push(plank);
      this.bridgePlanks.push(plank);
    }

    // High Far Decoy Ledge
    this.solids.push({ x: 920, y: 280, width: 200, height: 450, tag: 'decoy_ledge', active: true });
    this.hazards.push({ x: 610, y: 120, width: 280, height: 32, tag: 'ceiling_spikes', active: true });

    // 3. Lower Combat Arena
    this.solids.push({ x: 1000, y: 560, width: 1600, height: 300, tag: 'crypt_floor', active: true });
    this.lanterns.push({ x: 320, y: 520 });
    this.lanterns.push({ x: 680, y: 520 });
    this.lanterns.push({ x: 1080, y: 520 });
    this.lanterns.push({ x: 1480, y: 520 });

    // 4. Tactical Enemies & Traps
    const scout = new ShadowNinjaEnemy(720, 506, 600, 840, 'scout');
    this.enemies.push(scout);

    this.hazards.push({ x: 920, y: 544, width: 85, height: 24, tag: 'bamboo_spikes', active: true });

    const spearman = new ShadowNinjaEnemy(1200, 506, 1050, 1340, 'spear');
    this.enemies.push(spearman);

    this.hazards.push({ x: 1380, y: 544, width: 75, height: 24, tag: 'floor_spikes', active: true });
  }

  update(dt, player, audio, camera) {
    if (!this.deceptionTriggered && player) {
      if (player.x >= 460 && player.x <= 780 && player.y <= 300) {
        this.deceptionTriggered = true;
        this.collapseTime = 0;
        if (audio) audio.playStoneCollapse();
        if (camera) camera.addShake(0.65);
      }
    }
    super.update(dt, player, audio, camera);
  }
}
