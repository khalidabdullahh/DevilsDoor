# 📝 Prompt 14: CrazyGames SDK Lifecycle & Midgame/Rewarded Ads

> **Vault Hub**: [[⛩️_00_MASTER_INDEX]]  
> **Previous**: [[Prompt_13_In_Game_Shinobi_Quick_Switcher_&_HUD_Overlay]]  
> **Next**: [[Prompt_15_Standalone_Offline_Bundle_Packaging_&_ZIP_Archiving]]

---

## 🗣️ User Prompt & Requirement Statement

> [!QUOTE] **Founder's Directive:**  
> "Integrate monetization using the CrazyGames SDK v3 without ruining the player experience: Trigger non-intrusive midgame ads only after every 3 consecutive deaths or on 1,000m milestones, and implement rewarded video ads that allow players a second-chance instant revive."

---

## 💻 Step-by-Step Implementation (`src/js/core/AdManager.js`)

```javascript
export class AdManager {
  constructor(crazyGamesBridge, soundEngine) {
    this.bridge = crazyGamesBridge;
    this.sound = soundEngine;
    this.deathCounter = 0;
  }

  onPlayerDeath(onReviveOrContinue) {
    this.deathCounter++;
    if (this.deathCounter % 3 === 0) {
      this.sound.mute();
      this.bridge.requestMidgameAd(() => {
        this.sound.unmute();
        onReviveOrContinue();
      });
    } else {
      onReviveOrContinue();
    }
  }

  requestRewardedRevive(onSuccess, onCancel) {
    this.sound.mute();
    this.bridge.requestRewardedAd((completed) => {
      this.sound.unmute();
      if (completed) {
        onSuccess();
      } else {
        onCancel();
      }
    });
  }
}
```

---
*Related: [[⛩️_00_MASTER_INDEX]], [[Prompt_08_CrazyGames_SDK_Poki_Developer_Submission]]*
