# MECHANICS_LIBRARY.md — Interactive Mechanics Library

> **PROJECT**: DEVIL'S DOOR  
> **TAGLINE**: REACH THE DOOR. TRUST NOTHING.

---

## 1. Platform Mechanics

### 1.1 Stable Ground (`BlockSolid`)
- **Visual**: Dark slate bevelled block with top highlight and ambient drop shadow.
- **Rules**: Fully solid AABB collision from top, left, right, and bottom.
- **Parameters**: `width`, `height`, `x`, `y`.

### 1.2 Crumbling Floor (`BlockCrumble`)
- **Visual**: Subtle hairline cracks in the surface stone.
- **Rules**: Steps on platform trigger a short `0.25s` rattle before collision is disabled and tile drops.
- **Parameters**: `shakeTime`, `dropSpeed`, `respawnOnReset`.

### 1.3 Polarity Shift Platforms (`BlockPhase`)
- **Visual**: Glowing neon glyphs in Cyan (Phase A) and Amber (Phase B).
- **Rules**: Only the active phase color is solid. Jumping or landing can flip the active phase.
- **Parameters**: `phaseGroup`, `initialActive`.

---

## 2. Hazard Mechanics

### 2.1 Telegraphed Spikes (`HazardSpike`)
- **Visual**: Sharp triangular metallic obsidian spikes with faint crimson tip glint.
- **Rules**: Lethal on touch. Can be static, concealed in recesses, or triggered to extend.
- **Parameters**: `orientation` (up, down, left, right), `triggerZone`.

### 2.2 Velocity-Responsive Falling Trap (`HazardVelocityFall`)
- **Visual**: Ceiling stalactite / mechanical weight.
- **Rules**: Calculates fall acceleration proportional to the player's horizontal speed. If the player sprints blindly, it leads the player's position; if the player stops, it drops harmlessly in front.
- **Parameters**: `leadMultiplier`, `dropDelay`.

### 2.3 Shadow Gaze Pulse (`HazardDevilGaze`)
- **Visual**: Crimson vignette and atmospheric shockwave across the screen when the Devil's eye is open.
- **Rules**: Player must stand still or be under a sheltering canopy while the gaze is active; moving causes atmospheric crush.
- **Parameters**: `warningDuration`, `gazeDuration`, `shelterZones`.

---

## 3. Door Deceptions

### 3.1 Genuine Door (`DoorStandard`)
- **Visual**: Tall arched stone portal with inner glowing azure vortex and particle drift.
- **Rules**: Completes level when player touches doorway.

### 3.2 Decoy Door (`DoorDecoy`)
- **Visual**: Identical to Genuine Door from afar, but emits subtle purple smoke embers.
- **Rules**: Approaching causes the decoy to dissipate into mist, activating the genuine exit in a subterranean or elevated alternate route.
- **Parameters**: `dissolveDistance`, `realDoorSpawnPoint`.

### 3.3 Reverse Approach Door (`DoorPolarity`)
- **Visual**: Vortex spins counter-clockwise until approached from the required direction.
- **Rules**: Approaching from the obvious front locks the seal; looping around and entering from the rear unlocks the threshold.
- **Parameters**: `requiredApproachDirection`.
