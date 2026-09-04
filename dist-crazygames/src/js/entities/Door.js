import { CollisionBox } from '../physics/CollisionBox.js';

/**
 * Door — Modular Door entity supporting original deceptive behaviors.
 */
export class Door {
  constructor(x, y, width = 36, height = 54, type = 'standard', id = 'main_door') {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.type = type; // 'standard', 'decoy', 'phase', 'reverse'
    this.id = id;

    this.box = new CollisionBox(x, y, width, height, 'door', id);
    this.state = 'active'; // 'active', 'locked', 'dissolving', 'dissolved'
    this.dissolveProgress = 0; // 0 to 1

    // Particle swirl
    this.vortexAngle = 0;
    this.particles = [];
  }

  dissolve() {
    if (this.state === 'dissolving' || this.state === 'dissolved') return;
    this.state = 'dissolving';
  }

  update(dt) {
    if (this.state === 'dissolved') {
      this.box.active = false;
      return;
    }

    this.vortexAngle += dt * 3.5;

    if (this.state === 'dissolving') {
      this.dissolveProgress += dt * 2.0;
      if (this.dissolveProgress >= 1.0) {
        this.dissolveProgress = 1.0;
        this.state = 'dissolved';
        this.box.active = false;
      }
    }

    // Emit subtle vortex particles
    if (this.state === 'active' && Math.random() < 0.3) {
      this.particles.push({
        offsetX: (Math.random() - 0.5) * 20,
        offsetY: 10 + Math.random() * 20,
        vy: -20 - Math.random() * 30,
        alpha: 0.8,
        size: 2 + Math.random() * 2,
        color: this.type === 'decoy' ? '#a855f7' : '#38bdf8'
      });
    }

    for (const p of this.particles) {
      p.offsetY += p.vy * dt;
      p.alpha -= dt * 1.5;
    }
    this.particles = this.particles.filter(p => p.alpha > 0);
  }

  checkPlayerEntered(playerBox) {
    if (this.state !== 'active') return false;
    return this.box.overlaps(playerBox);
  }
}
