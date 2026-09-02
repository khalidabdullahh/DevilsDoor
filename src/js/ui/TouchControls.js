/**
 * TouchControls — High-Precision Multi-Touch Controller for Ninja Arashi 2 Layout.
 * Supports simultaneous multi-touch (e.g. running left/right while jumping & slashing).
 */
export class TouchControls {
  constructor(inputManager) {
    this.inputManager = inputManager;

    this.btnLeft = document.getElementById('touch-left');
    this.btnRight = document.getElementById('touch-right');
    this.btnJump = document.getElementById('touch-jump');
    this.btnAttack = document.getElementById('touch-attack');
    this.btnShuriken = document.getElementById('touch-shuriken');

    this.activeTouches = new Map();
    this.leftDown = false;
    this.rightDown = false;
    this.jumpDown = false;
    this.attackDown = false;

    this._bindTouchEvents();
  }

  _bindTouchEvents() {
    const attachButton = (btn, onDown, onUp) => {
      if (!btn) return;

      btn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        for (let i = 0; i < e.changedTouches.length; i++) {
          const touch = e.changedTouches[i];
          this.activeTouches.set(touch.identifier, btn);
        }
        btn.classList.add('active');
        onDown();
      }, { passive: false });

      btn.addEventListener('touchend', (e) => {
        e.preventDefault();
        for (let i = 0; i < e.changedTouches.length; i++) {
          const touch = e.changedTouches[i];
          this.activeTouches.delete(touch.identifier);
        }
        btn.classList.remove('active');
        onUp();
      }, { passive: false });

      btn.addEventListener('touchcancel', (e) => {
        e.preventDefault();
        for (let i = 0; i < e.changedTouches.length; i++) {
          const touch = e.changedTouches[i];
          this.activeTouches.delete(touch.identifier);
        }
        btn.classList.remove('active');
        onUp();
      }, { passive: false });

      // Mouse fallback for testing
      btn.addEventListener('mousedown', (e) => {
        e.preventDefault();
        btn.classList.add('active');
        onDown();
      });

      window.addEventListener('mouseup', () => {
        btn.classList.remove('active');
        onUp();
      });
    };

    attachButton(
      this.btnLeft,
      () => { this.leftDown = true; this._sync(); },
      () => { this.leftDown = false; this._sync(); }
    );

    attachButton(
      this.btnRight,
      () => { this.rightDown = true; this._sync(); },
      () => { this.rightDown = false; this._sync(); }
    );

    attachButton(
      this.btnJump,
      () => {
        this.jumpDown = true;
        this.inputManager.setTouchState(this.leftDown, this.rightDown, true, true, this.attackDown, false);
      },
      () => {
        this.jumpDown = false;
        this.inputManager.setTouchState(this.leftDown, this.rightDown, false, false, this.attackDown, false);
      }
    );

    attachButton(
      this.btnAttack,
      () => {
        this.attackDown = true;
        this.inputManager.setTouchState(this.leftDown, this.rightDown, this.jumpDown, false, true, true);
      },
      () => {
        this.attackDown = false;
        this.inputManager.setTouchState(this.leftDown, this.rightDown, this.jumpDown, false, false, false);
      }
    );

    if (this.btnShuriken) {
      attachButton(
        this.btnShuriken,
        () => { this.inputManager.keys.set('KeyK', true); },
        () => { this.inputManager.keys.set('KeyK', false); }
      );
    }
  }

  _sync() {
    this.inputManager.setTouchState(this.leftDown, this.rightDown, this.jumpDown, false, this.attackDown, false);
  }
}
