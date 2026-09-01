# DECEPTION_ENGINE.md — Data-Driven Deception System

> **PROJECT**: DEVIL'S DOOR  
> **TAGLINE**: REACH THE DOOR. TRUST NOTHING.

---

## 1. System Philosophy

The Deception Engine is a modular, event-driven framework that governs all dynamic level behavior, environmental transformations, trap releases, and Door mutations.

Instead of writing hardcoded scripts inside individual update loops, levels declare deceptive interactions using a standard schema:

```
TRIGGER -> CONDITION -> EVENT / ACTION -> RESULT
```

---

## 2. Trigger Types

Triggers are spatial, temporal, or behavioral detectors that watch player actions:

| Trigger Name | Parameters | Description |
|---|---|---|
| `AreaEnterTrigger` | `bounds: Rect, once: boolean` | Fires when the player's bounding box enters a zone. |
| `AreaExitTrigger` | `bounds: Rect` | Fires when the player leaves an area. |
| `PlayerJumpTrigger` | `minHeight: number` | Fires whenever the player initiates a jump. |
| `PlayerLandTrigger` | `targetTag: string` | Fires when the player lands on a specific surface. |
| `PlayerIdleTrigger` | `durationMs: number` | Fires when the player stands still for specified milliseconds. |
| `PlayerMoveBackwardTrigger`| `thresholdPx: number` | Fires when the player reverses direction. |
| `DoorProximityTrigger` | `radiusPx: number` | Fires when player approaches within radius of the Door. |
| `PeriodicTimerTrigger` | `intervalMs: number` | Fires rhythmically at regular intervals. |

---

## 3. Condition Evaluators

Conditions check current state before executing actions:

- `PlayerVelocityCondition`: Checks if player velocity exceeds or drops below a threshold.
- `PlayerGroundedCondition`: Checks if player is currently on solid ground.
- `StateVariableCondition`: Checks custom level variables (e.g. `switchesActivated >= 2`).
- `DevilWatchingCondition`: Checks if the Shadow Devil's eye is currently open.

---

## 4. Action Executors

Actions apply physical, visual, and environmental mutations:

| Action Name | Parameters | Effect |
|---|---|---|
| `ShiftTilesAction` | `targetIds: string[], deltaX, deltaY, duration` | Smoothly moves or collapses level blocks. |
| `ToggleCollisionAction` | `targetIds: string[], solid: boolean` | Enables/disables collision for platforms. |
| `SpawnHazardAction` | `hazardType, startX, startY, trajectory` | Spawns falling spikes, lasers, or moving crushers. |
| `DecoyDoorAction` | `dissolve: boolean, spawnRealAt: Point` | Turns current door into shadow smoke and reveals real door. |
| `PhaseShiftAction` | `colorA, colorB, flipState` | Swaps active solid platforms between two phase colors. |
| `DevilGazeAction` | `active: boolean, durationMs` | Triggers Shadow Devil gaze event with deadly environmental pulse. |
| `CameraShakeAction` | `intensity: number, durationMs: number` | Adds subtle camera trauma for impact feedback. |
| `PlaySoundAction` | `soundKey: string` | Plays procedural audio cues (trap snap, eerie hum). |

---

## 5. Example JSON Level Declaration

```json
{
  "deceptions": [
    {
      "trigger": { "type": "AreaEnter", "bounds": { "x": 300, "y": 400, "w": 80, "h": 60 } },
      "conditions": [ { "type": "PlayerVelocityXGreaterThan", "value": 100 } ],
      "actions": [
        { "type": "ShiftTiles", "targetIds": ["bridge_center"], "deltaY": 200, "duration": 0.3 },
        { "type": "PlaySound", "sound": "trap_snap" },
        { "type": "CameraShake", "intensity": 4, "duration": 0.2 }
      ]
    }
  ]
}
```
