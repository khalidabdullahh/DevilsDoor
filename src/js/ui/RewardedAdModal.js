/**
 * RewardedAdModal — Interactive Google AdSense & H5 Video Ad Simulator for Devil's Door v2.2.
 * Features:
 * - Interactive 6-second rewarded video ad overlay with live countdown
 * - Animated HTML5 dynamic game creative canvas with particle effects & CTAs
 * - Sound toggle (🔊 / 🔇) and interactive CTA button
 * - Random 5-20 points reward payout (e.g. 5, 7, 10, 13, 16, 18, 20 PTS)
 * - Celebratory reward unlock fanfare & seamless return to game/menus
 */
export class RewardedAdModal {
  constructor(economyManager) {
    this.economy = economyManager;
    this.modalEl = null;
    this.isShowing = false;
    this.animationFrameId = null;
    this.isMuted = false;
  }

  /**
   * Display the interactive Rewarded Ad and resolve with earned points
   */
  async showAd(durationSeconds = 6) {
    if (this.isShowing) return { success: false, reason: 'already_showing' };
    this.isShowing = true;

    return new Promise((resolve) => {
      this._createAdDOM(durationSeconds, (points) => {
        this.isShowing = false;
        resolve({ success: true, pointsEarned: points });
      });
    });
  }

  _generateRandomPoints() {
    // Generates a random integer between 5 and 20 inclusive
    return Math.floor(Math.random() * 16) + 5;
  }

  _createAdDOM(durationSeconds, onComplete) {
    // Remove existing modal if any
    const existing = document.getElementById('vnext-rewarded-ad-modal');
    if (existing) existing.remove();

    this.modalEl = document.createElement('div');
    this.modalEl.id = 'vnext-rewarded-ad-modal';
    this.modalEl.className = 'rewarded-ad-overlay';

    this.modalEl.innerHTML = `
      <div class="rewarded-ad-box">
        <!-- Ad Header Bar -->
        <div class="ad-header-bar">
          <div class="ad-sponsor-tag">
            <span class="ad-badge">AD</span>
            <span class="ad-sponsor-text">Google AdSense • Sponsored</span>
          </div>
          <div class="ad-header-controls">
            <button id="btn-ad-sound-toggle" class="ad-icon-btn" title="Toggle Sound">🔊</button>
            <div id="ad-countdown-pill" class="ad-countdown-pill">Reward in ${durationSeconds}s</div>
            <button id="btn-ad-exit-close" class="ad-close-btn hidden" title="Close & Claim">✕</button>
          </div>
        </div>

        <!-- Ad Body: Dynamic Visual Creative Canvas -->
        <div class="ad-media-container">
          <canvas id="ad-creative-canvas" width="640" height="360"></canvas>

          <div class="ad-creative-overlay">
            <div class="ad-app-info">
              <div class="ad-app-icon">⛩️</div>
              <div class="ad-app-meta">
                <h3 class="ad-app-title">SHADOW REALM: AWAKENING</h3>
                <div class="ad-app-rating">★★★★★ <span>4.9 (1.2M Reviews)</span></div>
                <p class="ad-app-desc">Master the forbidden ninja arts. Epic 3D boss battles await.</p>
              </div>
            </div>
            <button id="btn-ad-cta-action" class="ad-cta-btn">PLAY FREE NOW ➔</button>
          </div>

          <!-- Reward Claimed Flash Celebration Overlay -->
          <div id="ad-reward-celebration" class="ad-reward-celebration hidden">
            <div class="reward-celebration-card">
              <div class="reward-sparkle">✨💎✨</div>
              <h2 class="reward-title">REWARD UNLOCKED!</h2>
              <div id="reward-points-amount" class="reward-amount">+0 POINTS</div>
              <p class="reward-wallet-info">Added directly to your Shinobi wallet</p>
              <button id="btn-ad-claim-done" class="ad-claim-btn">COLLECT & CONTINUE ⚔️</button>
            </div>
          </div>
        </div>

        <!-- Ad Footer with Real-time Progress Bar -->
        <div class="ad-footer-bar">
          <div class="ad-progress-track">
            <div id="ad-progress-fill" class="ad-progress-fill" style="width: 0%;"></div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(this.modalEl);

    const canvas = this.modalEl.querySelector('#ad-creative-canvas');
    this._startCreativeAnimation(canvas);

    // Audio toggle
    const btnSound = this.modalEl.querySelector('#btn-ad-sound-toggle');
    if (btnSound) {
      btnSound.addEventListener('click', () => {
        this.isMuted = !this.isMuted;
        btnSound.textContent = this.isMuted ? '🔇' : '🔊';
      });
    }

    // CTA interaction
    const btnCta = this.modalEl.querySelector('#btn-ad-cta-action');
    if (btnCta) {
      btnCta.addEventListener('click', () => {
        btnCta.textContent = '✓ INSTALLING...';
        btnCta.style.background = '#10b981';
      });
    }

    // Countdown and Progress Logic
    const countdownPill = this.modalEl.querySelector('#ad-countdown-pill');
    const progressFill = this.modalEl.querySelector('#ad-progress-fill');
    const closeBtn = this.modalEl.querySelector('#btn-ad-exit-close');
    const celebrationOverlay = this.modalEl.querySelector('#ad-reward-celebration');
    const rewardPointsEl = this.modalEl.querySelector('#reward-points-amount');
    const btnClaimDone = this.modalEl.querySelector('#btn-ad-claim-done');

    const totalMs = durationSeconds * 1000;
    const startTime = performance.now();
    let earnedPoints = this._generateRandomPoints();
    let isCompleted = false;

    const interval = setInterval(() => {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(100, (elapsed / totalMs) * 100);
      const remainingSecs = Math.max(0, Math.ceil((totalMs - elapsed) / 1000));

      if (progressFill) progressFill.style.width = `${progress}%`;
      if (countdownPill) {
        countdownPill.textContent = remainingSecs > 0 ? `Reward in ${remainingSecs}s` : '✓ REWARD READY!';
      }

      if (elapsed >= totalMs && !isCompleted) {
        isCompleted = true;
        clearInterval(interval);

        // Credit points to economy
        if (this.economy) {
          this.economy.addPoints(earnedPoints, 'rewarded_ad_complete');
        }

        if (countdownPill) {
          countdownPill.textContent = '✓ REWARD READY!';
          countdownPill.classList.add('ready');
        }
        if (closeBtn) closeBtn.classList.remove('hidden');

        // Show celebration card
        if (rewardPointsEl) rewardPointsEl.textContent = `+${earnedPoints} POINTS`;
        if (celebrationOverlay) celebrationOverlay.classList.remove('hidden');
      }
    }, 80);

    const finishAndCleanup = () => {
      clearInterval(interval);
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
      }
      if (this.modalEl) {
        this.modalEl.classList.add('fade-out');
        setTimeout(() => {
          if (this.modalEl) this.modalEl.remove();
          this.modalEl = null;
        }, 300);
      }
      onComplete(earnedPoints);
    };

    if (closeBtn) closeBtn.addEventListener('click', finishAndCleanup);
    if (btnClaimDone) btnClaimDone.addEventListener('click', finishAndCleanup);
  }

  _startCreativeAnimation(canvas) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let t = 0;
    const particles = [];
    for (let i = 0; i < 35; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 60,
        vy: -Math.random() * 80 - 20,
        size: Math.random() * 3 + 1,
        hue: Math.random() > 0.5 ? 45 : 200,
        alpha: Math.random() * 0.7 + 0.3
      });
    }

    const renderAdScene = () => {
      t += 0.02;
      ctx.fillStyle = '#0a0d18';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Dynamic glowing aura backdrop
      const grad = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 20,
        canvas.width / 2, canvas.height / 2, 280
      );
      grad.addColorStop(0, 'rgba(56, 189, 248, 0.25)');
      grad.addColorStop(0.5, 'rgba(239, 68, 68, 0.15)');
      grad.addColorStop(1, 'rgba(10, 13, 24, 0.95)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Floating spark particles
      for (const p of particles) {
        p.x += p.vx * 0.016;
        p.y += p.vy * 0.016;
        if (p.y < 0) {
          p.y = canvas.height;
          p.x = Math.random() * canvas.width;
        }
        ctx.fillStyle = p.hue === 45 ? '#fbbf24' : '#38bdf8';
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1.0;

      // Dynamic animated neon slash
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2 - 20);
      const slashAngle = Math.sin(t * 2) * 0.3;
      ctx.rotate(slashAngle);

      ctx.strokeStyle = '#38bdf8';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 24;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, 0, 90 + Math.sin(t * 3) * 8, -Math.PI * 0.35, Math.PI * 0.35);
      ctx.stroke();

      ctx.strokeStyle = '#fbbf24';
      ctx.shadowColor = '#fbbf24';
      ctx.shadowBlur = 18;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, 0, 60, Math.PI * 0.7, Math.PI * 1.3);
      ctx.stroke();
      ctx.restore();

      if (this.isShowing) {
        this.animationFrameId = requestAnimationFrame(renderAdScene);
      }
    };

    renderAdScene();
  }
}
