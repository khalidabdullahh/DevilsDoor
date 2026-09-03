/**
 * ShadowNinjaEnemy — High-Aggression Ninja Arashi Combat Enemy AI.
 * Articulated Shadow Silhouettes:
 * - 'scout': Dual-blade sprinting shadow ninja with glowing red eyes.
 * - 'spear': Armored naginata spear guard with long-range thrusts.
 * - 'archer': Ranged sentry with crossbow firing poisoned bolts.
 */
export class ShadowNinjaEnemy {
  constructor(x = 720, y = 506, patrolMin = 600, patrolMax = 840, type = 'scout') {
    this.x = x;
    this.y = y;
    this.patrolMin = patrolMin;
    this.patrolMax = patrolMax;
    this.type = type;

    this.width = 34;
    this.height = 54;
    this.facing = -1; // Face left towards player's approach

    this.patrolSpeed = type === 'scout' ? 95 : (type === 'archer' ? 50 : 70);
    this.chaseSpeed = type === 'scout' ? 230 : (type === 'archer' ? 120 : 160);
    this.attackRange = type === 'scout' ? 65 : (type === 'archer' ? 340 : 105);
    this.detectRange = 480;
    this.hearingRange = 280;

    this.maxHealth = type === 'spear' ? 3 : 2;
    this.health = this.maxHealth;
    this.isDead = false;

    // AI States: 'patrol', 'chase', 'windup', 'attack', 'cooldown', 'hurt'
    this.state = 'patrol';
    this.stateTimer = 0;
    this.hasHitPlayerThisAttack = false;

    this.animTime = Math.random() * 10;
    this.deathParticles = [];
    this.arrows = [];
  }

  takeDamage(amount = 1, hitFacing = 1, audio = null) {
    if (this.isDead) return;
    this.health -= amount;
    this.state = 'hurt';
    this.stateTimer = 0.2;
    this.x += hitFacing * 50; // Heavy knockback
    this.facing = -hitFacing; // Turn to face attacker

    if (audio) audio.playBladeHit();

    if (this.health <= 0) {
      this.kill(audio);
    }
  }

  kill(audio = null) {
    if (this.isDead) return;
    this.isDead = true;
    this.health = 0;

    // Spawn slice particles
    for (let i = 0; i < 20; i++) {
      this.deathParticles.push({
        x: this.x,
        y: this.y + 20,
        vx: (Math.random() - 0.5) * 340,
        vy: -Math.random() * 300,
        size: Math.random() * 6 + 3,
        rot: Math.random() * Math.PI,
        life: 0.85,
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
        p.alpha = p.life / 0.85;
        if (p.life <= 0) this.deathParticles.splice(i, 1);
      }
      return;
    }

    this.animTime += dt * 10;

    // Update fired arrows
    for (let i = this.arrows.length - 1; i >= 0; i--) {
      const arr = this.arrows[i];
      arr.x += arr.vx * dt;
      arr.life -= dt;

      if (player && !player.isDead) {
        const d = Math.hypot(player.x - arr.x, (player.y + 20) - arr.y);
        if (d < 28) {
          player.takeDamage(1, audio, camera);
          this.arrows.splice(i, 1);
          continue;
        }
      }

      if (arr.life <= 0) this.arrows.splice(i, 1);
    }

    const px = player ? player.x : 0;
    const py = player ? player.y : 0;
    const distToPlayer = Math.hypot(this.x - px, this.y - py);
    const xDist = Math.abs(this.x - px);
    const yDist = Math.abs(this.y - py);
    const dirToPlayer = px > this.x ? 1 : -1;

    // 1. Check if knocked into a spike hazard (Instant Tactical Trap Kill)
    if (level) {
      const hitHazard = level.checkHazardCollision(this.x, this.y, this.width, this.height);
      if (hitHazard) {
        this.kill(audio);
        if (camera) camera.addShake(0.4);
        return;
      }
    }

    // 2. Proximity & Vision Awareness
    const playerInSight = (dirToPlayer === this.facing && distToPlayer < this.detectRange && yDist < 140);
    const playerHeard = (distToPlayer < this.hearingRange && yDist < 140);

    if (this.state === 'patrol' && (playerInSight || playerHeard)) {
      this.state = 'chase';
      this.facing = dirToPlayer;
      if (audio) audio.playEnemyAlert();
    }

    // 3. State Machine Execution
    switch (this.state) {
      case 'patrol':
        this.x += this.facing * this.patrolSpeed * dt;
        if (this.x > this.patrolMax) {
          this.x = this.patrolMax;
          this.facing = -1;
        } else if (this.x < this.patrolMin) {
          this.x = this.patrolMin;
          this.facing = 1;
        }
        break;

      case 'chase':
        this.facing = dirToPlayer;
        if (xDist <= this.attackRange && yDist < 100) {
          this.state = 'windup';
          this.stateTimer = this.type === 'scout' ? 0.22 : 0.35;
        } else if (distToPlayer < this.detectRange + 150 && yDist < 160) {
          this.x += this.facing * this.chaseSpeed * dt;
        } else {
          this.state = 'patrol';
        }
        break;

      case 'windup':
        this.facing = dirToPlayer;
        this.stateTimer -= dt;
        if (this.stateTimer <= 0) {
          this.state = 'attack';
          this.stateTimer = 0.28;
          this.hasHitPlayerThisAttack = false;

          if (this.type === 'archer') {
            this.arrows.push({
              x: this.x + this.facing * 18,
              y: this.y + 18,
              vx: this.facing * 520,
              life: 2.2
            });
            if (audio) audio.playShurikenThrow();
          } else {
            if (audio) audio.playKatanaSlash();
          }
        }
        break;

      case 'attack':
        this.stateTimer -= dt;
        if (this.type !== 'archer') {
          this.x += this.facing * (this.chaseSpeed * 0.9) * dt;
        }

        // Damage Player during active swing
        if (!this.hasHitPlayerThisAttack && player && !player.isDead && !player.isDashing) {
          const hitRange = this.type === 'spear' ? 85 : 55;
          const hit = (dirToPlayer === this.facing && xDist < hitRange && yDist < 50);
          if (hit) {
            this.hasHitPlayerThisAttack = true;
            player.takeDamage(1, audio, camera);
          }
        }

        if (this.stateTimer <= 0) {
          this.state = 'cooldown';
          this.stateTimer = this.type === 'scout' ? 0.45 : 0.75;
        }
        break;

      case 'cooldown':
        this.stateTimer -= dt;
        if (this.stateTimer <= 0) {
          this.state = 'chase';
        }
        break;

      case 'hurt':
        this.stateTimer -= dt;
        if (this.stateTimer <= 0) {
          this.state = 'chase';
        }
        break;
    }
  }

  draw(ctx, camX, camY) {
    if (this.isDead) {
      for (const p of this.deathParticles) {
        ctx.save();
        ctx.fillStyle = '#ef4444';
        ctx.globalAlpha = p.alpha;
        ctx.translate(p.x - camX, p.y - camY);
        ctx.rotate(p.rot);
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      }
      return;
    }

    const sx = this.x - camX;
    const sy = this.y - camY;

    // Draw Crossbow Arrows
    for (const arr of this.arrows) {
      ctx.save();
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(arr.x - camX, arr.y - camY);
      ctx.lineTo((arr.x - camX) - (arr.vx > 0 ? 18 : -18), arr.y - camY);
      ctx.stroke();
      ctx.restore();
    }

    ctx.save();
    ctx.translate(sx + this.width / 2, sy + this.height / 2);
    ctx.scale(this.facing, 1);

    const isMoving = this.state === 'patrol' || this.state === 'chase';
    const stride = isMoving ? Math.sin(this.animTime) : 0;

    ctx.fillStyle = '#080c14';

    // Back Leg
    ctx.beginPath();
    ctx.moveTo(-2, 10);
    ctx.lineTo(-2 - stride * 10, 20);
    ctx.lineTo(-2 - stride * 14, 27);
    ctx.lineTo(2 - stride * 14, 27);
    ctx.closePath();
    ctx.fill();

    // Shadow Samurai Torso & Armor
    ctx.beginPath();
    ctx.moveTo(-9, -10);
    ctx.lineTo(9, -10);
    ctx.lineTo(7, 14);
    ctx.lineTo(-7, 14);
    ctx.closePath();
    ctx.fill();

    // Red Armor Pauldrons / Sash
    ctx.fillStyle = '#991b1b';
    ctx.fillRect(-9, -8, 4, 10);
    ctx.fillRect(5, -8, 4, 10);

    // Front Leg
    ctx.fillStyle = '#080c14';
    ctx.beginPath();
    ctx.moveTo(4, 10);
    ctx.lineTo(4 + stride * 10, 20);
    ctx.lineTo(4 + stride * 14, 27);
    ctx.lineTo(8 + stride * 14, 27);
    ctx.closePath();
    ctx.fill();

    // Masked Head Silhouette
    ctx.beginPath();
    ctx.arc(2, -15, 7.5, 0, Math.PI * 2);
    ctx.fill();

    // Horned Demon Kabuto Helmet Crest
    ctx.beginPath();
    ctx.moveTo(-4, -22);
    ctx.lineTo(2, -28);
    ctx.lineTo(8, -22);
    ctx.closePath();
    ctx.fill();

    // Glowing Red Demonic Eyes
    ctx.fillStyle = '#ef4444';
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 12;
    ctx.fillRect(4, -16, 6, 2.5);
    ctx.shadowBlur = 0;

    // Weapon Rendering per Type (Archive images 3, 16)
    if (this.type === 'spear') {
      // Long Naginata Polearm
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(-10, 12);
      ctx.lineTo(38, -16);
      ctx.stroke();

      // Curved Crimson Spear Blade
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.moveTo(38, -16);
      ctx.lineTo(54, -22);
      ctx.lineTo(44, -10);
      ctx.closePath();
      ctx.fill();
    } else if (this.type === 'archer') {
      // Crossbow
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(16, -6, 14, -Math.PI * 0.45, Math.PI * 0.45, false);
      ctx.stroke();
    } else {
      // Dual Katana Reverse Blades (Archive image 3)
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2.8;
      ctx.beginPath();
      ctx.moveTo(-4, -2);
      ctx.lineTo(24, 6);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(-6, 4);
      ctx.lineTo(20, 14);
      ctx.stroke();
    }

    ctx.restore();
  }
}
