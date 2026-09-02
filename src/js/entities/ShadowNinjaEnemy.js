/**
 * ShadowNinjaEnemy — Black Silhouette Guard with Crimson Eyes, Naginata Spear & AI.
 * True Ninja Arashi 2 enemy benchmark.
 */
export class ShadowNinjaEnemy {
  constructor(x = 600, y = 300, patrolMin = 500, patrolMax = 750, type = 'spear') {
    this.x = x;
    this.y = y;
    this.patrolMin = patrolMin;
    this.patrolMax = patrolMax;
    this.type = type; // 'spear' or 'sword'

    this.width = 34;
    this.height = 54;
    this.facing = 1;
    this.speed = 90;

    this.health = 2;
    this.maxHealth = 2;
    this.isDead = false;

    // AI States: 'patrol', 'alert', 'thrust', 'cooldown', 'hurt'
    this.state = 'patrol';
    this.stateTimer = 0;
    this.attackRange = 110;
    this.detectRange = 280;

    this.animTime = 0;
    this.deathParticles = [];
  }

  takeDamage(amount = 1, hitFacing = 1, audio = null) {
    if (this.isDead) return;
    this.health -= amount;
    this.state = 'hurt';
    this.stateTimer = 0.25;
    this.x += hitFacing * 30; // Knockback

    if (audio) audio.playBladeHit();

    if (this.health <= 0) {
      this.isDead = true;
      // Spawn silhouette slice particles
      for (let i = 0; i < 16; i++) {
        this.deathParticles.push({
          x: this.x,
          y: this.y + 20,
          vx: (Math.random() - 0.5) * 280,
          vy: -Math.random() * 260,
          size: Math.random() * 6 + 3,
          rot: Math.random() * Math.PI,
          life: 0.8,
          alpha: 1.0
        });
      }
    }
  }

  update(dt, player, audio, camera) {
    if (this.isDead) {
      for (let i = this.deathParticles.length - 1; i >= 0; i--) {
        const p = this.deathParticles[i];
        p.life -= dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 600 * dt; // Gravity
        p.alpha = p.life / 0.8;
        if (p.life <= 0) this.deathParticles.splice(i, 1);
      }
      return;
    }

    this.animTime += dt;
    const px = player ? player.x : 0;
    const py = player ? player.y : 0;
    const distToPlayer = Math.hypot(this.x - px, this.y - py);
    const xDist = Math.abs(this.x - px);
    const yDist = Math.abs(this.y - py);

    switch (this.state) {
      case 'patrol':
        this.x += this.facing * this.speed * dt;
        if (this.x > this.patrolMax) {
          this.x = this.patrolMax;
          this.facing = -1;
        } else if (this.x < this.patrolMin) {
          this.x = this.patrolMin;
          this.facing = 1;
        }

        // Check vision cone
        if (distToPlayer < this.detectRange && yDist < 60) {
          const dirToPlayer = px > this.x ? 1 : -1;
          if (dirToPlayer === this.facing) {
            this.state = 'alert';
            this.stateTimer = 0.35;
            if (audio) audio.playEnemyAlert();
          }
        }
        break;

      case 'alert':
        this.stateTimer -= dt;
        this.facing = px > this.x ? 1 : -1;
        if (this.stateTimer <= 0) {
          if (xDist <= this.attackRange) {
            this.state = 'thrust';
            this.stateTimer = 0.38;
          } else {
            // Rush towards player
            this.x += this.facing * (this.speed * 1.6) * dt;
            if (xDist <= this.attackRange) {
              this.state = 'thrust';
              this.stateTimer = 0.38;
            }
          }
        }
        break;

      case 'thrust':
        this.stateTimer -= dt;
        const progress = 1.0 - (this.stateTimer / 0.38);

        // Strike impact frame
        if (progress > 0.4 && progress < 0.7) {
          if (distToPlayer < 75 && yDist < 50 && player && !player.isDead) {
            player.takeDamage(1, this.facing, audio);
            if (camera) camera.addShake(0.4);
          }
        }

        if (this.stateTimer <= 0) {
          this.state = 'cooldown';
          this.stateTimer = 0.7;
        }
        break;

      case 'cooldown':
        this.stateTimer -= dt;
        if (this.stateTimer <= 0) {
          this.state = 'patrol';
        }
        break;

      case 'hurt':
        this.stateTimer -= dt;
        if (this.stateTimer <= 0) {
          this.state = 'alert';
          this.stateTimer = 0.2;
        }
        break;
    }
  }

  draw(ctx, camX, camY) {
    if (this.isDead) {
      // Draw death explosion fragments
      ctx.save();
      for (const p of this.deathParticles) {
        ctx.fillStyle = '#05080f';
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 8;
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x - camX, p.y - camY, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      return;
    }

    const drawX = this.x - camX;
    const drawY = this.y - camY;

    ctx.save();
    ctx.translate(drawX, drawY);
    ctx.scale(this.facing, 1);

    // High-contrast pitch black silhouette
    ctx.fillStyle = '#05080f';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
    ctx.shadowBlur = 8;

    // Legs
    const legCycle = Math.sin(this.animTime * 8) * 6;
    ctx.beginPath();
    ctx.ellipse(-5 - legCycle, 46, 5, 9, 0.2, 0, Math.PI * 2);
    ctx.ellipse(5 + legCycle, 46, 5, 9, -0.2, 0, Math.PI * 2);
    ctx.fill();

    // Armored Torso
    ctx.beginPath();
    ctx.roundRect(-10, 18, 20, 26, 3);
    ctx.fill();

    // Shoulder Armor Plates
    ctx.beginPath();
    ctx.moveTo(-14, 20);
    ctx.lineTo(-4, 16);
    ctx.lineTo(-4, 28);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(14, 20);
    ctx.lineTo(4, 16);
    ctx.lineTo(4, 28);
    ctx.closePath();
    ctx.fill();

    // Head
    ctx.beginPath();
    ctx.arc(0, 12, 10, 0, Math.PI * 2);
    ctx.fill();

    // Conical Straw Hat
    ctx.beginPath();
    ctx.moveTo(-20, 8);
    ctx.lineTo(0, -3);
    ctx.lineTo(20, 8);
    ctx.closePath();
    ctx.fill();

    // Piercing Glowing Crimson Eye
    ctx.fillStyle = '#ef4444';
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = this.state === 'alert' || this.state === 'thrust' ? 20 : 10;
    ctx.beginPath();
    ctx.ellipse(5, 11, 4, 1.8, 0.1, 0, Math.PI * 2);
    ctx.fill();

    // Naginata Spear / Blade
    ctx.fillStyle = '#05080f';
    ctx.strokeStyle = '#05080f';
    ctx.lineWidth = 3;

    const thrustOffset = this.state === 'thrust' ? 24 : 0;

    // Spear Shaft
    ctx.beginPath();
    ctx.moveTo(-10, 36);
    ctx.lineTo(32 + thrustOffset, 18);
    ctx.stroke();

    // Curved Naginata Blade
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.moveTo(32 + thrustOffset, 18);
    ctx.quadraticCurveTo(46 + thrustOffset, 14, 52 + thrustOffset, 8);
    ctx.stroke();

    // Red Spear Tassel
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(32 + thrustOffset, 18, 3.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  getBounds() {
    return {
      x: this.x - this.width / 2,
      y: this.y,
      width: this.width,
      height: this.height
    };
  }
}
