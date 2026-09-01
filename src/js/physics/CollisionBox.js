/**
 * CollisionBox — Axis-Aligned Bounding Box (AABB) with tags and dynamic properties.
 */
export class CollisionBox {
  constructor(x, y, width, height, type = 'solid', tag = '') {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.type = type; // 'solid', 'hazard', 'trigger', 'door', 'phase'
    this.tag = tag;
    this.active = true;
    this.phaseGroup = null; // 'A', 'B' for phase platforms
  }

  get left() { return this.x; }
  get right() { return this.x + this.width; }
  get top() { return this.y; }
  get bottom() { return this.y + this.height; }

  overlaps(other) {
    if (!this.active || !other.active) return false;
    return (
      this.left < other.right &&
      this.right > other.left &&
      this.top < other.bottom &&
      this.bottom > other.top
    );
  }

  containsPoint(px, py) {
    if (!this.active) return false;
    return px >= this.left && px <= this.right && py >= this.top && py <= this.bottom;
  }
}
