/**
 * OniBossEnemy — Official Boss: #06 Shadow Entity
 * Features from Devil's Door character roster:
 * - Floating fractured dark obsidian crystal shards forming a demonic humanoid phantom
 * - Glowing crimson void singularity core pulsing in the hollow chest
 * - Levitating crystal limb shards, ground tremors, and shadow pulse waves
 */
export class OniBossEnemy {
  constructor(x = 1000, y = 480) {
    this.x = x;
    this.y = y;
    this.width = 60;
    this.height = 90;
    this.facing = -1;

    this.maxHealth = 8;
    this.health = this.maxHealth;
    this.isDead = false;

    this.state = 'idle';
    this.stateTimer = 1.0;
    this.animTime = 0;

    this.shockwaves = [];
    this.shards = [];
    this._initShards();
  }

  _initShards() {
    this.shards = [];
    for (let i = 0; i < 14; i++) {
      this.shards.push({
        baseX: (Math.random() - 0.5) * 44,
        baseY: (Math.random() - 0.5) * 70,
        size: Math.random() * 8 + 6,
        phase: Math.random() * Math.PI * 2,
        rot: Math.random() * Math.PI
      });
    }
  }

  takeDamage(amount = 1, hitFacing = 1, audio = null) {
    if (this.isDead) return;
    this.health -= amount;
    this.x += hitFacing * 25;
    if (audio) audio.playBladeHit();

    if (this.health <= 0) {
      this.kill(audio);
    }
  }

  kill(audio = null) {
    if (this.isDead) return;
    this.isDead = true;
    this.health = 0;
    if (audio) audio.playPlayerDeath();
  }

  update(dt, player, audio, camera, level) {
    this.animTime += dt * 3;

    if (this.isDead) {
      this.y += 120 * dt;
      return;
    }

    const px = player ? player.x : 0;
    const py = player ? player.y : 0;
    const distToPlayer = Math.hypot(this.x - px, this.y - py);
    const dirToPlayer = px > this.x ? 1 : -1;
    this.facing = dirToPlayer;

    // Update Shockwaves
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const sw = this.shockwaves[i];
      sw.x += sw.vx * dt;
      sw.life -= dt;

      if (player && !player.isDead) {
        const d = Math.abs(player.x - sw.x);
        if (d < 35 && Math.abs(player.y - this.y) < 60) {
          player.takeDamage(1, audio, camera);
        }
      }

      if (sw.life <= 0) this.shockwaves.splice(i, 1);
    }

    // Boss Combat Loop
    this.stateTimer -= dt;
    if (this.stateTimer <= 0) {
      if (distToPlayer < 600) {
        // Fire Demonic Shockwave
        this.shockwaves.push({
          x: this.x + this.facing * 30,
          y: this.y + 35,
          vx: this.facing * 380,
          life: 2.5
        });
        if (audio) audio.playKatanaSlash();
        if (camera) camera.addShake(0.5);
      }
      this.stateTimer = 2.2;
    }
  }

  draw(ctx, camX, camY) {
    const sx = this.x - camX;
    const sy = this.y - camY;

    // Draw Shockwaves
    for (const sw of this.shockwaves) {
      ctx.save();
      const hx = sw.x - camX;
      const hy = sw.y - camY;
      ctx.fillStyle = '#ef4444';
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.arc(hx, hy, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.save();
    ctx.translate(sx + this.width / 2, sy + this.height / 2);
    ctx.scale(this.facing, 1);

    // 1. Glowing Hollow Crimson Void Singularity Core (Chest)
    const pulse = Math.sin(this.animTime * 3) * 4;
    const coreHalo = ctx.createRadialGradient(0, -6, 4, 0, -6, 32 + pulse);
    coreHalo.addColorStop(0, '#ef4444');
    coreHalo.addColorStop(0.5, '#7f1d1d');
    coreHalo.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = coreHalo;
    ctx.beginPath();
    ctx.arc(0, -6, 32 + pulse, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#000000'; // Hollow black void core
    ctx.beginPath();
    ctx.arc(0, -6, 12, 0, Math.PI * 2);
    ctx.fill();

    // 2. Floating Fractured Dark Obsidian Shards (#06 Shadow Entity)
    ctx.fillStyle = '#09090b';
    ctx.strokeStyle = '#27272a';
    ctx.lineWidth = 1.2;

    // Head Shard
    ctx.beginPath();
    ctx.moveTo(0, -42);
    ctx.lineTo(8, -30);
    ctx.lineTo(0, -22);
    ctx.lineTo(-8, -30);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Floating Body & Limb Shards
    for (const s of this.shards) {
      const fx = s.baseX + Math.sin(this.animTime + s.phase) * 6;
      const fy = s.baseY + Math.cos(this.animTime * 1.2 + s.phase) * 6;

      ctx.save();
      ctx.translate(fx, fy);
      ctx.rotate(s.rot + Math.sin(this.animTime) * 0.2);
      ctx.beginPath();
      ctx.moveTo(0, -s.size);
      ctx.lineTo(s.size * 0.6, 0);
      ctx.lineTo(0, s.size);
      ctx.lineTo(-s.size * 0.6, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();
  }
}
