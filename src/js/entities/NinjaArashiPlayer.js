import { Shuriken } from './Shuriken.js';

/**
 * NinjaArashiPlayer — Authentic Ninja Arashi 2 Sketch & Silhouette Gameplay Engine.
 * Features high-definition hand-crafted ninja silhouettes for all 4 official heroes:
 * - 01 KAGE-RYU: Void Shadow Shinobi (Pointed Cowl, 16-Node Flowing Crimson Scarf, Dual Katana Sheaths, Piercing Red Eyes)
 * - 02 RYUJIN: Dragon-Flame Oni Ninja (Curved Demon Horns, Spiked Pauldrons, Magma Fissure Chestplate, Greatsword)
 * - 03 RAIJIN: Storm Lightning Ronin (Conical Woven Kasa Hat, Billowing Samurai Haori Coat, Dual Daisho, Cyan Eyes)
 * - 04 TSUKUYOMI: Crimson Kunoichi (High Collar, Split Mask, Dual Kama Sickles, Flowing Twin Ribbons, Ruby Eyes)
 */
export class NinjaArashiPlayer {
  constructor(x = 120, y = 480, heroType = 'kage_ryu') {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;

    this.heroType = heroType;
    this.width = 44;
    this.height = 68;
    this.facing = 1;

    this.maxHealth = 3;
    this.health = this.maxHealth;
    this.isDead = false;
    this.diamonds = 0;
    this.score = 0;

    // Movement Speeds (Fluid, athletic Ninja Arashi physics)
    this.moveSpeed = 540;
    this.jumpForce = 560;
    this.doubleJumpForce = 510;
    this.gravity = 1260;
    this.dashSpeed = 1150;

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

    // Animation Timing
    this.animTime = 0;

    // Verlet Multi-Node Cloth Simulation for Scarves, Robes & Ribbons
    this.clothNodes = [];
    this._initClothNodes();

    // Visual Particles (Sparks, Dust, Smoke)
    this.wallSparks = [];
    this.footDust = [];

    this.setHeroType(heroType);
  }

  setCharacter(charId) {
    this.setHeroType(charId);
  }

  setHeroType(heroType) {
    this.heroType = heroType || 'kage_ryu';
    if (this.heroType === 'ryujin' || this.heroType === 'oni_guard') {
      this.width = 48;
      this.height = 72;
      this.maxHealth = 4;
      this.moveSpeed = 500;
      this.jumpForce = 540;
      this.dashSpeed = 1080;
    } else if (this.heroType === 'tsukuyomi' || this.heroType === 'crimson_assassin') {
      this.width = 40;
      this.height = 66;
      this.maxHealth = 3;
      this.moveSpeed = 570;
      this.jumpForce = 575;
      this.dashSpeed = 1220;
    } else if (this.heroType === 'raijin' || this.heroType === 'shadow_ronin') {
      this.width = 44;
      this.height = 68;
      this.maxHealth = 3;
      this.moveSpeed = 540;
      this.jumpForce = 560;
      this.dashSpeed = 1160;
    } else {
      // kage_ryu / shadow_ninja
      this.width = 44;
      this.height = 68;
      this.maxHealth = 3;
      this.moveSpeed = 550;
      this.jumpForce = 565;
      this.dashSpeed = 1180;
    }
    this.health = this.maxHealth;
    this._initClothNodes();
  }

  _initClothNodes() {
    this.clothNodes = [];
    const numRibbons = 2;
    const nodesPerRibbon = 14;

    for (let r = 0; r < numRibbons; r++) {
      const ribbon = [];
      for (let i = 0; i < nodesPerRibbon; i++) {
        ribbon.push({
          x: this.x - i * 6,
          y: this.y + 16 + r * 4,
          oldX: this.x - i * 6,
          oldY: this.y + 16 + r * 4
        });
      }
      this.clothNodes.push(ribbon);
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
    this.footDust = [];
    this._initClothNodes();
  }

  takeDamage(amount = 1, audio = null, camera = null) {
    if (this.isDead || this.isDashing) return;
    this.health -= amount;
    this.vy = -260;
    this.vx = -this.facing * 240;

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
    this.vy = -290;

    if (camera) camera.addShake(0.7);
    if (audio) audio.playPlayerDeath();
  }

  update(dt, input, level, audio, camera) {
    if (this.isDead) {
      this.vy += this.gravity * dt;
      this.y += this.vy * dt;
      this._updateCloth(dt);
      return;
    }

    this.animTime += dt * 14;

    if (this.dashCooldown > 0) this.dashCooldown -= dt;
    if (this.shurikenCooldown > 0) this.shurikenCooldown -= dt;

    // 1. Dash Action
    if (this.isDashing) {
      this.dashTimer -= dt;
      this.vx = this.facing * this.dashSpeed;
      this.vy = 0;

      let ghostColor = '#a855f7';
      if (this.heroType === 'ryujin' || this.heroType === 'oni_guard') {
        ghostColor = '#f97316';
      } else if (this.heroType === 'raijin' || this.heroType === 'shadow_ronin') {
        ghostColor = '#38bdf8';
      } else if (this.heroType === 'tsukuyomi' || this.heroType === 'crimson_assassin') {
        ghostColor = '#f43f5e';
      }

      this.ghosts.push({
        x: this.x,
        y: this.y,
        facing: this.facing,
        life: 0.2,
        alpha: 0.8,
        color: ghostColor,
        heroType: this.heroType
      });

      if (level && level.enemies) {
        for (const enemy of level.enemies) {
          if (enemy.isDead) continue;
          const dist = Math.hypot(this.x - enemy.x, (this.y + 24) - (enemy.y + 24));
          if (dist < 110) {
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
        this.dashCooldown = 0.52;
        if (audio) audio.playKatanaSlash();
        if (camera) camera.addShake(0.25);
      }

      // 4. Shuriken Trigger
      if (input.isShurikenJustPressed() && this.shurikenCooldown <= 0) {
        this.shurikenCooldown = 0.26;
        const starX = this.x + (this.facing > 0 ? this.width + 8 : -8);
        const starY = this.y + 28;
        const star = new Shuriken(starX, starY, this.facing * 1100, 0);
        this.shurikens.push(star);
        if (audio) audio.playShurikenThrow();
      }

      // 5. Jump / Double Jump / Wall Kick
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

      // Gravity & Wall Sliding
      if (!this.isWallSliding) {
        this.vy += this.gravity * dt;
        if (this.vy > 840) this.vy = 840;
      } else {
        this.vy = 135;
        if (Math.random() < 0.4) {
          this.wallSparks.push({
            x: this.x + (this.wallDir > 0 ? this.width : 0),
            y: this.y + 38,
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

    // 8. Particle Lifecycle
    for (let i = this.ghosts.length - 1; i >= 0; i--) {
      const g = this.ghosts[i];
      g.life -= dt;
      g.alpha = g.life / 0.2;
      if (g.life <= 0) this.ghosts.splice(i, 1);
    }

    for (let i = this.wallSparks.length - 1; i >= 0; i--) {
      const p = this.wallSparks[i];
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.life <= 0) this.wallSparks.splice(i, 1);
    }

    // 9. Cloth Verlet Physics Update
    this._updateCloth(dt);

    // 10. Somersault Rotation
    if (this.isFlipping) {
      this.flipAngle += this.facing * Math.PI * 5.4 * dt;
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

  _updateCloth(dt) {
    if (!this.clothNodes || this.clothNodes.length === 0) return;

    const isRunning = this.isGrounded && Math.abs(this.vx) > 20;
    const forwardLean = isRunning ? 12 : (this.isDashing ? 18 : 0);
    const anchorX = this.x + (this.width / 2) + (this.facing > 0 ? forwardLean - 10 : -forwardLean + 10);
    const anchorY = this.y + 18;

    const windForce = -this.facing * (Math.abs(this.vx) * 0.16 + 26);
    const targetDist = 7;

    for (let r = 0; r < this.clothNodes.length; r++) {
      const ribbon = this.clothNodes[r];
      ribbon[0].x = anchorX - this.facing * (r * 3);
      ribbon[0].y = anchorY + r * 3;

      for (let i = 1; i < ribbon.length; i++) {
        const n = ribbon[i];
        const vx = (n.x - n.oldX) * 0.86;
        const vy = (n.y - n.oldY) * 0.86;
        n.oldX = n.x;
        n.oldY = n.y;
        n.x += vx + windForce * dt;
        n.y += vy + (45 + r * 10) * dt;
      }

      // Relaxation constraints
      for (let iter = 0; iter < 4; iter++) {
        for (let i = 1; i < ribbon.length; i++) {
          const prev = ribbon[i - 1];
          const curr = ribbon[i];
          const dx = curr.x - prev.x;
          const dy = curr.y - prev.y;
          const dist = Math.hypot(dx, dy) || 1;
          const diff = (targetDist - dist) / dist;
          curr.x += dx * diff * 0.75;
          curr.y += dy * diff * 0.75;
        }
      }
    }
  }

  draw(ctx, camX, camY) {
    const px = this.x - camX;
    const py = this.y - camY;

    // 1. Afterimages (Motion Blur on Dash)
    for (const g of this.ghosts) {
      ctx.save();
      ctx.globalAlpha = g.alpha * 0.5;
      ctx.fillStyle = g.color || '#a855f7';
      ctx.fillRect((g.x - camX), (g.y - camY), this.width, this.height);
      ctx.restore();
    }

    // 2. Projectiles (Shurikens)
    for (const star of this.shurikens) {
      star.draw(ctx, camX, camY);
    }

    // 3. Wall Sparks
    for (const p of this.wallSparks) {
      ctx.save();
      ctx.fillStyle = '#fbbf24';
      ctx.globalAlpha = p.life / 0.25;
      ctx.fillRect(p.x - camX, p.y - camY, 3.5, 3.5);
      ctx.restore();
    }

    // 4. Multi-Node Dynamic Flowing Scarf / Cloth (Authentic Ninja Arashi Ribbon)
    if (this.clothNodes && this.clothNodes.length > 0) {
      ctx.save();
      const isKage = (this.heroType === 'kage_ryu' || this.heroType === 'shadow_ninja');
      const isRaijin = (this.heroType === 'raijin' || this.heroType === 'shadow_ronin');
      const isTsukuyomi = (this.heroType === 'tsukuyomi' || this.heroType === 'crimson_assassin');
      const isRyujin = (this.heroType === 'ryujin' || this.heroType === 'oni_guard');

      let col1 = '#991b1b';
      let col2 = '#ef4444';
      let lineWidth = 5.5;

      if (isRaijin) {
        col1 = '#0f172a';
        col2 = '#1e293b';
        lineWidth = 6.5;
      } else if (isTsukuyomi) {
        col1 = '#881337';
        col2 = '#f43f5e';
        lineWidth = 4.5;
      } else if (isRyujin) {
        col1 = '#451a03';
        col2 = '#ea580c';
        lineWidth = 6.0;
      }

      for (let r = 0; r < this.clothNodes.length; r++) {
        const ribbon = this.clothNodes[r];
        ctx.strokeStyle = r === 0 ? col1 : col2;
        ctx.lineWidth = lineWidth - r * 1.2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();
        ctx.moveTo(ribbon[0].x - camX, ribbon[0].y - camY);
        for (let i = 1; i < ribbon.length - 1; i++) {
          const xc = (ribbon[i].x + ribbon[i + 1].x) / 2 - camX;
          const yc = (ribbon[i].y + ribbon[i + 1].y) / 2 - camY;
          ctx.quadraticCurveTo(ribbon[i].x - camX, ribbon[i].y - camY, xc, yc);
        }
        ctx.stroke();
      }
      ctx.restore();
    }

    // 5. Draw Master Ninja Arashi Sketch Character
    ctx.save();
    ctx.translate(px + this.width / 2, py + this.height / 2);
    ctx.scale(this.facing, 1);

    if (this.isFlipping) {
      ctx.rotate(this.flipAngle);
    }

    const isRunning = this.isGrounded && Math.abs(this.vx) > 20;
    const stride = isRunning ? Math.sin(this.animTime) : 0;
    const strideCos = isRunning ? Math.cos(this.animTime) : 0;
    const leanAngle = isRunning ? 0.32 : (this.isDashing ? 0.48 : 0);
    ctx.rotate(leanAngle);

    // =========================================================================
    // HERO 01: #01 KAGE-RYU (AUTHENTIC VOID SHADOW SHINOBI SKETCH)
    // =========================================================================
    if (this.heroType === 'kage_ryu' || this.heroType === 'shadow_ninja') {
      // 1. Dual Katana Scabbards on Back
      ctx.strokeStyle = '#18181b';
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-10, 8);
      ctx.lineTo(-28, -8);
      ctx.moveTo(-6, 12);
      ctx.lineTo(-24, -4);
      ctx.stroke();

      // Scabbard Gold Mounts & Tsuka Handles
      ctx.fillStyle = '#a855f7';
      ctx.fillRect(-30, -12, 5, 4);
      ctx.fillRect(-26, -8, 5, 4);

      // 2. Back Leg (Running Striding)
      ctx.fillStyle = '#09090b';
      ctx.beginPath();
      ctx.moveTo(-4, 12);
      ctx.lineTo(-8 - stride * 18, 24);
      ctx.lineTo(-12 - stride * 22, 34);
      ctx.lineTo(-4 - stride * 22, 34);
      ctx.closePath();
      ctx.fill();

      // Back Tabi Boot & Shin Wrap
      ctx.strokeStyle = '#27272a';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(-9 - stride * 20, 26);
      ctx.lineTo(-6 - stride * 20, 32);
      ctx.stroke();

      // 3. Torso, Shinobi Gi & Armor Plates
      ctx.fillStyle = '#18181b';
      ctx.beginPath();
      ctx.moveTo(-13, -12);
      ctx.lineTo(13, -12);
      ctx.lineTo(10, 14);
      ctx.lineTo(-10, 14);
      ctx.closePath();
      ctx.fill();

      // Chest Cross-Harness & Kunai Holsters
      ctx.strokeStyle = '#3f3f46';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(-11, -10);
      ctx.lineTo(8, 14);
      ctx.moveTo(11, -10);
      ctx.lineTo(-8, 14);
      ctx.stroke();

      // Throwing Kunai on Chest
      ctx.fillStyle = '#e4e4e7';
      ctx.beginPath();
      ctx.moveTo(0, -6);
      ctx.lineTo(3, -2);
      ctx.lineTo(-3, -2);
      ctx.fill();

      // Crimson Obi Sash & Void Gem
      ctx.fillStyle = '#991b1b';
      ctx.fillRect(-11, 4, 22, 6);
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(-4, 4, 8, 6);
      ctx.fillStyle = '#c084fc';
      ctx.beginPath();
      ctx.arc(0, 7, 3, 0, Math.PI * 2);
      ctx.fill();

      // 4. Front Leg (Athletic Ninja Knee Flexion)
      ctx.fillStyle = '#18181b';
      ctx.beginPath();
      ctx.moveTo(4, 12);
      ctx.lineTo(10 + stride * 18, 22);
      ctx.lineTo(14 + stride * 22, 34);
      ctx.lineTo(20 + stride * 22, 34);
      ctx.closePath();
      ctx.fill();

      // Front Knee Armor & Tabi Split-Toe
      ctx.fillStyle = '#27272a';
      ctx.beginPath();
      ctx.arc(10 + stride * 18, 22, 4, 0, Math.PI * 2);
      ctx.fill();

      // 5. Cowl Hood & Shadow Mask
      ctx.fillStyle = '#09090b';
      ctx.beginPath();
      ctx.moveTo(4, -34); // Peak of cowl
      ctx.lineTo(-12, -22);
      ctx.lineTo(-11, -8);
      ctx.lineTo(13, -8);
      ctx.lineTo(14, -22);
      ctx.closePath();
      ctx.fill();

      // Piercing Glowing Red Ninja Eyes
      ctx.fillStyle = '#ef4444';
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(4, -18);
      ctx.lineTo(12, -18);
      ctx.lineTo(10, -15);
      ctx.lineTo(2, -15);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;

      // Crimson Neck Scarf Collar
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.ellipse(2, -8, 12, 5.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // 6. Arms & Katana Combat Pose
      ctx.fillStyle = '#18181b';
      ctx.beginPath();
      ctx.moveTo(8, -8);
      ctx.lineTo(18, 2);
      ctx.lineTo(14, 12);
      ctx.fill();

      // Silver Katana Blade
      ctx.strokeStyle = '#f4f4f5';
      ctx.lineWidth = 3.2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(14, 8);
      ctx.lineTo(34, 22);
      ctx.stroke();

      // Void Purple Energy Edge
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(14, 8);
      ctx.lineTo(34, 22);
      ctx.stroke();
    }

    // =========================================================================
    // HERO 02: #02 RYUJIN (AUTHENTIC ONI DRAGON DEMON NINJA SKETCH)
    // =========================================================================
    else if (this.heroType === 'ryujin' || this.heroType === 'oni_guard') {
      // 1. Massive Serrated Flame Greatsword on Back
      ctx.strokeStyle = '#ea580c';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(-10, 14);
      ctx.lineTo(-30, -18);
      ctx.stroke();

      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(-10, 14);
      ctx.lineTo(-30, -18);
      ctx.stroke();

      // 2. Heavy Spiked Iron Pauldrons (Shoulders)
      ctx.fillStyle = '#27272a';
      ctx.fillRect(-18, -16, 10, 14);
      ctx.fillRect(8, -16, 10, 14);

      // Pauldron Spikes
      ctx.fillStyle = '#ea580c';
      ctx.beginPath();
      ctx.moveTo(-18, -16);
      ctx.lineTo(-24, -22);
      ctx.lineTo(-14, -16);
      ctx.moveTo(14, -16);
      ctx.lineTo(20, -22);
      ctx.lineTo(10, -16);
      ctx.fill();

      // 3. Heavy Armored Torso with Magma Cracks
      ctx.fillStyle = '#18181b';
      ctx.beginPath();
      ctx.moveTo(-15, -14);
      ctx.lineTo(15, -14);
      ctx.lineTo(12, 16);
      ctx.lineTo(-12, 16);
      ctx.closePath();
      ctx.fill();

      // Glowing Magma Fissures
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 2.2;
      ctx.shadowColor = '#f97316';
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.moveTo(-8, -8);
      ctx.lineTo(0, 0);
      ctx.lineTo(-4, 8);
      ctx.moveTo(6, -6);
      ctx.lineTo(2, 6);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Braided Shimenawa Demon Rope Belt
      ctx.fillStyle = '#71717a';
      ctx.fillRect(-15, 6, 30, 8);
      ctx.fillStyle = '#ea580c';
      ctx.beginPath();
      ctx.arc(0, 10, 4.5, 0, Math.PI * 2);
      ctx.fill();

      // 4. Heavy Armored Legs
      ctx.fillStyle = '#09090b';
      ctx.fillRect(-12 - stride * 14, 16, 11, 18);
      ctx.fillRect(3 + stride * 14, 16, 11, 18);

      // Spiked Greaves
      ctx.fillStyle = '#27272a';
      ctx.fillRect(-12 - stride * 14, 26, 11, 8);
      ctx.fillRect(3 + stride * 14, 26, 11, 8);

      // 5. Horned Oni Kabuto Helmet
      ctx.fillStyle = '#09090b';
      ctx.beginPath();
      ctx.arc(0, -22, 13, 0, Math.PI * 2);
      ctx.fill();

      // Twin Curved Demon Horns
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.moveTo(-7, -28);
      ctx.quadraticCurveTo(-16, -42, -18, -46);
      ctx.quadraticCurveTo(-11, -38, -2, -28);
      ctx.moveTo(7, -28);
      ctx.quadraticCurveTo(16, -42, 18, -46);
      ctx.quadraticCurveTo(11, -38, 2, -28);
      ctx.fill();

      // Glowing Molten Demon Eye
      ctx.fillStyle = '#fbbf24';
      ctx.shadowColor = '#f97316';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(4, -20, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // =========================================================================
    // HERO 03: #03 RAIJIN (AUTHENTIC LIGHTNING RONIN SKETCH)
    // =========================================================================
    else if (this.heroType === 'raijin' || this.heroType === 'shadow_ronin') {
      // 1. Dual Daisho Katanas at Waist
      ctx.strokeStyle = '#27272a';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(-6, 2);
      ctx.lineTo(-28, 12);
      ctx.moveTo(-8, 7);
      ctx.lineTo(-30, 17);
      ctx.stroke();

      // Silver Tsuba Handguards
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(-4, 0, 4, 6);
      ctx.fillRect(-6, 5, 4, 6);

      // 2. Billowing Samurai Haori Robe
      ctx.fillStyle = '#09090b';
      ctx.beginPath();
      ctx.moveTo(-12, -10);
      ctx.lineTo(12, -10);
      ctx.lineTo(18, 26);
      ctx.lineTo(-18, 26);
      ctx.closePath();
      ctx.fill();

      // Electric Lightning Runes Across Robe
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.8;
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.moveTo(-8, -4);
      ctx.lineTo(0, 8);
      ctx.lineTo(-6, 20);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // 3. Hakama Trousers & Straw Waraji
      ctx.fillStyle = '#18181b';
      ctx.fillRect(-10 - stride * 14, 26, 8, 8);
      ctx.fillRect(4 + stride * 14, 26, 8, 8);

      // 4. Conical Straw Kasa Hat (Detailed Woven Sketch)
      ctx.fillStyle = '#1c1917';
      ctx.beginPath();
      ctx.moveTo(0, -32);
      ctx.lineTo(-24, -14);
      ctx.lineTo(24, -14);
      ctx.closePath();
      ctx.fill();

      // Hat Weave Cross-Hatch Lines
      ctx.strokeStyle = '#44403c';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(0, -32);
      ctx.lineTo(-12, -14);
      ctx.moveTo(0, -32);
      ctx.lineTo(12, -14);
      ctx.stroke();

      // Piercing Cyan Storm Eyes Under Hat Brim
      ctx.fillStyle = '#38bdf8';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(2, -14);
      ctx.lineTo(10, -14);
      ctx.lineTo(8, -11);
      ctx.lineTo(0, -11);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;

      // 5. Electric Ninjato Combat Stance
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.moveTo(10, 0);
      ctx.lineTo(30, 10);
      ctx.stroke();
    }

    // =========================================================================
    // HERO 04: #04 TSUKUYOMI (AUTHENTIC CRIMSON KUNOICHI SKETCH)
    // =========================================================================
    else {
      // 1. Dual Curved Kama Sickle Blades on Hips
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.moveTo(6, 4);
      ctx.lineTo(24, 14);
      ctx.lineTo(28, 6);
      ctx.moveTo(-4, 8);
      ctx.lineTo(-20, 20);
      ctx.lineTo(-24, 12);
      ctx.stroke();

      // 2. High-Collar Kunoichi Bodysuit
      ctx.fillStyle = '#09090b';
      ctx.beginPath();
      ctx.moveTo(-10, -12);
      ctx.lineTo(10, -12);
      ctx.lineTo(7, 14);
      ctx.lineTo(-7, 14);
      ctx.closePath();
      ctx.fill();

      // Crimson Corset Piping & Sash
      ctx.fillStyle = '#e11d48';
      ctx.fillRect(-8, 2, 16, 5);

      // 3. Athletic Ninja Legs & Bladed Greaves
      ctx.fillStyle = '#09090b';
      ctx.beginPath();
      ctx.moveTo(-6, 14);
      ctx.lineTo(-10 - stride * 16, 24);
      ctx.lineTo(-12 - stride * 20, 34);
      ctx.lineTo(-5 - stride * 20, 34);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(4, 14);
      ctx.lineTo(8 + stride * 16, 24);
      ctx.lineTo(12 + stride * 20, 34);
      ctx.lineTo(19 + stride * 20, 34);
      ctx.fill();

      // 4. Split Porcelain / Crimson Mask
      ctx.fillStyle = '#e2e8f0'; // Porcelain White Half
      ctx.beginPath();
      ctx.arc(2, -20, 9, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#e11d48'; // Crimson Half
      ctx.beginPath();
      ctx.arc(2, -20, 9, Math.PI * 0.5, Math.PI * 1.5);
      ctx.fill();

      // Glowing Ruby Eye Slit
      ctx.fillStyle = '#f43f5e';
      ctx.shadowColor = '#f43f5e';
      ctx.shadowBlur = 8;
      ctx.fillRect(3, -21, 5, 2.5);
      ctx.shadowBlur = 0;

      // High Aerodynamic Popped Collar
      ctx.fillStyle = '#881337';
      ctx.beginPath();
      ctx.moveTo(-8, -16);
      ctx.lineTo(-14, -26);
      ctx.lineTo(-4, -16);
      ctx.moveTo(6, -16);
      ctx.lineTo(12, -26);
      ctx.lineTo(2, -16);
      ctx.fill();
    }

    ctx.restore();
  }
}
