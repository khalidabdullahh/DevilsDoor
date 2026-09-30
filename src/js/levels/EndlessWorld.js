import { ShadowNinjaEnemy } from '../entities/ShadowNinjaEnemy.js';
import { OniBossEnemy } from '../entities/OniBossEnemy.js';

/**
 * EndlessWorld — Infinite Procedural Chunk Generator & Biome Controller for Devil's Door v2.0.
 * Generates continuous dark fantasy terrain chunks, hazards, enemies, and collectibles
 * based on the official character roster (#01 to #06):
 * - #01 Shadow Ninja (Player)
 * - #02 Shadow Ronin, #03 Oni Guard, #04 Cursed Monk, #05 Crimson Assassin
 * - #06 Shadow Entity (Boss Encounter)
 * - Oni Stone Pillars holding platforms, dead trees, embedded weapons
 */
export class EndlessWorld {
  // rng: any function returning [0,1). Defaults to Math.random; tests pass a seeded one
  // so the same seed always builds the same world.
  constructor(initialBiome = 'sunset_torii', rng = Math.random) {
    this._rng = rng;
    this.time = 0; // world clock in seconds: advances only while the game runs (pause / hit-stop safe)
    this.lastChunkType = -1;
    this.hardStreak = 0;
    this._safeSpot = null;

    this.title = "Devil's Endless Descent";
    this.id = 'endless_v2';

    // Official 4K Realms - Locked to player's selection
    this.BIOME_CYCLE = [
      'sunset_torii',
      'moonlight_ruins',
      'scythe_chasm',
      'crystal_abyss',
      'bamboo_mist',
      'crimson_temple',
      'underworld_gate',
      'celestial_ruins',
      'shadow_peak',
      'blood_moon'
    ];
    this.biomeIndex = Math.max(0, this.BIOME_CYCLE.indexOf(initialBiome));
    this.biome = this.BIOME_CYCLE[this.biomeIndex] || 'sunset_torii';
    this.biomeTimer = 0;
    this.BIOME_DURATION = Infinity; // Remains locked to selected realm throughout run

    // Collections
    this.solids = [];
    this.hazards = [];
    this.enemies = [];
    this.projectiles = [];
    this.lanterns = [];
    this.bridgePlanks = [];
    this.demonClaws = [];
    this.thornPods = [];
    this.hokoraShrines = [];
    this.pendulumAxes = [];
    this.skullSawWheels = [];
    this.campfires = [];
    this.oniPillars = [];
    this.deadTrees = [];
    this.embeddedWeapons = [];
    this.diamonds = [];
    this.healthOrbs = [];
    this.DIAMOND_SCORE = 50;

    // State
    this.generatedDistance = 0;
    this.chunkIndex = 0;
    this.lastGroundY = 560;
    this.playerStartX = 120;
    this.playerStartY = 480;

    // Boss Encounter Interval
    this.nextBossDistance = 1000;

    this._initStartingZone();
  }

  _initStartingZone() {
    this.solids.push({
      x: 0,
      y: 560,
      width: 900,
      height: 340,
      tag: 'ground_start',
      active: true
    });

    this.lanterns.push({ x: 160, y: 520 });
    this.lanterns.push({ x: 480, y: 520 });
    this.lanterns.push({ x: 800, y: 520 });
    this.campfires.push({ x: 320, y: 554 });

    this.embeddedWeapons.push({ x: 420, y: 560, type: 'spear' });
    this.embeddedWeapons.push({ x: 435, y: 560, type: 'katana' });

    this.generatedDistance = 900;

    while (this.generatedDistance < 3200) {
      this._generateNextChunk();
    }
  }

  update(dt, player, audio, camera) {
    this.time += dt;

    // Biome stays locked to player selection
    const px = player ? player.x : 0;
    const py = player ? player.y : 0;

    while (this.generatedDistance < px + 2800) {
      this._generateNextChunk();
    }

    // Boss Spawning (Every 1000m)
    const currentMeters = Math.floor(px / 10);
    if (currentMeters >= this.nextBossDistance) {
      this.nextBossDistance += 1000;
      try {
        const boss = new OniBossEnemy(px + 900, 480);
        this.enemies.push(boss);
        if (audio && typeof audio.playEnemyAlert === 'function') audio.playEnemyAlert();
        if (camera && typeof camera.addShake === 'function') camera.addShake(0.8);
      } catch (err) {
        console.warn('[EndlessWorld] Boss spawn error:', err);
      }
    }

    // Pendulum Axes
    for (const axe of this.pendulumAxes) {
      axe.angle = Math.sin(this.time * 1000 * 0.0018 * axe.speed + axe.phase) * axe.maxAngle;
      axe.bladeX = axe.pivotX + Math.sin(axe.angle) * axe.length;
      axe.bladeY = axe.pivotY + Math.cos(axe.angle) * axe.length;

      if (player && !player.isDead) {
        // measure from the body center (was the left edge: unfair on one side)
        const d = Math.hypot((player.x + (player.width || 0) / 2) - axe.bladeX, (player.y + 20) - axe.bladeY);
        if (d < 46) {
          player.takeDamage(1, audio, camera);
        }
      }
    }

    // Skull Saw Wheels
    for (const saw of this.skullSawWheels) {
      saw.rotation += dt * saw.rotSpeed;
      if (saw.moves) {
        saw.y = saw.baseY + Math.sin(this.time * 1000 * 0.002 * saw.moveSpeed + (saw.phase || 0)) * saw.moveRange;
      }
      if (player && !player.isDead) {
        const d = Math.hypot((player.x + (player.width || 0) / 2) - saw.x, (player.y + 20) - saw.y);
        if (d < saw.radius + 14) {
          player.takeDamage(1, audio, camera);
        }
      }
    }

    // Bridge Planks
    for (const plank of this.bridgePlanks) {
      if (plank.isFalling) {
        plank.vy = (plank.vy || 0) + 750 * dt;
        plank.y += plank.vy * dt;
        plank.rot += 1.8 * dt;
        if (plank.y > 1400) plank.active = false;
      } else if (player && plank.active) {
        const onPlank = (player.x >= plank.x - 24 && player.x <= plank.x + plank.width + 24 &&
                         Math.abs(player.y + 50 - plank.y) < 16 && player.isGrounded);
        if (onPlank) {
          plank.touchTimer = (plank.touchTimer || 0) + dt;
          if (plank.touchTimer > (plank.fallDelay || 0.18)) {
            plank.isFalling = true;
            if (audio) audio.playStoneCollapse();
            if (camera) camera.addShake(0.3);
          }
        }
      }
    }

    // Diamonds (score only; 50 each) and Life Orbs (+1 health, only picked up when hurt)
    if (player && !player.isDead) {
      const pcx = player.x + (player.width || 0) / 2;
      const pcy = player.y + 20;
      for (const d of this.diamonds) {
        if (d.collected) continue;
        if (Math.hypot(pcx - d.x, pcy - d.y) < 44) {
          d.collected = true;
          player.diamonds = (player.diamonds || 0) + 1;
          player.score = (player.score || 0) + this.DIAMOND_SCORE;
          if (audio) audio.playFootstep();
        }
      }
      for (const o of this.healthOrbs) {
        if (o.collected || player.health >= player.maxHealth) continue;
        if (Math.hypot(pcx - o.x, pcy - o.y) < 44) {
          o.collected = true;
          player.health = Math.min(player.maxHealth, player.health + 1);
          if (audio) audio.playDoubleJump();
        }
      }
    }

    // Enemies
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];
      e.update(dt, player, audio, camera, this);
      if (e.x < px - 1200) {
        this.enemies.splice(i, 1);
      }
    }

    // Despawn
    const despawnThreshold = px - 1400;
    this.solids = this.solids.filter(s => (s.x + s.width) > despawnThreshold);
    this.hazards = this.hazards.filter(h => (h.x + (h.width || 60)) > despawnThreshold);
    this.lanterns = this.lanterns.filter(l => l.x > despawnThreshold);
    this.bridgePlanks = this.bridgePlanks.filter(b => b.x > despawnThreshold && b.active);
    this.pendulumAxes = this.pendulumAxes.filter(a => a.pivotX > despawnThreshold);
    this.skullSawWheels = this.skullSawWheels.filter(s => s.x > despawnThreshold);
    this.diamonds = this.diamonds.filter(d => d.x > despawnThreshold && !d.collected);
    this.healthOrbs = this.healthOrbs.filter(o => o.x > despawnThreshold && !o.collected);
    this.campfires = this.campfires.filter(c => c.x > despawnThreshold);
    this.oniPillars = this.oniPillars.filter(p => p.x > despawnThreshold);
    this.deadTrees = this.deadTrees.filter(t => t.x > despawnThreshold);
    this.embeddedWeapons = this.embeddedWeapons.filter(w => w.x > despawnThreshold);
  }

  // ---------------------------------------------------------------------------
  // Chunk generation: difficulty ramp + fairness rules
  // Measured with the real player physics: max gap 480px (single jump) / 790px (double),
  // max step-up 120px (single) / 220px (double). Every transition below stays well inside that.
  // ---------------------------------------------------------------------------
  _rand() { return this._rng(); }

  // 0 at the start -> 1 at ~2500m. Measured at the chunk's own x, because chunks are
  // generated ~2800px ahead of the player.
  _difficultyAt(x) {
    const meters = Math.max(0, (x - 900) / 10);
    return Math.min(1, meters / 2500);
  }

  _pickWeighted(weights) {
    let total = 0;
    for (const w of weights) total += w;
    let r = this._rand() * total;
    for (let i = 0; i < weights.length; i++) {
      r -= weights[i];
      if (r < 0) return i;
    }
    return 0;
  }

  // 0 ground, 1 bridge, 2 cliff, 3 pendulum, 4 saw, 5 arena
  _pickChunkType(d) {
    const w = [
      Math.max(0.8, 3.0 - 1.6 * d),
      1.2 + 0.2 * d,
      0.8 + 0.6 * d,
      d < 0.08 ? 0 : 0.3 + 1.6 * d, // no saws / axes in the first ~200m
      d < 0.08 ? 0 : 0.3 + 1.6 * d,
      0.6 + 1.0 * d
    ];
    // Breather: never more than 2 hard chunks (axe / saw / arena) in a row
    if (this.hardStreak >= 2) w[3] = w[4] = w[5] = 0;
    // Never the same special chunk twice in a row (plain ground may repeat)
    if (this.lastChunkType > 0) w[this.lastChunkType] = 0;
    return this._pickWeighted(w);
  }

  _generateNextChunk() {
    const startX = this.generatedDistance;
    const d = this._difficultyAt(startX);
    const chunkType = this._pickChunkType(d);
    this.chunkIndex++;
    this.hardStreak = (chunkType >= 3) ? this.hardStreak + 1 : 0;
    this.lastChunkType = chunkType;

    // Gap to the next chunk widens slowly (80 -> 150px); the jump envelope allows 480px
    const gap = Math.round(80 + 70 * d);

    this._safeSpot = null;
    switch (chunkType) {
      case 0: this._buildStandardGroundChunk(startX, d, gap); break;
      case 1: this._buildCollapsingBridgeChunk(startX, d, gap); break;
      case 2: this._buildHighLedgeWallJumpChunk(startX, d, gap); break;
      case 3: this._buildPendulumAxeHazardChunk(startX, d, gap); break;
      case 4: this._buildSpinningSkullSawChunk(startX, d, gap); break;
      case 5:
      default: this._buildTacticalCombatArenaChunk(startX, d, gap); break;
    }

    // A Life Orb roughly every 7th chunk, always on hazard-free ground
    if (this._safeSpot && d > 0.05 && this.chunkIndex % 7 === 0) {
      this.healthOrbs.push({ x: this._safeSpot.x, y: this._safeSpot.y - 52, collected: false });
    }
  }

  // Enemy roster grows with difficulty: ronin first, then assassins, then oni (>300m), monks (>750m)
  _pickEnemyType(d) {
    const types = ['ronin', 'assassin', 'oni', 'monk'];
    return types[this._pickWeighted([
      1.0,
      0.35 + 0.65 * d,
      Math.max(0, d - 0.12) * 1.3,
      Math.max(0, d - 0.3) * 1.1
    ])];
  }

  _getRandomEnemyType() {
    return this._pickEnemyType(0.5);
  }

  _spawnEnemy(x, y, patrolMin, patrolMax, d, forcedType = null) {
    const enemy = new ShadowNinjaEnemy(x, y, patrolMin, patrolMax, forcedType || this._pickEnemyType(d));
    const speedScale = 1 + 0.3 * d; // up to 30% faster at max difficulty
    enemy.patrolSpeed *= speedScale;
    enemy.chaseSpeed *= speedScale;
    this.enemies.push(enemy);
    return enemy;
  }

  // ---- pickups ----
  _addDiamond(x, y) {
    this.diamonds.push({ x, y, collected: false, phase: this._rand() * Math.PI * 2 });
  }

  _diamondLine(x0, x1, y, n) {
    for (let i = 0; i < n; i++) {
      this._addDiamond(x0 + (x1 - x0) * (n === 1 ? 0.5 : i / (n - 1)), y);
    }
  }

  // Parabola: low at both ends, `height` px higher in the middle (a jump arc)
  _diamondArc(cx, baseY, halfWidth, height, n) {
    for (let i = 0; i < n; i++) {
      const t = n === 1 ? 0 : -1 + (2 * i) / (n - 1);
      this._addDiamond(cx + t * halfWidth, baseY - height * (1 - t * t));
    }
  }

  _buildStandardGroundChunk(startX, d, gap) {
    const width = 800 + Math.floor(this._rand() * 400);
    const groundY = 560 + (this._rand() > 0.5 ? -40 : 20);

    this.solids.push({
      x: startX,
      y: groundY,
      width: width,
      height: 380,
      tag: 'ground',
      active: true
    });

    if (this._rand() > 0.3) {
      this.deadTrees.push({ x: startX + width * 0.75, y: groundY });
    }

    if (this._rand() > 0.4) {
      this.embeddedWeapons.push({ x: startX + width * 0.82, y: groundY, type: 'spear' });
      this.embeddedWeapons.push({ x: startX + width * 0.85, y: groundY, type: 'katana' });
    }

    this.lanterns.push({ x: startX + 180, y: groundY - 40 });
    this.lanterns.push({ x: startX + width - 180, y: groundY - 40 });

    // Spikes: rare early, common later (was a flat 60% from meter 0)
    const spikeX = startX + width * 0.45;
    if (this._rand() < 0.25 + 0.5 * d) {
      this.hazards.push({ x: spikeX, y: groundY - 16, width: 80, height: 24, tag: 'ground_spikes', active: true });
      // reward for jumping over them
      this._diamondArc(spikeX + 40, groundY - 56, 90, 90, 5);
    } else {
      this._diamondLine(startX + width * 0.3, startX + width * 0.55, groundY - 56, 4);
    }

    // Late game: a second spike patch near the end of wide chunks (never near the landing zone)
    if (d > 0.55 && width >= 1000 && this._rand() < 0.6) {
      this.hazards.push({ x: startX + width * 0.72, y: groundY - 16, width: 60, height: 24, tag: 'ground_spikes', active: true });
    }

    this._spawnEnemy(startX + width * 0.6, groundY - 56, startX + 200, startX + width - 80, d);
    if (d > 0.5 && this._rand() < 0.5) {
      this._spawnEnemy(startX + width * 0.3, groundY - 56, startX + 120, startX + width * 0.5, d);
    }

    this._safeSpot = { x: startX + 120, y: groundY };
    this.lastGroundY = groundY;
    this.generatedDistance = startX + width + gap;
  }

  _buildCollapsingBridgeChunk(startX, d, gap) {
    const bridgeStartX = startX;
    const plankCount = 7 + Math.floor(this._rand() * 4) + Math.floor(4 * d);
    const groundY = 560;

    for (let i = 0; i < plankCount; i++) {
      const px = bridgeStartX + i * 52;
      const plank = {
        x: px,
        y: groundY,
        originalY: groundY,
        width: 48,
        height: 14,
        tag: 'collapsing_plank',
        active: true,
        isFalling: false,
        rot: 0,
        fallDelay: 0.22 - 0.10 * d // planks give way faster later in the run
      };
      this.solids.push(plank);
      this.bridgePlanks.push(plank);
    }

    this.hazards.push({
      x: bridgeStartX,
      y: 780,
      width: plankCount * 54,
      height: 40,
      tag: 'abyss_spikes',
      active: true
    });

    // A trail of diamonds along the bridge: running is fast enough to grab them all
    this._diamondLine(bridgeStartX + 52, bridgeStartX + (plankCount - 1) * 52, groundY - 56, 6);

    this.generatedDistance = bridgeStartX + plankCount * 52 + gap;
  }

  _buildHighLedgeWallJumpChunk(startX, d, gap) {
    const groundY = 560;

    this.solids.push({
      x: startX,
      y: 340,
      width: 480,
      height: 480,
      tag: 'high_cliff',
      active: true
    });

    this.oniPillars.push({
      x: startX + 240,
      y: 340,
      width: 80,
      height: 240
    });

    this.hazards.push({
      x: startX + 60,
      y: 180,
      width: 260,
      height: 28,
      tag: 'ceiling_spikes',
      active: true
    });

    this.solids.push({
      x: startX + 560,
      y: groundY,
      width: 500,
      height: 380,
      tag: 'ground_lower',
      active: true
    });

    // Reward for the climb
    this._diamondLine(startX + 90, startX + 420, 340 - 52, 5);

    this._spawnEnemy(startX + 680, groundY - 56, startX + 580, startX + 1000, d);

    this._safeSpot = { x: startX + 600, y: groundY };
    this.generatedDistance = startX + 1060 + gap;
  }

  _buildPendulumAxeHazardChunk(startX, d, gap) {
    const width = 850;
    const groundY = 560;

    this.solids.push({
      x: startX,
      y: groundY,
      width: width,
      height: 380,
      tag: 'ground_pendulum',
      active: true
    });

    // Early: the blade passes above a standing player. Late: it is longer, lower and faster,
    // so you have to time it (jump, dash through, or wait).
    this.pendulumAxes.push({
      pivotX: startX + width * 0.48,
      pivotY: 160,
      length: 270 + 70 * d,
      angle: 0,
      maxAngle: 1.0 + 0.25 * d,
      speed: 1.2 + 0.8 * d,
      phase: this._rand() * Math.PI,
      bladeX: startX + width * 0.48,
      bladeY: 450
    });

    this.hokoraShrines.push({ x: startX + 160, y: groundY });

    // Risk / reward: diamonds directly under the blade
    this._diamondLine(startX + width * 0.48 - 100, startX + width * 0.48 + 100, groundY - 56, 5);

    this._spawnEnemy(startX + width * 0.75, groundY - 56, startX + width * 0.55, startX + width - 60, d);

    this._safeSpot = { x: startX + 100, y: groundY };
    this.generatedDistance = startX + width + gap;
  }

  _buildSpinningSkullSawChunk(startX, d, gap) {
    const width = 900;
    const groundY = 560;

    this.solids.push({
      x: startX,
      y: groundY,
      width: width,
      height: 380,
      tag: 'ground_saw',
      active: true
    });

    const moveRange = 60 + 30 * d;
    this.skullSawWheels.push({
      x: startX + 380,
      y: 440,
      baseY: 440,
      radius: 46,
      rotation: 0,
      rotSpeed: 3.2,
      moves: true,
      moveSpeed: 1.6,
      moveRange,
      phase: 0
    });

    // Late game: a second saw 300px later, moving in the opposite phase
    if (d > 0.5) {
      this.skullSawWheels.push({
        x: startX + 680,
        y: 440,
        baseY: 440,
        radius: 46,
        rotation: 0,
        rotSpeed: 3.2,
        moves: true,
        moveSpeed: 1.6,
        moveRange,
        phase: Math.PI
      });
    }

    this.demonClaws.push({ x: startX + 680, y: groundY });

    // Diamonds on the jump arc over the first saw
    this._diamondArc(startX + 380, groundY - 56, 110, 100, 5);

    this._safeSpot = { x: startX + 100, y: groundY };
    this.generatedDistance = startX + width + gap;
  }

  _buildTacticalCombatArenaChunk(startX, d, gap) {
    const width = 1000;
    const groundY = 560;

    this.solids.push({
      x: startX,
      y: groundY,
      width: width,
      height: 380,
      tag: 'arena_floor',
      active: true
    });

    this.solids.push({
      x: startX + 320,
      y: 400,
      width: 280,
      height: 24,
      tag: 'pagoda_platform',
      active: true
    });

    // Diamonds on the pagoda platform reward using the high ground
    this._diamondLine(startX + 360, startX + 560, 400 - 52, 4);

    // Was hard-coded assassin + oni from meter 0; now scales with difficulty
    this._spawnEnemy(startX + 240, groundY - 56, startX + 80, startX + 360, d);
    this._spawnEnemy(startX + 780, groundY - 56, startX + 640, startX + 940, d);
    if (d > 0.6) {
      this._spawnEnemy(startX + 520, groundY - 56, startX + 400, startX + 640, d);
    }

    this._safeSpot = { x: startX + 60, y: groundY };
    this.generatedDistance = startX + width + gap;
  }

  checkHazardCollision(x, y, w, h) {
    for (const haz of this.hazards) {
      if (!haz.active) continue;
      const hw = haz.width || 40;
      const hh = haz.height || 40;
      if (x + w > haz.x && x < haz.x + hw && y + h > haz.y && y < haz.y + hh) {
        return true;
      }
    }
    return false;
  }

  draw(ctx, camX, camY, time) {
    // Oni Stone Demon Pillars
    for (const p of this.oniPillars) {
      const px = p.x - camX;
      const py = p.y - camY;

      ctx.save();
      ctx.fillStyle = '#64748b';
      ctx.fillRect(px - 24, py + 20, 48, p.height);

      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(px, py + 80, 18, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(px - 8, py + 76, 5, 3);
      ctx.fillRect(px + 3, py + 76, 5, 3);

      ctx.fillStyle = '#475569';
      ctx.beginPath();
      ctx.moveTo(px - 20, py + 70);
      ctx.lineTo(px - 44, py + 30);
      ctx.lineTo(px - 44, py);
      ctx.lineTo(px - 32, py);
      ctx.lineTo(px - 14, py + 60);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(px + 20, py + 70);
      ctx.lineTo(px + 44, py + 30);
      ctx.lineTo(px + 44, py);
      ctx.lineTo(px + 32, py);
      ctx.lineTo(px + 14, py + 60);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // Dead Winter Trees
    for (const t of this.deadTrees) {
      const tx = t.x - camX;
      const ty = t.y - camY;

      ctx.save();
      ctx.fillStyle = '#05070d';
      ctx.fillRect(tx - 6, ty - 140, 12, 140);
      ctx.beginPath();
      ctx.moveTo(tx, ty - 80);
      ctx.lineTo(tx - 36, ty - 120);
      ctx.lineTo(tx - 48, ty - 165);
      ctx.lineTo(tx - 30, ty - 150);
      ctx.lineTo(tx - 24, ty - 185);

      ctx.moveTo(tx, ty - 100);
      ctx.lineTo(tx + 38, ty - 135);
      ctx.lineTo(tx + 54, ty - 175);
      ctx.lineTo(tx + 32, ty - 160);
      ctx.lineTo(tx + 42, ty - 195);
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = '#05070d';
      ctx.stroke();
      ctx.restore();
    }

    // Embedded Weapons
    for (const w of this.embeddedWeapons) {
      const wx = w.x - camX;
      const wy = w.y - camY;

      ctx.save();
      if (w.type === 'spear') {
        ctx.strokeStyle = '#05070d';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(wx, wy);
        ctx.lineTo(wx + 6, wy - 55);
        ctx.stroke();

        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.moveTo(wx + 6, wy - 55);
        ctx.lineTo(wx + 12, wy - 78);
        ctx.lineTo(wx + 2, wy - 65);
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.moveTo(wx, wy);
        ctx.lineTo(wx - 6, wy - 42);
        ctx.lineTo(wx - 2, wy - 48);
        ctx.lineTo(wx + 4, wy);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }

    // Lanterns
    for (const l of this.lanterns) {
      const lx = l.x - camX;
      const ly = l.y - camY;

      const halo = ctx.createRadialGradient(lx, ly, 4, lx, ly, 38);
      halo.addColorStop(0, 'rgba(251, 191, 36, 0.45)');
      halo.addColorStop(1, 'rgba(251, 191, 36, 0)');
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(lx, ly, 38, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(lx - 9, ly - 14, 18, 22);
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(lx - 5, ly - 8, 10, 12);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(lx - 12, ly - 16, 24, 4);
    }

    // Campfires
    for (const c of this.campfires) {
      const cx = c.x - camX;
      const cy = c.y - camY;

      const fireHalo = ctx.createRadialGradient(cx, cy - 8, 2, cx, cy - 8, 48);
      fireHalo.addColorStop(0, 'rgba(239, 68, 68, 0.55)');
      fireHalo.addColorStop(0.5, 'rgba(245, 158, 11, 0.35)');
      fireHalo.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = fireHalo;
      ctx.beginPath();
      ctx.arc(cx, cy - 8, 48, 0, Math.PI * 2);
      ctx.fill();

      const flicker = Math.sin(time * 12) * 4;
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.moveTo(cx - 10, cy);
      ctx.quadraticCurveTo(cx, cy - 24 + flicker, cx + 10, cy);
      ctx.closePath();
      ctx.fill();
    }

    // End of world features

    // Terrain solids
    for (const s of this.solids) {
      if (!s.active) continue;
      const sx = s.x - camX;
      const sy = s.y - camY;

      ctx.save();
      if (s.rot) {
        ctx.translate(sx + s.width / 2, sy + s.height / 2);
        ctx.rotate(s.rot);
        ctx.fillStyle = '#05070d';
        ctx.fillRect(-s.width / 2, -s.height / 2, s.width, s.height);
        ctx.restore();
        continue;
      }

      ctx.fillStyle = '#05070d';
      ctx.fillRect(sx, sy, s.width, s.height);

      if (this.biome === 'moonlight_ruins') {
        ctx.fillStyle = '#06b6d4';
        ctx.fillRect(sx, sy, s.width, 4);
      } else if (this.biome === 'scythe_chasm') {
        ctx.fillStyle = '#10b981';
        ctx.fillRect(sx, sy, s.width, 4);
      } else if (this.biome === 'crystal_abyss') {
        ctx.fillStyle = '#f43f5e';
        ctx.fillRect(sx, sy, s.width, 4);
      } else {
        // sunset_torii
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(sx, sy, s.width, 4);
      }

      ctx.restore();
    }

    // Hazards
    for (const h of this.hazards) {
      if (!h.active) continue;
      const hx = h.x - camX;
      const hy = h.y - camY;
      const hw = h.width || 60;
      const count = Math.max(3, Math.floor(hw / 14));

      ctx.fillStyle = '#05070d';
      for (let i = 0; i < count; i++) {
        const px = hx + i * 14;
        ctx.beginPath();
        if (h.tag === 'ceiling_spikes') {
          ctx.moveTo(px, hy);
          ctx.lineTo(px + 7, hy + 24);
          ctx.lineTo(px + 14, hy);
        } else {
          ctx.moveTo(px, hy + 24);
          ctx.lineTo(px + 7, hy);
          ctx.lineTo(px + 14, hy + 24);
        }
        ctx.closePath();
        ctx.fill();
      }
    }

    // Pendulum Axes
    for (const axe of this.pendulumAxes) {
      const px = axe.pivotX - camX;
      const py = axe.pivotY - camY;
      const bx = axe.bladeX - camX;
      const by = axe.bladeY - camY;

      ctx.fillStyle = '#261a14';
      ctx.fillRect(px - 6, py - 40, 12, 480);
      ctx.fillStyle = '#be123c';
      ctx.beginPath();
      ctx.arc(px, py - 40, 8, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(bx, by);
      ctx.stroke();

      ctx.save();
      ctx.translate(bx, by);
      ctx.rotate(axe.angle);

      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(0, 0, 36, Math.PI * 0.15, Math.PI * 0.85, false);
      ctx.quadraticCurveTo(0, 12, 36 * Math.cos(Math.PI * 0.15), 36 * Math.sin(Math.PI * 0.15));
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(0, 0, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Skull Saw Wheels
    for (const saw of this.skullSawWheels) {
      const sx = saw.x - camX;
      const sy = saw.y - camY;

      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(saw.rotation);

      ctx.fillStyle = '#ef4444';
      const teeth = 8;
      for (let i = 0; i < teeth; i++) {
        const ang = (i / teeth) * Math.PI * 2;
        ctx.save();
        ctx.rotate(ang);
        ctx.fillRect(-6, -saw.radius - 12, 12, 22);
        ctx.restore();
      }

      ctx.fillStyle = '#991b1b';
      ctx.beginPath();
      ctx.arc(0, 0, saw.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(0, 0, saw.radius * 0.65, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(-8, -4, 4, 0, Math.PI * 2);
      ctx.arc(8, -4, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    this._drawPickups(ctx, camX, camY, time);
  }

  _drawPickups(ctx, camX, camY, time) {
    // Diamonds: bobbing, glowing crystals
    for (const dm of this.diamonds) {
      if (dm.collected) continue;
      const sx = dm.x - camX;
      if (sx < -40 || sx > 2200) continue;
      const sy = dm.y - camY + Math.sin(time * 3 + dm.phase) * 4;

      ctx.save();
      ctx.translate(sx, sy);
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 14;
      ctx.fillStyle = '#7dd3fc';
      ctx.beginPath();
      ctx.moveTo(0, -12);
      ctx.lineTo(9, 0);
      ctx.lineTo(0, 12);
      ctx.lineTo(-9, 0);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.beginPath();
      ctx.moveTo(0, -12);
      ctx.lineTo(9, 0);
      ctx.lineTo(0, -1);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // Life Orbs: pulsing red orb with a white cross
    for (const o of this.healthOrbs) {
      if (o.collected) continue;
      const sx = o.x - camX;
      if (sx < -40 || sx > 2200) continue;
      const sy = o.y - camY + Math.sin(time * 2.4) * 5;
      const pulse = 1 + Math.sin(time * 5) * 0.08;

      ctx.save();
      ctx.translate(sx, sy);
      ctx.scale(pulse, pulse);
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 20;
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(0, 0, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-2.5, -8, 5, 16);
      ctx.fillRect(-8, -2.5, 16, 5);
      ctx.restore();
    }
  }
}
