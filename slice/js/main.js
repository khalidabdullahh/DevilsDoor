import { BootScene, MenuScene, GameScene, UIScene } from './scenes.js';

const game = new Phaser.Game({
  type: new URLSearchParams(location.search).has('canvas') ? Phaser.CANVAS : Phaser.AUTO,
  parent: 'game',
  width: 1280, height: 720,
  backgroundColor: '#0b0610',
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  physics: { default: 'arcade', arcade: { gravity: { y: 1800 }, debug: new URLSearchParams(location.search).has('debug') } },
  render: { antialias: true, powerPreference: 'high-performance' },
  input: { activePointers: 4 },
  scene: [BootScene, MenuScene, GameScene, UIScene],
});
window.__game = game;
