import { CollisionBox } from '../physics/CollisionBox.js';

/**
 * Hazard — Spikes, velocity-sensitive falling weights, and dynamic traps.
 */
export class Hazard {
  constructor(x, y, width, height, type = 'spike', tag = 'hazard') {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.type = type; // 'spike', 'falling_weight', 'laser'
    this.tag = tag;

    this.box = new CollisionBox(x, y, width, height, 'hazard', tag);

    // Dynamic movement state
    this.vx = 0;
    this.vy = 0;
    this.isFalling = false;
    this.fallTriggered = false;
    this.delayTimer = 0;
    this.leadMultiplier = 0.8;
  }

  triggerFall(delay = 0) {
    if (this.fallTriggered) return;
    this.fallTriggered = true;
    this.delayTimer = delay;
  }

  update(dt, player) {
    if (this.fallTriggered && !this.isFalling) {
      this.delayTimer -= dt;
      if (this.delayTimer <= 0) {
        this.isFalling = true;
        // Velocity-sensitive lead: if player is sprinting, lead downward trajectory
        if (this.type === 'falling_weight' && player) {
          this.vy = 520;
          if (Math.abs(player.vx) > 100) {
            // Speed up fall if player is rushing
            this.vy = 750;
          }
        } else {
          this.vy = 500;
        }
      }
    }

    if (this.isFalling) {
      this.y += this.vy * dt;
      this.box.y = this.y;
    }
  }
}
