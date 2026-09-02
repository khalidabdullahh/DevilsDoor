import { ShadowNinjaEnemy } from '../entities/ShadowNinjaEnemy.js';

/**
 * Level01_Arashi — "The First Assumption" (Ninja Arashi 2 Dark Fantasy Benchmark).
 * Pure pitch-black silhouette terrain, gnarled pines, collapsing rope bridge deception,
 * bamboo sanctuary crypt, Shadow Spearman combat, and the mystic Devil's Door.
 */
export class Level01_Arashi {
  constructor() {
    this.id = 1;
    this.title = 'The First Assumption';
    this.playerStartX = 120;
    this.playerStartY = 300;

    this.solids = [];
    this.hazards = [];
    this.enemies = [];
    this.lanterns = [];
    this.bridgePlanks = [];

    this.deceptionTriggered = false;
    this.collapseTime = 0;

    this.door = {
      x: 1120,
      y: 560,
      width: 48,
      height: 80,
      vortexAngle: 0
    };

    this._buildLevel();
  }

  _buildLevel() {
    this.solids = [];
    this.hazards = [];
    this.enemies = [];
    this.lanterns = [];
    this.bridgePlanks = [];

    // --- 1. STARTING CLIFF (X = 0..380, Y = 360) ---
    this.solids.push({ x: 190, y: 360, width: 380, height: 400, tag: 'start_cliff', active: true });
    this.lanterns.push({ x: 80, y: 320 });
    this.lanterns.push({ x: 340, y: 320 });

    // --- 2. COLLAPSING WOODEN ROPE BRIDGE (X = 380..860, Y = 360) ---
    // 8 dynamic collapsing wooden planks
    for (let i = 0; i < 8; i++) {
      const px = 410 + i * 55;
      const plank = {
        x: px,
        y: 360,
        originalY: 360,
        width: 50,
        height: 16,
        tag: 'collapsing_plank',
        active: true,
        isFalling: false,
        rot: 0
      };
      this.solids.push(plank);
      this.bridgePlanks.push(plank);
    }

    // High Far Ledge (Decoy destination)
    this.solids.push({ x: 960, y: 360, width: 200, height: 400, tag: 'decoy_ledge', active: true });
    this.lanterns.push({ x: 920, y: 320 });

    // Overhead Spikes (Prevents jumping blindly over the collapse)
    this.hazards.push({ x: 620, y: 180, width: 280, height: 32, tag: 'ceiling_spikes', active: true });

    // --- 3. LOWER BAMBOO CRYPT (X = 100..1280, Y = 640) ---
    this.solids.push({ x: 690, y: 640, width: 1200, height: 300, tag: 'crypt_floor', active: true });
    this.lanterns.push({ x: 260, y: 600 });
    this.lanterns.push({ x: 560, y: 600 });
    this.lanterns.push({ x: 860, y: 600 });
    this.lanterns.push({ x: 1060, y: 600 });

    // Left Wall
    this.solids.push({ x: 50, y: 500, width: 100, height: 400, tag: 'crypt_wall_left', active: true });

    // Bamboo Spike Pit Hazard in Crypt
    this.hazards.push({ x: 420, y: 624, width: 90, height: 24, tag: 'bamboo_spikes', active: true });

    // --- 4. SHADOW NINJA ENEMY: SPEARMAN GUARD (X = 640..860, Y = 586) ---
    const spearman = new ShadowNinjaEnemy(720, 586, 620, 860, 'spear');
    this.enemies.push(spearman);
  }

  reset() {
    this.deceptionTriggered = false;
    this.collapseTime = 0;

    for (const p of this.bridgePlanks) {
      p.active = true;
      p.isFalling = false;
      p.y = p.originalY;
      p.rot = 0;
    }

    for (const e of this.enemies) {
      e.health = e.maxHealth;
      e.isDead = false;
      e.x = 720;
      e.y = 586;
      e.state = 'patrol';
    }
  }

  update(dt, player, audio, camera) {
    this.door.vortexAngle += dt * 3.0;

    // 1. Deception Engine Trigger: Player steps onto central rope bridge planks (X = 460..780, Y < 400)
    if (!this.deceptionTriggered && player) {
      if (player.x >= 460 && player.x <= 780 && player.y <= 380) {
        this.deceptionTriggered = true;
        this.collapseTime = 0;
        if (audio) audio.playStoneCollapse();
        if (camera) camera.addShake(0.65);
      }
    }

    // 2. Animate Dynamic Collapsing Bridge Planks
    if (this.deceptionTriggered) {
      this.collapseTime += dt;
      for (let i = 0; i < this.bridgePlanks.length; i++) {
        const p = this.bridgePlanks[i];
        const delay = i * 0.06;
        if (this.collapseTime > delay) {
          p.active = false; // Disable collision so ninja safely plummets
          p.isFalling = true;
          p.y += 420 * dt;
          p.rot += (i % 2 === 0 ? 1 : -1) * 3.5 * dt;
        }
      }
    }

    // 3. Update Enemies
    for (const enemy of this.enemies) {
      enemy.update(dt, player, audio, camera);
    }
  }

  isSolidAt(x, y) {
    for (const solid of this.solids) {
      if (!solid.active) continue;
      const left = solid.x - solid.width / 2;
      const right = solid.x + solid.width / 2;
      const top = solid.y;
      const bottom = solid.y + solid.height;
      if (x > left && x < right && y > top && y < bottom) return true;
    }
    return false;
  }

  resolve2D(px, py, pw, ph, dx, dy) {
    let finalX = px;
    let finalY = py;
    let collidedX = false;
    let collidedY = false;
    let grounded = false;

    const halfW = pw / 2;

    // X Axis
    finalX += dx;
    for (const solid of this.solids) {
      if (!solid.active) continue;
      const sLeft = solid.x - solid.width / 2;
      const sRight = solid.x + solid.width / 2;
      const sTop = solid.y;
      const sBottom = solid.y + solid.height;

      const pLeft = finalX - halfW;
      const pRight = finalX + halfW;
      const pTop = finalY;
      const pBottom = finalY + ph;

      if (pLeft < sRight && pRight > sLeft && pTop < sBottom && pBottom > sTop) {
        collidedX = true;
        if (dx > 0) finalX = sLeft - halfW;
        else if (dx < 0) finalX = sRight + halfW;
      }
    }

    // Y Axis
    finalY += dy;
    for (const solid of this.solids) {
      if (!solid.active) continue;
      const sLeft = solid.x - solid.width / 2;
      const sRight = solid.x + solid.width / 2;
      const sTop = solid.y;
      const sBottom = solid.y + solid.height;

      const pLeft = finalX - halfW;
      const pRight = finalX + halfW;
      const pTop = finalY;
      const pBottom = finalY + ph;

      if (pLeft < sRight && pRight > sLeft && pTop < sBottom && pBottom > sTop) {
        collidedY = true;
        if (dy > 0) {
          finalY = sTop - ph;
          grounded = true;
        } else if (dy < 0) {
          finalY = sBottom;
        }
      }
    }

    return { x: finalX, y: finalY, collidedX, collidedY, grounded };
  }

  checkHazardCollision(px, py, pw, ph) {
    const halfW = pw / 2;
    const pLeft = px - halfW;
    const pRight = px + halfW;
    const pTop = py;
    const pBottom = py + ph;

    for (const h of this.hazards) {
      if (!h.active) continue;
      const hLeft = h.x - h.width / 2;
      const hRight = h.x + h.width / 2;
      const hTop = h.y;
      const hBottom = h.y + h.height;

      if (pLeft < hRight && pRight > hLeft && pTop < hBottom && pBottom > hTop) {
        return h;
      }
    }
    return null;
  }

  checkDoorEntry(player) {
    if (!player || player.isDead) return false;
    const dx = Math.abs(player.x - this.door.x);
    const dy = Math.abs(player.y - this.door.y);
    return dx < 36 && dy < 48;
  }

  draw(ctx, camX, camY) {
    // 1. Draw Glowing Lantern Light Cones (Radial Halo underneath)
    for (const l of this.lanterns) {
      const lx = l.x - camX;
      const ly = l.y - camY;

      const halo = ctx.createRadialGradient(lx, ly, 4, lx, ly, 110);
      halo.addColorStop(0, 'rgba(251, 191, 36, 0.45)');
      halo.addColorStop(0.5, 'rgba(245, 158, 11, 0.18)');
      halo.addColorStop(1, 'rgba(217, 119, 6, 0)');

      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(lx, ly, 110, 0, Math.PI * 2);
      ctx.fill();
    }

    // 2. Draw Pitch-Black Obsidian Terrain Silhouettes
    ctx.fillStyle = '#05080f';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.95)';
    ctx.shadowBlur = 10;

    for (const solid of this.solids) {
      if (!solid.active && solid.isFalling) {
        // Draw Falling Plank
        ctx.save();
        ctx.translate(solid.x - camX, solid.y - camY);
        ctx.rotate(solid.rot);
        ctx.fillRect(-solid.width / 2, -solid.height / 2, solid.width, solid.height);
        ctx.restore();
        continue;
      }

      if (!solid.active) continue;
      const sx = solid.x - solid.width / 2 - camX;
      const sy = solid.y - camY;

      ctx.fillRect(sx, sy, solid.width, solid.height);

      // Top Moss / Grass Tuft Details on solid ledges
      if (solid.tag !== 'collapsing_plank') {
        ctx.beginPath();
        for (let gx = sx; gx < sx + solid.width; gx += 16) {
          ctx.moveTo(gx, sy);
          ctx.lineTo(gx + 3, sy - 5);
          ctx.lineTo(gx + 6, sy);
        }
        ctx.fill();
      }
    }

    // 3. Draw Gnarled Ancient Japanese Pine Trees on Start Cliff
    this._drawGnarledPine(ctx, 160 - camX, 360 - camY);

    // 4. Draw Wooden Rope Bridge Suspension Cables
    ctx.strokeStyle = '#05080f';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(380 - camX, 330 - camY);
    ctx.quadraticCurveTo(620 - camX, 365 - camY, 860 - camX, 330 - camY);
    ctx.stroke();

    // 5. Draw Hanging Paper Lanterns
    for (const l of this.lanterns) {
      this._drawLantern(ctx, l.x - camX, l.y - camY);
    }

    // 6. Draw Bamboo Spikes Hazard
    for (const h of this.hazards) {
      const hx = h.x - h.width / 2 - camX;
      const hy = h.y - camY;

      ctx.fillStyle = '#05080f';
      ctx.beginPath();
      for (let sx = hx; sx < hx + h.width; sx += 12) {
        if (h.tag === 'ceiling_spikes') {
          ctx.moveTo(sx, hy);
          ctx.lineTo(sx + 6, hy + h.height);
          ctx.lineTo(sx + 12, hy);
        } else {
          ctx.moveTo(sx, hy + h.height);
          ctx.lineTo(sx + 6, hy);
          ctx.lineTo(sx + 12, hy + h.height);
        }
      }
      ctx.closePath();
      ctx.fill();
    }

    // 7. Draw Mystic Devil's Door Torii Archway & Swirling Cosmic Portal
    this._drawDevilDoor(ctx, this.door.x - camX, this.door.y - camY, this.door.vortexAngle);
  }

  _drawGnarledPine(ctx, x, y) {
    ctx.save();
    ctx.fillStyle = '#05080f';

    // Trunk
    ctx.beginPath();
    ctx.moveTo(x - 14, y);
    ctx.quadraticCurveTo(x - 28, y - 80, x - 10, y - 140);
    ctx.quadraticCurveTo(x + 35, y - 90, x + 14, y);
    ctx.closePath();
    ctx.fill();

    // Spreading Branches & Pine Needle Clusters
    const clusters = [
      { bx: x - 45, by: y - 130, r: 36 },
      { bx: x + 15, by: y - 155, r: 42 },
      { bx: x + 65, by: y - 120, r: 34 },
      { bx: x - 10, by: y - 180, r: 38 }
    ];

    for (const c of clusters) {
      ctx.beginPath();
      ctx.arc(c.bx, c.by, c.r, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  _drawLantern(ctx, x, y) {
    ctx.save();
    // Hanging Cord
    ctx.strokeStyle = '#05080f';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y - 24);
    ctx.lineTo(x, y - 10);
    ctx.stroke();

    // Top Cap
    ctx.fillStyle = '#05080f';
    ctx.beginPath();
    ctx.moveTo(x - 12, y - 10);
    ctx.lineTo(x, y - 16);
    ctx.lineTo(x + 12, y - 10);
    ctx.closePath();
    ctx.fill();

    // Glowing Amber Core
    ctx.fillStyle = '#fbbf24';
    ctx.shadowColor = '#f59e0b';
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.roundRect(x - 8, y - 10, 16, 20, 3);
    ctx.fill();

    // Bottom Tassel
    ctx.fillStyle = '#05080f';
    ctx.shadowBlur = 0;
    ctx.fillRect(x - 10, y + 10, 20, 3);
    ctx.fillRect(x - 1.5, y + 13, 3, 10);

    ctx.restore();
  }

  _drawDevilDoor(ctx, x, y, vortexAngle) {
    ctx.save();
    ctx.translate(x, y);

    // Torii Arch Pillars
    ctx.fillStyle = '#05080f';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
    ctx.shadowBlur = 12;

    ctx.fillRect(-28, 0, 10, 80);
    ctx.fillRect(18, 0, 10, 80);

    // Top Lintel
    ctx.beginPath();
    ctx.moveTo(-42, -10);
    ctx.quadraticCurveTo(0, -18, 42, -10);
    ctx.lineTo(38, 0);
    ctx.quadraticCurveTo(0, -8, -38, 0);
    ctx.closePath();
    ctx.fill();

    // Swirling Cosmic Portal Vortex
    ctx.save();
    ctx.translate(0, 40);
    ctx.rotate(vortexAngle);

    const portalGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, 28);
    portalGrad.addColorStop(0, '#ffffff');
    portalGrad.addColorStop(0.35, '#38bdf8');
    portalGrad.addColorStop(0.7, '#0ea5e9');
    portalGrad.addColorStop(1, 'rgba(3, 105, 161, 0)');

    ctx.fillStyle = portalGrad;
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 24;
    ctx.beginPath();
    ctx.arc(0, 0, 28, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
    ctx.restore();
  }
}
