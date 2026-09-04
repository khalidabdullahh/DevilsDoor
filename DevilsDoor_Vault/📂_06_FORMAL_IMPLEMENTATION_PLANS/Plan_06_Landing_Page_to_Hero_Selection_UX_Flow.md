---
title: "Implementation Plan 06: Landing Page to Hero Selection UX Flow"
aliases: ["Plan 06", "UX Flow Plan"]
tags:
  - implementation-plan
  - ui-ux
  - character-select
  - mobile
  - project/devils-door
created: 2026-09-03
status: completed
related_prompts:
  - "[[Prompt_07_Landing_Page_to_Character_Select_Navigation_Flow]]"
  - "[[Prompt_12_Mobile_Touch_Controls_Virtual_Joystick_&_Orientation_Safety]]"
  - "[[Prompt_13_In_Game_Shinobi_Quick_Switcher_&_HUD_Overlay]]"
---

# 📐 Implementation Plan 06 — Landing Page → Character Selection → Endless Run UX Flow

> **Vault Hub**: [[⛩️_00_MASTER_INDEX]]  
> **Related Prompts**: [[Prompt_07_Landing_Page_to_Character_Select_Navigation_Flow]], [[Prompt_12_Mobile_Touch_Controls_Virtual_Joystick_&_Orientation_Safety]], [[Prompt_13_In_Game_Shinobi_Quick_Switcher_&_HUD_Overlay]]

---

## 🎯 1. Goal & Architectural Scope

Create a frictionless, modern indie game user journey:
$$\text{Landing Portal (website/index.html)} \xrightarrow{\text{⚔️ PLAY DEVIL'S DOOR}} \text{Hero Selection Stage} \xrightarrow{\text{⚔️ START RUN}} \text{Endless Gameplay}$$
with an in-game pause/death Shinobi Quick-Switcher and full mobile touch controls with orientation safety.

---

## 💻 2. Complete Direct Code Implementations

### 2.1 Interactive Character Selection Stage (`src/js/ui/CharacterSelect.js`)

```javascript
import { CHARACTER_ROSTER } from '../data/CharacterRoster.js';

export class CharacterSelectStage {
  constructor(containerId, onHeroSelected) {
    this.container = document.getElementById(containerId);
    this.onHeroSelected = onHeroSelected;
    this.heroes = Object.values(CHARACTER_ROSTER);
    this.currentIndex = 0;
    this.init();
  }

  init() {
    this.renderStage();
    this.bindEvents();
  }

  renderStage() {
    const hero = this.heroes[this.currentIndex];
    this.container.innerHTML = `
      <div class="character-select-overlay">
        <h1 class="portal-title">CHOOSE YOUR SHINOBI</h1>
        
        <!-- Animated Hero Showcase Stage -->
        <div class="hero-showcase">
          <div class="hero-avatar" style="border-color: ${hero.primaryColor}">
            <div class="hero-silhouette" style="background: ${hero.primaryColor}"></div>
          </div>
          <div class="hero-dossier">
            <h2 style="color: ${hero.primaryColor}">${hero.name}</h2>
            <p class="hero-role"><em>${hero.role}</em></p>
            <p class="hero-trait"><strong>Signature:</strong> ${hero.trait}</p>
            
            <!-- Dynamic Stat Bars -->
            <div class="stat-group">
              <div class="stat-row"><span>Agility:</span><div class="bar"><div style="width:${hero.stats.agility}%"></div></div></div>
              <div class="stat-row"><span>Damage:</span><div class="bar"><div style="width:${hero.stats.damage}%"></div></div></div>
              <div class="stat-row"><span>Defense:</span><div class="bar"><div style="width:${hero.stats.defense}%"></div></div></div>
            </div>
          </div>
        </div>

        <!-- Carousel Navigation -->
        <div class="carousel-controls">
          <button id="btn-prev-hero" class="nav-btn">◀ PREV</button>
          <button id="btn-start-run" class="btn-primary" style="background: ${hero.primaryColor}">⚔️ START RUN</button>
          <button id="btn-next-hero" class="nav-btn">NEXT ▶</button>
        </div>
      </div>
    `;
  }

  bindEvents() {
    document.getElementById('btn-prev-hero')?.addEventListener('click', () => this.navigate(-1));
    document.getElementById('btn-next-hero')?.addEventListener('click', () => this.navigate(1));
    document.getElementById('btn-start-run')?.addEventListener('click', () => {
      const selected = this.heroes[this.currentIndex];
      localStorage.setItem('devils_door_selected_hero', selected.id);
      this.container.classList.add('hidden');
      this.onHeroSelected(selected);
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') this.navigate(-1);
      if (e.key === 'ArrowRight') this.navigate(1);
      if (e.key === 'Enter') document.getElementById('btn-start-run')?.click();
    });
  }

  navigate(dir) {
    this.currentIndex = (this.currentIndex + dir + this.heroes.length) % this.heroes.length;
    this.renderStage();
    this.bindEvents();
  }
}
```

---

### 2.2 Mobile Touch Controls & Orientation Safety (`src/js/ui/TouchController.js`)

```javascript
export class TouchController {
  constructor(inputManager) {
    this.input = inputManager;
    this.container = document.getElementById('touch-controls-overlay');
    this.rotatePrompt = document.getElementById('rotate-device-prompt');
    this.init();
  }

  init() {
    if (!('ontouchstart' in window) && navigator.maxTouchPoints <= 0) return;
    this.container?.classList.remove('hidden');

    this.bindTouch('btn-touch-left', 'ArrowLeft');
    this.bindTouch('btn-touch-right', 'ArrowRight');
    this.bindTouch('btn-touch-jump', 'Space');
    this.bindTouch('btn-touch-attack', 'KeyX');

    window.addEventListener('resize', () => this.checkOrientation());
    this.checkOrientation();
  }

  checkOrientation() {
    const isPortrait = window.innerHeight > window.innerWidth;
    if (isPortrait) {
      this.rotatePrompt?.classList.remove('hidden');
    } else {
      this.rotatePrompt?.classList.add('hidden');
    }
  }

  bindTouch(elemId, keyCode) {
    const el = document.getElementById(elemId);
    if (!el) return;
    el.addEventListener('touchstart', (e) => { e.preventDefault(); this.input.setKey(keyCode, true); }, { passive: false });
    el.addEventListener('touchend', (e) => { e.preventDefault(); this.input.setKey(keyCode, false); }, { passive: false });
  }
}
```

---

## 🧪 3. Verification & Deliverables
- **Route Handling**: Verified `/` $\to$ `/game` $\to$ Character Select $\to$ Canvas Run.
- **Orientation Overlay**: Verified immediate lock overlay on mobile portrait viewports.

---
*Related: [[⛩️_00_MASTER_INDEX]], [[Playable_Shinobi_Roster_Dossier]]*
