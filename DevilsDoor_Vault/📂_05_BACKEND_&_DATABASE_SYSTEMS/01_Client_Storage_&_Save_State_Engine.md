---
title: "Client-Side Storage & Save State Engine"
aliases: ["Save State Engine", "LocalStorage Schema", "IndexedDB"]
tags:
  - backend
  - database
  - storage
  - localstorage
  - project/devils-door
created: 2026-09-04
status: active
---

# 💾 Client-Side Storage & Player Save State Engine

> **Vault Hub**: [[⛩️_00_MASTER_INDEX]]  
> **Related**: [[02_Telemetry_&_Analytics_Database_Schema]], [[04_Global_Leaderboard_&_Cloud_Sync_Database_Spec]]

---

## 🏛️ Storage Architecture Overview

Devil's Door features an instantaneous, zero-latency client storage engine designed to persist player progression, unlock states, selected shinobis, audio configuration, and high score telemetry across sessions without requiring a login barrier.

```mermaid
graph TD
    GameCore[🎮 Devil's Door Game Core] --> StorageManager[💾 SaveStateManager]
    StorageManager --> LocalStorage[⚡ Primary: Web LocalStorage API]
    StorageManager --> MemoryCache[🚀 In-Memory RAM Cache (Instant Access)]
    StorageManager --> SyncQueue[🔄 Cloud / Publisher Sync Queue]
    
    LocalStorage --> Key1[devils_door_v2_save_state]
    LocalStorage --> Key2[devils_door_selected_hero]
    LocalStorage --> Key3[devils_door_audio_settings]
    LocalStorage --> Key4[devils_door_high_score]
```

---

## 📋 Data Schema Specification

### 1. Master Save State Record (`devils_door_v2_save_state`)

```typescript
interface PlayerSaveState {
  version: string;                 // "2.1.0"
  playerId: string;                // UUIDv4 (e.g. "dd_usr_8f7b2a1e")
  createdAt: number;               // Epoch timestamp (ms)
  lastPlayedAt: number;            // Epoch timestamp (ms)
  
  // Selected Hero & Progression
  selectedHeroId: string;          // "shadow_ninja" | "shadow_ronin" | "oni_guard" | "cursed_monk" | "crimson_assassin" | "shadow_entity"
  unlockedHeroes: string[];        // Array of hero IDs unlocked
  
  // Statistics & High Scores
  stats: {
    maxDistanceMeters: number;     // e.g. 1420 (Peak run distance)
    totalRunsAttempted: number;    // Lifetime run count
    totalDeaths: number;           // Total deaths across all runs
    totalKills: number;            // Enemies/hazards cleaved
    totalTimePlayedSeconds: number;// Cumulative gameplay duration
    highestBiomeReached: number;   // 1 to 6 (Sunset to Ancient Ruins)
    bossDefeatedCount: number;     // Times Shadow Entity was slain
  };

  // Level Clear Matrix
  levelProgress: {
    [levelId: string]: {
      cleared: boolean;
      bestTimeSeconds: number;
      deathCount: number;
      starsEarned: number;         // 1 to 3
    };
  };

  // Preferences & Audio
  settings: {
    masterVolume: number;          // 0.0 to 1.0 (default 0.7)
    sfxMuted: boolean;
    musicMuted: boolean;
    touchControlsOpacity: number;  // 0.2 to 1.0
    theme: 'dark' | 'light' | 'system';
  };
}
```

---

## 💻 Implementation: Zero-Lag Storage Manager (`src/js/core/SaveStateManager.js`)

```javascript
export class SaveStateManager {
  static STORAGE_KEY = 'devils_door_v2_save_state';
  
  static load() {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (!raw) return this.createDefaultState();
      const state = JSON.parse(raw);
      // Version migration handler
      if (state.version !== '2.1.0') {
        return this.migrate(state);
      }
      return state;
    } catch (err) {
      console.warn('[Storage] Corrupt save state, reinitializing default', err);
      return this.createDefaultState();
    }
  }

  static save(state) {
    try {
      state.lastPlayedAt = Date.now();
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(state));
    } catch (err) {
      console.error('[Storage] Failed to write localStorage', err);
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
      levelProgress: {},
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

## 🔒 Security & Anti-Corruption Safeguards
1. **Schema Fallback**: Any JSON parsing errors gracefully fall back to the default state without crashing the game loop.
2. **Atomic Writes**: State updates are committed synchronously on run termination, death, and pause events.
3. **Storage Quota Resilience**: Uses compact JSON payloads ($< 4\text{ KB}$), consuming $< 0.1\%$ of the browser's 5MB localStorage quota.

---
*Related: [[⛩️_00_MASTER_INDEX]], [[02_Telemetry_&_Analytics_Database_Schema]], [[04_Global_Leaderboard_&_Cloud_Sync_Database_Spec]]*
