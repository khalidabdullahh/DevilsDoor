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
  constructor(initialBiome = 'sunset_torii') {
    this.title = "Devil's Endless Descent";
    this.id = 'endless_v2';

    // Official 4K Realms - Locked to player's selection
    this.BIOME_CYCLE = ['sunset_torii', 'moonlight_ruins', 'scythe_chasm', 'crystal_abyss'];
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
    // Biome stays locked to player selection
    const px = player ? player.x : 0;
    const py = player ? player.y : 0;

    while (this.generatedDistance < px + 2800) {
      this._generateNextChunk();
    }

    // Boss Spawning
    const currentMeters = Math.floor(px / 10);
    if (currentMeters >= this.nextBossDistance) {
      this.nextBossDistance += 1000;
      const boss = new OniBossEnemy(px + 900, 480);
      this.enemies.push(boss);
      if (audio) audio.playEnemyAlert();
      if (camera) camera.addShake(0.8);
    }

    // Pendulum Axes
    for (const axe of this.pendulumAxes) {
      axe.angle = Math.sin(performance.now() * 0.0018 * axe.speed + axe.phase) * axe.maxAngle;
      axe.bladeX = axe.pivotX + Math.sin(axe.angle) * axe.length;
      axe.bladeY = axe.pivotY + Math.cos(axe.angle) * axe.length;

      if (player && !player.isDead) {
        const d = Math.hypot(player.x - axe.bladeX, (player.y + 20) - axe.bladeY);
        if (d < 46) {
          player.takeDamage(1, audio, camera);
        }
      }
    }

    // Skull Saw Wheels
    for (const saw of this.skullSawWheels) {
      saw.rotation += dt * saw.rotSpeed;
      if (saw.moves) {
        saw.y = saw.baseY + Math.sin(performance.now() * 0.002 * saw.moveSpeed) * saw.moveRange;
      }
      if (player && !player.isDead) {
        const d = Math.hypot(player.x - saw.x, (player.y + 20) - saw.y);
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
          if (plank.touchTimer > 0.18) {
            plank.isFalling = true;
            if (audio) audio.playStoneCollapse();
            if (camera) camera.addShake(0.3);
          }
        }
      }
    }

    // Diamonds
    for (const d of this.diamonds) {
      if (!d.collected && player) {
        const dist = Math.hypot(player.x - d.x, (player.y + 20) - d.y);
        if (dist < 38) {
          d.collected = true;
          player.diamonds = (player.diamonds || 0) + 1;
          player.score = (player.score || 0) + 250;
          if (audio) audio.playFootstep();
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
    this.campfires = this.campfires.filter(c => c.x > despawnThreshold);
    this.oniPillars = this.oniPillars.filter(p => p.x > despawnThreshold);
    this.deadTrees = this.deadTrees.filter(t => t.x > despawnThreshold);
    this.embeddedWeapons = this.embeddedWeapons.filter(w => w.x > despawnThreshold);
  }

  _generateNextChunk() {
    const startX = this.generatedDistance;
    const chunkType = Math.floor(Math.random() * 6);
    this.chunkIndex++;

    switch (chunkType) {
      case 0:
        this._buildStandardGroundChunk(startX);
        break;
      case 1:
        this._buildCollapsingBridgeChunk(startX);
        break;
      case 2:
        this._buildHighLedgeWallJumpChunk(startX);
        break;
      case 3:
        this._buildPendulumAxeHazardChunk(startX);
        break;
      case 4:
        this._buildSpinningSkullSawChunk(startX);
        break;
      case 5:
      default:
        this._buildTacticalCombatArenaChunk(startX);
        break;
    }
  }

  _getRandomEnemyType() {
    const r = Math.random();
    if (r < 0.3) return 'ronin'; // #02 Shadow Ronin
    if (r < 0.55) return 'oni'; // #03 Oni Guard
    if (r < 0.8) return 'assassin'; // #05 Crimson Assassin
    return 'monk'; // #04 Cursed Monk
  }

  _buildStandardGroundChunk(startX) {
    const width = 800 + Math.floor(Math.random() * 400);
    const groundY = 560 + (Math.random() > 0.5 ? -40 : 20);

    this.solids.push({
      x: startX,
      y: groundY,
      width: width,
      height: 380,
      tag: 'ground',
      active: true
    });

    if (Math.random() > 0.3) {
      this.deadTrees.push({ x: startX + width * 0.75, y: groundY });
    }

    if (Math.random() > 0.4) {
      this.embeddedWeapons.push({ x: startX + width * 0.82, y: groundY, type: 'spear' });
      this.embeddedWeapons.push({ x: startX + width * 0.85, y: groundY, type: 'katana' });
    }

    this.lanterns.push({ x: startX + 180, y: groundY - 40 });
    this.lanterns.push({ x: startX + width - 180, y: groundY - 40 });

    if (Math.random() > 0.4) {
      this.hazards.push({
        x: startX + width * 0.45,
        y: groundY - 16,
        width: 80,
        height: 24,
        tag: 'ground_spikes',
        active: true
      });
    }

    const enemyType = this._getRandomEnemyType();
    const enemy = new ShadowNinjaEnemy(startX + width * 0.6, groundY - 56, startX + 200, startX + width - 80, enemyType);
    this.enemies.push(enemy);

    this.lastGroundY = groundY;
    this.generatedDistance = startX + width + 90;
  }

  _buildCollapsingBridgeChunk(startX) {
    const bridgeStartX = startX;
    const plankCount = 7 + Math.floor(Math.random() * 4);
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
        rot: 0
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

    this.generatedDistance = bridgeStartX + plankCount * 52 + 80;
  }

  _buildHighLedgeWallJumpChunk(startX) {
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

    const enemyType = this._getRandomEnemyType();
    const enemy = new ShadowNinjaEnemy(startX + 680, groundY - 56, startX + 580, startX + 1000, enemyType);
    this.enemies.push(enemy);

    this.generatedDistance = startX + 1080;
  }

  _buildPendulumAxeHazardChunk(startX) {
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

    this.pendulumAxes.push({
      pivotX: startX + width * 0.48,
      pivotY: 160,
      length: 290,
      angle: 0,
      maxAngle: 1.15,
      speed: 1.4,
      phase: Math.random() * Math.PI,
      bladeX: startX + width * 0.48,
      bladeY: 450
    });

    this.hokoraShrines.push({ x: startX + 160, y: groundY });

    const enemyType = this._getRandomEnemyType();
    const enemy = new ShadowNinjaEnemy(startX + width * 0.75, groundY - 56, startX + width * 0.55, startX + width - 60, enemyType);
    this.enemies.push(enemy);

    this.generatedDistance = startX + width + 80;
  }

  _buildSpinningSkullSawChunk(startX) {
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

    this.skullSawWheels.push({
      x: startX + 380,
      y: 440,
      baseY: 440,
      radius: 46,
      rotation: 0,
      rotSpeed: 3.2,
      moves: true,
      moveSpeed: 1.6,
      moveRange: 60
    });

    this.demonClaws.push({ x: startX + 680, y: groundY });

    this.generatedDistance = startX + width + 90;
  }

  _buildTacticalCombatArenaChunk(startX) {
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

    const enemy1 = new ShadowNinjaEnemy(startX + 240, groundY - 56, startX + 80, startX + 360, 'assassin');
    const enemy2 = new ShadowNinjaEnemy(startX + 780, groundY - 56, startX + 640, startX + 940, 'oni');
    this.enemies.push(enemy1);
    this.enemies.push(enemy2);

    this.generatedDistance = startX + width + 100;
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
  }
}
