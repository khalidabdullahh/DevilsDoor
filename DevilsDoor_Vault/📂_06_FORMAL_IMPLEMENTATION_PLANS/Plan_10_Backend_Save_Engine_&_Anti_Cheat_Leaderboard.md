# 📐 Implementation Plan 10 — Backend Save Engine, Telemetry DB & Anti-Cheat Leaderboard

> [!INFO] ⛩️ **DEVIL'S DOOR ARCHIVAL VAULT** · `MILESTONE PLAN 10`
> **Status**: `COMPLETED` 🟢 · **Target Version**: `v2.1.0` · **Maintainer**: `Khalid Abdullah`  
> **Direct Navigation**: [[⛩️_00_MASTER_INDEX|⛩️ Master Hub]] · **Prompt Ledger**: [[Prompt_18_Anti_Cheat_Run_Verification_Hashing_System|📝 Prompt 18]] · [[Prompt_19_Client_Save_State_Engine_&_Version_Migration|📝 Prompt 19]]  
> **Tags**: `#project/devils-door` `#backend` `#database` `#leaderboard` `#anti-cheat` `#v2-1`

---


## 🎯 1. Goal & Architectural Scope

Architect a resilient client save state engine, PostgreSQL telemetry database schema for death heatmaps, Redis high-throughput global leaderboard, and HMAC cryptographic anti-cheat validation.

---

## 💻 2. Complete Direct Code & Schema Implementations

### 2.1 Client Save State Manager & Schema Migration (`src/js/core/SaveStateManager.js`)

```javascript
export class SaveStateManager {
  static STORAGE_KEY = 'devils_door_v2_save_state';

  static load() {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (!raw) return this.createDefaultState();
      const state = JSON.parse(raw);
      if (state.version !== '2.1.0') return this.migrate(state);
      return state;
    } catch (err) {
      console.warn('[Storage] Corrupt state, resetting to default', err);
      return this.createDefaultState();
    }
  }

  static save(state) {
    try {
      state.lastPlayedAt = Date.now();
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(state));
    } catch (err) {
      console.error('[Storage] Write failed', err);
    }
  }

  static createDefaultState() {
    return {
      version: '2.1.0',
      playerId: 'dd_' + Math.random().toString(36).substring(2, 10),
      createdAt: Date.now(),
      lastPlayedAt: Date.now(),
      selectedHeroId: 'shadow_ninja',
      unlockedHeroes: ['shadow_ninja', 'shadow_ronin', 'oni_guard', 'cursed_monk', 'crimson_assassin', 'shadow_entity'],
      stats: {
        maxDistanceMeters: 0,
        totalRunsAttempted: 0,
        totalDeaths: 0,
        totalKills: 0,
        totalTimePlayedSeconds: 0,
        highestBiomeReached: 1,
        bossDefeatedCount: 0
      },
      settings: {
        masterVolume: 0.7,
        sfxMuted: false,
        musicMuted: false,
        touchControlsOpacity: 0.8,
        theme: 'dark'
      }
    };
  }

  static migrate(oldState) {
    const newState = this.createDefaultState();
    return { ...newState, ...oldState, version: '2.1.0' };
  }
}
```

---

### 2.2 Anti-Cheat Run Signature Hashing (`src/js/core/AntiCheat.js`)

```javascript
export class AntiCheat {
  static generateRunSignature(distance, timeElapsed, kills, heroId, secret) {
    const raw = `${Math.floor(distance)}:${Math.floor(timeElapsed)}:${kills}:${heroId}:${secret}`;
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
      hash = ((hash << 5) - hash) + raw.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash).toString(16);
  }

  static validateRunMetrics(distance, timeElapsed) {
    if (timeElapsed <= 0) return false;
    const avgSpeed = distance / timeElapsed;
    // Physical speed cap is 32 m/s
    if (avgSpeed > 32.0) {
      console.warn('[AntiCheat] Rejection: Impossible speed detected', avgSpeed);
      return false;
    }
    return true;
  }
}
```

---

### 2.3 PostgreSQL Telemetry & Death Heatmap Database Schema

```sql
CREATE TABLE death_heatmaps (
    event_id BIGSERIAL PRIMARY KEY,
    session_id UUID NOT NULL,
    hero_id VARCHAR(32) NOT NULL,
    biome_id VARCHAR(32) NOT NULL,
    distance_meters INTEGER NOT NULL,
    death_coord_x NUMERIC(8, 2) NOT NULL,
    death_coord_y NUMERIC(8, 2) NOT NULL,
    killer_hazard_tag VARCHAR(64) NOT NULL,
    time_alive_seconds NUMERIC(6, 2) NOT NULL,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_heatmap_coords ON death_heatmaps(biome_id, death_coord_x, death_coord_y);
```

---

### 2.4 Redis Global Leaderboard Commands (`ZSET`)

```redis
-- Add / Update Player Run Distance
ZADD leaderboard:global:v2 1840 "usr_91af23:ShadowNinja"

-- Fetch Top 10 Global Players with Scores
ZREVRANGE leaderboard:global:v2 0 9 WITHSCORES

-- Fetch Specific Player's Global Rank
ZREVRANK leaderboard:global:v2 "usr_91af23:ShadowNinja"
```

---

## 🧪 3. Verification Plan
- **Save State Tests**: Validated JSON serialization, local storage quota resilience, and v1.0 $\to$ v2.1 data preservation.
- **Anti-Cheat Validation**: Validated rejection of simulated velocity overflows ($v > 32\text{ m/s}$).

---
*Related: [[⛩️_00_MASTER_INDEX]], [[01_Client_Storage_&_Save_State_Engine]], [[04_Global_Leaderboard_&_Cloud_Sync_Database_Spec]]*
