import { CHARACTER_ROSTER } from '../data/CharacterRoster.js';

/**
 * CharacterSelect — Commercial Dark-Fantasy Character Selection Screen.
 * Features:
 * - Large full-body character presentation with atmospheric lighting & breathing animation
 * - Character stats, lore tagline, and signature trait display
 * - Responsive mobile-landscape carousel with swipe & tap selection
 * - Desktop arrow key & Enter confirmation navigation
 * - Smooth transition directly into the Endless Domain run
 */
export class CharacterSelect {
  constructor(containerEl, onStartRunCallback) {
    this.container = containerEl;
    this.onStartRun = onStartRunCallback;

    this.roster = CHARACTER_ROSTER;
    this.selectedIndex = 0;
    this.activeCharacter = this.roster[0];

    this.touchStartX = 0;
    this.touchStartY = 0;

    this._initDOM();
    this._attachEventListeners();
    this.render();
  }

  _initDOM() {
    if (!this.container) return;
    this.container.innerHTML = `
      <div class="char-select-backdrop"></div>
      
      <!-- Top Bar: Header Branding & Diamond Balance -->
      <header class="char-select-header">
        <div class="char-select-brand">
          <span class="brand-torii">⛩️</span>
          <span class="brand-title">SELECT YOUR SHINOBI</span>
        </div>
        <div class="char-select-wallet">
          <span class="wallet-icon">💎</span>
          <span id="char-wallet-diamonds" class="wallet-val">0</span>
        </div>
      </header>

      <!-- Main Stage Split Layout (Desktop & Landscape Mobile) -->
      <main class="char-select-stage">
        <!-- Left / Center: Dominant Full-Body Character Showcase -->
        <div class="char-preview-panel">
          <div class="char-preview-aura" id="char-preview-aura"></div>
          <div class="char-preview-figure-wrapper" id="char-figure-wrapper">
            <img id="char-preview-img" class="char-preview-img" src="" alt="Selected Character" />
          </div>
          <!-- Navigation Arrow Controls -->
          <button id="btn-prev-char" class="char-nav-arrow arrow-left" aria-label="Previous Shinobi">‹</button>
          <button id="btn-next-char" class="char-nav-arrow arrow-right" aria-label="Next Shinobi">›</button>
        </div>

        <!-- Right: Character Info, Traits, Stats & Actions -->
        <div class="char-info-panel">
          <div class="char-info-header">
            <span id="char-number-tag" class="char-number-tag">#01</span>
            <span id="char-role-tag" class="char-role-tag">PROTAGONIST</span>
          </div>
          
          <h2 id="char-name-title" class="char-name-title">SHADOW NINJA</h2>
          <p id="char-tagline" class="char-tagline">"The silent wanderer of the Domain."</p>

          <!-- Signature Trait Badge -->
          <div class="char-trait-box">
            <div class="trait-header">
              <span class="trait-icon">⚔️</span>
              <span class="trait-label">SIGNATURE TRAIT</span>
            </div>
            <div id="char-trait-name" class="trait-name">AGILITY & CHAYA DASH</div>
            <div id="char-trait-desc" class="trait-desc">High movement speed, double somersault flip, and high-speed cleaving dash.</div>
          </div>

          <!-- Stats Overview -->
          <div class="char-stats-grid">
            <div class="stat-row">
              <span class="stat-name">SPEED</span>
              <div class="stat-bar-track"><div id="stat-bar-speed" class="stat-bar-fill" style="width: 95%;"></div></div>
            </div>
            <div class="stat-row">
              <span class="stat-name">JUMP</span>
              <div class="stat-bar-track"><div id="stat-bar-jump" class="stat-bar-fill" style="width: 90%;"></div></div>
            </div>
            <div class="stat-row">
              <span class="stat-name">DAMAGE</span>
              <div class="stat-bar-track"><div id="stat-bar-damage" class="stat-bar-fill" style="width: 85%;"></div></div>
            </div>
          </div>

          <!-- Primary CTA Button -->
          <div class="char-action-group">
            <button id="btn-start-run" class="btn-start-run">
              <span class="btn-text">⚔️ START RUN</span>
              <span class="btn-subtext">ENTER THE ENDLESS DOMAIN</span>
            </button>
          </div>
        </div>
      </main>

      <!-- Bottom Horizontal Roster Carousel (Thumb-Friendly for Landscape Mobile) -->
      <footer class="char-roster-footer">
        <div class="char-roster-carousel" id="char-roster-carousel">
          <!-- Populated dynamically -->
        </div>
      </footer>
    `;
  }

  _attachEventListeners() {
    if (!this.container) return;

    // Previous / Next Buttons
    const btnPrev = this.container.querySelector('#btn-prev-char');
    const btnNext = this.container.querySelector('#btn-next-char');
    if (btnPrev) btnPrev.addEventListener('click', () => this.prevCharacter());
    if (btnNext) btnNext.addEventListener('click', () => this.nextCharacter());

    // Start Run Button
    const btnStart = this.container.querySelector('#btn-start-run');
    if (btnStart) {
      btnStart.addEventListener('click', () => this._handleStartRun());
    }

    // Touch Swipe Gestures on Mobile
    this.container.addEventListener('touchstart', (e) => {
      if (e.touches.length > 0) {
        this.touchStartX = e.touches[0].clientX;
        this.touchStartY = e.touches[0].clientY;
      }
    }, { passive: true });

    this.container.addEventListener('touchend', (e) => {
      if (e.changedTouches.length > 0) {
        const deltaX = e.changedTouches[0].clientX - this.touchStartX;
        const deltaY = e.changedTouches[0].clientY - this.touchStartY;
        // Check horizontal swipe threshold
        if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY) * 1.4) {
          if (deltaX < 0) {
            this.nextCharacter();
          } else {
            this.prevCharacter();
          }
        }
      }
    }, { passive: true });

    // Keyboard Navigation
    window.addEventListener('keydown', (e) => {
      if (!this.isVisible()) return;

      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        this.prevCharacter();
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        this.nextCharacter();
      } else if (e.key === 'Enter' || e.key === ' ') {
        this._handleStartRun();
      }
    });
  }

  selectCharacter(index) {
    if (index < 0 || index >= this.roster.length) return;
    this.selectedIndex = index;
    this.activeCharacter = this.roster[this.selectedIndex];
    this.render();
  }

  nextCharacter() {
    const nextIdx = (this.selectedIndex + 1) % this.roster.length;
    this.selectCharacter(nextIdx);
  }

  prevCharacter() {
    const prevIdx = (this.selectedIndex - 1 + this.roster.length) % this.roster.length;
    this.selectCharacter(prevIdx);
  }

  render() {
    if (!this.container) return;

    const char = this.activeCharacter;
    if (!char) return;

    // 1. Update Preview Image and Atmospheric Glow
    const imgEl = this.container.querySelector('#char-preview-img');
    const auraEl = this.container.querySelector('#char-preview-aura');
    const figureWrapper = this.container.querySelector('#char-figure-wrapper');

    if (imgEl) {
      imgEl.src = char.image;
      imgEl.alt = char.name;
    }

    if (auraEl) {
      auraEl.style.background = `radial-gradient(circle, ${char.glowColor} 0%, rgba(0,0,0,0) 70%)`;
    }

    if (figureWrapper) {
      // Trigger a subtle pop-in animation on switch
      figureWrapper.classList.remove('animate-switch');
      void figureWrapper.offsetWidth;
      figureWrapper.classList.add('animate-switch');
    }

    // 2. Update Info Panel
    const numTag = this.container.querySelector('#char-number-tag');
    const roleTag = this.container.querySelector('#char-role-tag');
    const nameTitle = this.container.querySelector('#char-name-title');
    const tagline = this.container.querySelector('#char-tagline');
    const traitName = this.container.querySelector('#char-trait-name');
    const traitDesc = this.container.querySelector('#char-trait-desc');

    if (numTag) numTag.textContent = char.number;
    if (roleTag) {
      roleTag.textContent = char.role;
      roleTag.style.borderColor = char.accentColor;
      roleTag.style.color = char.accentColor;
    }
    if (nameTitle) nameTitle.textContent = char.name;
    if (tagline) tagline.textContent = char.tagline;
    if (traitName) traitName.textContent = char.trait.name;
    if (traitDesc) traitDesc.textContent = char.trait.desc;

    // 3. Update Stat Progress Bars
    const barSpeed = this.container.querySelector('#stat-bar-speed');
    const barJump = this.container.querySelector('#stat-bar-jump');
    const barDamage = this.container.querySelector('#stat-bar-damage');

    if (barSpeed) {
      barSpeed.style.width = `${char.stats.speed}%`;
      barSpeed.style.background = char.accentColor;
    }
    if (barJump) {
      barJump.style.width = `${char.stats.jump}%`;
      barJump.style.background = char.accentColor;
    }
    if (barDamage) {
      barDamage.style.width = `${char.stats.damage}%`;
      barDamage.style.background = char.accentColor;
    }

    // 4. Update Diamond Balance
    const diamonds = parseInt(localStorage.getItem('devilsdoor_diamonds') || '0', 10);
    const walletEl = this.container.querySelector('#char-wallet-diamonds');
    if (walletEl) walletEl.textContent = diamonds.toLocaleString();

    // 5. Update Action Button (Start Run vs Unlock)
    const btnStart = this.container.querySelector('#btn-start-run');
    if (btnStart) {
      if (char.status === 'unlocked' || char.cost === 0) {
        btnStart.className = 'btn-start-run btn-unlocked';
        btnStart.innerHTML = `
          <span class="btn-text">⚔️ START RUN</span>
          <span class="btn-subtext">ENTER THE ENDLESS DOMAIN</span>
        `;
        btnStart.style.boxShadow = `0 0 24px ${char.glowColor}`;
      } else {
        const canAfford = diamonds >= char.cost;
        btnStart.className = `btn-start-run btn-locked ${canAfford ? 'can-afford' : 'cannot-afford'}`;
        btnStart.innerHTML = `
          <span class="btn-text">🔒 UNLOCK FOR 💎 ${char.cost}</span>
          <span class="btn-subtext">${canAfford ? 'TAP TO UNLOCK & SELECT' : 'COLLECT MORE GEMS IN RUNS'}</span>
        `;
        btnStart.style.boxShadow = `0 0 16px rgba(245, 158, 11, 0.3)`;
      }
    }

    // 6. Update Bottom Thumbnail Carousel
    this._renderCarousel();
  }

  _renderCarousel() {
    const carousel = this.container.querySelector('#char-roster-carousel');
    if (!carousel) return;

    carousel.innerHTML = this.roster.map((c, idx) => {
      const isSelected = idx === this.selectedIndex;
      return `
        <div class="carousel-card ${isSelected ? 'active' : ''}" data-index="${idx}">
          <div class="card-img-box">
            <img src="${c.image}" alt="${c.name}" class="carousel-thumb" />
          </div>
          <div class="card-meta">
            <span class="card-num">${c.number}</span>
            <span class="card-name">${c.name}</span>
          </div>
          ${isSelected ? '<div class="card-active-glow"></div>' : ''}
        </div>
      `;
    }).join('');

    // Attach click events on thumbnail cards
    const cards = carousel.querySelectorAll('.carousel-card');
    cards.forEach((card) => {
      card.addEventListener('click', () => {
        const idx = parseInt(card.getAttribute('data-index'), 10);
        this.selectCharacter(idx);
      });
    });
  }

  _handleStartRun() {
    const char = this.activeCharacter;
    if (!char) return;

    if (char.status === 'unlocked' || char.cost === 0) {
      this.hide();
      if (typeof this.onStartRun === 'function') {
        this.onStartRun(char);
      }
    } else {
      // Handle Unlocking with Diamonds
      const diamonds = parseInt(localStorage.getItem('devilsdoor_diamonds') || '0', 10);
      if (diamonds >= char.cost) {
        localStorage.setItem('devilsdoor_diamonds', (diamonds - char.cost).toString());
        char.status = 'unlocked';
        this.render();
      }
    }
  }

  show() {
    if (this.container) {
      this.container.classList.remove('hidden');
      this.render();
    }
  }

  hide() {
    if (this.container) {
      this.container.classList.add('hidden');
    }
  }

  isVisible() {
    return this.container && !this.container.classList.contains('hidden');
  }
}
