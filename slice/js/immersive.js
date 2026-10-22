// Fullscreen + landscape lock. Must be called from a user gesture (tap / key).
export function goImmersive() {
  const el = document.documentElement;
  const rq = el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen;
  const lock = () => { try { const o = screen.orientation; if (o && o.lock) o.lock('landscape').catch(() => {}); } catch (e) {} };
  try {
    if (rq && !document.fullscreenElement && !document.webkitFullscreenElement) {
      const p = rq.call(el, { navigationUI: 'hide' });
      if (p && p.then) p.then(lock, lock); else lock();
    } else lock();
  } catch (e) { lock(); }
}
