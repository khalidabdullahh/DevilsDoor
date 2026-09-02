/**
 * UIManager — Manages HUD elements, health hearts, death counters, and modals.
 */
export class UIManager {
  constructor(game) {
    this.game = game;

    this.levelDisplay = document.getElementById('level-display');
    this.levelTitle = document.getElementById('level-title');
    this.deathCount = document.getElementById('death-count');
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

    this._bindEvents();
  }

  _bindEvents() {
    if (this.btnRestart) {
      this.btnRestart.addEventListener('click', () => {
        if (this.game) this.game.restartLevel();
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
        if (this.primaryAction) this.primaryAction();
        this.hideModal();
      });
    }

    if (this.btnModalRestart) {
      this.btnModalRestart.addEventListener('click', () => {
        this.hideModal();
        if (this.game) this.game.restartLevel();
      });
    }

    if (this.btnModalHome) {
      this.btnModalHome.addEventListener('click', () => {
        window.location.href = '/';
      });
    }
  }

  updateHUD(levelIndex, totalLevels, title, deaths, health = 3, maxHealth = 3) {
    if (this.levelDisplay) {
      const pad = String(levelIndex).padStart(2, '0');
      this.levelDisplay.textContent = `LEVEL ${pad}`;
    }
    if (this.levelTitle) {
      this.levelTitle.textContent = title;
    }
    if (this.deathCount) {
      this.deathCount.textContent = String(deaths);
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
    this.modalDescription.textContent = 'Trust nothing. The obvious path is rarely the true route.';
    this.btnModalPrimary.textContent = 'RESUME';
    this.primaryAction = () => {
      if (this.game) this.game.setPaused(false);
    };
    this.modalOverlay.classList.remove('hidden');
  }

  showVictoryModal(totalDeaths, onNext) {
    if (this.game) this.game.setPaused(true);
    this.modalTitle.textContent = 'LEVEL 01 CONQUERED';
    this.modalDescription.textContent = `You uncovered the deception of The First Assumption with ${totalDeaths} deaths and mastered the 3D Ninja combat. Level 02 awaits in production!`;
    this.btnModalPrimary.textContent = 'PLAY AGAIN';
    this.primaryAction = onNext;
    this.modalOverlay.classList.remove('hidden');
  }

  hideModal() {
    if (this.modalOverlay) {
      this.modalOverlay.classList.add('hidden');
    }
  }
}
