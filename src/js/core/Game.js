import { NinjaArashiRenderer } from '../render/NinjaArashiRenderer.js';
import { Camera2D } from './Camera2D.js';
import { NinjaArashiPlayer } from '../entities/NinjaArashiPlayer.js';
import { EndlessWorld } from '../levels/EndlessWorld.js';
import { AnalyticsManager } from './AnalyticsManager.js';
import { AdManager } from './AdManager.js';
import { CHARACTER_ROSTER } from '../data/CharacterRoster.js';

/**
 * Game — Master Coordinator for Devil's Door v2.0: Endless Dark Fantasy Action-Platformer.
 * Coordinates Character Selection, procedural endless chunks, 3-minute dynamic biome cycles,
 * real-time distance & diamond tracking, and landscape-only orientation management.
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

    // Character State
    this.selectedCharacter = CHARACTER_ROSTER[0];

    // Endless Metrics & Scoring
    this.distance = 0;
    this.diamonds = 0;
    this.score = 0;
    this.highScore = parseInt(localStorage.getItem('devils_door_v2_highscore') || '0', 10);
    this.deaths = 0;

    this.isPaused = false;
    this.isGameOver = false;
    this.isOrientationBlocked = false;
    this.isInCharacterSelect = true;
    this.lastTime = 0;

    // Bind callbacks
    this.input.onRestartCallback = () => this.restartGame();
    this.input.onPauseCallback = () => {
      if (!this.isInCharacterSelect) {
        if (!this.isPaused) this.ui.showPauseModal();
        else {
          this.ui.hideModal();
          this.setPaused(false);
        }
      }
    };
  }

  init(characterSelectInstance = null) {
    this.renderer = new NinjaArashiRenderer(this.canvas);
    this.camera = new Camera2D(window.innerWidth, window.innerHeight);
    this.player = new NinjaArashiPlayer(120, 480);
    this.adManager = new AdManager(this);
    this.characterSelect = characterSelectInstance;

    this.applyCharacterData(this.selectedCharacter);

    this.lastTime = performance.now();
    requestAnimationFrame((t) => this._loop(t));

    if (this.audio) {
      this.audio.startAmbientDrone();
    }

    if (this.ui) {
      this.ui.hideLoading();
    }
  }

  applyCharacterData(charData) {
    if (!charData) return;
    this.selectedCharacter = charData;

    // Update Player stats based on selected character
    if (this.player) {
      if (charData.stats) {
        this.player.moveSpeed = 260 + (charData.stats.speed / 100) * 110;
        this.player.jumpForce = 390 + (charData.stats.jump / 100) * 90;
      }
    }

    // Update Top HUD Avatar image
    if (this.ui) {
      this.ui.updateAvatar(charData.image, charData.name);
    }
  }

  startEndlessRun(charData = null) {
    if (charData) {
      this.applyCharacterData(charData);
    }

    this.isInCharacterSelect = false;
    this.world = new EndlessWorld();
    this.player.reset(this.world.playerStartX, this.world.playerStartY);
    this.camera.snapTo(this.player.x, this.player.y);
    this.camera.setBounds(0, 9999999, 0, 950);

    this.distance = 0;
    this.isGameOver = false;
    this.isPaused = false;

    if (this.ui) {
      this.ui.showHUD();
      this.ui.updateEndlessHUD(
        this.distance,
        this.score,
        this.player.diamonds,
        this.highScore,
        this.player.health,
        this.player.maxHealth,
        this.world.biome
      );
    }
  }

  openCharacterSelect() {
    this.isInCharacterSelect = true;
    this.isPaused = false;
    this.isGameOver = false;
    if (this.ui) {
      this.ui.hideHUD();
      this.ui.hideModal();
    }
    if (this.characterSelect) {
      this.characterSelect.show();
    }
  }

  restartGame() {
    this.deaths++;
    this.startEndlessRun(this.selectedCharacter);
  }

  setPaused(paused) {
    this.isPaused = paused;
    if (!paused) {
      this.lastTime = performance.now();
    }
  }

  _loop(timestamp) {
    const dt = Math.min((timestamp - this.lastTime) / 1000, 0.05);
    this.lastTime = timestamp;

    if (!this.isPaused && !this.isOrientationBlocked && !this.isInCharacterSelect && this.world) {
      this._update(dt);
      this._render();
    }

    requestAnimationFrame((t) => this._loop(t));
  }

  _update(dt) {
    // 1. Update Player and Endless World
    this.player.update(dt, this.input, this.world, this.audio, this.camera);
    this.world.update(dt, this.player, this.audio, this.camera);

    // 2. Camera tracking
    this.camera.update(dt, this.player);

    // 3. Update Real-Time Metrics (Meters & Score)
    this.distance = Math.max(this.distance, Math.floor(this.player.x / 10));
    this.diamonds = this.player.diamonds || 0;
    this.score = this.distance * 10 + this.diamonds * 250 + (this.player.score || 0);

    // 4. Update High Score & Diamonds in localStorage
    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem('devils_door_v2_highscore', String(this.highScore));
    }

    const savedDiamonds = parseInt(localStorage.getItem('devilsdoor_diamonds') || '0', 10);
    if (this.diamonds > 0) {
      localStorage.setItem('devilsdoor_diamonds', String(savedDiamonds + this.diamonds));
      this.player.diamonds = 0; // consumed into wallet
    }

    // 5. Update HUD
    if (this.ui) {
      this.ui.updateEndlessHUD(
        this.distance,
        this.score,
        savedDiamonds,
        this.highScore,
        this.player.health,
        this.player.maxHealth,
        this.world.biome
      );
    }

    // 6. Check Game Over
    if (this.player.isDead && !this.isGameOver) {
      this.isGameOver = true;
      AnalyticsManager.track('endless_game_over', {
        distance: this.distance,
        score: this.score,
        diamonds: this.diamonds,
        biome: this.world.biome,
        character: this.selectedCharacter.id
      });

      setTimeout(() => {
        if (this.ui) {
          this.ui.showGameOverModal(
            this.distance,
            this.score,
            savedDiamonds,
            this.highScore,
            () => this.restartGame(),
            () => this.openCharacterSelect()
          );
        }
      }, 700);
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
