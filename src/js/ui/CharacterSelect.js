import { CHARACTER_ROSTER } from '../data/CharacterRoster.js';
import { characterCardLayout } from './selectLayout.js';

/**
 * CharacterSelect — vNext 3D Focus-Animated Character Selection Screen.
 * Strict Minimal Information Rule:
 * - Serial number (01)
 * - Character name (KAGE-RYU)
 * - Price / Unlock state (FREE / 500 PTS)
 * - Action button (SELECT / UNLOCK)
 * - Dynamic 3D Focus Selector with perspective, scale & depth
 * - Swipe, tap, keyboard, and click navigation
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

    this._initDOM();
    this._attachEventListeners();
    this.render();

    // Subscribe to economy updates
    if (this.economy) {
      this.economy.subscribe(() => {
        this._updateWallet();
        if (this.container && !this.container.classList.contains('hidden') && this.container.style.display !== 'none') {
          this.render();
        }
      });
    }

    // Cooldown interval for reward button
    this.cooldownInterval = setInterval(() => {
      this._updateRewardButton();
    }, 1000);
  }

  _initDOM() {
    if (!this.container) return;
    this.container.innerHTML = `
      <div class="vnext-select-backdrop"></div>

      <!-- Minimal Header: Step Indicator & Points Wallet & Watch Ad CTA -->
      <header class="vnext-header">
        <div class="vnext-step-badge">
          <span class="step-num">STEP 1</span>
          <span class="step-label">CHOOSE SHINOBI</span>
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

      <!-- Main Stage: 3D Perspective Character Focus Showcase -->
      <main class="vnext-char-stage">
        <!-- 3D Carousel Stage -->
        <div class="vnext-carousel-viewport" id="char-carousel-viewport">
          <div class="vnext-cards-track" id="char-cards-track">
            <!-- Rendered dynamically -->
          </div>

          <!-- Navigation Arrow Buttons -->
          <button id="btn-char-prev" class="vnext-nav-arrow arrow-left" aria-label="Previous Shinobi">‹</button>
          <button id="btn-char-next" class="vnext-nav-arrow arrow-right" aria-label="Next Shinobi">›</button>
        </div>

        <!-- Minimal Action & Pricing Area -->
        <div class="vnext-action-deck" id="char-action-deck">
          <div class="vnext-meta-row">
            <span id="char-meta-serial" class="meta-serial">01</span>
            <h2 id="char-meta-name" class="meta-name">KAGE-RYU</h2>
            <span id="char-meta-price" class="meta-price">FREE</span>
          </div>

          <div class="vnext-btn-row">
            <button id="btn-char-action" class="vnext-primary-cta">
              <span id="char-action-text" class="cta-text">SELECT SHINOBI ➔</span>
            </button>
          </div>
        </div>
      </main>
    `;
  }

  _attachEventListeners() {
    if (!this.container) return;

    // Navigation Arrows
    const btnPrev = this.container.querySelector('#btn-char-prev');
    const btnNext = this.container.querySelector('#btn-char-next');
    if (btnPrev) btnPrev.addEventListener('click', () => this.prev());
    if (btnNext) btnNext.addEventListener('click', () => this.next());

    // Primary Action Button (Select / Unlock / Proceed)
    const btnAction = this.container.querySelector('#btn-char-action');
    if (btnAction) {
      btnAction.addEventListener('click', () => this._handleAction());
    }

    // Rewarded Ad Button
    const btnAd = this.container.querySelector('#btn-char-reward-ad');
    if (btnAd) {
      btnAd.addEventListener('click', () => this._handleWatchAd());
    }

    // Keyboard Navigation (Desktop)
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

    // Touch Swipe Navigation (Mobile)
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

        // Check horizontal swipe threshold
        if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY)) {
          if (deltaX < 0) {
            this.next();
          } else {
            this.prev();
          }
        }
      }, { passive: true });
    }

    // Desktop: the centered hero tilts toward the mouse (3D parallax). Skipped for reduced motion.
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
    const char = this.roster[this.selectedIndex];
    if (!char) return;

    this._updateWallet();
    this._updateRewardButton();

    // Cards are built ONCE and only restyled afterwards. (Before, render() destroyed and rebuilt
    // every card on each swipe, so the CSS transitions and the idle bob could never animate.)
    if (!this._cards || this._cards.length !== this.roster.length) this._buildCards();
    this._applyLayout();
    this.container.style.setProperty('--sel-glow', char.glowColor);

    // Update Meta Info (Minimal Information Rule)
    const metaSerial = this.container.querySelector('#char-meta-serial');
    const metaName = this.container.querySelector('#char-meta-name');
    const metaPrice = this.container.querySelector('#char-meta-price');
    const actionBtn = this.container.querySelector('#btn-char-action');
    const actionText = this.container.querySelector('#char-action-text');

    const isUnlocked = this.economy ? this.economy.isCharacterUnlocked(char.id) : char.isFree;
    const isSelected = this.economy ? this.economy.getSelectedCharacter() === char.id : (this.selectedIndex === 0);

    if (metaSerial) metaSerial.textContent = char.serial;
    if (metaName) metaName.innerHTML = `<span class="meta-name-main">${char.name}</span><span class="meta-name-title">${char.title}</span>`;

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

    // Update Arrow button visibility
    const btnPrev = this.container.querySelector('#btn-char-prev');
    const btnNext = this.container.querySelector('#btn-char-next');
    if (btnPrev) btnPrev.style.visibility = this.selectedIndex > 0 ? 'visible' : 'hidden';
    if (btnNext) btnNext.style.visibility = this.selectedIndex < this.roster.length - 1 ? 'visible' : 'hidden';
  }

  _buildCards() {
    const track = this.container.querySelector('#char-cards-track');
    if (!track) return;
    track.innerHTML = this.roster.map((item, idx) => `
      <div class="vnext-char-card" data-index="${idx}" style="--card-accent: ${item.accentColor};">
        <div class="vnext-char-aura" style="background: radial-gradient(circle at 50% 50%, ${item.glowColor} 0%, transparent 70%);"></div>
        <div class="vnext-char-img-wrapper">
          <img src="${item.image}" alt="${item.name}" class="vnext-char-img" decoding="async" draggable="false" />
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
    if (walletEl && this.economy) {
      walletEl.textContent = this.economy.getPoints().toLocaleString();
    }
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
    if (!this.rewards) return;
    if (!this.rewards.isAvailable()) return;

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
      if (this.economy) {
        this.economy.setSelectedCharacter(char.id);
      }
      this.hide();
      if (this.onSelect) {
        this.onSelect(char);
      }
    } else {
      // Attempt Purchase
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
    if (this.cooldownInterval) {
      clearInterval(this.cooldownInterval);
    }
  }
}
