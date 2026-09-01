# LEVEL_DESIGN_BIBLE.md — Level Design Rules & Uniqueness Matrix

> **PROJECT**: DEVIL'S DOOR  
> **TAGLINE**: REACH THE DOOR. TRUST NOTHING.

---

## 1. Golden Rules of Level Design

1. **One Central Idea Per Level**: Every level must revolve around a specific, memorable subversion.
2. **Every Death Must Teach**: If a player dies, they must immediately see what went wrong and formulate a hypothesis for the next attempt.
3. **Pacing & Restraint**: Avoid stacking 5 unrelated random traps into one level. A great deceptive level introduces a premise, challenges the initial instinct, and rewards the counter-intuitive execution.
4. **Immediate Retries**: Death respawn is instant (<80ms) to maintain psychological engagement and rhythm.

---

## 2. Uniqueness Matrix — Prototype Levels 1 through 5

| Level | Title | Primary Mechanic | Player Expectation | Deception / Subversion | Learnable Clue | Solution | Door Behavior |
|---|---|---|---|---|---|---|---|
| **01** | *The First Assumption* | Collapsing Bridge | Direct sprint across top bridge. | Obvious bridge collapses safely to lower tier; jumping top blindly hits ceiling spike. | Cracks appear along top ledge; illuminated path below. | Walk off or drop down; navigate lower safe terrace to reach door. | Standard Door on ground level. |
| **02** | *Patience and Peril* | Velocity Trap | Sprint fast to outrun falling spikes. | Falling spikes lead player sprint speed; running fast guarantees death. | Spikes twitch before falling; pausing causes spikes to drop safely ahead. | Walk steadily or pause for 0.5s, allowing trap to discharge harmlessly. | Elevated Door reached after trap disarms. |
| **03** | *The False Exit* | Decoy Portal | Reaching the visible Door ends the level. | Upper Door dissolves into shadow mist; genuine lower passage unlocks. | Door emits distinct purple embers instead of pure cyan. | Approach decoy to trigger the dimensional unlock, then drop into the true lower sanctum. | Decoy dissolves $\to$ True Door unlocks below. |
| **04** | *Phase Shift* | Jump Polarity | Jump across standard platforms. | Every jump inverts solid platform colors (Cyan $\leftrightarrow$ Amber). | Glyph symbols on platforms match current player aura color. | Time jumps so target platform matches landing polarity. | Door requires matching final phase color. |
| **05** | *Gaze of the Devil* | Shadow Stealth Gaze | Normal platforming traversal. | Shadow Devil opens crimson eye; moving during gaze triggers atmospheric kill. | Heartbeat audio cue and crimson vignette before eye opens. | Move rapidly while eye is shut; freeze completely during the gaze pulse. | Door opens after navigating past the grand altar. |
