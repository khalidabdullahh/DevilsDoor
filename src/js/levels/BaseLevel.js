import { ShadowNinjaEnemy } from '../entities/ShadowNinjaEnemy.js';
import { OniBossEnemy } from '../entities/OniBossEnemy.js';

/**
 * BaseLevel — Master Blueprint for all 10 Campaign Levels.
 * Features organic silhouette terrain, swinging pendulum battleaxes, campfires,
 * clay vessels, hokora shrines, and the Ascending Runic Shrine exit.
 */
export class BaseLevel {
  constructor(id, title, biome = 'desert', width = 1800, height = 900) {
    this.id = id;
    this.title = title;
    this.biome = biome;
    this.width = width;
    this.height = height;

    this.playerStartX = 100;
    this.playerStartY = 220;

    this.solids = [];
    this.hazards = [];
    this.enemies = [];
    this.lanterns = [];
    this.campfires = [];
    this.urns = [];
    this.pendulumAxes = [];
    this.bridgePlanks = [];

    this.deceptionTriggered = false;
    this.collapseTime = 0;

    this.door = {
      x: width - 180,
      y: 480,
      width: 54,
      height: 84,
      vortexAngle: 0,
      beamHeight: 0
    };
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
      if (e instanceof OniBossEnemy) {
        e.health = e.maxHealth;
        e.isDead = false;
        e.x = 1200;
        e.y = 430;
        e.state = 'idle';
      } else {
        e.health = e.maxHealth;
        e.isDead = false;
        e.x = e.patrolMin + 40;
        e.state = 'patrol';
      }
    }
  }

  update(dt, player, audio, camera) {
    this.door.vortexAngle += dt * 3.0;

    // 1. Update Swinging Pendulum Battleaxes
    for (const axe of this.pendulumAxes) {
      axe.angle += axe.speed * dt;
      const swingX = axe.anchorX + Math.sin(axe.angle) * axe.length;
      const swingY = axe.anchorY + Math.cos(axe.angle) * axe.length;

      // Check collision with player
      if (player && !player.isDead) {
        if (Math.hypot(player.x - swingX, player.y - swingY) < 32) {
          player.takeDamage(1, Math.cos(axe.angle) > 0 ? 1 : -1, audio);
          if (camera) camera.addShake(0.5);
        }
      }
    }

    // 2. Animate Dynamic Collapsing Bridge Planks (if present)
    if (this.deceptionTriggered) {
      this.collapseTime += dt;
      for (let i = 0; i < this.bridgePlanks.length; i++) {
        const p = this.bridgePlanks[i];
        if (this.collapseTime > i * 0.05) {
          p.active = false;
          p.isFalling = true;
          p.y += 440 * dt;
          p.rot += (i % 2 === 0 ? 1 : -1) * 3.5 * dt;
        }
      }
    }

    // 3. Update Enemies & Bosses
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
    return dx < 45 && dy < 60;
  }

  draw(ctx, camX, camY, time = 0) {
    // 1. Lantern Halos
    for (const l of this.lanterns) {
      const lx = l.x - camX;
      const ly = l.y - camY;
      const halo = ctx.createRadialGradient(lx, ly, 4, lx, ly, 100);
      halo.addColorStop(0, 'rgba(251, 191, 36, 0.4)');
      halo.addColorStop(1, 'rgba(217, 119, 6, 0)');
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(lx, ly, 100, 0, Math.PI * 2);
      ctx.fill();
    }

    // 2. Campfires (Screenshot 1 Match)
    for (const cf of this.campfires) {
      this._drawCampfire(ctx, cf.x - camX, cf.y - camY, time);
    }

    // 3. Terrain Solids
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

      // Top grass / moss details
      if (solid.tag !== 'collapsing_plank') {
        ctx.beginPath();
        for (let gx = sx; gx < sx + solid.width; gx += 16) {
          ctx.moveTo(gx, sy);
          ctx.lineTo(gx + 3, sy - 5);
          ctx.lineTo(gx + 6, sy);
        }
        ctx.fill();
      }

      // Hanging Icicles in Ice Biome
      if (this.biome === 'ice') {
        ctx.fillStyle = '#e0f2fe';
        ctx.beginPath();
        for (let ix = sx + 8; ix < sx + solid.width - 8; ix += 24) {
          ctx.moveTo(ix, sy + solid.height);
          ctx.lineTo(ix + 4, sy + solid.height + 18);
          ctx.lineTo(ix + 8, sy + solid.height);
        }
        ctx.fill();
        ctx.fillStyle = '#05080f';
      }
    }

    // 4. Ancient Clay Urns (*Tsubo* Jars — Screenshot 4 Match)
    for (const u of this.urns) {
      this._drawClayUrn(ctx, u.x - camX, u.y - camY);
    }

    // 5. Hanging Lanterns
    for (const l of this.lanterns) {
      this._drawLantern(ctx, l.x - camX, l.y - camY);
    }

    // 6. Swinging Pendulum Battleaxes (Screenshot 5 Match)
    for (const axe of this.pendulumAxes) {
      this._drawPendulumAxe(ctx, axe, camX, camY);
    }

    // 7. Spike Hazards
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

    // 8. Runic Shrine & Ascending Beam Exit
    this._drawExitShrine(ctx, this.door.x - camX, this.door.y - camY, this.door.vortexAngle);
  }

  _drawCampfire(ctx, x, y, time) {
    ctx.save();
    // Warm Light Glow
    const fireHalo = ctx.createRadialGradient(x, y - 10, 4, x, y - 10, 110);
    fireHalo.addColorStop(0, 'rgba(249, 115, 22, 0.45)');
    fireHalo.addColorStop(1, 'rgba(234, 88, 12, 0)');
    ctx.fillStyle = fireHalo;
    ctx.beginPath();
    ctx.arc(x, y - 10, 110, 0, Math.PI * 2);
    ctx.fill();

    // Wood Logs
    ctx.fillStyle = '#05080f';
    ctx.fillRect(x - 14, y - 4, 28, 6);

    // Flickering Flame
    const flicker = Math.sin(time * 12) * 4;
    ctx.fillStyle = '#f97316';
    ctx.shadowColor = '#fbbf24';
    ctx.shadowBlur = 16;
    ctx.beginPath();
    ctx.moveTo(x - 10, y - 4);
    ctx.quadraticCurveTo(x - 4, y - 24 + flicker, x, y - 32 + flicker);
    ctx.quadraticCurveTo(x + 4, y - 24 + flicker, x + 10, y - 4);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.moveTo(x - 5, y - 4);
    ctx.quadraticCurveTo(x, y - 16 + flicker, x, y - 22 + flicker);
    ctx.quadraticCurveTo(x, y - 16 + flicker, x + 5, y - 4);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  _drawClayUrn(ctx, x, y) {
    ctx.save();
    ctx.fillStyle = '#05080f';
    ctx.beginPath();
    ctx.ellipse(x, y - 12, 10, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(x - 6, y - 28, 12, 5);
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

  _drawPendulumAxe(ctx, axe, camX, camY) {
    const ax = axe.anchorX - camX;
    const ay = axe.anchorY - camY;
    const bx = ax + Math.sin(axe.angle) * axe.length;
    const by = ay + Math.cos(axe.angle) * axe.length;

    ctx.save();
    // Chain / Rod
    ctx.strokeStyle = '#05080f';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(bx, by);
    ctx.stroke();

    // Anchor Pin
    ctx.fillStyle = '#05080f';
    ctx.beginPath();
    ctx.arc(ax, ay, 6, 0, Math.PI * 2);
    ctx.fill();

    // Red Crescent Battleaxe Blade
    ctx.save();
    ctx.translate(bx, by);
    ctx.rotate(-axe.angle);

    ctx.fillStyle = '#ef4444';
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 16;
    ctx.beginPath();
    ctx.arc(0, 0, 26, -Math.PI * 0.75, Math.PI * 0.75);
    ctx.lineTo(0, 0);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#05080f';
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.arc(0, 0, 12, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
    ctx.restore();
  }

  _drawExitShrine(ctx, x, y, vortexAngle) {
    ctx.save();
    ctx.translate(x, y);

    // Ancient Stone Torii Pillars
    ctx.fillStyle = '#05080f';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
    ctx.shadowBlur = 14;
    ctx.fillRect(-28, 0, 10, 84);
    ctx.fillRect(18, 0, 10, 84);

    // Glowing Cyan Runic Glyphs
    ctx.fillStyle = '#38bdf8';
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 12;
    for (let py = 16; py <= 64; py += 16) {
      ctx.fillRect(-24, py, 2.5, 5);
      ctx.fillRect(22, py, 2.5, 5);
    }

    // Top Lintel Beam
    ctx.fillStyle = '#05080f';
    ctx.beginPath();
    ctx.moveTo(-44, -10);
    ctx.quadraticCurveTo(0, -18, 44, -10);
    ctx.lineTo(40, 0);
    ctx.quadraticCurveTo(0, -8, -40, 0);
    ctx.closePath();
    ctx.fill();

    // Vertical Ascending Celestial Light Beam (Screenshot 5 Match)
    const beamGrad = ctx.createLinearGradient(0, 84, 0, -450);
    beamGrad.addColorStop(0, 'rgba(56, 189, 248, 0.75)');
    beamGrad.addColorStop(0.5, 'rgba(14, 165, 233, 0.45)');
    beamGrad.addColorStop(1, 'rgba(3, 105, 161, 0)');
    ctx.fillStyle = beamGrad;
    ctx.fillRect(-14, -450, 28, 534);

    // Inner Swirling Cosmic Portal
    ctx.save();
    ctx.translate(0, 42);
    ctx.rotate(vortexAngle);

    const portalGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, 28);
    portalGrad.addColorStop(0, '#ffffff');
    portalGrad.addColorStop(0.35, '#38bdf8');
    portalGrad.addColorStop(0.7, '#0284c7');
    portalGrad.addColorStop(1, 'rgba(2, 132, 199, 0)');

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
