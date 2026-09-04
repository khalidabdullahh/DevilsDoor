/**
 * Shuriken — High-velocity spinning ninja star projectile for Devil's Door.
 */
export class Shuriken {
  constructor(x, y, vx = 1100, vy = 0) {
    this.x = x;
    this.y = y;
    // If vx is passed as -1 or 1 direction, scale to full projectile velocity
    this.vx = Math.abs(vx) <= 1 ? vx * 1100 : vx;
    this.vy = vy || 0;
    this.radius = 12;
    this.rotation = 0;
    this.rotSpeed = 36.0;
    this.life = 2.0; // Seconds
    this.active = true;
    this.damage = 2;
    this.trail = [];
  }

  update(dt, physicsWorld, audio = null, camera = null, player = null) {
    if (!this.active) return;
    this.life -= dt;
    if (this.life <= 0) {
      this.active = false;
      return;
    }

    this.trail.push({ x: this.x, y: this.y, alpha: 0.65 });
    if (this.trail.length > 5) this.trail.shift();
    for (const t of this.trail) {
      t.alpha -= dt * 2.5;
    }

    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.rotation += this.rotSpeed * dt;

    // 1. Check Terrain Solid Collision
    if (physicsWorld && physicsWorld.solids) {
      for (const solid of physicsWorld.solids) {
        if (!solid.active) continue;
        const sLeft = solid.x;
        const sRight = solid.x + (solid.width || 80);
        const sTop = solid.y;
        const sBottom = solid.y + (solid.height || 40);

        if (this.x >= sLeft && this.x <= sRight && this.y >= sTop && this.y <= sBottom) {
          this.active = false;
          if (audio) audio.playBladeHit();
          break;
        }
      }
    }

    if (!this.active) return;

    // 2. Check Enemy Hits (Robust AABB & Center-Radius Collision)
    if (physicsWorld && physicsWorld.enemies) {
      for (const enemy of physicsWorld.enemies) {
        if (enemy.isDead) continue;

        const ew = enemy.width || 36;
        const eh = enemy.height || 58;
        const ecx = enemy.x + ew / 2;
        const ecy = enemy.y + eh / 2;

        const dist = Math.hypot(this.x - ecx, this.y - ecy);
        const insideBox = (
          this.x >= enemy.x - 14 &&
          this.x <= enemy.x + ew + 14 &&
          this.y >= enemy.y - 14 &&
          this.y <= enemy.y + eh + 14
        );

        if (insideBox || dist < 45) {
          const hitDir = this.vx > 0 ? 1 : -1;
          enemy.takeDamage(this.damage, hitDir, audio);
          if (camera) camera.addShake(0.35);
          if (player) {
            player.score += 500;
          }
          this.active = false;
          break;
        }
      }
    }
  }

  get isDead() {
    return !this.active;
  }

  draw(ctx, camX, camY) {
    if (!this.active) return;
    const sx = this.x - camX;
    const sy = this.y - camY;

    // Draw glowing motion trail
    for (let i = 0; i < this.trail.length; i++) {
      const t = this.trail[i];
      if (t.alpha <= 0) continue;
      const tx = t.x - camX;
      const ty = t.y - camY;
      ctx.save();
      ctx.globalAlpha = t.alpha * 0.45;
      ctx.fillStyle = '#c084fc';
      ctx.beginPath();
      ctx.arc(tx, ty, 4 + i, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(this.rotation);

    // Glowing cyan/purple shuriken silhouette
    ctx.shadowColor = '#c084fc';
    ctx.shadowBlur = 12;

    // 4-point ninja star with metallic gradient
    const grad = ctx.createRadialGradient(0, 0, 1, 0, 0, 14);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.5, '#c084fc');
    grad.addColorStop(1, '#7e22ce');
    ctx.fillStyle = grad;

    ctx.beginPath();
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2;
      const armX = Math.cos(angle) * 13;
      const armY = Math.sin(angle) * 13;
      const inAngle = angle + Math.PI / 4;
      const inX = Math.cos(inAngle) * 4.5;
      const inY = Math.sin(inAngle) * 4.5;

      if (i === 0) ctx.moveTo(armX, armY);
      else ctx.lineTo(armX, armY);
      ctx.lineTo(inX, inY);
    }
    ctx.closePath();
    ctx.fill();

    // Center hole
    ctx.fillStyle = '#05080f';
    ctx.beginPath();
    ctx.arc(0, 0, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}
