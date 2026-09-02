/**
 * PhysicsWorld3D — Deterministic 3D Platformer Collision & World Resolver.
 */
export class PhysicsWorld3D {
  constructor() {
    this.solids = [];
    this.hazards = [];
  }

  clear() {
    this.solids = [];
    this.hazards = [];
  }

  addSolid(x, y, width, height, depth = 2.0, tag = '', mesh = null) {
    const solid = {
      x,
      y,
      width,
      height,
      depth,
      tag,
      mesh,
      active: true,
      originalY: y,
      isFalling: false,
      fallSpeed: 0
    };
    this.solids.push(solid);
    return solid;
  }

  addHazard(x, y, width, height, tag = '') {
    const hazard = { x, y, width, height, tag, active: true };
    this.hazards.push(hazard);
    return hazard;
  }

  /**
   * Resolves player movement against all active solid blocks.
   * Player bounding box: [x - width/2, y, width, height]
   */
  resolveMovement(px, py, pw, ph, dx, dy) {
    let finalX = px;
    let finalY = py;
    let collidedX = false;
    let collidedY = false;
    let grounded = false;

    const halfW = pw / 2;

    // --- 1. Move on X Axis ---
    finalX += dx;
    for (const solid of this.solids) {
      if (!solid.active) continue;

      const solidLeft = solid.x - solid.width / 2;
      const solidRight = solid.x + solid.width / 2;
      const solidBottom = solid.y;
      const solidTop = solid.y + solid.height;

      const playerLeft = finalX - halfW;
      const playerRight = finalX + halfW;
      const playerBottom = finalY;
      const playerTop = finalY + ph;

      const overlaps = (
        playerLeft < solidRight &&
        playerRight > solidLeft &&
        playerBottom < solidTop &&
        playerTop > solidBottom
      );

      if (overlaps) {
        collidedX = true;
        if (dx > 0) {
          finalX = solidLeft - halfW;
        } else if (dx < 0) {
          finalX = solidRight + halfW;
        }
      }
    }

    // --- 2. Move on Y Axis ---
    finalY += dy;
    for (const solid of this.solids) {
      if (!solid.active) continue;

      const solidLeft = solid.x - solid.width / 2;
      const solidRight = solid.x + solid.width / 2;
      const solidBottom = solid.y;
      const solidTop = solid.y + solid.height;

      const playerLeft = finalX - halfW;
      const playerRight = finalX + halfW;
      const playerBottom = finalY;
      const playerTop = finalY + ph;

      const overlaps = (
        playerLeft < solidRight &&
        playerRight > solidLeft &&
        playerBottom < solidTop &&
        playerTop > solidBottom
      );

      if (overlaps) {
        collidedY = true;
        if (dy < 0) {
          // Landing on platform top
          finalY = solidTop;
          grounded = true;
        } else if (dy > 0) {
          // Hitting ceiling
          finalY = solidBottom - ph;
        }
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

  checkHazardCollision(px, py, pw, ph) {
    const halfW = pw / 2;
    const playerLeft = px - halfW;
    const playerRight = px + halfW;
    const playerBottom = py;
    const playerTop = py + ph;

    for (const h of this.hazards) {
      if (!h.active) continue;
      const hLeft = h.x - h.width / 2;
      const hRight = h.x + h.width / 2;
      const hBottom = h.y;
      const hTop = h.y + h.height;

      if (playerLeft < hRight && playerRight > hLeft && playerBottom < hTop && playerTop > hBottom) {
        return h;
      }
    }
    return null;
  }
}
