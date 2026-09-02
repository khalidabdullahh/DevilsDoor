/**
 * Shuriken — High-velocity spinning projectile for Ninja Arashi combat.
 */
export class Shuriken {
  constructor(x, y, vx, vy) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.radius = 8;
    this.rotation = 0;
    this.rotSpeed = 28.0;
    this.life = 1.4; // Seconds
    this.active = true;
    this.damage = 1;
  }

  update(dt, physicsWorld) {
    if (!this.active) return;
    this.life -= dt;
    if (this.life <= 0) {
      this.active = false;
      return;
    }

    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.rotation += this.rotSpeed * dt;

    // Check terrain collision
    if (physicsWorld) {
      for (const solid of physicsWorld.solids) {
        if (!solid.active) continue;
        const sLeft = solid.x - solid.width / 2;
        const sRight = solid.x + solid.width / 2;
        const sTop = solid.y;
        const sBottom = solid.y + solid.height;

        if (this.x > sLeft && this.x < sRight && this.y > sTop && this.y < sBottom) {
          this.active = false;
          break;
        }
      }
    }
  }

  draw(ctx, camX, camY) {
    if (!this.active) return;
    const sx = this.x - camX;
    const sy = this.y - camY;

    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(this.rotation);

    // Glowing cyan/silver shuriken silhouette
    ctx.fillStyle = '#f8fafc';
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 10;

    // 4-point ninja star
    ctx.beginPath();
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2;
      const armX = Math.cos(angle) * 9;
      const armY = Math.sin(angle) * 9;
      const inAngle = angle + Math.PI / 4;
      const inX = Math.cos(inAngle) * 3;
      const inY = Math.sin(inAngle) * 3;

      if (i === 0) ctx.moveTo(armX, armY);
      else ctx.lineTo(armX, armY);
      ctx.lineTo(inX, inY);
    }
    ctx.closePath();
    ctx.fill();

    // Center hole
    ctx.fillStyle = '#05080f';
    ctx.beginPath();
    ctx.arc(0, 0, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}
