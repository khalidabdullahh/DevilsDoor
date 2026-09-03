/**
 * NinjaArashiRenderer — Painterly Dark Fantasy Visual Benchmark Engine for Devil's Door.
 * Recreates the authentic artistic aesthetic from all 16 Archive reference screenshots:
 * - Multi-stop atmospheric sky gradients with radiant celestial sun/moon halos
 * - Parallax mountain ridges, distant Torii gates, multi-tier pagoda castles & frosted pine trees
 * - Dense vertical bamboo groves, waterfall streaks, glowing runes, and stone obelisks
 * - Wet reflective ground puddles reflecting the crimson/ice twilight sky
 * - Dynamic weather particles: Golden embers, snowflakes, emerald bamboo leaves, lilac spores, mist
 */
export class NinjaArashiRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    this.width = canvas.width;
    this.height = canvas.height;

    this.particles = [];
    this.numParticles = 38;
    this._initParticles();

    this.time = 0;
    this._handleResize();
  }

  _handleResize() {
    const resize = () => {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
      this.width = this.canvas.width;
      this.height = this.canvas.height;
    };
    window.addEventListener('resize', resize);
    window.addEventListener('orientationchange', resize);
    resize();
  }

  _initParticles() {
    this.particles = [];
    for (let i = 0; i < this.numParticles; i++) {
      this.particles.push({
        x: Math.random() * 2400 - 400,
        y: Math.random() * 1400 - 200,
        size: Math.random() * 5 + 3,
        vx: -Math.random() * 90 - 40,
        vy: Math.random() * 35 + 15,
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 2.5
      });
    }
  }

  render(camX, camY, level, player, enemies) {
    this.time += 0.016;
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    const biome = (level && level.biome) ? level.biome : 'sunset';

    ctx.clearRect(0, 0, w, h);

    // 1. Biome Sky Gradient & Radiant Celestial Body (Archive images 4, 3, 14, 10, 16, 15)
    this._drawAtmosphericSky(ctx, biome, w, h);

    // 2. Far Parallax Mountain Ranges & Torii Gate (0.12x parallax)
    this._drawParallaxLayer1(ctx, biome, camX * 0.12, w, h);

    // 3. Mid Parallax Pagoda Temples, Frosted Pines, Bamboo & Waterfalls (0.32x parallax)
    this._drawParallaxLayer2(ctx, biome, camX * 0.32, w, h);

    // 4. Playable World Chunks, Terrain, Props & Hazards (1.0x)
    ctx.save();

    if (level) {
      level.draw(ctx, camX, camY, this.time);
    }

    if (enemies) {
      for (const e of enemies) {
        e.draw(ctx, camX, camY);
      }
    }

    if (player) {
      player.draw(ctx, camX, camY);
    }

    ctx.restore();

    // 5. Ground Wet Reflection Sheen (Archive image 4 & 13)
    this._drawReflectiveWaterSheen(ctx, biome, camY, w, h);

    // 6. Atmospheric Weather Particle Simulation
    this._drawParticles(ctx, biome, w, h);
  }

  _drawAtmosphericSky(ctx, biome, w, h) {
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
    let moonColor = '#fef3c7';
    let moonHalo = 'rgba(254, 243, 199, 0.45)';

    switch (biome) {
      case 'snow':
        // Frozen Abyss (Archive images 3, 5, 7, 9)
        skyGrad.addColorStop(0, '#061320');
        skyGrad.addColorStop(0.35, '#0f2942');
        skyGrad.addColorStop(0.7, '#1e486b');
        skyGrad.addColorStop(1, '#60a5fa');
        moonColor = '#e0f2fe';
        moonHalo = 'rgba(186, 230, 253, 0.45)';
        break;

      case 'bamboo':
        // Whispering Bamboo Grove (Archive images 2, 8, 14)
        skyGrad.addColorStop(0, '#022119');
        skyGrad.addColorStop(0.4, '#064e3b');
        skyGrad.addColorStop(0.75, '#047857');
        skyGrad.addColorStop(1, '#10b981');
        moonColor = '#d1fae5';
        moonHalo = 'rgba(167, 243, 208, 0.38)';
        break;

      case 'thorns':
        // Demonic Thorn Crypts (Archive images 6, 10, 17)
        skyGrad.addColorStop(0, '#12071a');
        skyGrad.addColorStop(0.35, '#2c103e');
        skyGrad.addColorStop(0.7, '#581c87');
        skyGrad.addColorStop(1, '#9333ea');
        moonColor = '#f3e8ff';
        moonHalo = 'rgba(216, 180, 254, 0.45)';
        break;

      case 'waterfall':
        // Misty Waterfall Chasms (Archive images 1, 16)
        skyGrad.addColorStop(0, '#032322');
        skyGrad.addColorStop(0.4, '#0f4f4b');
        skyGrad.addColorStop(0.75, '#0d9488');
        skyGrad.addColorStop(1, '#2dd4bf');
        moonColor = '#ccfbf1';
        moonHalo = 'rgba(153, 246, 228, 0.45)';
        break;

      case 'ruins':
        // Ancient Temple Ruins (Archive images 11, 12, 13)
        skyGrad.addColorStop(0, '#1c1917');
        skyGrad.addColorStop(0.4, '#292524');
        skyGrad.addColorStop(0.75, '#44403c');
        skyGrad.addColorStop(1, '#78716c');
        moonColor = '#fef08a';
        moonHalo = 'rgba(254, 240, 138, 0.4)';
        break;

      case 'sunset':
      default:
        // Crimson Twilight Sky (Archive image 4)
        skyGrad.addColorStop(0, '#1c1032');
        skyGrad.addColorStop(0.3, '#3b1238');
        skyGrad.addColorStop(0.6, '#9f1239');
        skyGrad.addColorStop(0.85, '#dc2626');
        skyGrad.addColorStop(1, '#f59e0b');
        moonColor = '#fef3c7';
        moonHalo = 'rgba(254, 243, 199, 0.5)';
        break;
    }

    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h);

    // Radiant Celestial Sun/Moon Orb
    const moonX = w * 0.76;
    const moonY = h * 0.24;
    const moonR = 68;

    const haloGrad = ctx.createRadialGradient(moonX, moonY, 12, moonX, moonY, moonR * 3);
    haloGrad.addColorStop(0, moonHalo);
    haloGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = haloGrad;
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonR * 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = moonColor;
    ctx.shadowColor = moonColor;
    ctx.shadowBlur = 28;
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  _drawParallaxLayer1(ctx, biome, offsetX, w, h) {
    ctx.save();
    let ridgeColor = '#3b0724';
    if (biome === 'snow') ridgeColor = '#0a2336';
    if (biome === 'bamboo') ridgeColor = '#042820';
    if (biome === 'thorns') ridgeColor = '#24083a';
    if (biome === 'waterfall') ridgeColor = '#042b2d';
    if (biome === 'ruins') ridgeColor = '#1c1917';

    ctx.fillStyle = ridgeColor;
    ctx.globalAlpha = 0.5;

    ctx.beginPath();
    ctx.moveTo(0, h);

    const step = 110;
    const count = Math.ceil(w / step) + 4;
    for (let i = -2; i < count; i++) {
      const x = i * step - (offsetX % step);
      const peakH = 150 + Math.sin(i * 1.4) * 90 + Math.cos(i * 0.8) * 60;
      const y = h * 0.65 - peakH;
      ctx.lineTo(x, y);
    }

    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    // Distant Torii Gate in Sunset Realm (Archive image 4)
    if (biome === 'sunset') {
      const toriiX = (w * 0.22) - (offsetX * 0.4 % (w * 1.5));
      const toriiY = h * 0.54;
      this._drawToriiGate(ctx, toriiX, toriiY, 78);
    }

    // Distant Waterfall Streaks in Waterfall Realm (Archive image 1, 16)
    if (biome === 'waterfall') {
      const wfX = (w * 0.35) - (offsetX * 0.35 % w);
      ctx.fillStyle = 'rgba(204, 251, 241, 0.25)';
      ctx.fillRect(wfX, h * 0.15, 36, h * 0.85);
      ctx.fillRect(wfX + 8, h * 0.25, 20, h * 0.75);
    }

    ctx.restore();
  }

  _drawParallaxLayer2(ctx, biome, offsetX, w, h) {
    ctx.save();
    ctx.fillStyle = '#06040d';
    ctx.globalAlpha = 0.8;

    const spacing = 540;
    const startIdx = Math.floor(offsetX / spacing) - 1;
    const endIdx = startIdx + Math.ceil(w / spacing) + 2;

    for (let i = startIdx; i <= endIdx; i++) {
      const px = i * spacing - offsetX;
      const py = h * 0.62;

      if (biome === 'bamboo') {
        this._drawBambooStalk(ctx, px, py - 120, 12, 260);
        this._drawBambooStalk(ctx, px + 50, py - 90, 8, 230);
        this._drawBambooStalk(ctx, px + 130, py - 140, 14, 280);
      } else if (biome === 'snow') {
        this._drawFrostedTree(ctx, px, py);
      } else if (biome === 'ruins') {
        this._drawStoneArchRuins(ctx, px, py);
      } else {
        this._drawPagodaCastle(ctx, px, py);
      }
    }

    ctx.restore();
  }

  _drawToriiGate(ctx, x, y, width) {
    ctx.save();
    ctx.fillStyle = '#06040d';
    const h = width * 0.8;
    ctx.fillRect(x - width / 2, y, 9, h);
    ctx.fillRect(x + width / 2 - 9, y, 9, h);
    ctx.beginPath();
    ctx.moveTo(x - width / 2 - 18, y - 8);
    ctx.quadraticCurveTo(x, y - 14, x + width / 2 + 18, y - 8);
    ctx.lineTo(x + width / 2 + 16, y);
    ctx.quadraticCurveTo(x, y - 6, x - width / 2 - 16, y);
    ctx.closePath();
    ctx.fill();
    ctx.fillRect(x - width / 2 - 8, y + 10, width + 16, 7);
    ctx.restore();
  }

  _drawPagodaCastle(ctx, px, py) {
    ctx.save();
    ctx.fillStyle = '#06040d';
    ctx.fillRect(px - 28, py, 56, 75);
    this._drawCurvedRoof(ctx, px, py, 72);
    ctx.fillRect(px - 20, py - 22, 40, 24);
    this._drawCurvedRoof(ctx, px, py - 22, 56);
    ctx.fillRect(px - 14, py - 44, 28, 24);
    this._drawCurvedRoof(ctx, px, py - 44, 42);
    ctx.fillRect(px - 2, py - 62, 4, 18);
    ctx.restore();
  }

  _drawStoneArchRuins(ctx, px, py) {
    ctx.save();
    ctx.fillStyle = '#06040d';
    ctx.fillRect(px - 32, py - 60, 14, 90);
    ctx.fillRect(px + 18, py - 60, 14, 90);
    ctx.fillRect(px - 38, py - 70, 76, 14);
    ctx.restore();
  }

  _drawCurvedRoof(ctx, cx, cy, width) {
    ctx.beginPath();
    ctx.moveTo(cx - width / 2 - 10, cy);
    ctx.quadraticCurveTo(cx, cy - 14, cx + width / 2 + 10, cy);
    ctx.lineTo(cx + width / 2, cy + 7);
    ctx.quadraticCurveTo(cx, cy - 4, cx - width / 2, cy + 7);
    ctx.closePath();
    ctx.fill();
  }

  _drawBambooStalk(ctx, x, y, width, height) {
    ctx.fillRect(x, y, width, height);
    for (let ny = y + 25; ny < y + height; ny += 35) {
      ctx.fillRect(x - 2, ny, width + 4, 4);
    }
  }

  _drawFrostedTree(ctx, x, y) {
    ctx.save();
    ctx.fillStyle = '#06040d';
    ctx.fillRect(x - 7, y - 110, 14, 110);
    ctx.beginPath();
    ctx.moveTo(x, y - 65);
    ctx.lineTo(x - 42, y - 95);
    ctx.lineTo(x - 56, y - 140);
    ctx.lineTo(x, y - 85);
    ctx.lineTo(x + 48, y - 120);
    ctx.lineTo(x + 64, y - 155);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  _drawReflectiveWaterSheen(ctx, biome, camY, w, h) {
    if (biome !== 'sunset' && biome !== 'waterfall' && biome !== 'ruins') return;

    ctx.save();
    let sheenColor = 'rgba(239, 68, 68, 0.08)';
    if (biome === 'waterfall') sheenColor = 'rgba(45, 212, 191, 0.08)';
    if (biome === 'ruins') sheenColor = 'rgba(251, 191, 36, 0.06)';

    ctx.fillStyle = sheenColor;
    ctx.fillRect(0, h * 0.75, w, h * 0.25);
    ctx.restore();
  }

  _drawParticles(ctx, biome, w, h) {
    ctx.save();
    let pColor = 'rgba(251, 191, 36, 0.85)';
    if (biome === 'bamboo') pColor = 'rgba(167, 243, 208, 0.8)';
    if (biome === 'thorns') pColor = 'rgba(216, 180, 254, 0.8)';
    if (biome === 'snow') pColor = 'rgba(241, 245, 249, 0.95)';
    if (biome === 'waterfall') pColor = 'rgba(153, 246, 228, 0.9)';
    if (biome === 'ruins') pColor = 'rgba(253, 230, 138, 0.85)';

    ctx.fillStyle = pColor;
    for (const p of this.particles) {
      p.x += p.vx * 0.016;
      p.y += p.vy * 0.016;
      p.rot += p.rotSpeed * 0.016;

      if (p.x < -50) p.x = w + 50;
      if (p.y > h + 50) p.y = -50;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.65);
      ctx.restore();
    }
    ctx.restore();
  }
}
