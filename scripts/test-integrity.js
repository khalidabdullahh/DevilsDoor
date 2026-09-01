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
  '.github/workflows/ci.yml'
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

// 3. Check Game Source Code Architecture (src/)
const requiredGameFiles = [
  'src/index.html',
  'src/css/game.css',
  'src/js/main.js',
  'src/js/core/Game.js',
  'src/js/core/Camera25D.js',
  'src/js/core/InputManager.js',
  'src/js/core/AudioManager.js',
  'src/js/core/AnalyticsManager.js',
  'src/js/render/Renderer25D.js',
  'src/js/physics/PhysicsWorld.js',
  'src/js/physics/CollisionBox.js',
  'src/js/entities/Player.js',
  'src/js/entities/Door.js',
  'src/js/entities/ShadowDevil.js',
  'src/js/entities/Hazard.js',
  'src/js/deception/DeceptionEngine.js',
  'src/js/deception/Triggers.js',
  'src/js/deception/Actions.js',
  'src/js/intro/IntroSequence.js',
  'src/js/ui/UIManager.js',
  'src/js/ui/TouchControls.js',
  'src/js/levels/LevelRegistry.js',
  'src/js/levels/Level1.js',
  'src/js/levels/Level2.js',
  'src/js/levels/Level3.js',
  'src/js/levels/Level4.js',
  'src/js/levels/Level5.js'
];

console.log('\n🎮 3. Verifying Game Engine & Modular Codebase (src/):');
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

// 5. Test Dynamic Level Instantiation & Uniqueness
console.log('\n🧪 5. Testing Prototype Levels Execution & Uniqueness Matrix:');

import { LevelRegistry } from '../src/js/levels/LevelRegistry.js';

const totalLevels = LevelRegistry.getTotalLevels();
assert(totalLevels === 5, `Level Registry reports 5 Prototype Levels (got ${totalLevels})`);

const seenTitles = new Set();
for (let i = 0; i < totalLevels; i++) {
  const level = LevelRegistry.createLevel(i);
  assert(level !== null, `Level ${i + 1} instantiates without errors`);
  assert(level.title && !seenTitles.has(level.title), `Level ${i + 1} has unique title: "${level.title}"`);
  seenTitles.add(level.title);

  assert(level.physicsWorld.solids.length > 0, `Level ${i + 1} contains solid platforms (${level.physicsWorld.solids.length} solids)`);
  assert(level.doors.length > 0, `Level ${i + 1} contains exit door (${level.doors.length} door entities)`);
  assert(level.playerStartX !== undefined && level.playerStartY !== undefined, `Level ${i + 1} has valid start position (${level.playerStartX}, ${level.playerStartY})`);
}

console.log(`\n============================================================`);
console.log(`🎉 Integrity Checks Finished: ${passedChecks}/${totalChecks} PASSED.`);
console.log(`============================================================\n`);
