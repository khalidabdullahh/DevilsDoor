/**
 * NinjaArashiRenderer — Clean, Scenic Japanese Twilight & Silhouette Parallax Engine.
 * Features:
 * - Rich, clean Golden Twilight Sky (Indigo to Warm Amber Sunset)
 * - Luminous Full Moon with soft halo
 * - Distant misty mountain ridges & pagoda silhouettes
 * - Clean pitch-black obsidian platforms with warm lantern light halos
 * - Gentle floating cherry blossom petals
 * - Zero visual clutter (removed dense bamboo grids and heavy canopy blobs)
 */
export class NinjaArashiRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    this.width = canvas.width;
    this.height = canvas.height;

    // Gentle Floating Cherry Blossom Petals & Ember Sparks (Clean, moderate count)
    this.petals = [];
    this.numPetals = 22;
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
    for (let i = 0; i < this.numPetals; i++) {
      this.petals.push({
        x: Math.random() * 2000 - 400,
        y: Math.random() * 1200 - 200,
        size: Math.random() * 5 + 3,
        vx: -Math.random() * 90 - 50,
        vy: Math.random() * 35 + 25,
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 3.0,
        color: Math.random() > 0.3 ? '#ef4444' : '#fb7185',
        isEmber: Math.random() > 0.7
      });
    }
  }

  render(camX, camY, level, player, enemies) {
    this.time += 0.016;
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    ctx.clearRect(0, 0, w, h);

    // 1. Clean Golden Sunset & Twilight Sky (Rich, vibrant, not dark/murky)
    this._drawSky(ctx, w, h);

    // 2. Distant Mountains (0.12x Parallax)
    this._drawFarMountains(ctx, camX * 0.12, w, h);

    // 3. Ancient Pagoda & Torii Silhouettes (0.32x Parallax)
    this._drawMidPagodas(ctx, camX * 0.32, w, h);

    // 4. Playable World (1.0x Parallax)
    ctx.save();

    // Draw Level Platforms, Gnarled Pines, Lanterns & Portal
    if (level) {
      level.draw(ctx, camX, camY);
    }

    // Draw Enemies with Health Hearts
    if (enemies) {
      for (const e of enemies) {
        e.draw(ctx, camX, camY);
      }
    }

    // Draw Ninja Player with Flowing Scarf
    if (player) {
      player.draw(ctx, camX, camY);
    }

    ctx.restore();

    // 5. Gentle Floating Cherry Blossom Petals
    this._drawParticles(ctx, w, h);
  }

  _drawSky(ctx, w, h) {
    // Beautiful, clean Golden Twilight Sunset Gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
    skyGrad.addColorStop(0, '#1e1b4b'); // Deep Indigo Night at top
    skyGrad.addColorStop(0.35, '#3730a3'); // Royal Violet Twilight
    skyGrad.addColorStop(0.65, '#b45309'); // Warm Amber Sunset
    skyGrad.addColorStop(0.88, '#d97706'); // Golden Ochre Horizon
    skyGrad.addColorStop(1, '#f59e0b');

    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h);

    // Bright Luminous Moon with Soft Halo
    const moonX = w * 0.78;
    const moonY = h * 0.28;
    const moonR = 64;

    // Atmospheric Outer Halo
    const haloGrad = ctx.createRadialGradient(moonX, moonY, 10, moonX, moonY, moonR * 2.5);
    haloGrad.addColorStop(0, 'rgba(254, 243, 199, 0.45)');
    haloGrad.addColorStop(0.5, 'rgba(251, 191, 36, 0.18)');
    haloGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');

    ctx.fillStyle = haloGrad;
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonR * 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Crisp Moon Disc
    ctx.fillStyle = '#fef3c7';
    ctx.shadowColor = '#fde68a';
    ctx.shadowBlur = 24;
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Subtle Cloud Wisps Crossing Sky
    ctx.fillStyle = 'rgba(30, 27, 75, 0.28)';
    ctx.beginPath();
    ctx.ellipse(moonX - 30, moonY + 20, 110, 12, -0.08, 0, Math.PI * 2);
    ctx.ellipse(moonX + 45, moonY - 18, 80, 8, 0.06, 0, Math.PI * 2);
    ctx.fill();
  }

  _drawFarMountains(ctx, offsetX, w, h) {
    ctx.save();
    ctx.fillStyle = '#2e1065'; // Soft purple-indigo watercolor mountain
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

    // Soft Twilight Mist at Mountain Base
    const mistGrad = ctx.createLinearGradient(0, h * 0.55, 0, h);
    mistGrad.addColorStop(0, 'rgba(180, 83, 9, 0)');
    mistGrad.addColorStop(1, 'rgba(180, 83, 9, 0.5)');
    ctx.fillStyle = mistGrad;
    ctx.fillRect(0, h * 0.55, w, h * 0.45);

    ctx.restore();
  }

  _drawMidPagodas(ctx, offsetX, w, h) {
    ctx.save();
    ctx.fillStyle = '#170c2a'; // Mid-depth clean silhouette
    ctx.globalAlpha = 0.75;

    const pagodaSpacing = 520;
    const startIdx = Math.floor(offsetX / pagodaSpacing) - 1;
    const endIdx = startIdx + Math.ceil(w / pagodaSpacing) + 2;

    for (let i = startIdx; i <= endIdx; i++) {
      const px = i * pagodaSpacing - offsetX;
      const py = h * 0.64;

      // Elegant Pagoda Temple Silhouette
      this._drawSinglePagoda(ctx, px, py, 52);

      // Distant Torii Gate
      this._drawToriiGate(ctx, px + 260, py + 22, 0.55);
    }

    ctx.restore();
  }

  _drawSinglePagoda(ctx, x, y, scale) {
    ctx.fillRect(x - scale * 0.35, y, scale * 0.7, scale * 1.3);

    this._drawCurvedRoof(ctx, x, y, scale * 1.05);
    this._drawCurvedRoof(ctx, x, y - scale * 0.38, scale * 0.82);
    this._drawCurvedRoof(ctx, x, y - scale * 0.72, scale * 0.62);

    ctx.fillRect(x - 2, y - scale * 1.05, 4, scale * 0.32);
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

  _drawToriiGate(ctx, x, y, scale = 1.0) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    ctx.fillRect(-20, 0, 5.5, 44);
    ctx.fillRect(15, 0, 5.5, 44);

    ctx.beginPath();
    ctx.moveTo(-28, -6);
    ctx.quadraticCurveTo(0, -11, 28, -6);
    ctx.lineTo(26, 0);
    ctx.quadraticCurveTo(0, -5, -26, 0);
    ctx.closePath();
    ctx.fill();

    ctx.fillRect(-24, 7, 48, 3.5);

    ctx.restore();
  }

  _drawParticles(ctx, w, h) {
    ctx.save();
    const wind = Math.sin(this.time * 1.8) * 30;

    for (const p of this.petals) {
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

      if (p.isEmber) {
        ctx.fillStyle = '#f59e0b';
        ctx.shadowColor = '#fbbf24';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(0, 0, p.size * 0.5, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = p.color;
        ctx.shadowColor = '#ef4444';
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
