import { Shuriken } from './Shuriken.js';

/**
 * NinjaArashiPlayer — Official Protagonist: #01 Shadow Ninja
 * Based directly on Devil's Door character roster & high-res artwork:
 * - Pointed dark fabric ninja hood/cowl with black face mask
 * - Voluminous crimson scarf with dual 9-node Verlet cloth ribbons
 * - Sleeveless obsidian shinobi vest with red seam piping & obi belt with red diamond jewel
 * - Muscular bare arms with dark forearm wraps & red jewel bracers
 * - Katana in hand with horizontal sheath across lower back
 * - Chonchol Movement, Chaya Dash with ghost afterimages & 360° somersault flip
 */
export class NinjaArashiPlayer {
  constructor(x = 120, y = 480) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;

    this.width = 36;
    this.height = 58;
    this.facing = 1; // 1 = right, -1 = left

    // Stats & Collectibles
    this.maxHealth = 3;
    this.health = this.maxHealth;
    this.isDead = false;
    this.diamonds = 0;
    this.score = 0;

    // Movement Speeds (Chonchol Movement from Unity spec)
    this.moveSpeed = 330;
    this.jumpForce = 460;
    this.doubleJumpForce = 420;
    this.gravity = 1180;
    this.dashSpeed = 750;

    // Movement States
    this.isGrounded = false;
    this.canDoubleJump = true;
    this.isWallSliding = false;
    this.wallDir = 0;

    // Chaya Dash / Katana Slash
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

    // Procedural Skeletal Animation Time
    this.animTime = 0;

    // Dual 9-Node Verlet Cloth Scarf Ribbons (Exact match to artwork)
    this.scarfLeft = [];
    this.scarfRight = [];
    this._initScarf();

    // Visual Particles
    this.wallSparks = [];
  }

  _initScarf() {
    this.scarfLeft = [];
    this.scarfRight = [];
    for (let i = 0; i < 9; i++) {
      this.scarfLeft.push({
        x: this.x - i * 7,
        y: this.y + 14,
        oldX: this.x - i * 7,
        oldY: this.y + 14
      });
      this.scarfRight.push({
        x: this.x - i * 8,
        y: this.y + 16,
        oldX: this.x - i * 8,
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
    this.vx = -this.facing * 220;

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

    this.animTime += dt * 15;

    // Cooldown timers
    if (this.dashCooldown > 0) this.dashCooldown -= dt;
    if (this.shurikenCooldown > 0) this.shurikenCooldown -= dt;

    // 1. Chaya Dash Action (Dash & Cleave)
    if (this.isDashing) {
      this.dashTimer -= dt;
      this.vx = this.facing * this.dashSpeed;
      this.vy = 0;

      // Leave glowing crimson/golden ghost afterimages
      this.ghosts.push({
        x: this.x,
        y: this.y,
        facing: this.facing,
        life: 0.18,
        alpha: 0.75
      });

      // Cleave through nearby enemies
      if (level && level.enemies) {
        for (const enemy of level.enemies) {
          if (enemy.isDead) continue;
          const dist = Math.hypot(this.x - enemy.x, (this.y + 20) - (enemy.y + 20));
          if (dist < 100) {
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
        if (this.isGrounded && audio && Math.random() < 0.12) {
          audio.playFootstep();
        }
      } else {
        this.vx *= 0.7; // Friction
        if (Math.abs(this.vx) < 10) this.vx = 0;
      }

      // 3. Chaya Dash Trigger (Slash / J / Z / Click)
      if (input.isAttack() && this.dashCooldown <= 0) {
        this.isDashing = true;
        this.dashTimer = this.dashDuration;
        this.dashCooldown = 0.55;
        if (audio) audio.playKatanaSlash();
        if (camera) camera.addShake(0.25);
      }

      // 4. Shuriken Throw (Star / K / X)
      if (input.isShuriken && input.isShuriken() && this.shurikenCooldown <= 0) {
        this.shurikenCooldown = 0.35;
        const star = new Shuriken(this.x + this.facing * 24, this.y + 16, this.facing);
        this.shurikens.push(star);
        if (audio) audio.playShurikenThrow();
      }

      // 5. Jump / Double Jump / Wall Kick
      if (input.isJumpPressed()) {
        if (this.isGrounded) {
          this.vy = -this.jumpForce;
          this.isGrounded = false;
          this.canDoubleJump = true;
          if (audio) audio.playJump();
        } else if (this.isWallSliding) {
          // Wall leap
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
        this.vy = 130; // Wall slide descent
        // Spark particles
        if (Math.random() < 0.35) {
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
    const isRunning = this.isGrounded && Math.abs(this.vx) > 20;
    const forwardLean = isRunning ? 10 : 0;
    const neckX = this.x + 16 + (this.facing > 0 ? forwardLean - 8 : -forwardLean + 8);
    const neckY = this.y + 12;

    this.scarfLeft[0].x = neckX;
    this.scarfLeft[0].y = neckY;
    this.scarfRight[0].x = neckX - this.facing * 4;
    this.scarfRight[0].y = neckY + 3;

    const windForce = -this.facing * (Math.abs(this.vx) * 0.14 + 22);

    for (let i = 1; i < this.scarfLeft.length; i++) {
      const n1 = this.scarfLeft[i];
      const vx1 = (n1.x - n1.oldX) * 0.88;
      const vy1 = (n1.y - n1.oldY) * 0.88;
      n1.oldX = n1.x;
      n1.oldY = n1.y;
      n1.x += vx1 + windForce * dt;
      n1.y += vy1 + 45 * dt;

      const n2 = this.scarfRight[i];
      const vx2 = (n2.x - n2.oldX) * 0.88;
      const vy2 = (n2.y - n2.oldY) * 0.88;
      n2.oldX = n2.x;
      n2.oldY = n2.y;
      n2.x += vx2 + (windForce * 0.85) * dt;
      n2.y += vy2 + 55 * dt;
    }

    // Verlet distance constraints
    const targetDist = 7;
    for (let iter = 0; iter < 4; iter++) {
      for (let i = 1; i < this.scarfLeft.length; i++) {
        const prev1 = this.scarfLeft[i - 1];
        const curr1 = this.scarfLeft[i];
        const dx1 = curr1.x - prev1.x;
        const dy1 = curr1.y - prev1.y;
        const d1 = Math.hypot(dx1, dy1) || 1;
        const diff1 = (targetDist - d1) / d1;
        curr1.x += dx1 * diff1 * 0.75;
        curr1.y += dy1 * diff1 * 0.75;

        const prev2 = this.scarfRight[i - 1];
        const curr2 = this.scarfRight[i];
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

    // 1. Draw Golden/Crimson Dash Afterimages
    for (const g of this.ghosts) {
      ctx.save();
      ctx.globalAlpha = g.alpha * 0.45;
      ctx.fillStyle = '#dc2626';
      ctx.fillRect((g.x - camX), (g.y - camY), this.width, this.height);
      ctx.restore();
    }

    // 2. Draw Shurikens
    for (const star of this.shurikens) {
      star.draw(ctx, camX, camY);
    }

    // 3. Draw Wall Friction Sparks
    for (const p of this.wallSparks) {
      ctx.save();
      ctx.fillStyle = '#fbbf24';
      ctx.globalAlpha = p.life / 0.25;
      ctx.fillRect(p.x - camX, p.y - camY, 3, 3);
      ctx.restore();
    }

    // 4. Draw Dramatic Flowing Crimson Scarf Ribbons (#01 Shadow Ninja Artwork)
    ctx.save();
    ctx.strokeStyle = '#991b1b';
    ctx.lineWidth = 4.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(this.scarfLeft[0].x - camX, this.scarfLeft[0].y - camY);
    for (let i = 1; i < this.scarfLeft.length; i++) {
      ctx.lineTo(this.scarfLeft[i].x - camX, this.scarfLeft[i].y - camY);
    }
    ctx.stroke();

    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.moveTo(this.scarfRight[0].x - camX, this.scarfRight[0].y - camY);
    for (let i = 1; i < this.scarfRight.length; i++) {
      ctx.lineTo(this.scarfRight[i].x - camX, this.scarfRight[i].y - camY);
    }
    ctx.stroke();
    ctx.restore();

    // 5. Draw Official #01 Shadow Ninja Character Sprite
    ctx.save();
    ctx.translate(px + this.width / 2, py + this.height / 2);
    ctx.scale(this.facing, 1);

    if (this.isFlipping) {
      ctx.rotate(this.flipAngle);
    }

    const isRunning = this.isGrounded && Math.abs(this.vx) > 20;
    const stride = isRunning ? Math.sin(this.animTime) : 0;
    const strideCos = isRunning ? Math.cos(this.animTime) : 0;

    // Forward sprint lean angle (35°)
    const leanAngle = isRunning ? 0.35 : (this.isDashing ? 0.52 : 0);
    ctx.rotate(leanAngle);

    // ----------------------------------------------------
    // (A) Horizontal Scabbard on Lower Back (Artwork match)
    // ----------------------------------------------------
    ctx.save();
    ctx.strokeStyle = '#1e1b1b';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-10, 4);
    ctx.lineTo(-26, -6);
    ctx.stroke();
    // Red scabbard wrapping & gold tip
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(-20, -3, 8, 3);
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(-28, -7, 3, 3);
    ctx.restore();

    // ----------------------------------------------------
    // (B) Back Leg & Kyahan Calf Wraps
    // ----------------------------------------------------
    ctx.fillStyle = '#171717';
    ctx.beginPath();
    if (!this.isGrounded) {
      // Leaping tuck back leg
      ctx.moveTo(-2, 10);
      ctx.lineTo(-14, 18);
      ctx.lineTo(-10, 28);
      ctx.lineTo(-4, 26);
    } else if (isRunning) {
      // Full stride extension
      ctx.moveTo(-2, 10);
      ctx.lineTo(-6 - stride * 14, 20);
      ctx.lineTo(-8 - stride * 18, 29);
      ctx.lineTo(-2 - stride * 18, 29);
    } else {
      // Idle
      ctx.moveTo(-3, 10);
      ctx.lineTo(-7, 22);
      ctx.lineTo(-5, 29);
      ctx.lineTo(-1, 29);
    }
    ctx.closePath();
    ctx.fill();

    // Red piping on back leg
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 1;
    ctx.stroke();

    // ----------------------------------------------------
    // (C) Obsidian Shinobi Vest Tunic & Red Seam Piping
    // ----------------------------------------------------
    ctx.fillStyle = '#171717';
    ctx.beginPath();
    ctx.moveTo(-11, -10);
    ctx.lineTo(11, -10);
    ctx.lineTo(8, 12);
    ctx.lineTo(-8, 12);
    ctx.closePath();
    ctx.fill();

    // Diagonal Red Seam Piping (Artwork signature)
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(-9, -10);
    ctx.lineTo(4, 12);
    ctx.moveTo(9, -10);
    ctx.lineTo(-4, 12);
    ctx.stroke();

    // Black Obi Belt & Glowing Red Diamond Jewel Clasp
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(-9, 2, 18, 4.5);
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(0, 1);
    ctx.lineTo(3.5, 4.5);
    ctx.lineTo(0, 8);
    ctx.lineTo(-3.5, 4.5);
    ctx.closePath();
    ctx.fill();

    // ----------------------------------------------------
    // (D) Front Leg & Tabi Boot
    // ----------------------------------------------------
    ctx.fillStyle = '#171717';
    ctx.beginPath();
    if (!this.isGrounded) {
      // Leaping forward knee
      ctx.moveTo(4, 10);
      ctx.lineTo(14, 18);
      ctx.lineTo(18, 26);
      ctx.lineTo(12, 28);
    } else if (isRunning) {
      // Sprint forward stride
      ctx.moveTo(4, 10);
      ctx.lineTo(8 + stride * 14, 18);
      ctx.lineTo(10 + stride * 18, 29);
      ctx.lineTo(16 + stride * 18, 29);
    } else {
      // Idle
      ctx.moveTo(2, 10);
      ctx.lineTo(6, 22);
      ctx.lineTo(8, 29);
      ctx.lineTo(4, 29);
    }
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 1;
    ctx.stroke();

    // ----------------------------------------------------
    // (E) Pointed Fabric Ninja Cowl Hood & Face Mask
    // ----------------------------------------------------
    ctx.fillStyle = '#171717';
    ctx.beginPath();
    ctx.moveTo(2, -26); // Pointed top hood peak
    ctx.lineTo(-10, -18);
    ctx.lineTo(-9, -8);
    ctx.lineTo(11, -8);
    ctx.lineTo(12, -18);
    ctx.closePath();
    ctx.fill();

    // Mask Face Wrap
    ctx.fillStyle = '#0a0a0a';
    ctx.beginPath();
    ctx.arc(3, -13, 6, 0, Math.PI * 2);
    ctx.fill();

    // Red Hood Trim
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(2, -26);
    ctx.lineTo(12, -18);
    ctx.stroke();

    // Intense Shinobi Eyes
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(4, -14, 5, 2);
    ctx.fillStyle = '#38bdf8';
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 6;
    ctx.fillRect(6, -14, 2.5, 2);
    ctx.shadowBlur = 0;

    // Thick Crimson Scarf Collar Ring (Neck cowl)
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.ellipse(2, -7, 10, 4.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#991b1b';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // ----------------------------------------------------
    // (F) Muscular Bare Arms & Katana in Hand
    // ----------------------------------------------------
    // Bare Shoulder / Arm
    ctx.fillStyle = '#b45309'; // Warm skin tone
    ctx.beginPath();
    ctx.arc(2, -7, 4, 0, Math.PI * 2);
    ctx.fill();

    // Arm Bracers with Red Gem
    ctx.fillStyle = '#171717';
    if (this.isDashing) {
      // Extended katana thrust pose
      ctx.fillRect(4, -9, 14, 5);
      // Red Gem on bracer
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(10, -8, 3, 3);

      // Gleaming Steel Katana Blade
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(18, -6);
      ctx.lineTo(44, -6);
      ctx.stroke();

      // Golden Katana Arc
      ctx.save();
      ctx.strokeStyle = '#fbbf24';
      ctx.shadowColor = '#fbbf24';
      ctx.shadowBlur = 22;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(28, 0, 46, -Math.PI * 0.35, Math.PI * 0.35, false);
      ctx.stroke();
      ctx.restore();
    } else if (!this.isGrounded) {
      // Leaping arm
      ctx.fillRect(4, -14, 10, 5);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(8, -13, 3, 3);
    } else if (isRunning) {
      // Running arm pump
      ctx.fillRect(2 + strideCos * 8, -4, 10, 5);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(5 + strideCos * 8, -3, 3, 3);

      // Katana held in hand angled down
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(10 + strideCos * 8, -2);
      ctx.lineTo(26 + strideCos * 8, 12);
      ctx.stroke();
    } else {
      // Idle hand on Katana
      ctx.fillRect(0, -3, 10, 5);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(3, -2, 3, 3);

      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(8, -1);
      ctx.lineTo(24, 16);
      ctx.stroke();
    }

    ctx.restore();
  }
}
