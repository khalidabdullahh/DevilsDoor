---
title: "Prompt 08: CrazyGames SDK & Poki Developer Submission"
aliases: ["Prompt 08", "Publisher Submission"]
tags:
  - prompt-log
  - publisher
  - crazygames
  - poki
  - project/devils-door
created: 2026-09-04
status: completed
---

# 📝 Prompt 08: CrazyGames SDK Integration, Standalone Bundle & Poki Submission

> **Vault Hub**: [[⛩️_00_MASTER_INDEX]]  
> **Previous**: [[Prompt_07_Landing_Page_to_Character_Select_Navigation_Flow]]  
> **Next**: [[Prompt_09_Dual_Licensing_IP_Protection_&_Commercial_Rights]]

---

## 🗣️ User Prompt & Requirement Statement

> [!QUOTE] **Founder's Directive:**  
> "Prepare Devil's Door for official developer submission to major web game publishing platforms (CrazyGames and Poki). Package an optimized standalone build bundle (`devils-door-crazygames.zip`), implement the CrazyGames SDK v3 hooks for ad breaks and gameplay lifecycle telemetry, generate standard marketing cover graphics (16:9, 2:3, 1:1), and submit for publisher review."

---

## 🧠 Technical Analysis & Publisher Requirements

1. **CrazyGames SDK v3 Integration**:
   - `window.CrazyGames.SDK.game.gameplayStart()` called on level/run start.
   - `window.CrazyGames.SDK.game.gameplayStop()` called on pause or death.
   - `window.CrazyGames.SDK.ad.requestAd('midgame')` called on milestone runs.
   - `window.CrazyGames.SDK.ad.requestAd('rewarded')` for second-chance revives.
2. **Offline Standalone Bundle**:
   - Relative path resolution (`./` instead of `/`) ensuring zero asset 404 errors inside publisher iframes.
3. **Marketing Graphic Specifications**:
   - **Landscape (16:9)**: $1920\times1080\text{px}$ (clean top-left corner for publisher badge).
   - **Portrait (2:3)**: $800\times1200\text{px}$.
   - **Square (1:1)**: $800\times800\text{px}$.

---

## 💻 Step-by-Step Implementation

### CrazyGames SDK Bridge (`src/js/core/CrazyGamesSDK.js`)

```javascript
export class CrazyGamesBridge {
  constructor() {
    this.sdk = null;
    this.init();
  }

  async init() {
    if (window.CrazyGames && window.CrazyGames.SDK) {
      try {
        this.sdk = await window.CrazyGames.SDK.init();
        console.log('[CrazyGames] SDK v3 Initialized');
      } catch (err) {
        console.warn('[CrazyGames] Running in standalone/fallback mode', err);
      }
    }
  }

  onGameplayStart() {
    if (this.sdk) this.sdk.game.gameplayStart();
  }

  onGameplayStop() {
    if (this.sdk) this.sdk.game.gameplayStop();
  }

  requestMidgameAd(onComplete) {
    if (!this.sdk) return onComplete && onComplete();
    this.sdk.ad.requestAd('midgame', {
      adStarted: () => { window.soundEngine && window.soundEngine.mute(); },
      adFinished: () => { window.soundEngine && window.soundEngine.unmute(); onComplete(); },
      adError: (error) => { console.error(error); onComplete(); }
    });
  }
}
```

---

## 🎯 Verification & Deliverables
- [x] Generated `devils-door-crazygames.zip` (16.3 MB with offline assets).
- [x] CrazyGames Submission: **Awaiting Review (Submitted Sept 4, 2026)**.
- [x] Poki Submission: **Submitted via Poki Developer Portal**.

---
*Related: [[v0.5.0_Publisher_Submission_&_Production_Release]], [[Prompt_09_Dual_Licensing_IP_Protection_&_Commercial_Rights]]*
