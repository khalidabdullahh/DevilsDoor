import { SCENE_ROSTER } from '../data/SceneRoster.js';
import { loadWindow } from './selectLayout.js';

/**
 * SceneSelect — v2.3 Cinematic Realm Selection Screen.
 * v2.3 Visual Upgrades:
 * - Realm lore tagline displayed below the scene name
 * - Difficulty star rating (★★☆☆☆) shown alongside lore
 * - Atmospheric CSS particle animation in backdrop (particleType-driven)
 * - Backdrop cross-fade retains existing behavior
 */
export class SceneSelect {
  constructor(containerEl, economyManager, rewardProvider, onStartRunCallback, onBackToCharCallback) {
    this.container = containerEl;
    this.economy = economyManager;
    this.rewards = rewardProvider;
    this.onStartRun = onStartRunCallback;
    this.onBackToChar = onBackToCharCallback;

    this.roster = SCENE_ROSTER;
    const currentId = this.economy ? this.economy.getSelectedScene() : 'sunset_torii';
    const foundIndex = this.roster.findIndex(s => s.id === currentId);
    this.selectedIndex = foundIndex !== -1 ? foundIndex : 0;

    this._preloaded = new Set();
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.isSwiping = false;

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
      <!-- Full-bleed blurred artwork (two cross-fade layers) -->
      <div class="vnext-scene-bgs" aria-hidden="true">
        <img class="vnext-scene-bg" alt="" decoding="async" />
        <img class="vnext-scene-bg" alt="" decoding="async" />
      </div>
      <!-- v2.3: Atmospheric particle overlay -->
      <div class="vnext-atmo-particles" id="scene-atmo-particles" aria-hidden="true"></div>
      <div class="vnext-select-backdrop"></div>

      <!-- Header -->
      <header class="vnext-header">
        <div class="vnext-header-left">
          <button id="btn-scene-back" class="vnext-back-btn" title="Back to Shinobi Select">
            ‹ SHINOBI
          </button>
          <div class="vnext-step-badge">
            <span class="step-num">STEP 2</span>
            <span class="step-label">SELECT REALM</span>
          </div>
        </div>

        <div class="vnext-header-right">
          <button id="btn-scene-reward-ad" class="vnext-ad-btn" title="Watch Ad for Bonus Points">
            <span class="ad-icon">📺</span>
            <span id="scene-ad-btn-text" class="ad-text">+POINTS</span>
          </button>

          <div class="vnext-wallet-badge">
            <span class="wallet-gem">💎</span>
            <span id="scene-wallet-points" class="wallet-num">0</span>
            <span class="wallet-label">PTS</span>
          </div>
        </div>
      </header>

      <!-- Main Stage -->
      <main class="vnext-scene-stage">
        <div class="vnext-gallery-viewport" id="scene-gallery-viewport">
          <!-- ONE big preview (two cross-fading layers, opacity-only animation) -->
          <div class="vnext-preview" id="scene-preview">
            <img class="vnext-preview-img" alt="" decoding="async" draggable="false" />
            <img class="vnext-preview-img" alt="" decoding="async" draggable="false" />
            <div class="vnext-lock-overlay" id="scene-preview-lock" style="display: none;"><span class="lock-icon">🔒</span><span class="lock-price"></span></div>
            <div class="vnext-scene-gradient"></div>
          </div>
          <button id="btn-scene-prev" class="vnext-nav-arrow arrow-left" aria-label="Previous Realm">‹</button>
          <button id="btn-scene-next" class="vnext-nav-arrow arrow-right" aria-label="Next Realm">›</button>
        </div>

        <!-- Thumbnail strip: tiny 240px WebP, scroll/swipe to browse -->
        <div class="vnext-thumb-strip" id="scene-thumb-strip" role="listbox" aria-label="Realms"></div>

        <!-- Action & Pricing Area -->
        <div class="vnext-action-deck" id="scene-action-deck">
          <div class="vnext-meta-row">
            <span id="scene-meta-serial" class="meta-serial">REALM 01</span>
            <h2 id="scene-meta-name" class="meta-name">SUNSET SANCTUARY</h2>
            <span id="scene-meta-price" class="meta-price">FREE</span>
          </div>

          <!-- v2.3: Lore line + Difficulty stars -->
          <div class="vnext-realm-lore-row" id="scene-lore-row">
            <p id="scene-lore-text" class="realm-lore-text"></p>
            <div id="scene-difficulty" class="realm-difficulty" aria-label="Difficulty"></div>
          </div>

          <div class="vnext-btn-row">
            <button id="btn-scene-action" class="vnext-primary-cta">
              <span id="scene-action-text" class="cta-text">ENTER REALM ⚔️</span>
            </button>
          </div>
        </div>
      </main>
    `;
  }

  _attachEventListeners() {
    if (!this.container) return;

    const btnBack = this.container.querySelector('#btn-scene-back');
    if (btnBack) {
      btnBack.addEventListener('click', () => {
        this.hide();
        if (this.onBackToChar) this.onBackToChar();
      });
    }

    const btnPrev = this.container.querySelector('#btn-scene-prev');
    const btnNext = this.container.querySelector('#btn-scene-next');
    if (btnPrev) btnPrev.addEventListener('click', () => this.prev());
    if (btnNext) btnNext.addEventListener('click', () => this.next());

    const btnAction = this.container.querySelector('#btn-scene-action');
    if (btnAction) btnAction.addEventListener('click', () => this._handleAction());

    const btnAd = this.container.querySelector('#btn-scene-reward-ad');
    if (btnAd) btnAd.addEventListener('click', () => this._handleWatchAd());

    window.addEventListener('keydown', (e) => {
      if (this.container.classList.contains('hidden') || this.container.style.display === 'none') return;
      if (e.code === 'ArrowLeft') this.prev();
      else if (e.code === 'ArrowRight') this.next();
      else if (e.code === 'Enter' || e.code === 'Space') this._handleAction();
    });

    const viewport = this.container.querySelector('#scene-gallery-viewport');
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
    const scene = this.roster[this.selectedIndex];
    if (!scene) return;

    this._updateWallet();
    this._updateRewardButton();

    if (!this._thumbs) this._buildThumbs();
    const isSelUnlocked = this.economy ? this.economy.isSceneUnlocked(scene.id) : scene.isFree;
    this._thumbs.forEach((t, idx) => {
      const item = this.roster[idx];
      const unlocked = this.economy ? this.economy.isSceneUnlocked(item.id) : item.isFree;
      t.classList.toggle('selected', idx === this.selectedIndex);
      t.classList.toggle('locked', !unlocked);
      t.setAttribute('aria-selected', idx === this.selectedIndex ? 'true' : 'false');
      const lk = t.querySelector('.thumb-lock');
      if (lk) lk.style.display = unlocked ? 'none' : 'block';
    });
    this._scrollThumbIntoView();

    this._showPreview(scene);
    const lock = this.container.querySelector('#scene-preview-lock');
    if (lock) {
      lock.style.display = isSelUnlocked ? 'none' : 'flex';
      const pr = lock.querySelector('.lock-price');
      if (pr) pr.textContent = `${scene.price} PTS`;
    }
    this._setBackdrop(scene);

    // Meta info
    const metaSerial = this.container.querySelector('#scene-meta-serial');
    const metaName  = this.container.querySelector('#scene-meta-name');
    const metaPrice = this.container.querySelector('#scene-meta-price');
    const actionBtn  = this.container.querySelector('#btn-scene-action');
    const actionText = this.container.querySelector('#scene-action-text');

    const isUnlocked = this.economy ? this.economy.isSceneUnlocked(scene.id) : scene.isFree;

    if (metaSerial) metaSerial.textContent = scene.number;
    if (metaName) {
      metaName.classList.remove('name-reveal');
      void metaName.offsetWidth;
      metaName.classList.add('name-reveal');
      metaName.textContent = scene.name;
    }

    if (metaPrice) {
      if (scene.isFree) {
        metaPrice.textContent = 'FREE'; metaPrice.className = 'meta-price unlocked';
      } else if (isUnlocked) {
        metaPrice.textContent = 'UNLOCKED'; metaPrice.className = 'meta-price unlocked';
      } else {
        metaPrice.textContent = `${scene.price} POINTS`; metaPrice.className = 'meta-price locked';
      }
    }

    if (actionBtn && actionText) {
      if (isUnlocked) {
        actionBtn.className = 'vnext-primary-cta unlocked';
        actionText.textContent = 'ENTER REALM ⚔️';
      } else {
        const points = this.economy ? this.economy.getPoints() : 0;
        const canAfford = points >= scene.price;
        actionBtn.className = `vnext-primary-cta ${canAfford ? 'can-buy' : 'cannot-buy'}`;
        actionText.textContent = canAfford ? `UNLOCK REALM (${scene.price} PTS) 🔓` : `NEED ${scene.price - points} MORE PTS`;
      }
    }

    // v2.3: Lore + difficulty
    this._updateLore(scene);
    // v2.3: Atmospheric particle class
    this._updateAtmoParticles(scene);

    const btnPrev = this.container.querySelector('#btn-scene-prev');
    const btnNext = this.container.querySelector('#btn-scene-next');
    if (btnPrev) btnPrev.style.visibility = this.selectedIndex > 0 ? 'visible' : 'hidden';
    if (btnNext) btnNext.style.visibility = this.selectedIndex < this.roster.length - 1 ? 'visible' : 'hidden';
  }

  // v2.3: Render lore text and difficulty stars
  _updateLore(scene) {
    const loreText = this.container.querySelector('#scene-lore-text');
    const diffEl = this.container.querySelector('#scene-difficulty');

    if (loreText) {
      loreText.classList.remove('lore-reveal');
      void loreText.offsetWidth;
      loreText.classList.add('lore-reveal');
      loreText.textContent = scene.lore || '';
    }

    if (diffEl && scene.difficulty) {
      const total = 5;
      const filled = Math.min(total, Math.max(1, scene.difficulty));
      let stars = '';
      for (let i = 0; i < total; i++) {
        stars += `<span class="diff-star ${i < filled ? 'filled' : 'empty'}">★</span>`;
      }
      diffEl.innerHTML = stars;
    }
  }

  // v2.3: Set particleType class on the atmospheric overlay div
  _updateAtmoParticles(scene) {
    const atmo = this.container.querySelector('#scene-atmo-particles');
    if (!atmo) return;
    // Remove all particle type classes
    atmo.className = 'vnext-atmo-particles';
    if (scene.particleType) {
      atmo.classList.add(`atmo-${scene.particleType}`);
    }
    // Set accent color for particles
    atmo.style.setProperty('--atmo-color', scene.accentColor || '#ef4444');
    atmo.style.setProperty('--atmo-glow', scene.glowColor || 'rgba(239,68,68,0.6)');
  }

  _scrollThumbIntoView() {
    const strip = this.container.querySelector('#scene-thumb-strip');
    const t = this._thumbs && this._thumbs[this.selectedIndex];
    if (!strip || !t) return;
    const left = t.offsetLeft - (strip.clientWidth - t.offsetWidth) / 2;
    strip.scrollTo({ left, behavior: 'smooth' });
  }

  _buildThumbs() {
    const strip = this.container.querySelector('#scene-thumb-strip');
    if (!strip) return;
    strip.innerHTML = this.roster.map((item, idx) => `
      <button class="vnext-thumb" data-index="${idx}" role="option" aria-label="${item.number} ${item.name}" style="--card-accent: ${item.accentColor};">
        <img src="${item.thumb}" alt="" loading="lazy" decoding="async" draggable="false" width="240" height="134" />
        <span class="thumb-lock" style="display: none;">🔒</span>
        <span class="thumb-num">${item.serial}</span>
      </button>
    `).join('');
    this._thumbs = Array.from(strip.querySelectorAll('.vnext-thumb'));
    this._thumbs.forEach((t, idx) => t.addEventListener('click', () => this.selectIndex(idx)));
  }

  // Show the selected realm's preview (cross-fade, opacity only) and warm the cache for neighbours.
  _showPreview(scene) {
    const layers = this.container.querySelectorAll('.vnext-preview-img');
    if (layers.length < 2) return;
    if (this._previewSrc !== scene.preview) {
      this._previewSrc = scene.preview;
      this._previewFlip = !this._previewFlip;
      const next = layers[this._previewFlip ? 1 : 0];
      const prev = layers[this._previewFlip ? 0 : 1];
      next.alt = scene.name;
      next.setAttribute('src', scene.preview);
      next.classList.add('show');
      prev.classList.remove('show');
    }
    // Preload only the 1 realm on each side (not all 10)
    for (const i of loadWindow(this.selectedIndex, this.roster.length, 1)) {
      const src = this.roster[i].preview;
      if (!this._preloaded.has(src)) { this._preloaded.add(src); const im = new Image(); im.decoding = 'async'; im.src = src; }
    }
  }

  _setBackdrop(scene) {
    const layers = this.container.querySelectorAll('.vnext-scene-bg');
    this.container.style.setProperty('--sel-glow', scene.glowColor);
    this.container.style.setProperty('--sel-accent', scene.accentColor || '#e8481c');
    if (layers.length < 2 || this._backdropSrc === scene.blur) return;
    this._backdropSrc = scene.blur;
    this._backdropFlip = !this._backdropFlip;
    const next = layers[this._backdropFlip ? 1 : 0];
    const prev = layers[this._backdropFlip ? 0 : 1];
    next.setAttribute('src', scene.blur);
    next.classList.add('show');
    prev.classList.remove('show');
  }

  _updateWallet() {
    if (!this.container) return;
    const walletEl = this.container.querySelector('#scene-wallet-points');
    if (walletEl && this.economy) walletEl.textContent = this.economy.getPoints().toLocaleString();
  }

  _updateRewardButton() {
    if (!this.container || !this.rewards) return;
    const btnAd = this.container.querySelector('#btn-scene-reward-ad');
    const textEl = this.container.querySelector('#scene-ad-btn-text');
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
    const btnAd = this.container.querySelector('#btn-scene-reward-ad');
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
    const scene = this.roster[this.selectedIndex];
    if (!scene) return;
    const isUnlocked = this.economy ? this.economy.isSceneUnlocked(scene.id) : scene.isFree;

    if (isUnlocked) {
      if (this.economy) this.economy.setSelectedScene(scene.id);
      this.hide();
      if (this.onStartRun) this.onStartRun(scene);
    } else {
      const success = this.economy ? this.economy.unlockScene(scene.id, scene.price) : false;
      if (success) {
        this._showRewardNotification(`${scene.name} UNLOCKED!`);
        if (this.economy) this.economy.setSelectedScene(scene.id);
        this.render();
      } else {
        this._showRewardNotification(`NOT ENOUGH POINTS (NEED ${scene.price})`);
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
  }
}
