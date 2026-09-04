import { InputManager } from './core/InputManager.js';
import { AudioManager } from './core/AudioManager.js';
import { UIManager } from './ui/UIManager.js';
import { TouchControls } from './ui/TouchControls.js';
import { SceneSelect } from './ui/SceneSelect.js';
import { SettingsModal } from './ui/SettingsModal.js';
import { OrientationManager } from './ui/OrientationManager.js';
import { Game } from './core/Game.js';

/**
 * Main Bootstrap — Initializes Devil's Door v2.1: 4K Dark Fantasy Action-Platformer.
 * Flow:
 * 1. Initialize Subsystems (Input, Audio, Touch, UI, Orientation).
 * 2. Initialize Scene/Realm Selection UI.
 * 3. Initialize Settings Modal.
 * 4. On [ ENTER REALM / START RUN ], launch Endless Domain gameplay loop.
 */
function bootGame() {
  const canvas = document.getElementById('game-canvas');
  if (!canvas) return;

  const sceneSelectContainer = document.getElementById('character-select-screen');
  const rotateOverlay = document.getElementById('rotate-overlay');

  // 1. Core Subsystems
  const inputManager = new InputManager();
  const audioManager = new AudioManager();
  const touchControls = new TouchControls(inputManager);
  const uiManager = new UIManager(null);

  // 2. Initialize Master Game Coordinator
  const game = new Game(canvas, inputManager, audioManager, uiManager);
  uiManager.game = game;

  // 3. Orientation Enforcement (Landscape-only)
  const orientationManager = new OrientationManager(rotateOverlay, game);

  // 4. Settings Subsystem
  const settingsModal = new SettingsModal(game, touchControls, audioManager);
  game.settingsModal = settingsModal;

  // 5. Scene/Stage Selection System
  const sceneSelect = new SceneSelect(sceneSelectContainer, (selectedScene) => {
    game.startEndlessRun(selectedScene);
  });
  game.sceneSelect = sceneSelect;

  try {
    game.init(sceneSelect, settingsModal);
    console.log('🚪 [DEVIL\'S DOOR v2.1] Endless Platformer & 4K Scene Selection Online.');
  } catch (err) {
    console.error('❌ [DEVIL\'S DOOR] Failed to initialize Game:', err);
    if (uiManager) uiManager.hideLoading();
  }
}

// Safety timeout: Guarantee loader removal within 1.2s under any network condition
setTimeout(() => {
  const loader = document.getElementById('loading-overlay');
  if (loader && !loader.classList.contains('hidden')) {
    loader.classList.add('fade-out');
    setTimeout(() => loader.classList.add('hidden'), 350);
  }
}, 1200);

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootGame);
} else {
  bootGame();
}

