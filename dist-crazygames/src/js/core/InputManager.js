/**
 * InputManager — High-Precision Input Subsystem.
 * Handles Keyboard, Mouse, Gamepad, and Multi-Touch input with reliable
 * single-frame "justPressed" triggers to prevent continuous jump looping.
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
    this.touchShurikenJustPressed = false;
    this.touchDash = false;
    this.touchDashJustPressed = false;
    this.touchRestartJustPressed = false;
    this._gpPrev = {};

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
      this.touchJumpJustPressed = false;
      this.touchAttack = false;
      this.touchAttackJustPressed = false;
      this.touchShuriken = false;
      this.touchShurikenJustPressed = false;
      this.touchDash = false;
      this.touchDashJustPressed = false;
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
      return { left: false, right: false, jump: false, attack: false, dash: false, shuriken: false };
    }
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    const gp = gamepads[0];
    if (!gp) return { left: false, right: false, jump: false, attack: false, dash: false, shuriken: false };

    const left = gp.axes[0] < -0.3 || (gp.buttons[14] && gp.buttons[14].pressed);
    const right = gp.axes[0] > 0.3 || (gp.buttons[15] && gp.buttons[15].pressed);
    const jump = gp.buttons[0] && gp.buttons[0].pressed;
    // X = sword slash, B / RB = dash (dash used to share the attack button)
    const attack = Boolean(gp.buttons[2] && gp.buttons[2].pressed);
    const dash = Boolean((gp.buttons[1] && gp.buttons[1].pressed) || (gp.buttons[5] && gp.buttons[5].pressed));
    const shuriken = gp.buttons[3] && gp.buttons[3].pressed;

    return { left, right, jump, attack, dash, shuriken };
  }

  // Gamepads have no keydown event, so detect a fresh press by comparing with last frame
  _gpJust(name) {
    const gp = this.pollGamepad();
    return Boolean(gp[name] && !this._gpPrev[name]);
  }

  isLeft() {
    const gp = this.pollGamepad();
    return Boolean(this.keys.get('KeyA') || this.keys.get('ArrowLeft') || this.touchLeft || gp.left);
  }

  isRight() {
    const gp = this.pollGamepad();
    return Boolean(this.keys.get('KeyD') || this.keys.get('ArrowRight') || this.touchRight || gp.right);
  }

  // Jump is strictly single-press to prevent continuous auto-jumping
  isJumpJustPressed() {
    const pressed = this.justPressedKeys.has('Space') ||
                    this.justPressedKeys.has('KeyW') ||
                    this.justPressedKeys.has('ArrowUp') ||
                    this.touchJumpJustPressed ||
                    this._gpJust('jump');
    return Boolean(pressed);
  }

  isJump() {
    const gp = this.pollGamepad();
    return Boolean(this.keys.get('Space') || this.keys.get('KeyW') || this.keys.get('ArrowUp') || this.touchJump || gp.jump);
  }

  isAttackJustPressed() {
    const pressed = this.justPressedKeys.has('KeyJ') ||
                    this.justPressedKeys.has('KeyZ') ||
                    this.justPressedKeys.has('KeyF') ||
                    this.justPressedKeys.has('MouseLeft') ||
                    this.touchAttackJustPressed ||
                    this._gpJust('attack');
    return Boolean(pressed);
  }

  isAttack() {
    const gp = this.pollGamepad();
    return Boolean(this.keys.get('KeyJ') || this.keys.get('KeyZ') || this.keys.get('KeyF') || this.keys.get('MouseLeft') || this.touchAttack || gp.attack);
  }

  isShurikenJustPressed() {
    const pressed = this.justPressedKeys.has('KeyK') ||
                    this.justPressedKeys.has('KeyX') ||
                    this.justPressedKeys.has('KeyE') ||
                    this.touchShurikenJustPressed ||
                    this._gpJust('shuriken');
    return Boolean(pressed);
  }

  // Dash is its own action now: L / Left Shift / C / touch DASH button
  isDashJustPressed() {
    const pressed = this.justPressedKeys.has('KeyL') ||
                    this.justPressedKeys.has('ShiftLeft') ||
                    this.justPressedKeys.has('ShiftRight') ||
                    this.justPressedKeys.has('KeyC') ||
                    this.touchDashJustPressed ||
                    this._gpJust('dash');
    return Boolean(pressed);
  }

  isShuriken() {
    return this.isShurikenJustPressed();
  }

  // Set Touch States from TouchControls.js
  setTouchButton(btnName, isDown, isJustPressed = false) {
    if (btnName === 'left') this.touchLeft = isDown;
    if (btnName === 'right') this.touchRight = isDown;
    if (btnName === 'jump') {
      this.touchJump = isDown;
      if (isJustPressed) this.touchJumpJustPressed = true;
    }
    if (btnName === 'attack') {
      this.touchAttack = isDown;
      if (isJustPressed) this.touchAttackJustPressed = true;
    }
    if (btnName === 'dash') {
      this.touchDash = isDown;
      if (isJustPressed) this.touchDashJustPressed = true;
    }
    if (btnName === 'shuriken') {
      this.touchShuriken = isDown;
      if (isJustPressed) this.touchShurikenJustPressed = true;
    }
  }

  triggerTouchRestart() {
    this.touchRestartJustPressed = true;
    if (this.onRestartCallback) this.onRestartCallback();
  }

  // Called at the end of each game frame to clear single-frame pulses
  update() {
    this.justPressedKeys.clear();
    this.touchJumpJustPressed = false;
    this.touchAttackJustPressed = false;
    this.touchShurikenJustPressed = false;
    this.touchDashJustPressed = false;
    this.touchRestartJustPressed = false;
    this._gpPrev = this.pollGamepad();
  }
}
