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
    // Fullscreen Toggle Handlers
    const btnFullscreen = document.getElementById('btn-fullscreen');
    const btnCornerFullscreen = document.getElementById('btn-corner-fullscreen');
    const btnDeckFullscreen = document.getElementById('btn-deck-fullscreen');

    const handleFullscreenToggle = () => this.toggleFullscreen();

    if (btnFullscreen) btnFullscreen.addEventListener('click', handleFullscreenToggle);
    if (btnCornerFullscreen) btnCornerFullscreen.addEventListener('click', handleFullscreenToggle);
    if (btnDeckFullscreen) btnDeckFullscreen.addEventListener('click', handleFullscreenToggle);

    const handleFsChange = () => {
      const isFs = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);
      this._updateFullscreenIcons(isFs);
      if (this.game && this.game.renderer) {
        this.game.renderer.resize();
        if (typeof requestAnimationFrame !== 'undefined') {
          requestAnimationFrame(() => this.game?.renderer?.resize());
        }
      }
    };

    document.addEventListener('fullscreenchange', handleFsChange);
    document.addEventListener('webkitfullscreenchange', handleFsChange);
    document.addEventListener('mozfullscreenchange', handleFsChange);
    document.addEventListener('MSFullscreenChange', handleFsChange);

    // Keyboard shortcut for Fullscreen (KeyF)
    window.addEventListener('keydown', (e) => {
      if (e.code === 'KeyF' && !e.repeat && e.target.tagName !== 'INPUT') {
        this.toggleFullscreen();
      }
    });

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

    // Audio Toggles (HUD, Deck, Floating Console Button)
    const btnDeckAudio = document.getElementById('btn-deck-audio');
    const btnFloatingAudio = document.getElementById('touch-floating-audio');

    const toggleAudioAll = () => {
      if (this.game && this.game.audio) {
        const isMuted = this.game.audio.toggleMute();
        if (btnDeckAudio) {
          btnDeckAudio.textContent = isMuted ? '🔇 MUTED' : '🔊 AUDIO';
        }
        if (this.audioIcon) {
          this.audioIcon.classList.toggle('muted', isMuted);
        }
        if (btnFloatingAudio) {
          const muteSlash = btnFloatingAudio.querySelector('.mute-slash');
          const wave1 = btnFloatingAudio.querySelector('.sound-wave-1');
          const wave2 = btnFloatingAudio.querySelector('.sound-wave-2');
          if (muteSlash) muteSlash.style.display = isMuted ? 'block' : 'none';
          if (wave1) wave1.style.display = isMuted ? 'none' : 'block';
          if (wave2) wave2.style.display = isMuted ? 'none' : 'block';
        }
      }
    };

    if (btnDeckAudio) btnDeckAudio.addEventListener('click', toggleAudioAll);
    if (this.btnAudio) this.btnAudio.addEventListener('click', toggleAudioAll);
    if (btnFloatingAudio) {
      btnFloatingAudio.addEventListener('click', (e) => {
        if (e.cancelable) e.preventDefault();
        toggleAudioAll();
      });
      btnFloatingAudio.addEventListener('touchstart', (e) => {
        if (e.cancelable) e.preventDefault();
        toggleAudioAll();
      }, { passive: false });
    }

    const btnDeckRestart = document.getElementById('btn-deck-restart');
    if (btnDeckRestart) {
      btnDeckRestart.addEventListener('click', () => {
        if (this.game) this.game.restartGame();
      });
    }

    const btnDeckSceneSelect = document.getElementById('btn-deck-sceneselect');
    if (btnDeckSceneSelect) {
      btnDeckSceneSelect.addEventListener('click', () => {
        if (this.game) this.game.openSceneSelect();
      });
    }

    const btnDeckSettings = document.getElementById('btn-deck-settings');
    if (btnDeckSettings) {
      btnDeckSettings.addEventListener('click', () => {
        if (this.game) this.game.openSettings();
      });
    }

    const btnDeckMenu = document.getElementById('btn-deck-menu');
    if (btnDeckMenu) {
      btnDeckMenu.addEventListener('click', () => this.showPauseModal());
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

  toggleFullscreen() {
    const doc = typeof document !== 'undefined' ? document : null;
    if (!doc) return;
    const docEl = doc.documentElement;
    const isFs = !!(doc.fullscreenElement || doc.webkitFullscreenElement || doc.mozFullScreenElement || doc.msFullscreenElement);

    if (!isFs) {
      if (docEl.requestFullscreen) {
        docEl.requestFullscreen().catch(() => {});
      } else if (docEl.webkitRequestFullscreen) {
        docEl.webkitRequestFullscreen();
      } else if (docEl.mozRequestFullScreen) {
        docEl.mozRequestFullScreen();
      } else if (docEl.msRequestFullscreen) {
        docEl.msRequestFullscreen();
      }
    } else {
      if (doc.exitFullscreen) {
        doc.exitFullscreen().catch(() => {});
      } else if (doc.webkitExitFullscreen) {
        doc.webkitExitFullscreen();
      } else if (doc.mozCancelFullScreen) {
        doc.mozCancelFullScreen();
      } else if (doc.msExitFullscreen) {
        doc.msExitFullscreen();
      }
    }
  }

  _updateFullscreenIcons(isFullscreen) {
    const enterPaths = document.querySelectorAll('.icon-fs-enter');
    const exitPaths = document.querySelectorAll('.icon-fs-exit');
    enterPaths.forEach((p) => { p.style.display = isFullscreen ? 'none' : 'block'; });
    exitPaths.forEach((p) => { p.style.display = isFullscreen ? 'block' : 'none'; });

    const btnDeckFs = document.getElementById('btn-deck-fullscreen');
    if (btnDeckFs) {
      btnDeckFs.textContent = isFullscreen ? '🗗 EXIT' : '⛶ FULL';
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
    const deckRealm = document.getElementById('deck-realm-name');
    if (deckRealm) {
      const names = {
        sunset_torii: 'SUNSET SANCTUARY',
        moonlight_ruins: 'MOONLIGHT CITADEL',
        scythe_chasm: 'SHADOW SCYTHE GROVE',
        crystal_abyss: 'RUBY CRYSTAL ABYSS'
      };
      deckRealm.textContent = `DEVIL'S DOOR ⚡ ${names[biome] || '4K REALM'}`;
    }

    let dotsHtml = '';
    for (let i = 0; i < maxHealth; i++) {
      const isActive = i < health;
      dotsHtml += `
        <div class="vitality-dot ${isActive ? 'active' : 'depleted'}" title="Health: ${health}/${maxHealth}">
          <span class="dot-core"></span>
        </div>
      `;
    }

    const healthBars = document.querySelectorAll('.hud-health-bar');
    healthBars.forEach((el) => {
      el.innerHTML = dotsHtml;
    });
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
