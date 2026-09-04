import { Shuriken } from './Shuriken.js';

/**
 * NinjaArashiPlayer — Universal Dynamic Playable Hero Engine.
 * Supports all 6 playable heroes from character.zip:
 * - #01 Shadow Ninja: Pointed cowl hood, voluminous dual flowing red scarf, single katana.
 * - #02 Shadow Ronin: Conical straw Kasa hat, long black samurai haori robe, dual katanas.
 * - #03 Oni Warrior: Horned demon mask with glowing red eye, spiky armor, massive Kanabo club.
 * - #04 Cursed Monk: Floating levitation, glowing skull mask, orbiting dark curse prayer orbs.
 * - #05 Crimson Assassin: Split half-red half-black mask, dual curved Kama scythes.
 * - #06 Shadow Entity: Floating fractured obsidian shards orbiting a pulsing crimson void singularity.
 */
export class NinjaArashiPlayer {
  constructor(x = 120, y = 480, heroType = 'kage_ryu') {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;

    this.heroType = heroType;
    this.width = (heroType === 'ryujin' || heroType === 'oni_guard') ? 44 : 36;
    this.height = (heroType === 'ryujin' || heroType === 'oni_guard') ? 62 : 58;
    this.facing = 1;

    this.maxHealth = (heroType === 'ryujin' || heroType === 'oni_guard') ? 4 : 3;
    this.health = this.maxHealth;
    this.isDead = false;
    this.diamonds = 0;
    this.score = 0;

    // Movement Speeds (Fast, athletic Shinobi action)
    this.moveSpeed = 540;
    this.jumpForce = 550;
    this.doubleJumpForce = 500;
    this.gravity = 1280;
    this.dashSpeed = 1100;

    // Movement States
    this.isGrounded = false;
    this.canDoubleJump = true;
    this.isWallSliding = false;
    this.wallDir = 0;

    // Dash / Attack Action
    this.isDashing = false;
    this.dashTimer = 0;
    this.dashDuration = 0.22;
    this.dashCooldown = 0;
    this.ghosts = [];

    // Somersault Flip
    this.flipAngle = 0;
    this.isFlipping = false;

    // Shurikens / Projectiles
    this.shurikens = [];
    this.shurikenCooldown = 0;

    // Animation Time
    this.animTime = 0;

    // Verlet Scarf Ribbons for Kage-Ryu
    this.scarfLeft = [];
    this.scarfRight = [];
    this._initScarf();

    // Floating Shards
    this.entityShards = [];
    this._initEntityShards();

    // Visual Particles
    this.wallSparks = [];
    
    // Apply specific hero traits
    this.setHeroType(heroType);
  }

  setHeroType(heroType) {
    this.heroType = heroType;
    if (heroType === 'ryujin' || heroType === 'oni_guard') {
      this.width = 44;
      this.height = 62;
      this.maxHealth = 4;
      this.moveSpeed = 490;
      this.jumpForce = 530;
      this.dashSpeed = 1000;
    } else if (heroType === 'tsukuyomi' || heroType === 'crimson_assassin') {
      this.width = 34;
      this.height = 56;
      this.maxHealth = 3;
      this.moveSpeed = 580;
      this.jumpForce = 570;
      this.dashSpeed = 1220;
    } else if (heroType === 'raijin' || heroType === 'shadow_ronin') {
      this.width = 36;
      this.height = 58;
      this.maxHealth = 3;
      this.moveSpeed = 540;
      this.jumpForce = 550;
      this.dashSpeed = 1140;
    } else {
      // kage_ryu / shadow_ninja
      this.width = 36;
      this.height = 58;
      this.maxHealth = 3;
      this.moveSpeed = 550;
      this.jumpForce = 560;
      this.dashSpeed = 1160;
    }
    this.health = this.maxHealth;
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

  _initEntityShards() {
    this.entityShards = [];
    for (let i = 0; i < 12; i++) {
      this.entityShards.push({
        baseX: (Math.random() - 0.5) * 36,
        baseY: (Math.random() - 0.5) * 54,
        size: Math.random() * 6 + 4,
        phase: Math.random() * Math.PI * 2,
        rot: Math.random() * Math.PI
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
    this._initEntityShards();
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
      if (this.heroType === 'kage_ryu' || this.heroType === 'shadow_ninja') this._updateScarf(dt);
      return;
    }

    this.animTime += dt * 15;

    if (this.dashCooldown > 0) this.dashCooldown -= dt;
    if (this.shurikenCooldown > 0) this.shurikenCooldown -= dt;

    // 1. Dash Action
    if (this.isDashing) {
      this.dashTimer -= dt;
      this.vx = this.facing * this.dashSpeed;
      this.vy = 0;

      let ghostColor = '#a855f7'; // Kage-Ryu purple void
      if (this.heroType === 'ryujin' || this.heroType === 'oni_guard') {
        ghostColor = '#f97316'; // Ryujin molten flame
      } else if (this.heroType === 'raijin' || this.heroType === 'shadow_ronin') {
        ghostColor = '#38bdf8'; // Raijin lightning cyan
      } else if (this.heroType === 'tsukuyomi' || this.heroType === 'crimson_assassin') {
        ghostColor = '#f43f5e'; // Tsukuyomi crimson reaper
      }

      this.ghosts.push({
        x: this.x,
        y: this.y,
        facing: this.facing,
        life: 0.18,
        alpha: 0.75,
        color: ghostColor
      });

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
        this.vx = this.facing * this.moveSpeed * 0.75;
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
        this.vx *= 0.65;
        if (Math.abs(this.vx) < 10) this.vx = 0;
      }

      // 3. Dash Trigger
      if (input.isAttackJustPressed() && this.dashCooldown <= 0) {
        this.isDashing = true;
        this.dashTimer = this.dashDuration;
        this.dashCooldown = 0.55;
        if (audio) audio.playKatanaSlash();
        if (camera) camera.addShake(0.25);
      }

      // 4. Shuriken Trigger (Spawns at hand/chest level, not above head)
      if (input.isShurikenJustPressed() && this.shurikenCooldown <= 0) {
        this.shurikenCooldown = 0.28;
        const starX = this.x + (this.facing > 0 ? this.width + 4 : -4);
        const starY = this.y + 26;
        const star = new Shuriken(starX, starY, this.facing * 1050, 0);
        this.shurikens.push(star);
        if (audio) audio.playShurikenThrow();
      }

      // 5. Jump / Double Jump / Wall Kick (Strict single-press trigger)
      if (input.isJumpJustPressed()) {
        if (this.isGrounded) {
          this.vy = -this.jumpForce;
          this.isGrounded = false;
          this.canDoubleJump = true;
          if (audio) audio.playJump();
        } else if (this.isWallSliding) {
          this.vy = -this.jumpForce * 0.95;
          this.vx = -this.wallDir * this.moveSpeed * 1.15;
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

      // Gravity
      if (!this.isWallSliding) {
        this.vy += this.gravity * dt;
        if (this.vy > 820) this.vy = 820;
      } else {
        this.vy = 130;
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

    // 6. Physics Integration
    this._integratePhysics(dt, level, audio, camera);

    // 7. Shurikens
    for (let i = this.shurikens.length - 1; i >= 0; i--) {
      const star = this.shurikens[i];
      star.update(dt, level, audio, camera, this);
      if (star.isDead || !star.active) this.shurikens.splice(i, 1);
    }

    // 8. Ghosts & Sparks
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

    // 9. Scarf Update
    if (this.heroType === 'shadow_ninja') {
      this._updateScarf(dt);
    }

    // Somersault Rotation
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

    // Afterimages
    for (const g of this.ghosts) {
      ctx.save();
      ctx.globalAlpha = g.alpha * 0.45;
      ctx.fillStyle = g.color || '#dc2626';
      ctx.fillRect((g.x - camX), (g.y - camY), this.width, this.height);
      ctx.restore();
    }

    // Shurikens
    for (const star of this.shurikens) {
      star.draw(ctx, camX, camY);
    }

    // Wall sparks
    for (const p of this.wallSparks) {
      ctx.save();
      ctx.fillStyle = '#fbbf24';
      ctx.globalAlpha = p.life / 0.25;
      ctx.fillRect(p.x - camX, p.y - camY, 3, 3);
      ctx.restore();
    }

    // Scarf for Kage-Ryu
    if (this.heroType === 'kage_ryu' || this.heroType === 'shadow_ninja') {
      ctx.save();
      ctx.strokeStyle = '#991b1b';
      ctx.lineWidth = 4.5;
      ctx.lineCap = 'round';
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
    }

    // Draw Selected Playable Hero Sprite
    ctx.save();
    ctx.translate(px + this.width / 2, py + this.height / 2);
    ctx.scale(this.facing, 1);

    if (this.isFlipping) {
      ctx.rotate(this.flipAngle);
    }

    const isRunning = this.isGrounded && Math.abs(this.vx) > 20;
    const stride = isRunning ? Math.sin(this.animTime) : 0;
    const strideCos = isRunning ? Math.cos(this.animTime) : 0;

    const leanAngle = isRunning ? 0.35 : (this.isDashing ? 0.52 : 0);
    ctx.rotate(leanAngle);

    // =========================================================================
    // HERO 1: #01 KAGE-RYU (VOID SHADOW SHINOBI)
    // =========================================================================
    if (this.heroType === 'kage_ryu' || this.heroType === 'shadow_ninja') {
      // Scabbard on Back
      ctx.strokeStyle = '#1e1b1b';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(-10, 4);
      ctx.lineTo(-26, -6);
      ctx.stroke();

      // Body & Legs
      ctx.fillStyle = '#171717';
      // Back Leg
      ctx.beginPath();
      ctx.moveTo(-2, 10);
      ctx.lineTo(-6 - stride * 14, 20);
      ctx.lineTo(-8 - stride * 18, 29);
      ctx.lineTo(-2 - stride * 18, 29);
      ctx.closePath();
      ctx.fill();

      // Torso & Void Seams
      ctx.beginPath();
      ctx.moveTo(-11, -10);
      ctx.lineTo(11, -10);
      ctx.lineTo(8, 12);
      ctx.lineTo(-8, 12);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(-9, -10);
      ctx.lineTo(4, 12);
      ctx.stroke();

      // Obi Belt & Purple Void Jewel
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(-9, 2, 18, 4.5);
      ctx.fillStyle = '#a855f7';
      ctx.beginPath();
      ctx.moveTo(0, 1);
      ctx.lineTo(3.5, 4.5);
      ctx.lineTo(0, 8);
      ctx.lineTo(-3.5, 4.5);
      ctx.fill();

      // Front Leg
      ctx.fillStyle = '#171717';
      ctx.beginPath();
      ctx.moveTo(4, 10);
      ctx.lineTo(8 + stride * 14, 18);
      ctx.lineTo(10 + stride * 18, 29);
      ctx.lineTo(16 + stride * 18, 29);
      ctx.closePath();
      ctx.fill();

      // Cowl Hood & Mask
      ctx.beginPath();
      ctx.moveTo(2, -26);
      ctx.lineTo(-10, -18);
      ctx.lineTo(-9, -8);
      ctx.lineTo(11, -8);
      ctx.lineTo(12, -18);
      ctx.closePath();
      ctx.fill();

      // Glowing Crimson Eyes
      ctx.fillStyle = '#ef4444';
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 6;
      ctx.fillRect(4, -14, 6, 2.5);
      ctx.shadowBlur = 0;

      // Red Neck Cowl Ring
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.ellipse(2, -7, 10, 4.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Void Katana Blade
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 2.8;
      ctx.beginPath();
      ctx.moveTo(8, -1);
      ctx.lineTo(26, 14);
      ctx.stroke();
    }
    // =========================================================================
    // HERO 2: #02 RYUJIN (DRAGON-FLAME DEMONIC NINJA)
    // =========================================================================
    else if (this.heroType === 'ryujin' || this.heroType === 'oni_guard') {
      ctx.fillStyle = '#1e1b1b';

      // Heavy Dragon-Scale Plate Armor
      ctx.beginPath();
      ctx.moveTo(-16, -14);
      ctx.lineTo(16, -14);
      ctx.lineTo(14, 18);
      ctx.lineTo(-14, 18);
      ctx.closePath();
      ctx.fill();

      // Spiky Dragon Pauldrons
      ctx.fillStyle = '#292524';
      ctx.fillRect(-18, -14, 8, 12);
      ctx.fillRect(10, -14, 8, 12);

      // Molten Lava Glow Seams
      ctx.fillStyle = '#f97316';
      ctx.fillRect(-8, -4, 16, 2.5);
      ctx.fillRect(-6, 4, 12, 2.5);

      // Rope Belt
      ctx.fillStyle = '#78716c';
      ctx.fillRect(-14, 8, 28, 6);

      // Legs
      ctx.fillStyle = '#1c1917';
      ctx.fillRect(-12 - stride * 8, 18, 10, 14);
      ctx.fillRect(4 + stride * 8, 18, 10, 14);

      // Horned Oni Dragon Mask
      ctx.fillStyle = '#0c0a09';
      ctx.beginPath();
      ctx.arc(0, -20, 11, 0, Math.PI * 2);
      ctx.fill();

      // Dragon Horns
      ctx.fillStyle = '#ea580c';
      ctx.beginPath();
      ctx.moveTo(-8, -26);
      ctx.lineTo(-13, -38);
      ctx.lineTo(-3, -26);
      ctx.moveTo(8, -26);
      ctx.lineTo(13, -38);
      ctx.lineTo(3, -26);
      ctx.fill();

      // Glowing Fiery Eyes
      ctx.fillStyle = '#fbbf24';
      ctx.shadowColor = '#f97316';
      ctx.shadowBlur = 8;
      ctx.fillRect(2, -22, 6, 3);
      ctx.shadowBlur = 0;

      // Molten Flame Odachi Blade
      ctx.save();
      ctx.translate(12, 2);
      ctx.rotate(0.25);
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(0, -26);
      ctx.lineTo(16, 22);
      ctx.stroke();
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(0, -26);
      ctx.lineTo(16, 22);
      ctx.stroke();
      ctx.restore();
    }
    // =========================================================================
    // HERO 3: #03 RAIJIN (STORM LIGHTNING RONIN)
    // =========================================================================
    else if (this.heroType === 'raijin' || this.heroType === 'shadow_ronin') {
      ctx.fillStyle = '#0f172a';

      // Long Storm Samurai Robe / Haori
      ctx.beginPath();
      ctx.moveTo(-10, -10);
      ctx.lineTo(10, -10);
      ctx.lineTo(14, 24);
      ctx.lineTo(-14, 24);
      ctx.closePath();
      ctx.fill();

      // Electric Rune Glow Across Robe
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(-6, -6);
      ctx.lineTo(2, 6);
      ctx.lineTo(-4, 18);
      ctx.stroke();

      // Dual Katana Scabbards
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(-4, 0);
      ctx.lineTo(-24, 10);
      ctx.moveTo(-6, 4);
      ctx.lineTo(-26, 14);
      ctx.stroke();

      // Legs
      ctx.fillRect(-8 - stride * 8, 24, 6, 6);
      ctx.fillRect(4 + stride * 8, 24, 6, 6);

      // Conical Straw Kasa Hat
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.moveTo(0, -28);
      ctx.lineTo(-22, -14);
      ctx.lineTo(22, -14);
      ctx.closePath();
      ctx.fill();

      // Glowing Cyan Eye Visor Under Hat
      ctx.fillStyle = '#38bdf8';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 8;
      ctx.fillRect(2, -13, 6, 2.5);
      ctx.shadowBlur = 0;

      // Dual Lightning Ninjato Blades
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.moveTo(4, -2);
      ctx.lineTo(26, 8);
      ctx.moveTo(2, 4);
      ctx.lineTo(22, 18);
      ctx.stroke();
    }
    // =========================================================================
    // HERO 4: #04 TSUKUYOMI (CRIMSON KUNOICHI)
    // =========================================================================
    else {
      ctx.fillStyle = '#09090b';

      // Agile Kunoichi Bodysuit & Crimson Vest
      ctx.beginPath();
      ctx.moveTo(-8, -10);
      ctx.lineTo(8, -10);
      ctx.lineTo(6, 12);
      ctx.lineTo(-6, 12);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#e11d48';
      ctx.fillRect(-7, 2, 14, 4);

      // Legs
      ctx.fillStyle = '#09090b';
      ctx.fillRect(-6 - stride * 10, 12, 5, 14);
      ctx.fillRect(2 + stride * 10, 12, 5, 14);

      // Long Flowing Dark Ponytail with Red Ribbon
      ctx.strokeStyle = '#09090b';
      ctx.lineWidth = 4.5;
      ctx.beginPath();
      ctx.moveTo(-4, -22);
      const sway = Math.sin(this.animTime * 1.5) * 6 - (this.vx * 0.02);
      ctx.quadraticCurveTo(-18 + sway, -28, -28 + sway * 1.4, -14);
      ctx.stroke();

      // Red Hair Ribbon
      ctx.fillStyle = '#e11d48';
      ctx.fillRect(-6, -24, 4, 4);

      // Silver Porcelain Mask Face
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.arc(2, -18, 7, 0, Math.PI * 2);
      ctx.fill();

      // Glowing Ruby Eyes
      ctx.fillStyle = '#f43f5e';
      ctx.shadowColor = '#f43f5e';
      ctx.shadowBlur = 6;
      ctx.fillRect(4, -19, 4, 2);
      ctx.shadowBlur = 0;

      // Dual Curved Kama Sickle Scythes
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 2.8;
      ctx.beginPath();
      ctx.moveTo(4, 0);
      ctx.lineTo(20, 10);
      ctx.lineTo(24, 4);
      ctx.moveTo(-2, 4);
      ctx.lineTo(-14, 16);
      ctx.lineTo(-18, 10);
      ctx.stroke();
    }

    ctx.restore();
  }
}
