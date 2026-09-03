import { Shuriken } from './Shuriken.js';

/**
 * NinjaArashiPlayer — Silhouette Hero Ninja for Devil's Door v2.0.
 * Equipped with traditional Kasa hat, cyan eye visor, Verlet cloth scarf,
 * Katana dash-slashes, somersault flips, shurikens, and diamond magnet collection.
 */
export class NinjaArashiPlayer {
  constructor(x = 100, y = 220) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;

    this.width = 30;
    this.height = 54;
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
    this.dashSpeed = 680;

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

    // 7-Node Verlet Cloth Scarf
    this.scarfNodes = [];
    this._initScarf();

    // Visual Particles
    this.wallSparks = [];
  }

  _initScarf() {
    this.scarfNodes = [];
    for (let i = 0; i < 7; i++) {
      this.scarfNodes.push({
        x: this.x - i * 5,
        y: this.y + 12,
        oldX: this.x - i * 5,
        oldY: this.y + 12
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
    this.shurikens = [];
    this.ghosts = [];
    this.wallSparks = [];
    this._initScarf();
  }

  takeDamage(amount = 1, audio = null, camera = null) {
    if (this.isDead || this.isDashing) return;
    this.health -= amount;
    this.vy = -220;
    this.vx = -this.facing * 180;

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
    this.vy = -260;

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

    // Cooldown timers
    if (this.dashCooldown > 0) this.dashCooldown -= dt;
    if (this.shurikenCooldown > 0) this.shurikenCooldown -= dt;

    // 1. Dash / Katana Slash Action
    if (this.isDashing) {
      this.dashTimer -= dt;
      this.vx = this.facing * this.dashSpeed;
      this.vy = 0;

      // Leave dynamic afterimage ghosts
      this.ghosts.push({
        x: this.x,
        y: this.y,
        facing: this.facing,
        flipAngle: this.flipAngle,
        life: 0.18,
        alpha: 0.65
      });

      // Cleave through nearby enemies
      if (level && level.enemies) {
        for (const enemy of level.enemies) {
          if (enemy.isDead) continue;
          const dist = Math.hypot(this.x - enemy.x, (this.y + 20) - (enemy.y + 20));
          if (dist < 85) {
            enemy.takeDamage(2, this.facing, audio);
            if (camera) camera.addShake(0.45);
            this.score += 500;
          }
        }
      }

      if (this.dashTimer <= 0) {
        this.isDashing = false;
        this.vx = this.facing * this.moveSpeed * 0.5;
      }
    } else {
      // 2. Horizontal Movement
      let moveDir = 0;
      if (input.isLeft()) moveDir -= 1;
      if (input.isRight()) moveDir += 1;

      if (moveDir !== 0) {
        this.facing = moveDir;
        this.vx = moveDir * this.moveSpeed;
        if (this.isGrounded && audio && Math.random() < 0.12) {
          audio.playFootstep();
        }
      } else {
        this.vx *= 0.72; // Deceleration
        if (Math.abs(this.vx) < 10) this.vx = 0;
      }

      // 3. Dash Trigger (Slash Button / J / Z)
      if (input.isAttacking() && this.dashCooldown <= 0) {
        this.isDashing = true;
        this.dashTimer = this.dashDuration;
        this.dashCooldown = 0.55;
        if (audio) audio.playKatanaSlash();
        if (camera) camera.addShake(0.25);
      }

      // 4. Shuriken Trigger (Shuriken Button / K / X)
      if (input.isShuriken && input.isShuriken() && this.shurikenCooldown <= 0) {
        this.shurikenCooldown = 0.35;
        const star = new Shuriken(this.x + this.facing * 20, this.y + 16, this.facing);
        this.shurikens.push(star);
        if (audio) audio.playShurikenThrow();
      }

      // 5. Jump / Double Jump / Wall Jump
      if (input.isJumping()) {
        if (this.isGrounded) {
          this.vy = -this.jumpForce;
          this.isGrounded = false;
          this.canDoubleJump = true;
          if (audio) audio.playJump();
        } else if (this.isWallSliding) {
          // Wall leap
          this.vy = -this.jumpForce * 0.95;
          this.vx = -this.wallDir * this.moveSpeed * 1.1;
          this.facing = -this.wallDir;
          this.isWallSliding = false;
          this.canDoubleJump = true;
          if (audio) audio.playJump();
        } else if (this.canDoubleJump) {
          // Somersault Double Jump
          this.vy = -this.doubleJumpForce;
          this.canDoubleJump = false;
          this.isFlipping = true;
          this.flipAngle = 0;
          if (audio) audio.playDoubleJump();
        }
      }

      // Apply Gravity
      if (!this.isWallSliding) {
        this.vy += this.gravity * dt;
        if (this.vy > 800) this.vy = 800; // Terminal velocity
      } else {
        this.vy = 120; // Slow wall slide descent
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

    // 8. Update Ghosts & Particles
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

    // Somersault Rotation
    if (this.isFlipping) {
      this.flipAngle += this.facing * Math.PI * 5 * dt;
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

    // Hazards (Spikes & Abyss)
    if (level.checkHazardCollision(this.x, this.y, this.width, this.height)) {
      this.kill(audio, camera);
    }

    // Bottom pit fall death
    if (this.y > 850) {
      this.kill(audio, camera);
    }
  }

  _checkAABB(x1, y1, w1, h1, x2, y2, w2, h2) {
    return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;
  }

  _updateScarf(dt) {
    const headX = this.x + 12 - this.facing * 8;
    const headY = this.y + 14;

    this.scarfNodes[0].x = headX;
    this.scarfNodes[0].y = headY;

    // Aerodynamic wind impulse
    const windForce = -this.facing * (Math.abs(this.vx) * 0.08 + 12);

    for (let i = 1; i < this.scarfNodes.length; i++) {
      const node = this.scarfNodes[i];
      const vx = (node.x - node.oldX) * 0.88;
      const vy = (node.y - node.oldY) * 0.88;

      node.oldX = node.x;
      node.oldY = node.y;

      node.x += vx + windForce * dt;
      node.y += vy + 60 * dt; // Light gravity
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
      }
    }
  }

  draw(ctx, camX, camY) {
    const px = this.x - camX;
    const py = this.y - camY;

    // 1. Draw Dash Afterimages (Golden Slash Ghosts)
    for (const g of this.ghosts) {
      ctx.save();
      ctx.globalAlpha = g.alpha * 0.45;
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect((g.x - camX) - 15, (g.y - camY), 30, 54);
      ctx.restore();
    }

    // 2. Draw Shurikens
    for (const star of this.shurikens) {
      star.draw(ctx, camX, camY);
    }

    // 3. Draw Flowing Red Cloth Scarf Ribbon
    ctx.save();
    ctx.fillStyle = '#ef4444';
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(this.scarfNodes[0].x - camX, this.scarfNodes[0].y - camY);
    for (let i = 1; i < this.scarfNodes.length; i++) {
      const n = this.scarfNodes[i];
      ctx.lineTo(n.x - camX, n.y - camY);
    }
    ctx.stroke();
    ctx.restore();

    // 4. Draw Hero Ninja Silhouette
    ctx.save();
    ctx.translate(px + this.width / 2, py + this.height / 2);
    if (this.isFlipping) {
      ctx.rotate(this.flipAngle);
    }

    // Ninja Body Silhouette
    ctx.fillStyle = '#080c14';
    ctx.fillRect(-12, -18, 24, 40);

    // Kasa Straw Conic Hat (Archive images 3, 4, 17)
    ctx.fillStyle = '#080c14';
    ctx.beginPath();
    ctx.ellipse(0, -22, 18, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, -23, 7, 0, Math.PI * 2);
    ctx.fill();

    // Glowing Cyan Eye Visor
    ctx.fillStyle = '#38bdf8';
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 10;
    ctx.fillRect(this.facing > 0 ? 0 : -8, -21, 8, 2.5);
    ctx.shadowBlur = 0;

    // Katana Blade drawing effect during Dash-Slash
    if (this.isDashing) {
      ctx.fillStyle = '#fbbf24';
      ctx.shadowColor = '#fbbf24';
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.arc(this.facing * 28, 4, 38, -Math.PI * 0.25, Math.PI * 0.25, false);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    ctx.restore();
  }
}
