import { InputManager } from './core/InputManager.js';
import { AudioManager } from './core/AudioManager.js';
import { Renderer25D } from './render/Renderer25D.js';
import { UIManager } from './ui/UIManager.js';
import { TouchControls } from './ui/TouchControls.js';
import { IntroSequence } from './intro/IntroSequence.js';
import { Game } from './core/Game.js';

/**
 * Main Bootstrap — Initializes Devil's Door.
 */
window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('game-canvas');
  if (!canvas) return;

  // 1. Core Subsystems
  const inputManager = new InputManager();
  const audioManager = new AudioManager();
  const renderer = new Renderer25D(canvas);

  let game = null;

  // 2. UI Subsystems
  const touchControls = new TouchControls(inputManager);

  // 3. Render Tick Loop (runs independently of physics rate)
  function renderLoop() {
    if (game && game.currentLevel) {
      renderer.render(
        game.currentLevel,
        game.player,
        game.shadowDevil,
        game.camera
      );
    }
    requestAnimationFrame(renderLoop);
  }
  requestAnimationFrame(renderLoop);

  // 4. Intro Sequence Handler
  const intro = new IntroSequence('intro-overlay', () => {
    // Start game when intro finishes or is skipped
    if (!game) {
      const uiManager = new UIManager(null);
      game = new Game(canvas, inputManager, audioManager, uiManager);
      uiManager.game = game;
      game.start();
    }
  });

  // Start intro sequence
  intro.start(audioManager);

  // Fallback: If intro overlay is not present or bypassed
  setTimeout(() => {
    if (!game) {
      intro.skip();
    }
  }, 9000);
});
