/**
 * OrientationManager — Dual-Mode Landscape & Handheld Portrait Console Controller.
 * Supports:
 * 1. Landscape Mode: Fullscreen immersive arcade canvas with corner touch buttons.
 * 2. Portrait Mode: Top 16:9 widescreen game screen with lower ergonomic gamepad deck.
 */
export class OrientationManager {
  constructor(overlayEl, gameInstance = null) {
    this.overlay = overlayEl;
    this.game = gameInstance;
    this.gameContainer = document.getElementById('game-container');
    this.isPortrait = false;

    this._attachListeners();
    this.checkOrientation();
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

    // Mobile / tablet portrait detection
    const isMobileOrTablet = w < 1024 || (typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0);
    this.isPortrait = isMobileOrTablet && (h > w);

    if (this.gameContainer) {
      if (this.isPortrait) {
        this.gameContainer.classList.add('portrait-mode');
        document.body.classList.add('portrait-mode');
      } else {
        this.gameContainer.classList.remove('portrait-mode');
        document.body.classList.remove('portrait-mode');
      }
    }

    if (this.overlay) {
      this.overlay.classList.add('hidden');
    }

    if (this.game) {
      this.game.isOrientationBlocked = false;
      if (this.game.renderer) {
        this.game.renderer.resize();
        if (typeof requestAnimationFrame !== 'undefined') {
          requestAnimationFrame(() => {
            if (this.game && this.game.renderer) {
              this.game.renderer.resize();
            }
          });
        }
      }
    }
  }
}
