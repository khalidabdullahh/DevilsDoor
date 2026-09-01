/**
 * InputManager — Handles Keyboard, Gamepad, and Touch D-Pad input cleanly.
 */
export class InputManager {
  constructor() {
    this.keys = new Map();
    this.justPressedKeys = new Set();
    this.touchLeft = false;
    this.touchRight = false;
    this.touchJump = false;
    this.touchJumpJustPressed = false;
    this.touchRestartJustPressed = false;

    this.onRestartCallback = null;
    this.onPauseCallback = null;

    this._initKeyboard();
    this._initGamepad();
  }

  _initKeyboard() {
    window.addEventListener('keydown', (e) => {
      const code = e.code;
      if (!this.keys.get(code)) {
        this.justPressedKeys.add(code);
      }
      this.keys.set(code, true);

      // Prevent scrolling for gameplay keys
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(code)) {
        e.preventDefault();
      }

      if (code === 'KeyR' && this.onRestartCallback) {
        this.onRestartCallback();
      }
      if ((code === 'Escape' || code === 'KeyP') && this.onPauseCallback) {
        this.onPauseCallback();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys.set(e.code, false);
      this.justPressedKeys.delete(e.code);
    });

    window.addEventListener('blur', () => {
      this.keys.clear();
      this.justPressedKeys.clear();
      this.touchLeft = false;
      this.touchRight = false;
      this.touchJump = false;
    });
  }

  _initGamepad() {
    window.addEventListener('gamepadconnected', (e) => {
      console.log(`[InputManager] Gamepad connected: ${e.gamepad.id}`);
    });
  }

  pollGamepad() {
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    const gp = gamepads[0];
    if (!gp) return { left: false, right: false, jump: false, jumpJust: false };

    const left = gp.axes[0] < -0.3 || (gp.buttons[14] && gp.buttons[14].pressed);
    const right = gp.axes[0] > 0.3 || (gp.buttons[15] && gp.buttons[15].pressed);
    const jump = gp.buttons[0] && gp.buttons[0].pressed;

    return { left, right, jump };
  }

  isLeft() {
    const gp = this.pollGamepad();
    return this.keys.get('KeyA') || this.keys.get('ArrowLeft') || this.touchLeft || gp.left;
  }

  isRight() {
    const gp = this.pollGamepad();
    return this.keys.get('KeyD') || this.keys.get('ArrowRight') || this.touchRight || gp.right;
  }

  isJump() {
    const gp = this.pollGamepad();
    return this.keys.get('Space') || this.keys.get('KeyW') || this.keys.get('ArrowUp') || this.touchJump || gp.jump;
  }

  isJumpJustPressed() {
    const pressed = this.justPressedKeys.has('Space') ||
                    this.justPressedKeys.has('KeyW') ||
                    this.justPressedKeys.has('ArrowUp') ||
                    this.touchJumpJustPressed;
    return Boolean(pressed);
  }

  isRestartJustPressed() {
    const pressed = this.justPressedKeys.has('KeyR') || this.touchRestartJustPressed;
    return Boolean(pressed);
  }

  setTouchState(left, right, jump, jumpJustPressed = false) {
    this.touchLeft = left;
    this.touchRight = right;
    this.touchJump = jump;
    if (jumpJustPressed) {
      this.touchJumpJustPressed = true;
    }
  }

  triggerTouchRestart() {
    this.touchRestartJustPressed = true;
    if (this.onRestartCallback) this.onRestartCallback();
  }

  update() {
    // Clear just-pressed frame buffers
    this.justPressedKeys.clear();
    this.touchJumpJustPressed = false;
    this.touchRestartJustPressed = false;
  }
}
