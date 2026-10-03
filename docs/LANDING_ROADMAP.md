# Landing page: implementation plan (phase by phase)

Read first: [`docs/LANDING_BRIEF.md`](LANDING_BRIEF.md) (what the founder wants) and the "Landing page" section of [`AGENTS.md`](../AGENTS.md) (how it is built, how to test it).
Branch of this work: `cinematic-landing` (not merged to `main` yet). The redirect hotfix is already on `main` (see Phase 0).

## Where we are (honest status)

| Area | State |
|------|-------|
| 01 Void, 02 Gate (hero), 03 Shadow tunnel | built and **viewed in a real browser** (1366x768) |
| 04 Shinobi showcase (4 heroes, dissolve) | built and viewed on desktop |
| 05/06 Realm journey (10 realms, mist-seam slide, FX) | built and viewed on desktop |
| **07 The Door, 08 Final entry** | **code written, NEVER viewed.** Door-leaf direction, textures, light shafts, eyes, final camera move are unverified |
| **Phone / tablet layouts of the new page** | **never viewed** (only CSS written). Treat as unverified |
| Static fallback (no JS / no WebGL / reduced motion) | CSS + regex tests only, never viewed |
| Real-GPU performance, iOS Safari | not tested (headless software WebGL runs at ~1-3 fps, so frame rate is unknown) |
| Automated tests | 37 landing/select checks + repo integrity pass; none of them judge how it *looks* |

Verified in the headless browser: no console errors, fonts load (Cinzel + Barlow Condensed), intro, title + CTAs, HUD rail, tunnel text, hero art with dissolve, realm slide.

## Definition of done for the whole landing
Each scene looks intentional at 390x844, 768x1024, 1366x768, 1920x1080; no text overlaps art in a way that hurts reading; `/game` opens from every CTA; no console errors; first paint is black + one line (fast); static fallback is readable; the founder signs off on the look.

---

## Phase 0: production check (5 min)
The `/game` redirect loop (`ERR_TOO_MANY_REDIRECTS`) is **already fixed on `main`** (commit `3cdba3a` removed `_redirects`; Cloudflare Pages serves `game.html` at `/game` by itself). The branch `fix-game-redirect-loop` is obsolete: delete it.
1. After the next deploy open `https://<site>/game` and `/play` on a phone: both must load the game.
2. Never add `/game /game.html 200` style rewrites back.
**Done when:** PLAY GAME works on the live site.

## Phase 1: verify and fix the unverified scenes (most important)
1. Run `scripts/visual/shot.mjs` (see AGENTS.md) at scroll `0.78 0.82 0.86 0.9 0.94 0.97 1` for 1366x768 and look at every image.
2. Door (`world.js`, `updateDoor`): leaves must swing **away from the camera** (flip the sign of `rotation.y` if they swing toward it), the sigil must split across the two leaves, the gap must show red light first, then darkness + eyes. Fix camera framing (`S.camZ` in `main.js`): the full door must fit at 390 wide too.
3. Final scene: the camera passes through the opening (`camZ` 8 -> -22). Text "WELCOME TO THE OTHER SIDE." then the title + CTAs must be readable over the corridor glow.
4. Check `runTexts()` in `main.js` (the transform branch is convoluted: simplify it and make every `[data-in]` element behave the same way).
**Done when:** screenshots of 07 and 08 look mysterious/threatening and not cheesy; both CTAs are clickable at the end.

## Phase 2: mobile pass (the site is mobile-heavy)
1. Screenshot every scene at 390x844 and 360x640. Known risks: hero title + 2 buttons vs gate/moon; hero info panel (bio + 4 stat rows) overflowing at 640 high; realm names on 3 lines; door framing; HUD header.
2. Low tier (`low` in `main.js`): fewer particles (done), `OCT=3` (done), DPR 1.4 (done). Verify the 100lvh canvas does not resize on URL-bar changes (only width changes or >120px height changes re-allocate).
3. Test on at least one real Android phone and one iPhone (Safari): `svh/lvh`, scroll smoothness, memory (the 4 hero WebPs + max 5 realm textures are the budget).
**Done when:** every scene readable at 360x640, scroll feels native, no jank on a mid-range phone.

## Phase 3: art-direction polish (founder reviews)
Hero: the moon has no surface detail (shader `BACKDROP_FRAG`, `surf`), lake reflection is hidden by the nearest ridge, branches are heavy in the top-center. Shinobi showcase: left edge of the art is still visible as a soft vertical band; tune the dissolve (`CHAR_FRAG`, `edge`, slash flash) so it is felt, not blinding. Realms: per-realm FX presets (`REALM_FX`) were chosen from the artwork; review each. Door: maybe add carved details. Do **not** add cards or more text (see brief rules).
**Done when:** the founder says it feels like a game, not a website.

## Phase 4: performance
1. Real device profiling (Chrome Performance panel, Safari timeline). Targets: 60 fps desktop, 30+ fps mid phone.
2. `main.js` already drops the DPR when frames are slow (floor 1.0). Add a second step (disable fbm clouds / fewer ridges) if still slow.
3. Memory: `world.keepRealms()` keeps only +-2 realm textures; hero textures stay (4 x 4 MB). Check there are no leaks over a full scroll up/down (renderer.info).
4. First load: HTML+CSS+JS+Three.js < 900 KB (tested). Consider splitting `world.js` (35 KB, three sets in one file) into `journey.js`, `quad.js`, `door.js`.
**Done when:** measured numbers are written in this file.

## Phase 5: accessibility and the static fallback
1. Look at the static layout (`html.static`: disable JS, or emulate reduced motion, or block WebGL). It must be a clean readable page with all content, images lazy, CTAs working.
2. Keyboard: tab order (skip link, HUD play, rail, CTAs), visible focus, rail links scroll to the scene.
3. Contrast of the grey UI text on the art; `aria-hidden` on decorative layers (already), `aria-label`s on the rail.
4. Reduced motion currently switches to the static page (no 3D at all). Optionally keep a still 3D frame.
**Done when:** Lighthouse accessibility >= 95 and the static page is signed off.

## Phase 6: content and SEO (ask the founder)
1. Confirm the one-line realm descriptions (they describe the artwork, not lore) and the footer legal line (kept from the old page: copyright, "Commercial rights reserved", "PEGI 12 compliant").
2. `og:image` / `twitter:image` still point at the old master cover. Consider a new social image (a screenshot of the hero).
3. `sitemap.xml`, `robots.txt` unchanged. JSON-LD description already updated.
**Done when:** founder confirms the copy.

## Phase 7: game hand-off (optional polish)
"ENTER THE GAME" could play a short push-through-the-door + fade to black, then navigate to `/game`. Keep a plain `<a href="/game">` as the base so it works without JS. Never change `/game` or its routes.

## Phase 8: cleanup
1. Dead files now unused by the page: `website/css/website.css`, `website/css/theme.css`, `website/js/website.js`, the 35 MB `website/assets/` duplicate, and in `src/assets/web/`: `hero-0N-*.webp` (except `hero-01-kage-ryu.webp`, used for the silhouette), `master-cover.webp`, `logo-760.webp`. Confirm nothing references them (`grep -r`) before deleting.
2. Update ADR-007 in `docs/DECISIONS.md` from PROPOSED to LOCKED once the founder confirms.
3. Keep `scripts/test-landing-and-select.mjs` green and extend it when the page changes.

---

## Game roadmap items found during the landing work (separate from the landing)
- **Progression has no purpose**: the last owner commit unlocked every hero/realm for free, so Points buy nothing. Decide: skill tree / artifacts / hero abilities.
- Hero abilities barely differ (only speed 500-570, jump 540-575, hearts 3-4).
- Gameplay HUD: two fullscreen buttons overlap top-right in landscape.
- Raijin's sketch art has a visible rectangular paper background.
- Gamepad support was only partly wired (just-pressed edge detection added; no UI for it).
