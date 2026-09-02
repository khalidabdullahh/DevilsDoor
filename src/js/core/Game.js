import { BabylonEngine } from '../render/BabylonEngine.js';
import { Environment3D } from '../render/Environment3D.js';
import { CinematicCamera3D } from './CinematicCamera3D.js';
import { NinjaPlayer3D } from '../entities/NinjaPlayer3D.js';
import { CombatSystem } from '../combat/CombatSystem.js';
import { Level01_3D } from '../levels/Level01_3D.js';
import { AnalyticsManager } from './AnalyticsManager.js';

/**
 * Game — 3D Ninja Action-Platformer Master Coordinator for Devil's Door V2.
 */
export class Game {
  constructor(canvas, inputManager, audioManager, uiManager) {
    this.canvas = canvas;
    this.input = inputManager;
    this.audio = audioManager;
    this.ui = uiManager;

    this.engine = null;
    this.scene = null;
    this.shadowGenerator = null;
    this.environment = null;
    this.camera = null;
    this.player = null;
    this.combat = null;
    this.currentLevel = null;

    this.deaths = 0;
    this.isPaused = false;
    this.isTransitioning = false;
    this.deathResetTimer = 0;

    // Bind input callbacks
    this.input.onRestartCallback = () => this.restartLevel();
    this.input.onPauseCallback = () => {
      if (!this.isPaused) this.ui.showPauseModal();
      else {
        this.ui.hideModal();
        this.setPaused(false);
      }
    };
  }

  async init() {
    // 1. Initialize Babylon 3D Engine
    const babylon = await BabylonEngine.create(this.canvas);
    this.engine = babylon.engine;
    this.scene = babylon.scene;
    this.shadowGenerator = babylon.shadowGenerator;

    // 2. Systems
    this.environment = new Environment3D(this.scene, this.shadowGenerator);
    this.camera = new CinematicCamera3D(this.scene, this.canvas);
    this.player = new NinjaPlayer3D(this.scene, this.shadowGenerator, 0, 6.5);
    this.combat = new CombatSystem(this.scene);

    // 3. Load Level 01 Vertical Slice
    this.loadLevel(1);

    // 4. Start Babylon Render Loop
    this.engine.runRenderLoop(() => {
      const dt = Math.min(0.05, this.engine.getDeltaTime() * 0.001);

      if (!this.isPaused && this.currentLevel) {
        this.update(dt);
      }

      this.scene.render();
      this.input.update();
    });

    if (this.audio) {
      this.audio.startAmbientDrone();
    }
  }

  loadLevel(levelNumber) {
    this.currentLevel = new Level01_3D(this.scene, this.shadowGenerator, this.environment);

    this.player.reset(this.currentLevel.playerStartX, this.currentLevel.playerStartY);
    this.camera.snapTo(this.player.rootMesh.position.x, this.player.rootMesh.position.y);
    this.camera.setBounds(-4, 48, -4, 18);

    this.isTransitioning = false;
    this.ui.updateHUD(
      this.currentLevel.id,
      7,
      this.currentLevel.title,
      this.deaths,
      this.player.health,
      this.player.maxHealth
    );

    AnalyticsManager.track('level_start', { levelId: 1, title: this.currentLevel.title });
  }

  restartLevel() {
    if (!this.currentLevel) return;
    this.deaths++;
    this.currentLevel.reset();
    this.player.reset(this.currentLevel.playerStartX, this.currentLevel.playerStartY);
    this.camera.snapTo(this.player.rootMesh.position.x, this.player.rootMesh.position.y);

    this.ui.updateHUD(
      this.currentLevel.id,
      7,
      this.currentLevel.title,
      this.deaths,
      this.player.health,
      this.player.maxHealth
    );

    AnalyticsManager.track('level_retry', { levelId: 1, deaths: this.deaths });
  }

  setPaused(paused) {
    this.isPaused = paused;
  }

  update(dt) {
    // 1. Update Player & Animation
    this.player.update(dt, this.input, this.currentLevel.physicsWorld, this.audio, this.camera);

    // 2. Resolve Combat Slashes against Active Enemies
    this.combat.update(this.player, this.currentLevel.enemies, this.audio, this.camera);

    // 3. Update Level Deception & Enemies
    this.currentLevel.update(dt, this.player, this.audio, this.camera);

    // 4. Update Atmospheric Particles & Lanterns
    this.environment.update(dt);

    // 5. Update Camera Tracking
    this.camera.update(dt, this.player);

    // 6. Check Hazards & Pit Deaths
    if (!this.player.isDead) {
      const px = this.player.rootMesh.position.x;
      const py = this.player.rootMesh.position.y;

      if (py < -8.0) {
        this.player.kill('abyss_fall', this.audio);
      } else {
        const hitHazard = this.currentLevel.physicsWorld.checkHazardCollision(px, py, this.player.width, this.player.height);
        if (hitHazard) {
          this.player.kill(hitHazard.tag, this.audio);
          this.camera.addShake(0.5);
        }
      }
    }

    // 7. Check Door Entry & Level Completion
    if (!this.player.isDead && !this.isTransitioning) {
      for (const door of this.currentLevel.doors) {
        if (door.checkPlayerEntered(this.player)) {
          this.handleLevelComplete();
          break;
        }
      }
    }

    // 8. Fast Respawn Loop (<80ms delay)
    if (this.player.isDead) {
      this.deathResetTimer += dt;
      if (this.deathResetTimer >= 0.4) {
        this.deathResetTimer = 0;
        this.restartLevel();
      }
    }

    // 9. Sync HUD Health
    this.ui.updateHUD(
      this.currentLevel.id,
      7,
      this.currentLevel.title,
      this.deaths,
      this.player.health,
      this.player.maxHealth
    );
  }

  handleLevelComplete() {
    this.isTransitioning = true;
    this.player.hasWon = true;

    if (this.audio) this.audio.playLevelComplete();

    AnalyticsManager.track('level_complete', { levelId: 1, deaths: this.deaths });

    setTimeout(() => {
      this.ui.showVictoryModal(this.deaths, () => {
        this.deaths = 0;
        this.loadLevel(1);
        this.setPaused(false);
      });
    }, 700);
  }
}
