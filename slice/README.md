# Devil's Door — Phaser game (site root `/`)

One handcrafted level ("Sunset Shrine") built to prove the new silhouette action direction:
double-jump, wall-jump, dash with i-frames, 3-hit combo, parry, shuriken, ronin + archer foes,
and an Oni Warlord boss with two phases.

**Controls** — A/D move · W/Space jump (x2, wall-jump) · J slash (x3 combo) · K dash · L shuriken · P pause · M mute · R restart.
Touch controls appear automatically on touch devices.

**Dev URL flags** — `?level=N` skip the menus · `?at=start|boss|door` teleport · `?realm=sunset` old sunset realm (default is the moonlit gorge) · `?at=chimney|spikes|combat|pit|gauntlet|boss|door` teleport ·
`?debug=1` physics bodies · `?canvas=1` Canvas renderer (fast in headless test runners).

**Flow** — (portrait phones: Rotate screen with a button that goes fullscreen + landscape) -> black loading screen -> Realm map (floating islands) -> Level grid (stars, locks) -> game. Progress (stars) is saved in localStorage. Audio + fullscreen unlock on the first tap/key.

**Content** — 2 playable realms (Moonlit Gorge, Sunset Shrine; 4 more islands are 'coming soon'), 5 levels each: First Steps, Chimney Climb, Ronin Road, The Gauntlet, Oni Warlord. Levels are composed from handcrafted sections in `js/level.js`. Stars: 1 = finish, 2 = at most 1 death, 3 = no deaths + 70% orbs.

**Structure** — `js/menus.js` realm + level screens · `js/kit.js` cartoon UI kit (glossy buttons, panels, ribbon, stars, icons, island art) · `js/progress.js` saved stars · `js/game.js` Phaser config · `js/ui.js` HUD/pause/touch UI · `js/ui_art.js` button art · `js/world_moon.js` night realm · `js/rig.js` procedural silhouette rig + sprite-sheet builder · `js/world_art.js` parallax/tiles/FX textures ·
`js/level.js` level layout · `js/player.js`, `js/foes.js` gameplay · `js/scenes.js` scenes/FX/UI · `js/sfx.js` synthesized audio.

**Art is 100% procedural for now**, so any artwork can be swapped in later without touching gameplay:
replace the generated sheets (`makeSheet`) with Spine/sprite-sheet atlases using the same animation keys
(`idle run jump fall wall dash slash1-3 throw hurt dead`).
