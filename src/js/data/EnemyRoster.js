/**
 * EnemyRoster — painted portraits of the Shadow Army (AI-generated art, keyed to transparent WebP).
 * These are PORTRAITS for menus / loading / game-over flavour. In-game enemies are still drawn by code
 * (src/js/entities/*), so adding art here never changes gameplay.
 * Source prompts: docs/ART_PROMPTS.md. Cut-out tool: scripts/key-art.py.
 * Still missing art: Cursed Monk, Oni Boss (Shadow Entity).
 */
export const ENEMY_ROSTER = [
  { id: 'shadow-ronin',     name: 'SHADOW RONIN',     title: 'Wandering Blade',  accentColor: '#60a5fa', portrait: '/src/assets/web/enemy-01-shadow-ronin.webp' },
  { id: 'crimson-assassin', name: 'CRIMSON ASSASSIN', title: 'Twin Sickles',     accentColor: '#ef4444', portrait: '/src/assets/web/enemy-02-crimson-assassin.webp' },
  { id: 'oni-guard',        name: 'ONI GUARD',        title: 'Iron Demon',       accentColor: '#f97316', portrait: '/src/assets/web/enemy-03-oni-guard.webp' },
  { id: 'shadow-sentry',    name: 'SHADOW SENTRY',    title: 'Crimson Visor',    accentColor: '#dc2626', portrait: '/src/assets/web/enemy-04-shadow-sentry.webp' },
  { id: 'shadow-devil',     name: 'SHADOW DEVIL',     title: 'The Watcher',      accentColor: '#ef4444', portrait: '/src/assets/web/enemy-05-shadow-devil.webp' },
];

/** A random roster entry (used for flavour art only). */
export function randomEnemy() {
  return ENEMY_ROSTER[Math.floor(Math.random() * ENEMY_ROSTER.length)];
}
