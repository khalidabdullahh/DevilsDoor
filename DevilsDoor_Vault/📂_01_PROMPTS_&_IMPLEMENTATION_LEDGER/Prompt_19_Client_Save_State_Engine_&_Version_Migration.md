# 📝 Prompt 19: Client Save State Engine & Version Migration

> **Vault Hub**: [[⛩️_00_MASTER_INDEX]]  
> **Previous**: [[Prompt_18_Anti_Cheat_Run_Verification_Hashing_System]]  
> **Next**: [[Prompt_20_Continuous_Integration_Production_Server_Validation]]

---

## 🗣️ User Prompt & Requirement Statement

> [!QUOTE] **Founder's Directive:**  
> "When upgrading the game from v1.0 to v2.1, ensure that existing player unlock data, selected character choices, and high scores stored in LocalStorage are migrated safely without crashing the client or resetting player progress."

---

## 💻 Step-by-Step Implementation

1. **Auto-Detection of Old Storage Keys**:
   - Checks for legacy `devils_door_selected_hero` or `devils_door_save_v1`.
2. **Schema Upgrade Transformer**:
   - Merges old high scores and unlocked hero arrays into the new comprehensive `devils_door_v2_save_state` JSON schema.
3. **Graceful Fallbacks**:
   - If corrupted data is encountered, default state initializes seamlessly without breaking the game canvas.

---
*Related: [[⛩️_00_MASTER_INDEX]], [[01_Client_Storage_&_Save_State_Engine]]*
