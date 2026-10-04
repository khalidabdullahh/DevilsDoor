/**
 * Pure layout helpers for the Shinobi / Realm select screens.
 * Kept free of DOM access so they can be unit-tested in Node (scripts/test-landing-and-select.mjs).
 */

// 3D coverflow pose of a hero card. offset = cardIndex - selectedIndex (0 = centered).
export function characterCardLayout(offset) {
  const abs = Math.abs(offset);
  const dir = offset < 0 ? -1 : 1;
  const zIndex = 10 - abs;

  if (offset === 0) {
    return { transform: 'translateX(0px) scale(1.22) translateZ(60px)', opacity: 1, zIndex };
  }
  if (abs === 1) {
    return { transform: `translateX(${dir * 160}px) scale(0.78) rotateY(${-dir * 18}deg) translateZ(0px)`, opacity: 0.55, zIndex };
  }
  return { transform: `translateX(${offset * 140}px) scale(0.6) rotateY(${-dir * 25}deg) translateZ(-40px)`, opacity: 0.2, zIndex };
}

// Which card indices should have their image loaded: the selected one plus `radius` on each side.
// (The realm screen used to load all 10 four-K backgrounds at once.)
export function loadWindow(selectedIndex, count, radius = 2) {
  const out = [];
  for (let i = Math.max(0, selectedIndex - radius); i <= Math.min(count - 1, selectedIndex + radius); i++) out.push(i);
  return out;
}
