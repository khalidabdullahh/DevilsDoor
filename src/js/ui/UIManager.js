import { AnalyticsManager } from '../core/AnalyticsManager.js';

/**
 * UIManager — Manages HUD elements, health hearts, death counters, campaign modals,
 * and rewarded ad level-skip popups.
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

    this.loadingOverlay = document.getElementById('loading-overlay');
    this.rotateOverlay = document.getElementById('rotate-overlay');

    this._bindEvents();
    this._initOrientationWatcher();
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
        else if (this.game) this.game.restartLevel();
      });
    }

    if (this.btnModalHome) {
      this.btnModalHome.addEventListener('click', () => {
        window.location.href = '/';
      });
    }
  }

  _initOrientationWatcher() {
    const checkOrientation = () => {
      const isPortrait = window.innerHeight > window.innerWidth && window.innerWidth < 768;
      if (this.rotateOverlay) {
        if (isPortrait) {
          this.rotateOverlay.classList.remove('hidden');
          if (this.game && !this.game.isPaused) {
            this.game.setPaused(true);
            this._wasPausedByOrientation = true;
          }
        } else {
          this.rotateOverlay.classList.add('hidden');
          if (this.game && this._wasPausedByOrientation) {
            this.game.setPaused(false);
            this._wasPausedByOrientation = false;
          }
        }
      }
    };

    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);
    checkOrientation();
  }

  hideLoading() {
    if (this.loadingOverlay) {
      this.loadingOverlay.classList.add('fade-out');
      setTimeout(() => {
        this.loadingOverlay.classList.add('hidden');
      }, 350);
    }
  }

  updateHUD(levelIndex, totalLevels, title, deaths, health = 3, maxHealth = 3) {
    if (this.levelDisplay) {
      const pad = String(levelIndex).padStart(2, '0');
      this.levelDisplay.textContent = `LEVEL ${pad}/${totalLevels}`;
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
    this.btnModalRestart.textContent = 'RESTART LEVEL';
    this.btnModalRestart.classList.remove('hidden');
    this.restartAction = null;
    this.primaryAction = () => {
      if (this.game) this.game.setPaused(false);
    };
    this.modalOverlay.classList.remove('hidden');
  }

  showVictoryModal(levelIndex, totalLevels, totalDeaths, stars, onNext) {
    if (this.game) this.game.setPaused(true);

    const pad = String(levelIndex).padStart(2, '0');
    let starStr = '⭐'.repeat(stars);

    if (levelIndex >= totalLevels) {
      this.modalTitle.textContent = '👑 CAMPAIGN CONQUERED!';
      this.modalDescription.textContent = `You reached the Final Devil's Door and defeated the Demonic Oni! Total deaths: ${totalDeaths}. Rating: ${starStr}`;
      this.btnModalPrimary.textContent = 'PLAY AGAIN';
    } else {
      this.modalTitle.textContent = `LEVEL ${pad} CONQUERED!`;
      this.modalDescription.textContent = `You ascended through the Runic Shrine with ${totalDeaths} deaths. Rating: ${starStr}`;
      this.btnModalPrimary.textContent = 'NEXT LEVEL ➔';
    }

    this.btnModalRestart.textContent = 'RESTART LEVEL';
    this.btnModalRestart.classList.remove('hidden');
    this.restartAction = null;
    this.primaryAction = onNext;
    this.modalOverlay.classList.remove('hidden');
  }

  showRewardedSkipModal(levelIndex, onWatch, onDecline) {
    if (this.game) this.game.setPaused(true);
    AnalyticsManager.track('rewarded_ad_offer', { levelId: levelIndex });

    this.modalTitle.textContent = 'TOO MANY DEATHS?';
    this.modalDescription.textContent = 'Stuck on this deceptive path? Watch a short 5-second ad to unlock and skip to the next level!';
    this.btnModalPrimary.textContent = 'WATCH & SKIP';
    this.btnModalRestart.textContent = 'NO THANKS';
    this.btnModalRestart.classList.remove('hidden');

    this.primaryAction = onWatch;
    this.restartAction = () => {
      if (this.game) this.game.setPaused(false);
      if (onDecline) onDecline();
    };

    this.modalOverlay.classList.remove('hidden');
  }

  hideModal() {
    if (this.modalOverlay) {
      this.modalOverlay.classList.add('hidden');
    }
  }
}
