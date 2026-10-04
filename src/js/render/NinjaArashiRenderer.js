/**
 * NinjaArashiRenderer — Ultra High-Fidelity 4K Visual Engine for Devil's Door v2.3.
 *
 * v2.3 Visual Depth Upgrades:
 * - 3-Layer Parallax Silhouettes: FAR (0.08x) / MID (0.18x) / NEAR (0.35x) with biome-specific shapes
 * - Ground Reflection Sheen: biome-tinted shimmer strip pulsing with Math.sin(time)
 * - Atmospheric Depth Haze: horizontal gradient band at screen 40-60%, ~0.15 opacity
 * - Enhanced Particle System: 3 size tiers (large/medium/small), biome-specific shapes
 * - Time-of-day Lighting Pulse: overlay brightness oscillates with Math.sin(time * 0.3)
 */
export class NinjaArashiRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    this.width = canvas.width;
    this.height = canvas.height;

    // v2.3: 3 particle tiers
    this.particles = { large: [], medium: [], small: [] };
    this.numParticles = { large: 8, medium: 18, small: 28 };
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
      if (this.canvas.parentElement) this._resizeObserver.observe(this.canvas.parentElement);
    }
  }

  _createMipLevels(img) {
    if (typeof document === 'undefined') return { '4k': img, '2k': img, '1k': img };

    const srcW = img.naturalWidth || img.width || 3840;
    const srcH = img.naturalHeight || img.height || 2160;

    const c2k = document.createElement('canvas');
    c2k.width = Math.round(srcW * 0.5);
    c2k.height = Math.round(srcH * 0.5);
    const ctx2k = c2k.getContext('2d');
    ctx2k.imageSmoothingEnabled = true;
    ctx2k.imageSmoothingQuality = 'high';
    ctx2k.drawImage(img, 0, 0, c2k.width, c2k.height);

    const c1k = document.createElement('canvas');
    c1k.width = Math.round(srcW * 0.25);
    c1k.height = Math.round(srcH * 0.25);
    const ctx1k = c1k.getContext('2d');
    ctx1k.imageSmoothingEnabled = true;
    ctx1k.imageSmoothingQuality = 'high';
    ctx1k.drawImage(c2k, 0, 0, c1k.width, c1k.height);

    return { '4k': img, '2k': c2k, '1k': c1k };
  }

  _loadBackgroundAssets() {
    this.bgSources = {
      sunset_torii:    '/src/assets/backgrounds/scene_01_sunset_torii.jpg',
      moonlight_ruins: '/src/assets/backgrounds/scene_02_moonlight_ruins.jpg',
      scythe_chasm:    '/src/assets/backgrounds/scene_03_scythe_chasm.jpg',
      crystal_abyss:   '/src/assets/backgrounds/scene_04_crystal_abyss.jpg',
      bamboo_mist:     '/src/assets/backgrounds/scene_05_bamboo_mist.png',
      crimson_temple:  '/src/assets/backgrounds/scene_06_crimson_temple.png',
      underworld_gate: '/src/assets/backgrounds/scene_07_underworld_gate.png',
      celestial_ruins: '/src/assets/backgrounds/scene_08_celestial_ruins.png',
      shadow_peak:     '/src/assets/backgrounds/scene_09_shadow_peak.png',
      blood_moon:      '/src/assets/backgrounds/scene_10_blood_moon.png'
    };
    this.bgLoading = {};
    this.loadBackground('sunset_torii');
  }

  loadBackground(key) {
    if (!this.bgSources || !this.bgSources[key]) return Promise.resolve();
    if (this.bgImages[key]) return Promise.resolve();
    if (this.bgLoading[key]) return this.bgLoading[key];
    if (typeof Image === 'undefined') return Promise.resolve();

    this.bgLoading[key] = new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        this.bgImages[key] = this._createMipLevels(img);
        this._evictBackgroundsExcept(key);
        delete this.bgLoading[key];
        resolve();
      };
      img.onerror = () => { delete this.bgLoading[key]; resolve(); };
      img.src = this.bgSources[key];
    });
    return this.bgLoading[key];
  }

  _evictBackgroundsExcept(keep) {
    for (const k of Object.keys(this.bgImages)) {
      if (k !== keep && k !== 'sunset_torii') delete this.bgImages[k];
    }
  }

  resize() {
    if (!this.canvas) return;
    const rawDpr = typeof window !== 'undefined' ? (window.devicePixelRatio || 1) : 1;
    const dpr = Math.min(rawDpr, 3.0);

    const rect = this.canvas.getBoundingClientRect();
    let cssW = rect.width;
    let cssH = rect.height;

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
    this.height = 720;
    this.width = Math.round(720 * aspect);
    this.dpr = dpr;

    let bufferW = Math.max(640, Math.round(cssW * dpr));
    let bufferH = Math.max(360, Math.round(cssH * dpr));

    const maxBufferW = 3840;
    const maxBufferH = 2160;
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

    const overlayGrad = this.ctx.createLinearGradient(0, 0, 0, h);
    overlayGrad.addColorStop(0, 'rgba(7, 9, 14, 0.08)');
    overlayGrad.addColorStop(0.65, 'rgba(0, 0, 0, 0)');
    overlayGrad.addColorStop(1, 'rgba(7, 9, 14, 0.45)');
    this.cachedOverlayGrad = overlayGrad;

    const vignetteGrad = this.ctx.createRadialGradient(
      w / 2, h / 2, Math.min(w, h) * 0.45,
      w / 2, h / 2, Math.max(w, h) * 0.78
    );
    vignetteGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vignetteGrad.addColorStop(1, 'rgba(5, 8, 15, 0.75)');
    this.cachedVignetteGrad = vignetteGrad;
  }

  // v2.3: 3-tier particle initialisation
  _initParticles() {
    const init = (count, minSize, maxSize, minSpeedX, maxSpeedX, minSpeedY, maxSpeedY) =>
      Array.from({ length: count }, () => ({
        x: Math.random() * 2400 - 400,
        y: Math.random() * 1400 - 200,
        size: minSize + Math.random() * (maxSize - minSize),
        vx: -(minSpeedX + Math.random() * (maxSpeedX - minSpeedX)),
        vy: minSpeedY + Math.random() * (maxSpeedY - minSpeedY),
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 2.5,
        phase: Math.random() * Math.PI * 2
      }));

    this.particles.large  = init(this.numParticles.large,  7, 12, 20, 40, 8, 18);
    this.particles.medium = init(this.numParticles.medium, 3, 7,  40, 80, 12, 25);
    this.particles.small  = init(this.numParticles.small,  1, 3,  60, 120, 18, 38);
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

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'medium';
    ctx.clearRect(0, 0, w, h);

    // 1. 4K Background
    this._drawArchiveSceneBackdrop(ctx, biome, camX, camY, w, h);

    // 2. v2.3: Atmospheric Depth Haze between bg and silhouettes
    this._drawDepthHaze(ctx, biome, w, h);

    // 3. v2.3: 3-Layer Parallax Silhouettes (FAR → MID → NEAR)
    this._drawParallaxSilhouettes(ctx, biome, camX, w, h);

    // 4. v2.3: Ground reflection sheen
    this._drawGroundSheen(ctx, biome, w, h);

    // 5. Level chunks
    if (level) level.draw(ctx, camX, camY, this.time);

    // 6. Enemies
    if (enemies && enemies.length > 0) {
      for (const enemy of enemies) {
        if (!enemy.isDead || enemy.deathTimer > 0) enemy.draw(ctx, camX, camY, this.time);
      }
    }

    // 7. Player
    if (player) player.draw(ctx, camX, camY, this.time);

    // 8. v2.3: Enhanced atmospheric particles
    this._drawAtmosphericParticles(ctx, biome, w, h);

    // 9. v2.3: Cinematic vignette + time-of-day lighting pulse
    this._drawCinematicVignette(ctx, biome, w, h);

    ctx.restore();
  }

  _drawArchiveSceneBackdrop(ctx, biome, camX, camY, w, h) {
    let imgKey = 'sunset_torii';
    if (this.bgImages[biome]) {
      imgKey = biome;
    } else if (biome.includes('moonlight') || biome.includes('citadel') || biome.includes('ruins')) {
      imgKey = 'moonlight_ruins';
    } else if (biome.includes('scythe')) {
      imgKey = 'scythe_chasm';
    } else if (biome.includes('bamboo')) {
      imgKey = 'bamboo_mist';
    } else if (biome.includes('crimson') || biome.includes('pagoda') || biome.includes('temple')) {
      imgKey = 'crimson_temple';
    } else if (biome.includes('underworld') || biome.includes('gate')) {
      imgKey = 'underworld_gate';
    } else if (biome.includes('celestial') || biome.includes('dragon')) {
      imgKey = 'celestial_ruins';
    } else if (biome.includes('shadow') || biome.includes('peak') || biome.includes('obsidian')) {
      imgKey = 'shadow_peak';
    } else if (biome.includes('blood') || biome.includes('moon')) {
      imgKey = 'blood_moon';
    } else if (biome.includes('crystal') || biome.includes('thorns') || biome.includes('abyss')) {
      imgKey = 'crystal_abyss';
    }

    if (!this.bgImages[imgKey]) this.loadBackground(imgKey);
    const mips = this.bgImages[imgKey];
    if (!mips) return;

    const physicalH = h * (this.scaleFactor || 1);
    let bgImg = mips['4k'] || mips;
    if (physicalH <= 650 && mips['1k']) bgImg = mips['1k'];
    else if (physicalH <= 1300 && mips['2k']) bgImg = mips['2k'];

    const naturalW = bgImg.naturalWidth || bgImg.width || 2752;
    const naturalH = bgImg.naturalHeight || bgImg.height || 1536;

    if (bgImg && naturalW > 0) {
      const parallaxFactor = 0.12;
      const aspect = naturalW / naturalH;
      const imgHeight = h;
      const imgWidth = Math.round(imgHeight * aspect);

      const totalScroll = camX * parallaxFactor;
      const offset = ((totalScroll % imgWidth) + imgWidth) % imgWidth;
      let drawX = -offset;

      while (drawX < w) {
        ctx.drawImage(bgImg, drawX, 0, imgWidth, imgHeight);
        drawX += imgWidth;
      }

      if (this.cachedOverlayGrad) {
        ctx.fillStyle = this.cachedOverlayGrad;
        ctx.fillRect(0, 0, w, h);
      }
    } else {
      // Fallback gradient
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      if (biome === 'moonlight_ruins') {
        grad.addColorStop(0, '#083344'); grad.addColorStop(0.5, '#0e7490'); grad.addColorStop(1, '#05070d');
      } else if (biome === 'scythe_chasm') {
        grad.addColorStop(0, '#064e3b'); grad.addColorStop(0.5, '#059669'); grad.addColorStop(1, '#05070d');
      } else if (biome === 'crystal_abyss') {
        grad.addColorStop(0, '#4c0519'); grad.addColorStop(0.5, '#be123c'); grad.addColorStop(1, '#05070d');
      } else {
        grad.addColorStop(0, '#450a0a'); grad.addColorStop(0.45, '#7f1d1d'); grad.addColorStop(1, '#05070d');
      }
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
    }
  }

  // v2.3: Horizontal atmospheric haze band — gives depth between bg and foreground
  _drawDepthHaze(ctx, biome, w, h) {
    const hazeColors = {
      sunset_torii:    'rgba(200, 80, 30, 0.13)',
      moonlight_ruins: 'rgba(6, 140, 180, 0.11)',
      scythe_chasm:    'rgba(16, 120, 80, 0.12)',
      crystal_abyss:   'rgba(200, 30, 60, 0.13)',
      bamboo_mist:     'rgba(16, 140, 90, 0.14)',
      crimson_temple:  'rgba(200, 20, 50, 0.14)',
      underworld_gate: 'rgba(100, 50, 200, 0.13)',
      celestial_ruins: 'rgba(40, 140, 220, 0.11)',
      shadow_peak:     'rgba(180, 120, 20, 0.12)',
      blood_moon:      'rgba(180, 20, 20, 0.16)'
    };
    const color = hazeColors[biome] || hazeColors['sunset_torii'];

    const hazeTop = h * 0.38;
    const hazeH   = h * 0.24;
    const hazeGrad = ctx.createLinearGradient(0, hazeTop, 0, hazeTop + hazeH);
    hazeGrad.addColorStop(0,   'rgba(0,0,0,0)');
    hazeGrad.addColorStop(0.4, color);
    hazeGrad.addColorStop(0.6, color);
    hazeGrad.addColorStop(1,   'rgba(0,0,0,0)');

    ctx.save();
    ctx.fillStyle = hazeGrad;
    ctx.fillRect(0, hazeTop, w, hazeH);
    ctx.restore();
  }

  // v2.3: 3-Layer Parallax Silhouettes (FAR / MID / NEAR)
  _drawParallaxSilhouettes(ctx, biome, camX, w, h) {
    const layers = [
      { speedMul: 0.08, alpha: 0.45, scale: 0.55 }, // FAR
      { speedMul: 0.18, alpha: 0.65, scale: 0.78 }, // MID
      { speedMul: 0.35, alpha: 0.88, scale: 1.0  }  // NEAR
    ];

    for (let li = 0; li < layers.length; li++) {
      const layer = layers[li];
      ctx.save();
      ctx.globalAlpha = layer.alpha;
      ctx.fillStyle = `rgba(5, 7, 13, ${layer.alpha})`;

      const scrollX = camX * layer.speedMul;
      const sc = layer.scale;
      const baseY = h - (h * 0.06 * li); // each layer anchored slightly higher
      const spacing = 380 + li * 60;
      const startIdx = Math.floor(scrollX / spacing) - 1;
      const endIdx = startIdx + Math.ceil(w / spacing) + 3;

      for (let i = startIdx; i <= endIdx; i++) {
        const px = i * spacing - scrollX;
        this._drawSilhouetteShape(ctx, biome, li, px, baseY, sc, i);
      }

      ctx.restore();
    }
  }

  // Biome + layer-specific silhouette shapes
  _drawSilhouetteShape(ctx, biome, layerIdx, px, baseY, sc, seed) {
    const type = Math.abs(seed) % 3;

    // Helper: scale a shape relative to sc
    const s = (v) => v * sc;

    if (biome === 'moonlight_ruins') {
      if (layerIdx === 0) {
        // FAR: distant mountain silhouette
        ctx.beginPath();
        ctx.moveTo(px - s(80), baseY);
        ctx.lineTo(px, baseY - s(160));
        ctx.lineTo(px + s(80), baseY);
        ctx.fill();
      } else if (layerIdx === 1) {
        // MID: ancient stone pagoda pillars
        ctx.fillRect(px - s(14), baseY - s(200), s(28), s(200));
        ctx.fillRect(px - s(22), baseY - s(160), s(44), s(10));
        ctx.fillRect(px - s(18), baseY - s(210), s(36), s(10));
      } else {
        // NEAR: crumbled wall sections
        ctx.fillRect(px - s(30), baseY - s(70), s(60), s(70));
        ctx.fillRect(px - s(20), baseY - s(85), s(10), s(15));
        ctx.fillRect(px + s(5),  baseY - s(80), s(8), s(10));
      }

    } else if (biome === 'scythe_chasm' || biome === 'bamboo_mist') {
      if (layerIdx === 0) {
        // FAR: dense tree line
        ctx.beginPath();
        ctx.moveTo(px - s(50), baseY);
        ctx.lineTo(px - s(10), baseY - s(180));
        ctx.lineTo(px + s(10), baseY - s(180));
        ctx.lineTo(px + s(50), baseY);
        ctx.fill();
      } else if (layerIdx === 1) {
        // MID: bamboo stalks
        ctx.fillRect(px,       baseY - s(220), s(14), s(220));
        ctx.fillRect(px + s(22), baseY - s(180), s(10), s(180));
        ctx.fillRect(px - s(16), baseY - s(150), s(8), s(150));
      } else {
        // NEAR: foreground bamboo base + leaf cluster
        ctx.fillRect(px - s(5), baseY - s(100), s(16), s(100));
        ctx.beginPath();
        ctx.ellipse(px, baseY - s(100), s(22), s(12), -0.3, 0, Math.PI * 2);
        ctx.fill();
      }

    } else if (biome === 'crystal_abyss') {
      if (layerIdx === 0) {
        // FAR: large crystal peak
        ctx.beginPath();
        ctx.moveTo(px - s(50), baseY);
        ctx.lineTo(px - s(10), baseY - s(200));
        ctx.lineTo(px + s(10), baseY - s(220));
        ctx.lineTo(px + s(40), baseY - s(130));
        ctx.lineTo(px + s(60), baseY);
        ctx.fill();
      } else if (layerIdx === 1) {
        // MID: mid-size crystal shard cluster
        ctx.beginPath();
        ctx.moveTo(px - s(25), baseY);
        ctx.lineTo(px,         baseY - s(120));
        ctx.lineTo(px + s(15), baseY - s(100));
        ctx.lineTo(px + s(30), baseY);
        ctx.fill();
      } else {
        // NEAR: jagged crag
        ctx.beginPath();
        ctx.moveTo(px - s(18), baseY);
        ctx.lineTo(px + s(2),  baseY - s(55));
        ctx.lineTo(px + s(20), baseY);
        ctx.fill();
      }

    } else if (biome === 'crimson_temple') {
      if (layerIdx === 0) {
        // FAR: grand distant pagoda
        ctx.fillRect(px - s(16), baseY - s(260), s(32), s(260));
        ctx.fillRect(px - s(32), baseY - s(220), s(64), s(10));
        ctx.fillRect(px - s(26), baseY - s(170), s(52), s(8));
        ctx.fillRect(px - s(42), baseY - s(120), s(84), s(12));
      } else if (layerIdx === 1) {
        // MID: temple column
        ctx.fillRect(px - s(18), baseY - s(200), s(36), s(200));
        ctx.fillRect(px - s(24), baseY - s(170), s(48), s(8));
      } else {
        // NEAR: decorative lantern posts
        ctx.fillRect(px - s(4), baseY - s(80), s(8), s(80));
        ctx.fillRect(px - s(10), baseY - s(80), s(20), s(14));
      }

    } else if (biome === 'underworld_gate') {
      if (layerIdx === 0) {
        // FAR: demon fortress
        ctx.fillRect(px - s(40), baseY - s(200), s(80), s(200));
        ctx.fillRect(px - s(50), baseY - s(200), s(12), s(50));
        ctx.fillRect(px + s(38), baseY - s(200), s(12), s(50));
      } else if (layerIdx === 1) {
        // MID: torii of hell
        ctx.fillRect(px - s(22), baseY - s(180), s(10), s(180));
        ctx.fillRect(px + s(12), baseY - s(180), s(10), s(180));
        ctx.fillRect(px - s(32), baseY - s(172), s(64), s(12));
      } else {
        // NEAR: broken arch rubble
        ctx.fillRect(px - s(28), baseY - s(50), s(20), s(50));
        ctx.fillRect(px + s(10), baseY - s(35), s(14), s(35));
      }

    } else if (biome === 'celestial_ruins') {
      if (layerIdx === 0) {
        // FAR: floating obelisk silhouette
        ctx.fillRect(px - s(10), baseY - s(280), s(20), s(200));
        ctx.fillRect(px - s(6),  baseY - s(280), s(12), s(20));
      } else if (layerIdx === 1) {
        // MID: celestial column with capital
        ctx.fillRect(px - s(12), baseY - s(200), s(24), s(200));
        ctx.fillRect(px - s(20), baseY - s(200), s(40), s(10));
      } else {
        // NEAR: fallen column segment
        ctx.fillRect(px - s(20), baseY - s(25), s(44), s(25));
      }

    } else if (biome === 'shadow_peak' || biome === 'blood_moon') {
      if (layerIdx === 0) {
        // FAR: vast obsidian range
        ctx.beginPath();
        ctx.moveTo(px - s(100), baseY);
        ctx.lineTo(px - s(20), baseY - s(220));
        ctx.lineTo(px,          baseY - s(250));
        ctx.lineTo(px + s(20),  baseY - s(210));
        ctx.lineTo(px + s(100), baseY);
        ctx.fill();
      } else if (layerIdx === 1) {
        // MID: medium peak
        ctx.beginPath();
        ctx.moveTo(px - s(55), baseY);
        ctx.lineTo(px,          baseY - s(160));
        ctx.lineTo(px + s(55),  baseY);
        ctx.fill();
      } else {
        // NEAR: rocky foreground outcrop
        ctx.beginPath();
        ctx.moveTo(px - s(30), baseY);
        ctx.lineTo(px - s(5),  baseY - s(65));
        ctx.lineTo(px + s(30), baseY);
        ctx.fill();
      }

    } else {
      // Default: Sunset Torii — shrine rocks + torii gate shapes
      if (layerIdx === 0) {
        // FAR: distant mountain
        ctx.beginPath();
        ctx.moveTo(px - s(90), baseY);
        ctx.lineTo(px,          baseY - s(130));
        ctx.lineTo(px + s(90),  baseY);
        ctx.fill();
      } else if (layerIdx === 1) {
        // MID: full torii gate
        if (type === 0) {
          ctx.fillRect(px - s(14), baseY - s(90), s(10), s(90));
          ctx.fillRect(px + s(4),  baseY - s(90), s(10), s(90));
          ctx.fillRect(px - s(24), baseY - s(88), s(48), s(8));
          ctx.fillRect(px - s(20), baseY - s(70), s(40), s(6));
        } else {
          ctx.beginPath();
          ctx.moveTo(px - s(45), baseY);
          ctx.lineTo(px,          baseY - s(75));
          ctx.lineTo(px + s(45),  baseY);
          ctx.fill();
        }
      } else {
        // NEAR: foreground shrine rock / lantern
        if (type === 0) {
          ctx.beginPath();
          ctx.arc(px, baseY - s(18), s(22), 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(px - s(6), baseY - s(45), s(12), s(45));
          ctx.fillRect(px - s(10), baseY - s(47), s(20), s(8));
        }
      }
    }
  }

  // v2.3: Wet-ground shimmer strip at platform level
  _drawGroundSheen(ctx, biome, w, h) {
    const sheen = {
      sunset_torii:    [200, 80, 30],
      moonlight_ruins: [6, 140, 180],
      scythe_chasm:    [16, 185, 129],
      crystal_abyss:   [200, 30, 60],
      bamboo_mist:     [16, 185, 129],
      crimson_temple:  [200, 20, 50],
      underworld_gate: [130, 70, 230],
      celestial_ruins: [40, 160, 220],
      shadow_peak:     [180, 130, 20],
      blood_moon:      [200, 20, 20]
    };
    const [r, g, b] = sheen[biome] || sheen['sunset_torii'];
    const pulse = 0.04 + 0.03 * Math.sin(this.time * 1.8);

    const sheenY = h * 0.78;
    const sheenH = h * 0.06;
    const grad = ctx.createLinearGradient(0, sheenY, 0, sheenY + sheenH);
    grad.addColorStop(0, `rgba(${r},${g},${b},${pulse})`);
    grad.addColorStop(0.5, `rgba(${r},${g},${b},${pulse * 2.2})`);
    grad.addColorStop(1, 'rgba(0,0,0,0)');

    ctx.save();
    ctx.fillStyle = grad;
    ctx.fillRect(0, sheenY, w, sheenH);
    ctx.restore();
  }

  // v2.3: Enhanced particles — 3 tiers, biome-specific shapes
  _drawAtmosphericParticles(ctx, biome, w, h) {
    const colors = {
      sunset_torii:    [[251, 146, 60], [239, 100, 40]],
      moonlight_ruins: [[6, 182, 212], [100, 200, 230]],
      scythe_chasm:    [[16, 185, 129], [80, 200, 150]],
      crystal_abyss:   [[244, 63, 94], [200, 40, 80]],
      bamboo_mist:     [[52, 211, 153], [100, 200, 160]],
      crimson_temple:  [[225, 29, 72], [200, 60, 90]],
      underworld_gate: [[168, 85, 247], [130, 60, 220]],
      celestial_ruins: [[56, 189, 248], [100, 160, 240]],
      shadow_peak:     [[245, 158, 11], [220, 130, 20]],
      blood_moon:      [[220, 38, 38], [200, 20, 20]]
    };
    const [c1, c2] = colors[biome] || colors['sunset_torii'];

    // Determine particle shape from biome
    const useAsh  = biome === 'crimson_temple' || biome === 'shadow_peak' || biome === 'blood_moon';
    const useSnow = biome === 'celestial_ruins';
    const useSpore = biome === 'underworld_gate' || biome === 'scythe_chasm';

    const allTiers = [
      { list: this.particles.large,  alpha: 0.55 },
      { list: this.particles.medium, alpha: 0.70 },
      { list: this.particles.small,  alpha: 0.80 }
    ];

    ctx.save();
    for (const tier of allTiers) {
      const col = tier === allTiers[0] ? c1 : c2;
      ctx.fillStyle = `rgba(${col[0]},${col[1]},${col[2]},${tier.alpha})`;
      ctx.beginPath();

      for (const p of tier.list) {
        p.x += p.vx * 0.016;
        p.y += p.vy * 0.016;
        p.rot += p.rotSpeed * 0.016;
        p.phase += 0.016;

        if (p.x < -80)  p.x = w + 80;
        if (p.y > h + 80) p.y = -80;

        const px = p.x;
        const py = p.y;
        const ps = p.size;

        if (useAsh) {
          // Ash: flat oval tumbling
          ctx.save();
          ctx.translate(px, py);
          ctx.rotate(p.rot);
          ctx.beginPath();
          ctx.ellipse(0, 0, ps, ps * 0.4, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        } else if (useSnow) {
          // Snow: 6-arm cross
          ctx.save();
          ctx.translate(px, py);
          ctx.rotate(p.rot);
          for (let a = 0; a < 6; a++) {
            ctx.fillRect(-ps * 0.15, -ps, ps * 0.3, ps * 2);
            ctx.rotate(Math.PI / 3);
          }
          ctx.restore();
        } else if (useSpore) {
          // Spore: teardrop
          ctx.save();
          ctx.translate(px, py);
          ctx.rotate(p.rot + Math.PI / 2);
          ctx.beginPath();
          ctx.moveTo(0, -ps);
          ctx.bezierCurveTo(ps * 0.7, -ps * 0.2, ps * 0.7, ps * 0.6, 0, ps * 0.8);
          ctx.bezierCurveTo(-ps * 0.7, ps * 0.6, -ps * 0.7, -ps * 0.2, 0, -ps);
          ctx.fill();
          ctx.restore();
        } else {
          // Default: ember circle
          ctx.moveTo(px + ps, py);
          ctx.arc(px, py, ps, 0, Math.PI * 2);
        }
      }

      if (!useAsh && !useSnow && !useSpore) ctx.fill();
    }
    ctx.restore();
  }

  // v2.3: Vignette + time-of-day brightness pulse
  _drawCinematicVignette(ctx, biome, w, h) {
    if (this.cachedVignetteGrad) {
      ctx.fillStyle = this.cachedVignetteGrad;
      ctx.fillRect(0, 0, w, h);
    }

    // Time-of-day lighting pulse — subtle brightness oscillation
    const pulseBase = {
      sunset_torii:    [180, 60,  20],
      moonlight_ruins: [6,   140, 180],
      blood_moon:      [160, 10,  10]
    };
    const rgb = pulseBase[biome] || null;
    if (rgb) {
      const a = 0.025 + 0.015 * Math.sin(this.time * 0.3);
      ctx.save();
      ctx.fillStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${a})`;
      ctx.fillRect(0, 0, w, h);
      ctx.restore();
    }
  }
}
