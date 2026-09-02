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

// 3. Check Game Source Code Architecture (src/)
const requiredGameFiles = [
  'src/index.html',
  'src/css/game.css',
  'src/js/main.js',
  'src/js/core/Game.js',
  'src/js/core/CinematicCamera3D.js',
  'src/js/core/InputManager.js',
  'src/js/core/AudioManager.js',
  'src/js/core/AnalyticsManager.js',
  'src/js/render/BabylonEngine.js',
  'src/js/render/Environment3D.js',
  'src/js/entities/NinjaPlayer3D.js',
  'src/js/entities/ShadowSentry3D.js',
  'src/js/entities/DevilDoor3D.js',
  'src/js/combat/CombatSystem.js',
  'src/js/physics/PhysicsWorld3D.js',
  'src/js/levels/Level01_3D.js',
  'src/js/ui/UIManager.js',
  'src/js/ui/TouchControls.js'
];

console.log('\n🎮 3. Verifying Babylon 3D Game Engine & Modular Codebase (src/):');
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

// 5. Test 3D Physics & Level Math Logic
console.log('\n🧪 5. Testing 3D Physics Collision Engine & Math Validation:');

import { PhysicsWorld3D } from '../src/js/physics/PhysicsWorld3D.js';
const testWorld = new PhysicsWorld3D();
testWorld.addSolid(0, 0, 10, 2, 2, 'ground');

const moveRes = testWorld.resolveMovement(0, 3, 0.8, 1.8, 0, -2);
assert(moveRes.grounded === true, 'Player lands on 3D solid ground successfully');
assert(moveRes.y === 2, 'Player collision resting height is accurately resolved');

const wallSolid = testWorld.addSolid(6, 2, 2, 4, 2, 'wall');
const wallRes = testWorld.resolveMovement(4.5, 2, 0.8, 1.8, 2, 0);
assert(wallRes.collidedX === true, 'Horizontal wall collision correctly detected');
assert(wallRes.x < 5.0, 'Player position prevented from penetrating solid 3D wall');

console.log(`\n============================================================`);
console.log(`🎉 Integrity Checks Finished: ${passedChecks}/${totalChecks} PASSED.`);
console.log(`============================================================\n`);
