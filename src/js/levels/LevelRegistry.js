import { Level1 } from './Level1.js';
import { Level2 } from './Level2.js';
import { Level3 } from './Level3.js';
import { Level4 } from './Level4.js';
import { Level5 } from './Level5.js';

/**
 * LevelRegistry — Catalog of all handcrafted prototype levels.
 */
export class LevelRegistry {
  static getLevels() {
    return [
      Level1,
      Level2,
      Level3,
      Level4,
      Level5
    ];
  }

  static createLevel(index) {
    const levels = this.getLevels();
    if (index < 0 || index >= levels.length) {
      return null;
    }
    const LevelClass = levels[index];
    return new LevelClass();
  }

  static getTotalLevels() {
    return this.getLevels().length;
  }
}
