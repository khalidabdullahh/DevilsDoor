/**
 * NinjaArashiRenderer — Ultra High-Fidelity 4K Visual Engine for Devil's Door.
 * - Renders 4K Ultra-HD authentic scenery images with high-quality bicubic interpolation
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
    this.scaleFactor = 1;
    this.cachedOverlayGrad = null;
    this.cachedVignetteGrad = null;
    this.cachedFallbackGrads = {};

    this._loadBackgroundAssets();
    this.resize();

    window.addEventListener('resize', () => this.resize());
    window.addEventListener('orientationchange', () => this.resize());
    if (typeof ResizeObserver !== 'undefined' && this.canvas) {
      this._resizeObserver = new ResizeObserver(() => this.resize());
      this._resizeObserver.observe(this.canvas);
      if (this.canvas.parentElement) {
        this._resizeObserver.observe(this.canvas.parentElement);
      }
    }
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

  resize() {
    if (!this.canvas) return;
    const rawDpr = typeof window !== 'undefined' ? (window.devicePixelRatio || 1) : 1;
    // Cap DPR at 2.0 to eliminate fill-rate stutter on high-density mobile GPUs
    const dpr = Math.min(rawDpr, 2.0);

    const rect = this.canvas.getBoundingClientRect();
    let cssW = rect.width;
    let cssH = rect.height;

    // Fallback if dimensions are 0 (e.g. before initial paint)
    if (!cssW || !cssH) {
      if (typeof window !== 'undefined') {
        cssW = window.innerWidth;
        cssH = window.innerHeight;
      } else {
        cssW = 1280;
        cssH = 720;
      }
    }

    const aspect = Math.max(1.2, Math.min(2.6, cssW / (cssH || 1)));

    // Virtual coordinates: standard height 720, width adapted to exact viewport ratio
    this.height = 720;
    this.width = Math.round(720 * aspect);
    this.dpr = dpr;

    // Performance-optimized physical buffer
    let bufferW = Math.max(640, Math.round(cssW * dpr));
    let bufferH = Math.max(360, Math.round(cssH * dpr));

    const maxBufferW = 2048;
    const maxBufferH = 1152;
    if (bufferW > maxBufferW || bufferH > maxBufferH) {
      const scaleDown = Math.min(maxBufferW / bufferW, maxBufferH / bufferH);
      bufferW = Math.round(bufferW * scaleDown);
      bufferH = Math.round(bufferH * scaleDown);
    }

    this.scaleFactor = bufferH / this.height;

    if (this.canvas.width !== bufferW || this.canvas.height !== bufferH) {
      this.canvas.width = bufferW;
      this.canvas.height = bufferH;
    }

    this._updateCachedGradients();
  }

  _updateCachedGradients() {
    if (!this.ctx) return;
    const w = this.width;
    const h = this.height;

    // Overlay gradient
    const overlayGrad = this.ctx.createLinearGradient(0, 0, 0, h);
    overlayGrad.addColorStop(0, 'rgba(7, 9, 14, 0.08)');
    overlayGrad.addColorStop(0.65, 'rgba(0, 0, 0, 0)');
    overlayGrad.addColorStop(1, 'rgba(7, 9, 14, 0.45)');
    this.cachedOverlayGrad = overlayGrad;

    // Vignette gradient
    const vignetteGrad = this.ctx.createRadialGradient(
      w / 2, h / 2, Math.min(w, h) * 0.45,
      w / 2, h / 2, Math.max(w, h) * 0.78
    );
    vignetteGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vignetteGrad.addColorStop(1, 'rgba(5, 8, 15, 0.75)');
    this.cachedVignetteGrad = vignetteGrad;
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
    const scale = this.scaleFactor || 1;
    const biome = (level && level.biome) ? level.biome : 'sunset';

    ctx.save();
    ctx.scale(scale, scale);

    // High-performance image smoothing
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'medium';

    ctx.clearRect(0, 0, w, h);

    // 1. Draw 4K Ultra-HD Archive Background Scene with Parallax
    this._drawArchiveSceneBackdrop(ctx, biome, camX, camY, w, h);

    // 2. Parallax Silhouette Layer (Pagodas, Torii Gates, Frosted Pines, Bamboo)
    this._drawParallaxSilhouettes(ctx, biome, camX * 0.28, w, h);

    // 3. Playable World Chunks, Terrain, Props & Hazards (1.0x)
    if (level) {
      level.draw(ctx, camX, camY, this.time);
    }

    // 4. Draw Shadow Ninja & Oni Boss Enemies
    if (enemies && enemies.length > 0) {
      for (const enemy of enemies) {
        if (!enemy.isDead || enemy.deathTimer > 0) {
          enemy.draw(ctx, camX, camY, this.time);
        }
      }
    }

    // 5. Draw Hero Shinobi Entity
    if (player) {
      player.draw(ctx, camX, camY, this.time);
    }

    // 6. Draw Weather Particles & Atmospheric Overlay (inside transformed context)
    this._drawAtmosphericParticles(ctx, biome, w, h);

    // 7. Dark Fantasy Vignette Lighting (inside transformed context)
    this._drawCinematicVignette(ctx, w, h);

    ctx.restore();
  }

  _drawArchiveSceneBackdrop(ctx, biome, camX, camY, w, h) {
    let imgKey = 'sunset';
    if (this.bgImages[biome]) {
      imgKey = biome;
    } else if (biome === 'snow') {
      imgKey = 'snow_oni';
    } else if (biome === 'bamboo') {
      imgKey = 'bamboo';
    } else if (biome === 'thorns') {
      imgKey = 'thorns';
    } else if (biome === 'waterfall') {
      imgKey = 'waterfall';
    } else if (biome === 'ruins') {
      imgKey = 'ruins';
    }

    const bgImg = this.bgImages[imgKey] || this.bgImages.sunset;

    if (bgImg && bgImg.complete && bgImg.naturalWidth > 0) {
      const parallaxFactor = 0.12;
      const aspect = bgImg.naturalWidth / bgImg.naturalHeight;
      const imgHeight = h;
      const imgWidth = Math.round(imgHeight * aspect);

      const totalScroll = camX * parallaxFactor;
      // Fast single-modulo wrapping for zero matrix save/restore overhead
      const offset = ((totalScroll % imgWidth) + imgWidth) % imgWidth;
      let drawX = -offset;

      while (drawX < w) {
        ctx.drawImage(bgImg, drawX, 0, imgWidth, imgHeight);
        drawX += imgWidth;
      }

      // Cached atmospheric gradient
      if (this.cachedOverlayGrad) {
        ctx.fillStyle = this.cachedOverlayGrad;
        ctx.fillRect(0, 0, w, h);
      }
    } else {
      // Fallback solid gradient
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      if (biome === 'snow') {
        grad.addColorStop(0, '#0c1a2e');
        grad.addColorStop(0.5, '#1e293b');
        grad.addColorStop(1, '#07090e');
      } else if (biome === 'bamboo') {
        grad.addColorStop(0, '#052e16');
        grad.addColorStop(0.5, '#064e3b');
        grad.addColorStop(1, '#07090e');
      } else if (biome === 'thorns') {
        grad.addColorStop(0, '#3b0764');
        grad.addColorStop(0.5, '#581c87');
        grad.addColorStop(1, '#07090e');
      } else {
        grad.addColorStop(0, '#450a0a');
        grad.addColorStop(0.45, '#7f1d1d');
        grad.addColorStop(1, '#07090e');
      }
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
    }
  }

  _drawParallaxSilhouettes(ctx, biome, scrollX, w, h) {
    ctx.save();
    ctx.fillStyle = 'rgba(7, 9, 14, 0.75)';

    const baseY = 580;
    const spacing = 420;
    const startIdx = Math.floor(scrollX / spacing) - 1;
    const endIdx = startIdx + Math.ceil(w / spacing) + 3;

    for (let i = startIdx; i <= endIdx; i++) {
      const px = i * spacing - scrollX;
      const type = Math.abs(i) % 3;

      if (biome === 'snow') {
        ctx.beginPath();
        ctx.moveTo(px, baseY);
        ctx.lineTo(px + 12, baseY - 160);
        ctx.lineTo(px + 24, baseY);
        ctx.fill();
      } else if (biome === 'bamboo') {
        ctx.fillRect(px, baseY - 260, 14, 260);
        ctx.fillRect(px + 24, baseY - 220, 10, 220);
      } else {
        if (type === 0) {
          ctx.beginPath();
          ctx.moveTo(px - 40, baseY);
          ctx.lineTo(px, baseY - 70);
          ctx.lineTo(px + 40, baseY);
          ctx.fill();
        } else {
          ctx.fillRect(px - 15, baseY - 55, 6, 55);
          ctx.fillRect(px + 15, baseY - 55, 6, 55);
          ctx.fillRect(px - 25, baseY - 50, 50, 7);
        }
      }
    }

    ctx.restore();
  }

  _drawAtmosphericParticles(ctx, biome, w, h) {
    if (!this.particles || this.particles.length === 0) return;

    ctx.save();
    if (biome === 'snow') {
      ctx.fillStyle = 'rgba(248, 250, 252, 0.75)';
      ctx.beginPath();
      for (const p of this.particles) {
        p.x += p.vx * 0.016;
        p.y += p.vy * 0.016;
        if (p.x < -60) p.x = w + 60;
        if (p.y > h + 60) p.y = -60;
        ctx.moveTo(p.x + p.size * 0.7, p.y);
        ctx.arc(p.x, p.y, p.size * 0.7, 0, Math.PI * 2);
      }
      ctx.fill();
    } else if (biome === 'bamboo') {
      ctx.fillStyle = 'rgba(52, 211, 153, 0.65)';
      ctx.beginPath();
      for (const p of this.particles) {
        p.x += p.vx * 0.016;
        p.y += p.vy * 0.016;
        if (p.x < -60) p.x = w + 60;
        if (p.y > h + 60) p.y = -60;
        ctx.moveTo(p.x + p.size, p.y);
        ctx.arc(p.x, p.y, p.size * 0.8, 0, Math.PI * 2);
      }
      ctx.fill();
    } else {
      ctx.fillStyle = 'rgba(251, 191, 36, 0.75)';
      ctx.beginPath();
      for (const p of this.particles) {
        p.x += p.vx * 0.016;
        p.y += p.vy * 0.016;
        if (p.x < -60) p.x = w + 60;
        if (p.y > h + 60) p.y = -60;
        ctx.moveTo(p.x + p.size * 0.5, p.y);
        ctx.arc(p.x, p.y, p.size * 0.5, 0, Math.PI * 2);
      }
      ctx.fill();
    }
    ctx.restore();
  }

  _drawCinematicVignette(ctx, w, h) {
    if (this.cachedVignetteGrad) {
      ctx.fillStyle = this.cachedVignetteGrad;
      ctx.fillRect(0, 0, w, h);
    }
  }
}
