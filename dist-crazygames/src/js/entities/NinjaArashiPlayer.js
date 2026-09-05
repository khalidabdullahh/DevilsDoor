import { Shuriken } from './Shuriken.js';

// Pre-load Authentic Hand-Drawn Ninja Sketch Sprites
const SKETCH_IMAGE_MAP = {
  kage_ryu: '/src/assets/characters/sketch/hero_01_kage_ryu_sketch.png',
  shadow_ninja: '/src/assets/characters/sketch/hero_01_kage_ryu_sketch.png',
  ryujin: '/src/assets/characters/sketch/hero_02_ryujin_sketch.png',
  oni_guard: '/src/assets/characters/sketch/hero_02_ryujin_sketch.png',
  raijin: '/src/assets/characters/sketch/hero_03_raijin_sketch.png',
  shadow_ronin: '/src/assets/characters/sketch/hero_03_raijin_sketch.png',
  tsukuyomi: '/src/assets/characters/sketch/hero_04_tsukuyomi_sketch.png',
  crimson_assassin: '/src/assets/characters/sketch/hero_04_tsukuyomi_sketch.png'
};

const loadedSketchImages = {};

function getSketchImage(heroType) {
  const key = heroType || 'kage_ryu';
  if (loadedSketchImages[key]) {
    return loadedSketchImages[key];
  }
  const src = SKETCH_IMAGE_MAP[key] || SKETCH_IMAGE_MAP.kage_ryu;
  if (typeof Image !== 'undefined') {
    const img = new Image();
    img.src = src;
    loadedSketchImages[key] = img;
    return img;
  }
  return null;
}

// Eagerly pre-load all 4 hero sketches into memory
if (typeof Image !== 'undefined') {
  ['kage_ryu', 'ryujin', 'raijin', 'tsukuyomi'].forEach(id => getSketchImage(id));
}

/**
 * NinjaArashiPlayer — Authentic Hand-Drawn Ninja Sketch & Silhouette Gameplay Engine.
 * Features true concept-art ninja sketch rendering in 60 FPS gameplay:
 * - 01 KAGE-RYU: Hand-Drawn Void Shadow Shinobi (Pointed Cowl, 16-Node Flowing Crimson Scarf, Dual Katana Scabbards, Piercing Red Eyes)
 * - 02 RYUJIN: Hand-Drawn Oni Dragon Samurai (Curved Demon Horns, Spiked Pauldrons, Flame Greatsword, Glowing Magma Veins)
 * - 03 RAIJIN: Hand-Drawn Lightning Ronin (Conical Woven Kasa Hat, Billowing Samurai Haori Coat, Dual Daisho, Electric Cyan Eyes)
 * - 04 TSUKUYOMI: Hand-Drawn Crimson Kunoichi (High Collar, Split Mask, Dual Kama Sickles, Flowing Twin Ribbons, Ruby Eyes)
 */
export class NinjaArashiPlayer {
  constructor(x = 120, y = 480, heroType = 'kage_ryu') {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;

    this.heroType = heroType || 'kage_ryu';
    this.width = 46;
    this.height = 72;
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

    // Verlet Multi-Node Cloth Simulation for Flowing Scarves & Ribbons
    this.clothNodes = [];
    this._initClothNodes();

    // Visual Particles (Sparks, Speed Lines, Dust)
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
      this.width = 50;
      this.height = 76;
      this.maxHealth = 4;
      this.moveSpeed = 500;
      this.jumpForce = 540;
      this.dashSpeed = 1080;
    } else if (this.heroType === 'tsukuyomi' || this.heroType === 'crimson_assassin') {
      this.width = 42;
      this.height = 70;
      this.maxHealth = 3;
      this.moveSpeed = 570;
      this.jumpForce = 575;
      this.dashSpeed = 1220;
    } else if (this.heroType === 'raijin' || this.heroType === 'shadow_ronin') {
      this.width = 46;
      this.height = 72;
      this.maxHealth = 3;
      this.moveSpeed = 540;
      this.jumpForce = 560;
      this.dashSpeed = 1160;
    } else {
      // kage_ryu / shadow_ninja
      this.width = 46;
      this.height = 72;
      this.maxHealth = 3;
      this.moveSpeed = 550;
      this.jumpForce = 565;
      this.dashSpeed = 1180;
    }
    this.health = this.maxHealth;
    this._initClothNodes();
    getSketchImage(this.heroType);
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
          y: this.y + 18 + r * 4,
          oldX: this.x - i * 6,
          oldY: this.y + 18 + r * 4
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
        life: 0.22,
        alpha: 0.85,
        color: ghostColor,
        heroType: this.heroType
      });

      if (level && level.enemies) {
        for (const enemy of level.enemies) {
          if (enemy.isDead) continue;
          const dist = Math.hypot(this.x - enemy.x, (this.y + 24) - (enemy.y + 24));
          if (dist < 115) {
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
      g.alpha = g.life / 0.22;
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
      ctx.globalAlpha = g.alpha * 0.45;
      const ghostImg = getSketchImage(g.heroType);
      if (ghostImg && ghostImg.complete && ghostImg.naturalWidth > 0) {
        ctx.translate((g.x - camX) + this.width / 2, (g.y - camY) + this.height / 2);
        ctx.scale(g.facing, 1);
        const drawH = this.height * 1.35;
        const drawW = drawH * (ghostImg.naturalWidth / ghostImg.naturalHeight);
        ctx.drawImage(ghostImg, -drawW * 0.48, -drawH * 0.52, drawW, drawH);
      } else {
        ctx.fillStyle = g.color || '#a855f7';
        ctx.fillRect((g.x - camX), (g.y - camY), this.width, this.height);
      }
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

    // 4. Multi-Node Dynamic Flowing Scarf / Cloth (Authentic Ninja Ribbon)
    if (this.clothNodes && this.clothNodes.length > 0) {
      ctx.save();
      const isKage = (this.heroType === 'kage_ryu' || this.heroType === 'shadow_ninja');
      const isRaijin = (this.heroType === 'raijin' || this.heroType === 'shadow_ronin');
      const isTsukuyomi = (this.heroType === 'tsukuyomi' || this.heroType === 'crimson_assassin');
      const isRyujin = (this.heroType === 'ryujin' || this.heroType === 'oni_guard');

      let col1 = '#991b1b';
      let col2 = '#ef4444';
      let lineWidth = 6.0;

      if (isRaijin) {
        col1 = '#0f172a';
        col2 = '#1e293b';
        lineWidth = 7.0;
      } else if (isTsukuyomi) {
        col1 = '#881337';
        col2 = '#f43f5e';
        lineWidth = 4.5;
      } else if (isRyujin) {
        col1 = '#451a03';
        col2 = '#ea580c';
        lineWidth = 6.5;
      }

      for (let r = 0; r < this.clothNodes.length; r++) {
        const ribbon = this.clothNodes[r];
        ctx.strokeStyle = r === 0 ? col1 : col2;
        ctx.lineWidth = lineWidth - r * 1.4;
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

    // 5. Draw Master Hand-Drawn Ninja Sketch Character
    ctx.save();
    ctx.translate(px + this.width / 2, py + this.height / 2);
    ctx.scale(this.facing, 1);

    if (this.isFlipping) {
      ctx.rotate(this.flipAngle);
    }

    const isRunning = this.isGrounded && Math.abs(this.vx) > 20;
    const stride = isRunning ? Math.sin(this.animTime) : 0;
    const bobbing = isRunning ? Math.abs(Math.sin(this.animTime)) * 3 : 0;
    const leanAngle = isRunning ? 0.30 : (this.isDashing ? 0.48 : 0);

    ctx.translate(0, -bobbing);
    ctx.rotate(leanAngle);

    const sketchImg = getSketchImage(this.heroType);

    if (sketchImg && sketchImg.complete && sketchImg.naturalWidth > 0) {
      // Render the Authentic Hand-Drawn Ninja Sketch Sprite
      const drawHeight = this.height * 1.38;
      const aspectRatio = sketchImg.naturalWidth / sketchImg.naturalHeight;
      const drawWidth = drawHeight * aspectRatio;

      // Draw subtle shadow / ground ambient occlusion under feet
      if (this.isGrounded) {
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.beginPath();
        ctx.ellipse(0, this.height * 0.48, this.width * 0.45, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Draw Sketch Character
      ctx.drawImage(
        sketchImg,
        -drawWidth * 0.48,
        -drawHeight * 0.52,
        drawWidth,
        drawHeight
      );

      // Dynamic Eye Glow Overlay
      ctx.save();
      if (this.heroType === 'kage_ryu' || this.heroType === 'shadow_ninja') {
        ctx.fillStyle = '#ef4444';
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(8, -drawHeight * 0.26, 3, 0, Math.PI * 2);
        ctx.fill();
      } else if (this.heroType === 'ryujin' || this.heroType === 'oni_guard') {
        ctx.fillStyle = '#fbbf24';
        ctx.shadowColor = '#f97316';
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.arc(6, -drawHeight * 0.28, 3.5, 0, Math.PI * 2);
        ctx.fill();
      } else if (this.heroType === 'raijin' || this.heroType === 'shadow_ronin') {
        ctx.fillStyle = '#38bdf8';
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.arc(4, -drawHeight * 0.20, 3.5, 0, Math.PI * 2);
        ctx.fill();
      } else if (this.heroType === 'tsukuyomi' || this.heroType === 'crimson_assassin') {
        ctx.fillStyle = '#f43f5e';
        ctx.shadowColor = '#f43f5e';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(6, -drawHeight * 0.26, 3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // Dash Katana Slash Crescent Effect
      if (this.isDashing) {
        ctx.save();
        let slashColor = '#a855f7';
        if (this.heroType === 'ryujin' || this.heroType === 'oni_guard') slashColor = '#f97316';
        if (this.heroType === 'raijin' || this.heroType === 'shadow_ronin') slashColor = '#38bdf8';
        if (this.heroType === 'tsukuyomi' || this.heroType === 'crimson_assassin') slashColor = '#f43f5e';

        ctx.strokeStyle = slashColor;
        ctx.shadowColor = slashColor;
        ctx.shadowBlur = 18;
        ctx.lineWidth = 4.5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(10, 4, 38, -Math.PI * 0.35, Math.PI * 0.35);
        ctx.stroke();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.0;
        ctx.beginPath();
        ctx.arc(10, 4, 38, -Math.PI * 0.25, Math.PI * 0.25);
        ctx.stroke();
        ctx.restore();
      }
    } else {
      // Fallback Silhouette rendering while sprite loads
      ctx.fillStyle = '#111827';
      ctx.beginPath();
      ctx.arc(0, -this.height * 0.32, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(-this.width * 0.35, -this.height * 0.2, this.width * 0.7, this.height * 0.5);
      ctx.fillRect(-this.width * 0.3, this.height * 0.3, this.width * 0.25, this.height * 0.3);
      ctx.fillRect(this.width * 0.05, this.height * 0.3, this.width * 0.25, this.height * 0.3);
    }

    ctx.restore();
  }
}
