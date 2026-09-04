---
title: "Implementation Plan 08: Publisher Submission & Dual IP Licensing"
aliases: ["Plan 08", "Publisher & IP Plan"]
tags:
  - implementation-plan
  - publisher
  - legal
  - licensing
  - project/devils-door
created: 2026-09-04
status: completed
related_prompts:
  - "[[Prompt_08_CrazyGames_SDK_Poki_Developer_Submission]]"
  - "[[Prompt_09_Dual_Licensing_IP_Protection_&_Commercial_Rights]]"
  - "[[Prompt_15_Standalone_Offline_Bundle_Packaging_&_ZIP_Archiving]]"
  - "[[Prompt_16_Marketing_Artwork_Suite_Generation_16x9_2x3_1x1]]"
  - "[[Prompt_17_Poki_Developer_Portal_Submission_&_Curation]]"
---

# 📐 Implementation Plan 08 — Publisher Submission, Marketing Assets & Dual IP Licensing

> **Vault Hub**: [[⛩️_00_MASTER_INDEX]]  
> **Related Prompts**: [[Prompt_08_CrazyGames_SDK_Poki_Developer_Submission]], [[Prompt_09_Dual_Licensing_IP_Protection_&_Commercial_Rights]]

---

## 🎯 1. Goal & Architectural Scope

Prepare Devil's Door for live developer submissions to **CrazyGames** and **Poki**, build an offline relative-path distribution bundle (`devils-door-crazygames.zip`), generate a promotional cover graphic suite (16:9, 2:3, 1:1), and enforce a robust dual-licensing legal structure protecting Khalid Abdullah's proprietary IP.

---

## 🎨 2. Marketing Artwork Specifications (`crazygames_covers/`)

| Asset File | Resolution / Ratio | Intended Placement | Artwork Composition |
|:---|:---:|:---|:---|
| `cover_landscape_16x9.png` | $1920\times1080\text{ px}$ | CrazyGames Featured Banner & Header | Torii Gate twilight silhouette, glowing amber moon, Shadow Ninja mid-leap with flowing crimson scarf. Top-left corner preserved for publisher badge. |
| `cover_portrait_2x3.png` | $800\times1200\text{ px}$ | Mobile Store Feed & Category Tile | Vertical perspective of stone shrine steps with carved Oni demon pillars and crimson eye glints. |
| `cover_square_1x1.png` | $800\times800\text{ px}$ | Game Portal Tile & Mobile App Icon | High-contrast crimson Japanese kanji door glyph with floating golden embers. |

---

## 🔒 3. Full Dual-Licensing Legal Contract (`LICENSE` & `GOVERNANCE.md`)

```markdown
# DEVIL'S DOOR DUAL-LICENSE FRAMEWORK

Copyright (c) 2026 Khalid Abdullah. All Rights Reserved.

## PART 1: OPEN-SOURCE GAME ENGINE & MECHANICS (MIT LICENSE)
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

## PART 2: PROPRIETARY ASSETS, TRADEMARKS & LORE (ALL RIGHTS RESERVED)
Notwithstanding Part 1, the following elements are STRICTLY PROPRIETARY and
RESERVED exclusively for the founder, Khalid Abdullah:
1. Trademarks and brand identities: "Devil's Door", "Aurex", "Chaya Dash".
2. Playable character models, sprite sheets, anatomy designs, and names.
3. Concept artwork in Archive/, Scene/, and Characters/.
4. Procedural audio formulas and storylines.

No commercial distribution, rebranding, or monetization of Part 2 assets is permitted
without express written consent from Khalid Abdullah.
```

---

## 🏆 4. Publisher Submission Ledger

- **CrazyGames Submission**: ✅ **Awaiting Review (Sept 4, 2026)** — Uploaded `devils-door-crazygames.zip` (16.3 MB).
- **Poki Submission**: ✅ **Submitted** via Poki Developer Portal with live demo URL `https://devils-door.vercel.app/game`.

---
*Related: [[⛩️_00_MASTER_INDEX]], [[v2.1.0_Publisher_Submission_&_Production_Release]]*
