import { CHARACTER_ROSTER } from '../data/CharacterRoster.js';
import { SCENE_ROSTER } from '../data/SceneRoster.js';

/**
 * EconomyManager — Centralized Point Economy, Progression & Unlocks Subsystem for Devil's Door v2.2.
 * Single source of truth for:
 * 1. Persistent Point Wallet (devils_door_points)
 * 2. Unlocked Characters & Selected Character
 * 3. Unlocked Scenes & Selected Scene
 * 4. Anti-Exploit Milestone Rewards (+10 Points per 1000m)
 */
export class EconomyManager {
  constructor() {
    this.STORAGE_KEYS = {
      POINTS: 'devils_door_points',
      UNLOCKED_CHARS: 'devils_door_unlocked_characters',
      SELECTED_CHAR: 'devils_door_selected_character',
      UNLOCKED_SCENES: 'devils_door_unlocked_scenes',
      SELECTED_SCENE: 'devils_door_selected_scene'
    };

    this.listeners = new Set();
    this.lastAwardedMilestone = 0;

    this._ensureDefaults();
  }

  _ensureDefaults() {
    if (typeof localStorage === 'undefined') return;

    // Ensure Points
    if (localStorage.getItem(this.STORAGE_KEYS.POINTS) === null) {
      localStorage.setItem(this.STORAGE_KEYS.POINTS, '0');
    }

    // Ensure Default Unlocked Characters
    const unlockedChars = this.getUnlockedCharacters();
    CHARACTER_ROSTER.forEach((char) => {
      if (char.isFree && !unlockedChars.includes(char.id)) {
        unlockedChars.push(char.id);
      }
    });
    localStorage.setItem(this.STORAGE_KEYS.UNLOCKED_CHARS, JSON.stringify(unlockedChars));

    // Ensure Default Selected Character
    if (!localStorage.getItem(this.STORAGE_KEYS.SELECTED_CHAR)) {
      localStorage.setItem(this.STORAGE_KEYS.SELECTED_CHAR, 'kage_ryu');
    }

    // Ensure Default Unlocked Scenes
    const unlockedScenes = this.getUnlockedScenes();
    SCENE_ROSTER.forEach((scene) => {
      if (scene.isFree && !unlockedScenes.includes(scene.id)) {
        unlockedScenes.push(scene.id);
      }
    });
    localStorage.setItem(this.STORAGE_KEYS.UNLOCKED_SCENES, JSON.stringify(unlockedScenes));

    // Ensure Default Selected Scene
    if (!localStorage.getItem(this.STORAGE_KEYS.SELECTED_SCENE)) {
      localStorage.setItem(this.STORAGE_KEYS.SELECTED_SCENE, 'sunset_torii');
    }
  }

  /**
   * Get Current Point Balance
   */
  getPoints() {
    if (typeof localStorage === 'undefined') return 0;
    const val = parseInt(localStorage.getItem(this.STORAGE_KEYS.POINTS) || '0', 10);
    return isNaN(val) ? 0 : val;
  }

  /**
   * Safely credit points
   */
  addPoints(amount, reason = 'gameplay') {
    if (amount <= 0) return this.getPoints();
    const current = this.getPoints();
    const updated = current + Math.floor(amount);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.STORAGE_KEYS.POINTS, String(updated));
    }
    this._notifyListeners({ type: 'points_changed', balance: updated, delta: amount, reason });
    return updated;
  }

  /**
   * Safely deduct points for purchases
   */
  spendPoints(amount, reason = 'purchase') {
    if (amount <= 0) return true;
    const current = this.getPoints();
    if (current < amount) return false;

    const updated = current - amount;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.STORAGE_KEYS.POINTS, String(updated));
    }
    this._notifyListeners({ type: 'points_changed', balance: updated, delta: -amount, reason });
    return true;
  }

  /**
   * Character Unlocks & Selection
   */
  getUnlockedCharacters() {
    const defaultFree = CHARACTER_ROSTER.filter((c) => c.isFree).map((c) => c.id);
    if (defaultFree.length === 0) defaultFree.push('kage_ryu');
    if (typeof localStorage === 'undefined') return [...defaultFree];
    try {
      const raw = localStorage.getItem(this.STORAGE_KEYS.UNLOCKED_CHARS);
      const list = raw ? JSON.parse(raw) : [...defaultFree];
      for (const id of defaultFree) {
        if (!list.includes(id)) list.push(id);
      }
      return list;
    } catch (_) {
      return [...defaultFree];
    }
  }

  isCharacterUnlocked(id) {
    const char = CHARACTER_ROSTER.find((c) => c.id === id);
    if (char && char.isFree) return true;
    const list = this.getUnlockedCharacters();
    return list.includes(id);
  }

  unlockCharacter(id, price = 0) {
    if (this.isCharacterUnlocked(id)) return true;
    if (price > 0 && !this.spendPoints(price, `unlock_character_${id}`)) {
      return false;
    }

    const list = this.getUnlockedCharacters();
    list.push(id);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.STORAGE_KEYS.UNLOCKED_CHARS, JSON.stringify(list));
    }
    this._notifyListeners({ type: 'character_unlocked', id, price });
    return true;
  }

  getSelectedCharacter() {
    if (typeof localStorage === 'undefined') return 'kage_ryu';
    const sel = localStorage.getItem(this.STORAGE_KEYS.SELECTED_CHAR) || 'kage_ryu';
    return this.isCharacterUnlocked(sel) ? sel : 'kage_ryu';
  }

  setSelectedCharacter(id) {
    if (!this.isCharacterUnlocked(id)) return false;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.STORAGE_KEYS.SELECTED_CHAR, id);
    }
    this._notifyListeners({ type: 'character_selected', id });
    return true;
  }

  /**
   * Scene Unlocks & Selection
   */
  getUnlockedScenes() {
    const defaultFree = SCENE_ROSTER.filter((s) => s.isFree).map((s) => s.id);
    if (defaultFree.length === 0) defaultFree.push('sunset_torii');
    if (typeof localStorage === 'undefined') return [...defaultFree];
    try {
      const raw = localStorage.getItem(this.STORAGE_KEYS.UNLOCKED_SCENES);
      const list = raw ? JSON.parse(raw) : [...defaultFree];
      for (const id of defaultFree) {
        if (!list.includes(id)) list.push(id);
      }
      return list;
    } catch (_) {
      return [...defaultFree];
    }
  }

  isSceneUnlocked(id) {
    const scene = SCENE_ROSTER.find((s) => s.id === id);
    if (scene && scene.isFree) return true;
    const list = this.getUnlockedScenes();
    return list.includes(id);
  }

  unlockScene(id, price = 0) {
    if (this.isSceneUnlocked(id)) return true;
    if (price > 0 && !this.spendPoints(price, `unlock_scene_${id}`)) {
      return false;
    }

    const list = this.getUnlockedScenes();
    list.push(id);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.STORAGE_KEYS.UNLOCKED_SCENES, JSON.stringify(list));
    }
    this._notifyListeners({ type: 'scene_unlocked', id, price });
    return true;
  }

  getSelectedScene() {
    if (typeof localStorage === 'undefined') return 'sunset_torii';
    const sel = localStorage.getItem(this.STORAGE_KEYS.SELECTED_SCENE) || 'sunset_torii';
    return this.isSceneUnlocked(sel) ? sel : 'sunset_torii';
  }

  setSelectedScene(id) {
    if (!this.isSceneUnlocked(id)) return false;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.STORAGE_KEYS.SELECTED_SCENE, id);
    }
    this._notifyListeners({ type: 'scene_selected', id });
    return true;
  }

  /**
   * Gameplay Run Milestone Engine (+10 Points for every 1000 meters)
   * Single-source-of-truth threshold tracking to prevent duplicate crediting.
   */
  resetRunMilestones() {
    this.lastAwardedMilestone = 0;
  }

  checkDistanceMilestones(distanceMeters) {
    const currentMilestone = Math.floor(Math.max(0, distanceMeters) / 1000);
    if (currentMilestone > this.lastAwardedMilestone) {
      const milestonesPassed = currentMilestone - this.lastAwardedMilestone;
      const pointsEarned = milestonesPassed * 10;
      this.lastAwardedMilestone = currentMilestone;
      this.addPoints(pointsEarned, `milestone_${currentMilestone * 1000}m`);
      return {
        pointsEarned,
        totalMilestones: currentMilestone,
        milestoneDistance: currentMilestone * 1000
      };
    }
    return null;
  }

  /**
   * Event Listeners Subscription
   */
  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  _notifyListeners(event) {
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error('[EconomyManager] Listener error:', err);
      }
    }
  }
}
