import { getSprite } from '../render/SpriteArt.js';
import { CHARACTER_ROSTER } from '../data/CharacterRoster.js';
import { Shuriken } from './Shuriken.js';

/**
 * NinjaArashiPlayer — Authentic Procedural Articulated Ninja Arashi Gameplay Engine.
 * Features 60 FPS inverse-kinematics running, jumping, wall-sliding, slashing, and flip animations:
 * - 01 KAGE-RYU: Void Shadow Shinobi (Pointed Cowl, Hitai-ate Headband, 14-Node Flowing Crimson Scarf, Dual Katana Scabbards, Crimson Eyes)
 * - 02 RYUJIN: Oni Dragon Samurai (Curved Demon Horns, Spiked Pauldrons, Flame Greatsword, Glowing Magma Veins)
 * - 03 RAIJIN: Lightning Ronin (Conical Woven Kasa Hat, Billowing Samurai Haori Coat, Dual Daisho, Electric Cyan Eyes)
 * - 04 TSUKUYOMI: Crimson Kunoichi (High Collar, Split Mask, Dual Kama Sickles, Flowing Twin Ribbons, Ruby Eyes)
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

    // 3-Life Checkpoint & Invulnerability System
    this.lastSafeGroundedX = x;
    this.lastSafeGroundedY = y;
    this.isInvulnerable = false;
    this.invulnerableTimer = 0;

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
    this.dashHitSet = new Set(); // each enemy can be hit only once per dash

    // Sword Slash 3-hit combo (separate from dash)
    this.isSlashing = false;
    this.slashTimer = 0;
    this.slashDuration = 0.2;
    this.slashHitDelay = 0.06;
    this.slashHitDone = true;
    this.slashReach = 92;
    this.slashCooldown = 0;
    this.comboStep = 0;
    this.comboTimer = 0;
    this.slashFxTimer = 0;
    this.slashFxDuration = 0.26;
    this.slashFxStep = 1;
    this.slashProfiles = [
      { duration: 0.20, hitDelay: 0.06, reach: 92,  damage: 1, knock: 1.0, lunge: 220, cooldown: 0.17, hitStop: 0.05 },
      { duration: 0.20, hitDelay: 0.06, reach: 96,  damage: 1, knock: 1.0, lunge: 240, cooldown: 0.17, hitStop: 0.05 },
      { duration: 0.30, hitDelay: 0.10, reach: 124, damage: 2, knock: 1.9, lunge: 380, cooldown: 0.40, hitStop: 0.10 }
    ];
    this.hitSparks = [];
    this.pendingHitStop = 0; // read + cleared by Game each frame

    // Shuriken ammo: 5 stars, one comes back every 1.6s (shown as pips in the HUD)
    this.shurikenMaxAmmo = 5;
    this.shurikenAmmo = 5;
    this.shurikenRegenTime = 1.6;
    this.shurikenRegenTimer = 0;

    // Movement forgiveness (makes controls feel tight)
    this.coyoteTime = 0.10;      // can still jump 0.10s after leaving a ledge
    this.coyoteTimer = 0;
    this.jumpBufferTime = 0.12;  // jump pressed 0.12s before landing still counts
    this.jumpBufferTimer = 0;
    this.jumpCutFactor = 0.5;    // releasing jump early cuts upward speed
    this.jumpCutReady = false;
    this.wallKickLock = 0.16;    // brief steering lock so a wall kick really pushes away
    this.inputLockTimer = 0;

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
    this.lastSafeGroundedX = x;
    this.lastSafeGroundedY = y;
    this.isInvulnerable = false;
    this.invulnerableTimer = 0;
    this.isDead = false;
    this.isDashing = false;
    this.dashTimer = 0;
    this.isSlashing = false;
    this.slashCooldown = 0;
    this.comboStep = 0;
    this.comboTimer = 0;
    this.slashFxTimer = 0;
    this.coyoteTimer = 0;
    this.jumpBufferTimer = 0;
    this.jumpCutReady = false;
    this.inputLockTimer = 0;
    this.pendingHitStop = 0;
    this.hitSparks = [];
    this.shurikenAmmo = this.shurikenMaxAmmo;
    this.shurikenRegenTimer = 0;
    this.dashHitSet.clear();
    this.isFlipping = false;
    this.flipAngle = 0;
    this.animTime = 0;
    this.shurikens = [];
    this.ghosts = [];
    this.wallSparks = [];
    this.footDust = [];
    this._initClothNodes();
  }

  /**
   * opts.source: 'enemy' -> knockback away from the attacker (no teleport, short i-frames)
   *              anything else (spikes, saws, pits) -> respawn on last safe ground (old behavior)
   * opts.fromX:  x position of the attacker, used to pick the knockback direction
   */
  takeDamage(amount = 1, audio = null, camera = null, level = null, opts = {}) {
    if (this.isDead || this.isDashing || this.isInvulnerable) return;

    // Getting hit cancels any slash in progress and breaks the combo
    this.isSlashing = false;
    this.slashFxTimer = 0;
    this.comboStep = 0;
    this.comboTimer = 0;

    if (this.health - amount <= 0) {
      // Out of health -> run ends
      this.kill(audio, camera);
      return;
    }

    this.health -= amount;

    if (opts && opts.source === 'enemy') {
      const fromX = typeof opts.fromX === 'number' ? opts.fromX : this.x - 1;
      const dir = (this.x + this.width / 2) >= fromX ? 1 : -1;
      this.vx = dir * 430;
      this.vy = -300;
      this.isGrounded = false;
      this.isWallSliding = false;
      this.inputLockTimer = 0.22;
      this.invulnerableTimer = 1.3;
      this.pendingHitStop = Math.max(this.pendingHitStop, 0.07);
    } else {
      // Hazard / pit: respawn on the last safe ground
      const respawnX = this.lastSafeGroundedX || Math.max(120, this.x - 80);
      const respawnY = (this.lastSafeGroundedY || 560) - 16;

      this.x = respawnX;
      this.y = respawnY;
      this.vx = 0;
      this.vy = -160;
      this.invulnerableTimer = 2.0; // 2s ghost invulnerability
    }

    this.isInvulnerable = true;
    this.isFlipping = false;
    this.flipAngle = 0;

    if (camera) camera.addShake(0.55);
    if (audio) audio.playBladeHit();
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

    // Update ghost invulnerability timer
    if (this.invulnerableTimer > 0) {
      this.invulnerableTimer -= dt;
      if (this.invulnerableTimer <= 0) {
        this.invulnerableTimer = 0;
        this.isInvulnerable = false;
      }
    }

    this.animTime += dt * 14;

    // --- Timers (all count down toward 0) ---
    if (this.dashCooldown > 0) this.dashCooldown -= dt;
    if (this.shurikenCooldown > 0) this.shurikenCooldown -= dt;
    if (this.slashCooldown > 0) this.slashCooldown -= dt;
    if (this.inputLockTimer > 0) this.inputLockTimer -= dt;
    if (this.slashFxTimer > 0) this.slashFxTimer -= dt;
    if (this.comboTimer > 0) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) this.comboStep = 0; // combo window expired
    }

    // Shuriken ammo regenerates one star at a time
    if (this.shurikenAmmo < this.shurikenMaxAmmo) {
      this.shurikenRegenTimer += dt;
      if (this.shurikenRegenTimer >= this.shurikenRegenTime) {
        this.shurikenRegenTimer = 0;
        this.shurikenAmmo++;
      }
    } else {
      this.shurikenRegenTimer = 0;
    }

    // Coyote time: while on the ground the timer is refilled; in the air it drains.
    // Standing on ground also re-arms the air jump, so walking off a ledge still gives one jump.
    if (this.isGrounded) {
      this.coyoteTimer = this.coyoteTime;
      this.canDoubleJump = true;
    } else if (this.coyoteTimer > 0) {
      this.coyoteTimer -= dt;
    }

    // Jump buffer: remember a jump press for a few frames
    if (input.isJumpJustPressed()) {
      this.jumpBufferTimer = this.jumpBufferTime;
    } else if (this.jumpBufferTimer > 0) {
      this.jumpBufferTimer -= dt;
    }

    // 1. Dash Action
    if (this.isDashing) {
      this.dashTimer -= dt;
      this.vx = this.facing * this.dashSpeed;
      this.vy = 0;

      const ghostColor = this._accentColor();

      this.ghosts.push({
        x: this.x,
        y: this.y,
        facing: this.facing,
        life: 0.22,
        alpha: 0.85,
        color: ghostColor,
        heroType: this.heroType
      });

      // Dash strike: 1 damage, once per enemy per dash
      // (before, it hit every frame: ~13 hits and +6500 score from a single dash)
      if (level && level.enemies) {
        const pcx = this.x + this.width / 2;
        const pcy = this.y + this.height / 2;
        for (const enemy of level.enemies) {
          if (enemy.isDead || this.dashHitSet.has(enemy)) continue;
          const dist = Math.hypot(pcx - (enemy.x + enemy.width / 2), pcy - (enemy.y + enemy.height / 2));
          if (dist < 100) {
            this.dashHitSet.add(enemy);
            this._hitEnemy(enemy, 1, 1.0, audio, camera, 0.04);
          }
        }
      }

      if (this.dashTimer <= 0) {
        this.isDashing = false;
        this.vx = this.facing * this.moveSpeed * 0.75;
      }
    } else {
      // 2. Slash tick: the hit lands a moment after the button press (wind-up feel)
      if (this.isSlashing) {
        this.slashTimer -= dt;
        const elapsed = this.slashDuration - this.slashTimer;
        if (!this.slashHitDone && elapsed >= this.slashHitDelay) {
          this.slashHitDone = true;
          this._resolveSlashHit(level, audio, camera);
        }
        if (this.slashTimer <= 0) this.isSlashing = false;
      }

      // 3. Horizontal Movement (skipped briefly after a wall kick or knockback)
      let moveDir = 0;
      if (input.isLeft()) moveDir -= 1;
      if (input.isRight()) moveDir += 1;

      if (this.inputLockTimer > 0) {
        // keep launch velocity, only light air drag
        this.vx *= 0.985;
      } else if (moveDir !== 0) {
        if (!this.isSlashing) this.facing = moveDir; // facing is locked while swinging
        this.vx = moveDir * this.moveSpeed * (this.isSlashing ? 0.6 : 1);
        if (this.isGrounded && audio && Math.random() < 0.12) {
          audio.playFootstep();
        }
      } else {
        this.vx *= 0.65;
        if (Math.abs(this.vx) < 10) this.vx = 0;
      }

      // 4. Sword Slash Trigger (3-hit combo)
      if (input.isAttackJustPressed() && this.slashCooldown <= 0) {
        this._startSlash(audio, camera);
      }

      // 5. Dash Trigger (its own button now)
      if (input.isDashJustPressed() && this.dashCooldown <= 0) {
        this.isDashing = true;
        this.isSlashing = false;
        this.dashTimer = this.dashDuration;
        this.dashCooldown = 0.52;
        this.dashHitSet.clear();
        if (audio) audio.playKatanaSlash();
        if (camera) camera.addShake(0.25);
      }

      // 6. Shuriken Trigger
      if (input.isShurikenJustPressed() && this.shurikenCooldown <= 0 && this.shurikenAmmo > 0) {
        this.shurikenCooldown = 0.26;
        this.shurikenAmmo--;
        const starX = this.x + (this.facing > 0 ? this.width + 8 : -8);
        const starY = this.y + 28;
        const star = new Shuriken(starX, starY, this.facing * 1100, 0);
        this.shurikens.push(star);
        if (audio) audio.playShurikenThrow();
      }

      // 7. Jump / Coyote Jump / Wall Kick / Double Jump (buffered)
      if (this.jumpBufferTimer > 0) {
        if (this.coyoteTimer > 0) {
          this.vy = -this.jumpForce;
          this.isGrounded = false;
          this.coyoteTimer = 0;
          this.jumpBufferTimer = 0;
          this.canDoubleJump = true;
          this.jumpCutReady = true;
          if (audio) audio.playJump();
        } else if (this.isWallSliding) {
          this.vy = -this.jumpForce * 0.95;
          this.vx = -this.wallDir * this.moveSpeed * 1.15;
          this.facing = -this.wallDir;
          this.isWallSliding = false;
          this.canDoubleJump = true;
          this.inputLockTimer = this.wallKickLock;
          this.jumpBufferTimer = 0;
          this.jumpCutReady = true;
          if (audio) audio.playJump();
        } else if (this.canDoubleJump && input.isJumpJustPressed()) {
          this.vy = -this.doubleJumpForce;
          this.canDoubleJump = false;
          this.jumpBufferTimer = 0;
          this.isFlipping = true;
          this.flipAngle = 0;
          if (audio) audio.playDoubleJump();
        }
      }

      // Variable jump height: let go of jump early -> shorter hop (Mario-style)
      if (this.jumpCutReady) {
        if (this.vy >= 0) {
          this.jumpCutReady = false;
        } else if (!input.isJump()) {
          this.vy *= this.jumpCutFactor;
          this.jumpCutReady = false;
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

    // 8. Physics Integration
    this._integratePhysics(dt, level, audio, camera);

    // 9. Shurikens
    for (let i = this.shurikens.length - 1; i >= 0; i--) {
      const star = this.shurikens[i];
      star.update(dt, level, audio, camera, this);
      if (star.isDead || !star.active) this.shurikens.splice(i, 1);
    }

    // 10. Particle Lifecycle
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

    for (let i = this.hitSparks.length - 1; i >= 0; i--) {
      const p = this.hitSparks[i];
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 500 * dt; // sparks fall with gravity
      if (p.life <= 0) this.hitSparks.splice(i, 1);
    }

    // 11. Cloth Verlet Physics Update
    this._updateCloth(dt);

    // 12. Somersault Rotation
    if (this.isFlipping) {
      this.flipAngle += this.facing * Math.PI * 5.4 * dt;
      if (Math.abs(this.flipAngle) >= Math.PI * 2) {
        this.flipAngle = 0;
        this.isFlipping = false;
      }
    }
  }

  // ---- Combat helpers ----

  _accentColor() {
    if (this.heroType === 'ryujin' || this.heroType === 'oni_guard') return '#f97316';
    if (this.heroType === 'raijin' || this.heroType === 'shadow_ronin') return '#38bdf8';
    if (this.heroType === 'tsukuyomi' || this.heroType === 'crimson_assassin') return '#f43f5e';
    return '#a855f7';
  }

  _startSlash(audio, camera) {
    // Press again inside the combo window -> next hit (1 -> 2 -> 3 -> back to 1)
    this.comboStep = this.comboTimer > 0 ? (this.comboStep % 3) + 1 : 1;
    const prof = this.slashProfiles[this.comboStep - 1];

    this.isSlashing = true;
    this.slashTimer = prof.duration;
    this.slashDuration = prof.duration;
    this.slashHitDelay = prof.hitDelay;
    this.slashHitDone = false;
    this.slashReach = prof.reach;
    this.slashCooldown = prof.cooldown;
    this.comboTimer = prof.duration + 0.3;
    this.slashFxDuration = prof.duration + 0.06;
    this.slashFxTimer = this.slashFxDuration;
    this.slashFxStep = this.comboStep;

    // Small step forward into the swing (only if not already running forward)
    if (Math.abs(this.vx) < 60) this.vx = this.facing * prof.lunge;

    if (audio) audio.playKatanaSlash();
    if (camera) camera.addShake(this.comboStep === 3 ? 0.3 : 0.12);
  }

  _resolveSlashHit(level, audio, camera) {
    if (!level || !level.enemies) return;
    const prof = this.slashProfiles[this.slashFxStep - 1];

    // Hitbox: a rectangle in front of the player (a little behind center too)
    const cx = this.x + this.width / 2;
    const hx = this.facing > 0 ? cx - 6 : cx - this.slashReach;
    const hw = this.slashReach + 6;
    const hy = this.y - 16;
    const hh = this.height + 26;

    for (const enemy of level.enemies) {
      if (enemy.isDead) continue;

      if (this._checkAABB(hx, hy, hw, hh, enemy.x, enemy.y, enemy.width, enemy.height)) {
        this._hitEnemy(enemy, prof.damage, prof.knock, audio, camera, prof.hitStop);
      }

      // Slash can deflect Cursed Monk curse orbs
      if (enemy.projectiles && enemy.projectiles.length) {
        for (let i = enemy.projectiles.length - 1; i >= 0; i--) {
          const orb = enemy.projectiles[i];
          if (orb.x > hx && orb.x < hx + hw && orb.y > hy && orb.y < hy + hh) {
            enemy.projectiles.splice(i, 1);
            this._spawnHitSparks(orb.x, orb.y);
            this.score += 50;
          }
        }
      }
    }
  }

  // damage + feedback in one place: shake, hit-stop, sparks, score
  _hitEnemy(enemy, damage, knockScale, audio, camera, hitStop) {
    enemy.takeDamage(damage, this.facing, audio, Math.round(45 * knockScale));
    if (camera) camera.addShake(0.2 + 0.15 * knockScale);
    this.pendingHitStop = Math.max(this.pendingHitStop, hitStop);
    this._spawnHitSparks(enemy.x + enemy.width / 2, enemy.y + enemy.height * 0.4);
    this.score += enemy.isDead ? 300 : 50;
  }

  _spawnHitSparks(x, y) {
    for (let i = 0; i < 9; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 140 + Math.random() * 260;
      this.hitSparks.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 80,
        life: 0.22 + Math.random() * 0.14
      });
    }
  }

  // Crescent slash trail: sweeps down (hit 1), up (hit 2), wide + thick (hit 3)
  _drawSlashArc(ctx, px, py) {
    if (this.slashFxTimer <= 0) return;
    const t = 1 - this.slashFxTimer / this.slashFxDuration; // 0 -> 1 over the swing
    const step = this.slashFxStep;
    const col = this._accentColor();
    const r = this.slashReach * 0.85;

    // Angles are for facing right; scale(facing, 1) mirrors them for facing left
    const from = step === 2 ? Math.PI * 0.45 : -Math.PI * 0.45;
    const to = step === 2 ? -Math.PI * 0.45 : Math.PI * 0.45;
    const head = from + (to - from) * Math.min(1, t * 1.6);
    const tail = from + (to - from) * Math.max(0, t * 1.6 - 0.55);
    const a0 = Math.min(head, tail);
    const a1 = Math.max(head, tail);
    if (a1 - a0 < 0.02) return;

    ctx.save();
    ctx.translate(px + this.width / 2 + this.facing * 8, py + this.height * 0.45);
    ctx.scale(this.facing, 1);
    ctx.globalAlpha = Math.max(0, 1 - t);
    ctx.lineCap = 'round';
    ctx.shadowColor = col;
    ctx.shadowBlur = 16;

    ctx.strokeStyle = col;
    ctx.lineWidth = step === 3 ? 12 : 8;
    ctx.beginPath();
    ctx.arc(0, 0, r, a0, a1);
    ctx.stroke();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = step === 3 ? 5 : 3;
    ctx.beginPath();
    ctx.arc(0, 0, r, a0, a1);
    ctx.stroke();
    ctx.restore();
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

          // Record safe grounded checkpoint
          if (!solid.isFalling && solid.tag !== 'collapsing_plank' && solid.y < 800) {
            this.lastSafeGroundedX = this.x;
            this.lastSafeGroundedY = this.y;
          }
        } else if (this.vy < 0) {
          this.y = solid.y + solid.height;
          this.vy = 0;
        }
      }
    }

    if (level.checkHazardCollision(this.x, this.y, this.width, this.height)) {
      this.takeDamage(1, audio, camera, level);
    }

    if (this.y > 850) {
      this.takeDamage(1, audio, camera, level);
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
      ctx.translate((g.x - camX) + this.width / 2, (g.y - camY) + this.height / 2);
      ctx.scale(g.facing, 1);
      ctx.shadowColor = g.color || '#a855f7';
      ctx.shadowBlur = 18;
      this._renderShinobiModel(ctx, 0, false);
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

    // 3b. Hit Sparks (impact feedback)
    if (this.hitSparks.length) {
      ctx.save();
      ctx.strokeStyle = '#fde68a';
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      for (const p of this.hitSparks) {
        ctx.globalAlpha = Math.min(1, p.life / 0.2);
        ctx.beginPath();
        ctx.moveTo(p.x - camX, p.y - camY);
        ctx.lineTo(p.x - camX - p.vx * 0.03, p.y - camY - p.vy * 0.03);
        ctx.stroke();
      }
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

    // 5. Draw Master Procedural Articulated Shinobi Character
    ctx.save();
    if (this.isInvulnerable) {
      const flicker = Math.sin(performance.now() * 0.035);
      ctx.globalAlpha = flicker > 0 ? 0.35 : 0.85;
    }
    ctx.translate(px + this.width / 2, py + this.height / 2);
    ctx.scale(this.facing, 1);

    if (this.isFlipping) {
      ctx.rotate(this.flipAngle);
    }

    const isRunning = this.isGrounded && Math.abs(this.vx) > 20;
    const stride = isRunning ? Math.sin(this.animTime) : 0;
    const bobbing = isRunning ? Math.abs(Math.sin(this.animTime)) * 3.5 : 0;
    const painted = !!this._paintedHero();   // painted art is a full pose already, so it needs far less lean than the vector model
    const leanAngle = painted
      ? (isRunning ? 0.08 : (this.isDashing ? 0.2 : (this.isSlashing ? 0.1 : 0)))
      : (isRunning ? 0.28 : (this.isDashing ? 0.46 : (this.isSlashing ? 0.22 : 0)));

    ctx.translate(0, -bobbing);
    ctx.rotate(leanAngle);

    // Ground ambient occlusion shadow under feet
    if (this.isGrounded) {
      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
      ctx.beginPath();
      ctx.ellipse(0, 36, 18, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Render the Fully Articulated Vector Shinobi
    this._renderShinobiModel(ctx, stride, isRunning);

    ctx.restore();

    // 6. Sword slash crescent trail
    this._drawSlashArc(ctx, px, py);
  }

  // Painted hero art (optional): set `playSprite` (+ `playFace`) on a CHARACTER_ROSTER entry and it is used in gameplay.
  // Until then (or while loading) the vector shinobi below is drawn, so gameplay never breaks.
  _paintedHero() {
    const entry = CHARACTER_ROSTER.find((c) => c.id === this.heroType);
    if (!entry || !entry.playSprite) return null;
    const sp = getSprite(entry.playSprite);
    return sp.ready ? { sp, face: entry.playFace || 1, k: entry.playScale || 1.45 } : null;
  }

  _drawPaintedHero(ctx, art) {
    const { sp, face, k } = art;
    const dh = this.height * k;
    const dw = dh * (sp.img.naturalWidth / sp.img.naturalHeight);
    const stretch = !this.isGrounded ? (this.vy < 0 ? 1.05 : 0.97) : 1;      // tiny squash/stretch in the air
    const wide = this.isDashing ? 1.12 : 1;
    ctx.save();
    ctx.scale(face * wide, stretch);                                            // artwork direction -> this.facing (outer ctx already flips)
    ctx.drawImage(sp.img, -dw / 2, this.height / 2 + 2 - dh, dw, dh);          // feet on the hitbox bottom
    ctx.restore();
  }

  /**
   * High-Precision Procedural Shinobi Silhouette & Vector Anatomical Renderer
   */
  _renderShinobiModel(ctx, stride, isRunning) {
    const art = this._paintedHero();
    if (art) { this._drawPaintedHero(ctx, art); return; }
    const isAir = !this.isGrounded;
    const isAscending = isAir && this.vy < 0;
    const isDescending = isAir && this.vy >= 0;

    const isKage = (this.heroType === 'kage_ryu' || this.heroType === 'shadow_ninja');
    const isRyujin = (this.heroType === 'ryujin' || this.heroType === 'oni_guard');
    const isRaijin = (this.heroType === 'raijin' || this.heroType === 'shadow_ronin');
    const isTsukuyomi = (this.heroType === 'tsukuyomi' || this.heroType === 'crimson_assassin');

    // ----------------------------------------------------
    // 1. BACK LEG (Left Leg - Darker silhouette tone)
    // ----------------------------------------------------
    ctx.save();
    let backKneeX = -4 - stride * 12;
    let backKneeY = 22 - Math.max(0, stride) * 5;
    let backFootX = -4 - stride * 20;
    let backFootY = 34 + Math.max(0, stride) * 6;

    if (isAscending) {
      backKneeX = -12; backKneeY = 20;
      backFootX = -18; backFootY = 28;
    } else if (isDescending) {
      backKneeX = -6; backKneeY = 24;
      backFootX = -8; backFootY = 35;
    }

    // Back Thigh
    ctx.strokeStyle = '#070a12';
    ctx.lineWidth = 9;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-4, 10);
    ctx.lineTo(backKneeX, backKneeY);
    ctx.stroke();

    // Back Shin
    ctx.lineWidth = 7.5;
    ctx.beginPath();
    ctx.moveTo(backKneeX, backKneeY);
    ctx.lineTo(backFootX, backFootY);
    ctx.stroke();

    // Back Tabi Boot
    ctx.fillStyle = '#020306';
    ctx.beginPath();
    ctx.ellipse(backFootX + 3, backFootY + 2, 6.5, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // ----------------------------------------------------
    // 2. BACK WEAPON / SCABBARD (Strapped across back)
    // ----------------------------------------------------
    ctx.save();
    if (isKage) {
      // Dual Crossed Katanas on Back
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 4.5;
      ctx.beginPath();
      ctx.moveTo(4, 4);
      ctx.lineTo(-24, -26);
      ctx.stroke();

      // Golden Scabbard Tip & Collar
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(-26, -28, 4, 4);
      ctx.fillRect(2, 2, 4, 4);

      // Katana Handle Tsuka
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(-24, -26);
      ctx.lineTo(-34, -36);
      ctx.stroke();
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(-35, -37, 3, 3);
    } else if (isRyujin) {
      // Heavy Spiked Magma Greatsword
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-18, -32, 10, 44);
      ctx.fillStyle = '#ea580c';
      ctx.fillRect(-17, -30, 2, 40); // Magma vein
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(-13, -34, 4, 0, Math.PI * 2);
      ctx.fill();
    } else if (isRaijin) {
      // Daisho Katana Sheaths at Hip
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(0, 6);
      ctx.lineTo(-26, 16);
      ctx.stroke();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-26, 16);
      ctx.lineTo(-30, 18);
      ctx.stroke();
    } else if (isTsukuyomi) {
      // Dual Kama Sickles on Back
      ctx.strokeStyle = '#881337';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(2, 4);
      ctx.lineTo(-20, -22);
      ctx.stroke();
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(-20, -22, 9, Math.PI * 0.4, Math.PI * 1.2);
      ctx.stroke();
    }
    ctx.restore();

    // ----------------------------------------------------
    // 3. TORSO & WAIST (Shinobi Shōzoku Body Armor)
    // ----------------------------------------------------
    ctx.save();
    // Segmented Torso Body
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(-11, -12);
    ctx.lineTo(13, -12);
    ctx.lineTo(10, 10);
    ctx.lineTo(-9, 10);
    ctx.closePath();
    ctx.fill();

    // Chest Vest Texture & V-neck Shinobi Wrap
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.moveTo(-9, -12);
    ctx.lineTo(2, 2);
    ctx.lineTo(11, -12);
    ctx.lineTo(6, -12);
    ctx.lineTo(2, -4);
    ctx.lineTo(-4, -12);
    ctx.closePath();
    ctx.fill();

    // Metallic Chest Plate Straps
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-10, -4);
    ctx.lineTo(12, -4);
    ctx.moveTo(-9, 2);
    ctx.lineTo(10, 2);
    ctx.stroke();

    // Character Specific Torso Highlights
    if (isKage) {
      // Crimson sash
      ctx.fillStyle = '#991b1b';
      ctx.fillRect(-9, 5, 20, 5);
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(0, 5.5, 4, 4); // Gold buckle
    } else if (isRyujin) {
      // Magma cracks on chest
      ctx.fillStyle = '#ea580c';
      ctx.fillRect(-6, -6, 14, 2.5);
      ctx.fillStyle = '#f97316';
      ctx.fillRect(-4, 0, 10, 2.5);
      // Heavy Rope Belt
      ctx.fillStyle = '#451a03';
      ctx.fillRect(-10, 4, 22, 6);
    } else if (isRaijin) {
      // Flowing Samurai Haori Overcoat Flaps
      ctx.fillStyle = '#090d16';
      ctx.beginPath();
      ctx.moveTo(-11, 4);
      ctx.lineTo(12, 4);
      ctx.lineTo(15, 22);
      ctx.lineTo(-15, 22);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    } else if (isTsukuyomi) {
      // High Corset Sash
      ctx.fillStyle = '#881337';
      ctx.fillRect(-8, 3, 18, 7);
      ctx.fillStyle = '#f43f5e';
      ctx.fillRect(-1, 4, 4, 5);
    }
    ctx.restore();

    // ----------------------------------------------------
    // 4. FRONT LEG (Right Leg - Foreground Articulation)
    // ----------------------------------------------------
    ctx.save();
    let frontKneeX = 4 + stride * 14;
    let frontKneeY = 22 - Math.max(0, -stride) * 5;
    let frontFootX = 4 + stride * 22;
    let frontFootY = 34 + Math.max(0, -stride) * 6;

    if (isAscending) {
      frontKneeX = 2; frontKneeY = 18;
      frontFootX = -2; frontFootY = 25;
    } else if (isDescending) {
      frontKneeX = 8; frontKneeY = 26;
      frontFootX = 10; frontFootY = 36;
    }

    // Front Thigh
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 9.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(4, 10);
    ctx.lineTo(frontKneeX, frontKneeY);
    ctx.stroke();

    // Front Shin
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(frontKneeX, frontKneeY);
    ctx.lineTo(frontFootX, frontFootY);
    ctx.stroke();

    // Shin Bandages / Leg Guards
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(frontKneeX - 2, frontKneeY + 4);
    ctx.lineTo(frontKneeX + 4, frontKneeY + 5);
    ctx.moveTo(frontFootX - 3, frontFootY - 4);
    ctx.lineTo(frontFootX + 3, frontFootY - 3);
    ctx.stroke();

    // Front Tabi Boot
    ctx.fillStyle = '#020306';
    ctx.beginPath();
    ctx.ellipse(frontFootX + 4, frontFootY + 2, 7.5, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // ----------------------------------------------------
    // 5. HEAD, HOOD, MASK & EYES
    // ----------------------------------------------------
    ctx.save();
    const headX = 2;
    const headY = -22;

    // Head Base Cowl
    ctx.fillStyle = '#090d16';
    ctx.beginPath();
    ctx.arc(headX, headY, 11.5, 0, Math.PI * 2);
    ctx.fill();

    // Character Specific Head Archetypes
    if (isKage) {
      // Pointed Shinobi Cowl Hood
      ctx.fillStyle = '#090d16';
      ctx.beginPath();
      ctx.moveTo(headX - 11, headY + 2);
      ctx.lineTo(headX - 6, headY - 18);
      ctx.lineTo(headX + 10, headY - 4);
      ctx.closePath();
      ctx.fill();

      // Forehead Protector (Hitai-ate)
      ctx.fillStyle = '#64748b';
      ctx.fillRect(headX - 2, headY - 6, 12, 4.5);
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(headX + 1, headY - 5, 6, 2.5);
    } else if (isRyujin) {
      // Horned Oni Kabuto Mask
      ctx.fillStyle = '#020617';
      ctx.beginPath();
      ctx.arc(headX, headY, 12.5, 0, Math.PI * 2);
      ctx.fill();

      // Curved Demon Horns
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.moveTo(headX - 2, headY - 8);
      ctx.quadraticCurveTo(headX - 8, headY - 24, headX - 16, headY - 22);
      ctx.quadraticCurveTo(headX - 8, headY - 14, headX - 1, headY - 5);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(headX + 4, headY - 8);
      ctx.quadraticCurveTo(headX + 12, headY - 26, headX + 18, headY - 22);
      ctx.quadraticCurveTo(headX + 10, headY - 14, headX + 5, headY - 5);
      ctx.closePath();
      ctx.fill();
    } else if (isRaijin) {
      // Wide Conical Bamboo Kasa Hat
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.moveTo(headX + 2, headY - 18);
      ctx.lineTo(headX - 24, headY - 2);
      ctx.lineTo(headX + 26, headY - 2);
      ctx.closePath();
      ctx.fill();

      // Bamboo Woven Lines
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(headX + 2, headY - 18);
      ctx.lineTo(headX - 8, headY - 2);
      ctx.moveTo(headX + 2, headY - 18);
      ctx.lineTo(headX + 10, headY - 2);
      ctx.stroke();
    } else if (isTsukuyomi) {
      // High Kunoichi Collar & Hair Bun
      ctx.fillStyle = '#881337';
      ctx.beginPath();
      ctx.arc(headX - 8, headY - 6, 5, 0, Math.PI * 2);
      ctx.fill();
      // Flowing Hair Ribbons
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(headX - 8, headY - 6);
      ctx.quadraticCurveTo(headX - 18, headY + 4, headX - 26, headY + 12);
      ctx.stroke();
    }

    // Lower Face Mask
    ctx.fillStyle = '#05070d';
    ctx.beginPath();
    ctx.moveTo(headX + 1, headY + 1);
    ctx.lineTo(headX + 12, headY + 4);
    ctx.lineTo(headX + 4, headY + 12);
    ctx.lineTo(headX - 6, headY + 8);
    ctx.closePath();
    ctx.fill();

    // Piercing Glowing Eye
    ctx.save();
    let eyeColor = '#ef4444';
    if (isRyujin) eyeColor = '#fbbf24';
    if (isRaijin) eyeColor = '#38bdf8';
    if (isTsukuyomi) eyeColor = '#f43f5e';

    ctx.fillStyle = eyeColor;
    ctx.shadowColor = eyeColor;
    ctx.shadowBlur = 16;
    ctx.beginPath();
    ctx.ellipse(headX + 7, headY - 1, 3.5, 1.8, 0.15, 0, Math.PI * 2);
    ctx.fill();

    // Intense pupil core
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(headX + 7.5, headY - 1, 1.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.restore();

    // ----------------------------------------------------
    // 6. ARMS & WIELDED KATANA / WEAPON
    // ----------------------------------------------------
    ctx.save();
    if (this.isDashing) {
      // Lethal Thrust / Slash Pose
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 7.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(6, -8);
      ctx.lineTo(24, -4);
      ctx.lineTo(38, -2);
      ctx.stroke();

      // Drawn Blade Extended Forward
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(38, -2);
      ctx.lineTo(76, -4);
      ctx.stroke();

      // Razor Edge Glint
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(40, -1);
      ctx.lineTo(76, -3);
      ctx.stroke();

      // Energy Slash Crescent Wave
      let slashGlow = '#a855f7';
      if (isRyujin) slashGlow = '#f97316';
      if (isRaijin) slashGlow = '#38bdf8';
      if (isTsukuyomi) slashGlow = '#f43f5e';
      if (isKage) slashGlow = '#ef4444';

      ctx.strokeStyle = slashGlow;
      ctx.shadowColor = slashGlow;
      ctx.shadowBlur = 24;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(42, 0, 48, -Math.PI * 0.35, Math.PI * 0.35);
      ctx.stroke();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(42, 0, 48, -Math.PI * 0.2, Math.PI * 0.2);
      ctx.stroke();
    } else if (isRunning) {
      // Iconic Naruto / Shinobi Running Arm Pose (Arms trailing behind with Katana)
      // Front Left Arm
      ctx.strokeStyle = '#070a12';
      ctx.lineWidth = 6.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(4, -8);
      ctx.lineTo(16, 0);
      ctx.stroke();

      // Back Right Arm holding drawn blade angled backwards
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.moveTo(-6, -8);
      ctx.lineTo(-24, 6);
      ctx.stroke();

      // Drawn Katana Blade Pointing Backwards
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-24, 6);
      ctx.lineTo(-58, 20);
      ctx.stroke();

      // Edge Shimmer
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(-24, 7);
      ctx.lineTo(-58, 21);
      ctx.stroke();
    } else {
      // Idle Ready Stance
      // Left Arm relaxed
      ctx.strokeStyle = '#070a12';
      ctx.lineWidth = 6.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(8, -8);
      ctx.lineTo(14, 4);
      ctx.stroke();

      // Right Arm with hand on Katana hilt
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.moveTo(-4, -8);
      ctx.lineTo(4, 2);
      ctx.stroke();

      // Katana hilt and guard in hand
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(4, 1, 4, 3);
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(6, 2);
      ctx.lineTo(12, -4);
      ctx.stroke();
    }
    ctx.restore();
  }
}
