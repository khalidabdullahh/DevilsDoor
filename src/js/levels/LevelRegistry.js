import { Level01_Arashi } from './Level01_Arashi.js';
import { Level02_Bamboo } from './Level02_Bamboo.js';
import { Level03_Cavern } from './Level03_Cavern.js';
import { Level04_Ice } from './Level04_Ice.js';
import { Level05_Sanctum } from './Level05_Sanctum.js';
import { Level06_Thorns } from './Level06_Thorns.js';
import { Level07_Desert } from './Level07_Desert.js';
import { Level08_Pagoda } from './Level08_Pagoda.js';
import { Level09_Blades } from './Level09_Blades.js';
import { Level10_OniBoss } from './Level10_OniBoss.js';

/**
 * LevelRegistry — Central Registry & Save System for All 10 Campaign Levels.
 */
export class LevelRegistry {
  static TOTAL_LEVELS = 10;

  static getLevel(num) {
    switch (num) {
      case 1: return new Level01_Arashi();
      case 2: return new Level02_Bamboo();
      case 3: return new Level03_Cavern();
      case 4: return new Level04_Ice();
      case 5: return new Level05_Sanctum();
      case 6: return new Level06_Thorns();
      case 7: return new Level07_Desert();
      case 8: return new Level08_Pagoda();
      case 9: return new Level09_Blades();
      case 10: return new Level10_OniBoss();
      default: return new Level01_Arashi();
    }
  }

  static getHighestUnlockedLevel() {
    try {
      const saved = localStorage.getItem('devils_door_max_level');
      return saved ? Math.min(LevelRegistry.TOTAL_LEVELS, Math.max(1, parseInt(saved, 10))) : 1;
    } catch {
      return 1;
    }
  }

  static saveProgress(levelNum, stars = 3) {
    try {
      const currentMax = LevelRegistry.getHighestUnlockedLevel();
      const nextLevel = Math.min(LevelRegistry.TOTAL_LEVELS, levelNum + 1);
      if (nextLevel > currentMax) {
        localStorage.setItem('devils_door_max_level', nextLevel.toString());
      }
      localStorage.setItem(`devils_door_stars_lvl_${levelNum}`, stars.toString());
    } catch {
      // Ignore local storage errors
    }
  }
}
