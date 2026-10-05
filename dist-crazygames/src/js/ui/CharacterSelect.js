import { CHARACTER_ROSTER } from '../data/CharacterRoster.js';
import { characterCardLayout } from './selectLayout.js';

/**
 * CharacterSelect — v2.3 Cinematic Character Selection Screen.
 * v2.3 Visual Upgrades:
 * - Canvas-based particle aura behind selected character (auraType-driven)
 * - CSS clip-path name reveal animation on character switch
 * - Backdrop radial gradient reactive to character glowColor
 * - SPEED / POWER / STEALTH stat bar strip
 * - Strict Minimal Information Rule preserved
 */
export class CharacterSelect {
  constructor(containerEl, economyManager, rewardProvider, onSelectCallback) {
    this.container = containerEl;
    this.economy = economyManager;
    this.rewards = rewardProvider;
    this.onSelect = onSelectCallback;

    this.roster = CHARACTER_ROSTER;
    const currentId = this.economy ? this.economy.getSelectedCharacter() : 'kage_ryu';
    const foundIndex = this.roster.findIndex(c => c.id === currentId);
    this.selectedIndex = foundIndex !== -1 ? foundIndex : 0;

    this.touchStartX = 0;
    this.touchStartY = 0;
    this.isSwiping = false;

    // v2.3: aura canvas RAF handle
    this._auraRaf = null;
    this._auraParticles = [];

    this._initDOM();
    this._attachEventListeners();
    this.render();

    if (this.economy) {
      this.economy.subscribe(() => {
        this._updateWallet();
        if (this.container && !this.container.classList.contains('hidden') && this.container.style.display !== 'none') {
          this.render();
        }
      });
    }

    this.cooldownInterval = setInterval(() => {
      this._updateRewardButton();
    }, 1000);
  }

  _initDOM() {
    if (!this.container) return;
    this.container.innerHTML = `
      <div class="vnext-select-backdrop" id="char-backdrop"></div>

      <!-- v2.3: Particle Aura Canvas -->
      <canvas class="vnext-aura-canvas" id="char-aura-canvas" aria-hidden="true"></canvas>

      <!-- Header: profile plate (left) + reward / wallet (right) -->
      <header class="vnext-header">
        <div class="dd-profile">
          <div class="dd-avatar" id="char-avatar"><span class="dd-lvl" id="char-avatar-num">01</span></div>
          <div class="dd-profile-text">
            <span class="dd-profile-name">CHOOSE SHINOBI</span>
            <div class="dd-xp"><i style="width:50%"></i><b>STEP 1 / 2</b></div>
          </div>
        </div>

        <div class="vnext-header-right">
          <button id="btn-char-reward-ad" class="vnext-ad-btn" title="Watch Ad for Bonus Points">
            <span class="ad-icon">📺</span>
            <span id="char-ad-btn-text" class="ad-text">+POINTS</span>
          </button>

          <div class="vnext-wallet-badge">
            <span class="wallet-gem">💎</span>
            <span id="char-wallet-points" class="wallet-num">0</span>
            <span class="wallet-label">PTS</span>
          </div>
        </div>
      </header>

      <!-- Left icon column -->
      <nav class="dd-side" aria-label="Menu">
        <button type="button" id="btn-char-home" class="dd-icon-btn" aria-label="Home">
          <span class="ic"><svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor" aria-hidden="true"><path d="M12 3 2 12h3v8h5v-5h4v5h5v-8h3z"/></svg></span>
          <span class="lb">HOME</span>
        </button>
      </nav>

      <!-- Main Stage -->
      <main class="vnext-char-stage">
        <div class="vnext-carousel-viewport" id="char-carousel-viewport">
          <div class="dd-hero-name">
            <h2 id="char-meta-name" class="meta-name">KAGE-RYU</h2>
          </div>
          <div class="dd-pedestal" aria-hidden="true"></div>
          <div class="dd-power" id="char-power" aria-label="Combat power">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M14.5 3 21 9.5l-1.4 1.4-1.1-1.1-6.7 6.7 1.5 1.5-1.4 1.4-1.5-1.5-3.3 3.3-2.6-2.6 3.3-3.3-1.5-1.5 1.4-1.4 1.5 1.5 6.7-6.7-1.1-1.1z"/></svg>
            <span class="dd-power-label">POWER</span><b id="char-power-num">0</b>
          </div>
          <div class="dd-dots" id="char-dots" role="tablist" aria-label="Shinobi"></div>
          <div class="vnext-cards-track" id="char-cards-track"></div>
          <button id="btn-char-prev" class="vnext-nav-arrow arrow-left" aria-label="Previous Shinobi">‹</button>
          <button id="btn-char-next" class="vnext-nav-arrow arrow-right" aria-label="Next Shinobi">›</button>
        </div>

        <!-- Action & Pricing Area -->
        <div class="vnext-action-deck" id="char-action-deck">
          <div class="vnext-meta-row">
            <span id="char-meta-serial" class="meta-serial">01</span>
            <span id="char-meta-price" class="meta-price">FREE</span>
          </div>

          <!-- Stat Bars (real data from CHARACTER_ROSTER) -->
          <div class="vnext-stat-bars" id="char-stat-bars" aria-label="Character stats">
            <div class="stat-row">
              <span class="stat-label">SPD</span>
              <div class="stat-track"><div class="stat-fill" id="stat-fill-speed"></div></div>
            </div>
            <div class="stat-row">
              <span class="stat-label">PWR</span>
              <div class="stat-track"><div class="stat-fill" id="stat-fill-power"></div></div>
            </div>
            <div class="stat-row">
              <span class="stat-label">STL</span>
              <div class="stat-track"><div class="stat-fill" id="stat-fill-stealth"></div></div>
            </div>
          </div>

          <div class="vnext-btn-row">
            <button id="btn-char-action" class="vnext-primary-cta">
              <svg class="cta-ico" viewBox="0 0 24 24" width="34" height="34" fill="currentColor" aria-hidden="true"><path d="M14.5 3 21 9.5l-1.4 1.4-1.1-1.1-6.7 6.7 1.5 1.5-1.4 1.4-1.5-1.5-3.3 3.3-2.6-2.6 3.3-3.3-1.5-1.5 1.4-1.4 1.5 1.5 6.7-6.7-1.1-1.1z"/><path d="M9.5 3 3 9.5l1.4 1.4 1.1-1.1 3.2 3.2 1.4-1.4-3.2-3.2 1.1-1.1z" opacity=".75"/></svg>
              <span class="cta-col">
                <span id="char-action-text" class="cta-text">SELECT SHINOBI ➔</span>
                <span class="cta-sub">10 REALMS AWAIT</span>
              </span>
            </button>
          </div>
        </div>
      </main>
    `;

    // v2.3: start aura animation loop
    this._startAuraLoop();
  }

  // ---- v2.3: Aura particle system ----
  _startAuraLoop() {
    const auraCanvas = this.container && this.container.querySelector('#char-aura-canvas');
    if (!auraCanvas) return;

    const resizeAura = () => {
      auraCanvas.width = auraCanvas.offsetWidth || window.innerWidth;
      auraCanvas.height = auraCanvas.offsetHeight || window.innerHeight;
    };
    resizeAura();
    window.addEventListener('resize', resizeAura);

    this._auraParticles = Array.from({ length: 36 }, (_, i) => ({
      x: 0.5 + (Math.random() - 0.5) * 0.3,
      y: 0.55 + (Math.random() - 0.5) * 0.25,
      r: 2 + Math.random() * 5,
      speed: 0.15 + Math.random() * 0.4,
      angle: Math.random() * Math.PI * 2,
      drift: (Math.random() - 0.5) * 0.6,
      alpha: 0.3 + Math.random() * 0.5,
      phase: Math.random() * Math.PI * 2
    }));

    const ctx = auraCanvas.getContext('2d');
    let lastTime = performance.now();

    const loop = (now) => {
      this._auraRaf = requestAnimationFrame(loop);
      if (!this.container || this.container.style.display === 'none') return;

      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;
      const char = this.roster[this.selectedIndex];
      if (!char) return;

      const w = auraCanvas.width;
      const h = auraCanvas.height;

      ctx.clearRect(0, 0, w, h);

      // Parse glow color for particle tint
      const glow = char.glowColor || 'rgba(168,85,247,0.7)';

      for (const p of this._auraParticles) {
        p.angle += p.drift * dt;
        p.y -= p.speed * dt * 0.08;
        if (p.y < -0.05) {
          p.y = 0.65 + Math.random() * 0.1;
          p.x = 0.35 + Math.random() * 0.3;
        }
        p.phase += dt * 1.2;

        const px = p.x * w + Math.sin(p.phase) * 18;
        const py = p.y * h;
        const a = p.alpha * (0.5 + 0.5 * Math.sin(p.phase));

        ctx.save();
        ctx.globalAlpha = a;
        ctx.fillStyle = glow.replace(/[\d.]+\)$/, `${a})`);
        ctx.shadowColor = glow;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(px, py, p.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    };
    this._auraRaf = requestAnimationFrame(loop);
  }

  _attachEventListeners() {
    const homeBtn = this.container && this.container.querySelector('#btn-char-home');
    if (homeBtn) homeBtn.addEventListener('click', () => { if (window.ddGoHome) window.ddGoHome(); else window.location.href = '/'; });
    if (!this.container) return;

    const btnPrev = this.container.querySelector('#btn-char-prev');
    const btnNext = this.container.querySelector('#btn-char-next');
    if (btnPrev) btnPrev.addEventListener('click', () => this.prev());
    if (btnNext) btnNext.addEventListener('click', () => this.next());

    const btnAction = this.container.querySelector('#btn-char-action');
    if (btnAction) btnAction.addEventListener('click', () => this._handleAction());

    const btnAd = this.container.querySelector('#btn-char-reward-ad');
    if (btnAd) btnAd.addEventListener('click', () => this._handleWatchAd());

    window.addEventListener('keydown', (e) => {
      if (this.container.classList.contains('hidden') || this.container.style.display === 'none') return;
      if (e.code === 'ArrowLeft') this.prev();
      else if (e.code === 'ArrowRight') this.next();
      else if (e.code === 'Enter' || e.code === 'Space') this._handleAction();
    });

    const viewport = this.container.querySelector('#char-carousel-viewport');
    if (viewport) {
      viewport.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
          this.touchStartX = e.touches[0].clientX;
          this.touchStartY = e.touches[0].clientY;
          this.isSwiping = true;
        }
      }, { passive: true });

      viewport.addEventListener('touchend', (e) => {
        if (!this.isSwiping) return;
        this.isSwiping = false;
        const deltaX = e.changedTouches[0].clientX - this.touchStartX;
        const deltaY = e.changedTouches[0].clientY - this.touchStartY;
        if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY)) {
          if (deltaX < 0) this.next(); else this.prev();
        }
      }, { passive: true });
    }

    // Desktop mouse parallax on hero
    const stage = this.container.querySelector('.vnext-char-stage');
    const reduceMotion = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (stage && !reduceMotion) {
      let raf = 0;
      stage.addEventListener('pointermove', (e) => {
        if (e.pointerType !== 'mouse') return;
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          const r = stage.getBoundingClientRect();
          this.container.style.setProperty('--tx', (((e.clientX - r.left) / r.width) * 2 - 1).toFixed(3));
          this.container.style.setProperty('--ty', (((e.clientY - r.top) / r.height) * 2 - 1).toFixed(3));
        });
      });
      stage.addEventListener('pointerleave', () => {
        this.container.style.setProperty('--tx', '0');
        this.container.style.setProperty('--ty', '0');
      });
    }
  }

  prev() {
    if (this.selectedIndex > 0) { this.selectedIndex--; this.render(); }
  }

  next() {
    if (this.selectedIndex < this.roster.length - 1) { this.selectedIndex++; this.render(); }
  }

  selectIndex(index) {
    if (index >= 0 && index < this.roster.length) { this.selectedIndex = index; this.render(); }
  }

  render() {
    if (!this.container) return;
    const char = this.roster[this.selectedIndex];
    if (!char) return;

    this._updateWallet();
    this._updateRewardButton();

    if (!this._cards || this._cards.length !== this.roster.length) this._buildCards();
    this._applyLayout();

    // v2.3: Reactive backdrop glow
    this.container.style.setProperty('--sel-glow', char.glowColor);
    this.container.style.setProperty('--sel-accent', char.accentColor || '#a855f7');
    const backdrop = this.container.querySelector('#char-backdrop');
    if (backdrop) {
      backdrop.style.background = `radial-gradient(ellipse 70% 60% at 50% 45%, ${char.glowColor.replace(/[\d.]+\)$/, '0.18)')}, transparent 70%)`;
    }

    // Meta info
    const metaSerial = this.container.querySelector('#char-meta-serial');
    const metaName = this.container.querySelector('#char-meta-name');
    const metaPrice = this.container.querySelector('#char-meta-price');
    const actionBtn = this.container.querySelector('#btn-char-action');
    const actionText = this.container.querySelector('#char-action-text');

    const isUnlocked = this.economy ? this.economy.isCharacterUnlocked(char.id) : char.isFree;
    const isSelected = this.economy ? this.economy.getSelectedCharacter() === char.id : (this.selectedIndex === 0);

    if (metaSerial) metaSerial.textContent = char.serial;

    // v2.3: Animated name reveal via class toggle
    if (metaName) {
      metaName.classList.remove('name-reveal');
      void metaName.offsetWidth; // reflow to retrigger animation
      metaName.classList.add('name-reveal');
      metaName.innerHTML = `<span class="meta-name-main">${char.name}</span><span class="meta-name-title">${char.title}</span>`;
    }

    if (metaPrice) {
      if (char.isFree) {
        metaPrice.textContent = 'FREE';
        metaPrice.className = 'meta-price unlocked';
      } else if (isUnlocked) {
        metaPrice.textContent = 'UNLOCKED';
        metaPrice.className = 'meta-price unlocked';
      } else {
        metaPrice.textContent = `${char.price} POINTS`;
        metaPrice.className = 'meta-price locked';
      }
    }

    if (actionBtn && actionText) {
      if (isUnlocked) {
        actionBtn.className = 'vnext-primary-cta unlocked';
        actionText.textContent = isSelected ? 'PROCEED TO REALMS ➔' : 'SELECT SHINOBI ➔';
      } else {
        const points = this.economy ? this.economy.getPoints() : 0;
        const canAfford = points >= char.price;
        actionBtn.className = `vnext-primary-cta ${canAfford ? 'can-buy' : 'cannot-buy'}`;
        actionText.textContent = canAfford ? `UNLOCK (${char.price} PTS) 🔓` : `NEED ${char.price - points} MORE PTS`;
      }
    }

    // profile avatar + power plaque (real data from the roster)
    const av = this.container.querySelector('#char-avatar');
    if (av) av.style.backgroundImage = `url("${char.portrait || char.image}")`;
    const avNum = this.container.querySelector('#char-avatar-num');
    if (avNum) avNum.textContent = char.serial;
    const st = char.stats || { speed: char.speed || 80, power: 70, stealth: 70 };
    const pw = this.container.querySelector('#char-power-num');
    if (pw) pw.textContent = String(st.speed + st.power + st.stealth + (char.jump || 0));

    // dots (one per hero): tap to jump
    const dots = this.container.querySelector('#char-dots');
    if (dots) {
      if (dots.children.length !== this.roster.length) {
        dots.innerHTML = this.roster.map((r, i) => `<button type="button" class="dd-dot" role="tab" aria-label="${r.name}" data-i="${i}" style="--dot:${r.accentColor}"></button>`).join('');
        dots.querySelectorAll('.dd-dot').forEach((d) => d.addEventListener('click', () => this.selectIndex(Number(d.dataset.i))));
      }
      Array.from(dots.children).forEach((d, i) => { d.classList.toggle('on', i === this.selectedIndex); d.setAttribute('aria-selected', i === this.selectedIndex ? 'true' : 'false'); });
    }

    // v2.3: Stat bars
    this._updateStatBars(char);

    const btnPrev = this.container.querySelector('#btn-char-prev');
    const btnNext = this.container.querySelector('#btn-char-next');
    if (btnPrev) btnPrev.style.visibility = this.selectedIndex > 0 ? 'visible' : 'hidden';
    if (btnNext) btnNext.style.visibility = this.selectedIndex < this.roster.length - 1 ? 'visible' : 'hidden';
  }

  // v2.3: Stat bar fill widths
  _updateStatBars(char) {
    const stats = char.stats || { speed: char.speed || 80, power: 70, stealth: 70 };
    const fillSpeed = this.container.querySelector('#stat-fill-speed');
    const fillPower = this.container.querySelector('#stat-fill-power');
    const fillStealth = this.container.querySelector('#stat-fill-stealth');
    const accent = char.accentColor || '#a855f7';

    if (fillSpeed) { fillSpeed.style.width = `${stats.speed}%`; fillSpeed.style.background = accent; }
    if (fillPower)  { fillPower.style.width  = `${stats.power}%`;  fillPower.style.background  = accent; }
    if (fillStealth){ fillStealth.style.width = `${stats.stealth}%`; fillStealth.style.background = accent; }
  }

  _buildCards() {
    const track = this.container.querySelector('#char-cards-track');
    if (!track) return;
    track.innerHTML = this.roster.map((item, idx) => `
      <div class="vnext-char-card" data-index="${idx}" style="--card-accent: ${item.accentColor};">
        <div class="vnext-char-aura" style="background: radial-gradient(circle at 50% 50%, ${item.glowColor} 0%, transparent 70%);"></div>
        <div class="vnext-char-img-wrapper">
          <img src="${item.portrait || item.image}" alt="${item.name}" class="vnext-char-img" decoding="async" draggable="false" />
          <div class="vnext-lock-overlay" style="display: none;"><span class="lock-icon">🔒</span></div>
        </div>
      </div>
    `).join('');
    this._cards = Array.from(track.querySelectorAll('.vnext-char-card'));
    this._cards.forEach((card, idx) => card.addEventListener('click', () => this.selectIndex(idx)));
  }

  _applyLayout() {
    this._cards.forEach((card, idx) => {
      const item = this.roster[idx];
      const offset = idx - this.selectedIndex;
      const layout = characterCardLayout(offset);
      const isUnlocked = this.economy ? this.economy.isCharacterUnlocked(item.id) : item.isFree;

      card.style.transform = layout.transform;
      card.style.opacity = layout.opacity;
      card.style.zIndex = layout.zIndex;
      card.classList.toggle('selected', offset === 0);
      card.classList.toggle('unlocked', isUnlocked);
      card.classList.toggle('locked', !isUnlocked);

      const lock = card.querySelector('.vnext-lock-overlay');
      if (lock) lock.style.display = isUnlocked ? 'none' : 'flex';
    });
  }

  _updateWallet() {
    if (!this.container) return;
    const walletEl = this.container.querySelector('#char-wallet-points');
    if (walletEl && this.economy) walletEl.textContent = this.economy.getPoints().toLocaleString();
  }

  _updateRewardButton() {
    if (!this.container || !this.rewards) return;
    const btnAd = this.container.querySelector('#btn-char-reward-ad');
    const textEl = this.container.querySelector('#char-ad-btn-text');
    if (!btnAd || !textEl) return;

    if (this.rewards.isAvailable()) {
      btnAd.classList.remove('cooldown');
      textEl.textContent = '+POINTS';
    } else {
      btnAd.classList.add('cooldown');
      textEl.textContent = this.rewards.getFormattedRemainingTime();
    }
  }

  async _handleWatchAd() {
    if (!this.rewards || !this.rewards.isAvailable()) return;
    const btnAd = this.container.querySelector('#btn-char-reward-ad');
    if (btnAd) btnAd.classList.add('loading');
    const result = await this.rewards.showRewardedAd();
    if (btnAd) btnAd.classList.remove('loading');
    if (result && result.success) {
      this._showRewardNotification(`+${result.pointsEarned} POINTS EARNED!`);
      this.render();
    }
  }

  _showRewardNotification(msg) {
    const notif = document.createElement('div');
    notif.className = 'vnext-reward-toast';
    notif.textContent = `💎 ${msg}`;
    this.container.appendChild(notif);
    setTimeout(() => notif.classList.add('fade-out'), 1800);
    setTimeout(() => notif.remove(), 2200);
  }

  _handleAction() {
    const char = this.roster[this.selectedIndex];
    if (!char) return;
    const isUnlocked = this.economy ? this.economy.isCharacterUnlocked(char.id) : char.isFree;

    if (isUnlocked) {
      if (this.economy) this.economy.setSelectedCharacter(char.id);
      this.hide();
      if (this.onSelect) this.onSelect(char);
    } else {
      const success = this.economy ? this.economy.unlockCharacter(char.id, char.price) : false;
      if (success) {
        this._showRewardNotification(`${char.name} UNLOCKED!`);
        if (this.economy) this.economy.setSelectedCharacter(char.id);
        this.render();
      } else {
        this._showRewardNotification(`NOT ENOUGH POINTS (NEED ${char.price})`);
      }
    }
  }

  show() {
    if (this.container) {
      this.container.classList.remove('hidden');
      this.container.style.display = 'flex';
      this.render();
    }
  }

  hide() {
    if (this.container) {
      this.container.classList.add('hidden');
      this.container.style.display = 'none';
    }
  }

  destroy() {
    if (this.cooldownInterval) clearInterval(this.cooldownInterval);
    if (this._auraRaf) cancelAnimationFrame(this._auraRaf);
  }
}
