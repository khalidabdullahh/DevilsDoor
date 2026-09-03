import { InputManager } from './core/InputManager.js';
import { AudioManager } from './core/AudioManager.js';
import { UIManager } from './ui/UIManager.js';
import { TouchControls } from './ui/TouchControls.js';
import { CharacterSelect } from './ui/CharacterSelect.js';
import { OrientationManager } from './ui/OrientationManager.js';
import { Game } from './core/Game.js';

/**
 * Main Bootstrap — Initializes Devil's Door v2.0: Endless Dark Fantasy Action-Platformer.
 * Flow:
 * 1. Initialize Subsystems (Input, Audio, Touch, UI, Orientation).
 * 2. Initialize Character Selection UI.
 * 3. On Character Select [ START RUN ], launch Endless Domain gameplay loop.
 */
window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('game-canvas');
  if (!canvas) return;

  const charSelectContainer = document.getElementById('character-select-screen');
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

  // 4. Character Selection System
  const characterSelect = new CharacterSelect(charSelectContainer, (selectedCharacter) => {
    game.startEndlessRun(selectedCharacter);
  });
  game.characterSelect = characterSelect;

  try {
    game.init(characterSelect);
    console.log('🚪 [DEVIL\'S DOOR v2.0] Endless Platformer & Character Selection Online.');
  } catch (err) {
    console.error('❌ [DEVIL\'S DOOR] Failed to initialize Game:', err);
  }
});
