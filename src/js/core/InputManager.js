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
    this.touchShuriken = false;
    this.touchRestartJustPressed = false;

    this.onRestartCallback = null;
    this.onPauseCallback = null;

    this._initKeyboard();
    this._initGamepad();
    this._initMouse();
  }

  _initKeyboard() {
    if (typeof window === 'undefined') return;

    window.addEventListener('keydown', (e) => {
      const code = e.code;
      if (!this.keys.get(code)) {
        this.justPressedKeys.add(code);
      }
      this.keys.set(code, true);

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
      this.touchShuriken = false;
    });
  }

  _initMouse() {
    if (typeof window === 'undefined') return;

    window.addEventListener('mousedown', (e) => {
      if (e.button === 0 && e.target && e.target.tagName === 'CANVAS') {
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
    if (typeof window === 'undefined') return;

    window.addEventListener('gamepadconnected', (e) => {
      console.log(`[InputManager] Gamepad connected: ${e.gamepad.id}`);
    });
  }

  pollGamepad() {
    if (typeof navigator === 'undefined' || !navigator.getGamepads) {
      return { left: false, right: false, jump: false, attack: false, shuriken: false };
    }
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    const gp = gamepads[0];
    if (!gp) return { left: false, right: false, jump: false, attack: false, shuriken: false };

    const left = gp.axes[0] < -0.3 || (gp.buttons[14] && gp.buttons[14].pressed);
    const right = gp.axes[0] > 0.3 || (gp.buttons[15] && gp.buttons[15].pressed);
    const jump = gp.buttons[0] && gp.buttons[0].pressed;
    const attack = (gp.buttons[2] && gp.buttons[2].pressed) || (gp.buttons[1] && gp.buttons[1].pressed);
    const shuriken = gp.buttons[3] && gp.buttons[3].pressed;

    return { left, right, jump, attack, shuriken };
  }

  isLeft() {
    const gp = this.pollGamepad();
    return Boolean(this.keys.get('KeyA') || this.keys.get('ArrowLeft') || this.touchLeft || gp.left);
  }
  isLeftPressed() { return this.isLeft(); }

  isRight() {
    const gp = this.pollGamepad();
    return Boolean(this.keys.get('KeyD') || this.keys.get('ArrowRight') || this.touchRight || gp.right);
  }
  isRightPressed() { return this.isRight(); }

  isJump() {
    const gp = this.pollGamepad();
    return Boolean(this.keys.get('Space') || this.keys.get('KeyW') || this.keys.get('ArrowUp') || this.touchJump || gp.jump);
  }
  isJumpPressed() {
    return this.isJumpJustPressed() || this.isJump();
  }
  isJumping() {
    return this.isJumpPressed();
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
    return Boolean(this.keys.get('KeyJ') || this.keys.get('KeyZ') || this.keys.get('KeyF') || this.keys.get('MouseLeft') || this.touchAttack || gp.attack);
  }
  isAttackPressed() { return this.isAttackJustPressed() || this.isAttack(); }
  isDashPressed() { return this.isAttackPressed(); }
  isAttacking() { return this.isAttackPressed(); }

  isAttackJustPressed() {
    const pressed = this.justPressedKeys.has('KeyJ') ||
                    this.justPressedKeys.has('KeyZ') ||
                    this.justPressedKeys.has('KeyF') ||
                    this.justPressedKeys.has('MouseLeft') ||
                    this.touchAttackJustPressed;
    return Boolean(pressed);
  }

  isShuriken() {
    const gp = this.pollGamepad();
    return Boolean(this.keys.get('KeyK') || this.keys.get('KeyX') || this.keys.get('KeyE') || this.touchShuriken || gp.shuriken);
  }
  isShurikenPressed() {
    return Boolean(this.justPressedKeys.has('KeyK') || this.justPressedKeys.has('KeyX') || this.justPressedKeys.has('KeyE') || this.touchShuriken || this.isShuriken());
  }

  isRestartJustPressed() {
    const pressed = this.justPressedKeys.has('KeyR') || this.touchRestartJustPressed;
    return Boolean(pressed);
  }

  setTouchState(left, right, jump, jumpJustPressed = false, attack = false, attackJustPressed = false, shuriken = false) {
    this.touchLeft = left;
    this.touchRight = right;
    this.touchJump = jump;
    this.touchAttack = attack;
    this.touchShuriken = shuriken;
    if (jumpJustPressed) this.touchJumpJustPressed = true;
    if (attackJustPressed) this.touchAttackJustPressed = true;
  }

  triggerTouchRestart() {
    this.touchRestartJustPressed = true;
    if (this.onRestartCallback) this.onRestartCallback();
  }

  update() {
    this.justPressedKeys.clear();
    this.touchJumpJustPressed = false;
    this.touchAttackJustPressed = false;
    this.touchRestartJustPressed = false;
  }
}
