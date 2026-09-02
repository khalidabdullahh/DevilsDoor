/**
 * ShadowNinjaEnemy — Black Silhouette Guard with Health Display, AI & Trap Vulnerability.
 * Types:
 * - 'scout': Agile swordsman with dual blades.
 * - 'spear': Armored guard with long-reach naginata spear.
 */
export class ShadowNinjaEnemy {
  constructor(x = 720, y = 506, patrolMin = 620, patrolMax = 840, type = 'scout') {
    this.x = x;
    this.y = y;
    this.patrolMin = patrolMin;
    this.patrolMax = patrolMax;
    this.type = type;

    this.width = 32;
    this.height = 54;
    this.facing = -1; // Face left towards approaching player
    this.speed = type === 'scout' ? 110 : 80;

    this.maxHealth = type === 'scout' ? 2 : 2;
    this.health = this.maxHealth;
    this.isDead = false;

    // AI States: 'patrol', 'alert', 'attack', 'cooldown', 'hurt'
    this.state = 'patrol';
    this.stateTimer = 0;
    this.attackRange = type === 'scout' ? 70 : 120;
    this.detectRange = 320;

    this.animTime = 0;
    this.deathParticles = [];
  }

  takeDamage(amount = 1, hitFacing = 1, audio = null) {
    if (this.isDead) return;
    this.health -= amount;
    this.state = 'hurt';
    this.stateTimer = 0.22;
    this.x += hitFacing * 45; // Heavy knockback

    if (audio) audio.playBladeHit();

    if (this.health <= 0) {
      this.kill(audio);
    }
  }

  kill(audio = null) {
    if (this.isDead) return;
    this.isDead = true;
    this.health = 0;

    // Spawn silhouette slice particles
    for (let i = 0; i < 18; i++) {
      this.deathParticles.push({
        x: this.x,
        y: this.y + 20,
        vx: (Math.random() - 0.5) * 320,
        vy: -Math.random() * 280,
        size: Math.random() * 6 + 3,
        rot: Math.random() * Math.PI,
        life: 0.8,
        alpha: 1.0
      });
    }
  }

  update(dt, player, audio, camera, level) {
    if (this.isDead) {
      for (let i = this.deathParticles.length - 1; i >= 0; i--) {
        const p = this.deathParticles[i];
        p.life -= dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 650 * dt;
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

    // 1. Check if knocked into a spike hazard (Instant Tactical Trap Kill!)
    if (level) {
      const hitHazard = level.checkHazardCollision(this.x, this.y, this.width, this.height);
      if (hitHazard) {
        this.kill(audio);
        if (camera) camera.addShake(0.4);
        return;
      }
    }

    // 2. State Machine
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
            this.stateTimer = 0.3;
            if (audio) audio.playEnemyAlert();
          }
        }
        break;

      case 'alert':
        this.stateTimer -= dt;
        this.facing = px > this.x ? 1 : -1;
        if (this.stateTimer <= 0) {
          if (xDist <= this.attackRange) {
            this.state = 'attack';
            this.stateTimer = 0.35;
          } else {
            // Rush towards player
            this.x += this.facing * (this.speed * 1.7) * dt;
            if (xDist <= this.attackRange) {
              this.state = 'attack';
              this.stateTimer = 0.35;
            }
          }
        }
        break;

      case 'attack':
        this.stateTimer -= dt;
        const progress = 1.0 - (this.stateTimer / 0.35);

        // Strike frame
        if (progress > 0.4 && progress < 0.7) {
          if (distToPlayer < (this.type === 'spear' ? 85 : 55) && yDist < 45 && player && !player.isDead) {
            player.takeDamage(1, this.facing, audio);
            if (camera) camera.addShake(0.4);
          }
        }

        if (this.stateTimer <= 0) {
          this.state = 'cooldown';
          this.stateTimer = 0.65;
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

    // 1. Draw Above-Head Health Hearts
    if (this.health < this.maxHealth || this.state === 'alert' || this.state === 'attack') {
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      let hearts = '';
      for (let i = 0; i < this.maxHealth; i++) {
        hearts += i < this.health ? '❤️' : '🖤';
      }
      ctx.fillText(hearts, 0, -14);
    }

    ctx.scale(this.facing, 1);

    // Pitch Black Silhouette
    ctx.fillStyle = '#05080f';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
    ctx.shadowBlur = 8;

    // Legs
    const legCycle = Math.sin(this.animTime * 9) * 6;
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

    // Glowing Crimson Eye
    ctx.fillStyle = '#ef4444';
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = this.state === 'alert' || this.state === 'attack' ? 20 : 10;
    ctx.beginPath();
    ctx.ellipse(5, 11, 4, 1.8, 0.1, 0, Math.PI * 2);
    ctx.fill();

    // Weapon
    ctx.fillStyle = '#05080f';
    ctx.strokeStyle = '#05080f';
    ctx.lineWidth = 3;

    const attackOffset = this.state === 'attack' ? 24 : 0;

    if (this.type === 'spear') {
      // Long Naginata Spear
      ctx.beginPath();
      ctx.moveTo(-10, 36);
      ctx.lineTo(36 + attackOffset, 18);
      ctx.stroke();

      ctx.lineWidth = 4;
      ctx.strokeStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.moveTo(36 + attackOffset, 18);
      ctx.quadraticCurveTo(50 + attackOffset, 14, 56 + attackOffset, 8);
      ctx.stroke();

      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(36 + attackOffset, 18, 3.5, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Dual Katana Blade
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.moveTo(4, 28);
      ctx.lineTo(26 + attackOffset, 12);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(-4, 32);
      ctx.lineTo(18 + attackOffset, 24);
      ctx.stroke();
    }

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
