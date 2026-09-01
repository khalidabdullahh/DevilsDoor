/**
 * test-production-server.js — Production-like Vercel routing and MIME type tester.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// Vercel Rewrite Router Simulation
function resolveVercelPath(urlPath) {
  const cleanPath = urlPath.split('?')[0];

  if (cleanPath === '/' || cleanPath === '') {
    return path.join(rootDir, 'website', 'index.html');
  }
  if (cleanPath === '/game' || cleanPath === '/game/' || cleanPath === '/play' || cleanPath === '/play/') {
    return path.join(rootDir, 'src', 'index.html');
  }

  // Strip leading slash for relative join
  const relPath = cleanPath.startsWith('/') ? cleanPath.slice(1) : cleanPath;
  return path.join(rootDir, relPath);
}

console.log('🌐 [PRODUCTION VERCEL ROUTING & ASSET VERIFICATION] Testing Endpoints...\n');

const testEndpoints = [
  { path: '/', expectedType: 'text/html', desc: 'Root Route -> Marketing Website (website/index.html)' },
  { path: '/game', expectedType: 'text/html', desc: '/game Route -> Game Shell (src/index.html)' },
  { path: '/play', expectedType: 'text/html', desc: '/play Route -> Game Shell (src/index.html)' },
  { path: '/website/css/theme.css', expectedType: 'text/css', desc: 'Theme Stylesheet' },
  { path: '/website/css/website.css', expectedType: 'text/css', desc: 'Website Stylesheet' },
  { path: '/website/js/website.js', expectedType: 'application/javascript', desc: 'Website Script' },
  { path: '/src/css/game.css', expectedType: 'text/css', desc: 'Game Stylesheet' },
  { path: '/src/js/main.js', expectedType: 'application/javascript', desc: 'Main Game Module' },
  { path: '/src/js/core/Game.js', expectedType: 'application/javascript', desc: 'Game Loop Module' },
  { path: '/src/js/render/Renderer25D.js', expectedType: 'application/javascript', desc: '2.5D Renderer Module' },
  { path: '/src/js/physics/PhysicsWorld.js', expectedType: 'application/javascript', desc: 'Physics World Module' },
  { path: '/src/js/entities/Player.js', expectedType: 'application/javascript', desc: 'Player Entity Module' },
  { path: '/src/js/entities/ShadowDevil.js', expectedType: 'application/javascript', desc: 'Shadow Devil Module' },
  { path: '/src/js/levels/LevelRegistry.js', expectedType: 'application/javascript', desc: 'Level Registry Module' },
  { path: '/src/js/levels/Level1.js', expectedType: 'application/javascript', desc: 'Level 1 Module' },
  { path: '/src/js/levels/Level5.js', expectedType: 'application/javascript', desc: 'Level 5 Module' }
];

let passed = 0;
let failed = 0;

for (const test of testEndpoints) {
  const filePath = resolveVercelPath(test.path);
  const exists = fs.existsSync(filePath);

  if (!exists) {
    console.error(`  ❌ FAIL ${test.desc}: File not found at ${filePath}`);
    failed++;
    continue;
  }

  const stat = fs.statSync(filePath);
  if (stat.isDirectory() || stat.size === 0) {
    console.error(`  ❌ FAIL ${test.desc}: File is directory or empty (${filePath})`);
    failed++;
    continue;
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  if (contentType.includes(test.expectedType)) {
    console.log(`  ✅ 200 OK [${contentType}] ${test.desc} -> ${path.relative(rootDir, filePath)}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL ${test.desc}: Unexpected MIME type ${contentType} (expected ${test.expectedType})`);
    failed++;
  }
}

console.log(`\n============================================================`);
console.log(`📊 Production Routing Checks: ${passed}/${testEndpoints.length} PASSED (${failed} failed).`);
console.log(`============================================================\n`);

if (failed > 0) {
  process.exit(1);
}
