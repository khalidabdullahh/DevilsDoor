/**
 * InputManager — Handles Keyboard, Mouse, Gamepad, and Touch D-Pad input cleanly.
 */
export class InputManager {
  constructor() {
    this.keys = new Map();
    this.justPressedKeys = new Set();
    this.touchLeft = false;
    this.touchRight = false;
    this.touchJump = false;
    this.touchJumpJustPressed = false;
    this.touchAttack = false;
    this.touchAttackJustPressed = false;
    this.touchRestartJustPressed = false;

    this.onRestartCallback = null;
    this.onPauseCallback = null;

    this._initKeyboard();
    this._initGamepad();
    this._initMouse();
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
      this.touchAttack = false;
    });
  }

  _initMouse() {
    window.addEventListener('mousedown', (e) => {
      if (e.button === 0 && e.target.tagName === 'CANVAS') {
        this.justPressedKeys.add('MouseLeft');
        this.keys.set('MouseLeft', true);
      }
    });
    window.addEventListener('mouseup', (e) => {
      if (e.button === 0) {
        this.keys.set('MouseLeft', false);
        this.justPressedKeys.delete('MouseLeft');
      }
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
    if (!gp) return { left: false, right: false, jump: false, attack: false };

    const left = gp.axes[0] < -0.3 || (gp.buttons[14] && gp.buttons[14].pressed);
    const right = gp.axes[0] > 0.3 || (gp.buttons[15] && gp.buttons[15].pressed);
    const jump = gp.buttons[0] && gp.buttons[0].pressed;
    const attack = (gp.buttons[2] && gp.buttons[2].pressed) || (gp.buttons[1] && gp.buttons[1].pressed);

    return { left, right, jump, attack };
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

  isAttack() {
    const gp = this.pollGamepad();
    return this.keys.get('KeyJ') || this.keys.get('KeyZ') || this.keys.get('KeyF') || this.keys.get('MouseLeft') || this.touchAttack || gp.attack;
  }

  isAttackJustPressed() {
    const pressed = this.justPressedKeys.has('KeyJ') ||
                    this.justPressedKeys.has('KeyZ') ||
                    this.justPressedKeys.has('KeyF') ||
                    this.justPressedKeys.has('MouseLeft') ||
                    this.touchAttackJustPressed;
    return Boolean(pressed);
  }

  isRestartJustPressed() {
    const pressed = this.justPressedKeys.has('KeyR') || this.touchRestartJustPressed;
    return Boolean(pressed);
  }

  setTouchState(left, right, jump, jumpJustPressed = false, attack = false, attackJustPressed = false) {
    this.touchLeft = left;
    this.touchRight = right;
    this.touchJump = jump;
    this.touchAttack = attack;
    if (jumpJustPressed) this.touchJumpJustPressed = true;
    if (attackJustPressed) this.touchAttackJustPressed = true;
  }

  triggerTouchRestart() {
    this.touchRestartJustPressed = true;
    if (this.onRestartCallback) this.onRestartCallback();
  }

  update() {
    // Clear single-frame triggers
    this.justPressedKeys.clear();
    this.touchJumpJustPressed = false;
    this.touchAttackJustPressed = false;
    this.touchRestartJustPressed = false;
  }
}
