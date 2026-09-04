# ⚙️ Architecture Overview & Native ESM Pipeline

> **Vault Hub**: [[⛩️_00_MASTER_INDEX]]  
> **Related**: [[Prompt_01_Genesis_Architecture_&_Design_Bibles]]

---

## 🏛️ System Component Topology

```mermaid
graph TD
    HTML[index.html / game.html] --> Main[src/js/main.js - Bootstrap]
    
    subgraph Core Engine Layer
        Main --> Loop[GameLoop / RequestAnimationFrame 60FPS]
        Main --> Audio[core/audio.js - SoundSynthesizer]
        Main --> Input[core/InputManager.js - Keyboard & Touch]
        Main --> SDK[core/CrazyGamesSDK.js - Ad & Analytics]
    end
    
    subgraph Simulation Layer
        Loop --> Physics[physics/PhysicsEngine.js - Kinematics]
        Loop --> Deception[deception/DeceptionEngine.js - State Evaluator]
        Loop --> Combat[combat/CombatEngine.js - Hitboxes & Poise]
    end
    
    subgraph Entity & World Layer
        Physics --> Player[entities/NinjaArashiPlayer.js - Shinobi State]
        Physics --> World[levels/EndlessWorld.js - Dynamic Biomes]
        Player --> Scarf[entities/VerletScarf.js - Cloth Dynamics]
    end
    
    subgraph Presentation & UI Layer
        Loop --> Renderer[render/NinjaArashiRenderer.js - 2.5D Parallax]
        Loop --> UI[ui/CharacterSelect.js & ui/HUD.js]
    end
```

---

## 🚀 Native Zero-Build Philosophy
- **Zero Bundler Overhead**: Devil's Door uses native browser ES Modules. No `node_modules` required for client execution.
- **Immediate Local Execution**: Serving the repository with `python3 -m http.server` or `npx serve` runs the entire production game instantly.

---
*Related: [[⛩️_00_MASTER_INDEX]], [[Deception_Engine_State_Machine]]*
