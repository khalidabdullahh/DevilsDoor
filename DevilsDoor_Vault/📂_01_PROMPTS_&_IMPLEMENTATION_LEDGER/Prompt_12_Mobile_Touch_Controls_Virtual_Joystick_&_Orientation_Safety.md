# 📝 Prompt 12: Mobile Touch Controls, Virtual Joystick & Orientation Safety

> **Vault Hub**: [[⛩️_00_MASTER_INDEX]]  
> **Previous**: [[Prompt_11_Combat_Mechanics_Hitboxes_&_Poise]]  
> **Next**: [[Prompt_13_In_Game_Shinobi_Quick_Switcher_&_HUD_Overlay]]

---

## 🗣️ User Prompt & Requirement Statement

> [!QUOTE] **Founder's Directive:**  
> "Make the game fully playable on mobile phones and tablets (iOS Safari & Android Chrome). Add responsive touch D-Pad buttons, a jump button with variable height touch sensitivity, an attack button, and a full-screen device rotation overlay if the user holds their phone in portrait mode."

---

## 💻 Step-by-Step Implementation (`src/js/ui/TouchController.js`)

```javascript
export class TouchController {
  constructor(inputManager) {
    this.input = inputManager;
    this.container = document.getElementById('touch-controls-overlay');
    this.rotatePrompt = document.getElementById('rotate-device-prompt');
    this.init();
  }

  init() {
    // Only mount touch buttons if touch screen detected
    if (!('ontouchstart' in window) && navigator.maxTouchPoints <= 0) return;
    this.container.classList.remove('hidden');

    this.bindTouch('btn-left', () => this.input.setKey('ArrowLeft', true), () => this.input.setKey('ArrowLeft', false));
    this.bindTouch('btn-right', () => this.input.setKey('ArrowRight', true), () => this.input.setKey('ArrowRight', false));
    this.bindTouch('btn-jump', () => this.input.setKey('Space', true), () => this.input.setKey('Space', false));
    this.bindTouch('btn-attack', () => this.input.setKey('KeyX', true), () => this.input.setKey('KeyX', false));

    // Orientation safety check
    window.addEventListener('resize', () => this.checkOrientation());
    this.checkOrientation();
  }

  checkOrientation() {
    const isPortrait = window.innerHeight > window.innerWidth;
    if (isPortrait) {
      this.rotatePrompt.classList.remove('hidden');
    } else {
      this.rotatePrompt.classList.add('hidden');
    }
  }

  bindTouch(elemId, onPress, onRelease) {
    const el = document.getElementById(elemId);
    if (!el) return;
    el.addEventListener('touchstart', (e) => { e.preventDefault(); onPress(); }, { passive: false });
    el.addEventListener('touchend', (e) => { e.preventDefault(); onRelease(); }, { passive: false });
  }
}
```

---
*Related: [[⛩️_00_MASTER_INDEX]], [[Prompt_07_Landing_Page_to_Character_Select_Navigation_Flow]]*
