import { Camera25D } from './Camera25D.js';
import { Player } from '../entities/Player.js';
import { ShadowDevil } from '../entities/ShadowDevil.js';
import { LevelRegistry } from '../levels/LevelRegistry.js';
import { AnalyticsManager } from './AnalyticsManager.js';

/**
 * Game — Central game state machine, loop, and coordinator.
 */
export class Game {
  constructor(canvas, inputManager, audioManager, uiManager) {
    this.canvas = canvas;
    this.input = inputManager;
    this.audio = audioManager;
    this.ui = uiManager;

    this.camera = new Camera25D(960, 540);
    this.player = new Player(80, 300);
    this.shadowDevil = new ShadowDevil(500, 200);

    this.currentLevelIndex = 0;
    this.currentLevel = null;
    this.deaths = 0;
    this.isPaused = false;
    this.isTransitioning = false;

    this.lastTime = 0;
    this.deathResetTimer = 0;

    // Bind input callbacks
    this.input.onRestartCallback = () => this.restartLevel();
    this.input.onPauseCallback = () => {
      if (!this.isPaused) {
        this.ui.showPauseModal();
      } else {
        this.ui.hideModal();
        this.setPaused(false);
      }
    };
  }

  start() {
    this.loadLevel(0);
    this.lastTime = performance.now();
    requestAnimationFrame((t) => this.loop(t));
  }

  loadLevel(index) {
    this.currentLevelIndex = index;
    this.currentLevel = LevelRegistry.createLevel(index);

    if (!this.currentLevel) {
      // Completed all levels
      this.ui.showVictoryModal(this.deaths, () => {
        this.deaths = 0;
        this.loadLevel(0);
        this.setPaused(false);
      });
      return;
    }

    // Position player
    this.player.reset(this.currentLevel.playerStartX, this.currentLevel.playerStartY);
    this.player.phaseColor = this.currentLevel.physicsWorld.activePhase || 'A';

    // Camera setup
    this.camera.setBounds(0, 0, 960, 540);
    this.camera.snapToTarget(this.player.box.x, this.player.box.y);

    // Shadow devil setup
    if (this.currentLevel.shadowDevil) {
      this.shadowDevil = this.currentLevel.shadowDevil;
    } else {
      this.shadowDevil.visible = false;
    }

    this.isTransitioning = false;
    this.ui.updateHUD(
      this.currentLevel.id,
      LevelRegistry.getTotalLevels(),
      this.currentLevel.title,
      this.deaths
    );

    AnalyticsManager.track('level_start', {
      levelId: this.currentLevel.id,
      levelTitle: this.currentLevel.title
    });
  }

  restartLevel() {
    if (!this.currentLevel) return;
    this.deaths++;
    this.ui.updateHUD(
      this.currentLevel.id,
      LevelRegistry.getTotalLevels(),
      this.currentLevel.title,
      this.deaths
    );

    this.currentLevel.reset();
    this.player.reset(this.currentLevel.playerStartX, this.currentLevel.playerStartY);
    this.player.phaseColor = this.currentLevel.physicsWorld.activePhase || 'A';
    this.camera.snapToTarget(this.player.box.x, this.player.box.y);

    AnalyticsManager.track('level_retry', {
      levelId: this.currentLevel.id,
      deaths: this.deaths
    });
  }

  setPaused(paused) {
    this.isPaused = paused;
    if (!paused) {
      this.lastTime = performance.now();
    }
  }

  loop(currentTime) {
    const rawDt = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    // Clamp dt to avoid huge simulation jumps on tab unfocus
    const dt = Math.min(0.05, rawDt);

    if (!this.isPaused && this.currentLevel) {
      this.update(dt);
    }

    this.input.update();
    requestAnimationFrame((t) => this.loop(t));
  }

  update(dt) {
    // 1. Update Player Physics
    this.player.update(dt, this.input, this.currentLevel.physicsWorld, this.audio);

    // 2. Check Pit Out-of-Bounds Death
    if (this.player.box.y > 600 && !this.player.isDead) {
      this.player.kill('pit_fall');
      if (this.audio) this.audio.playDeath();
    }

    // 3. Check Hazards
    if (!this.player.isDead) {
      const hitHazard = this.currentLevel.physicsWorld.checkHazardCollision(this.player.box);
      if (hitHazard) {
        this.player.kill(hitHazard.tag);
        if (this.audio) this.audio.playDeath();
        this.camera.addShake(0.5);
      }
    }

    // 4. Check Level Deception Update
    this.currentLevel.update(dt, this.player, this.input, this.camera, this.audio);

    // 5. Check Door Entrance
    if (!this.player.isDead && !this.isTransitioning) {
      for (const door of this.currentLevel.doors) {
        if (door.checkPlayerEntered(this.player.box)) {
          this.handleLevelComplete();
          break;
        }
      }
    }

    // 6. Handle Player Death Fast Respawn Cycle (<80ms)
    if (this.player.isDead) {
      this.deathResetTimer += dt;
      if (this.deathResetTimer >= 0.35) { // 350ms particle animation then instant respawn
        this.deathResetTimer = 0;
        this.restartLevel();
      }
    }

    // 7. Update Camera
    this.camera.setTarget(this.player.box.x + this.player.width / 2, this.player.box.y + this.player.height / 2);
    this.camera.update(dt);
  }

  handleLevelComplete() {
    this.isTransitioning = true;
    this.player.hasWon = true;

    if (this.audio) {
      this.audio.playLevelComplete();
    }

    AnalyticsManager.track('level_complete', {
      levelId: this.currentLevel.id,
      deaths: this.deaths
    });

    // Advance to next level after short victory pause
    setTimeout(() => {
      this.loadLevel(this.currentLevelIndex + 1);
    }, 600);
  }
}
