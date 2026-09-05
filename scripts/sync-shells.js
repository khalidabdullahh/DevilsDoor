import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import cp from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const srcIndexHtml = fs.readFileSync(path.join(rootDir, 'src/index.html'), 'utf-8');

// 1. Sync game.html, play.html, game/index.html, play/index.html
fs.writeFileSync(path.join(rootDir, 'game.html'), srcIndexHtml, 'utf-8');
fs.writeFileSync(path.join(rootDir, 'play.html'), srcIndexHtml, 'utf-8');

if (!fs.existsSync(path.join(rootDir, 'game'))) fs.mkdirSync(path.join(rootDir, 'game'), { recursive: true });
if (!fs.existsSync(path.join(rootDir, 'play'))) fs.mkdirSync(path.join(rootDir, 'play'), { recursive: true });

fs.writeFileSync(path.join(rootDir, 'game/index.html'), srcIndexHtml, 'utf-8');
fs.writeFileSync(path.join(rootDir, 'play/index.html'), srcIndexHtml, 'utf-8');

// 2. Prepare dist-crazygames/src
const distCrazyGames = path.join(rootDir, 'dist-crazygames');
const distSrc = path.join(distCrazyGames, 'src');

if (!fs.existsSync(distSrc)) {
  fs.mkdirSync(distSrc, { recursive: true });
}

// Copy src/js, src/css, src/assets to dist-crazygames/src/
function copyDirSync(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

copyDirSync(path.join(rootDir, 'src/js'), path.join(distSrc, 'js'));
copyDirSync(path.join(rootDir, 'src/css'), path.join(distSrc, 'css'));
if (fs.existsSync(path.join(rootDir, 'src/assets'))) {
  copyDirSync(path.join(rootDir, 'src/assets'), path.join(distSrc, 'assets'));
}
fs.writeFileSync(path.join(distSrc, 'index.html'), srcIndexHtml, 'utf-8');

// 3. Generate dist-crazygames/index.html with SDK and relative paths
let distIndexHtml = srcIndexHtml
  .replace('<link rel="stylesheet" href="/src/css/game.css" />', '<script src="https://sdk.crazygames.com/crazygames-sdk-v3.js"></script>\n  <link rel="stylesheet" href="./src/css/game.css" />')
  .replace('<script type="module" src="/src/js/main.js"></script>', '<script type="module" src="./src/js/main.js"></script>');

fs.writeFileSync(path.join(distCrazyGames, 'index.html'), distIndexHtml, 'utf-8');

console.log('✅ Synchronized all game shells, dist-crazygames, and static mirrors successfully.');
