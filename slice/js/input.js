// Unified input: keyboard + on-screen touch buttons feed the same intent object.
export const touch = { left: false, right: false, down: false, jumpHeld: false, edge: { jump: false, attack: false, dash: false, throw: false } };

export function makeKeys(scene) {
  const kb = scene.input.keyboard, K = Phaser.Input.Keyboard.KeyCodes;
  const ks = (...c) => c.map((x) => kb.addKey(x));
  return {
    left: ks(K.A, K.LEFT), right: ks(K.D, K.RIGHT), up: ks(K.W, K.UP, K.SPACE), down: ks(K.S, K.DOWN),
    atk: ks(K.J, K.X, K.Z), dash: ks(K.K, K.C, K.SHIFT), thr: ks(K.L, K.V),
    pause: ks(K.P, K.ESC), mute: ks(K.M), restart: ks(K.R),
  };
}
const held = (a) => a.some((k) => k.isDown);
const pressed = (a) => a.reduce((r, k) => Phaser.Input.Keyboard.JustDown(k) || r, false);

export function readIntent(keys) {
  const e = touch.edge;
  const i = {
    x: (held(keys.right) || touch.right ? 1 : 0) - (held(keys.left) || touch.left ? 1 : 0),
    down: held(keys.down) || touch.down,
    jump: pressed(keys.up) || e.jump,
    jumpHeld: held(keys.up) || touch.jumpHeld,
    attack: pressed(keys.atk) || e.attack,
    dash: pressed(keys.dash) || e.dash,
    throw: pressed(keys.thr) || e.throw,
  };
  e.jump = e.attack = e.dash = e.throw = false;
  return i;
}
export const pressedKey = pressed;
