# 📝 Prompt 10: Vercel Edge Hosting, CI Integrity Testing & Production Validation

> **Vault Hub**: [[⛩️_00_MASTER_INDEX]]  
> **Previous**: [[Prompt_09_Dual_Licensing_IP_Protection_&_Commercial_Rights]]

---

## 🗣️ User Prompt & Requirement Statement

> [!QUOTE] **Founder's Directive:**  
> "Deploy Devil's Door live on Vercel with edge caching headers, clean URLs, and CORS permissions for iframe embedding. Set up automated continuous integration (CI) tests to validate script syntax, level data integrity, character roster schemas, and asset links."

---

## 💻 Step-by-Step Implementation

### 1. Production Vercel Configuration (`vercel.json`)

```json
{
  "version": 2,
  "cleanUrls": true,
  "trailingSlash": false,
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "ALLOWALL" },
        { "key": "Access-Control-Allow-Origin", "value": "*" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
      ]
    },
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
```

### 2. Automated CI Integrity Test Runner (`scripts/test-integrity.js`)
- Validates that all 10 documentation specifications in `docs/` exist and match schemas.
- Validates that all 6 playable characters have corresponding animation sprites and sound triggers.
- Runs headless Node.js syntax checks on every JavaScript ESM file.
- Checks GitHub Actions workflow (`.github/workflows/ci.yml`).

---

## 🎯 Verification & Deliverables
- [x] Live Vercel Production: [https://devils-door.vercel.app/](https://devils-door.vercel.app/)
- [x] Live Game Direct Route: [https://devils-door.vercel.app/game](https://devils-door.vercel.app/game)
- [x] CI Automated Test Suite: Passing 51/51 checks.

---
*Related: [[⛩️_00_MASTER_INDEX]], [[v0.5.0_Publisher_Submission_&_Production_Release]]*
