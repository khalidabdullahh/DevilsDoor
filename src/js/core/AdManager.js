import { AnalyticsManager } from './AnalyticsManager.js';

/**
 * AdManager — Provider-Agnostic Monetization & Rewarded Ad System.
 * Fully isolated from physics, combat, audio, and player update loops.
 */
export class AdManager {
  constructor(game) {
    this.game = game;
    this.isAdShowing = false;
    this.rewardedOfferShown = false;
    this.offerCooldown = 0;

    this.adOverlay = document.getElementById('ad-overlay');
    this.adTimerEl = document.getElementById('ad-timer');
    this.adCloseBtn = document.getElementById('btn-ad-close');
    this.adProgressBar = document.getElementById('ad-progress-fill');

    this._bindEvents();
  }

  _bindEvents() {
    if (this.adCloseBtn) {
      this.adCloseBtn.addEventListener('click', () => {
        if (this.currentRewardCallback) {
          const cb = this.currentRewardCallback;
          this.currentRewardCallback = null;
          this._closeAd();
          cb(true); // Verified reward granted
        } else {
          this._closeAd();
        }
      });
    }
  }

  isRewardedAdReady() {
    return true; // Readily available simulated / provider-ready
  }

  showRewardedAd(onSuccess, onFailure) {
    if (this.isAdShowing) {
      if (onFailure) onFailure('Ad already in progress');
      return;
    }

    this.isAdShowing = true;
    this.currentRewardCallback = onSuccess;

    if (this.game) {
      this.game.setPaused(true);
    }

    AnalyticsManager.track('rewarded_ad_started', {
      levelId: this.game ? this.game.currentLevelIndex : 1
    });

    if (this.adOverlay) {
      this.adOverlay.classList.remove('hidden');
      this._runAdCountdown(5, () => {
        // Countdown completed
        if (this.adCloseBtn) {
          this.adCloseBtn.classList.remove('hidden');
        }
      });
    } else {
      // Fallback if ad overlay markup isn't present
      setTimeout(() => {
        this._closeAd();
        if (onSuccess) onSuccess(true);
      }, 2000);
    }
  }

  _runAdCountdown(durationSeconds, onComplete) {
    let timeLeft = durationSeconds;
    if (this.adTimerEl) this.adTimerEl.textContent = `Reward in ${timeLeft}s`;
    if (this.adCloseBtn) this.adCloseBtn.classList.add('hidden');
    if (this.adProgressBar) this.adProgressBar.style.width = '0%';

    const startTime = performance.now();
    const totalMs = durationSeconds * 1000;

    const interval = setInterval(() => {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(100, (elapsed / totalMs) * 100);

      if (this.adProgressBar) {
        this.adProgressBar.style.width = `${progress}%`;
      }

      const remaining = Math.max(0, Math.ceil((totalMs - elapsed) / 1000));
      if (this.adTimerEl) {
        this.adTimerEl.textContent = remaining > 0 ? `Reward in ${remaining}s` : 'Reward Unlocked!';
      }

      if (elapsed >= totalMs) {
        clearInterval(interval);
        if (onComplete) onComplete();
      }
    }, 100);
  }

  _closeAd() {
    this.isAdShowing = false;
    if (this.adOverlay) {
      this.adOverlay.classList.add('hidden');
    }
    if (this.game) {
      this.game.setPaused(false);
    }
    AnalyticsManager.track('rewarded_ad_completed', {
      levelId: this.game ? this.game.currentLevelIndex : 1
    });
  }
}
