/**
 * NinjaArashiRenderer — High-Fidelity Visual Benchmark Engine for Devil's Door.
 * Renders the authentic graphical backdrops directly from the Archive reference screenshots:
 * - Preloaded high-definition scenery images (Sunset Pagoda, Snow Realm, Bamboo Grove, Thorn Crypts, Waterfall, Ruins)
 * - Multi-layer parallax depth scrolling
 * - Atmospheric weather particles (embers, snow, mist, bamboo leaves, purple spores)
 * - Ground water reflection sheen
 */
export class NinjaArashiRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    this.width = canvas.width;
    this.height = canvas.height;

    this.particles = [];
    this.numParticles = 42;
    this._initParticles();

    this.time = 0;
    this.bgImages = {};
    this._loadBackgroundAssets();
    this._handleResize();
  }

  _loadBackgroundAssets() {
    const bgList = {
      sunset: '/src/assets/backgrounds/sunset.jpg',
      snow: '/src/assets/backgrounds/snow.jpg',
      snow_oni: '/src/assets/backgrounds/snow_oni.jpg',
      bamboo: '/src/assets/backgrounds/bamboo.jpg',
      bamboo_spikes: '/src/assets/backgrounds/bamboo_spikes.jpg',
      thorns: '/src/assets/backgrounds/thorns.jpg',
      rooftops: '/src/assets/backgrounds/rooftops.jpg',
      waterfall: '/src/assets/backgrounds/waterfall.jpg',
      waterfall_wide: '/src/assets/backgrounds/waterfall_wide.jpg',
      ruins: '/src/assets/backgrounds/ruins.jpg',
      river: '/src/assets/backgrounds/river.jpg',
      behemoth: '/src/assets/backgrounds/behemoth.jpg'
    };

    if (typeof Image !== 'undefined') {
      for (const [key, src] of Object.entries(bgList)) {
        const img = new Image();
        img.src = src;
        img.onload = () => {
          this.bgImages[key] = img;
        };
      }
    }
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

    // 1. Draw High-Res Archive Background Scene with Parallax
    this._drawArchiveSceneBackdrop(ctx, biome, camX, camY, w, h);

    // 2. Parallax Silhouette Layer (Pagodas, Torii Gates, Frosted Pines, Bamboo)
    this._drawParallaxSilhouettes(ctx, biome, camX * 0.28, w, h);

    // 3. Playable World Chunks, Terrain, Props & Hazards (1.0x)
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

    // 4. Ground Wet Reflection Sheen
    this._drawReflectiveWaterSheen(ctx, biome, camY, w, h);

    // 5. Atmospheric Weather Particle Simulation
    this._drawParticles(ctx, biome, w, h);
  }

  _drawArchiveSceneBackdrop(ctx, biome, camX, camY, w, h) {
    const bgKey = (biome === 'snow') ? 'snow_oni' : biome;
    const bgImg = this.bgImages[bgKey] || this.bgImages[biome] || this.bgImages['sunset'];

    if (bgImg && bgImg.complete && bgImg.naturalWidth > 0) {
      ctx.save();
      const parallaxFactor = 0.14;
      const imgAspect = bgImg.naturalWidth / bgImg.naturalHeight;
      const drawH = Math.max(h, 600);
      const drawW = drawH * imgAspect;

      const offsetX = (camX * parallaxFactor) % drawW;
      const startX = -offsetX - drawW;
      const endX = w + drawW;

      for (let x = startX; x < endX; x += drawW - 1) {
        ctx.drawImage(bgImg, x, 0, drawW, drawH);
      }

      // Add atmospheric vignette tint overlay
      const vignette = ctx.createLinearGradient(0, 0, 0, h);
      vignette.addColorStop(0, 'rgba(7, 9, 14, 0.45)');
      vignette.addColorStop(0.5, 'rgba(0, 0, 0, 0.05)');
      vignette.addColorStop(1, 'rgba(7, 9, 14, 0.65)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, w, h);

      ctx.restore();
    } else {
      // Fallback Procedural Sky Gradient
      this._drawProceduralSky(ctx, biome, w, h);
    }
  }

  _drawProceduralSky(ctx, biome, w, h) {
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
    let moonColor = '#fef3c7';
    let moonHalo = 'rgba(254, 243, 199, 0.45)';

    switch (biome) {
      case 'snow':
        skyGrad.addColorStop(0, '#061320');
        skyGrad.addColorStop(0.35, '#0f2942');
        skyGrad.addColorStop(0.7, '#1e486b');
        skyGrad.addColorStop(1, '#60a5fa');
        moonColor = '#e0f2fe';
        moonHalo = 'rgba(186, 230, 253, 0.45)';
        break;

      case 'bamboo':
        skyGrad.addColorStop(0, '#022119');
        skyGrad.addColorStop(0.4, '#064e3b');
        skyGrad.addColorStop(0.75, '#047857');
        skyGrad.addColorStop(1, '#10b981');
        moonColor = '#d1fae5';
        moonHalo = 'rgba(167, 243, 208, 0.38)';
        break;

      case 'thorns':
        skyGrad.addColorStop(0, '#12071a');
        skyGrad.addColorStop(0.35, '#2c103e');
        skyGrad.addColorStop(0.7, '#581c87');
        skyGrad.addColorStop(1, '#9333ea');
        moonColor = '#f3e8ff';
        moonHalo = 'rgba(216, 180, 254, 0.45)';
        break;

      case 'waterfall':
        skyGrad.addColorStop(0, '#032322');
        skyGrad.addColorStop(0.4, '#0f4f4b');
        skyGrad.addColorStop(0.75, '#0d9488');
        skyGrad.addColorStop(1, '#2dd4bf');
        moonColor = '#ccfbf1';
        moonHalo = 'rgba(153, 246, 228, 0.45)';
        break;

      case 'ruins':
        skyGrad.addColorStop(0, '#1c1917');
        skyGrad.addColorStop(0.4, '#292524');
        skyGrad.addColorStop(0.75, '#44403c');
        skyGrad.addColorStop(1, '#78716c');
        moonColor = '#fef08a';
        moonHalo = 'rgba(254, 240, 138, 0.4)';
        break;

      case 'sunset':
      default:
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

    const moonX = w * 0.76;
    const moonY = h * 0.24;
    const moonR = 64;

    const haloGrad = ctx.createRadialGradient(moonX, moonY, 12, moonX, moonY, moonR * 3);
    haloGrad.addColorStop(0, moonHalo);
    haloGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = haloGrad;
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonR * 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = moonColor;
    ctx.shadowColor = moonColor;
    ctx.shadowBlur = 24;
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  _drawParallaxSilhouettes(ctx, biome, offsetX, w, h) {
    ctx.save();
    ctx.fillStyle = '#06040d';
    ctx.globalAlpha = 0.82;

    const spacing = 520;
    const startIdx = Math.floor(offsetX / spacing) - 1;
    const endIdx = startIdx + Math.ceil(w / spacing) + 2;

    for (let i = startIdx; i <= endIdx; i++) {
      const px = i * spacing - offsetX;
      const py = h * 0.65;

      if (biome === 'bamboo') {
        this._drawBambooStalk(ctx, px, py - 130, 14, 280);
        this._drawBambooStalk(ctx, px + 50, py - 100, 10, 250);
        this._drawBambooStalk(ctx, px + 140, py - 150, 16, 300);
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
    let sheenColor = 'rgba(239, 68, 68, 0.09)';
    if (biome === 'waterfall') sheenColor = 'rgba(45, 212, 191, 0.09)';
    if (biome === 'ruins') sheenColor = 'rgba(251, 191, 36, 0.07)';

    ctx.fillStyle = sheenColor;
    ctx.fillRect(0, h * 0.74, w, h * 0.26);
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
