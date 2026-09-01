/**
 * Renderer25D — 2.5D Depth & Atmospheric Canvas Renderer.
 * Renders depth-extruded geometry, dynamic lighting, particles, and the Shadow Devil.
 */
export class Renderer25D {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    // Virtual resolution (standard crisp 16:9 platformer viewport)
    this.virtualWidth = 960;
    this.virtualHeight = 540;

    this.scale = 1;
    this.depthExtrude = 12; // 2.5D bottom extrusion depth in pixels

    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    // Maintain aspect ratio with letterbox
    const scaleX = windowWidth / this.virtualWidth;
    const scaleY = windowHeight / this.virtualHeight;
    this.scale = Math.min(scaleX, scaleY);

    this.canvas.width = this.virtualWidth;
    this.canvas.height = this.virtualHeight;

    this.canvas.style.width = `${Math.floor(this.virtualWidth * this.scale)}px`;
    this.canvas.style.height = `${Math.floor(this.virtualHeight * this.scale)}px`;
  }

  render(level, player, shadowDevil, camera) {
    const ctx = this.ctx;
    const camX = camera.getViewX();
    const camY = camera.getViewY();

    ctx.save();
    ctx.clearRect(0, 0, this.virtualWidth, this.virtualHeight);

    // 1. Draw Atmospheric Background
    this._renderBackground(ctx, level, camX, camY);

    // 2. Draw Shadow Devil (Background Entity)
    if (shadowDevil && shadowDevil.visible) {
      this._renderShadowDevil(ctx, shadowDevil, camX, camY);
    }

    // Apply Camera Transform for World Entities
    ctx.save();
    ctx.translate(-Math.floor(camX), -Math.floor(camY));

    // 3. Draw 2.5D Solid Platforms & Phase Blocks
    this._renderSolids(ctx, level.physicsWorld);

    // 4. Draw Hazards (Spikes, Weights)
    this._renderHazards(ctx, level.hazards);

    // 5. Draw Doors
    this._renderDoors(ctx, level.doors);

    // 6. Draw Player
    if (player) {
      this._renderPlayer(ctx, player);
    }

    ctx.restore(); // Restore camera transform

    // 7. Draw Atmospheric Foreground Vignette & Gaze Pulse
    this._renderForegroundEffects(ctx, shadowDevil);

    ctx.restore();
  }

  _renderBackground(ctx, level, camX, camY) {
    const grad = ctx.createLinearGradient(0, 0, 0, this.virtualHeight);
    const colorFamily = level.colorFamily || 'slate';

    if (colorFamily === 'void') {
      grad.addColorStop(0, '#0a0814');
      grad.addColorStop(1, '#161226');
    } else {
      grad.addColorStop(0, '#0c0f17');
      grad.addColorStop(1, '#182133');
    }

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, this.virtualWidth, this.virtualHeight);

    // Subtle parallax grid / pillars
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
    ctx.lineWidth = 1;
    const gridSpacing = 60;
    const offsetX = (-camX * 0.2) % gridSpacing;
    const offsetY = (-camY * 0.2) % gridSpacing;

    for (let x = offsetX; x < this.virtualWidth; x += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.virtualHeight);
      ctx.stroke();
    }
  }

  _renderShadowDevil(ctx, devil, camX, camY) {
    // Parallax position
    const screenX = (devil.x - camX * 0.4);
    const screenY = (devil.y - camY * 0.4);

    ctx.save();
    ctx.translate(screenX, screenY);

    // Towering Shadow Silhouette
    ctx.fillStyle = '#05060a';
    ctx.beginPath();
    // Torso & head silhouette
    ctx.moveTo(-70, 200);
    ctx.lineTo(-40, 30);
    ctx.lineTo(-20, -50); // Horn left
    ctx.lineTo(-5, -20);
    ctx.lineTo(0, -30);
    ctx.lineTo(5, -20);
    ctx.lineTo(20, -50);  // Horn right
    ctx.lineTo(40, 30);
    ctx.lineTo(70, 200);
    ctx.closePath();
    ctx.fill();

    // Glowing Ruby Eye
    if (devil.eyeOpenProgress > 0.05) {
      const eyeH = 12 * devil.eyeOpenProgress;
      ctx.save();
      // Outer glow
      ctx.shadowColor = '#ff1e56';
      ctx.shadowBlur = 15 + devil.pulseGlow * 15;

      ctx.fillStyle = '#ff1e56';
      ctx.beginPath();
      ctx.ellipse(0, 5, 14, eyeH, 0, 0, Math.PI * 2);
      ctx.fill();

      // Inner slit
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(0, 5, 3, eyeH * 0.8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.restore();
  }

  _renderSolids(ctx, physicsWorld) {
    const depth = this.depthExtrude;

    for (const solid of physicsWorld.solids) {
      const isSolid = physicsWorld.isSolidActive(solid);

      ctx.save();

      if (solid.phaseGroup) {
        // Phase platform styling
        const isCyan = solid.phaseGroup === 'A';
        const activeColor = isCyan ? '#38bdf8' : '#f59e0b';
        const dimColor = isCyan ? 'rgba(56, 189, 248, 0.2)' : 'rgba(245, 158, 11, 0.2)';

        if (!isSolid) {
          ctx.strokeStyle = dimColor;
          ctx.lineWidth = 2;
          ctx.strokeRect(solid.x, solid.y, solid.width, solid.height);
          ctx.restore();
          continue;
        }

        // Active phase block
        ctx.fillStyle = activeColor;
        ctx.shadowColor = activeColor;
        ctx.shadowBlur = 8;
        ctx.fillRect(solid.x, solid.y, solid.width, solid.height);

        // 2.5D Depth Extrusion
        ctx.shadowBlur = 0;
        ctx.fillStyle = isCyan ? '#0369a1' : '#b45309';
        ctx.fillRect(solid.x, solid.y + solid.height, solid.width, depth);

        ctx.restore();
        continue;
      }

      // Standard Solid Block
      // 1. Drop Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.fillRect(solid.x, solid.y + solid.height + depth, solid.width, 6);

      // 2. Extruded Bottom Depth (2.5D)
      ctx.fillStyle = '#141a29';
      ctx.fillRect(solid.x, solid.y + solid.height, solid.width, depth);

      // 3. Top Face
      ctx.fillStyle = '#222b3d';
      ctx.fillRect(solid.x, solid.y, solid.width, solid.height);

      // 4. Subtle Top Bevel Highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.fillRect(solid.x, solid.y, solid.width, 3);

      ctx.restore();
    }
  }

  _renderHazards(ctx, hazards) {
    for (const h of hazards) {
      if (!h.box.active) continue;

      ctx.save();
      if (h.type === 'spike') {
        const count = Math.max(1, Math.floor(h.width / 16));
        const spikeW = h.width / count;

        ctx.fillStyle = '#1c1917'; // Obsidian spike body
        for (let i = 0; i < count; i++) {
          const sx = h.x + i * spikeW;
          ctx.beginPath();
          ctx.moveTo(sx, h.y + h.height);
          ctx.lineTo(sx + spikeW / 2, h.y);
          ctx.lineTo(sx + spikeW, h.y + h.height);
          ctx.closePath();
          ctx.fill();

          // Crimson Glowing Tip
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.moveTo(sx + spikeW * 0.35, h.y + h.height * 0.35);
          ctx.lineTo(sx + spikeW / 2, h.y);
          ctx.lineTo(sx + spikeW * 0.65, h.y + h.height * 0.35);
          ctx.closePath();
          ctx.fill();
        }
      } else if (h.type === 'falling_weight') {
        // Heavy obsidian block with danger chevron
        ctx.fillStyle = '#1e1b2e';
        ctx.fillRect(h.x, h.y, h.width, h.height);

        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.strokeRect(h.x + 2, h.y + 2, h.width - 4, h.height - 4);
      }
      ctx.restore();
    }
  }

  _renderDoors(ctx, doors) {
    for (const door of doors) {
      if (door.state === 'dissolved') continue;

      ctx.save();
      const alpha = door.state === 'dissolving' ? (1 - door.dissolveProgress) : 1;
      ctx.globalAlpha = alpha;

      const cx = door.x + door.width / 2;
      const cy = door.y + door.height / 2;

      // 1. Stone Arch Frame
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(cx, door.y + 18, 18, Math.PI, 0);
      ctx.lineTo(door.x + door.width, door.y + door.height);
      ctx.lineTo(door.x, door.y + door.height);
      ctx.closePath();
      ctx.fill();

      // 2. Inner Glowing Vortex
      const isDecoy = door.type === 'decoy';
      const portalColor = isDecoy ? '#a855f7' : '#0ea5e9';
      const glowColor = isDecoy ? 'rgba(168, 85, 247, 0.4)' : 'rgba(14, 165, 233, 0.4)';

      ctx.save();
      ctx.shadowColor = portalColor;
      ctx.shadowBlur = 18;
      ctx.fillStyle = glowColor;
      ctx.beginPath();
      ctx.ellipse(cx, cy + 4, door.width * 0.35, door.height * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Vortex rotating rings
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(cx, cy + 4, 8, 14, door.vortexAngle, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // 3. Emitted Particles
      for (const p of door.particles) {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha * alpha;
        ctx.beginPath();
        ctx.arc(cx + p.offsetX, cy + p.offsetY, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  _renderPlayer(ctx, player) {
    if (player.isDead) {
      // Draw disintegration death particles
      for (const p of player.deathParticles) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      return;
    }

    const bx = player.box.x;
    const by = player.box.y;
    const bw = player.box.width;
    const bh = player.box.height;

    // 1. Drop shadow below player
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(bx + bw / 2, by + bh + 4, bw * 0.6, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 2. Motion Trail
    for (const t of player.trail) {
      ctx.save();
      ctx.globalAlpha = t.alpha * 0.4;
      ctx.fillStyle = player.phaseColor === 'B' ? '#f59e0b' : '#38bdf8';
      ctx.fillRect(t.x, t.y, bw, bh);
      ctx.restore();
    }

    // 3. Player Body Capsule
    ctx.save();
    const coreColor = player.phaseColor === 'B' ? '#f59e0b' : '#38bdf8';

    // Outer Glow
    ctx.shadowColor = coreColor;
    ctx.shadowBlur = 12;

    // Body
    ctx.fillStyle = coreColor;
    ctx.beginPath();
    ctx.roundRect(bx, by, bw, bh, 6);
    ctx.fill();

    // Inner White Core (Bioluminescence)
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(bx + 4, by + 4, bw - 8, bh - 8, 4);
    ctx.fill();

    // Eye direction indicator
    ctx.fillStyle = '#0f172a';
    const eyeOffsetX = player.facing === 1 ? 6 : -2;
    ctx.fillRect(bx + bw / 2 + eyeOffsetX, by + 10, 3, 5);

    ctx.restore();
  }

  _renderForegroundEffects(ctx, shadowDevil) {
    // 1. Subtle Camera Vignette
    const vignette = ctx.createRadialGradient(
      this.virtualWidth / 2, this.virtualHeight / 2, this.virtualWidth * 0.3,
      this.virtualWidth / 2, this.virtualHeight / 2, this.virtualWidth * 0.7
    );
    vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vignette.addColorStop(1, 'rgba(0, 0, 0, 0.6)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, this.virtualWidth, this.virtualHeight);

    // 2. Shadow Devil Gaze Crimson Pulse
    if (shadowDevil && shadowDevil.isGazeActive) {
      ctx.save();
      ctx.fillStyle = `rgba(239, 68, 68, ${0.15 + shadowDevil.pulseGlow * 0.12})`;
      ctx.fillRect(0, 0, this.virtualWidth, this.virtualHeight);
      ctx.restore();
    }
  }
}
