/**
 * TouchControls — Handles responsive mobile digital thumb-pads.
 */
export class TouchControls {
  constructor(inputManager) {
    this.inputManager = inputManager;

    this.btnLeft = document.getElementById('touch-left');
    this.btnRight = document.getElementById('touch-right');
    this.btnJump = document.getElementById('touch-jump');

    this.leftDown = false;
    this.rightDown = false;
    this.jumpDown = false;

    this._bindTouchEvents();
  }

  _bindTouchEvents() {
    if (!this.btnLeft || !this.btnRight || !this.btnJump) return;

    const setupBtn = (btn, onDown, onUp) => {
      btn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        onDown();
        btn.classList.add('active');
      }, { passive: false });

      btn.addEventListener('touchend', (e) => {
        e.preventDefault();
        onUp();
        btn.classList.remove('active');
      }, { passive: false });

      btn.addEventListener('touchcancel', (e) => {
        e.preventDefault();
        onUp();
        btn.classList.remove('active');
      }, { passive: false });

      // Mouse fallback for testing
      btn.addEventListener('mousedown', (e) => {
        onDown();
        btn.classList.add('active');
      });
      window.addEventListener('mouseup', () => {
        onUp();
        btn.classList.remove('active');
      });
    };

    setupBtn(
      this.btnLeft,
      () => { this.leftDown = true; this._sync(); },
      () => { this.leftDown = false; this._sync(); }
    );

    setupBtn(
      this.btnRight,
      () => { this.rightDown = true; this._sync(); },
      () => { this.rightDown = false; this._sync(); }
    );

    setupBtn(
      this.btnJump,
      () => {
        this.jumpDown = true;
        this.inputManager.setTouchState(this.leftDown, this.rightDown, true, true);
      },
      () => {
        this.jumpDown = false;
        this.inputManager.setTouchState(this.leftDown, this.rightDown, false, false);
      }
    );
  }

  _sync() {
    this.inputManager.setTouchState(this.leftDown, this.rightDown, this.jumpDown);
  }
}
