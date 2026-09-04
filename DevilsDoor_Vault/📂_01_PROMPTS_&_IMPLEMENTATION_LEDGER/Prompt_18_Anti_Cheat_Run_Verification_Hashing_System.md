# 📝 Prompt 18: Anti-Cheat Run Verification Hashing System

> **Vault Hub**: [[⛩️_00_MASTER_INDEX]]  
> **Previous**: [[Prompt_17_Poki_Developer_Portal_Submission_&_Curation]]  
> **Next**: [[Prompt_19_Client_Save_State_Engine_&_Version_Migration]]

---

## 🗣️ User Prompt & Requirement Statement

> [!QUOTE] **Founder's Directive:**  
> "When we open up global leaderboards, players will try to inspect developer tools and send fake POST requests claiming they ran 1,000,000 meters. Implement a cryptographic run verification algorithm that validates speed caps and generates an HMAC signature before accepting high scores."

---

## 💻 Step-by-Step Implementation (`src/js/core/AntiCheat.js`)

```javascript
export class AntiCheat {
  static generateRunSignature(distance, timeElapsed, kills, heroId, secret) {
    const raw = `${Math.floor(distance)}:${Math.floor(timeElapsed)}:${kills}:${heroId}:${secret}`;
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
      hash = ((hash << 5) - hash) + raw.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16);
  }

  static validateRunMetrics(distance, timeElapsed) {
    if (timeElapsed <= 0) return false;
    const avgSpeed = distance / timeElapsed;
    // Maximum possible physical velocity in-game is 32 m/s
    if (avgSpeed > 32.0) {
      console.warn('[AntiCheat] Flagged: Impossible run velocity detected', avgSpeed);
      return false;
    }
    return true;
  }
}
```

---
*Related: [[⛩️_00_MASTER_INDEX]], [[04_Global_Leaderboard_&_Cloud_Sync_Database_Spec]]*
