/**
 * UIManager — Manages HUD state, level headers, death counts, and modals.
 */
export class UIManager {
  constructor(game) {
    this.game = game;

    this.levelDisplay = document.getElementById('level-display');
    this.levelTitle = document.getElementById('level-title');
    this.deathCount = document.getElementById('death-count');
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
      this.btnRestart.addEventListener('click', () => this.game.restartLevel());
    }

    if (this.btnAudio) {
      this.btnAudio.addEventListener('click', () => {
        const isMuted = this.game.audio.toggleMute();
        this.btnAudio.textContent = isMuted ? '🔇' : '🔊';
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
        this.game.restartLevel();
      });
    }

    if (this.btnModalHome) {
      this.btnModalHome.addEventListener('click', () => {
        window.location.href = '../website/index.html';
      });
    }
  }

  updateHUD(levelIndex, totalLevels, title, deaths) {
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
  }

  showPauseModal() {
    this.game.setPaused(true);
    this.modalTitle.textContent = 'PAUSED';
    this.modalDescription.textContent = 'Take a breath. Remember: every death teaches something.';
    this.btnModalPrimary.textContent = 'RESUME';
    this.primaryAction = () => this.game.setPaused(false);
    this.modalOverlay.classList.remove('hidden');
  }

  showVictoryModal(totalDeaths, onNext) {
    this.game.setPaused(true);
    this.modalTitle.textContent = 'THE DOMAIN CONQUERED';
    this.modalDescription.textContent = `You uncovered every deception across 5 Prototype Levels with ${totalDeaths} deaths. But the Shadow Devil is never truly defeated.`;
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
