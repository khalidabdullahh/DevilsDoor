// Saved progress (stars per level). localStorage can be unavailable (private mode): everything degrades to "nothing saved".
const KEY = 'devilsdoor_progress_v1';
const read = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } };
const write = (p) => { try { localStorage.setItem(KEY, JSON.stringify(p)); } catch (e) { /* ignore */ } };
let mem = null;                                   // fallback when storage fails
const get = () => (mem = mem || read());

export const starsFor = (realm, lvl) => get()[realm + ':' + lvl] || 0;                         // 0 = not completed yet
export const isUnlocked = (realm, lvl) => lvl === 1 || starsFor(realm, lvl - 1) > 0;
export const realmStars = (realm, count) => { let s = 0; for (let i = 1; i <= count; i++) s += starsFor(realm, i); return s; };
export function record(realm, lvl, stars) {
  const p = get(), k = realm + ':' + lvl;
  if ((p[k] || 0) < stars) { p[k] = stars; write(p); }
}
export const nextLevelAfter = (realm, lvl, count) => (lvl < count ? lvl + 1 : null);
export function calcStars({ deaths, orbs, total }) {
  if (deaths === 0 && total > 0 && orbs / total >= 0.7) return 3;
  if (deaths <= 1) return 2;
  return 1;
}
