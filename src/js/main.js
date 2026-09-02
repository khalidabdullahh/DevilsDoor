import { InputManager } from './core/InputManager.js';
import { AudioManager } from './core/AudioManager.js';
import { UIManager } from './ui/UIManager.js';
import { TouchControls } from './ui/TouchControls.js';
import { Game } from './core/Game.js';

/**
 * Main Bootstrap — Initializes Devil's Door: Ninja Arashi 2 Visual Benchmark.
 */
window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('game-canvas');
  if (!canvas) return;

  // 1. Core Subsystems
  const inputManager = new InputManager();
  const audioManager = new AudioManager();
  const touchControls = new TouchControls(inputManager);
  const uiManager = new UIManager(null);

  // 2. Initialize Master Game Coordinator
  const game = new Game(canvas, inputManager, audioManager, uiManager);
  uiManager.game = game;

  try {
    game.init();
    console.log('🚪 [DEVIL\'S DOOR] Ninja Arashi 2 Silhouette Benchmark Running.');
  } catch (err) {
    console.error('❌ [DEVIL\'S DOOR] Failed to initialize Ninja Arashi Game:', err);
  }
});
