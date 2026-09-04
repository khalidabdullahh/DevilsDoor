# 📝 Prompt 15: Standalone Offline Bundle Packaging & ZIP Archiving

> **Vault Hub**: [[⛩️_00_MASTER_INDEX]]  
> **Previous**: [[Prompt_14_CrazyGames_SDK_Lifecycle_&_Midgame_Rewarded_Ads]]  
> **Next**: [[Prompt_16_Marketing_Artwork_Suite_Generation_16x9_2x3_1x1]]

---

## 🗣️ User Prompt & Requirement Statement

> [!QUOTE] **Founder's Directive:**  
> "Publishers like CrazyGames require an offline ZIP upload where all file imports, canvas assets, and fonts use relative paths (`./`) so that the game loads seamlessly inside sandboxed iframe containers. Package an automated distribution build in `dist-crazygames/` and generate `devils-door-crazygames.zip`."

---

## 💻 Step-by-Step Implementation

1. **Relative Path Transformation**:
   - Transformed absolute `/assets/` and `/src/js/` import specifiers into relative `./assets/` and `./src/js/` inside `dist-crazygames/index.html`.
2. **Offline ZIP Archive Creation**:
   - Packaged entire distribution suite into `devils-door-crazygames.zip` (16.3 MB).
3. **Automated Validation**:
   - Verified that unzipping and opening `index.html` in an offline browser executes flawlessly with 0 missing resource errors.

---
*Related: [[⛩️_00_MASTER_INDEX]], [[Prompt_08_CrazyGames_SDK_Poki_Developer_Submission]]*
