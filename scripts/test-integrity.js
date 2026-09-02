/**
 * test-integrity.js — Automated Integrity & Verification Test Suite for Devil's Door.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('🚪 [DEVIL\'S DOOR] Running Automated System Integrity Checks...\n');

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

// 3. Check Ninja Arashi 2 Game Source Code Architecture (src/)
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
  'src/js/entities/Shuriken.js',
  'src/js/levels/Level01_Arashi.js',
  'src/js/ui/UIManager.js',
  'src/js/ui/TouchControls.js'
];

console.log('\n🎮 3. Verifying Ninja Arashi 2 Engine & Modular Codebase (src/):');
for (const file of requiredGameFiles) {
  const filePath = path.join(rootDir, file);
  assert(fs.existsSync(filePath), `Game module exists: ${file}`);
}

// 4. Check Marketing Website (website/)
const requiredWebsiteFiles = [
  'website/index.html',
  'website/css/theme.css',
  'website/css/website.css',
  'website/js/website.js'
];

console.log('\n🌐 4. Verifying Marketing Website (website/):');
for (const file of requiredWebsiteFiles) {
  const filePath = path.join(rootDir, file);
  assert(fs.existsSync(filePath), `Website asset exists: ${file}`);
}

// 5. Test Level 01 Simulation & Collision Math
console.log('\n🧪 5. Testing Level 01 Collision Resolution & Mechanics:');

import { Level01_Arashi } from '../src/js/levels/Level01_Arashi.js';
const testLevel = new Level01_Arashi();

assert(testLevel.solids.length > 0, `Level 01 contains solids (${testLevel.solids.length} solids)`);
assert(testLevel.bridgePlanks.length === 8, `Level 01 has 8 dynamic collapsing rope bridge planks`);
assert(testLevel.enemies.length === 2, `Level 01 has 2 Shadow Ninja enemies (Scout and Spearman)`);
assert(testLevel.hazards.length === 3, `Level 01 has 3 hazards (Ceiling Spikes, Bamboo Pit, Floor Spikes)`);
assert(testLevel.door !== null && testLevel.door.x > 1500, `Level 01 has genuine Devil's Door exit at end of arena`);

const landingRes = testLevel.resolve2D(100, 150, 32, 54, 0, 200);
assert(landingRes.grounded === true, `Player lands on starting cliff platform`);
assert(landingRes.y === 226, `Landing height is precisely resolved (y = 226)`);

console.log(`\n============================================================`);
console.log(`🎉 Integrity Checks Finished: ${passedChecks}/${totalChecks} PASSED.`);
console.log(`============================================================\n`);
