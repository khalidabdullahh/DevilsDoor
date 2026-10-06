# Devil's Door — AI Art Prompt Pack (enemies + UI pieces)

Goal: every new piece must look like a **finished, hand-illustrated "realistic cartoon" game asset** — NOT a random picture with its background deleted.
Use this file as the single source for prompts. Final files are processed (background keyed out, trimmed, WebP) by the developer/agent.

## 0. Where these are used (be honest about scope)
- Enemy art = **portraits** for bestiary cards, boss intro, loading / death screens, realm lore. The in-game enemies are still drawn by code (canvas / Babylon). AI images cannot give reliable animation frames, so in-game sprites stay code-drawn unless a sprite-sheet pipeline is built later.
- UI art (pedestal, frames, button bases) can replace the CSS versions in `src/css/ui-kit.css` for a painted look.

## 1. The 6 rules that make it look "designed", not "pasted"
1. **One style block** (section 2) pasted at the start of EVERY prompt. Never rewrite it per asset.
2. **Give a style reference**: upload an existing hero (`src/assets/web/hero-01-kage-ryu.webp`) as an image/style reference in tools that support it. Same tool + same reference for all enemies = same family.
3. **Flat chroma background**: ask for a plain flat pure green (#00FF00) background, no floor, no ground shadow, no cast shadow, no gradient, no text. (Most tools cannot output real transparency; clean green is easy to key out.)
4. **Rim light**: ask for a thin cool rim light on the edges, so the character separates from the dark game UI instead of looking cut out.
5. **Whole subject inside the frame** with ~10% empty margin on every side (nothing cropped), square canvas 1:1, highest resolution available (>= 1536 px).
6. **Generate 4, pick 1.** Reject any image with extra limbs/weapons, text, watermark, or a floor.

## 2. STYLE BLOCK (copy this at the start of every prompt)
```
Premium mobile-game character art, realistic-cartoon style: stylized semi-realistic proportions, bold clean ink outlines of varied line weight, painterly cel-shading with soft gradients, rich material detail (cloth folds, worn metal, leather), dark Japanese dark-fantasy mood, limited palette of charcoal, deep indigo and obsidian with ONE strong accent colour, thin cool rim light on the edges. Looks like a hand-painted official game illustration. Flat pure green (#00FF00) background, no floor, no ground shadow, no text, no watermark, no frame. Full subject centered with margin, nothing cropped.
```

## 3. NEGATIVE PROMPT (if the tool has the field; otherwise append "Avoid: ...")
```
photo background, scenery, floor, ground shadow, text, logo, watermark, signature, frame, border, extra limbs, extra fingers, extra weapons, blurry, low resolution, 3D render plastic look, anime chibi, cropped, multiple characters, gradient background
```

## 4. ENEMY PROMPTS (full body, 3/4 view, dynamic idle pose)
Replace nothing; just paste STYLE BLOCK + the line below.

**E1 — Shadow Ronin** (accent: steel blue)
`A lone masked ronin: wide conical straw kasa hat casting a dark shadow over the eyes, long tattered black samurai robe, two katanas (one drawn, one sheathed at the hip), calm menacing stance, faint blue cold glint on blades.`

**E2 — Oni Guard** (accent: ember red)
`A hulking oni guard: horned demon mask with fangs, spiky black-iron plate armor with red lacing, holding a massive spiked iron kanabo club over one shoulder, wide powerful stance, glowing red eyes behind the mask.`

**E3 — Cursed Monk** (accent: sickly violet)
`A floating necromancer monk hovering a hand above the ground, ragged dark robes drifting in the air, wooden prayer beads around the neck and wrists, hollow glowing eyes under a hood, three dark purple curse orbs orbiting him, one hand raised casting.`

**E4 — Crimson Assassin** (accent: crimson)
`A fast assassin in a crouched lunge: face mask split in half red and half black, red sash flowing, form-fitting black wraps, two curved kama sickle blades with crimson edge glow, tense predatory pose.`

**E5 — Shadow Sentry** (accent: glowing red visor)
`An armored ninja sentry: layered dark plate armor, a single glowing crimson visor slit, katana held low in a lunge-ready stance, small shoulder guards, disciplined guard posture.`

**E6 — Oni Boss "Shadow Entity"** (accent: crimson void) — use a larger, 16:9 canvas if possible
`A towering demonic oni samurai phantom made of floating fractured black obsidian crystal shards, hollow chest with a pulsing glowing crimson void core, levitating crystal limbs and a horned crystal crown, imposing boss presence, faint red cracks of light.`

**E7 — Shadow Devil** (accent: single crimson eye) — landscape 16:9, mostly dark silhouette
`A colossal shadowy devil head/face looming, made of smoky black ink and jagged horns, one huge half-open crimson eye glowing at the centre, wisps of dark smoke, ominous watcher presence.`

## 5. UI PIECES (generate on the same green background; ask for symmetry; empty centres)
**U1 — Pedestal**: `A circular ancient stone platform seen from a slight 3/4 top angle, carved Japanese patterns on the rim, subtle glowing purple rune ring, weathered dark stone, empty top surface (nothing standing on it).`
**U2 — Panel frame (empty)**: `An ornate rectangular game UI panel frame, dark obsidian with a thin gold inlay border and small carved corner ornaments, completely empty dark centre, front view, perfectly symmetrical.`
**U3 — Round button base (x4 colours)**: `A single round game button base, dark metal bevelled disc with a glossy highlight and a thick [cyan / gold / purple / grey] rim, NO icon or symbol inside, front view, perfectly circular.`
**U4 — CTA button**: `A wide rounded-rectangle game button, glossy bright gold with dark brown bevelled edge and subtle metallic shine, NO text, front view, symmetrical.`
**U5 — Icons sheet**: `A set of 4 separate game icons on one sheet, evenly spaced: upward arrow (jump), curved katana slash, four-point shuriken, double chevron dash; each on its own dark round badge with a coloured rim; same style for all.`
**U6 — Lock + gem**: `Two icons: a chunky iron padlock with gold trim, and a glowing blue crystal gem coin; same style, evenly spaced.`

## 6. After you generate (hand-off checklist)
- Upload the chosen PNG/JPG files to the chat (or commit them to `src/assets/characters/enemies/`). Name: `enemy-01-shadow-ronin.png`, `enemy-02-oni-guard.png`, `enemy-03-cursed-monk.png`, `enemy-04-crimson-assassin.png`, `enemy-05-shadow-sentry.png`, `boss-oni-shadow-entity.png`, `shadow-devil.png`; UI: `ui-pedestal.png`, `ui-panel.png`, `ui-btn-*.png` etc.
- Developer step: green key -> clean alpha, edge defringe, trim, resize ~640 px (UI pieces by size), export WebP (~100 KB each), add `portrait` fields to the enemy data, wire into screens.
- Licensing: check the AI tool's commercial-use terms before publishing (CrazyGames / stores). Keep the prompt + tool name for each asset.

## 7. Quality bar (reject if any is true)
- Looks like a photo or a different art style than the heroes.
- Green fringe / halo on edges, hard jagged edges, a floor or shadow stuck to the feet.
- Hands/weapons malformed, text or a watermark visible.
- Palette not dark navy/obsidian + one accent (it will clash with the UI).

## 8. HUD TOUCH BUTTONS (painted version of the in-game controls)
Current buttons (logic in `TouchControls.js`, look in `src/css/ui-kit.css`): Move Left, Move Right, Jump (cyan), Slash (gold), Shuriken (purple), Dash (cyan).
Generate ONE button per image (more consistent than a sheet), square 1:1, same tool and same session. Generate **Left only**; the Right button is the mirrored copy (done in post).

**HUD STYLE BLOCK** (paste first):
```
Premium mobile-game UI button asset, realistic-cartoon style: a single round game button seen straight from the front, perfectly circular and centered, dark brushed-metal bevelled disc with a glossy top highlight and deep inner shadow, thick glowing metal rim, bold clean ink-outlined icon in the centre with a soft glow, crisp edges. Flat pure green (#00FF00) background, no drop shadow, no ground shadow, no text, no letters, no hand, no phone mockup. The button fills about 90% of the square canvas.
```
- **Move Left** (silver rim): `A bold double-chevron arrow pointing left, silver-steel rim, white icon.`
- **Jump** (cyan rim): `A thick upward arrow, bright cyan glowing rim, white icon with cyan edge light.`
- **Slash** (gold rim): `A curved katana slash crescent, golden glowing rim, white-gold icon.`
- **Shuriken** (purple rim): `A sharp four-point ninja throwing star, violet glowing rim, white-lilac icon.`
- **Dash** (cyan rim): `A double chevron pointing right with short speed lines, cyan glowing rim, white icon.`
- Optional small HUD buttons (settings gear, sound, restart, fullscreen): same recipe, silver/gold rim.
Hand-off: upload the 5 PNGs; developer keys out green, trims, exports ~192 px WebP, mirrors Left -> Right, and swaps them into the CSS backgrounds (CSS bevel stays as fallback; press / cooldown effects stay in CSS).

## 9. PAINTED HERO SPRITES FOR GAMEPLAY (the 4 shinobi, same style as the enemies)
The current hero sketches have chalk-ground scribbles and paper specks, so they cannot be used in gameplay. Generate clean painted ones instead (one image per hero, 1:1 or 2:3, same tool/session, upload an enemy image as the style reference).
**Pose rule:** side view, facing RIGHT, mid-stride ready/running pose, full body, both feet visible, weapon held low, no floor, no ground shadow.

**GAMEPLAY HERO STYLE BLOCK** (paste first):
```
Premium mobile-game character art, realistic-cartoon style: stylized semi-realistic proportions, bold clean ink outlines of varied line weight, painterly cel-shading, rich material detail, dark Japanese dark-fantasy mood, charcoal and obsidian palette with ONE strong accent colour, thin cool rim light on the edges. Side view facing right, mid-stride ready pose, full body with both feet visible. Flat pure green (#00FF00) background, no floor, no ground shadow, no text, no watermark. Full subject centered with margin, nothing cropped.
```
- **Kage-Ryu** (accent purple): `A hooded shadow ninja in black plate-and-cloth armor, long red scarf flowing behind, three katanas strapped to the back, glowing red eyes, faint violet energy around the fists.`
- **Ryujin** (accent orange): `A dark samurai in tattered horned-helmet armor with an oni-style mask, holding a katana whose blade burns with orange flame.`
- **Raijin** (accent cyan): `A wandering swordsman in a conical straw kasa hat and a tattered black cloak, long katana, cyan lightning glowing in the eyes and along the blade.`
- **Tsukuyomi** (accent crimson): `A masked agile kunoichi in light silver-grey and black armor, red ribbons trailing from the arms, two curved kama sickles held in reverse grip, running pose.`
Hand-off: upload the 4 PNGs. Developer runs `python3 scripts/key-art.py IN src/assets/web/play-<id>.webp --kind enemy --max 640` (ids: `kage_ryu`, `ryujin`, `raijin`, `tsukuyomi`), then sets `playSprite: '/src/assets/web/play-<id>.webp'` (and `playFace: 1`) on the matching `CHARACTER_ROSTER` entry. Until then the code-drawn shinobi is used.

## 10. MORE ENEMIES / BOSS (still missing)
- **Cursed Monk** (in-game enemy type `monk`): needs side view, facing right, floating pose. Use the E3 prompt in section 4 plus the side-view/right-facing rule.
- **Oni Boss** (`OniBossEnemy`, ~182 lines): large boss art, 16:9 or 2:3, facing left, E6 prompt in section 4.
