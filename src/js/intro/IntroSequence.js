/**
 * IntroSequence — Cinematic 7-10 second in-game intro sequence.
 * "FROM THE CREATORS OF AUREX" -> "REACH THE DOOR. TRUST NOTHING."
 */
export class IntroSequence {
  constructor(containerId = 'intro-overlay', onComplete) {
    this.overlay = document.getElementById(containerId);
    this.skipBtn = document.getElementById('btn-skip-intro');
    this.onComplete = onComplete;

    this.line1 = document.getElementById('intro-line-1');
    this.title = document.getElementById('intro-title');
    this.line2 = document.getElementById('intro-line-2');
    this.line3 = document.getElementById('intro-line-3');
    this.line4 = document.getElementById('intro-line-4');

    this.isActive = false;
    this.elapsed = 0;
    this.totalDuration = 8.5;

    this._bindEvents();
  }

  _bindEvents() {
    if (this.skipBtn) {
      this.skipBtn.addEventListener('click', () => this.skip());
      this.skipBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        this.skip();
      });
    }
  }

  start(audio) {
    if (!this.overlay) {
      if (this.onComplete) this.onComplete();
      return;
    }

    this.isActive = true;
    this.elapsed = 0;
    this.overlay.classList.add('active');

    if (audio) {
      audio.startAmbientDrone();
    }

    // Reset element visibilities
    this._setElementVisible(this.line1, false);
    this._setElementVisible(this.title, false);
    this._setElementVisible(this.line2, false);
    this._setElementVisible(this.line3, false);
    this._setElementVisible(this.line4, false);
  }

  _setElementVisible(el, visible, opacity = 1) {
    if (!el) return;
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    el.style.opacity = visible ? opacity : 0;
    el.style.transform = visible ? 'translateY(0)' : 'translateY(8px)';
  }

  update(dt) {
    if (!this.isActive) return;

    this.elapsed += dt;

    // Timeline Progression
    if (this.elapsed >= 0.3 && this.elapsed < 2.2) {
      this._setElementVisible(this.line1, true);
    } else if (this.elapsed >= 2.2) {
      this._setElementVisible(this.line1, false, 0.4);
    }

    if (this.elapsed >= 2.0) {
      this._setElementVisible(this.title, true);
    }

    if (this.elapsed >= 3.8) {
      this._setElementVisible(this.line2, true);
    }

    if (this.elapsed >= 4.8) {
      this._setElementVisible(this.line3, true);
    }

    if (this.elapsed >= 6.2) {
      this._setElementVisible(this.line4, true);
    }

    if (this.elapsed >= this.totalDuration) {
      this.finish();
    }
  }

  skip() {
    if (!this.isActive) return;
    this.finish();
  }

  finish() {
    this.isActive = false;
    if (this.overlay) {
      this.overlay.classList.remove('active');
    }
    if (this.onComplete) {
      this.onComplete();
    }
  }
}
