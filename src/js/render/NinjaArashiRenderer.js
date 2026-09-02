/**
 * NinjaArashiRenderer — Master Silhouette & 5-Layer Parallax Atmospheric Engine.
 * Perfectly reproduces the iconic visual benchmark of Ninja Arashi 2:
 * Watercolor blood-moon skies, gnarled pine silhouettes, bamboo groves, glowing lanterns,
 * and drifting crimson cherry blossom particles.
 */
export class NinjaArashiRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    this.width = canvas.width;
    this.height = canvas.height;

    // Drifting Cherry Blossom Petals & Ember Particles
    this.petals = [];
    this.numPetals = 65;
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
        size: Math.random() * 6 + 4,
        vx: -Math.random() * 120 - 80,
        vy: Math.random() * 50 + 40,
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 4.0,
        color: Math.random() > 0.3 ? '#ef4444' : '#fb7185', // Crimson & Rose
        isEmber: Math.random() > 0.75
      });
    }
  }

  render(camX, camY, level, player, enemies) {
    this.time += 0.016;
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    ctx.clearRect(0, 0, w, h);

    // =========================================================================
    // LAYER 0: WATERCOLOR BLOOD MOON SKY & CELESTIAL HALO
    // =========================================================================
    this._drawSky(ctx, w, h);

    // =========================================================================
    // LAYER 1: FAR MOUNTAIN SILHOUETTES (0.12x Parallax)
    // =========================================================================
    this._drawFarMountains(ctx, camX * 0.12, w, h);

    // =========================================================================
    // LAYER 2: ANCIENT PAGODAS & TORII SILHOUETTES (0.32x Parallax)
    // =========================================================================
    this._drawMidPagodas(ctx, camX * 0.32, w, h);

    // =========================================================================
    // LAYER 3: BAMBOO GROVE & VOLUMETRIC MIST (0.62x Parallax)
    // =========================================================================
    this._drawBambooGrove(ctx, camX * 0.62, w, h);

    // =========================================================================
    // LAYER 4: PLAYABLE WORLD (1.0x Parallax)
    // =========================================================================
    ctx.save();

    // 1. Draw Level Terrain, Gnarled Pines & Hanging Lanterns
    if (level) {
      level.draw(ctx, camX, camY);
    }

    // 2. Draw Enemies
    if (enemies) {
      for (const e of enemies) {
        e.draw(ctx, camX, camY);
      }
    }

    // 3. Draw Ninja Player with Flowing Scarf
    if (player) {
      player.draw(ctx, camX, camY);
    }

    ctx.restore();

    // =========================================================================
    // DRIFTING CHERRY BLOSSOM PETALS & EMBERS
    // =========================================================================
    this._drawParticles(ctx, camX, camY, w, h);

    // =========================================================================
    // LAYER 5: CINEMATIC FOREGROUND SILHOUETTES (1.35x Parallax)
    // =========================================================================
    this._drawForegroundSilhouettes(ctx, camX * 1.35, w, h);
  }

  _drawSky(ctx, w, h) {
    // Dramatic Blood-Moon Twilight Gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
    skyGrad.addColorStop(0, '#0f0208'); // Deep midnight black
    skyGrad.addColorStop(0.35, '#3b0713'); // Crimson maroon
    skyGrad.addColorStop(0.65, '#881337'); // Fiery rose plum
    skyGrad.addColorStop(0.9, '#9f1239'); // Blood red horizon
    skyGrad.addColorStop(1, '#be123c');

    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h);

    // Giant Glowing Blood Moon
    const moonX = w * 0.72;
    const moonY = h * 0.32;
    const moonR = 88;

    // Atmospheric Outer Halo
    const haloGrad = ctx.createRadialGradient(moonX, moonY, 10, moonX, moonY, moonR * 2.8);
    haloGrad.addColorStop(0, 'rgba(254, 205, 211, 0.45)');
    haloGrad.addColorStop(0.4, 'rgba(244, 63, 94, 0.25)');
    haloGrad.addColorStop(1, 'rgba(159, 18, 57, 0)');

    ctx.fillStyle = haloGrad;
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonR * 2.8, 0, Math.PI * 2);
    ctx.fill();

    // Solid Moon Disc
    ctx.fillStyle = '#ffe4e6';
    ctx.shadowColor = '#f43f5e';
    ctx.shadowBlur = 32;
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Subtle Cloud Silhouettes Crossing Moon
    ctx.fillStyle = 'rgba(15, 2, 8, 0.45)';
    ctx.beginPath();
    ctx.ellipse(moonX - 20, moonY + 18, 120, 14, -0.1, 0, Math.PI * 2);
    ctx.ellipse(moonX + 40, moonY - 24, 90, 10, 0.08, 0, Math.PI * 2);
    ctx.fill();
  }

  _drawFarMountains(ctx, offsetX, w, h) {
    ctx.save();
    ctx.fillStyle = '#22050e';
    ctx.globalAlpha = 0.55;

    ctx.beginPath();
    ctx.moveTo(0, h);

    const step = 90;
    const count = Math.ceil(w / step) + 4;
    for (let i = -2; i < count; i++) {
      const x = i * step - (offsetX % step);
      const peakH = 140 + Math.sin(i * 1.7) * 90 + Math.cos(i * 0.8) * 60;
      const y = h * 0.65 - peakH;
      ctx.lineTo(x, y);
    }

    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    // Misty Fog Gradient across Mountains
    const mistGrad = ctx.createLinearGradient(0, h * 0.45, 0, h);
    mistGrad.addColorStop(0, 'rgba(136, 19, 55, 0)');
    mistGrad.addColorStop(1, 'rgba(59, 7, 19, 0.65)');
    ctx.fillStyle = mistGrad;
    ctx.fillRect(0, h * 0.45, w, h * 0.55);

    ctx.restore();
  }

  _drawMidPagodas(ctx, offsetX, w, h) {
    ctx.save();
    ctx.fillStyle = '#140309';
    ctx.globalAlpha = 0.85;

    const pagodaSpacing = 420;
    const startIdx = Math.floor(offsetX / pagodaSpacing) - 1;
    const endIdx = startIdx + Math.ceil(w / pagodaSpacing) + 2;

    for (let i = startIdx; i <= endIdx; i++) {
      const px = i * pagodaSpacing - offsetX;
      const py = h * 0.62;

      // 3-Tier Temple Pagoda Silhouette
      this._drawSinglePagoda(ctx, px, py, 64);

      // Distant Torii Gate
      this._drawToriiGate(ctx, px + 210, py + 30, 0.65);
    }

    ctx.restore();
  }

  _drawSinglePagoda(ctx, x, y, scale) {
    // Base Box
    ctx.fillRect(x - scale * 0.35, y, scale * 0.7, scale * 1.4);

    // Tier 1 Roof
    this._drawCurvedRoof(ctx, x, y, scale * 1.1);

    // Tier 2 Roof
    this._drawCurvedRoof(ctx, x, y - scale * 0.4, scale * 0.85);

    // Tier 3 Roof
    this._drawCurvedRoof(ctx, x, y - scale * 0.75, scale * 0.65);

    // Spire Finial
    ctx.fillRect(x - 2, y - scale * 1.1, 4, scale * 0.35);
  }

  _drawCurvedRoof(ctx, x, y, width) {
    ctx.beginPath();
    ctx.moveTo(x - width, y);
    ctx.quadraticCurveTo(x, y - 14, x + width, y);
    ctx.lineTo(x + width * 0.75, y - 8);
    ctx.quadraticCurveTo(x, y - 20, x - width * 0.75, y - 8);
    ctx.closePath();
    ctx.fill();
  }

  _drawToriiGate(ctx, x, y, scale = 1.0) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    // Left & Right Pillars
    ctx.fillRect(-22, 0, 6, 48);
    ctx.fillRect(16, 0, 6, 48);

    // Top Curved Lintel
    ctx.beginPath();
    ctx.moveTo(-32, -6);
    ctx.quadraticCurveTo(0, -12, 32, -6);
    ctx.lineTo(30, 0);
    ctx.quadraticCurveTo(0, -6, -30, 0);
    ctx.closePath();
    ctx.fill();

    // Sub Beam
    ctx.fillRect(-26, 8, 52, 4);

    ctx.restore();
  }

  _drawBambooGrove(ctx, offsetX, w, h) {
    ctx.save();
    ctx.fillStyle = '#080104';
    ctx.globalAlpha = 0.95;

    const stalkSpacing = 38;
    const startIdx = Math.floor(offsetX / stalkSpacing) - 2;
    const endIdx = startIdx + Math.ceil(w / stalkSpacing) + 3;

    for (let i = startIdx; i <= endIdx; i++) {
      const bx = i * stalkSpacing - offsetX + Math.sin(i * 3.7) * 12;
      const height = 320 + Math.sin(i * 1.4) * 80;
      const by = h - height;

      // Bamboo Stalk
      ctx.fillRect(bx, by, 4.5, height);

      // Bamboo Leaves
      for (let l = 0; l < 4; l++) {
        const ly = by + l * 60 + 20;
        ctx.beginPath();
        ctx.ellipse(bx + 14, ly, 16, 3, -0.3, 0, Math.PI * 2);
        ctx.ellipse(bx - 14, ly + 25, 16, 3, 0.3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }

  _drawParticles(ctx, camX, camY, w, h) {
    ctx.save();
    const wind = Math.sin(this.time * 2.0) * 40;

    for (const p of this.petals) {
      p.x += (p.vx + wind) * 0.016;
      p.y += p.vy * 0.016;
      p.rot += p.rotSpeed * 0.016;

      // Wrap around screen
      if (p.x < -100) p.x = w + 100;
      if (p.y > h + 50) {
        p.y = -50;
        p.x = Math.random() * (w + 400) - 200;
      }

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);

      if (p.isEmber) {
        // Glowing Golden Firefly Ember
        ctx.fillStyle = '#f59e0b';
        ctx.shadowColor = '#fbbf24';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(0, 0, p.size * 0.5, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Crimson Cherry Blossom Petal Silhouette
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

  _drawForegroundSilhouettes(ctx, offsetX, w, h) {
    ctx.save();
    ctx.fillStyle = '#000000'; // Pure pitch black foreground silhouette
    ctx.globalAlpha = 1.0;

    // 1. Overhanging Top-Left Gnarled Pine Branch
    ctx.beginPath();
    ctx.moveTo(-40, -20);
    ctx.quadraticCurveTo(180, 40, 260, 110);
    ctx.quadraticCurveTo(180, 70, -40, 40);
    ctx.closePath();
    ctx.fill();

    // Needles on Branch
    for (let x = 60; x < 260; x += 30) {
      ctx.beginPath();
      ctx.arc(x, 100 + Math.sin(x * 0.05) * 20, 24, 0, Math.PI * 2);
      ctx.fill();
    }

    // 2. Overhanging Top-Right Branch
    ctx.beginPath();
    ctx.moveTo(w + 40, -20);
    ctx.quadraticCurveTo(w - 160, 50, w - 240, 130);
    ctx.quadraticCurveTo(w - 140, 80, w + 40, 50);
    ctx.closePath();
    ctx.fill();

    for (let x = w - 80; x > w - 240; x -= 35) {
      ctx.beginPath();
      ctx.arc(x, 120 + Math.cos(x * 0.05) * 20, 28, 0, Math.PI * 2);
      ctx.fill();
    }

    // 3. Bottom Silhouette Grass Blades
    const grassCount = 35;
    for (let i = 0; i < grassCount; i++) {
      const gx = (i * (w / grassCount)) + Math.sin(i * 1.5 + this.time * 2.0) * 8;
      const gh = 35 + Math.sin(i * 2.8) * 20;
      ctx.beginPath();
      ctx.moveTo(gx - 8, h);
      ctx.quadraticCurveTo(gx, h - gh * 0.6, gx + 4, h - gh);
      ctx.quadraticCurveTo(gx + 2, h - gh * 0.4, gx + 10, h);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }
}
