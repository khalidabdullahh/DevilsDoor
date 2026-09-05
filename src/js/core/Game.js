import { NinjaArashiRenderer } from '../render/NinjaArashiRenderer.js';
import { Camera2D } from './Camera2D.js';
import { NinjaArashiPlayer } from '../entities/NinjaArashiPlayer.js';
import { EndlessWorld } from '../levels/EndlessWorld.js';
import { AnalyticsManager } from './AnalyticsManager.js';
import { AdManager } from './AdManager.js';
import { EconomyManager } from './EconomyManager.js';
import { RewardProvider } from './RewardProvider.js';
import { SCENE_ROSTER } from '../data/SceneRoster.js';
import { CHARACTER_ROSTER } from '../data/CharacterRoster.js';

/**
 * Game — Master Coordinator for Devil's Door v2.2 (vNext Master Edition).
 * Orchestrates:
 * 1. Primary Flow: Landing -> Character Select -> Scene Select -> Endless Run -> Rewards
 * 2. Real-Time Distance & Point Milestone Rewards (+10 PTS per 1000m)
 * 3. 3D-Rendered Character Archetype Rendering
 * 4. High-Resolution 4K Realm Simulation
 */
export class Game {
  constructor(canvas, inputManager, audioManager, uiManager) {
    this.canvas = canvas;
    this.input = inputManager;
    this.audio = audioManager;
    this.ui = uiManager;

    this.renderer = null;
    this.camera = null;
    this.player = null;
    this.world = null;
    this.adManager = null;
    this.characterSelect = null;
    this.sceneSelect = null;
    this.settingsModal = null;

    // Centralized Economy & Rewards
    this.economy = new EconomyManager();
    this.rewards = new RewardProvider(this.economy, 90);

    // Active Selection State
    const activeSceneId = this.economy.getSelectedScene();
    this.selectedScene = SCENE_ROSTER.find(s => s.id === activeSceneId) || SCENE_ROSTER[0];
    const activeCharId = this.economy.getSelectedCharacter();
    this.selectedCharacter = CHARACTER_ROSTER.find(c => c.id === activeCharId) || CHARACTER_ROSTER[0];

    // Metrics & Progression
    this.distance = 0;
    this.score = 0;
    this.pointsEarnedInRun = 0;
    this.highScore = parseInt(localStorage.getItem('devils_door_v2_highscore') || '0', 10);
    this.deaths = 0;

    // Game Flow States
    this.isPaused = false;
    this.isGameOver = false;
    this.isOrientationBlocked = false;
    this.isInSelectionFlow = true;
    this.lastTime = 0;

    // Bind input callbacks
    this.input.onRestartCallback = () => this.restartGame();
    this.input.onPauseCallback = () => {
      if (!this.isInSelectionFlow) {
        if (!this.isPaused) this.ui.showPauseModal();
        else {
          this.ui.hideModal();
          this.setPaused(false);
        }
      }
    };
  }

  init(characterSelectInstance = null, sceneSelectInstance = null, settingsModalInstance = null) {
    this.renderer = new NinjaArashiRenderer(this.canvas);
    this.camera = new Camera2D(window.innerWidth, window.innerHeight);
    this.player = new NinjaArashiPlayer(120, 480, this.selectedCharacter ? this.selectedCharacter.id : 'kage_ryu');
    this.adManager = new AdManager(this);
    this.characterSelect = characterSelectInstance;
    this.sceneSelect = sceneSelectInstance;
    this.settingsModal = settingsModalInstance;

    this.lastTime = performance.now();
    requestAnimationFrame((t) => this._loop(t));

    if (this.audio) {
      this.audio.startAmbientDrone();
    }

    if (this.ui) {
      this.ui.hideLoading();
    }
  }

  openCharacterSelect() {
    this.isInSelectionFlow = true;
    this.isPaused = false;
    this.isGameOver = false;
    if (this.ui) {
      this.ui.hideHUD();
      this.ui.hideModal();
    }
    if (this.sceneSelect) {
      this.sceneSelect.hide();
    }
    if (this.characterSelect) {
      this.characterSelect.show();
    }
  }

  openSceneSelect() {
    this.isInSelectionFlow = true;
    this.isPaused = false;
    this.isGameOver = false;
    if (this.ui) {
      this.ui.hideHUD();
      this.ui.hideModal();
    }
    if (this.characterSelect) {
      this.characterSelect.hide();
    }
    if (this.sceneSelect) {
      this.sceneSelect.show();
    }
  }

  openSettings() {
    if (this.settingsModal) {
      this.settingsModal.show();
    }
  }

  startEndlessRun(sceneData = null) {
    if (sceneData) {
      this.selectedScene = sceneData;
    }

    const activeCharId = this.economy.getSelectedCharacter();
    this.selectedCharacter = CHARACTER_ROSTER.find(c => c.id === activeCharId) || CHARACTER_ROSTER[0];

    this.isInSelectionFlow = false;
    this.world = new EndlessWorld(this.selectedScene ? this.selectedScene.id : 'sunset_torii');
    this.player.setCharacter(this.selectedCharacter ? this.selectedCharacter.id : 'kage_ryu');
    this.player.reset(this.world.playerStartX, this.world.playerStartY);
    this.camera.snapTo(this.player.x, this.player.y);
    this.camera.setBounds(0, 9999999, 0, 950);

    this.distance = 0;
    this.score = 0;
    this.pointsEarnedInRun = 0;
    this.economy.resetRunMilestones();
    this.isGameOver = false;
    this.isPaused = false;

    if (this.ui) {
      this.ui.showHUD();
      this.ui.updateEndlessHUD(
        this.distance,
        this.score,
        this.highScore,
        this.player.health,
        this.player.maxHealth,
        this.world.biome
      );
    }
  }

  restartGame() {
    this.deaths++;
    this.startEndlessRun(this.selectedScene);
  }

  setPaused(paused) {
    this.isPaused = paused;
    if (!paused) {
      this.lastTime = performance.now();
    }
  }

  _loop(timestamp) {
    const dt = Math.min((timestamp - this.lastTime) / 1000, 0.08);
    this.lastTime = timestamp;

    if (!this.isPaused && !this.isOrientationBlocked && !this.isInSelectionFlow && this.world) {
      this._update(dt);
      this._render();
    }

    if (this.input) {
      this.input.update();
    }

    requestAnimationFrame((t) => this._loop(t));
  }

  _update(dt) {
    // 1. Update Player and Endless World
    this.player.update(dt, this.input, this.world, this.audio, this.camera);
    this.world.update(dt, this.player, this.audio, this.camera);

    // 2. Camera Tracking
    this.camera.update(dt, this.player, this.renderer.width, this.renderer.height);

    // 3. Update Real-Time Metrics (Meters & Score)
    this.distance = Math.max(this.distance, Math.floor(this.player.x / 10));
    this.score = this.distance * 10 + (this.player.score || 0);

    // 4. Update High Score in localStorage
    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem('devils_door_v2_highscore', String(this.highScore));
    }

    // 5. Update HUD
    if (this.ui) {
      this.ui.updateEndlessHUD(
        this.distance,
        this.score,
        this.highScore,
        this.player.health,
        this.player.maxHealth,
        this.world.biome
      );
    }

    // 6. Check Game Over
    if (this.player.isDead && !this.isGameOver) {
      this.isGameOver = true;

      // Distance Milestone Reward: Calculated & credited cleanly on run completion (+10 PTS per 1000m)
      const thousandsSurvived = Math.floor(this.distance / 1000);
      this.pointsEarnedInRun = thousandsSurvived * 10;
      if (this.pointsEarnedInRun > 0) {
        this.economy.addPoints(this.pointsEarnedInRun, `endless_run_${this.distance}m`);
      }

      AnalyticsManager.track('endless_game_over', {
        distance: this.distance,
        score: this.score,
        pointsEarned: this.pointsEarnedInRun,
        biome: this.world.biome
      });

      setTimeout(() => {
        if (this.ui) {
          this.ui.showGameOverModal(
            this.distance,
            this.score,
            this.highScore,
            this.pointsEarnedInRun,
            this.economy.getPoints(),
            () => this.restartGame(),
            () => this.openSceneSelect(),
            () => this.openCharacterSelect()
          );
        }
      }, 500);
    }
  }

  _render() {
    this.renderer.render(
      this.camera.x,
      this.camera.y,
      this.world,
      this.player,
      this.world.enemies
    );
  }
}
