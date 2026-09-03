import { AnalyticsManager } from '../core/AnalyticsManager.js';

/**
 * UIManager — Manages HUD elements, meters, score, diamonds, high score,
 * avatar portraits, and game modals for Devil's Door v2.0 Endless Platformer.
 */
export class UIManager {
  constructor(game) {
    this.game = game;

    this.hudElement = document.getElementById('game-hud');
    this.touchControls = document.getElementById('touch-controls');
    this.distanceDisplay = document.getElementById('distance-display');
    this.diamondsDisplay = document.getElementById('diamonds-display');
    this.highScoreDisplay = document.getElementById('highscore-display');
    this.healthDisplay = document.getElementById('health-display');
    this.avatarImg = document.getElementById('hud-avatar-img');

    this.btnRestart = document.getElementById('btn-restart');
    this.btnAudio = document.getElementById('btn-audio');
    this.btnMenu = document.getElementById('btn-menu');

    this.modalOverlay = document.getElementById('modal-overlay');
    this.modalTitle = document.getElementById('modal-title');
    this.modalDescription = document.getElementById('modal-description');
    this.btnModalPrimary = document.getElementById('btn-modal-primary');
    this.btnModalRestart = document.getElementById('btn-modal-restart');
    this.btnModalCharSelect = document.getElementById('btn-modal-charselect');
    this.btnModalHome = document.getElementById('btn-modal-home');

    this.loadingOverlay = document.getElementById('loading-overlay');

    this._bindEvents();
  }

  _bindEvents() {
    if (this.btnRestart) {
      this.btnRestart.addEventListener('click', () => {
        if (this.game) this.game.restartGame();
      });
    }

    if (this.btnAudio) {
      this.btnAudio.addEventListener('click', () => {
        if (this.game && this.game.audio) {
          const isMuted = this.game.audio.toggleMute();
          this.btnAudio.textContent = isMuted ? '🔇' : '🔊';
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

    if (this.btnModalRestart) {
      this.btnModalRestart.addEventListener('click', () => {
        const restartAction = this.restartAction;
        this.hideModal();
        if (restartAction) restartAction();
        else if (this.game) this.game.restartGame();
      });
    }

    if (this.btnModalCharSelect) {
      this.btnModalCharSelect.addEventListener('click', () => {
        const charAction = this.charSelectAction;
        this.hideModal();
        if (charAction) charAction();
        else if (this.game) this.game.openCharacterSelect();
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

  updateAvatar(imgSrc, altText = 'Hero') {
    if (this.avatarImg) {
      this.avatarImg.src = imgSrc;
      this.avatarImg.alt = altText;
    }
  }

  updateEndlessHUD(distance, score, diamonds, highScore, health = 3, maxHealth = 3, biome = 'sunset') {
    if (this.distanceDisplay) {
      this.distanceDisplay.textContent = `${distance.toLocaleString()}m`;
    }
    if (this.diamondsDisplay) {
      this.diamondsDisplay.textContent = `${diamonds}`;
    }
    if (this.highScoreDisplay) {
      this.highScoreDisplay.textContent = `BEST: ${highScore.toLocaleString()}`;
    }
    if (this.healthDisplay) {
      let hearts = '';
      for (let i = 0; i < maxHealth; i++) {
        hearts += i < health ? '❤️ ' : '🖤 ';
      }
      this.healthDisplay.textContent = hearts.trim();
    }
  }

  showPauseModal(onResume, onRestart, onChangeChar) {
    if (this.game) this.game.setPaused(true);
    if (this.modalTitle) this.modalTitle.textContent = 'PAUSED';
    if (this.modalDescription) this.modalDescription.textContent = 'Take breath, shinobi. The endless descent awaits your blade.';
    if (this.btnModalPrimary) this.btnModalPrimary.textContent = 'RESUME';
    if (this.btnModalRestart) this.btnModalRestart.textContent = 'RESTART RUN';
    if (this.btnModalCharSelect) this.btnModalCharSelect.classList.remove('hidden');

    this.primaryAction = () => {
      if (this.game) this.game.setPaused(false);
      if (onResume) onResume();
    };
    this.restartAction = () => {
      if (this.game) this.game.restartGame();
      if (onRestart) onRestart();
    };
    this.charSelectAction = () => {
      if (this.game) this.game.openCharacterSelect();
      if (onChangeChar) onChangeChar();
    };

    if (this.modalOverlay) this.modalOverlay.classList.remove('hidden');
  }

  showGameOverModal(distance, score, diamonds, highScore, onRestart, onChangeChar) {
    if (this.game) this.game.setPaused(true);

    const isNewHigh = score >= highScore && score > 0;
    if (this.modalTitle) this.modalTitle.textContent = isNewHigh ? '🏆 NEW RECORD!' : '💀 SHADOW FALLEN';
    if (this.modalDescription) {
      this.modalDescription.innerHTML = `
        <div class="modal-stats-card">
          <div class="modal-stat-line"><span>DISTANCE REACHED:</span> <strong>${distance.toLocaleString()}m</strong></div>
          <div class="modal-stat-line"><span>TOTAL RUN SCORE:</span> <strong>${score.toLocaleString()}</strong></div>
          <div class="modal-stat-line"><span>GEMS COLLECTED:</span> <strong>💎 ${diamonds.toLocaleString()}</strong></div>
          <div class="modal-stat-line highlight"><span>ALL-TIME RECORD:</span> <strong>${highScore.toLocaleString()}</strong></div>
        </div>
      `;
    }

    if (this.btnModalPrimary) {
      this.btnModalPrimary.textContent = '⚔️ PLAY AGAIN';
      this.primaryAction = onRestart;
    }
    if (this.btnModalRestart) {
      this.btnModalRestart.textContent = 'RETRY RUN';
      this.restartAction = onRestart;
    }
    if (this.btnModalCharSelect) {
      this.btnModalCharSelect.classList.remove('hidden');
      this.charSelectAction = onChangeChar;
    }

    if (this.modalOverlay) this.modalOverlay.classList.remove('hidden');
  }

  hideModal() {
    if (this.modalOverlay) {
      this.modalOverlay.classList.add('hidden');
    }
  }
}
