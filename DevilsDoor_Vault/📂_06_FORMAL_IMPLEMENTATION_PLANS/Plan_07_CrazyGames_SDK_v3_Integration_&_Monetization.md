# 📐 Implementation Plan 07 — CrazyGames SDK v3 Integration & Monetization

> [!INFO] ⛩️ **DEVIL'S DOOR ARCHIVAL VAULT** · `MILESTONE PLAN 07`
> **Status**: `COMPLETED` 🟢 · **Target Version**: `v2.1.0` · **Maintainer**: `Khalid Abdullah`  
> **Direct Navigation**: [[⛩️_00_MASTER_INDEX|⛩️ Master Hub]] · **Prompt Ledger**: [[Prompt_08_CrazyGames_SDK_Poki_Developer_Submission|📝 Prompt 08]] · [[Prompt_14_CrazyGames_SDK_Lifecycle_&_Midgame_Rewarded_Ads|📝 Prompt 14]]  
> **Tags**: `#project/devils-door` `#monetization` `#crazygames` `#sdk` `#v2-1`

---


## 🎯 1. Goal & Architectural Scope

Integrate the official **CrazyGames SDK v3** for web publisher compliance, including gameplay lifecycle telemetry (`gameplayStart`, `gameplayStop`), midgame ad timers (every 3 deaths), and rewarded second-chance revive video ads.

---

## 💻 2. Complete Direct Code Implementations

### 2.1 CrazyGames SDK v3 Bridge (`src/js/core/CrazyGamesSDK.js`)

```javascript
export class CrazyGamesBridge {
  constructor() {
    this.sdk = null;
    this.isAvailable = false;
    this.init();
  }

  async init() {
    if (window.CrazyGames && window.CrazyGames.SDK) {
      try {
        this.sdk = await window.CrazyGames.SDK.init();
        this.isAvailable = true;
        console.log('✅ [CrazyGames] SDK v3 Successfully Initialized');
      } catch (err) {
        console.warn('[CrazyGames] SDK failed to init, running standalone fallback', err);
      }
    } else {
      console.log('[CrazyGames] Standalone mode: Mocking SDK hooks');
    }
  }

  onGameplayStart() {
    if (this.isAvailable && this.sdk?.game) {
      this.sdk.game.gameplayStart();
    }
  }

  onGameplayStop() {
    if (this.isAvailable && this.sdk?.game) {
      this.sdk.game.gameplayStop();
    }
  }

  requestMidgameAd(onFinished) {
    if (!this.isAvailable || !this.sdk?.ad) {
      return onFinished();
    }

    const callbacks = {
      adStarted: () => { window.soundEngine?.mute(); },
      adFinished: () => { window.soundEngine?.unmute(); onFinished(); },
      adError: (error) => { console.error('[CrazyGames Ad Error]', error); onFinished(); }
    };
    this.sdk.ad.requestAd('midgame', callbacks);
  }

  requestRewardedAd(onFinished) {
    if (!this.isAvailable || !this.sdk?.ad) {
      return onFinished(true); // Mock successful reward in offline mode
    }

    const callbacks = {
      adStarted: () => { window.soundEngine?.mute(); },
      adFinished: () => { window.soundEngine?.unmute(); onFinished(true); },
      adError: (error) => { console.error('[CrazyGames Ad Error]', error); onFinished(false); }
    };
    this.sdk.ad.requestAd('rewarded', callbacks);
  }
}
```

---

### 2.2 Monetization Pacing & Revive Manager (`src/js/core/AdManager.js`)

```javascript
export class AdManager {
  constructor(crazyGamesBridge, soundEngine) {
    this.bridge = crazyGamesBridge;
    this.sound = soundEngine;
    this.deathCount = 0;
    this.adPacingThreshold = 3; // Ad every 3 deaths
  }

  handlePlayerDeath(onContinue) {
    this.deathCount++;
    this.bridge.onGameplayStop();

    if (this.deathCount % this.adPacingThreshold === 0) {
      this.bridge.requestMidgameAd(() => {
        onContinue();
      });
    } else {
      onContinue();
    }
  }

  triggerRewardedRevive(onSuccess, onFail) {
    this.bridge.requestRewardedAd((rewardEarned) => {
      if (rewardEarned) {
        onSuccess();
      } else {
        onFail();
      }
    });
  }
}
```

---

## 🧪 3. Verification & Compliance
- **CrazyGames Compliance**: Passed automatic QA sandbox verification for responsive canvas resizing, keyboard/touch lock handling, and audio mute lifecycle events.

---
*Related: [[⛩️_00_MASTER_INDEX]], [[Prompt_14_CrazyGames_SDK_Lifecycle_&_Midgame_Rewarded_Ads]]*
