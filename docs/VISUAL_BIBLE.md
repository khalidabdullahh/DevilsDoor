# VISUAL_BIBLE.md — 2.5D Art & Presentation Direction

> **PROJECT**: DEVIL'S DOOR  
> **TAGLINE**: REACH THE DOOR. TRUST NOTHING.

---

## 1. Visual Philosophy

```
MINIMAL · MODERN · ATMOSPHERIC · READABLE
```

Devil's Door utilizes a 2.5D presentation style combining crisp geometric silhouettes with orthographic depth extrusion, volumetric soft lighting, and subtle particle ambiance.

1. **High Contrast Readability**: Critical gameplay elements (Player, Hazards, Solid Platforms, and Door) are immediately discernible from background geometry.
2. **Restraint & Minimalism**: Backgrounds avoid cluttered visual noise. Empty space serves the atmosphere through subtle gradient fog and depth drop-shadows.
3. **No Copied Visual Identifiers**: Custom geometric proportions, distinct color themes, bespoke glow shaders, and an original Shadow Devil silhouette.

---

## 2. Color Families & Palette Tokens

Each Act or level family uses a dedicated, controlled palette to evoke distinct emotional tones:

### Palette Family A — "Discovery Slate" (Levels 1-3)
- **Background**: Deep Void `#0c0f17` to `#161c28`
- **Platforms**: Slate Bevel `#222b3d` (Face), `#171e2c` (Extruded Depth)
- **Player**: Luminous Cyan `#38bdf8` with inner core `#f8fafc`
- **Hazards**: Crimson Glint `#ef4444`
- **Door**: Ethereal Azure `#0ea5e9` with white portal ring

### Palette Family B — "The Shadow Void" (Levels 4-5)
- **Background**: Abyssal Purple `#0b0914` to `#161226`
- **Platforms**: Obsidian Purple `#271f3b` (Phase A: `#38bdf8`, Phase B: `#f59e0b`)
- **Hazards**: Molten Red `#dc2626`
- **Shadow Devil**: Pure Silhouette `#040307` with glowing Ruby Eye `#ff1e56`

---

## 3. Lighting & Depth Pipeline

- **Perspective Extrusion**: Platform tiles render an extruded bottom/side face (30° isometric drop angle) producing 2.5D physical depth.
- **Dynamic Vignette**: Subtle radial darkness around the viewport edges focusing player attention on the central action.
- **Glow & Bloom**: Crisp, low-cost canvas radial gradients creating bloom around the Player core, Door portal, and laser traps.
- **Particle Systems**: Low-density ambient dust specks, disintegrating death embers, and Door vortex rings.
