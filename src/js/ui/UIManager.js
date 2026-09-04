import { AnalyticsManager } from '../core/AnalyticsManager.js';

/**
 * UIManager — High-Polish Mobile-First HUD, Modals, and Player Navigation for Devil's Door.
 * Fully bespoke SVG icons and responsive layout with zero generic emojis.
 */
export class UIManager {
  constructor(game) {
    this.game = game;

    this.hudElement = document.getElementById('game-hud');
    this.touchControls = document.getElementById('touch-controls');
    this.distanceDisplay = document.getElementById('distance-display');
    this.highScoreDisplay = document.getElementById('highscore-display');
    this.healthDisplay = document.getElementById('health-display');
    this.avatarImg = document.getElementById('hud-avatar-img');

    this.btnSettings = document.getElementById('btn-settings');
    this.btnRestart = document.getElementById('btn-restart');
    this.btnAudio = document.getElementById('btn-audio');
    this.audioIcon = document.getElementById('hud-audio-icon');
    this.btnMenu = document.getElementById('btn-menu');

    this.modalOverlay = document.getElementById('modal-overlay');
    this.modalTitle = document.getElementById('modal-title');
    this.modalDescription = document.getElementById('modal-description');
    this.btnModalPrimary = document.getElementById('btn-modal-primary');
    this.btnModalSceneSelect = document.getElementById('btn-modal-sceneselect');
    this.btnModalSettings = document.getElementById('btn-modal-settings');
    this.btnModalHome = document.getElementById('btn-modal-home');

    this.loadingOverlay = document.getElementById('loading-overlay');

    this._bindEvents();
  }

  _bindEvents() {
    if (this.btnSettings) {
      this.btnSettings.addEventListener('click', () => {
        if (this.game) this.game.openSettings();
      });
    }

    if (this.btnRestart) {
      this.btnRestart.addEventListener('click', () => {
        if (this.game) this.game.restartGame();
      });
    }

    if (this.btnAudio) {
      this.btnAudio.addEventListener('click', () => {
        if (this.game && this.game.audio) {
          const isMuted = this.game.audio.toggleMute();
          if (this.audioIcon) {
            this.audioIcon.classList.toggle('muted', isMuted);
          }
        }
      });
    }

    if (this.btnMenu) {
      this.btnMenu.addEventListener('click', () => this.showPauseModal());
    }

    if (this.btnModalPrimary) {
      this.btnModalPrimary.addEventListener('click', () => {
        const action = this.primaryAction;
        this.hideModal();
        if (action) action();
      });
    }

    if (this.btnModalSceneSelect) {
      this.btnModalSceneSelect.addEventListener('click', () => {
        const sceneAction = this.sceneSelectAction;
        this.hideModal();
        if (sceneAction) sceneAction();
        else if (this.game) this.game.openSceneSelect();
      });
    }

    if (this.btnModalSettings) {
      this.btnModalSettings.addEventListener('click', () => {
        this.hideModal();
        if (this.game) this.game.openSettings();
      });
    }

    if (this.btnModalHome) {
      this.btnModalHome.addEventListener('click', () => {
        window.location.href = '/';
      });
    }
  }

  hideLoading() {
    if (this.loadingOverlay) {
      this.loadingOverlay.classList.add('fade-out');
      setTimeout(() => {
        this.loadingOverlay.classList.add('hidden');
      }, 350);
    }
  }

  showHUD() {
    if (this.hudElement) this.hudElement.classList.remove('hidden');
    if (this.touchControls) this.touchControls.classList.remove('hidden');
  }

  hideHUD() {
    if (this.hudElement) this.hudElement.classList.add('hidden');
    if (this.touchControls) this.touchControls.classList.add('hidden');
  }

  updateEndlessHUD(distance, score, highScore, health = 3, maxHealth = 3, biome = 'sunset') {
    if (this.distanceDisplay) {
      this.distanceDisplay.textContent = `${distance.toLocaleString()}m`;
    }
    if (this.highScoreDisplay) {
      this.highScoreDisplay.textContent = `BEST: ${highScore.toLocaleString()}`;
    }
    if (this.healthDisplay) {
      let dotsHtml = '';
      for (let i = 0; i < maxHealth; i++) {
        const isActive = i < health;
        dotsHtml += `
          <div class="vitality-dot ${isActive ? 'active' : 'depleted'}" title="Health: ${health}/${maxHealth}">
            <span class="dot-core"></span>
          </div>
        `;
      }
      this.healthDisplay.innerHTML = dotsHtml;
    }
  }

  showPauseModal(onResume, onRestart, onChangeScene) {
    if (this.game) this.game.setPaused(true);
    if (this.modalTitle) this.modalTitle.textContent = 'PAUSED';
    if (this.modalDescription) this.modalDescription.textContent = 'Take breath, shinobi. The endless descent awaits your blade.';
    if (this.btnModalPrimary) this.btnModalPrimary.textContent = '▶ RESUME RUN';
    if (this.btnModalSceneSelect) this.btnModalSceneSelect.classList.remove('hidden');

    this.primaryAction = () => {
      if (this.game) this.game.setPaused(false);
      if (onResume) onResume();
    };
    this.sceneSelectAction = () => {
      if (this.game) this.game.openSceneSelect();
      if (onChangeScene) onChangeScene();
    };

    if (this.modalOverlay) this.modalOverlay.classList.remove('hidden');
  }

  showGameOverModal(distance, score, highScore, onRestart, onChangeScene) {
    if (this.game) this.game.setPaused(true);

    const isNewHigh = score >= highScore && score > 0;
    if (this.modalTitle) this.modalTitle.textContent = isNewHigh ? '🏆 NEW RECORD!' : '💀 SHADOW FALLEN';
    if (this.modalDescription) {
      this.modalDescription.innerHTML = `
        <div class="modal-stats-card">
          <div class="modal-stat-line"><span>DISTANCE:</span> <strong>${distance.toLocaleString()}m</strong></div>
          <div class="modal-stat-line"><span>SCORE:</span> <strong>${score.toLocaleString()}</strong></div>
          <div class="modal-stat-line highlight"><span>RECORD:</span> <strong>${highScore.toLocaleString()}</strong></div>
        </div>
      `;
    }

    if (this.btnModalPrimary) {
      this.btnModalPrimary.textContent = '⚔️ PLAY AGAIN';
      this.primaryAction = onRestart;
    }
    if (this.btnModalSceneSelect) {
      this.btnModalSceneSelect.classList.remove('hidden');
      this.sceneSelectAction = onChangeScene;
    }

    if (this.modalOverlay) this.modalOverlay.classList.remove('hidden');
  }

  hideModal() {
    if (this.modalOverlay) {
      this.modalOverlay.classList.add('hidden');
    }
  }
}
