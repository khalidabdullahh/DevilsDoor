import { Shuriken } from './Shuriken.js';

/**
 * NinjaArashiPlayer — Iconic Black Silhouette Ninja with Dynamic Scarf Physics & Acrobatics.
 * Inspired directly by the legendary Ninja Arashi 2 visual benchmark.
 */
export class NinjaArashiPlayer {
  constructor(startX = 100, startY = 300) {
    this.x = startX;
    this.y = startY;
    this.vx = 0;
    this.vy = 0;
    this.width = 32;
    this.height = 54;
    this.facing = 1; // 1 = Right, -1 = Left

    // Movement Constants
    this.runSpeed = 380;
    this.accel = 2400;
    this.decel = 2200;
    this.jumpSpeed = -620;
    this.gravity = 1400;
    this.maxFallSpeed = 750;
    this.wallSlideSpeed = 160;

    // Acrobatics & State
    this.isGrounded = false;
    this.wasGrounded = false;
    this.canDoubleJump = true;
    this.isWallSliding = false;
    this.wallDir = 0; // -1 = left wall, 1 = right wall
    this.isDead = false;
    this.hasWon = false;

    // Combat & Dash
    this.maxHealth = 3;
    this.health = 3;
    this.isSlashing = false;
    this.slashTimer = 0;
    this.slashDuration = 0.22;
    this.slashCooldown = 0;
    this.invulnerableTimer = 0;

    this.shurikens = [];
    this.shurikenCooldown = 0;

    // Dynamic Flowing Scarf (Verlet Cloth Physics Nodes)
    this.scarfNodes = [];
    this.numScarfNodes = 7;
    this.scarfSegmentLength = 7.5;
    for (let i = 0; i < this.numScarfNodes; i++) {
      this.scarfNodes.push({
        x: startX - i * 6,
        y: startY + 12,
        oldX: startX - i * 6,
        oldY: startY + 12
      });
    }

    // Animation & Somersault
    this.animTime = 0;
    this.somersaultAngle = 0;
    this.isSomersaulting = false;
    this.slashGhosts = [];
  }

  reset(startX = 100, startY = 300) {
    this.x = startX;
    this.y = startY;
    this.vx = 0;
    this.vy = 0;
    this.health = this.maxHealth;
    this.isDead = false;
    this.hasWon = false;
    this.isSlashing = false;
    this.slashTimer = 0;
    this.isSomersaulting = false;
    this.somersaultAngle = 0;
    this.canDoubleJump = true;
    this.shurikens = [];
    this.invulnerableTimer = 0;

    // Reset scarf
    for (let i = 0; i < this.numScarfNodes; i++) {
      this.scarfNodes[i].x = startX - i * 6;
      this.scarfNodes[i].y = startY + 12;
      this.scarfNodes[i].oldX = startX - i * 6;
      this.scarfNodes[i].oldY = startY + 12;
    }
  }

  takeDamage(amount = 1, knockbackDir = -1, audio = null) {
    if (this.isDead || this.hasWon || this.invulnerableTimer > 0) return;
    this.health -= amount;
    this.invulnerableTimer = 0.8;
    this.vx = knockbackDir * 320;
    this.vy = -240;

    if (audio) audio.playBladeHit();
    if (this.health <= 0) {
      this.kill('enemy_strike', audio);
    }
  }

  kill(cause = '', audio = null) {
    if (this.isDead || this.hasWon) return;
    this.isDead = true;
    this.vx = 0;
    this.vy = 0;
    if (audio) audio.playDeath();
  }

  update(dt, input, physicsWorld, audio, camera) {
    if (this.isDead || this.hasWon) return;

    this.animTime += dt;
    if (this.invulnerableTimer > 0) this.invulnerableTimer -= dt;
    if (this.slashCooldown > 0) this.slashCooldown -= dt;
    if (this.shurikenCooldown > 0) this.shurikenCooldown -= dt;

    const movingLeft = input.isLeft();
    const movingRight = input.isRight();
    const jumpJustPressed = input.isJumpJustPressed();
    const slashJustPressed = input.isAttackJustPressed();
    const shurikenJustPressed = input.keys.get('KeyK') || input.keys.get('KeyX');

    // 1. Shuriken Throw
    if (shurikenJustPressed && this.shurikenCooldown <= 0) {
      this.shurikenCooldown = 0.25;
      const shurikenVx = this.facing * 750;
      const shuriken = new Shuriken(this.x + this.facing * 18, this.y + 14, shurikenVx, (Math.random() - 0.5) * 40);
      this.shurikens.push(shuriken);
      if (audio) audio.playKatanaSlash();
    }

    // 2. Katana Dash Slash Trigger
    if (slashJustPressed && !this.isSlashing && this.slashCooldown <= 0) {
      this.isSlashing = true;
      this.slashTimer = this.slashDuration;
      this.slashCooldown = 0.38;
      this.vx = this.facing * 780; // High speed forward dash
      this.vy = 0;
      if (audio) audio.playKatanaSlash();
      if (camera) camera.addShake(0.35);

      // Add motion blur ghost
      this.slashGhosts.push({ x: this.x, y: this.y, facing: this.facing, alpha: 0.8 });
    }

    // 3. Horizontal Movement
    if (this.isSlashing) {
      this.slashTimer -= dt;
      if (this.slashTimer <= 0) this.isSlashing = false;
    } else {
      if (movingLeft && !movingRight) {
        this.vx = Math.max(-this.runSpeed, this.vx - this.accel * dt);
        this.facing = -1;
      } else if (movingRight && !movingLeft) {
        this.vx = Math.min(this.runSpeed, this.vx + this.accel * dt);
        this.facing = 1;
      } else {
        if (this.vx > 0) this.vx = Math.max(0, this.vx - this.decel * dt);
        else if (this.vx < 0) this.vx = Math.min(0, this.vx + this.decel * dt);
      }
    }

    // 4. Wall Slide Check
    this.isWallSliding = false;
    this.wallDir = 0;
    if (!this.isGrounded && this.vy > 0) {
      if (movingLeft && physicsWorld.isSolidAt(this.x - this.width / 2 - 4, this.y + this.height / 2)) {
        this.isWallSliding = true;
        this.wallDir = -1;
      } else if (movingRight && physicsWorld.isSolidAt(this.x + this.width / 2 + 4, this.y + this.height / 2)) {
        this.isWallSliding = true;
        this.wallDir = 1;
      }
    }

    // 5. Jump & Double Jump & Wall Jump
    if (jumpJustPressed) {
      if (this.isGrounded) {
        // Ground Jump
        this.vy = this.jumpSpeed;
        this.isGrounded = false;
        this.canDoubleJump = true;
        if (audio) audio.playJump();
      } else if (this.isWallSliding) {
        // Wall Jump (Launch away from wall)
        this.vy = this.jumpSpeed * 0.95;
        this.vx = -this.wallDir * this.runSpeed * 1.1;
        this.facing = -this.wallDir;
        this.canDoubleJump = true;
        if (audio) audio.playJump();
      } else if (this.canDoubleJump) {
        // Double Jump Somersault Flip
        this.vy = this.jumpSpeed * 0.9;
        this.canDoubleJump = false;
        this.isSomersaulting = true;
        this.somersaultAngle = 0;
        if (audio) audio.playJump();
      }
    }

    // 6. Gravity & Wall Friction
    if (this.isWallSliding) {
      this.vy = Math.min(this.wallSlideSpeed, this.vy + this.gravity * 0.3 * dt);
      this.isSomersaulting = false;
    } else if (!this.isSlashing) {
      this.vy = Math.min(this.maxFallSpeed, this.vy + this.gravity * dt);
    }

    // 7. Somersault Spin Animation
    if (this.isSomersaulting) {
      this.somersaultAngle += this.facing * 18.0 * dt;
      if (Math.abs(this.somersaultAngle) >= Math.PI * 2) {
        this.isSomersaulting = false;
        this.somersaultAngle = 0;
      }
    }

    // 8. Physics Collision Resolution
    const dx = this.vx * dt;
    const dy = this.vy * dt;
    const res = physicsWorld.resolve2D(this.x, this.y, this.width, this.height, dx, dy);

    this.x = res.x;
    this.y = res.y;
    this.wasGrounded = this.isGrounded;
    this.isGrounded = res.grounded;

    if (this.isGrounded) {
      this.isSomersaulting = false;
      this.somersaultAngle = 0;
      this.canDoubleJump = true;
      if (!this.wasGrounded && this.vy > 100 && audio) audio.playLand();
      if (Math.abs(this.vx) > 50 && audio) audio.playFootstep();
    }

    if (res.collidedX) this.vx = 0;
    if (res.collidedY) this.vy = 0;

    // 9. Update Scarf Verlet Physics
    this._updateScarfPhysics(dt);

    // 10. Update Shurikens
    for (let i = this.shurikens.length - 1; i >= 0; i--) {
      const s = this.shurikens[i];
      s.update(dt, physicsWorld);
      if (!s.active) this.shurikens.splice(i, 1);
    }

    // 11. Fade Motion Blur Ghosts
    for (let i = this.slashGhosts.length - 1; i >= 0; i--) {
      this.slashGhosts[i].alpha -= dt * 3.5;
      if (this.slashGhosts[i].alpha <= 0) this.slashGhosts.splice(i, 1);
    }
  }

  _updateScarfPhysics(dt) {
    // Neck Anchor Point
    const neckX = this.x - this.facing * 4;
    const neckY = this.y + 16;
    this.scarfNodes[0].x = neckX;
    this.scarfNodes[0].y = neckY;

    // Wind & Velocity Drag
    const windX = -this.facing * (Math.abs(this.vx) * 0.08 + 120) + Math.sin(this.animTime * 10) * 25;
    const windY = -this.vy * 0.05 + 40 + Math.cos(this.animTime * 8) * 15;

    // Verlet Integration
    for (let i = 1; i < this.numScarfNodes; i++) {
      const node = this.scarfNodes[i];
      const vx = (node.x - node.oldX) * 0.88;
      const vy = (node.y - node.oldY) * 0.88;

      node.oldX = node.x;
      node.oldY = node.y;

      node.x += vx + windX * dt * 0.8;
      node.y += vy + windY * dt * 0.8;
    }

    // Distance Constraints (Keep segments connected)
    for (let iter = 0; iter < 4; iter++) {
      for (let i = 0; i < this.numScarfNodes - 1; i++) {
        const n1 = this.scarfNodes[i];
        const n2 = this.scarfNodes[i + 1];

        const dx = n2.x - n1.x;
        const dy = n2.y - n1.y;
        const dist = Math.hypot(dx, dy) || 1;
        const diff = (dist - this.scarfSegmentLength) / dist;

        if (i === 0) {
          n2.x -= dx * diff;
          n2.y -= dy * diff;
        } else {
          n1.x += dx * diff * 0.5;
          n1.y += dy * diff * 0.5;
          n2.x -= dx * diff * 0.5;
          n2.y -= dy * diff * 0.5;
        }
      }
    }
  }

  draw(ctx, camX, camY) {
    if (this.isDead) return;

    // Draw Motion Blur Ghosts
    for (const ghost of this.slashGhosts) {
      ctx.save();
      ctx.globalAlpha = ghost.alpha * 0.4;
      ctx.translate(ghost.x - camX, ghost.y - camY);
      this._drawNinjaSilhouette(ctx, ghost.facing, 0, false);
      ctx.restore();
    }

    const drawX = this.x - camX;
    const drawY = this.y - camY;

    ctx.save();
    ctx.translate(drawX, drawY);

    if (this.invulnerableTimer > 0 && Math.floor(this.animTime * 25) % 2 === 0) {
      ctx.globalAlpha = 0.4;
    }

    // 1. Draw Flowing Red Scarf Behind Ninja
    this._drawScarf(ctx, camX, camY);

    // 2. Draw Ninja Silhouette
    this._drawNinjaSilhouette(ctx, this.facing, this.somersaultAngle, this.isSlashing);

    // 3. Draw Katana Slash Crescent VFX
    if (this.isSlashing) {
      this._drawSlashVFX(ctx);
    }

    ctx.restore();

    // 4. Draw Active Shurikens
    for (const s of this.shurikens) {
      s.draw(ctx, camX, camY);
    }
  }

  _drawScarf(ctx, camX, camY) {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(this.scarfNodes[0].x - this.x, this.scarfNodes[0].y - this.y);

    for (let i = 1; i < this.numScarfNodes; i++) {
      const node = this.scarfNodes[i];
      ctx.lineTo(node.x - this.x, node.y - this.y);
    }

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 7;
    ctx.strokeStyle = '#dc2626'; // Vivid Ninja Arashi Crimson Scarf
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 12;
    ctx.stroke();

    // Inner highlight core
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#fca5a5';
    ctx.shadowBlur = 0;
    ctx.stroke();

    ctx.restore();
  }

  _drawNinjaSilhouette(ctx, facing, rotation = 0, isSlashing = false) {
    ctx.save();
    if (rotation !== 0) {
      ctx.translate(0, this.height / 2);
      ctx.rotate(rotation);
      ctx.translate(0, -this.height / 2);
    }

    ctx.scale(facing, 1);

    // High-contrast Pitch Black Silhouette
    ctx.fillStyle = '#05080f';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
    ctx.shadowBlur = 8;

    // --- Legs & Tabi Boots ---
    const runCycle = Math.sin(this.animTime * 14) * 8;
    const isMoving = Math.abs(this.vx) > 30 && this.isGrounded;

    // Back Leg
    ctx.beginPath();
    ctx.ellipse(isMoving ? -runCycle - 4 : -5, 46, 5, 10, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Front Leg
    ctx.beginPath();
    ctx.ellipse(isMoving ? runCycle + 4 : 5, 46, 5, 10, -0.2, 0, Math.PI * 2);
    ctx.fill();

    // --- Torso & Sash ---
    ctx.beginPath();
    ctx.roundRect(-9, 18, 18, 26, 4);
    ctx.fill();

    // Sash Knot Tie
    ctx.beginPath();
    ctx.ellipse(-8, 30, 4, 3, 0.4, 0, Math.PI * 2);
    ctx.fill();

    // --- Dual Katanas on Back ---
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#05080f';
    ctx.beginPath();
    ctx.moveTo(-6, 14);
    ctx.lineTo(-18, -4);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-3, 16);
    ctx.lineTo(-15, -2);
    ctx.stroke();

    // Katana Hilts (Gold/White wrap tips)
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.arc(-18, -4, 2, 0, Math.PI * 2);
    ctx.arc(-15, -2, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#05080f';

    // --- Head & Masked Cowl ---
    ctx.beginPath();
    ctx.arc(0, 12, 10, 0, Math.PI * 2);
    ctx.fill();

    // --- Conical Straw Hat (Kasa) ---
    ctx.beginPath();
    ctx.moveTo(-18, 8);
    ctx.lineTo(0, -2);
    ctx.lineTo(18, 8);
    ctx.closePath();
    ctx.fill();

    // Hat Brim Rim
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#1e293b';
    ctx.stroke();

    // --- Piercing Glowing Cyan Eye Slit ---
    ctx.fillStyle = '#38bdf8';
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.ellipse(4, 11, 4, 1.5, 0.1, 0, Math.PI * 2);
    ctx.fill();

    // Eye Glint Flare
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(5, 11, 1, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  _drawSlashVFX(ctx) {
    ctx.save();
    ctx.scale(this.facing, 1);

    // Glowing Cyan / Silver Crescent Blade Slash
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 24;

    const grad = ctx.createLinearGradient(0, -10, 50, 40);
    grad.addColorStop(0, 'rgba(56, 189, 248, 0)');
    grad.addColorStop(0.5, 'rgba(56, 189, 248, 0.9)');
    grad.addColorStop(1, '#ffffff');

    ctx.strokeStyle = grad;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(10, 24, 38, -Math.PI / 3, Math.PI / 2);
    ctx.stroke();

    // Inner blade spark
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore();
  }

  getAttackBox() {
    if (!this.isSlashing) return null;
    return {
      x: this.facing === 1 ? this.x : this.x - 64,
      y: this.y - 10,
      width: 64,
      height: 64,
      damage: 1,
      facing: this.facing
    };
  }
}
