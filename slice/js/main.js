// Entry point. On a phone held upright we wait for landscape BEFORE booting Phaser, so the logical screen size
// (see view.js) is computed from the real landscape viewport. The upright screen shows a "Rotate" button (index.html).
window.__bp && window.__bp(0.5);
const coarse = matchMedia('(pointer: coarse)').matches;
const landscape = () => innerWidth >= innerHeight;
if (coarse && !landscape()) {
  await new Promise((resolve) => {
    const t = () => { if (landscape()) { removeEventListener('resize', t); removeEventListener('orientationchange', t); setTimeout(resolve, 220); } };
    addEventListener('resize', t); addEventListener('orientationchange', t);
  });
}
const { startGame } = await import('./game.js');
startGame();
