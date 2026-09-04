# 📝 Prompt 11: Combat Mechanics, Directional Hitboxes & Poise

> **Vault Hub**: [[⛩️_00_MASTER_INDEX]]  
> **Previous**: [[Prompt_10_Vercel_Edge_Deployment_&_Automated_CI_Testing]]  
> **Next**: [[Prompt_12_Mobile_Touch_Controls_Virtual_Joystick_&_Orientation_Safety]]

---

## 🗣️ User Prompt & Requirement Statement

> [!QUOTE] **Founder's Directive:**  
> "Add fluid, high-octane shadow combat to Devil's Door. Players should be able to slash through demonic obstacles, destroy hazard blocks, execute dash-cancels, and trigger distinct hero weapon animations (Katana slash, dual Kama scythe flurry, Kanabo ground pound) with frame-perfect hitboxes."

---

## 💻 Step-by-Step Implementation (`src/js/combat/CombatEngine.js`)

```javascript
export class CombatEngine {
  constructor() {
    this.activeHitboxes = [];
  }

  spawnAttackHitbox(attacker, heroData) {
    const dir = attacker.facingDir || 1;
    const hitbox = {
      ownerId: attacker.id,
      heroType: attacker.heroType,
      x: dir > 0 ? attacker.x + 20 : attacker.x - 70,
      y: attacker.y - 10,
      width: 75,
      height: 45,
      damage: heroData.attackDamage || 25,
      poiseBreak: heroData.poiseBreak || 10,
      lifetime: 0.12, // 120ms active window
      knockback: { x: dir * 350, y: -150 }
    };
    this.activeHitboxes.push(hitbox);
  }

  update(dt, worldEntities, audio) {
    for (let i = this.activeHitboxes.length - 1; i >= 0; i--) {
      const box = this.activeHitboxes[i];
      box.lifetime -= dt;

      // Check collision against breakable tiles & enemies
      for (const entity of worldEntities) {
        if (entity.id !== box.ownerId && this.checkAABB(box, entity)) {
          entity.takeDamage(box.damage, box.knockback);
          audio.playKatanaSlash();
        }
      }

      if (box.lifetime <= 0) this.activeHitboxes.splice(i, 1);
    }
  }

  checkAABB(a, b) {
    return a.x < b.x + b.width && a.x + a.width > b.x &&
           a.y < b.y + b.height && a.y + a.height > b.y;
  }
}
```

---
*Related: [[⛩️_00_MASTER_INDEX]], [[Playable_Shinobi_Roster_Dossier]]*
