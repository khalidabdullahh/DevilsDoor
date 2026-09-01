# GAMEPLAY_SPEC.md — Player Physics & Gameplay Systems

> **PROJECT**: DEVIL'S DOOR  
> **TAGLINE**: REACH THE DOOR. TRUST NOTHING.

---

## 1. Core Gameplay Loop

```
OBSERVE -> MOVE -> ENCOUNTER DECEPTION -> FAIL OR SUCCEED -> LEARN -> RETRY -> ADAPT -> REACH THE DOOR
```

1. **Observe**: Player surveys the initial room layout, platform placement, and visible Door.
2. **Move**: Player begins movement with tight, responsive controls.
3. **Encounter Deception**: An expectation is challenged (floor breaks, spikes delay, Door transforms, gravity shifts).
4. **Fail or Succeed**: If failed, the trap's mechanism and clue are fully revealed.
5. **Learn & Retry**: Instant restart (<80ms) keeps momentum high without frustration.
6. **Adapt & Clear**: Player executes the counter-intuitive or discovered true path and clears the level.

---

## 2. Physics & Movement Constants

The physics system is deterministic and tuned for high responsiveness:

| Constant | Value | Description |
|---|---|---|
| `GRAVITY` | `1400 px/s²` | Snappy downward acceleration ensuring fast descent. |
| `MAX_FALL_SPEED` | `900 px/s` | Terminal velocity cap. |
| `MOVE_ACCELERATION` | `2800 px/s²` | Near-instant lateral acceleration to full run. |
| `MOVE_DECELERATION` | `3200 px/s²` | Snappy stop without slippery sliding. |
| `MAX_RUN_SPEED` | `280 px/s` | Readable character traversal speed. |
| `JUMP_VELOCITY` | `-520 px/s` | Initial jump upward impulse. |
| `VARIABLE_JUMP_FACTOR` | `0.45` | Cutting jump key early dampens jump velocity for short hops. |
| `COYOTE_TIME` | `100 ms` | Grace window allowing jumps after walking off edges. |
| `JUMP_BUFFER_TIME` | `120 ms` | Queues jump input before touching ground. |
| `RESPAWN_DELAY` | `80 ms` | Duration between death and player reappearance. |

---

## 3. Player Character Identity

- **Name**: The Wanderer / The Seeker
- **Appearance**: Sleek, minimalist humanoid silhouette with an inner bioluminescent cyan/amber core and subtle motion trail.
- **Hitbox**: Crisp rectangular AABB (`24px` width $\times$ `36px` height) centered on visual sprite.
- **States**: `IDLE`, `RUNNING`, `JUMPING`, `FALLING`, `DEAD`, `VICTORY`, `PHASED`.

---

## 4. Input Mapping

- **Desktop Keyboard**:
  - Left: `A`, `ArrowLeft`
  - Right: `D`, `ArrowRight`
  - Jump: `W`, `ArrowUp`, `Space`
  - Quick Restart: `R`
  - Pause / Menu: `Escape`, `P`
- **Gamepad**:
  - D-Pad or Left Stick for Movement
  - Button A / Cross for Jump
  - Button Y / Triangle for Restart
- **Mobile Touch**:
  - Left & Right digital thumb-pads on the left quadrant.
  - Large circular `JUMP` action button on the right quadrant.
  - Top HUD quick restart and pause buttons.
