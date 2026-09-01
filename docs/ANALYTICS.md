# ANALYTICS.md — Privacy-First Telemetry Architecture

> **PROJECT**: DEVIL'S DOOR  
> **TAGLINE**: REACH THE DOOR. TRUST NOTHING.

---

## 1. Principles of Privacy

1. **Zero Personal Identifiable Information (PII)**: We do not track names, emails, IP addresses, location data, or device fingerprints.
2. **Gameplay Balancing Focused**: Telemetry exists strictly to diagnose broken levels, measure difficulty spikes, and optimize learning curves.
3. **Opt-Out by Default in Local Builds**: Analytics dispatch is disabled in offline and local development environments.

---

## 2. Event Schema

| Event Name | Key Parameters | Purpose |
|---|---|---|
| `session_start` | `client_version, viewport_type (mobile/desktop)` | Measures platform distribution. |
| `level_start` | `level_id, attempt_number` | Tracks level initiation. |
| `level_death` | `level_id, death_x, death_y, trap_tag, time_spent_s` | Pinpoints where and how players fail to calibrate fairness. |
| `level_complete` | `level_id, total_deaths, total_time_s` | Measures completion rate and difficulty curve. |
| `level_abandon` | `level_id, deaths_before_quit, time_spent_s` | Identifies frustrating bottlenecks. |
| `intro_skipped` | `timestamp_s` | Measures intro engagement and pacing. |
| `theme_switched` | `theme (light/dark/system)` | Evaluates UI theme popularity. |

---

## 3. Implementation Interface

All events are dispatched through the centralized `AnalyticsManager`:

```javascript
import { AnalyticsManager } from './core/AnalyticsManager.js';

// Example dispatch
AnalyticsManager.track('level_death', {
  levelId: 2,
  deathX: 450,
  deathY: 280,
  trapTag: 'falling_spikes_cluster',
  timeSpentSec: 4.2
});
```
