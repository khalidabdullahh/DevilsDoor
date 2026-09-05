import { InputManager } from './core/InputManager.js';
import { AudioManager } from './core/AudioManager.js';
import { UIManager } from './ui/UIManager.js';
import { TouchControls } from './ui/TouchControls.js';
import { CharacterSelect } from './ui/CharacterSelect.js';
import { SceneSelect } from './ui/SceneSelect.js';
import { SettingsModal } from './ui/SettingsModal.js';
import { OrientationManager } from './ui/OrientationManager.js';
import { Game } from './core/Game.js';

/**
 * Main Bootstrap — Initializes Devil's Door v2.2 (vNext Master Edition).
 * Flow:
 * 1. Landing Page -> [ PLAY GAME ]
 * 2. Character Selection -> [ SELECT SHINOBI ]
 * 3. Scene Selection -> [ ENTER REALM ⚔️ ]
 * 4. Endless Gameplay Run -> Real-Time Points (+10 PTS per 1000m)
 * 5. Unlock New Shinobi & Realms -> Play Again
 */
function bootGame() {
  const canvas = document.getElementById('game-canvas');
  if (!canvas) return;

  const charSelectContainer = document.getElementById('character-select-screen');
  const sceneSelectContainer = document.getElementById('scene-select-screen');
  const rotateOverlay = document.getElementById('rotate-overlay');

  // 1. Core Subsystems
  const inputManager = new InputManager();
  const audioManager = new AudioManager();
  const touchControls = new TouchControls(inputManager);
  const uiManager = new UIManager(null);

  // 2. Initialize Master Game Coordinator
  const game = new Game(canvas, inputManager, audioManager, uiManager);
  uiManager.game = game;

  // 3. Orientation Enforcement & Handheld Console Support
  const orientationManager = new OrientationManager(rotateOverlay, game);

  // 4. Settings Subsystem
  const settingsModal = new SettingsModal(game, touchControls, audioManager);
  game.settingsModal = settingsModal;

  // 5. Character Selection Subsystem (Step 1)
  const characterSelect = new CharacterSelect(
    charSelectContainer,
    game.economy,
    game.rewards,
    (selectedChar) => {
      // Step 1 Complete -> Navigate to Step 2 (Scene Select)
      game.openSceneSelect();
    }
  );
  game.characterSelect = characterSelect;

  // 6. Scene / Realm Selection Subsystem (Step 2)
  const sceneSelect = new SceneSelect(
    sceneSelectContainer,
    game.economy,
    game.rewards,
    (selectedScene) => {
      // Step 2 Complete -> Launch Gameplay Run
      game.startEndlessRun(selectedScene);
    },
    () => {
      // Back to Step 1
      game.openCharacterSelect();
    }
  );
  game.sceneSelect = sceneSelect;

  try {
    game.init(characterSelect, sceneSelect, settingsModal);
    console.log('🚪 [DEVIL\'S DOOR v2.2] vNext Master Edition Online.');
  } catch (err) {
    console.error('❌ [DEVIL\'S DOOR] Failed to initialize Game:', err);
    if (uiManager) uiManager.hideLoading();
  }
}

// Safety timeout: Guarantee loader removal within 1.2s
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
