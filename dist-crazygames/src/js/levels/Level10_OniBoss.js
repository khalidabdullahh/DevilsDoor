import { BaseLevel } from './BaseLevel.js';
import { OniBossEnemy } from '../entities/OniBossEnemy.js';

/**
 * Level 10 — "Demonic Oni Gate" (The Final Boss Arena — Screenshot 2 Match).
 * Features lightning storm strikes and the Demonic Giant Samurai Boss.
 */
export class Level10_OniBoss extends BaseLevel {
  constructor() {
    super(10, 'Demonic Oni Gate', 'boss', 1900, 900);
    this.playerStartX = 120;
    this.playerStartY = 480;
    this.bossDefeated = false;
    this._build();
  }

  _build() {
    // 1. Grand Boss Arena Floor
    this.solids.push({ x: 950, y: 550, width: 1900, height: 350, tag: 'boss_arena_floor', active: true });

    // Arena Boundary Walls
    this.solids.push({ x: 50, y: 350, width: 100, height: 400, tag: 'boss_wall_left', active: true });
    this.solids.push({ x: 1850, y: 350, width: 100, height: 400, tag: 'boss_wall_right', active: true });

    // Hanging Lanterns
    this.lanterns.push({ x: 200, y: 510 });
    this.lanterns.push({ x: 600, y: 510 });
    this.lanterns.push({ x: 1000, y: 510 });
    this.lanterns.push({ x: 1400, y: 510 });
    this.lanterns.push({ x: 1700, y: 510 });

    // 2. Spawn Demonic Oni Samurai Giant Boss
    const boss = new OniBossEnemy(1200, 440);
    this.enemies.push(boss);

    // Position Final Devil's Door behind the boss
    this.door.x = 1720;
    this.door.y = 470;
  }

  update(dt, player, audio, camera) {
    super.update(dt, player, audio, camera);

    const boss = this.enemies[0];
    if (boss && boss.isDead && !this.bossDefeated) {
      this.bossDefeated = true;
      if (audio) audio.playLevelComplete();
      if (camera) camera.addShake(0.8);
    }
  }

  checkDoorEntry(player) {
    const boss = this.enemies[0];
    // Must defeat the Oni Boss to unlock the Final Devil's Door!
    if (boss && !boss.isDead) return false;
    return super.checkDoorEntry(player);
  }
}
