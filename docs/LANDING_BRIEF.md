# Landing page: creative brief (from the founder)

> Source: the founder's brief, condensed so nothing is lost. When in doubt, re-read this before changing the landing page.
> The founder was unhappy with a first attempt that only laid a 3D overlay on the old card page. **The whole page must be one cinematic experience.**

## One-sentence goal
"DEVIL'S DOOR — THE WEBSITE IS PART OF THE GAME" (not "a website with game art"). **Scroll = player journey.** Mystery, danger, shadow, power, Japanese dark fantasy, cinematic scale.

## Creative rules (decide with these)
- Prefer **atmosphere** over more UI. Prefer a **cinematic transition** over another card. Prefer **visual storytelling** over more text.
- Communicate through movement, composition, lighting, depth and pacing, not through UI.
- Avoid: SaaS layouts, corporate cards, glassmorphism, generic gradients, generic neon, rounded cards/pills, template look, bouncing, constant movement, animation for its own sake.
- Animation feel: slow, heavy, cinematic, intentional. Hierarchy: background slow, environment medium, characters medium-fast, UI fast but subtle.
- Red is an **accent**, not the background. Palette: near-black, charcoal, deep crimson, blood red, ember orange, subtle purple, occasional cyan per realm.
- Ingredients: fog, smoke, embers, particles, dust, moonlight, silhouettes, film grain, depth, parallax, volumetric-feeling light.
- Typography: max 1 display font + 1 UI font (we use Cinzel + Barlow Condensed, self-hosted).
- Buttons feel like **game controls** (thin border, crimson glow, light sweep, arrow movement), not giant pills.

## Scenes (one continuous world, not isolated sections)
| # | Scene | Required content |
|---|-------|------------------|
| 01 | THE VOID | near-black screen, text **"THE DOOR REMEMBERS."** |
| 02 | THE GATE (hero) | giant torii, red moon, mist, distant environment, lone shinobi silhouette, particles. Title **DEVIL'S DOOR**, subtitle **A SHADOW ASSASSIN'S JOURNEY**, primary CTA **ENTER THE DOOR**, secondary **PLAY GAME** (real game launch, `/game`) |
| 03 | ENTER THE SHADOW | camera passes through the gate into darkness |
| 04 | CHOOSE YOUR SHADOW | one hero dominates the screen; art, name, title, short description, stats, weapon; cinematic transitions between heroes (smoke / slash / distortion / particles / light flash), mouse parallax on desktop |
| 05 | THE TEN REALMS | title card |
| 06 | REALM JOURNEY | vertical scroll drives a **horizontal** camera through the 10 realms; per-realm number, name, short atmospheric line, subtle environment effect (blood=ember, frozen=blue snow/fog, forest=green motes, void=dark/sparse...) |
| 07 | THE DOOR (climax) | screen darkens, text **"THE DOOR"** then **"EVERY SHADOW LEADS HERE."**, giant ancient door opens with scroll; behind it near-darkness, then red light / silhouette / glowing eyes. Mysterious and threatening, **not cheesy** |
| 08 | FINAL ENTRY | **"WELCOME TO THE OTHER SIDE."** -> DEVIL'S DOOR -> primary **ENTER THE GAME** (must open the existing game), secondary **EXPLORE THE REALMS** |

## HUD / navigation
Minimal cinematic HUD: logo left, PLAY GAME right, a side rail of chapter numbers where the active one lights up. Compact header on mobile. Scroll progress indicator. Cursor glow on desktop.

## Depth system for the hero (layers, each at a different speed)
sky/stars, moon, clouds/fog, mountains, torii gate, trees/foreground, character, particles/embers.

## Non-functional requirements
- **Do not break the game**: `/game` untouched, PLAY GAME must always work, no change to routes/state/assets of the game.
- Mobile is not an afterthought (the site is mobile-heavy): simplify 3D, fewer particles, less blur, 60 FPS where practical, smooth native scrolling.
- Performance: lazy loading, WebP, IntersectionObserver where useful, GPU-friendly transforms, limited particles, clean up on teardown.
- Accessibility: contrast, semantic HTML, keyboard access, focus states, `prefers-reduced-motion`, real alt text.
- Use **existing assets and the real existing names** (do not invent contradicting lore). Do not replace good art with placeholders.
- Production-quality code: reusable modules, no giant monolith, proper lifecycle, comments only where useful.

## Deviations from the brief (decided on purpose, tell the founder)
- The brief writes the third hero as "RAIJU" and the second title as "DRAGON-BORNE NINJA". The game uses **RAIJIN** and **DRAGON NINJA**; the page follows the game (the brief says to use existing names).
- The brief's example stats (SPEED / POWER / RANGE / DIFFICULTY) do not exist in the game. The page shows only **real** values read from the game: speed, jump power and hearts (plus the weapon name).
- Realm numbers/names/descriptions follow `SCENE_ROSTER`. The one-line descriptions describe the artwork and are not game lore.
