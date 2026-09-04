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
    // Action buttons (Jump, Attack, Shuriken)
    const attachActionButton = (btn, btnName) => {
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

      btn.addEventListener('mousedown', handlePress);
      btn.addEventListener('mouseup', handleRelease);
      btn.addEventListener('mouseleave', handleRelease);
    };

    attachActionButton(this.btnJump, 'jump');
    attachActionButton(this.btnAttack, 'attack');
    attachActionButton(this.btnShuriken, 'shuriken');

    // D-Pad smooth slide handling (allows player to slide thumb between Left and Right without lifting)
    const dpadContainer = this.btnLeft ? this.btnLeft.parentElement : null;

    const processDpadTouches = (e) => {
      if (e.cancelable) e.preventDefault();
      if (!this.btnLeft || !this.btnRight) return;

      const leftRect = this.btnLeft.getBoundingClientRect();
      const rightRect = this.btnRight.getBoundingClientRect();

      let leftActive = false;
      let rightActive = false;

      for (let i = 0; i < e.touches.length; i++) {
        const t = e.touches[i];
        // Check touch within Left button area (with generous touch margin)
        if (t.clientX >= leftRect.left - 15 && t.clientX <= leftRect.right + 10 &&
            t.clientY >= leftRect.top - 25 && t.clientY <= leftRect.bottom + 25) {
          leftActive = true;
        }
        // Check touch within Right button area (with generous touch margin)
        if (t.clientX >= rightRect.left - 10 && t.clientX <= rightRect.right + 15 &&
            t.clientY >= rightRect.top - 25 && t.clientY <= rightRect.bottom + 25) {
          rightActive = true;
        }
      }

      if (leftActive) {
        this.btnLeft.classList.add('active');
        this.inputManager.setTouchButton('left', true, false);
      } else {
        this.btnLeft.classList.remove('active');
        this.inputManager.setTouchButton('left', false, false);
      }

      if (rightActive) {
        this.btnRight.classList.add('active');
        this.inputManager.setTouchButton('right', true, false);
      } else {
        this.btnRight.classList.remove('active');
        this.inputManager.setTouchButton('right', false, false);
      }
    };

    const releaseDpadTouches = (e) => {
      if (e.cancelable) e.preventDefault();
      processDpadTouches(e);
    };

    if (dpadContainer) {
      dpadContainer.addEventListener('touchstart', processDpadTouches, { passive: false });
      dpadContainer.addEventListener('touchmove', processDpadTouches, { passive: false });
      dpadContainer.addEventListener('touchend', releaseDpadTouches, { passive: false });
      dpadContainer.addEventListener('touchcancel', releaseDpadTouches, { passive: false });
    }

    // Direct fallback for Left & Right buttons
    const attachDpadButtonFallback = (btn, dir) => {
      if (!btn) return;
      btn.addEventListener('mousedown', (e) => {
        btn.classList.add('active');
        this.inputManager.setTouchButton(dir, true, false);
      });
      btn.addEventListener('mouseup', (e) => {
        btn.classList.remove('active');
        this.inputManager.setTouchButton(dir, false, false);
      });
      btn.addEventListener('mouseleave', (e) => {
        btn.classList.remove('active');
        this.inputManager.setTouchButton(dir, false, false);
      });
    };

    attachDpadButtonFallback(this.btnLeft, 'left');
    attachDpadButtonFallback(this.btnRight, 'right');
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
