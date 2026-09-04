/**
 * SettingsModal — Player Customization & Controls Configuration System.
 * Manages player preferences:
 * - Controls Layout (Standard vs Inverted)
 * - Touch Button Scale (Compact / Normal / Large)
 * - Movement Sensitivity (Standard vs Turbo)
 * - Sound FX & Music toggles
 * - Screen Shake FX toggle
 */
export class SettingsModal {
  constructor(game, touchControls, audioManager) {
    this.game = game;
    this.touchControls = touchControls;
    this.audioManager = audioManager;

    this.settings = this._loadSettings();
    this.modalEl = document.getElementById('settings-modal');

    this._initDOM();
    this._attachListeners();
    this.applySettings();
  }

  _loadSettings() {
    const saved = localStorage.getItem('devilsdoor_player_settings');
    const defaults = {
      layout: 'standard', // 'standard' or 'inverted'
      scale: 'normal',    // 'compact', 'normal', 'large'
      speed: 'standard',  // 'standard' or 'turbo'
      sfx: true,
      music: true,
      shake: true
    };
    if (saved) {
      try {
        return { ...defaults, ...JSON.parse(saved) };
      } catch (e) {
        return defaults;
      }
    }
    return defaults;
  }

  _saveSettings() {
    localStorage.setItem('devilsdoor_player_settings', JSON.stringify(this.settings));
  }

  _initDOM() {
    if (!this.modalEl) return;
    this.modalEl.innerHTML = `
      <div class="settings-card">
        <div class="settings-header">
          <div class="settings-brand">
            <span class="settings-icon">⚙️</span>
            <h2 class="settings-title">GAMEPLAY & CONTROLS</h2>
          </div>
          <button id="btn-close-settings" class="btn-close-settings" aria-label="Close Settings">✕</button>
        </div>

        <div class="settings-body">
          <!-- 1. Controls Layout -->
          <div class="setting-row">
            <div class="setting-info">
              <span class="setting-label">TOUCH CONTROLS LAYOUT</span>
              <span class="setting-desc">D-Pad and Action button orientation</span>
            </div>
            <div class="setting-toggle-group">
              <button class="toggle-pill ${this.settings.layout === 'standard' ? 'active' : ''}" data-setting="layout" data-val="standard">STANDARD</button>
              <button class="toggle-pill ${this.settings.layout === 'inverted' ? 'active' : ''}" data-setting="layout" data-val="inverted">INVERTED</button>
            </div>
          </div>

          <!-- 2. Button Size Scale -->
          <div class="setting-row">
            <div class="setting-info">
              <span class="setting-label">BUTTON SIZE SCALE</span>
              <span class="setting-desc">Adjust touch thumb-zone hitboxes</span>
            </div>
            <div class="setting-toggle-group">
              <button class="toggle-pill ${this.settings.scale === 'compact' ? 'active' : ''}" data-setting="scale" data-val="compact">85%</button>
              <button class="toggle-pill ${this.settings.scale === 'normal' ? 'active' : ''}" data-setting="scale" data-val="normal">100%</button>
              <button class="toggle-pill ${this.settings.scale === 'large' ? 'active' : ''}" data-setting="scale" data-val="large">125%</button>
            </div>
          </div>

          <!-- 3. Movement Sensitivity -->
          <div class="setting-row">
            <div class="setting-info">
              <span class="setting-label">SHINOBI SPRINT SPEED</span>
              <span class="setting-desc">Base ground movement velocity</span>
            </div>
            <div class="setting-toggle-group">
              <button class="toggle-pill ${this.settings.speed === 'standard' ? 'active' : ''}" data-setting="speed" data-val="standard">STANDARD</button>
              <button class="toggle-pill ${this.settings.speed === 'turbo' ? 'active' : ''}" data-setting="speed" data-val="turbo">TURBO (+25%)</button>
            </div>
          </div>

          <!-- 4. Sound FX -->
          <div class="setting-row">
            <div class="setting-info">
              <span class="setting-label">SOUND EFFECTS (SFX)</span>
              <span class="setting-desc">Katana slashes, jumps & shuriken impacts</span>
            </div>
            <button class="toggle-switch ${this.settings.sfx ? 'on' : 'off'}" data-toggle="sfx">
              <span class="switch-handle"></span>
            </button>
          </div>

          <!-- 5. Ambient Music -->
          <div class="setting-row">
            <div class="setting-info">
              <span class="setting-label">DARK AMBIENT DRONE</span>
              <span class="setting-desc">Background atmospheric synthesizer</span>
            </div>
            <button class="toggle-switch ${this.settings.music ? 'on' : 'off'}" data-toggle="music">
              <span class="switch-handle"></span>
            </button>
          </div>

          <!-- 6. Screen Shake FX -->
          <div class="setting-row">
            <div class="setting-info">
              <span class="setting-label">SCREEN SHAKE EFFECTS</span>
              <span class="setting-desc">Camera shake on slash & impact</span>
            </div>
            <button class="toggle-switch ${this.settings.shake ? 'on' : 'off'}" data-toggle="shake">
              <span class="switch-handle"></span>
            </button>
          </div>
        </div>

        <div class="settings-footer">
          <button id="btn-save-settings" class="btn-save-settings">✓ SAVE & APPLY</button>
        </div>
      </div>
    `;
  }

  _attachListeners() {
    if (!this.modalEl) return;

    // Close button
    const btnClose = this.modalEl.querySelector('#btn-close-settings');
    const btnSave = this.modalEl.querySelector('#btn-save-settings');
    if (btnClose) btnClose.addEventListener('click', () => this.hide());
    if (btnSave) btnSave.addEventListener('click', () => this.hide());

    // Pills
    const pills = this.modalEl.querySelectorAll('.toggle-pill');
    pills.forEach((p) => {
      p.addEventListener('click', () => {
        const setting = p.getAttribute('data-setting');
        const val = p.getAttribute('data-val');
        this.settings[setting] = val;

        const siblings = this.modalEl.querySelectorAll(`.toggle-pill[data-setting="${setting}"]`);
        siblings.forEach(s => s.classList.remove('active'));
        p.classList.add('active');

        this.applySettings();
      });
    });

    // Switches
    const switches = this.modalEl.querySelectorAll('.toggle-switch');
    switches.forEach((sw) => {
      sw.addEventListener('click', () => {
        const key = sw.getAttribute('data-toggle');
        this.settings[key] = !this.settings[key];
        sw.classList.toggle('on', this.settings[key]);
        sw.classList.toggle('off', !this.settings[key]);
        this.applySettings();
      });
    });
  }

  applySettings() {
    this._saveSettings();

    // 1. Touch Controls Layout & Scale
    if (this.touchControls) {
      this.touchControls.setLayout(this.settings.layout === 'inverted');
      this.touchControls.setScale(this.settings.scale);
    }

    // 2. Player Speed
    if (this.game && this.game.player) {
      const baseSpeed = 330;
      this.game.player.moveSpeed = this.settings.speed === 'turbo' ? baseSpeed * 1.25 : baseSpeed;
    }

    // 3. Audio Toggles
    if (this.audioManager) {
      this.audioManager.isMuted = !this.settings.sfx;
      if (!this.settings.music && this.audioManager.ambientOsc) {
        this.audioManager.stopAmbientDrone();
      } else if (this.settings.music && !this.audioManager.ambientOsc) {
        this.audioManager.startAmbientDrone();
      }
    }

    // 4. Camera Shake
    if (this.game && this.game.camera) {
      this.game.camera.enableShake = this.settings.shake;
    }
  }

  show() {
    if (this.modalEl) {
      this.modalEl.classList.remove('hidden');
      if (this.game) this.game.setPaused(true);
    }
  }

  hide() {
    if (this.modalEl) {
      this.modalEl.classList.add('hidden');
      if (this.game && !this.game.isInSceneSelect) {
        this.game.setPaused(false);
      }
    }
  }
}
