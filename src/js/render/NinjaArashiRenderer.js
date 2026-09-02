/**
 * NinjaArashiRenderer — Multi-Biome Master Parallax & Silhouette Engine.
 * Supports 5 distinct atmospheric biomes:
 * - 'bamboo': Emerald Teal Mist & vertical bamboo stalks (Screenshots 4 & 5)
 * - 'cavern': Lilac Violet Caverns with reaching demon claws & pendulum battleaxes (Screenshot 1)
 * - 'ice': Glacial Ice Blue with hanging icicles & snow mist (Screenshot 5)
 * - 'desert': Golden Twilight Sunset with campfires & distant peaks (Screenshot 1)
 * - 'boss': Stormy Cyan-Red Demonic Arena with lightning strikes (Screenshot 2)
 */
export class NinjaArashiRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    this.width = canvas.width;
    this.height = canvas.height;

    this.particles = [];
    this.numParticles = 20;
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
    const biome = (level && level.biome) ? level.biome : 'desert';

    ctx.clearRect(0, 0, w, h);

    // 1. Biome Sky & Celestial Body
    this._drawBiomeSky(ctx, biome, w, h);

    // 2. Distant Parallax Mountain / Cave Ridges (0.12x)
    this._drawParallaxLayer1(ctx, biome, camX * 0.12, w, h);

    // 3. Midground Pagodas & Architecture (0.32x)
    this._drawParallaxLayer2(ctx, biome, camX * 0.32, w, h);

    // 4. Playable World (1.0x)
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

    // 5. Ambient Atmospheric Particles (Cherry Blossoms / Snow / Embers)
    this._drawParticles(ctx, biome, w, h);
  }

  _drawBiomeSky(ctx, biome, w, h) {
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
    let moonColor = '#fef3c7';
    let moonHalo = 'rgba(254, 243, 199, 0.4)';

    switch (biome) {
      case 'bamboo':
        skyGrad.addColorStop(0, '#022c22'); // Deep Emerald
        skyGrad.addColorStop(0.4, '#064e3b');
        skyGrad.addColorStop(0.8, '#047857');
        skyGrad.addColorStop(1, '#059669');
        moonColor = '#d1fae5';
        moonHalo = 'rgba(167, 243, 208, 0.35)';
        break;

      case 'cavern':
        skyGrad.addColorStop(0, '#150d1e'); // Lilac Violet
        skyGrad.addColorStop(0.4, '#2d1b40');
        skyGrad.addColorStop(0.8, '#4c286e');
        skyGrad.addColorStop(1, '#6b3ba4');
        moonColor = '#ede9fe';
        moonHalo = 'rgba(196, 181, 253, 0.35)';
        break;

      case 'ice':
        skyGrad.addColorStop(0, '#081a28'); // Glacial Ice Cyan
        skyGrad.addColorStop(0.4, '#0e384f');
        skyGrad.addColorStop(0.8, '#155e75');
        skyGrad.addColorStop(1, '#0891b2');
        moonColor = '#cffafe';
        moonHalo = 'rgba(165, 243, 252, 0.4)';
        break;

      case 'boss':
        skyGrad.addColorStop(0, '#090d16'); // Stormy Indigo-Crimson
        skyGrad.addColorStop(0.5, '#1e1b4b');
        skyGrad.addColorStop(0.85, '#881337');
        skyGrad.addColorStop(1, '#be123c');
        moonColor = '#ffe4e6';
        moonHalo = 'rgba(244, 63, 94, 0.45)';
        break;

      case 'desert':
      default:
        skyGrad.addColorStop(0, '#1e1b4b'); // Golden Sunset
        skyGrad.addColorStop(0.35, '#3730a3');
        skyGrad.addColorStop(0.65, '#b45309');
        skyGrad.addColorStop(0.88, '#d97706');
        skyGrad.addColorStop(1, '#f59e0b');
        break;
    }

    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h);

    // Glowing Celestial Moon
    const moonX = w * 0.78;
    const moonY = h * 0.28;
    const moonR = 64;

    const haloGrad = ctx.createRadialGradient(moonX, moonY, 10, moonX, moonY, moonR * 2.4);
    haloGrad.addColorStop(0, moonHalo);
    haloGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = haloGrad;
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonR * 2.4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = moonColor;
    ctx.shadowColor = moonColor;
    ctx.shadowBlur = 22;
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  _drawParallaxLayer1(ctx, biome, offsetX, w, h) {
    ctx.save();
    ctx.fillStyle = biome === 'bamboo' ? '#062e26' : (biome === 'cavern' ? '#26123a' : (biome === 'ice' ? '#0a2538' : '#2e1065'));
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
    ctx.restore();
  }

  _drawParallaxLayer2(ctx, biome, offsetX, w, h) {
    ctx.save();
    ctx.fillStyle = '#0f081e';
    ctx.globalAlpha = 0.75;

    const spacing = 520;
    const startIdx = Math.floor(offsetX / spacing) - 1;
    const endIdx = startIdx + Math.ceil(w / spacing) + 2;

    for (let i = startIdx; i <= endIdx; i++) {
      const px = i * spacing - offsetX;
      const py = h * 0.64;

      if (biome === 'bamboo') {
        // Vertical Bamboo Groves
        ctx.fillRect(px, py - 60, 8, 160);
        ctx.fillRect(px + 45, py - 40, 6, 140);
      } else {
        // Pagoda Temple
        ctx.fillRect(px - 18, py, 36, 68);
        this._drawCurvedRoof(ctx, px, py, 54);
        this._drawCurvedRoof(ctx, px, py - 20, 42);
        this._drawCurvedRoof(ctx, px, py - 38, 32);
      }
    }

    ctx.restore();
  }

  _drawCurvedRoof(ctx, x, y, width) {
    ctx.beginPath();
    ctx.moveTo(x - width, y);
    ctx.quadraticCurveTo(x, y - 12, x + width, y);
    ctx.lineTo(x + width * 0.75, y - 6);
    ctx.quadraticCurveTo(x, y - 16, x - width * 0.75, y - 6);
    ctx.closePath();
    ctx.fill();
  }

  _drawParticles(ctx, biome, w, h) {
    ctx.save();
    const wind = Math.sin(this.time * 1.8) * 30;

    for (const p of this.particles) {
      p.x += (p.vx + wind) * 0.016;
      p.y += p.vy * 0.016;
      p.rot += p.rotSpeed * 0.016;

      if (p.x < -60) p.x = w + 60;
      if (p.y > h + 40) {
        p.y = -40;
        p.x = Math.random() * (w + 200) - 100;
      }

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);

      if (biome === 'ice') {
        // Snow Flake Particle
        ctx.fillStyle = '#e0f2fe';
        ctx.shadowColor = '#bae6fd';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(0, 0, p.size * 0.6, 0, Math.PI * 2);
        ctx.fill();
      } else if (biome === 'bamboo') {
        // Spirit Energy Wisp
        ctx.fillStyle = '#6ee7b7';
        ctx.shadowColor = '#34d399';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(0, 0, p.size * 0.5, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Crimson Cherry Blossom Petal
        ctx.fillStyle = '#ef4444';
        ctx.shadowColor = '#f87171';
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size, p.size * 0.45, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    ctx.restore();
  }
}
