---
title: "Prompt 13: In-Game Shinobi Quick-Switcher & HUD Overlay"
aliases: ["Prompt 13", "Shinobi Switcher"]
tags:
  - prompt-log
  - ui
  - hud
  - project/devils-door
created: 2026-09-03
status: completed
---

# 📝 Prompt 13: In-Game Shinobi Quick-Switcher & Real-Time HUD Overlay

> **Vault Hub**: [[⛩️_00_MASTER_INDEX]]  
> **Previous**: [[Prompt_12_Mobile_Touch_Controls_Virtual_Joystick_&_Orientation_Safety]]  
> **Next**: [[Prompt_14_CrazyGames_SDK_Lifecycle_&_Midgame_Rewarded_Ads]]

---

## 🗣️ User Prompt & Requirement Statement

> [!QUOTE] **Founder's Directive:**  
> "When players die or hit pause, they shouldn't have to navigate back to the main landing page to switch heroes. Build an instant in-game Shinobi Switcher modal allowing live character swapping between runs while displaying distance traveled, active biome status, and current score."

---

## 💻 Step-by-Step Implementation (`src/js/ui/HUD.js`)

```javascript
export class HUD {
  constructor(game) {
    this.game = game;
    this.distanceEl = document.getElementById('hud-distance');
    this.biomeEl = document.getElementById('hud-biome');
    this.switcherModal = document.getElementById('shinobi-quick-switcher-modal');
  }

  update(distance, biomeName) {
    if (this.distanceEl) this.distanceEl.textContent = `${Math.floor(distance)}m`;
    if (this.biomeEl) this.biomeEl.textContent = biomeName;
  }

  openShinobiSwitcher() {
    this.game.isPaused = true;
    this.switcherModal.classList.remove('hidden');
  }

  selectAndResume(heroId) {
    this.game.player.setHero(heroId);
    this.switcherModal.classList.add('hidden');
    this.game.isPaused = false;
  }
}
```

---
*Related: [[⛩️_00_MASTER_INDEX]], [[Playable_Shinobi_Roster_Dossier]]*
