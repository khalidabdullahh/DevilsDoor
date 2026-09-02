/**
 * test-integrity.js — Automated Integrity Test Suite for 10-Level Campaign.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('🚪 [DEVIL\'S DOOR] Running 10-Level System Integrity Checks...\n');

let passedChecks = 0;
let totalChecks = 0;

function assert(condition, message) {
  totalChecks++;
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passedChecks++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    process.exitCode = 1;
  }
}

// 1. Check Root Documentation & Governance Files
const requiredRootFiles = [
  'README.md',
  'AGENTS.md',
  'CONTRIBUTING.md',
  'CODE_OF_CONDUCT.md',
  'SECURITY.md',
  'GOVERNANCE.md',
  'CHANGELOG.md',
  'LICENSE',
  'package.json',
  '.gitignore',
  '.github/workflows/ci.yml',
  'index.html',
  'game.html',
  'play.html',
  'game/index.html',
  'play/index.html',
  'vercel.json'
];

console.log('📋 1. Verifying Root Governance Suite:');
for (const file of requiredRootFiles) {
  const filePath = path.join(rootDir, file);
  assert(fs.existsSync(filePath), `Root file exists: ${file}`);
}

// 2. Check Documentation Suite (docs/)
const requiredDocs = [
  'docs/MASTER_CONTEXT.md',
  'docs/GAMEPLAY_SPEC.md',
  'docs/DECEPTION_ENGINE.md',
  'docs/MECHANICS_LIBRARY.md',
  'docs/VISUAL_BIBLE.md',
  'docs/LEVEL_DESIGN_BIBLE.md',
  'docs/MONETIZATION.md',
  'docs/ANALYTICS.md',
  'docs/ROADMAP.md',
  'docs/DECISIONS.md'
];

console.log('\n📚 2. Verifying Documentation Specifications (docs/):');
for (const doc of requiredDocs) {
  const docPath = path.join(rootDir, doc);
  assert(fs.existsSync(docPath), `Doc exists: ${doc}`);
}

// 3. Check All 10 Level Modules & Boss Codebase
const requiredGameFiles = [
  'src/index.html',
  'src/css/game.css',
  'src/js/main.js',
  'src/js/core/Game.js',
  'src/js/core/Camera2D.js',
  'src/js/core/InputManager.js',
  'src/js/core/AudioManager.js',
  'src/js/core/AnalyticsManager.js',
  'src/js/render/NinjaArashiRenderer.js',
  'src/js/entities/NinjaArashiPlayer.js',
  'src/js/entities/ShadowNinjaEnemy.js',
  'src/js/entities/OniBossEnemy.js',
  'src/js/entities/Shuriken.js',
  'src/js/levels/BaseLevel.js',
  'src/js/levels/LevelRegistry.js',
  'src/js/levels/Level01_Arashi.js',
  'src/js/levels/Level02_Bamboo.js',
  'src/js/levels/Level03_Cavern.js',
  'src/js/levels/Level04_Ice.js',
  'src/js/levels/Level05_Sanctum.js',
  'src/js/levels/Level06_Thorns.js',
  'src/js/levels/Level07_Desert.js',
  'src/js/levels/Level08_Pagoda.js',
  'src/js/levels/Level09_Blades.js',
  'src/js/levels/Level10_OniBoss.js',
  'src/js/ui/UIManager.js',
  'src/js/ui/TouchControls.js'
];

console.log('\n🎮 3. Verifying 10-Level Campaign Modules & Boss Codebase (src/):');
for (const file of requiredGameFiles) {
  const filePath = path.join(rootDir, file);
  assert(fs.existsSync(filePath), `Module exists: ${file}`);
}

// 4. Test All 10 Level Instances via LevelRegistry
console.log('\n🧪 4. Testing All 10 Levels via LevelRegistry:');

import { LevelRegistry } from '../src/js/levels/LevelRegistry.js';

assert(LevelRegistry.TOTAL_LEVELS === 10, 'LevelRegistry total levels is 10');

for (let lvl = 1; lvl <= 10; lvl++) {
  const levelInstance = LevelRegistry.getLevel(lvl);
  assert(levelInstance.id === lvl, `Level ${lvl} instantiates with correct ID`);
  assert(levelInstance.solids.length > 0, `Level ${lvl} (${levelInstance.title}) contains solids`);
  assert(levelInstance.door !== null && levelInstance.door.x > 1400, `Level ${lvl} has exit shrine`);
}

// Check Level 10 Oni Boss
const lvl10 = LevelRegistry.getLevel(10);
assert(lvl10.enemies.length === 1 && lvl10.enemies[0].maxHealth === 12, 'Level 10 has Demonic Oni Boss with 12 HP');

console.log(`\n============================================================`);
console.log(`🎉 Integrity Checks Finished: ${passedChecks}/${totalChecks} PASSED.`);
console.log(`============================================================\n`);
