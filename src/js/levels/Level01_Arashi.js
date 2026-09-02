import { ShadowNinjaEnemy } from '../entities/ShadowNinjaEnemy.js';

/**
 * Level01_Arashi — "The First Assumption" (Complete 1,800px Ninja Arashi Benchmark).
 * Journey:
 * Mountain Ledge -> Collapsing Rope Bridge -> Lower Combat Corridor (Shadow Scout & Spearman)
 * -> Bamboo Spike Hazards -> Ancient Torii Devil's Door Portal.
 */
export class Level01_Arashi {
  constructor() {
    this.id = 1;
    this.title = 'The First Assumption';
    this.playerStartX = 100;
    this.playerStartY = 220;

    this.solids = [];
    this.hazards = [];
    this.enemies = [];
    this.lanterns = [];
    this.bridgePlanks = [];

    this.deceptionTriggered = false;
    this.collapseTime = 0;

    this.door = {
      x: 1620,
      y: 480,
      width: 54,
      height: 84,
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

    // --- 1. STARTING MOUNTAIN LEDGE (X = 0..400, Y = 280) ---
    this.solids.push({ x: 200, y: 280, width: 400, height: 450, tag: 'start_cliff', active: true });
    this.lanterns.push({ x: 80, y: 240 });
    this.lanterns.push({ x: 360, y: 240 });

    // --- 2. COLLAPSING WOODEN ROPE BRIDGE (X = 400..820, Y = 280) ---
    for (let i = 0; i < 8; i++) {
      const px = 430 + i * 50;
      const plank = {
        x: px,
        y: 280,
        originalY: 280,
        width: 46,
        height: 14,
        tag: 'collapsing_plank',
        active: true,
        isFalling: false,
        rot: 0
      };
      this.solids.push(plank);
      this.bridgePlanks.push(plank);
    }

    // High Far Decoy Ledge (X = 820..1020, Y = 280)
    this.solids.push({ x: 920, y: 280, width: 200, height: 450, tag: 'decoy_ledge', active: true });
    this.lanterns.push({ x: 880, y: 240 });

    // Overhead Spikes (Prevents jumping over the gap)
    this.hazards.push({ x: 610, y: 120, width: 280, height: 32, tag: 'ceiling_spikes', active: true });

    // --- 3. LOWER COMBAT ARENA (X = 200..1800, Y = 560) ---
    this.solids.push({ x: 1000, y: 560, width: 1600, height: 300, tag: 'crypt_floor', active: true });
    this.lanterns.push({ x: 320, y: 520 });
    this.lanterns.push({ x: 680, y: 520 });
    this.lanterns.push({ x: 1080, y: 520 });
    this.lanterns.push({ x: 1480, y: 520 });

    // Left Crypt Wall
    this.solids.push({ x: 150, y: 420, width: 100, height: 300, tag: 'crypt_wall_left', active: true });

    // --- 4. TACTICAL COMBAT & SPIKE TRAPS ---
    // Enemy 1: Shadow Scout Swordsman (X = 720)
    const scout = new ShadowNinjaEnemy(720, 506, 600, 840, 'scout');
    this.enemies.push(scout);

    // Hazard 1: Bamboo Spike Pit (X = 920) between Scout and Spearman
    this.hazards.push({ x: 920, y: 544, width: 85, height: 24, tag: 'bamboo_spikes', active: true });

    // Enemy 2: Shadow Spearman Guard (X = 1200)
    const spearman = new ShadowNinjaEnemy(1200, 506, 1050, 1340, 'spear');
    this.enemies.push(spearman);

    // Hazard 2: Floor Spikes (X = 1380) right behind the Spearman
    this.hazards.push({ x: 1380, y: 544, width: 75, height: 24, tag: 'floor_spikes', active: true });
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

    for (let i = 0; i < this.enemies.length; i++) {
      const e = this.enemies[i];
      e.health = e.maxHealth;
      e.isDead = false;
      e.x = i === 0 ? 720 : 1200;
      e.y = 506;
      e.state = 'patrol';
    }
  }

  update(dt, player, audio, camera) {
    this.door.vortexAngle += dt * 2.8;

    // 1. Deception Trigger: Player steps onto central rope bridge planks (X = 460..780, Y < 320)
    if (!this.deceptionTriggered && player) {
      if (player.x >= 460 && player.x <= 780 && player.y <= 300) {
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
        const delay = i * 0.05;
        if (this.collapseTime > delay) {
          p.active = false;
          p.isFalling = true;
          p.y += 440 * dt;
          p.rot += (i % 2 === 0 ? 1 : -1) * 3.5 * dt;
        }
      }
    }

    // 3. Update Enemies
    for (const enemy of this.enemies) {
      enemy.update(dt, player, audio, camera, this);
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
    return dx < 40 && dy < 50;
  }

  draw(ctx, camX, camY) {
    // 1. Draw Glowing Lantern Light Halos (Warm Amber Radial Halo)
    for (const l of this.lanterns) {
      const lx = l.x - camX;
      const ly = l.y - camY;

      const halo = ctx.createRadialGradient(lx, ly, 4, lx, ly, 100);
      halo.addColorStop(0, 'rgba(251, 191, 36, 0.4)');
      halo.addColorStop(0.5, 'rgba(245, 158, 11, 0.15)');
      halo.addColorStop(1, 'rgba(217, 119, 6, 0)');

      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(lx, ly, 100, 0, Math.PI * 2);
      ctx.fill();
    }

    // 2. Draw Pitch-Black Obsidian Terrain Silhouettes
    ctx.fillStyle = '#05080f';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.95)';
    ctx.shadowBlur = 10;

    for (const solid of this.solids) {
      if (!solid.active && solid.isFalling) {
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

      // Top Moss/Grass Details on Ledges
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

    // 3. Draw Ancient Japanese Pine Tree on Start Cliff
    this._drawGnarledPine(ctx, 160 - camX, 280 - camY);

    // 4. Draw Wooden Rope Bridge Suspension Cables
    ctx.strokeStyle = '#05080f';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(400 - camX, 250 - camY);
    ctx.quadraticCurveTo(610 - camX, 285 - camY, 820 - camX, 250 - camY);
    ctx.stroke();

    // 5. Draw Hanging Paper Lanterns
    for (const l of this.lanterns) {
      this._drawLantern(ctx, l.x - camX, l.y - camY);
    }

    // 6. Draw Spikes Hazards
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

    // 7. Draw Mystic Torii Devil's Door Portal
    this._drawDevilDoor(ctx, this.door.x - camX, this.door.y - camY, this.door.vortexAngle);
  }

  _drawGnarledPine(ctx, x, y) {
    ctx.save();
    ctx.fillStyle = '#05080f';

    // Trunk
    ctx.beginPath();
    ctx.moveTo(x - 14, y);
    ctx.quadraticCurveTo(x - 26, y - 70, x - 8, y - 130);
    ctx.quadraticCurveTo(x + 32, y - 80, x + 14, y);
    ctx.closePath();
    ctx.fill();

    // Needle Clusters
    const clusters = [
      { bx: x - 40, by: y - 120, r: 34 },
      { bx: x + 15, by: y - 145, r: 40 },
      { bx: x + 60, by: y - 110, r: 32 }
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
    ctx.strokeStyle = '#05080f';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y - 22);
    ctx.lineTo(x, y - 10);
    ctx.stroke();

    ctx.fillStyle = '#05080f';
    ctx.beginPath();
    ctx.moveTo(x - 12, y - 10);
    ctx.lineTo(x, y - 15);
    ctx.lineTo(x + 12, y - 10);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#fbbf24';
    ctx.shadowColor = '#f59e0b';
    ctx.shadowBlur = 16;
    ctx.beginPath();
    ctx.roundRect(x - 7, y - 10, 14, 18, 3);
    ctx.fill();

    ctx.fillStyle = '#05080f';
    ctx.shadowBlur = 0;
    ctx.fillRect(x - 9, y + 8, 18, 3);
    ctx.fillRect(x - 1.5, y + 11, 3, 8);

    ctx.restore();
  }

  _drawDevilDoor(ctx, x, y, vortexAngle) {
    ctx.save();
    ctx.translate(x, y);

    // Torii Arch Pillars
    ctx.fillStyle = '#05080f';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
    ctx.shadowBlur = 14;

    ctx.fillRect(-28, 0, 10, 84);
    ctx.fillRect(18, 0, 10, 84);

    // Glowing Runic Glyphs on Pillars
    ctx.fillStyle = '#38bdf8';
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 12;
    for (let py = 16; py <= 64; py += 16) {
      ctx.fillRect(-24, py, 2.5, 5);
      ctx.fillRect(22, py, 2.5, 5);
    }

    // Top Curved Lintel
    ctx.fillStyle = '#05080f';
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.moveTo(-44, -10);
    ctx.quadraticCurveTo(0, -18, 44, -10);
    ctx.lineTo(40, 0);
    ctx.quadraticCurveTo(0, -8, -40, 0);
    ctx.closePath();
    ctx.fill();

    // Swirling Cosmic Portal Vortex
    ctx.save();
    ctx.translate(0, 42);
    ctx.rotate(vortexAngle);

    // Outer Aura
    const portalGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, 30);
    portalGrad.addColorStop(0, '#ffffff');
    portalGrad.addColorStop(0.35, '#38bdf8');
    portalGrad.addColorStop(0.7, '#0284c7');
    portalGrad.addColorStop(1, 'rgba(2, 132, 199, 0)');

    ctx.fillStyle = portalGrad;
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 24;
    ctx.beginPath();
    ctx.arc(0, 0, 30, 0, Math.PI * 2);
    ctx.fill();

    // 3 Rotating Energy Spiral Arms
    ctx.strokeStyle = '#e0f2fe';
    ctx.lineWidth = 2.5;
    for (let a = 0; a < 3; a++) {
      const armAngle = (a * Math.PI * 2) / 3;
      ctx.beginPath();
      ctx.arc(0, 0, 18, armAngle, armAngle + Math.PI / 2);
      ctx.stroke();
    }

    ctx.restore();
    ctx.restore();
  }
}
