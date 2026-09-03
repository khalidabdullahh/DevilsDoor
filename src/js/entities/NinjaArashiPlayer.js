import { Shuriken } from './Shuriken.js';

/**
 * NinjaArashiPlayer — Authentic Articulated Ninja Arashi Hero Silhouette.
 * Features:
 * - Kasa straw conical hat with curved woven brim & cyan glowing eye visor
 * - Articulated procedural running, jumping, wall-sliding, and slashing limbs
 * - Dual trailing red cloth scarf ribbon with Verlet aerodynamic physics
 * - Katana dash-slash with golden crescent slash wave & afterimage ghosts
 * - 360-degree acrobatic somersault flip animation
 * - 4-pointed metallic shuriken star throwing
 */
export class NinjaArashiPlayer {
  constructor(x = 120, y = 480) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;

    this.width = 32;
    this.height = 56;
    this.facing = 1; // 1 = right, -1 = left

    // Stats & Collectibles
    this.maxHealth = 3;
    this.health = this.maxHealth;
    this.isDead = false;
    this.diamonds = 0;
    this.score = 0;

    // Physics constants
    this.moveSpeed = 310;
    this.jumpForce = 440;
    this.doubleJumpForce = 410;
    this.gravity = 1180;
    this.dashSpeed = 700;

    // Movement States
    this.isGrounded = false;
    this.canDoubleJump = true;
    this.isWallSliding = false;
    this.wallDir = 0;

    // Dash / Katana Slash
    this.isDashing = false;
    this.dashTimer = 0;
    this.dashDuration = 0.22;
    this.dashCooldown = 0;
    this.ghosts = [];

    // Somersault Flip
    this.flipAngle = 0;
    this.isFlipping = false;

    // Shurikens
    this.shurikens = [];
    this.shurikenCooldown = 0;

    // Procedural Running & Limb Animation Timer
    this.animTime = 0;

    // 7-Node Dual Verlet Cloth Scarf Ribbons
    this.scarfNodes = [];
    this.scarfNodes2 = [];
    this._initScarf();

    // Visual Particles
    this.wallSparks = [];
  }

  _initScarf() {
    this.scarfNodes = [];
    this.scarfNodes2 = [];
    for (let i = 0; i < 7; i++) {
      this.scarfNodes.push({
        x: this.x - i * 6,
        y: this.y + 14,
        oldX: this.x - i * 6,
        oldY: this.y + 14
      });
      this.scarfNodes2.push({
        x: this.x - i * 7,
        y: this.y + 16,
        oldX: this.x - i * 7,
        oldY: this.y + 16
      });
    }
  }

  reset(x, y) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.health = this.maxHealth;
    this.isDead = false;
    this.isDashing = false;
    this.dashTimer = 0;
    this.isFlipping = false;
    this.flipAngle = 0;
    this.animTime = 0;
    this.shurikens = [];
    this.ghosts = [];
    this.wallSparks = [];
    this._initScarf();
  }

  takeDamage(amount = 1, audio = null, camera = null) {
    if (this.isDead || this.isDashing) return;
    this.health -= amount;
    this.vy = -240;
    this.vx = -this.facing * 200;

    if (camera) camera.addShake(0.5);
    if (audio) audio.playBladeHit();

    if (this.health <= 0) {
      this.kill(audio, camera);
    }
  }

  kill(audio = null, camera = null) {
    if (this.isDead) return;
    this.isDead = true;
    this.health = 0;
    this.vx = 0;
    this.vy = -280;

    if (camera) camera.addShake(0.7);
    if (audio) audio.playPlayerDeath();
  }

  update(dt, input, level, audio, camera) {
    if (this.isDead) {
      this.vy += this.gravity * dt;
      this.y += this.vy * dt;
      this._updateScarf(dt);
      return;
    }

    this.animTime += dt * 14;

    // Cooldown timers
    if (this.dashCooldown > 0) this.dashCooldown -= dt;
    if (this.shurikenCooldown > 0) this.shurikenCooldown -= dt;

    // 1. Dash / Katana Slash Action
    if (this.isDashing) {
      this.dashTimer -= dt;
      this.vx = this.facing * this.dashSpeed;
      this.vy = 0;

      // Leave golden afterimage ghosts
      this.ghosts.push({
        x: this.x,
        y: this.y,
        facing: this.facing,
        life: 0.18,
        alpha: 0.7
      });

      // Cleave through nearby enemies
      if (level && level.enemies) {
        for (const enemy of level.enemies) {
          if (enemy.isDead) continue;
          const dist = Math.hypot(this.x - enemy.x, (this.y + 20) - (enemy.y + 20));
          if (dist < 90) {
            enemy.takeDamage(2, this.facing, audio);
            if (camera) camera.addShake(0.45);
            this.score += 500;
          }
        }
      }

      if (this.dashTimer <= 0) {
        this.isDashing = false;
        this.vx = this.facing * this.moveSpeed * 0.4;
      }
    } else {
      // 2. Horizontal Movement
      let moveDir = 0;
      if (input.isLeft()) moveDir -= 1;
      if (input.isRight()) moveDir += 1;

      if (moveDir !== 0) {
        this.facing = moveDir;
        this.vx = moveDir * this.moveSpeed;
        if (this.isGrounded && audio && Math.random() < 0.1) {
          audio.playFootstep();
        }
      } else {
        this.vx *= 0.7; // Deceleration
        if (Math.abs(this.vx) < 10) this.vx = 0;
      }

      // 3. Dash Trigger (Slash Button / J / Z / Click)
      if (input.isAttack() && this.dashCooldown <= 0) {
        this.isDashing = true;
        this.dashTimer = this.dashDuration;
        this.dashCooldown = 0.55;
        if (audio) audio.playKatanaSlash();
        if (camera) camera.addShake(0.25);
      }

      // 4. Shuriken Trigger (Star Button / K / X)
      if (input.isShuriken && input.isShuriken() && this.shurikenCooldown <= 0) {
        this.shurikenCooldown = 0.35;
        const star = new Shuriken(this.x + this.facing * 24, this.y + 16, this.facing);
        this.shurikens.push(star);
        if (audio) audio.playShurikenThrow();
      }

      // 5. Jump / Double Jump / Wall Jump
      if (input.isJumpPressed()) {
        if (this.isGrounded) {
          this.vy = -this.jumpForce;
          this.isGrounded = false;
          this.canDoubleJump = true;
          if (audio) audio.playJump();
        } else if (this.isWallSliding) {
          // Wall kick leap
          this.vy = -this.jumpForce * 0.95;
          this.vx = -this.wallDir * this.moveSpeed * 1.15;
          this.facing = -this.wallDir;
          this.isWallSliding = false;
          this.canDoubleJump = true;
          if (audio) audio.playJump();
        } else if (this.canDoubleJump) {
          // Somersault Double Jump Flip
          this.vy = -this.doubleJumpForce;
          this.canDoubleJump = false;
          this.isFlipping = true;
          this.flipAngle = 0;
          if (audio) audio.playDoubleJump();
        }
      }

      // Gravity Application
      if (!this.isWallSliding) {
        this.vy += this.gravity * dt;
        if (this.vy > 820) this.vy = 820;
      } else {
        this.vy = 130; // Smooth wall slide descent
        // Friction spark particles
        if (Math.random() < 0.3) {
          this.wallSparks.push({
            x: this.x + (this.wallDir > 0 ? this.width : 0),
            y: this.y + 36,
            vx: -this.wallDir * (Math.random() * 80 + 30),
            vy: -Math.random() * 60,
            life: 0.25
          });
        }
      }
    }

    // 6. Physics Collision & Integration
    this._integratePhysics(dt, level, audio, camera);

    // 7. Update Shurikens
    for (let i = this.shurikens.length - 1; i >= 0; i--) {
      const star = this.shurikens[i];
      star.update(dt, level, audio);
      if (star.isDead) this.shurikens.splice(i, 1);
    }

    // 8. Update Ghosts & Sparks
    for (let i = this.ghosts.length - 1; i >= 0; i--) {
      const g = this.ghosts[i];
      g.life -= dt;
      g.alpha = g.life / 0.18;
      if (g.life <= 0) this.ghosts.splice(i, 1);
    }

    for (let i = this.wallSparks.length - 1; i >= 0; i--) {
      const p = this.wallSparks[i];
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.life <= 0) this.wallSparks.splice(i, 1);
    }

    // 9. Update Scarf Simulation
    this._updateScarf(dt);

    // Somersault Flip Rotation
    if (this.isFlipping) {
      this.flipAngle += this.facing * Math.PI * 5.2 * dt;
      if (Math.abs(this.flipAngle) >= Math.PI * 2) {
        this.flipAngle = 0;
        this.isFlipping = false;
      }
    }
  }

  _integratePhysics(dt, level, audio, camera) {
    if (!level) return;

    // Horizontal Movement
    this.x += this.vx * dt;
    this.isWallSliding = false;

    for (const solid of level.solids) {
      if (!solid.active) continue;
      if (this._checkAABB(this.x, this.y, this.width, this.height, solid.x, solid.y, solid.width, solid.height)) {
        if (this.vx > 0) {
          this.x = solid.x - this.width;
          if (!this.isGrounded && this.vy > 0) {
            this.isWallSliding = true;
            this.wallDir = 1;
          }
        } else if (this.vx < 0) {
          this.x = solid.x + solid.width;
          if (!this.isGrounded && this.vy > 0) {
            this.isWallSliding = true;
            this.wallDir = -1;
          }
        }
      }
    }

    // Vertical Movement
    this.y += this.vy * dt;
    this.isGrounded = false;

    for (const solid of level.solids) {
      if (!solid.active) continue;
      if (this._checkAABB(this.x, this.y, this.width, this.height, solid.x, solid.y, solid.width, solid.height)) {
        if (this.vy > 0) {
          this.y = solid.y - this.height;
          this.vy = 0;
          this.isGrounded = true;
          this.isFlipping = false;
          this.flipAngle = 0;
        } else if (this.vy < 0) {
          this.y = solid.y + solid.height;
          this.vy = 0;
        }
      }
    }

    // Hazards (Spikes & Pits)
    if (level.checkHazardCollision(this.x, this.y, this.width, this.height)) {
      this.kill(audio, camera);
    }

    if (this.y > 850) {
      this.kill(audio, camera);
    }
  }

  _checkAABB(x1, y1, w1, h1, x2, y2, w2, h2) {
    return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;
  }

  _updateScarf(dt) {
    const headX = this.x + 14 - this.facing * 8;
    const headY = this.y + 14;

    this.scarfNodes[0].x = headX;
    this.scarfNodes[0].y = headY;
    this.scarfNodes2[0].x = headX - this.facing * 2;
    this.scarfNodes2[0].y = headY + 2;

    const windForce = -this.facing * (Math.abs(this.vx) * 0.1 + 16);

    for (let i = 1; i < this.scarfNodes.length; i++) {
      const n1 = this.scarfNodes[i];
      const vx1 = (n1.x - n1.oldX) * 0.88;
      const vy1 = (n1.y - n1.oldY) * 0.88;
      n1.oldX = n1.x;
      n1.oldY = n1.y;
      n1.x += vx1 + windForce * dt;
      n1.y += vy1 + 55 * dt;

      const n2 = this.scarfNodes2[i];
      const vx2 = (n2.x - n2.oldX) * 0.88;
      const vy2 = (n2.y - n2.oldY) * 0.88;
      n2.oldX = n2.x;
      n2.oldY = n2.y;
      n2.x += vx2 + (windForce * 0.9) * dt;
      n2.y += vy2 + 65 * dt;
    }

    // Constrain segment distances (Verlet relaxation)
    const targetDist = 7;
    for (let iter = 0; iter < 4; iter++) {
      for (let i = 1; i < this.scarfNodes.length; i++) {
        const prev = this.scarfNodes[i - 1];
        const curr = this.scarfNodes[i];
        const dx = curr.x - prev.x;
        const dy = curr.y - prev.y;
        const d = Math.hypot(dx, dy) || 1;
        const diff = (targetDist - d) / d;
        curr.x += dx * diff * 0.75;
        curr.y += dy * diff * 0.75;

        const prev2 = this.scarfNodes2[i - 1];
        const curr2 = this.scarfNodes2[i];
        const dx2 = curr2.x - prev2.x;
        const dy2 = curr2.y - prev2.y;
        const d2 = Math.hypot(dx2, dy2) || 1;
        const diff2 = (targetDist - d2) / d2;
        curr2.x += dx2 * diff2 * 0.75;
        curr2.y += dy2 * diff2 * 0.75;
      }
    }
  }

  draw(ctx, camX, camY) {
    const px = this.x - camX;
    const py = this.y - camY;

    // 1. Draw Golden Dash Afterimages
    for (const g of this.ghosts) {
      ctx.save();
      ctx.globalAlpha = g.alpha * 0.45;
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect((g.x - camX), (g.y - camY), this.width, this.height);
      ctx.restore();
    }

    // 2. Draw Shurikens
    for (const star of this.shurikens) {
      star.draw(ctx, camX, camY);
    }

    // 3. Draw Wall Sparks
    for (const p of this.wallSparks) {
      ctx.save();
      ctx.fillStyle = '#fbbf24';
      ctx.globalAlpha = p.life / 0.25;
      ctx.fillRect(p.x - camX, p.y - camY, 3, 3);
      ctx.restore();
    }

    // 4. Draw Flowing Dual Red Scarf Ribbons (Archive image 17 & 3)
    ctx.save();
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(this.scarfNodes[0].x - camX, this.scarfNodes[0].y - camY);
    for (let i = 1; i < this.scarfNodes.length; i++) {
      ctx.lineTo(this.scarfNodes[i].x - camX, this.scarfNodes[i].y - camY);
    }
    ctx.stroke();

    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(this.scarfNodes2[0].x - camX, this.scarfNodes2[0].y - camY);
    for (let i = 1; i < this.scarfNodes2.length; i++) {
      ctx.lineTo(this.scarfNodes2[i].x - camX, this.scarfNodes2[i].y - camY);
    }
    ctx.stroke();
    ctx.restore();

    // 5. Draw Articulated Hero Ninja Silhouette (Matching Archive Reference Images)
    ctx.save();
    ctx.translate(px + this.width / 2, py + this.height / 2);
    ctx.scale(this.facing, 1);

    if (this.isFlipping) {
      ctx.rotate(this.flipAngle);
    }

    const isRunning = this.isGrounded && Math.abs(this.vx) > 20;
    const stride = isRunning ? Math.sin(this.animTime) : 0;
    const strideCos = isRunning ? Math.cos(this.animTime) : 0;

    ctx.fillStyle = '#080c14';

    // Katana Scabbard on Back (Angled sheath)
    ctx.save();
    ctx.strokeStyle = '#080c14';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-10, 8);
    ctx.lineTo(-24, -20);
    ctx.stroke();
    // Golden Katana Hilt (Tsuka)
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(-28, -26, 6, 7);
    ctx.restore();

    // Back Leg & Tabi Boot
    ctx.fillStyle = '#080c14';
    ctx.beginPath();
    if (!this.isGrounded) {
      // Leaping back leg bent
      ctx.moveTo(-2, 10);
      ctx.lineTo(-14, 20);
      ctx.lineTo(-10, 28);
      ctx.lineTo(-4, 26);
    } else {
      // Running stride back leg
      ctx.moveTo(-2, 10);
      ctx.lineTo(-2 - stride * 12, 22);
      ctx.lineTo(-2 - stride * 16, 28);
      ctx.lineTo(2 - stride * 16, 28);
    }
    ctx.closePath();
    ctx.fill();

    // Ninja Torso & Samurai Hakama Tunic
    ctx.fillStyle = '#080c14';
    ctx.beginPath();
    ctx.moveTo(-9, -10);
    ctx.lineTo(9, -10);
    ctx.lineTo(7, 14);
    ctx.lineTo(-7, 14);
    ctx.closePath();
    ctx.fill();

    // Obi Sash Belt
    ctx.fillStyle = '#be123c';
    ctx.fillRect(-8, 3, 16, 4);

    // Front Leg & Tabi Boot
    ctx.fillStyle = '#080c14';
    ctx.beginPath();
    if (!this.isGrounded) {
      // Leaping front leg forward
      ctx.moveTo(4, 10);
      ctx.lineTo(12, 20);
      ctx.lineTo(16, 27);
      ctx.lineTo(10, 28);
    } else {
      // Running stride front leg
      ctx.moveTo(4, 10);
      ctx.lineTo(4 + stride * 12, 22);
      ctx.lineTo(4 + stride * 16, 28);
      ctx.lineTo(8 + stride * 16, 28);
    }
    ctx.closePath();
    ctx.fill();

    // Ninja Head & Neck Cloth
    ctx.fillStyle = '#080c14';
    ctx.beginPath();
    ctx.arc(2, -14, 7, 0, Math.PI * 2);
    ctx.fill();

    // Conical Kasa Straw Hat with Flared Brim (Archive image 4, 17, 3)
    ctx.fillStyle = '#080c14';
    ctx.beginPath();
    ctx.moveTo(2, -26); // Crown peak
    ctx.lineTo(-18, -14); // Left flared edge
    ctx.quadraticCurveTo(2, -18, 22, -14); // Curved brim
    ctx.closePath();
    ctx.fill();

    // Hat Peak Cone & Woven Edge
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(2, -26);
    ctx.lineTo(22, -14);
    ctx.stroke();

    // Glowing Cyan Visor Eyes (Signature Ninja Arashi Eye Glow)
    ctx.fillStyle = '#38bdf8';
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 12;
    ctx.fillRect(4, -14.5, 7, 2.5);
    ctx.shadowBlur = 0;

    // Front Arm & Katana
    ctx.fillStyle = '#080c14';
    ctx.beginPath();
    if (this.isDashing) {
      // Extended katana thrust/slash pose
      ctx.moveTo(2, -8);
      ctx.lineTo(20, -4);
      ctx.lineTo(24, 0);
    } else if (!this.isGrounded) {
      // Leaping raised arm pose
      ctx.moveTo(2, -8);
      ctx.lineTo(12, -18);
      ctx.lineTo(16, -14);
    } else {
      // Running arm swing
      ctx.moveTo(2, -8);
      ctx.lineTo(2 + strideCos * 10, -2);
      ctx.lineTo(6 + strideCos * 12, 6);
    }
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#080c14';
    ctx.stroke();

    // Gleaming Katana Blade & Golden Arc during Dash Slash
    if (this.isDashing) {
      ctx.save();
      ctx.strokeStyle = '#fbbf24';
      ctx.shadowColor = '#fbbf24';
      ctx.shadowBlur = 20;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(28, 0, 44, -Math.PI * 0.35, Math.PI * 0.35, false);
      ctx.stroke();

      // Blade Core
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(28, 0, 44, -Math.PI * 0.25, Math.PI * 0.25, false);
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();
  }
}
