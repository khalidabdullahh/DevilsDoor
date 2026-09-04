/**
 * ShadowNinjaEnemy — Official Devil's Door Enemy Combat Roster.
 * Renders the 4 official enemy archetypes directly from the character roster:
 * - #02 Shadow Ronin: Conical Kasa straw hat, long black samurai robe, dual Katanas.
 * - #03 Oni Guard: Horned demon mask, spiky plate armor, massive spiked Kanabo iron club.
 * - #04 Cursed Monk: Floating levitating necromancer, prayer beads, orbiting dark curse orbs.
 * - #05 Crimson Assassin: Split half-red half-black mask, red sash, dual curved Kama blades.
 */
export class ShadowNinjaEnemy {
  constructor(x = 720, y = 506, patrolMin = 600, patrolMax = 840, type = 'ronin') {
    this.x = x;
    this.y = y;
    this.patrolMin = patrolMin;
    this.patrolMax = patrolMax;
    this.type = type; // 'ronin', 'oni', 'monk', 'assassin'

    this.width = type === 'oni' ? 44 : 34;
    this.height = type === 'oni' ? 64 : 56;
    this.facing = -1;

    this.patrolSpeed = type === 'assassin' ? 110 : (type === 'oni' ? 50 : 75);
    this.chaseSpeed = type === 'assassin' ? 240 : (type === 'oni' ? 130 : 180);
    this.attackRange = type === 'monk' ? 340 : (type === 'oni' ? 85 : 65);
    this.detectRange = 480;
    this.hearingRange = 280;

    this.maxHealth = type === 'oni' ? 4 : (type === 'ronin' ? 3 : 2);
    this.health = this.maxHealth;
    this.isDead = false;

    // AI States: 'patrol', 'chase', 'windup', 'attack', 'cooldown', 'hurt'
    this.state = 'patrol';
    this.stateTimer = 0;
    this.hasHitPlayerThisAttack = false;

    this.animTime = Math.random() * 10;
    this.deathParticles = [];
    this.projectiles = []; // Monk curse orbs
  }

  takeDamage(amount = 1, hitFacing = 1, audio = null) {
    if (this.isDead) return;
    this.health -= amount;
    this.state = 'hurt';
    this.stateTimer = 0.2;
    this.x += hitFacing * 45;
    this.facing = -hitFacing;

    if (audio) audio.playBladeHit();

    if (this.health <= 0) {
      this.kill(audio);
    }
  }

  kill(audio = null) {
    if (this.isDead) return;
    this.isDead = true;
    this.health = 0;

    for (let i = 0; i < 22; i++) {
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

    // Update Cursed Monk Projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const orb = this.projectiles[i];
      orb.x += orb.vx * dt;
      orb.y += (orb.vy || 0) * dt;
      orb.life -= dt;

      if (player && !player.isDead) {
        const d = Math.hypot(player.x - orb.x, (player.y + 20) - orb.y);
        if (d < 30) {
          player.takeDamage(1, audio, camera);
          this.projectiles.splice(i, 1);
          continue;
        }
      }

      if (orb.life <= 0) this.projectiles.splice(i, 1);
    }

    const px = player ? player.x : 0;
    const py = player ? player.y : 0;
    const distToPlayer = Math.hypot(this.x - px, this.y - py);
    const xDist = Math.abs(this.x - px);
    const yDist = Math.abs(this.y - py);
    const dirToPlayer = px > this.x ? 1 : -1;

    // Trap Collision
    if (level) {
      const hitHazard = level.checkHazardCollision(this.x, this.y, this.width, this.height);
      if (hitHazard) {
        this.kill(audio);
        if (camera) camera.addShake(0.4);
        return;
      }
    }

    // Vision / Hearing
    const playerInSight = (dirToPlayer === this.facing && distToPlayer < this.detectRange && yDist < 140);
    const playerHeard = (distToPlayer < this.hearingRange && yDist < 140);

    if (this.state === 'patrol' && (playerInSight || playerHeard)) {
      this.state = 'chase';
      this.facing = dirToPlayer;
      if (audio) audio.playEnemyAlert();
    }

    // State Machine
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
        if (xDist <= this.attackRange && yDist < 110) {
          this.state = 'windup';
          this.stateTimer = this.type === 'oni' ? 0.45 : 0.25;
        } else if (distToPlayer < this.detectRange + 160 && yDist < 180) {
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
          this.stateTimer = this.type === 'oni' ? 0.35 : 0.26;
          this.hasHitPlayerThisAttack = false;

          if (this.type === 'monk') {
            this.projectiles.push({
              x: this.x + this.facing * 20,
              y: this.y + 14,
              vx: this.facing * 440,
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
        if (this.type !== 'monk') {
          this.x += this.facing * (this.chaseSpeed * 0.9) * dt;
        }

        // Damage Player
        if (!this.hasHitPlayerThisAttack && player && !player.isDead && !player.isDashing) {
          const hitRange = this.type === 'oni' ? 95 : 65;
          const hit = (dirToPlayer === this.facing && xDist < hitRange && yDist < 60);
          if (hit) {
            this.hasHitPlayerThisAttack = true;
            player.takeDamage(1, audio, camera);
          }
        }

        if (this.stateTimer <= 0) {
          this.state = 'cooldown';
          this.stateTimer = this.type === 'oni' ? 0.8 : 0.45;
        }
        break;

      case 'cooldown':
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

    // Draw Cursed Monk Orb Projectiles
    for (const orb of this.projectiles) {
      ctx.save();
      const halo = ctx.createRadialGradient(orb.x - camX, orb.y - camY, 2, orb.x - camX, orb.y - camY, 18);
      halo.addColorStop(0, '#dc2626');
      halo.addColorStop(0.6, '#7e22ce');
      halo.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(orb.x - camX, orb.y - camY, 18, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(orb.x - camX, orb.y - camY, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.save();
    ctx.translate(sx + this.width / 2, sy + this.height / 2);
    ctx.scale(this.facing, 1);

    const isMoving = this.state === 'patrol' || this.state === 'chase';
    const stride = isMoving ? Math.sin(this.animTime) : 0;

    // ----------------------------------------------------
    // TYPE 1: #02 SHADOW RONIN (Straw Kasa & Samurai Robe)
    // ----------------------------------------------------
    if (this.type === 'ronin') {
      ctx.fillStyle = '#0a0d14';

      // Long Flowing Samurai Robe / Trench Coat
      ctx.beginPath();
      ctx.moveTo(-10, -10);
      ctx.lineTo(10, -10);
      ctx.lineTo(14, 24);
      ctx.lineTo(-14, 24);
      ctx.closePath();
      ctx.fill();

      // Dual Katana Scabbards at hip
      ctx.strokeStyle = '#1e1b1b';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(-4, 0);
      ctx.lineTo(-24, 10);
      ctx.moveTo(-6, 4);
      ctx.lineTo(-26, 14);
      ctx.stroke();

      // Ronin Feet & Tabi
      ctx.fillStyle = '#0a0d14';
      ctx.fillRect(-8 - stride * 8, 24, 6, 6);
      ctx.fillRect(4 + stride * 8, 24, 6, 6);

      // Conical Straw Kasa Hat (#02 Shadow Ronin signature)
      ctx.fillStyle = '#171717';
      ctx.beginPath();
      ctx.moveTo(0, -28);
      ctx.lineTo(-22, -14);
      ctx.lineTo(22, -14);
      ctx.closePath();
      ctx.fill();

      // Hat Rim & Shadow
      ctx.fillStyle = '#000000';
      ctx.fillRect(-10, -14, 20, 6);

      // Hand on Katana Blade
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(4, -2);
      ctx.lineTo(26, 8);
      ctx.stroke();
    }
    // ----------------------------------------------------
    // TYPE 2: #03 ONI GUARD (Horned Mask & Heavy Spiked Kanabo)
    // ----------------------------------------------------
    else if (this.type === 'oni') {
      ctx.fillStyle = '#1e293b';

      // Heavy Segmented Plate Armor
      ctx.beginPath();
      ctx.moveTo(-16, -14);
      ctx.lineTo(16, -14);
      ctx.lineTo(14, 18);
      ctx.lineTo(-14, 18);
      ctx.closePath();
      ctx.fill();

      // Spiky Armor Pauldrons
      ctx.fillStyle = '#334155';
      ctx.fillRect(-18, -14, 8, 12);
      ctx.fillRect(10, -14, 8, 12);

      // Glowing Red Lava Cracks in Armor
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(-6, -4, 12, 2.5);

      // Thick Shimenawa Rope Belt
      ctx.fillStyle = '#64748b';
      ctx.fillRect(-14, 8, 28, 6);

      // Armored Legs
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-12 - stride * 8, 18, 10, 14);
      ctx.fillRect(4 + stride * 8, 18, 10, 14);

      // Horned Oni Kabuto Helmet
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(0, -20, 10, 0, Math.PI * 2);
      ctx.fill();

      // Sharp Horns
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.moveTo(-8, -26);
      ctx.lineTo(-12, -36);
      ctx.lineTo(-4, -26);
      ctx.moveTo(8, -26);
      ctx.lineTo(12, -36);
      ctx.lineTo(4, -26);
      ctx.fill();

      // Glowing Red Eye
      ctx.fillStyle = '#ef4444';
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 10;
      ctx.fillRect(2, -22, 5, 3);
      ctx.shadowBlur = 0;

      // Massive Spiked Kanabo Iron Club
      ctx.save();
      ctx.translate(14, 2);
      ctx.rotate(0.3);
      ctx.fillStyle = '#334155';
      ctx.fillRect(0, -32, 12, 48); // Heavy club body
      // Spikes on Kanabo
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(-4, -28, 4, 6);
      ctx.fillRect(-4, -16, 4, 6);
      ctx.fillRect(12, -28, 4, 6);
      ctx.fillRect(12, -16, 4, 6);
      ctx.restore();
    }
    // ----------------------------------------------------
    // TYPE 3: #04 CURSED MONK (Floating Levitation & Orb Halo)
    // ----------------------------------------------------
    else if (this.type === 'monk') {
      const floatY = Math.sin(this.animTime * 0.8) * 6;
      ctx.translate(0, floatY);

      // Orbiting Dark Curse Orbs Halo
      for (let i = 0; i < 6; i++) {
        const ang = (i / 6) * Math.PI * 2 + this.animTime * 0.6;
        const ox = Math.cos(ang) * 26;
        const oy = -22 + Math.sin(ang) * 14;
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.arc(ox, oy, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      // Tattered Black Cowl Robe
      ctx.fillStyle = '#09090b';
      ctx.beginPath();
      ctx.moveTo(-10, -12);
      ctx.lineTo(10, -12);
      ctx.lineTo(14, 20);
      ctx.lineTo(-14, 20);
      ctx.closePath();
      ctx.fill();

      // Ragged hem tails
      ctx.fillRect(-12, 20, 6, 8);
      ctx.fillRect(0, 20, 5, 12);
      ctx.fillRect(8, 20, 6, 9);

      // Glowing Skull Mask Face under Hood
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.arc(2, -20, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(2, -21, 2, 2);
      ctx.fillRect(5, -21, 2, 2);
    }
    // ----------------------------------------------------
    // TYPE 4: #05 CRIMSON ASSASSIN (Half-Red Mask & Dual Kama)
    // ----------------------------------------------------
    else {
      ctx.fillStyle = '#0f172a';

      // Agile Ninja Tunic
      ctx.beginPath();
      ctx.moveTo(-8, -10);
      ctx.lineTo(8, -10);
      ctx.lineTo(6, 12);
      ctx.lineTo(-6, 12);
      ctx.closePath();
      ctx.fill();

      // Red Sash
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(-7, 2, 14, 4);

      // Sprinting Legs
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-6 - stride * 10, 12, 5, 14);
      ctx.fillRect(2 + stride * 10, 12, 5, 14);

      // Half-Red Half-Black Assassin Mask
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(2, -16, 7, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(2, -16, 7, -Math.PI * 0.5, Math.PI * 0.5, false);
      ctx.fill();

      // Dual Curved Kama / Tantō Blades (Reverse grip)
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2.8;
      ctx.beginPath();
      ctx.moveTo(4, 0);
      ctx.lineTo(18, 12);
      ctx.moveTo(-2, 4);
      ctx.lineTo(-16, 16);
      ctx.stroke();
    }

    ctx.restore();
  }
}
