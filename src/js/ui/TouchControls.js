/**
 * TouchControls — Handles mobile digital thumb-pads with Jump and Attack buttons.
 */
export class TouchControls {
  constructor(inputManager) {
    this.inputManager = inputManager;

    this.btnLeft = document.getElementById('touch-left');
    this.btnRight = document.getElementById('touch-right');
    this.btnJump = document.getElementById('touch-jump');
    this.btnAttack = document.getElementById('touch-attack');

    this.leftDown = false;
    this.rightDown = false;
    this.jumpDown = false;
    this.attackDown = false;

    this._bindTouchEvents();
  }

  _bindTouchEvents() {
    const setupBtn = (btn, onDown, onUp) => {
      if (!btn) return;
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

      // Mouse fallback
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
        this.inputManager.setTouchState(this.leftDown, this.rightDown, true, true, this.attackDown, false);
      },
      () => {
        this.jumpDown = false;
        this.inputManager.setTouchState(this.leftDown, this.rightDown, false, false, this.attackDown, false);
      }
    );

    setupBtn(
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
  }

  _sync() {
    this.inputManager.setTouchState(this.leftDown, this.rightDown, this.jumpDown, false, this.attackDown, false);
  }
}
