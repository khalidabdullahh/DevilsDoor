/**
 * Camera25D — Smooth tracking 2.5D camera with lerp and screen shake trauma.
 */
export class Camera25D {
  constructor(viewportWidth, viewportHeight) {
    this.viewportWidth = viewportWidth;
    this.viewportHeight = viewportHeight;

    this.x = 0;
    this.y = 0;
    this.targetX = 0;
    this.targetY = 0;

    this.minX = 0;
    this.maxX = 1200;
    this.minY = 0;
    this.maxY = 800;

    this.lerpSpeed = 0.12;

    // Shake trauma (0 to 1)
    this.trauma = 0;
    this.shakeOffsetX = 0;
    this.shakeOffsetY = 0;
  }

  setBounds(minX, minY, maxX, maxY) {
    this.minX = minX;
    this.minY = minY;
    this.maxX = maxX;
    this.maxY = maxY;
  }

  setTarget(targetX, targetY) {
    this.targetX = targetX - this.viewportWidth / 2;
    this.targetY = targetY - this.viewportHeight / 2;

    // Clamp targets
    const clampMaxX = Math.max(this.minX, this.maxX - this.viewportWidth);
    const clampMaxY = Math.max(this.minY, this.maxY - this.viewportHeight);

    this.targetX = Math.max(this.minX, Math.min(clampMaxX, this.targetX));
    this.targetY = Math.max(this.minY, Math.min(clampMaxY, this.targetY));
  }

  snapToTarget(targetX, targetY) {
    this.setTarget(targetX, targetY);
    this.x = this.targetX;
    this.y = this.targetY;
  }

  addShake(amount) {
    this.trauma = Math.min(1.0, this.trauma + amount);
  }

  update(dt) {
    // Smooth lerp
    this.x += (this.targetX - this.x) * this.lerpSpeed;
    this.y += (this.targetY - this.y) * this.lerpSpeed;

    // Process trauma decay and shake offsets
    if (this.trauma > 0) {
      const shakeMag = this.trauma * this.trauma * 16;
      this.shakeOffsetX = (Math.random() * 2 - 1) * shakeMag;
      this.shakeOffsetY = (Math.random() * 2 - 1) * shakeMag;
      this.trauma = Math.max(0, this.trauma - dt * 2.5);
    } else {
      this.shakeOffsetX = 0;
      this.shakeOffsetY = 0;
    }
  }

  getViewX() {
    return this.x + this.shakeOffsetX;
  }

  getViewY() {
    return this.y + this.shakeOffsetY;
  }
}
