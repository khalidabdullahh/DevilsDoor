import { AnalyticsManager } from '../core/AnalyticsManager.js';

/**
 * UIManager — Manages HUD elements, meters, score, diamonds, high score,
 * and game over modal for Devil's Door v2.0 Endless Platformer.
 */
export class UIManager {
  constructor(game) {
    this.game = game;

    this.distanceDisplay = document.getElementById('distance-display');
    this.diamondsDisplay = document.getElementById('diamonds-display');
    this.scoreDisplay = document.getElementById('score-display');
    this.highScoreDisplay = document.getElementById('highscore-display');
    this.biomeDisplay = document.getElementById('biome-display');
    this.healthDisplay = document.getElementById('health-display');

    this.btnRestart = document.getElementById('btn-restart');
    this.btnAudio = document.getElementById('btn-audio');
    this.btnMenu = document.getElementById('btn-menu');

    this.modalOverlay = document.getElementById('modal-overlay');
    this.modalTitle = document.getElementById('modal-title');
    this.modalDescription = document.getElementById('modal-description');
    this.btnModalPrimary = document.getElementById('btn-modal-primary');
    this.btnModalRestart = document.getElementById('btn-modal-restart');
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

  updateEndlessHUD(distance, score, diamonds, highScore, health = 3, maxHealth = 3, biome = 'sunset') {
    if (this.distanceDisplay) {
      this.distanceDisplay.textContent = `${distance.toLocaleString()}m`;
    }
    if (this.diamondsDisplay) {
      this.diamondsDisplay.textContent = `${diamonds}`;
    }
    if (this.scoreDisplay) {
      this.scoreDisplay.textContent = score.toLocaleString();
    }
    if (this.highScoreDisplay) {
      this.highScoreDisplay.textContent = `BEST: ${highScore.toLocaleString()}`;
    }
    if (this.biomeDisplay) {
      const biomeLabels = {
        sunset: '🌅 SUNSET FORTRESS',
        snow: '❄️ FROZEN ABYSS',
        bamboo: '🎋 BAMBOO GROVE',
        thorns: '🩸 DEMONIC CRYPT',
        waterfall: '🌫️ SKY WATERFALL'
      };
      this.biomeDisplay.textContent = biomeLabels[biome] || 'DEVIL\'S DESCENT';
    }
    if (this.healthDisplay) {
      let hearts = '';
      for (let i = 0; i < maxHealth; i++) {
        hearts += i < health ? '❤️ ' : '🖤 ';
      }
      this.healthDisplay.textContent = hearts.trim();
    }
  }

  showPauseModal() {
    if (this.game) this.game.setPaused(true);
    this.modalTitle.textContent = 'PAUSED';
    this.modalDescription.textContent = 'Take breath, shinobi. The endless descent awaits your blade.';
    this.btnModalPrimary.textContent = 'RESUME';
    this.btnModalRestart.textContent = 'RESTART RUN';
    this.btnModalRestart.classList.remove('hidden');
    this.restartAction = () => {
      if (this.game) this.game.restartGame();
    };
    this.primaryAction = () => {
      if (this.game) this.game.setPaused(false);
    };
    this.modalOverlay.classList.remove('hidden');
  }

  showGameOverModal(distance, score, diamonds, highScore, onRestart) {
    if (this.game) this.game.setPaused(true);

    const isNewHigh = score >= highScore && score > 0;
    this.modalTitle.textContent = isNewHigh ? '🏆 NEW RECORD!' : '💀 SHADOW FALLEN';
    this.modalDescription.innerHTML = `
      <div style="display: flex; justify-content: space-around; margin: 16px 0; font-size: 1.15rem; font-weight: 800;">
        <div><span>📏 Distance:</span> <strong style="color: #38bdf8;">${distance.toLocaleString()}m</strong></div>
        <div><span>💎 Gems:</span> <strong style="color: #fbbf24;">${diamonds}</strong></div>
      </div>
      <div style="font-size: 1.3rem; font-weight: 900; color: #f8fafc; margin-bottom: 8px;">Score: ${score.toLocaleString()}</div>
      <div style="font-size: 0.95rem; color: #94a3b8;">All-Time Best: ${highScore.toLocaleString()}</div>
    `;

    this.btnModalPrimary.textContent = 'PLAY AGAIN ➔';
    this.btnModalRestart.classList.add('hidden');
    this.primaryAction = onRestart;
    this.modalOverlay.classList.remove('hidden');
  }

  hideModal() {
    if (this.modalOverlay) {
      this.modalOverlay.classList.add('hidden');
    }
  }
}
