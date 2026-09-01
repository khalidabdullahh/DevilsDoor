import { CollisionBox } from './CollisionBox.js';

/**
 * PhysicsWorld — Resolves deterministic 2D platformer movement, collisions, and hazards.
 */
export class PhysicsWorld {
  constructor() {
    this.solids = [];
    this.hazards = [];
    this.triggers = [];
    this.activePhase = 'A'; // 'A' or 'B'
  }

  clear() {
    this.solids = [];
    this.hazards = [];
    this.triggers = [];
  }

  addSolid(x, y, width, height, tag = '', phaseGroup = null) {
    const box = new CollisionBox(x, y, width, height, 'solid', tag);
    box.phaseGroup = phaseGroup;
    this.solids.push(box);
    return box;
  }

  addHazard(x, y, width, height, tag = '') {
    const box = new CollisionBox(x, y, width, height, 'hazard', tag);
    this.hazards.push(box);
    return box;
  }

  addTrigger(x, y, width, height, tag = '') {
    const box = new CollisionBox(x, y, width, height, 'trigger', tag);
    this.triggers.push(box);
    return box;
  }

  setPhase(newPhase) {
    this.activePhase = newPhase;
  }

  togglePhase() {
    this.activePhase = this.activePhase === 'A' ? 'B' : 'A';
    return this.activePhase;
  }

  isSolidActive(box) {
    if (!box.active) return false;
    if (box.phaseGroup) {
      return box.phaseGroup === this.activePhase;
    }
    return true;
  }

  /**
   * Moves a box by dx and dy, resolving collisions against active solids.
   * Returns { finalX, finalY, collidedX, collidedY, grounded }
   */
  resolveMovement(box, dx, dy) {
    let finalX = box.x;
    let finalY = box.y;
    let collidedX = false;
    let collidedY = false;
    let grounded = false;

    // --- Move on X axis first ---
    finalX += dx;
    const testBoxX = new CollisionBox(finalX, finalY, box.width, box.height);

    for (const solid of this.solids) {
      if (!this.isSolidActive(solid)) continue;

      if (testBoxX.overlaps(solid)) {
        collidedX = true;
        if (dx > 0) {
          finalX = solid.left - box.width;
        } else if (dx < 0) {
          finalX = solid.right;
        }
        testBoxX.x = finalX;
      }
    }

    // --- Move on Y axis second ---
    finalY += dy;
    const testBoxY = new CollisionBox(finalX, finalY, box.width, box.height);

    for (const solid of this.solids) {
      if (!this.isSolidActive(solid)) continue;

      if (testBoxY.overlaps(solid)) {
        collidedY = true;
        if (dy > 0) {
          finalY = solid.top - box.height;
          grounded = true;
        } else if (dy < 0) {
          finalY = solid.bottom;
        }
        testBoxY.y = finalY;
      }
    }

    return {
      x: finalX,
      y: finalY,
      collidedX,
      collidedY,
      grounded
    };
  }

  /**
   * Checks if player overlaps any active hazard box.
   */
  checkHazardCollision(playerBox) {
    for (const hazard of this.hazards) {
      if (hazard.active && hazard.overlaps(playerBox)) {
        return hazard;
      }
    }
    return null;
  }

  /**
   * Checks for overlapping trigger zones.
   */
  checkTriggerCollisions(playerBox) {
    const overlapping = [];
    for (const trigger of this.triggers) {
      if (trigger.active && trigger.overlaps(playerBox)) {
        overlapping.push(trigger);
      }
    }
    return overlapping;
  }
}
