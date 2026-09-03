/**
 * NinjaArashiRenderer — Multi-Biome Master Parallax & Silhouette Engine for Devil's Door v2.0.
 * Supports 5 authentic dark fantasy biomes matching the 18 Archive reference screenshots:
 * - 'sunset': Golden/Crimson Twilight with Torii Gates, Pagodas & Warm Halos (Archive image 4)
 * - 'snow': Frozen Abyss with Frosted Pine Trees, Snow Ledges & Demon Mask Pillars (Archive images 3, 5, 7)
 * - 'bamboo': Deep Emerald/Teal Mist with Dense Bamboo Groves (Archive image 14)
 * - 'thorns': Lilac/Violet Demonic Crypts with Skull-Saw Gears & Thorny Spikes (Archive images 10, 17)
 * - 'waterfall': Cyan Misty Chasm with Cascading Waterfalls & Sky Pagodas (Archive images 1, 16)
 */
export class NinjaArashiRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    this.width = canvas.width;
    this.height = canvas.height;

    this.particles = [];
    this.numParticles = 24;
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
        x: Math.random() * 2000 - 400,
        y: Math.random() * 1200 - 200,
        size: Math.random() * 5 + 3,
        vx: -Math.random() * 80 - 40,
        vy: Math.random() * 30 + 20,
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

    // 1. Biome Sky & Celestial Celestial Body
    this._drawBiomeSky(ctx, biome, w, h);

    // 2. Distant Parallax Mountain / Forest / Torii Layer (0.12x)
    this._drawParallaxLayer1(ctx, biome, camX * 0.12, w, h);

    // 3. Midground Pagodas, Trees & Architecture (0.32x)
    this._drawParallaxLayer2(ctx, biome, camX * 0.32, w, h);

    // 4. Playable World Terrain, Props, Traps & Entities (1.0x)
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

    // 5. Ambient Atmospheric Weather Particles (Embers / Snow / Bamboo Leaves / Spores)
    this._drawParticles(ctx, biome, w, h);
  }

  _drawBiomeSky(ctx, biome, w, h) {
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
    let moonColor = '#fef3c7';
    let moonHalo = 'rgba(254, 243, 199, 0.4)';

    switch (biome) {
      case 'snow':
        // Frozen Abyss (Archive images 3, 5, 7)
        skyGrad.addColorStop(0, '#0a1d2e');
        skyGrad.addColorStop(0.4, '#133e5c');
        skyGrad.addColorStop(0.75, '#286a8e');
        skyGrad.addColorStop(1, '#60a5fa');
        moonColor = '#e0f2fe';
        moonHalo = 'rgba(186, 230, 253, 0.4)';
        break;

      case 'bamboo':
        // Whispering Bamboo Grove (Archive image 14)
        skyGrad.addColorStop(0, '#022c22');
        skyGrad.addColorStop(0.4, '#064e3b');
        skyGrad.addColorStop(0.75, '#047857');
        skyGrad.addColorStop(1, '#059669');
        moonColor = '#d1fae5';
        moonHalo = 'rgba(167, 243, 208, 0.35)';
        break;

      case 'thorns':
        // Demonic Thorn Crypts (Archive images 10, 17)
        skyGrad.addColorStop(0, '#13091b');
        skyGrad.addColorStop(0.4, '#2c123d');
        skyGrad.addColorStop(0.75, '#581c87');
        skyGrad.addColorStop(1, '#7e22ce');
        moonColor = '#f3e8ff';
        moonHalo = 'rgba(216, 180, 254, 0.4)';
        break;

      case 'waterfall':
        // Misty Waterfall Chasms (Archive images 1, 16)
        skyGrad.addColorStop(0, '#042f2e');
        skyGrad.addColorStop(0.4, '#115e59');
        skyGrad.addColorStop(0.75, '#0d9488');
        skyGrad.addColorStop(1, '#14b8a6');
        moonColor = '#ccfbf1';
        moonHalo = 'rgba(153, 246, 228, 0.4)';
        break;

      case 'sunset':
      default:
        // Golden Twilight Torii Sky (Archive image 4)
        skyGrad.addColorStop(0, '#1e1b4b');
        skyGrad.addColorStop(0.35, '#3730a3');
        skyGrad.addColorStop(0.65, '#b45309');
        skyGrad.addColorStop(0.88, '#d97706');
        skyGrad.addColorStop(1, '#f59e0b');
        moonColor = '#fef3c7';
        moonHalo = 'rgba(254, 243, 199, 0.45)';
        break;
    }

    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h);

    // Celestial Glowing Sun / Moon
    const moonX = w * 0.78;
    const moonY = h * 0.26;
    const moonR = 64;

    const haloGrad = ctx.createRadialGradient(moonX, moonY, 10, moonX, moonY, moonR * 2.5);
    haloGrad.addColorStop(0, moonHalo);
    haloGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = haloGrad;
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonR * 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = moonColor;
    ctx.shadowColor = moonColor;
    ctx.shadowBlur = 24;
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  _drawParallaxLayer1(ctx, biome, offsetX, w, h) {
    ctx.save();
    let ridgeColor = '#2e1065';
    if (biome === 'snow') ridgeColor = '#0b253a';
    if (biome === 'bamboo') ridgeColor = '#062e26';
    if (biome === 'thorns') ridgeColor = '#220b38';
    if (biome === 'waterfall') ridgeColor = '#063032';

    ctx.fillStyle = ridgeColor;
    ctx.globalAlpha = 0.45;

    ctx.beginPath();
    ctx.moveTo(0, h);

    const step = 110;
    const count = Math.ceil(w / step) + 4;
    for (let i = -2; i < count; i++) {
      const x = i * step - (offsetX % step);
      const peakH = 130 + Math.sin(i * 1.5) * 80 + Math.cos(i * 0.7) * 50;
      const y = h * 0.68 - peakH;
      ctx.lineTo(x, y);
    }

    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    // If Sunset Biome -> Draw Distant Torii Gate Silhouette (Archive image 4)
    if (biome === 'sunset') {
      const toriiX = (w * 0.25) - (offsetX * 0.5 % w);
      const toriiY = h * 0.52;
      this._drawToriiGate(ctx, toriiX, toriiY, 68);
    }

    // If Waterfall Biome -> Draw Distant Waterfall Streaks (Archive image 1)
    if (biome === 'waterfall') {
      const wfX = (w * 0.4) - (offsetX * 0.4 % w);
      ctx.fillStyle = 'rgba(204, 251, 241, 0.2)';
      ctx.fillRect(wfX, h * 0.2, 32, h * 0.8);
      ctx.fillRect(wfX + 6, h * 0.3, 20, h * 0.7);
    }

    ctx.restore();
  }

  _drawParallaxLayer2(ctx, biome, offsetX, w, h) {
    ctx.save();
    ctx.fillStyle = '#0a0614';
    ctx.globalAlpha = 0.75;

    const spacing = 520;
    const startIdx = Math.floor(offsetX / spacing) - 1;
    const endIdx = startIdx + Math.ceil(w / spacing) + 2;

    for (let i = startIdx; i <= endIdx; i++) {
      const px = i * spacing - offsetX;
      const py = h * 0.62;

      if (biome === 'bamboo') {
        // Vertical Bamboo Stalks (Archive image 14)
        ctx.fillRect(px, py - 90, 10, 220);
        ctx.fillRect(px + 45, py - 70, 7, 200);
        ctx.fillRect(px + 120, py - 110, 12, 240);
      } else if (biome === 'snow') {
        // Frosted Dead Pine Trees (Archive images 3, 5, 7)
        this._drawFrostedTree(ctx, px, py);
      } else {
        // Multi-tier Japanese Pagoda Temple (Archive images 4, 16)
        ctx.fillRect(px - 18, py, 36, 68);
        this._drawCurvedRoof(ctx, px, py, 56);
        this._drawCurvedRoof(ctx, px, py - 20, 44);
        this._drawCurvedRoof(ctx, px, py - 38, 32);
      }
    }

    ctx.restore();
  }

  _drawToriiGate(ctx, x, y, width) {
    ctx.save();
    ctx.fillStyle = '#080c14';
    const h = width * 0.75;
    // Two Pillars
    ctx.fillRect(x - width / 2, y, 8, h);
    ctx.fillRect(x + width / 2 - 8, y, 8, h);
    // Upper Curved Lintels
    ctx.fillRect(x - width / 2 - 14, y - 6, width + 28, 8);
    ctx.fillRect(x - width / 2 - 8, y + 10, width + 16, 6);
    ctx.restore();
  }

  _drawFrostedTree(ctx, x, y) {
    ctx.save();
    ctx.fillStyle = '#080c14';
    // Main Trunk
    ctx.fillRect(x - 6, y - 100, 12, 100);
    // Bare Jagged Branches (Archive image 5 & 7)
    ctx.beginPath();
    ctx.moveTo(x, y - 60);
    ctx.lineTo(x - 36, y - 90);
    ctx.lineTo(x - 48, y - 130);
    ctx.lineTo(x, y - 80);
    ctx.lineTo(x + 40, y - 110);
    ctx.lineTo(x + 55, y - 145);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  _drawCurvedRoof(ctx, cx, cy, width) {
    ctx.beginPath();
    ctx.moveTo(cx - width / 2 - 8, cy);
    ctx.quadraticCurveTo(cx, cy - 14, cx + width / 2 + 8, cy);
    ctx.lineTo(cx + width / 2, cy + 6);
    ctx.quadraticCurveTo(cx, cy - 4, cx - width / 2, cy + 6);
    ctx.closePath();
    ctx.fill();
  }

  _drawParticles(ctx, biome, w, h) {
    ctx.save();
    let pColor = 'rgba(251, 191, 36, 0.8)'; // Golden embers for sunset
    if (biome === 'bamboo') pColor = 'rgba(167, 243, 208, 0.75)'; // Emerald bamboo leaves
    if (biome === 'thorns') pColor = 'rgba(216, 180, 254, 0.75)'; // Lilac spores
    if (biome === 'snow') pColor = 'rgba(241, 245, 249, 0.9)'; // Snowflakes
    if (biome === 'waterfall') pColor = 'rgba(153, 246, 228, 0.85)'; // Waterfall mist

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
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      ctx.restore();
    }
    ctx.restore();
  }
}
