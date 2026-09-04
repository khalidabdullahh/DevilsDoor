import { SCENE_ROSTER } from '../data/SceneRoster.js';

/**
 * SceneSelect — Spacious, Responsive Stage & Realm Selection Screen.
 * Lets the player choose which dark-fantasy Realm/Scene to conquer.
 */
export class SceneSelect {
  constructor(containerEl, onStartRunCallback) {
    this.container = containerEl;
    this.onStartRun = onStartRunCallback;

    this.roster = SCENE_ROSTER;
    this.selectedIndex = 0;
    this.activeScene = this.roster[0];

    this.touchStartX = 0;
    this.touchStartY = 0;

    this._initDOM();
    this._attachEventListeners();
    this.render();
  }

  _initDOM() {
    if (!this.container) return;
    this.container.innerHTML = `
      <div class="scene-select-backdrop"></div>
      
      <!-- Top Bar: Header Branding -->
      <header class="scene-select-header">
        <div class="scene-select-brand">
          <span class="brand-torii">⛩️</span>
          <span class="brand-title">SELECT YOUR REALM</span>
        </div>
        <div class="scene-hero-pill">
          <span class="pill-dot">●</span>
          <span class="pill-name">SHADOW RONIN</span>
        </div>
      </header>

      <!-- Main Stage Split Layout (Desktop & Landscape Mobile) -->
      <main class="scene-select-stage">
        <!-- Left / Center: Large Scenic Artwork Showcase -->
        <div class="scene-preview-panel">
          <div class="scene-preview-aura" id="scene-preview-aura"></div>
          <div class="scene-preview-frame" id="scene-frame-wrapper">
            <img id="scene-preview-img" class="scene-preview-img" src="" alt="Selected Realm" />
          </div>
          <!-- Navigation Arrow Controls -->
          <button id="btn-prev-scene" class="scene-nav-arrow arrow-left" aria-label="Previous Realm">‹</button>
          <button id="btn-next-scene" class="scene-nav-arrow arrow-right" aria-label="Next Realm">›</button>
        </div>

        <!-- Right: Realm Info, Atmosphere & Start Button -->
        <div class="scene-info-panel">
          <div class="scene-info-header">
            <span id="scene-number-tag" class="scene-number-tag">REALM I</span>
          </div>
          
          <h2 id="scene-name-title" class="scene-name-title">SUNSET FORTRESS</h2>
          <p id="scene-subtitle" class="scene-subtitle">Pagodas, Torii Gates & Crimson Twilight</p>

          <!-- Atmosphere & Hazards Card -->
          <div class="scene-hazard-box">
            <div class="hazard-header">
              <span class="hazard-icon">⚠️</span>
              <span class="hazard-label">HAZARDS & TERRAIN</span>
            </div>
            <div id="scene-hazard-desc" class="hazard-desc">Spike pits, hanging lanterns, archer sentries</div>
          </div>

          <!-- Primary CTA Button -->
          <div class="scene-action-group">
            <button id="btn-start-run" class="btn-start-run">
              <span class="btn-text">⚔️ ENTER REALM</span>
              <span class="btn-subtext">START ENDLESS ASCENSION</span>
            </button>
          </div>
        </div>
      </main>

      <!-- Bottom Horizontal Realm Carousel -->
      <footer class="scene-roster-footer">
        <div class="scene-roster-carousel" id="scene-roster-carousel">
          <!-- Populated dynamically -->
        </div>
      </footer>
    `;
  }

  _attachEventListeners() {
    if (!this.container) return;

    // Previous / Next Buttons
    const btnPrev = this.container.querySelector('#btn-prev-scene');
    const btnNext = this.container.querySelector('#btn-next-scene');
    if (btnPrev) btnPrev.addEventListener('click', () => this.prevScene());
    if (btnNext) btnNext.addEventListener('click', () => this.nextScene());

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
        if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY) * 1.4) {
          if (deltaX < 0) {
            this.nextScene();
          } else {
            this.prevScene();
          }
        }
      }
    }, { passive: true });

    // Keyboard Navigation
    window.addEventListener('keydown', (e) => {
      if (!this.isVisible()) return;

      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        this.prevScene();
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        this.nextScene();
      } else if (e.key === 'Enter' || e.key === ' ') {
        this._handleStartRun();
      }
    });
  }

  selectScene(index) {
    if (index < 0 || index >= this.roster.length) return;
    this.selectedIndex = index;
    this.activeScene = this.roster[this.selectedIndex];
    this.render();
  }

  nextScene() {
    const nextIdx = (this.selectedIndex + 1) % this.roster.length;
    this.selectScene(nextIdx);
  }

  prevScene() {
    const prevIdx = (this.selectedIndex - 1 + this.roster.length) % this.roster.length;
    this.selectScene(prevIdx);
  }

  render() {
    if (!this.container) return;

    const scene = this.activeScene;
    if (!scene) return;

    // 1. Update Preview Image and Atmospheric Glow
    const imgEl = this.container.querySelector('#scene-preview-img');
    const auraEl = this.container.querySelector('#scene-preview-aura');
    const frameWrapper = this.container.querySelector('#scene-frame-wrapper');

    if (imgEl) {
      imgEl.src = scene.image;
      imgEl.alt = scene.name;
    }

    if (auraEl) {
      auraEl.style.background = `radial-gradient(circle, ${scene.glowColor} 0%, rgba(0,0,0,0) 70%)`;
    }

    if (frameWrapper) {
      frameWrapper.classList.remove('animate-switch');
      void frameWrapper.offsetWidth;
      frameWrapper.classList.add('animate-switch');
    }

    // 2. Update Info Panel
    const numTag = this.container.querySelector('#scene-number-tag');
    const nameTitle = this.container.querySelector('#scene-name-title');
    const subtitle = this.container.querySelector('#scene-subtitle');
    const hazardDesc = this.container.querySelector('#scene-hazard-desc');

    if (numTag) numTag.textContent = scene.number;
    if (nameTitle) nameTitle.textContent = scene.name;
    if (subtitle) subtitle.textContent = scene.subtitle;
    if (hazardDesc) hazardDesc.textContent = scene.hazards;

    // 3. Update Button Glow
    const btnStart = this.container.querySelector('#btn-start-run');
    if (btnStart) {
      btnStart.style.boxShadow = `0 0 20px ${scene.glowColor}`;
    }

    // 4. Update Bottom Carousel
    this._renderCarousel();
  }

  _renderCarousel() {
    const carousel = this.container.querySelector('#scene-roster-carousel');
    if (!carousel) return;

    carousel.innerHTML = this.roster.map((s, idx) => {
      const isSelected = idx === this.selectedIndex;
      return `
        <div class="scene-card ${isSelected ? 'active' : ''}" data-index="${idx}">
          <div class="scene-card-img-box">
            <img src="${s.image}" alt="${s.name}" class="scene-card-thumb" />
          </div>
          <div class="scene-card-meta">
            <span class="scene-card-name">${s.name}</span>
          </div>
          ${isSelected ? '<div class="card-active-glow"></div>' : ''}
        </div>
      `;
    }).join('');

    const cards = carousel.querySelectorAll('.scene-card');
    cards.forEach((card) => {
      card.addEventListener('click', () => {
        const idx = parseInt(card.getAttribute('data-index'), 10);
        this.selectScene(idx);
      });
    });
  }

  _handleStartRun() {
    const scene = this.activeScene;
    if (!scene) return;

    this.hide();
    if (typeof this.onStartRun === 'function') {
      this.onStartRun(scene);
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
