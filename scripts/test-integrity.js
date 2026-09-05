/**
 * test-integrity.js — Automated Integrity Test Suite for Devil's Door v2.2 Master Edition.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('🚪 [DEVIL\'S DOOR v2.2] Running System Integrity, Economy & Ad Checks...\n');

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
  'robots.txt',
  'sitemap.xml',
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

// 3. Check All v2.2 Endless Modules, Boss Codebase, Economy & AdManager
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
  'src/js/core/EconomyManager.js',
  'src/js/core/RewardProvider.js',
  'src/js/data/CharacterRoster.js',
  'src/js/data/SceneRoster.js',
  'src/js/render/NinjaArashiRenderer.js',
  'src/js/entities/NinjaArashiPlayer.js',
  'src/js/entities/ShadowNinjaEnemy.js',
  'src/js/entities/OniBossEnemy.js',
  'src/js/entities/Shuriken.js',
  'src/js/levels/BaseLevel.js',
  'src/js/levels/EndlessWorld.js',
  'src/js/levels/LevelRegistry.js',
  'src/js/ui/UIManager.js',
  'src/js/ui/CharacterSelect.js',
  'src/js/ui/SceneSelect.js',
  'src/js/ui/TouchControls.js'
];

console.log('\n🎮 3. Verifying v2.2 Platformer Codebase (src/):');
for (const file of requiredGameFiles) {
  const filePath = path.join(rootDir, file);
  assert(fs.existsSync(filePath), `Module exists: ${file}`);
}

// 4. Test Endless World Generator
console.log('\n🧪 4. Testing EndlessWorld Procedural Engine:');

import { EndlessWorld } from '../src/js/levels/EndlessWorld.js';

const endlessInstance = new EndlessWorld('sunset_torii');
assert(endlessInstance.id === 'endless_v2', 'EndlessWorld instantiates with correct v2 id');
assert(endlessInstance.solids.length > 0, 'EndlessWorld contains initial platform chunks');
assert(endlessInstance.BIOME_CYCLE.length === 4, 'EndlessWorld configured with 4 official 4K realms');
assert(endlessInstance.BIOME_DURATION === Infinity, 'EndlessWorld locked to player-selected realm');

// Check Initial Generation Distance
assert(endlessInstance.generatedDistance > 2000, `EndlessWorld pre-generates ahead (${endlessInstance.generatedDistance}px)`);

// 5. Test Economy & Roster Modules
console.log('\n💰 5. Testing EconomyManager & Rosters:');
import { EconomyManager } from '../src/js/core/EconomyManager.js';
import { CHARACTER_ROSTER } from '../src/js/data/CharacterRoster.js';
import { SCENE_ROSTER } from '../src/js/data/SceneRoster.js';

assert(CHARACTER_ROSTER.length === 4, 'CharacterRoster contains 4 official heroes');
assert(SCENE_ROSTER.length === 4, 'SceneRoster contains 4 official 4K realms');

// Test Mock Storage for EconomyManager
const mockStorage = {};
global.localStorage = {
  getItem: (k) => mockStorage[k] || null,
  setItem: (k, v) => { mockStorage[k] = String(v); }
};

const economy = new EconomyManager();
assert(economy.getPoints() === 0, 'Initial points start at 0');
assert(economy.isCharacterUnlocked('kage_ryu'), 'Kage-Ryu is unlocked by default');
assert(!economy.isCharacterUnlocked('ryujin'), 'Ryujin starts locked');

// Test milestone reward (+10 pts per 1000m)
const m1 = economy.checkDistanceMilestones(1000);
assert(m1 && m1.pointsEarned === 10, '1000m awards 10 points');
assert(economy.getPoints() === 10, 'Economy reflects 10 points balance');

const mDuplicate = economy.checkDistanceMilestones(1050);
assert(mDuplicate === null, 'No duplicate points awarded within same 1000m chunk');

const m2 = economy.checkDistanceMilestones(2000);
assert(m2 && m2.pointsEarned === 10, '2000m awards another 10 points');
assert(economy.getPoints() === 20, 'Total points balance is 20');

// Test character purchase
economy.addPoints(500);
assert(economy.getPoints() === 520, 'Points properly added');
assert(economy.unlockCharacter('ryujin', 500) === true, 'Ryujin unlocked with 500 points');
assert(economy.getPoints() === 20, 'Points deducted after purchase');
assert(economy.isCharacterUnlocked('ryujin') === true, 'Ryujin is now unlocked');

console.log(`\n============================================================`);
console.log(`🎉 Integrity Checks Finished: ${passedChecks}/${totalChecks} PASSED.`);
console.log(`============================================================\n`);
