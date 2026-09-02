import { InputManager } from './core/InputManager.js';
import { AudioManager } from './core/AudioManager.js';
import { UIManager } from './ui/UIManager.js';
import { TouchControls } from './ui/TouchControls.js';
import { Game } from './core/Game.js';

/**
 * Main Bootstrap — Initializes Devil's Door V2 (3D Babylon.js Ninja Action-Platformer).
 */
window.addEventListener('DOMContentLoaded', async () => {
  const canvas = document.getElementById('game-canvas');
  if (!canvas) return;

  // 1. Core Subsystems
  const inputManager = new InputManager();
  const audioManager = new AudioManager();
  const touchControls = new TouchControls(inputManager);
  const uiManager = new UIManager(null);

  // 2. Initialize 3D Game Coordinator
  const game = new Game(canvas, inputManager, audioManager, uiManager);
  uiManager.game = game;

  try {
    await game.init();
    console.log('🚪 [DEVIL\'S DOOR V2] 3D Ninja Action-Platformer Running.');
  } catch (err) {
    console.error('❌ [DEVIL\'S DOOR V2] Failed to initialize Babylon 3D Game:', err);
  }
});
