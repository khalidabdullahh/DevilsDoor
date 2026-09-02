/**
 * OniBossEnemy — Demonic Giant Samurai Boss (Level 10 Master Encounter).
 * Features:
 * - 3x scale demonic armored warrior with glowing blue armor, dual giant katanas & glowing cyan visor.
 * - Attack Phases: Ground Katana Shockwave Smash, Summoned Demonic Lightning Strikes, and Phantom Dash.
 */
export class OniBossEnemy {
  constructor(x = 1200, y = 430) {
    this.x = x;
    this.y = y;
    this.width = 68;
    this.height = 110;
    this.facing = -1;

    this.maxHealth = 12;
    this.health = this.maxHealth;
    this.isDead = false;

    this.state = 'idle'; // 'idle', 'chase', 'shockwave_windup', 'shockwave_smash', 'lightning_summon', 'phantom_dash', 'hurt'
    this.stateTimer = 1.0;
    this.animTime = 0;

    this.shockwaves = [];
    this.lightningStrikes = [];
    this.deathParticles = [];
  }

  takeDamage(amount = 1, hitFacing = 1, audio = null) {
    if (this.isDead) return;
    this.health -= amount;
    this.x += hitFacing * 18; // Heavy boss stagger

    if (audio) audio.playBladeHit();

    if (this.health <= 0) {
      this.kill(audio);
    }
  }

  kill(audio = null) {
    if (this.isDead) return;
    this.isDead = true;
    this.health = 0;

    for (let i = 0; i < 45; i++) {
      this.deathParticles.push({
        x: this.x + (Math.random() - 0.5) * 60,
        y: this.y + Math.random() * 80,
        vx: (Math.random() - 0.5) * 450,
        vy: -Math.random() * 380,
        size: Math.random() * 8 + 4,
        rot: Math.random() * Math.PI,
        color: Math.random() > 0.4 ? '#38bdf8' : '#0284c7',
        life: 1.4,
        alpha: 1.0
      });
    }
  }

  update(dt, player, audio, camera, level) {
    this.animTime += dt;

    // 1. Update Death VFX
    if (this.isDead) {
      for (let i = this.deathParticles.length - 1; i >= 0; i--) {
        const p = this.deathParticles[i];
        p.life -= dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 500 * dt;
        p.alpha = p.life / 1.4;
        if (p.life <= 0) this.deathParticles.splice(i, 1);
      }
      return;
    }

    // 2. Update Active Shockwave Projectiles
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const sw = this.shockwaves[i];
      sw.x += sw.vx * dt;
      sw.life -= dt;
      if (player && !player.isDead) {
        if (Math.abs(sw.x - player.x) < 32 && Math.abs(sw.y - player.y) < 40) {
          player.takeDamage(1, sw.vx > 0 ? 1 : -1, audio);
          if (camera) camera.addShake(0.5);
          this.shockwaves.splice(i, 1);
          continue;
        }
      }
      if (sw.life <= 0) this.shockwaves.splice(i, 1);
    }

    // 3. Update Lightning Strikes
    for (let i = this.lightningStrikes.length - 1; i >= 0; i--) {
      const ls = this.lightningStrikes[i];
      ls.delay -= dt;
      if (ls.delay <= 0 && !ls.struck) {
        ls.struck = true;
        if (audio) audio.playStoneCollapse();
        if (camera) camera.addShake(0.6);
        if (player && !player.isDead && Math.abs(ls.x - player.x) < 45) {
          player.takeDamage(1, 0, audio);
        }
      }
      if (ls.delay < -0.3) this.lightningStrikes.splice(i, 1);
    }

    const px = player ? player.x : 0;
    const py = player ? player.y : 0;
    const dist = Math.hypot(this.x - px, this.y - py);
    const dirToPlayer = px > this.x ? 1 : -1;

    // 4. Boss AI State Machine
    this.stateTimer -= dt;
    switch (this.state) {
      case 'idle':
        this.facing = dirToPlayer;
        if (this.stateTimer <= 0) {
          const rand = Math.random();
          if (rand < 0.45) {
            // Initiate Ground Shockwave Smash
            this.state = 'shockwave_windup';
            this.stateTimer = 0.6;
          } else if (rand < 0.8) {
            // Summon Demonic Lightning
            this.state = 'lightning_summon';
            this.stateTimer = 0.8;
            this._spawnLightning(px);
          } else {
            // Phantom Dash
            this.state = 'phantom_dash';
            this.stateTimer = 0.4;
          }
        }
        break;

      case 'shockwave_windup':
        this.facing = dirToPlayer;
        if (this.stateTimer <= 0) {
          this.state = 'shockwave_smash';
          this.stateTimer = 0.4;
          if (audio) audio.playKatanaSlash();
          if (camera) camera.addShake(0.7);

          // Spawn ground shockwave
          this.shockwaves.push({
            x: this.x + this.facing * 35,
            y: this.y + 70,
            vx: this.facing * 380,
            life: 1.8
          });
        }
        break;

      case 'shockwave_smash':
        if (this.stateTimer <= 0) {
          this.state = 'idle';
          this.stateTimer = 0.9;
        }
        break;

      case 'lightning_summon':
        if (this.stateTimer <= 0) {
          this.state = 'idle';
          this.stateTimer = 1.0;
        }
        break;

      case 'phantom_dash':
        this.x += this.facing * 420 * dt;
        if (dist < 65 && player && !player.isDead) {
          player.takeDamage(1, this.facing, audio);
          if (camera) camera.addShake(0.5);
        }
        if (this.stateTimer <= 0) {
          this.state = 'idle';
          this.stateTimer = 0.8;
        }
        break;
    }
  }

  _spawnLightning(targetX) {
    this.lightningStrikes.push({ x: targetX, delay: 0.6, struck: false });
    this.lightningStrikes.push({ x: targetX - 90, delay: 0.75, struck: false });
    this.lightningStrikes.push({ x: targetX + 90, delay: 0.75, struck: false });
  }

  draw(ctx, camX, camY) {
    // 1. Draw Lightning Indicators & Strikes
    for (const ls of this.lightningStrikes) {
      const lx = ls.x - camX;
      if (!ls.struck) {
        // Warning Ground Rune
        ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.beginPath();
        ctx.ellipse(lx, 550 - camY, 30, 8, 0, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Piercing Vertical Lightning Bolt
        ctx.strokeStyle = '#e0f2fe';
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 24;
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(lx, 0);
        ctx.lineTo(lx - 12, 280 - camY);
        ctx.lineTo(lx + 10, 420 - camY);
        ctx.lineTo(lx, 555 - camY);
        ctx.stroke();
      }
    }

    // 2. Draw Ground Shockwaves
    for (const sw of this.shockwaves) {
      const sx = sw.x - camX;
      const sy = sw.y - camY;
      ctx.fillStyle = '#38bdf8';
      ctx.shadowColor = '#0284c7';
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.arc(sx, sy, 22, 0, Math.PI * 2);
      ctx.fill();
    }

    // 3. Draw Death Particles
    if (this.isDead) {
      ctx.save();
      for (const p of this.deathParticles) {
        ctx.fillStyle = p.color;
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 12;
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

    // 4. Boss Health Bar (Above Boss)
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fillRect(-60, -32, 120, 10);
    const hpRatio = Math.max(0, this.health / this.maxHealth);
    ctx.fillStyle = '#38bdf8';
    ctx.shadowColor = '#0284c7';
    ctx.shadowBlur = 10;
    ctx.fillRect(-58, -30, 116 * hpRatio, 6);
    ctx.shadowBlur = 0;

    ctx.scale(this.facing, 1);

    // Pitch-Black Silhouette with Glowing Cyan Armor Highlights
    ctx.fillStyle = '#05080f';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.95)';
    ctx.shadowBlur = 14;

    // Giant Torso & Heavy Pauldron Shoulders
    ctx.fillRect(-24, 25, 48, 55);

    // Shoulder Armor Plates (Glowing Blue Rune Trim)
    ctx.beginPath();
    ctx.moveTo(-36, 25);
    ctx.lineTo(-12, 15);
    ctx.lineTo(-12, 45);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(36, 25);
    ctx.lineTo(12, 15);
    ctx.lineTo(12, 45);
    ctx.closePath();
    ctx.fill();

    // Glowing Blue Shoulder Crests
    ctx.fillStyle = '#38bdf8';
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 14;
    ctx.fillRect(-32, 28, 6, 12);
    ctx.fillRect(26, 28, 6, 12);

    // Head & Demonic Horns
    ctx.fillStyle = '#05080f';
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.arc(0, 12, 18, 0, Math.PI * 2);
    ctx.fill();

    // Long Flowing Mane Hair
    ctx.beginPath();
    ctx.moveTo(-16, 12);
    ctx.quadraticCurveTo(-38, 35, -45, 65);
    ctx.quadraticCurveTo(-25, 45, -12, 26);
    ctx.closePath();
    ctx.fill();

    // Curved Demonic Horns
    ctx.beginPath();
    ctx.moveTo(-10, 2);
    ctx.quadraticCurveTo(-22, -22, -14, -30);
    ctx.quadraticCurveTo(-6, -16, -4, 2);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(10, 2);
    ctx.quadraticCurveTo(22, -22, 14, -30);
    ctx.quadraticCurveTo(6, -16, 4, 2);
    ctx.closePath();
    ctx.fill();

    // Glowing Cyan Visor Eyes
    ctx.fillStyle = '#38bdf8';
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 20;
    ctx.fillRect(4, 10, 10, 4);

    // Dual Giant Katanas
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 6;
    const isSmashing = this.state === 'shockwave_smash';
    const swordRot = isSmashing ? 1.1 : (this.state === 'shockwave_windup' ? -0.8 : 0.2);

    ctx.save();
    ctx.rotate(swordRot);
    ctx.beginPath();
    ctx.moveTo(8, 40);
    ctx.lineTo(65, isSmashing ? 75 : 15);
    ctx.stroke();

    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 18;
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.restore();

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
