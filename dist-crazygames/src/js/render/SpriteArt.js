/**
 * SpriteArt — tiny loader/cache for painted (AI-art) sprites used by gameplay entities.
 * - getSprite(url): starts loading once, returns { img, ready, failed }. Entities keep their code-drawn look until `ready`.
 * - getTinted(sprite, key, color): cached silhouette-tinted copy (hit flash / wind-up telegraph) made ONCE on an offscreen
 *   canvas, so per-frame cost is a single drawImage (no ctx.filter, no shadowBlur).
 */
const cache = new Map();

export function getSprite(url) {
  let s = cache.get(url);
  if (!s) {
    s = { img: new Image(), ready: false, failed: false, tints: new Map() };
    s.img.decoding = 'async';
    s.img.onload = () => { s.ready = true; };
    s.img.onerror = () => { s.failed = true; };
    s.img.src = url;
    cache.set(url, s);
  }
  return s;
}

export function getTinted(sprite, key, color) {
  if (!sprite.ready) return null;
  let c = sprite.tints.get(key);
  if (!c) {
    c = document.createElement('canvas');
    c.width = sprite.img.naturalWidth;
    c.height = sprite.img.naturalHeight;
    const g = c.getContext('2d');
    g.drawImage(sprite.img, 0, 0);
    g.globalCompositeOperation = 'source-atop';   // only paint where the sprite has pixels
    g.fillStyle = color;
    g.fillRect(0, 0, c.width, c.height);
    sprite.tints.set(key, c);
  }
  return c;
}
