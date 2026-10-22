import { BootScene, MenuScene, GameScene, UIScene } from './scenes.js';
import { W, H, aspectW } from './view.js';

const game = new Phaser.Game({
  type: new URLSearchParams(location.search).has('canvas') ? Phaser.CANVAS : Phaser.AUTO,
  parent: 'game',
  width: W, height: H,
  backgroundColor: '#0b0610',
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  physics: { default: 'arcade', arcade: { gravity: { y: 1800 }, debug: new URLSearchParams(location.search).has('debug') } },
  render: { antialias: true, powerPreference: 'high-performance' },
  input: { activePointers: 4 },
  scene: [BootScene, MenuScene, GameScene, UIScene],
});
window.__game = game;

// Phones: if the device is rotated after load (portrait -> landscape) the logical width is wrong; reload once to refit.
if (matchMedia('(pointer: coarse)').matches) {
  let t; const check = () => { if (Math.abs(aspectW() - W) > 60) location.reload(); };
  const sched = () => { clearTimeout(t); t = setTimeout(check, 450); };
  addEventListener('resize', sched); addEventListener('orientationchange', sched);
}
