import { NinjaArashiRenderer } from '../render/NinjaArashiRenderer.js';
import { Camera2D } from './Camera2D.js';
import { NinjaArashiPlayer } from '../entities/NinjaArashiPlayer.js';
import { EndlessWorld } from '../levels/EndlessWorld.js';
import { AnalyticsManager } from './AnalyticsManager.js';
import { AdManager } from './AdManager.js';

/**
 * Game — Master Coordinator for Devil's Door v2.0: Endless Dark Fantasy Action-Platformer.
 * Coordinates procedural endless chunk generation, 3-minute dynamic biome cycles,
 * real-time distance & diamond tracking, and high score records.
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

    // Endless Metrics & Scoring
    this.distance = 0;
    this.diamonds = 0;
    this.score = 0;
    this.highScore = parseInt(localStorage.getItem('devils_door_v2_highscore') || '0', 10);
    this.deaths = 0;

    this.isPaused = false;
    this.isGameOver = false;
    this.lastTime = 0;

    // Bind callbacks
    this.input.onRestartCallback = () => this.restartGame();
    this.input.onPauseCallback = () => {
      if (!this.isPaused) this.ui.showPauseModal();
      else {
        this.ui.hideModal();
        this.setPaused(false);
      }
    };
  }

  init() {
    this.renderer = new NinjaArashiRenderer(this.canvas);
    this.camera = new Camera2D(window.innerWidth, window.innerHeight);
    this.player = new NinjaArashiPlayer(120, 480);
    this.adManager = new AdManager(this);

    this.startEndlessRun();

    this.lastTime = performance.now();
    requestAnimationFrame((t) => this._loop(t));

    if (this.audio) {
      this.audio.startAmbientDrone();
    }

    if (this.ui) {
      this.ui.hideLoading();
    }
  }

  startEndlessRun() {
    this.world = new EndlessWorld();
    this.player.reset(this.world.playerStartX, this.world.playerStartY);
    this.camera.snapTo(this.player.x, this.player.y);
    this.camera.setBounds(0, 9999999, 0, 950);

    this.distance = 0;
    this.isGameOver = false;
    this.isPaused = false;

    if (this.ui) {
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

  restartGame() {
    this.deaths++;
    this.startEndlessRun();
  }

  setPaused(paused) {
    this.isPaused = paused;
    if (!paused) {
      this.lastTime = performance.now();
    }
  }

  _loop(timestamp) {
    const dt = Math.min((timestamp - this.lastTime) / 1000, 0.05); // Cap delta time
    this.lastTime = timestamp;

    if (!this.isPaused) {
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

    // 4. Update All-Time High Score
    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem('devils_door_v2_highscore', String(this.highScore));
    }

    // 5. Update HUD
    if (this.ui) {
      this.ui.updateEndlessHUD(
        this.distance,
        this.score,
        this.diamonds,
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
        biome: this.world.biome
      });

      setTimeout(() => {
        if (this.ui) {
          this.ui.showGameOverModal(this.distance, this.score, this.diamonds, this.highScore, () => {
            this.restartGame();
          });
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
