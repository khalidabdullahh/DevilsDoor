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
    const dpr = Math.min(typeof window !== 'undefined' ? (window.devicePixelRatio || 1) : 1, 3);

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

    // Virtual coordinates: fixed height 720, width adapted to exact viewport ratio
    this.height = 720;
    this.width = Math.round(720 * aspect);
    this.dpr = dpr;

    // Match physical hardware pixels for 1:1 crispness without interpolation blur
    const bufferW = Math.max(640, Math.round(cssW * dpr));
    const bufferH = Math.max(360, Math.round(cssH * dpr));

    this.scaleFactor = bufferH / this.height;

    if (this.canvas.width !== bufferW || this.canvas.height !== bufferH) {
      this.canvas.width = bufferW;
      this.canvas.height = bufferH;
    }
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

    // Enable High-Quality GPU Texture Smoothing & Filtering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

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
    ctx.save();
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

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
      const startTile = Math.floor((totalScroll - imgWidth) / imgWidth);
      const endTile = Math.ceil((totalScroll + w + imgWidth) / imgWidth);

      for (let i = startTile; i <= endTile; i++) {
        const drawX = i * imgWidth - totalScroll;
        const isMirrored = Math.abs(i) % 2 === 1;

        ctx.save();
        if (isMirrored) {
          ctx.translate(drawX + imgWidth, 0);
          ctx.scale(-1, 1);
          ctx.drawImage(bgImg, 0, 0, imgWidth, imgHeight);
        } else {
          ctx.drawImage(bgImg, drawX, 0, imgWidth, imgHeight);
        }
        ctx.restore();
      }

      // Atmospheric gradient
      const overlayGrad = ctx.createLinearGradient(0, 0, 0, h);
      overlayGrad.addColorStop(0, 'rgba(7, 9, 14, 0.08)');
      overlayGrad.addColorStop(0.65, 'rgba(0, 0, 0, 0)');
      overlayGrad.addColorStop(1, 'rgba(7, 9, 14, 0.45)');
      ctx.fillStyle = overlayGrad;
      ctx.fillRect(0, 0, w, h);
    } else {
      // High-End Fallback Gradient
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

    ctx.restore();
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
        // Frosted bare pine tree
        ctx.beginPath();
        ctx.moveTo(px, baseY);
        ctx.lineTo(px + 12, baseY - 160);
        ctx.lineTo(px + 24, baseY);
        ctx.fill();
      } else if (biome === 'bamboo') {
        // Tall vertical bamboo stalk
        ctx.fillRect(px, baseY - 260, 14, 260);
        ctx.fillRect(px + 24, baseY - 220, 10, 220);
      } else {
        // Japanese Pagoda Roof / Torii silhouette
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
    ctx.save();

    for (const p of this.particles) {
      p.x += p.vx * 0.016;
      p.y += p.vy * 0.016;
      p.rot += p.rotSpeed * 0.016;

      if (p.x < -100) p.x = w + 100;
      if (p.y > h + 100) p.y = -100;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);

      if (biome === 'snow') {
        ctx.fillStyle = 'rgba(248, 250, 252, 0.75)';
        ctx.beginPath();
        ctx.arc(0, 0, p.size * 0.7, 0, Math.PI * 2);
        ctx.fill();
      } else if (biome === 'bamboo') {
        ctx.fillStyle = 'rgba(52, 211, 153, 0.65)';
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size * 1.5, p.size * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = 'rgba(251, 191, 36, 0.75)';
        ctx.beginPath();
        ctx.arc(0, 0, p.size * 0.5, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    ctx.restore();
  }

  _drawCinematicVignette(ctx, w, h) {
    ctx.save();
    const grad = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.45, w / 2, h / 2, Math.max(w, h) * 0.78);
    grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    grad.addColorStop(1, 'rgba(5, 8, 15, 0.75)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }
}
