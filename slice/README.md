# Devil's Door — Phaser vertical slice (`/slice`)

One handcrafted level ("Sunset Shrine") built to prove the new silhouette action direction:
double-jump, wall-jump, dash with i-frames, 3-hit combo, parry, shuriken, ronin + archer foes,
and an Oni Warlord boss with two phases.

**Controls** — A/D move · W/Space jump (x2, wall-jump) · J slash (x3 combo) · K dash · L shuriken · P pause · M mute · R restart.
Touch controls appear automatically on touch devices.

**Dev URL flags** — `?go=1` skip menu · `?at=chimney|spikes|combat|pit|gauntlet|boss|door` teleport ·
`?debug=1` physics bodies · `?canvas=1` Canvas renderer (fast in headless test runners).

**Structure** — `js/rig.js` procedural silhouette rig + sprite-sheet builder · `js/world_art.js` parallax/tiles/FX textures ·
`js/level.js` level layout · `js/player.js`, `js/foes.js` gameplay · `js/scenes.js` scenes/FX/UI · `js/sfx.js` synthesized audio.

**Art is 100% procedural for now**, so any artwork can be swapped in later without touching gameplay:
replace the generated sheets (`makeSheet`) with Spine/sprite-sheet atlases using the same animation keys
(`idle run jump fall wall dash slash1-3 throw hurt dead`).
