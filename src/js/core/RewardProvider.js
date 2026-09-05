/**
 * RewardProvider — Rewarded Video Ad & Bonus Points Abstraction for Devil's Door v2.2.
 * Supports:
 * 1. MockRewardProvider (Web, Development & Fallback)
 * 2. CrazyGamesRewardProvider (Production Portal SDK)
 * 3. Cooldown Countdown & Random 5-20 Points generation
 */
export class RewardProvider {
  constructor(economyManager, cooldownDurationSeconds = 90) {
    this.economy = economyManager;
    this.cooldownSeconds = cooldownDurationSeconds;
    this.STORAGE_KEY_COOLDOWN = 'devils_door_reward_cooldown_expiry';
  }

  /**
   * Check if reward is off cooldown
   */
  isAvailable() {
    return this.getRemainingCooldownSeconds() <= 0;
  }

  /**
   * Seconds remaining until next reward opportunity
   */
  getRemainingCooldownSeconds() {
    if (typeof localStorage === 'undefined') return 0;
    const expiry = parseInt(localStorage.getItem(this.STORAGE_KEY_COOLDOWN) || '0', 10);
    const now = Date.now();
    if (expiry <= now) return 0;
    return Math.ceil((expiry - now) / 1000);
  }

  /**
   * Format remaining time as MM:SS
   */
  getFormattedRemainingTime() {
    const s = this.getRemainingCooldownSeconds();
    if (s <= 0) return 'READY';
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  _startCooldown() {
    if (typeof localStorage === 'undefined') return;
    const expiry = Date.now() + this.cooldownSeconds * 1000;
    localStorage.setItem(this.STORAGE_KEY_COOLDOWN, String(expiry));
  }

  /**
   * Generate random 5-20 points reward
   */
  _generateRandomReward() {
    return Math.floor(Math.random() * 16) + 5; // 5 to 20 inclusive
  }

  /**
   * Request and watch rewarded ad
   */
  async showRewardedAd() {
    if (!this.isAvailable()) {
      return {
        success: false,
        reason: 'cooldown_active',
        remainingSeconds: this.getRemainingCooldownSeconds()
      };
    }

    // Check if CrazyGames SDK is active
    if (typeof window !== 'undefined' && window.CrazyGames && window.CrazyGames.SDK && window.CrazyGames.SDK.ad) {
      return this._showCrazyGamesAd();
    }

    // Fallback: Mock Provider with brief realistic simulation
    return this._showMockAd();
  }

  async _showCrazyGamesAd() {
    return new Promise((resolve) => {
      try {
        const callbacks = {
          adStarted: () => {
            console.log('[RewardProvider] CrazyGames rewarded ad started');
          },
          adFinished: () => {
            const points = this._generateRandomReward();
            this.economy.addPoints(points, 'rewarded_ad_crazygames');
            this._startCooldown();
            resolve({ success: true, pointsEarned: points });
          },
          adError: (error) => {
            console.warn('[RewardProvider] CrazyGames ad error, falling back to instant reward:', error);
            const points = this._generateRandomReward();
            this.economy.addPoints(points, 'rewarded_ad_fallback');
            this._startCooldown();
            resolve({ success: true, pointsEarned: points });
          }
        };

        window.CrazyGames.SDK.ad.requestAd('rewarded', callbacks);
      } catch (err) {
        console.error('[RewardProvider] Ad request exception:', err);
        const points = this._generateRandomReward();
        this.economy.addPoints(points, 'rewarded_ad_fallback');
        this._startCooldown();
        resolve({ success: true, pointsEarned: points });
      }
    });
  }

  async _showMockAd() {
    return new Promise((resolve) => {
      // Simulate 1.2s smooth ad view simulation
      setTimeout(() => {
        const points = this._generateRandomReward();
        this.economy.addPoints(points, 'rewarded_ad_mock');
        this._startCooldown();
        resolve({ success: true, pointsEarned: points });
      }, 1000);
    });
  }
}
