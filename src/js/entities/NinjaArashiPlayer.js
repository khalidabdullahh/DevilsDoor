import { Shuriken } from './Shuriken.js';

/**
 * NinjaArashiPlayer — Silhouette Ninja with Cloth Scarf, Combat & Cinematic Ascension.
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

    // Stats
    this.maxHealth = 3;
    this.health = this.maxHealth;
    this.isDead = false;
    this.hasWon = false;
    this.isAscending = false;
    this.ascendTimer = 0;

    // Physics constants
    this.moveSpeed = 300;
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
    this.ascendParticles = [];
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
    this.hasWon = false;
    this.isAscending = false;
    this.ascendTimer = 0;
    this.isDashing = false;
    this.dashTimer = 0;
    this.isFlipping = false;
    this.flipAngle = 0;
    this.shurikens = [];
    this.ghosts = [];
    this.ascendParticles = [];
    this._initScarf();
  }

  takeDamage(amount = 1, knockbackDir = 0, audio = null) {
    if (this.isDead || this.isDashing || this.isAscending) return;
    this.health -= amount;
    this.vx = knockbackDir * 280;
    this.vy = -200;

    if (audio) audio.playBladeHit();

    if (this.health <= 0) {
      this.kill('combat_death', audio);
    }
  }

  kill(reason = 'death', audio = null) {
    if (this.isDead || this.isAscending) return;
    this.isDead = true;
    this.health = 0;
    this.vx = 0;
    this.vy = 0;
    if (audio) audio.playPlayerDeath();
  }

  startAscension() {
    if (this.isAscending) return;
    this.isAscending = true;
    this.ascendTimer = 0;
    this.vx = 0;
    this.vy = 0;
  }

  update(dt, input, level, audio, camera) {
    // 1. Update Projectiles
    for (let i = this.shurikens.length - 1; i >= 0; i--) {
      const s = this.shurikens[i];
      s.update(dt, level);
      if (!s.active) this.shurikens.splice(i, 1);
    }

    if (this.shurikenCooldown > 0) this.shurikenCooldown -= dt;
    if (this.dashCooldown > 0) this.dashCooldown -= dt;

    // 2. Cinematic Exit Ascension Sequence
    if (this.isAscending) {
      this.ascendTimer += dt;
      this.vy = -35; // Gentle float upward
      this.y += this.vy * dt;

      // Spawn celestial light particles
      if (Math.random() > 0.3) {
        this.ascendParticles.push({
          x: this.x + (Math.random() - 0.5) * 36,
          y: this.y + Math.random() * 45,
          vx: (Math.random() - 0.5) * 20,
          vy: -Math.random() * 120 - 60,
          size: Math.random() * 5 + 3,
          life: 0.8
        });
      }

      for (let i = this.ascendParticles.length - 1; i >= 0; i--) {
        const p = this.ascendParticles[i];
        p.life -= dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.life <= 0) this.ascendParticles.splice(i, 1);
      }

      this._updateScarf(dt, 0);
      return;
    }

    if (this.isDead) return;

    // 3. Movement Controls
    const left = input.isLeftPressed();
    const right = input.isRightPressed();
    const jump = input.isJumpPressed();
    const dash = input.isDashPressed() || input.isAttackPressed();
    const throwShuriken = input.isShurikenPressed();

    // Dash / Katana Slash
    if (dash && this.dashCooldown <= 0 && !this.isDashing) {
      this.isDashing = true;
      this.dashTimer = this.dashDuration;
      this.dashCooldown = 0.55;
      this.vy = 0;
      this.vx = this.facing * this.dashSpeed;
      if (audio) audio.playKatanaSlash();
      if (camera) camera.addShake(0.3);
    }

    // Shuriken Throw
    if (throwShuriken && this.shurikenCooldown <= 0 && !this.isDashing) {
      this.shurikenCooldown = 0.38;
      const shuriken = new Shuriken(
        this.x + this.facing * 20,
        this.y + 18,
        this.facing * 750,
        -60
      );
      this.shurikens.push(shuriken);
      if (audio) audio.playShurikenThrow();
    }

    // Standard Movement
    if (this.isDashing) {
      this.dashTimer -= dt;
      if (Math.random() > 0.25) {
        this.ghosts.push({ x: this.x, y: this.y, facing: this.facing, alpha: 0.65 });
      }
      if (this.dashTimer <= 0) {
        this.isDashing = false;
        this.vx = this.facing * this.moveSpeed * 0.4;
      }
    } else {
      if (left && !right) {
        this.vx = -this.moveSpeed;
        this.facing = -1;
      } else if (right && !left) {
        this.vx = this.moveSpeed;
        this.facing = 1;
      } else {
        this.vx = 0;
      }

      // Gravity
      this.vy += this.gravity * dt;
      if (this.vy > 850) this.vy = 850;
    }

    // Jump / Double Jump
    if (jump && !this.isDashing) {
      if (this.isGrounded) {
        this.vy = -this.jumpForce;
        this.isGrounded = false;
        this.canDoubleJump = true;
        if (audio) audio.playJump();
      } else if (this.isWallSliding) {
        this.vy = -this.jumpForce * 0.95;
        this.vx = -this.wallDir * this.moveSpeed * 1.2;
        this.facing = -this.wallDir;
        this.isWallSliding = false;
        this.canDoubleJump = true;
        if (audio) audio.playJump();
      } else if (this.canDoubleJump) {
        this.vy = -this.doubleJumpForce;
        this.canDoubleJump = false;
        this.isFlipping = true;
        this.flipAngle = 0;
        if (audio) audio.playDoubleJump();
      }
    }

    // Somersault Spin in Mid-Air
    if (this.isFlipping) {
      this.flipAngle += this.facing * Math.PI * 12 * dt;
      if (Math.abs(this.flipAngle) >= Math.PI * 2) {
        this.isFlipping = false;
        this.flipAngle = 0;
      }
    }

    // Collision Resolution with World
    if (level) {
      const res = level.resolve2D(this.x, this.y, this.width, this.height, this.vx * dt, this.vy * dt);
      this.x = res.x;
      this.y = res.y;

      if (res.grounded) {
        this.isGrounded = true;
        this.vy = 0;
        this.isWallSliding = false;
        this.isFlipping = false;
        this.flipAngle = 0;
      } else {
        this.isGrounded = false;
        if (res.collidedX && this.vy > 0) {
          this.isWallSliding = true;
          this.wallDir = this.facing;
          if (this.vy > 140) this.vy = 140; // Wall slide friction
        } else {
          this.isWallSliding = false;
        }
      }
    }

    // Update Ghost Trails
    for (let i = this.ghosts.length - 1; i >= 0; i--) {
      this.ghosts[i].alpha -= dt * 3.5;
      if (this.ghosts[i].alpha <= 0) this.ghosts.splice(i, 1);
    }

    this._updateScarf(dt, this.vx);
  }

  _updateScarf(dt, pvx) {
    if (!this.scarfNodes || this.scarfNodes.length === 0) return;

    // Anchor node 0 to Ninja's neck
    this.scarfNodes[0].x = this.x - this.facing * 6;
    this.scarfNodes[0].y = this.y + 12;

    const wind = Math.sin(Date.now() * 0.006) * 15 - this.facing * (Math.abs(pvx) * 0.18 + 25);

    for (let i = 1; i < this.scarfNodes.length; i++) {
      const n = this.scarfNodes[i];
      const vx = (n.x - n.oldX) * 0.82;
      const vy = (n.y - n.oldY) * 0.82;

      n.oldX = n.x;
      n.oldY = n.y;

      n.x += vx + wind * dt;
      n.y += vy + 28 * dt; // Gravity
    }

    // Scarf length constraints (10px segments)
    for (let iter = 0; iter < 3; iter++) {
      for (let i = 0; i < this.scarfNodes.length - 1; i++) {
        const n1 = this.scarfNodes[i];
        const n2 = this.scarfNodes[i + 1];
        const dx = n2.x - n1.x;
        const dy = n2.y - n1.y;
        const dist = Math.hypot(dx, dy) || 1;
        const diff = (dist - 10) / dist;
        n2.x -= dx * diff;
        n2.y -= dy * diff;
      }
    }
  }

  getAttackBox() {
    if (!this.isDashing) return null;
    return {
      x: this.facing > 0 ? this.x : this.x - 70,
      y: this.y,
      width: 70,
      height: this.height,
      damage: 1,
      facing: this.facing
    };
  }

  draw(ctx, camX, camY) {
    // 1. Draw Shurikens
    for (const s of this.shurikens) {
      s.draw(ctx, camX, camY);
    }

    // 2. Draw Dash Ghost Trails
    for (const g of this.ghosts) {
      ctx.save();
      ctx.globalAlpha = g.alpha;
      ctx.translate(g.x - camX, g.y - camY);
      ctx.scale(g.facing, 1);
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.roundRect(-10, 14, 20, 28, 4);
      ctx.arc(0, 10, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 3. Draw Ascending Celestial Particles
    if (this.isAscending) {
      ctx.save();
      for (const p of this.ascendParticles) {
        ctx.fillStyle = '#38bdf8';
        ctx.shadowColor = '#bae6fd';
        ctx.shadowBlur = 12;
        ctx.globalAlpha = p.life / 0.8;
        ctx.beginPath();
        ctx.arc(p.x - camX, p.y - camY, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    const drawX = this.x - camX;
    const drawY = this.y - camY;

    // 4. Draw Flowing Red Scarf Ribbon
    ctx.save();
    ctx.strokeStyle = '#ef4444';
    ctx.shadowColor = '#f87171';
    ctx.shadowBlur = 8;
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(this.scarfNodes[0].x - camX, this.scarfNodes[0].y - camY);
    for (let i = 1; i < this.scarfNodes.length; i++) {
      ctx.lineTo(this.scarfNodes[i].x - camX, this.scarfNodes[i].y - camY);
    }
    ctx.stroke();
    ctx.restore();

    // 5. Draw Silhouette Ninja Character
    ctx.save();
    ctx.translate(drawX, drawY + this.height / 2);

    if (this.isFlipping) {
      ctx.rotate(this.flipAngle);
    }

    ctx.scale(this.facing, 1);

    ctx.fillStyle = '#05080f';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.95)';
    ctx.shadowBlur = 10;

    // Legs
    const runCycle = Math.sin(Date.now() * 0.015) * 8;
    const isMoving = Math.abs(this.vx) > 20 && this.isGrounded;

    ctx.beginPath();
    ctx.ellipse(isMoving ? -5 - runCycle : -5, 18, 5, 10, 0.2, 0, Math.PI * 2);
    ctx.ellipse(isMoving ? 5 + runCycle : 5, 18, 5, 10, -0.2, 0, Math.PI * 2);
    ctx.fill();

    // Torso
    ctx.beginPath();
    ctx.roundRect(-9, -12, 18, 26, 4);
    ctx.fill();

    // Head
    ctx.beginPath();
    ctx.arc(0, -18, 9, 0, Math.PI * 2);
    ctx.fill();

    // Conical Straw Hat (*Kasa*)
    ctx.beginPath();
    ctx.moveTo(-18, -20);
    ctx.lineTo(0, -29);
    ctx.lineTo(18, -20);
    ctx.closePath();
    ctx.fill();

    // Dual Katanas on Back
    ctx.strokeStyle = '#05080f';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-8, -22);
    ctx.lineTo(-20, 4);
    ctx.moveTo(-4, -24);
    ctx.lineTo(-16, 2);
    ctx.stroke();

    // Glowing Cyan Eye Slit
    ctx.fillStyle = '#38bdf8';
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 16;
    ctx.beginPath();
    ctx.ellipse(4, -18, 3.5, 1.4, 0.1, 0, Math.PI * 2);
    ctx.fill();

    // Glowing Golden Katana Slash Trail on Dash
    if (this.isDashing) {
      ctx.strokeStyle = '#fbbf24';
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 24;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(10, 0, 36, -Math.PI / 3, Math.PI / 3);
      ctx.stroke();
    }

    ctx.restore();
  }
}
