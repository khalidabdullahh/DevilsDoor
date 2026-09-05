import { SCENE_ROSTER } from '../data/SceneRoster.js';

/**
 * SceneSelect — vNext Cinematic Scene Selection Screen for Devil's Door v2.2.
 * Features:
 * - Minimal Info Rule: Shows ONLY Scene Name & Unlock Price
 * - 16:9 Main Visual Focus (No distortion, complete composition)
 * - Cinematic Gallery: Main Scene in focus with adjacent Next Scene partially visible at edge
 * - Smooth slide & scale transitions on click/swipe
 * - Points unlock integration with EconomyManager
 * - Back to Character Selection navigation
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
      <div class="vnext-select-backdrop"></div>

      <!-- Header: Back Button & Step Indicator & Points Wallet -->
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

      <!-- Main Stage: Cinematic 16:9 Gallery with Edge Peek -->
      <main class="vnext-scene-stage">
        <!-- Cinematic Gallery Viewport -->
        <div class="vnext-gallery-viewport" id="scene-gallery-viewport">
          <div class="vnext-gallery-track" id="scene-gallery-track">
            <!-- Populated dynamically -->
          </div>

          <!-- Navigation Arrow Buttons -->
          <button id="btn-scene-prev" class="vnext-nav-arrow arrow-left" aria-label="Previous Realm">‹</button>
          <button id="btn-scene-next" class="vnext-nav-arrow arrow-right" aria-label="Next Realm">›</button>
        </div>

        <!-- Minimal Action & Pricing Area -->
        <div class="vnext-action-deck" id="scene-action-deck">
          <div class="vnext-meta-row">
            <span id="scene-meta-serial" class="meta-serial">REALM 01</span>
            <h2 id="scene-meta-name" class="meta-name">SUNSET SANCTUARY</h2>
            <span id="scene-meta-price" class="meta-price">FREE</span>
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

    // Back to Character Select
    const btnBack = this.container.querySelector('#btn-scene-back');
    if (btnBack) {
      btnBack.addEventListener('click', () => {
        this.hide();
        if (this.onBackToChar) this.onBackToChar();
      });
    }

    // Navigation Arrows
    const btnPrev = this.container.querySelector('#btn-scene-prev');
    const btnNext = this.container.querySelector('#btn-scene-next');
    if (btnPrev) btnPrev.addEventListener('click', () => this.prev());
    if (btnNext) btnNext.addEventListener('click', () => this.next());

    // Primary Action Button (Enter Realm / Unlock)
    const btnAction = this.container.querySelector('#btn-scene-action');
    if (btnAction) {
      btnAction.addEventListener('click', () => this._handleAction());
    }

    // Rewarded Ad Button
    const btnAd = this.container.querySelector('#btn-scene-reward-ad');
    if (btnAd) {
      btnAd.addEventListener('click', () => this._handleWatchAd());
    }

    // Keyboard Navigation
    window.addEventListener('keydown', (e) => {
      if (this.container.classList.contains('hidden') || this.container.style.display === 'none') {
        return;
      }
      if (e.code === 'ArrowLeft') {
        this.prev();
      } else if (e.code === 'ArrowRight') {
        this.next();
      } else if (e.code === 'Enter' || e.code === 'Space') {
        this._handleAction();
      }
    });

    // Touch Swipe on Gallery Viewport
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
          if (deltaX < 0) {
            this.next();
          } else {
            this.prev();
          }
        }
      }, { passive: true });
    }
  }

  prev() {
    if (this.selectedIndex > 0) {
      this.selectedIndex--;
      this.render();
    }
  }

  next() {
    if (this.selectedIndex < this.roster.length - 1) {
      this.selectedIndex++;
      this.render();
    }
  }

  selectIndex(index) {
    if (index >= 0 && index < this.roster.length) {
      this.selectedIndex = index;
      this.render();
    }
  }

  render() {
    if (!this.container) return;
    const scene = this.roster[this.selectedIndex];
    if (!scene) return;

    this._updateWallet();
    this._updateRewardButton();

    const track = this.container.querySelector('#scene-gallery-track');
    if (track) {
      // Gallery calculation: main item in center, next scene partially visible on right edge
      const itemWidthPercent = 82; // Main card width
      const offsetPercent = -this.selectedIndex * (itemWidthPercent + 3);

      track.style.transform = `translateX(${offsetPercent}%)`;

      track.innerHTML = this.roster.map((item, idx) => {
        const isSelected = idx === this.selectedIndex;
        const isUnlocked = this.economy ? this.economy.isSceneUnlocked(item.id) : item.isFree;

        return `
          <div class="vnext-scene-card ${isSelected ? 'selected' : ''} ${isUnlocked ? 'unlocked' : 'locked'}"
               data-index="${idx}">
            <div class="vnext-scene-frame">
              <img src="${item.image}" alt="${item.name}" class="vnext-scene-img" />
              ${!isUnlocked ? '<div class="vnext-lock-overlay"><span class="lock-icon">🔒</span><span class="lock-price">' + item.price + ' PTS</span></div>' : ''}
              <div class="vnext-scene-gradient"></div>
              <div class="vnext-scene-card-label">${item.name}</div>
            </div>
          </div>
        `;
      }).join('');

      track.querySelectorAll('.vnext-scene-card').forEach((card) => {
        card.addEventListener('click', () => {
          const idx = parseInt(card.getAttribute('data-index'), 10);
          this.selectIndex(idx);
        });
      });
    }

    // Update Meta Information (Minimal Information Rule)
    const metaSerial = this.container.querySelector('#scene-meta-serial');
    const metaName = this.container.querySelector('#scene-meta-name');
    const metaPrice = this.container.querySelector('#scene-meta-price');
    const actionBtn = this.container.querySelector('#btn-scene-action');
    const actionText = this.container.querySelector('#scene-action-text');

    const isUnlocked = this.economy ? this.economy.isSceneUnlocked(scene.id) : scene.isFree;

    if (metaSerial) metaSerial.textContent = scene.number;
    if (metaName) metaName.textContent = scene.name;

    if (metaPrice) {
      if (isUnlocked) {
        metaPrice.textContent = 'UNLOCKED';
        metaPrice.className = 'meta-price unlocked';
      } else {
        metaPrice.textContent = `${scene.price} POINTS`;
        metaPrice.className = 'meta-price locked';
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

    // Update Arrow button visibility
    const btnPrev = this.container.querySelector('#btn-scene-prev');
    const btnNext = this.container.querySelector('#btn-scene-next');
    if (btnPrev) btnPrev.style.visibility = this.selectedIndex > 0 ? 'visible' : 'hidden';
    if (btnNext) btnNext.style.visibility = this.selectedIndex < this.roster.length - 1 ? 'visible' : 'hidden';
  }

  _updateWallet() {
    if (!this.container) return;
    const walletEl = this.container.querySelector('#scene-wallet-points');
    if (walletEl && this.economy) {
      walletEl.textContent = this.economy.getPoints().toLocaleString();
    }
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
    if (!this.rewards) return;
    if (!this.rewards.isAvailable()) return;

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
      if (this.economy) {
        this.economy.setSelectedScene(scene.id);
      }
      this.hide();
      if (this.onStartRun) {
        this.onStartRun(scene);
      }
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
    if (this.cooldownInterval) {
      clearInterval(this.cooldownInterval);
    }
  }
}
