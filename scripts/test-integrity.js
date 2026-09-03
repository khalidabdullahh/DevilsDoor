/**
 * test-integrity.js — Automated Integrity Test Suite for Devil's Door v2.0 Endless Edition.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('🚪 [DEVIL\'S DOOR v2.0] Running System Integrity, Endless Engine & Ad Checks...\n');

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

// 3. Check All v2.0 Endless Modules, Boss Codebase & AdManager
const requiredGameFiles = [
  'src/index.html',
  'src/css/game.css',
  'src/js/main.js',
  'src/js/core/Game.js',
  'src/js/core/Camera2D.js',
  'src/js/core/InputManager.js',
  'src/js/core/AudioManager.js',
  'src/js/core/AnalyticsManager.js',
  'src/js/core/AdManager.js',
  'src/js/render/NinjaArashiRenderer.js',
  'src/js/entities/NinjaArashiPlayer.js',
  'src/js/entities/ShadowNinjaEnemy.js',
  'src/js/entities/OniBossEnemy.js',
  'src/js/entities/Shuriken.js',
  'src/js/levels/BaseLevel.js',
  'src/js/levels/EndlessWorld.js',
  'src/js/levels/LevelRegistry.js',
  'src/js/ui/UIManager.js',
  'src/js/ui/TouchControls.js'
];

console.log('\n🎮 3. Verifying v2.0 Endless Platformer Codebase (src/):');
for (const file of requiredGameFiles) {
  const filePath = path.join(rootDir, file);
  assert(fs.existsSync(filePath), `Module exists: ${file}`);
}

// 4. Test Endless World Generator
console.log('\n🧪 4. Testing EndlessWorld Procedural Engine:');

import { EndlessWorld } from '../src/js/levels/EndlessWorld.js';

const endlessInstance = new EndlessWorld();
assert(endlessInstance.id === 'endless_v2', 'EndlessWorld instantiates with correct v2 id');
assert(endlessInstance.solids.length > 0, 'EndlessWorld contains initial platform chunks');
assert(endlessInstance.BIOME_CYCLE.length >= 5, 'EndlessWorld cycles across signature biomes');
assert(endlessInstance.BIOME_DURATION === 180, 'EndlessWorld 3-minute biome duration configured');

// Check Initial Generation Distance
assert(endlessInstance.generatedDistance > 2000, `EndlessWorld pre-generates ahead (${endlessInstance.generatedDistance}px)`);

console.log(`\n============================================================`);
console.log(`🎉 Integrity Checks Finished: ${passedChecks}/${totalChecks} PASSED.`);
console.log(`============================================================\n`);
