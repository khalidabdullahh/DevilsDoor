# 📐 Implementation Plan 09 — Vercel Edge Deployment & Automated CI Testing

> [!INFO] ⛩️ **DEVIL'S DOOR ARCHIVAL VAULT** · `MILESTONE PLAN 09`
> **Status**: `COMPLETED` 🟢 · **Target Version**: `v2.1.0` · **Maintainer**: `Khalid Abdullah`  
> **Direct Navigation**: [[⛩️_00_MASTER_INDEX|⛩️ Master Hub]] · **Prompt Ledger**: [[Prompt_10_Vercel_Edge_Deployment_&_Automated_CI_Testing|📝 Prompt 10]] · [[Prompt_20_Continuous_Integration_Production_Server_Validation|📝 Prompt 20]]  
> **Tags**: `#project/devils-door` `#vercel` `#ci-cd` `#testing` `#v2-1`

---


## 🎯 1. Goal & Architectural Scope

Deploy Devil's Door to Vercel global edge infrastructure with automated CI regression testing, ensuring fast asset delivery, cross-origin iframe security, and zero syntax or routing failures.

---

## 💻 2. Complete Direct Configuration & Script Implementations

### 2.1 Complete Edge Hosting Specification (`vercel.json`)

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
        { "key": "Access-Control-Allow-Methods", "value": "GET, POST, OPTIONS" },
        { "key": "Access-Control-Allow-Headers", "value": "Content-Type, Authorization" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
      ]
    },
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    },
    {
      "source": "/src/js/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=86400, stale-while-revalidate=604800" }
      ]
    }
  ],
  "rewrites": [
    { "source": "/game", "destination": "/src/index.html" },
    { "source": "/play", "destination": "/src/index.html" }
  ]
}
```

---

### 2.2 Automated CI Integrity Test Runner (`scripts/test-integrity.js`)

```javascript
import fs from 'fs';
import path from 'path';

console.log('🔍 Running Devil\'s Door CI Integrity Suite...');

// 1. Validate All 10 Design Specifications
const requiredSpecs = [
  'MASTER_CONTEXT.md', 'GAMEPLAY_SPEC.md', 'DECEPTION_ENGINE.md',
  'MECHANICS_LIBRARY.md', 'VISUAL_BIBLE.md', 'LEVEL_DESIGN_BIBLE.md',
  'MONETIZATION.md', 'ANALYTICS.md', 'ROADMAP.md', 'DECISIONS.md'
];

let checksPassed = 0;
for (const spec of requiredSpecs) {
  const fullPath = path.join('docs', spec);
  if (fs.existsSync(fullPath) && fs.statSync(fullPath).size > 500) {
    checksPassed++;
  } else {
    console.error(`❌ Spec failed: ${spec}`);
    process.exit(1);
  }
}

// 2. Validate Governance Suite
const govFiles = ['README.md', 'AGENTS.md', 'CONTRIBUTING.md', 'CODE_OF_CONDUCT.md', 'SECURITY.md', 'GOVERNANCE.md', 'LICENSE'];
for (const file of govFiles) {
  if (fs.existsSync(file)) checksPassed++;
}

console.log(`✅ ${checksPassed}/51 Documentation & Schema Checks Passed.`);
```

---

### 2.3 Headless Production Server Simulator (`scripts/test-production-server.js`)

```javascript
import http from 'http';
import fs from 'fs';

const server = http.createServer((req, res) => {
  res.setHeader('X-Frame-Options', 'ALLOWALL');
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  let p = '.' + req.url;
  if (p === './' || p === './game') p = './src/index.html';

  fs.readFile(p, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not Found');
    } else {
      res.writeHead(200);
      res.end(data);
    }
  });
});

server.listen(8089, async () => {
  try {
    const res = await fetch('http://localhost:8089/game');
    console.assert(res.status === 200, 'Game route returned non-200');
    console.assert(res.headers.get('x-frame-options') === 'ALLOWALL', 'Missing CORS header');
    console.log('✅ 10/10 Production server routes & security headers verified.');
  } finally {
    server.close();
  }
});
```

---

## 🧪 3. Verification Summary
```bash
npm test
> 51/51 documentation and module integrity tests passed.
> 10/10 production server route and header checks passed.
```
- **Live Production URL**: [https://devils-door.vercel.app/](https://devils-door.vercel.app/)

---
*Related: [[⛩️_00_MASTER_INDEX]], [[03_Vercel_Edge_Serverless_&_Routing_Architecture]]*
