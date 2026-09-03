/**
 * OrientationManager — Landscape-Only Mobile Enforcement System.
 * Ensures Devil's Door runs strictly in landscape orientation on mobile/tablet devices.
 * Shows a dark-fantasy "ROTATE DEVICE" overlay when portrait mode is detected.
 */
export class OrientationManager {
  constructor(overlayEl, gameInstance = null) {
    this.overlay = overlayEl;
    this.game = gameInstance;
    this.isPortrait = false;

    this._initDOM();
    this._attachListeners();
    this.checkOrientation();
  }

  _initDOM() {
    if (!this.overlay) return;
    this.overlay.innerHTML = `
      <div class="rotate-card">
        <div class="rotate-emblem">
          <span class="torii-icon">⛩️</span>
          <div class="phone-rotate-anim">📱</div>
        </div>
        <h2 class="rotate-title">LANDSCAPE REQUIRED</h2>
        <p class="rotate-subtitle">Please rotate your device to enter the endless shadows of Devil's Door.</p>
        <div class="rotate-status">↻ ROTATE DEVICE</div>
      </div>
    `;
  }

  _attachListeners() {
    const handleCheck = () => this.checkOrientation();
    window.addEventListener('resize', handleCheck);
    window.addEventListener('orientationchange', handleCheck);
    if (screen.orientation) {
      screen.orientation.addEventListener('change', handleCheck);
    }
  }

  checkOrientation() {
    const w = window.innerWidth;
    const h = window.innerHeight;

    // A device is considered portrait on mobile/tablets if height exceeds width
    const isMobileOrTablet = w < 1024 || 'ontouchstart' in window;
    this.isPortrait = isMobileOrTablet && (h > w);

    if (this.overlay) {
      if (this.isPortrait) {
        this.overlay.classList.remove('hidden');
        if (this.game && !this.game.isPaused) {
          this.game.isOrientationBlocked = true;
        }
      } else {
        this.overlay.classList.add('hidden');
        if (this.game && this.game.isOrientationBlocked) {
          this.game.isOrientationBlocked = false;
        }
      }
    }
  }
}
