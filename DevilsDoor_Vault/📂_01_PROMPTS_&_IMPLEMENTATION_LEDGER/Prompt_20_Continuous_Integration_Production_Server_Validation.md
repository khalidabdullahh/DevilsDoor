---
title: "Prompt 20: Continuous Integration & Production Server Validation"
aliases: ["Prompt 20", "Production Server CI"]
tags:
  - prompt-log
  - testing
  - server
  - ci-cd
  - project/devils-door
created: 2026-09-04
status: completed
---

# 📝 Prompt 20: Continuous Integration & Production Server Validation

> **Vault Hub**: [[⛩️_00_MASTER_INDEX]]  
> **Previous**: [[Prompt_19_Client_Save_State_Engine_&_Version_Migration]]

---

## 🗣️ User Prompt & Requirement Statement

> [!QUOTE] **Founder's Directive:**  
> "Build automated production server regression test suites (`scripts/test-production-server.js` & `scripts/test-integrity.js`) that verify all HTTP status codes, security headers, routing rewrites, character data integrity, and documentation assets before pushing live updates."

---

## 💻 Step-by-Step Implementation

1. **`scripts/test-integrity.js`**:
   - Validates all documentation files in `docs/`.
   - Checks that all 6 characters in `src/js/data/CharacterRoster.js` have valid sprites, names, and ability tags.
   - Runs syntax verification on all 20+ JavaScript ESM modules.
2. **`scripts/test-production-server.js`**:
   - Launches a headless HTTP server simulating Vercel edge headers.
   - Verifies route `/game` and `/play` returns `200 OK` with `X-Frame-Options: ALLOWALL` and `Access-Control-Allow-Origin: *`.
   - Automatically closes server after execution.

---
## 🎯 Verification & Results
```bash
npm test
> 51/51 documentation and module integrity tests passed.
> 10/10 production server route and header checks passed.
```

---
*Related: [[⛩️_00_MASTER_INDEX]], [[06_Local_Server_Runtimes_&_Automated_Testing_Servers]]*
