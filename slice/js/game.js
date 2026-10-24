import { BootScene, GameScene } from './scenes.js';
import { RealmScene, LevelScene } from './menus.js';
import { UIScene } from './ui.js';
import { W, H } from './view.js';

export function startGame() {
  const game = new Phaser.Game({
    type: new URLSearchParams(location.search).has('canvas') ? Phaser.CANVAS : Phaser.AUTO,
    parent: 'game',
    width: W, height: H,
    backgroundColor: '#0b0610',
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    physics: { default: 'arcade', arcade: { gravity: { y: 1800 }, debug: new URLSearchParams(location.search).has('debug') } },
    render: { antialias: true, powerPreference: 'high-performance' },
    input: { activePointers: 4 },
    scene: [BootScene, RealmScene, LevelScene, GameScene, UIScene],
  });
  window.__game = game;
  return game;
}
