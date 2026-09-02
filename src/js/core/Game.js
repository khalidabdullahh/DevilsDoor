import { NinjaArashiRenderer } from '../render/NinjaArashiRenderer.js';
import { Camera2D } from './Camera2D.js';
import { NinjaArashiPlayer } from '../entities/NinjaArashiPlayer.js';
import { LevelRegistry } from '../levels/LevelRegistry.js';
import { AnalyticsManager } from './AnalyticsManager.js';
import { AdManager } from './AdManager.js';

/**
 * Game — Master Coordinator for Devil's Door: 10-Level Campaign, Ad Monetization,
 * and Cinematic Ascension Engine.
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
    this.level = null;
    this.adManager = null;

    this.currentLevelIndex = 1;
    this.totalLevels = LevelRegistry.TOTAL_LEVELS;
    this.deaths = 0;
    this.levelDeaths = 0;
    this.rewardOfferShownThisLevel = false;

    this.isPaused = false;
    this.isTransitioning = false;
    this.deathResetTimer = 0;
    this.lastTime = 0;

    // Bind callbacks
    this.input.onRestartCallback = () => this.restartLevel();
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
    this.player = new NinjaArashiPlayer(100, 220);
    this.adManager = new AdManager(this);

    this.loadLevel(1);

    this.lastTime = performance.now();
    requestAnimationFrame((t) => this._loop(t));

    if (this.audio) {
      this.audio.startAmbientDrone();
    }

    if (this.ui) {
      this.ui.hideLoading();
    }
  }

  loadLevel(levelNumber) {
    this.currentLevelIndex = Math.min(this.totalLevels, Math.max(1, levelNumber));
    this.level = LevelRegistry.getLevel(this.currentLevelIndex);
    this.levelDeaths = 0;
    this.rewardOfferShownThisLevel = false;

    this.player.reset(this.level.playerStartX, this.level.playerStartY);
    this.camera.snapTo(this.player.x, this.player.y);
    this.camera.setBounds(0, this.level.width || 1900, 0, this.level.height || 950);

    this.isTransitioning = false;
    this.ui.updateHUD(
      this.currentLevelIndex,
      this.totalLevels,
      this.level.title,
      this.deaths,
      this.player.health,
      this.player.maxHealth
    );

    AnalyticsManager.track('level_start', { levelId: this.currentLevelIndex, title: this.level.title });
  }

  restartLevel() {
    if (!this.level) return;
    this.deaths++;
    this.levelDeaths++;

    this.level.reset();
    this.player.reset(this.level.playerStartX, this.level.playerStartY);
    this.camera.snapTo(this.player.x, this.player.y);

    this.ui.updateHUD(
      this.currentLevelIndex,
      this.totalLevels,
      this.level.title,
      this.deaths,
      this.player.health,
      this.player.maxHealth
    );

    AnalyticsManager.track('player_death', { levelId: this.currentLevelIndex, totalDeaths: this.deaths, levelDeaths: this.levelDeaths });

    // 7th Death Rewarded Level Skip Offer
    if (this.levelDeaths >= 7 && !this.rewardOfferShownThisLevel && this.currentLevelIndex < this.totalLevels) {
      this.rewardOfferShownThisLevel = true;
      this.ui.showRewardedSkipModal(
        this.currentLevelIndex,
        () => {
          // Player chose to watch ad
          this.adManager.showRewardedAd(
            (rewardVerified) => {
              if (rewardVerified) {
                AnalyticsManager.track('level_skipped', { levelId: this.currentLevelIndex });
                this.loadLevel(this.currentLevelIndex + 1);
                this.setPaused(false);
              }
            },
            (err) => {
              console.warn('[AdManager] Ad failed:', err);
              this.setPaused(false);
            }
          );
        },
        () => {
          // Player declined
          this.setPaused(false);
        }
      );
    }
  }

  setPaused(paused) {
    this.isPaused = paused;
  }

  _loop(timestamp) {
    const dt = Math.min(0.05, (timestamp - this.lastTime) * 0.001);
    this.lastTime = timestamp;

    if (!this.isPaused && this.level) {
      this.update(dt);
    }

    const camX = this.camera.getCamX();
    const camY = this.camera.getCamY();

    this.renderer.render(camX, camY, this.level, this.player, this.level ? this.level.enemies : []);

    this.input.update();
    requestAnimationFrame((t) => this._loop(t));
  }

  update(dt) {
    // 1. Update Player & Scarf Physics
    this.player.update(dt, this.input, this.level, this.audio, this.camera);

    // 2. Resolve Katana Dash-Slash Hits against Enemies
    const attackBox = this.player.getAttackBox();
    if (attackBox) {
      for (const e of this.level.enemies) {
        if (e.isDead || e.health <= 0) continue;
        const eBounds = e.getBounds();
        const overlaps = (
          attackBox.x < eBounds.x + eBounds.width &&
          attackBox.x + attackBox.width > eBounds.x &&
          attackBox.y < eBounds.y + eBounds.height &&
          attackBox.y + attackBox.height > eBounds.y
        );
        if (overlaps) {
          e.takeDamage(attackBox.damage, attackBox.facing, this.audio);
          this.camera.addShake(0.35);
        }
      }
    }

    // 3. Resolve Shuriken Hits against Enemies
    for (const s of this.player.shurikens) {
      if (!s.active) continue;
      for (const e of this.level.enemies) {
        if (e.isDead || e.health <= 0) continue;
        const eBounds = e.getBounds();
        if (s.x > eBounds.x && s.x < eBounds.x + eBounds.width && s.y > eBounds.y && s.y < eBounds.y + eBounds.height) {
          s.active = false;
          e.takeDamage(s.damage, s.vx > 0 ? 1 : -1, this.audio);
          this.camera.addShake(0.2);
          break;
        }
      }
    }

    // 4. Update Level Deception, Enemies & Trap Interactions
    this.level.update(dt, this.player, this.audio, this.camera);

    // 5. Update Camera Tracking
    this.camera.update(dt, this.player);

    // 6. Check Hazards & Pit Deaths
    if (!this.player.isDead && !this.player.isAscending) {
      if (this.player.y > 900) {
        this.player.kill('abyss_fall', this.audio);
      } else {
        const hitHazard = this.level.checkHazardCollision(this.player.x, this.player.y, this.player.width, this.player.height);
        if (hitHazard) {
          this.player.kill(hitHazard.tag, this.audio);
          this.camera.addShake(0.5);
        }
      }
    }

    // 7. Check Devil's Door Entry & Cinematic Ascension
    if (!this.player.isDead && !this.isTransitioning) {
      if (this.level.checkDoorEntry(this.player)) {
        this.handleLevelComplete();
      }
    }

    // 8. Fast Respawn Loop
    if (this.player.isDead) {
      this.deathResetTimer += dt;
      if (this.deathResetTimer >= 0.38) {
        this.deathResetTimer = 0;
        this.restartLevel();
      }
    }

    // 9. Sync HUD
    this.ui.updateHUD(
      this.currentLevelIndex,
      this.totalLevels,
      this.level.title,
      this.deaths,
      this.player.health,
      this.player.maxHealth
    );
  }

  handleLevelComplete() {
    this.isTransitioning = true;
    this.player.startAscension();

    if (this.audio) this.audio.playLevelComplete();

    // Calculate stars
    const stars = this.levelDeaths === 0 ? 3 : (this.levelDeaths <= 2 ? 2 : 1);
    LevelRegistry.saveProgress(this.currentLevelIndex, stars);
    AnalyticsManager.track('level_complete', { levelId: this.currentLevelIndex, deaths: this.levelDeaths, stars });

    setTimeout(() => {
      this.ui.showVictoryModal(this.currentLevelIndex, this.totalLevels, this.deaths, stars, () => {
        if (this.currentLevelIndex < this.totalLevels) {
          this.loadLevel(this.currentLevelIndex + 1);
        } else {
          this.loadLevel(1);
        }
        this.setPaused(false);
      });
    }, 750);
  }
}
