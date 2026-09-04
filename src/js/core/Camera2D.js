/**
 * Camera2D — Smooth Dynamic Action Follow Camera with Zoom & Trauma Screen Shake.
 */
export class Camera2D {
  constructor(viewportWidth = 1280, viewportHeight = 720) {
    this.viewportWidth = viewportWidth;
    this.viewportHeight = viewportHeight;

    this.x = 0;
    this.y = 0;
    this.targetX = 0;
    this.targetY = 0;

    this.lerpSpeed = 0.09;
    this.lookAheadX = 0;
    this.targetLookAhead = 0;

    this.trauma = 0;
    this.shakeX = 0;
    this.shakeY = 0;

    this.minX = 0;
    this.maxX = 1800;
    this.minY = 0;
    this.maxY = 900;
  }

  setBounds(minX, maxX, minY, maxY) {
    this.minX = minX;
    this.maxX = maxX;
    this.minY = minY;
    this.maxY = maxY;
  }

  addShake(amount) {
    this.trauma = Math.min(1.0, this.trauma + amount);
  }

  snapTo(x, y) {
    this.viewportWidth = 1280;
    this.viewportHeight = 720;
    this.x = x - this.viewportWidth * 0.35;
    this.y = y - this.viewportHeight * 0.52;
    this.targetX = this.x;
    this.targetY = this.y;
  }

  update(dt, player) {
    this.viewportWidth = 1280;
    this.viewportHeight = 720;

    if (player) {
      const pvx = player.vx || 0;
      this.targetLookAhead = player.facing * Math.min(160, Math.abs(pvx) * 0.28);
      this.lookAheadX += (this.targetLookAhead - this.lookAheadX) * 0.08;

      const idealX = player.x + this.lookAheadX - this.viewportWidth * 0.35;
      const idealY = player.y - this.viewportHeight * 0.52;

      this.targetX = Math.max(this.minX, idealX);
      this.targetY = Math.max(this.minY, idealY);
    }

    this.x += (this.targetX - this.x) * this.lerpSpeed;
    this.y += (this.targetY - this.y) * this.lerpSpeed;

    if (this.trauma > 0) {
      const shakeMag = this.trauma * this.trauma * 18;
      this.shakeX = (Math.random() * 2 - 1) * shakeMag;
      this.shakeY = (Math.random() * 2 - 1) * shakeMag;
      this.trauma = Math.max(0, this.trauma - dt * 3.2);
    } else {
      this.shakeX = 0;
      this.shakeY = 0;
    }
  }

  getCamX() {
    return this.x + this.shakeX;
  }

  getCamY() {
    return this.y + this.shakeY;
  }
}
