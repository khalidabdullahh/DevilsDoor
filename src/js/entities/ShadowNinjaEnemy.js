/**
 * ShadowNinjaEnemy — High-Aggression Ninja Arashi Combat Enemy AI.
 * Types:
 * - 'scout': Fast dual-blade ninja that sprints and slashes.
 * - 'spear': Armored naginata guard with long-range lunging thrusts.
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

    this.patrolSpeed = type === 'scout' ? 90 : 70;
    this.chaseSpeed = type === 'scout' ? 220 : 160;
    this.attackRange = type === 'scout' ? 65 : 105;
    this.detectRange = 460;
    this.hearingRange = 280;

    this.maxHealth = 2;
    this.health = this.maxHealth;
    this.isDead = false;

    // AI States: 'patrol', 'chase', 'windup', 'attack', 'cooldown', 'hurt'
    this.state = 'patrol';
    this.stateTimer = 0;
    this.hasHitPlayerThisAttack = false;

    this.animTime = 0;
    this.deathParticles = [];
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

    this.animTime += dt;
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

    // 2. Continuous Proximity & Vision Awareness
    const playerInSight = (dirToPlayer === this.facing && distToPlayer < this.detectRange && yDist < 120);
    const playerHeard = (distToPlayer < this.hearingRange && yDist < 120);

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
        if (xDist <= this.attackRange) {
          // Within striking distance -> Start Attack Windup!
          this.state = 'windup';
          this.stateTimer = 0.22;
        } else if (distToPlayer < this.detectRange + 150 && yDist < 140) {
          // Sprint aggressively towards player
          this.x += this.facing * this.chaseSpeed * dt;
        } else {
          // Lost player -> Resume patrol
          this.state = 'patrol';
        }
        break;

      case 'windup':
        this.facing = dirToPlayer;
        this.stateTimer -= dt;
        if (this.stateTimer <= 0) {
          // Execute Lunge Attack!
          this.state = 'attack';
          this.stateTimer = 0.28;
          this.hasHitPlayerThisAttack = false;
          if (audio) audio.playKatanaSlash();
        }
        break;

      case 'attack':
        this.stateTimer -= dt;
        // Forward lunging impulse
        this.x += this.facing * (this.chaseSpeed * 0.9) * dt;

        // Damage Player during active swing
        if (!this.hasHitPlayerThisAttack && xDist < (this.type === 'spear' ? 95 : 65) && yDist < 50) {
          if (player && !player.isDead) {
            player.takeDamage(1, this.facing, audio);
            this.hasHitPlayerThisAttack = true;
            if (camera) camera.addShake(0.45);
          }
        }

        if (this.stateTimer <= 0) {
          this.state = 'cooldown';
          this.stateTimer = 0.45;
        }
        break;

      case 'cooldown':
        this.stateTimer -= dt;
        this.facing = dirToPlayer;
        if (this.stateTimer <= 0) {
          if (xDist <= this.attackRange + 40) {
            this.state = 'windup';
            this.stateTimer = 0.2;
          } else {
            this.state = 'chase';
          }
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

    // 1. Health Hearts Display above Head
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    let hearts = '';
    for (let i = 0; i < this.maxHealth; i++) {
      hearts += i < this.health ? '❤️' : '🖤';
    }
    ctx.fillText(hearts, 0, -14);

    ctx.scale(this.facing, 1);

    // Pitch Black Silhouette
    ctx.fillStyle = '#05080f';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
    ctx.shadowBlur = 8;

    // Legs
    const isMoving = this.state === 'patrol' || this.state === 'chase';
    const legCycle = Math.sin(this.animTime * (this.state === 'chase' ? 16 : 9)) * 7;
    ctx.beginPath();
    ctx.ellipse(isMoving ? -5 - legCycle : -5, 46, 5, 9, 0.2, 0, Math.PI * 2);
    ctx.ellipse(isMoving ? 5 + legCycle : 5, 46, 5, 9, -0.2, 0, Math.PI * 2);
    ctx.fill();

    // Torso
    ctx.beginPath();
    ctx.roundRect(-10, 18, 20, 26, 3);
    ctx.fill();

    // Shoulder Plates
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

    // Glowing Crimson Eye (Flares intensely in chase/windup/attack)
    const isAlert = this.state === 'chase' || this.state === 'windup' || this.state === 'attack';
    ctx.fillStyle = '#ef4444';
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = isAlert ? 22 : 8;
    ctx.beginPath();
    ctx.ellipse(5, 11, isAlert ? 5 : 3.5, 1.8, 0.1, 0, Math.PI * 2);
    ctx.fill();

    // Weapon Presentation
    ctx.fillStyle = '#05080f';
    ctx.strokeStyle = '#05080f';
    ctx.lineWidth = 3;

    const isWindup = this.state === 'windup';
    const isAttacking = this.state === 'attack';

    if (this.type === 'spear') {
      // Naginata Spear
      const spearAngle = isWindup ? -0.4 : (isAttacking ? 0.2 : 0);
      const thrustOffset = isAttacking ? 34 : (isWindup ? -12 : 0);

      ctx.save();
      ctx.rotate(spearAngle);

      // Shaft
      ctx.beginPath();
      ctx.moveTo(-12, 34);
      ctx.lineTo(38 + thrustOffset, 16);
      ctx.stroke();

      // Blade
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.moveTo(38 + thrustOffset, 16);
      ctx.quadraticCurveTo(52 + thrustOffset, 12, 58 + thrustOffset, 6);
      ctx.stroke();

      // Tassel
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(38 + thrustOffset, 16, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Red Slash Arc on Attack
      if (isAttacking) {
        ctx.strokeStyle = '#ef4444';
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 16;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(32 + thrustOffset, 14, 28, -0.6, 0.6);
        ctx.stroke();
      }

      ctx.restore();
    } else {
      // Dual Katana Blade
      const slashAngle = isWindup ? -0.6 : (isAttacking ? 0.5 : 0);
      const slashX = isAttacking ? 22 : (isWindup ? -8 : 0);

      ctx.save();
      ctx.rotate(slashAngle);

      ctx.lineWidth = 3.5;
      ctx.strokeStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.moveTo(4, 26);
      ctx.lineTo(28 + slashX, 10);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(-4, 30);
      ctx.lineTo(18 + slashX, 22);
      ctx.stroke();

      // Crimson Slash Ribbon on Attack
      if (isAttacking) {
        ctx.strokeStyle = '#ef4444';
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 16;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(14 + slashX, 18, 30, -Math.PI / 3, Math.PI / 3);
        ctx.stroke();
      }

      ctx.restore();
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
