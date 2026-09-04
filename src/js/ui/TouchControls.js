/**
 * TouchControls — High-Precision Multi-Touch Controller for Devil's Door.
 * Accurately dispatches press, hold, and release states to InputManager.
 */
export class TouchControls {
  constructor(inputManager) {
    this.inputManager = inputManager;

    this.btnLeft = document.getElementById('touch-left');
    this.btnRight = document.getElementById('touch-right');
    this.btnJump = document.getElementById('touch-jump');
    this.btnAttack = document.getElementById('touch-attack');
    this.btnShuriken = document.getElementById('touch-shuriken');

    this.touchContainer = document.getElementById('touch-controls');

    this._bindTouchEvents();
  }

  _bindTouchEvents() {
    const attachButton = (btn, btnName) => {
      if (!btn) return;

      const handlePress = (e) => {
        if (e.cancelable) e.preventDefault();
        btn.classList.add('active');
        this.inputManager.setTouchButton(btnName, true, true);
      };

      const handleRelease = (e) => {
        if (e.cancelable) e.preventDefault();
        btn.classList.remove('active');
        this.inputManager.setTouchButton(btnName, false, false);
      };

      btn.addEventListener('touchstart', handlePress, { passive: false });
      btn.addEventListener('touchend', handleRelease, { passive: false });
      btn.addEventListener('touchcancel', handleRelease, { passive: false });

      // Mouse testing fallback
      btn.addEventListener('mousedown', handlePress);
      btn.addEventListener('mouseup', handleRelease);
      btn.addEventListener('mouseleave', handleRelease);
    };

    attachButton(this.btnLeft, 'left');
    attachButton(this.btnRight, 'right');
    attachButton(this.btnJump, 'jump');
    attachButton(this.btnAttack, 'attack');
    attachButton(this.btnShuriken, 'shuriken');
  }

  setLayout(isInverted = false) {
    if (!this.touchContainer) return;
    if (isInverted) {
      this.touchContainer.classList.add('inverted-layout');
    } else {
      this.touchContainer.classList.remove('inverted-layout');
    }
  }

  setScale(scaleMode = 'normal') {
    if (!this.touchContainer) return;
    this.touchContainer.classList.remove('scale-compact', 'scale-normal', 'scale-large');
    this.touchContainer.classList.add(`scale-${scaleMode}`);
  }
}
