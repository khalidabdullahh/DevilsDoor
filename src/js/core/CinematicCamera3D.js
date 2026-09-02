/**
 * CinematicCamera3D — Side-focused 3D Action-Platformer Camera for Babylon.js.
 * Provides smooth tracking, forward look-ahead, depth framing, and trauma-based screen shake.
 */
export class CinematicCamera3D {
  constructor(scene, canvas) {
    this.scene = scene;
    this.canvas = canvas;

    // Create FreeCamera / UniversalCamera positioned along Z axis looking towards origin
    this.camera = new BABYLON.FreeCamera('cinematicCam', new BABYLON.Vector3(0, 5, -18), this.scene);
    this.camera.setTarget(new BABYLON.Vector3(0, 3, 0));
    this.camera.fov = 0.85; // ~48.7 degrees FOV for cinematic depth

    this.targetX = 0;
    this.targetY = 4;
    this.targetZ = -18;

    this.currentX = 0;
    this.currentY = 4;
    this.currentZ = -18;

    this.lerpSpeed = 0.1;
    this.lookAheadX = 0;
    this.targetLookAhead = 0;

    // Screen shake trauma (0 to 1)
    this.trauma = 0;
    this.shakeX = 0;
    this.shakeY = 0;

    // Bounds
    this.minX = -10;
    this.maxX = 80;
    this.minY = -12;
    this.maxY = 25;
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
    this.currentX = Math.max(this.minX, Math.min(this.maxX, x));
    this.currentY = Math.max(this.minY, Math.min(this.maxY, y + 2));
    this.targetX = this.currentX;
    this.targetY = this.currentY;
    this.camera.position.x = this.currentX;
    this.camera.position.y = this.currentY;
    this.camera.setTarget(new BABYLON.Vector3(this.currentX, this.currentY - 1, 0));
  }

  update(dt, player) {
    if (player && player.rootMesh) {
      const px = player.rootMesh.position.x;
      const py = player.rootMesh.position.y;
      const pvx = player.vx || 0;

      // Dynamic Look-Ahead
      this.targetLookAhead = player.facing * Math.min(3.5, Math.abs(pvx) * 0.4);
      this.lookAheadX += (this.targetLookAhead - this.lookAheadX) * 0.05;

      this.targetX = Math.max(this.minX, Math.min(this.maxX, px + this.lookAheadX));
      this.targetY = Math.max(this.minY, Math.min(this.maxY, py + 2.5));
    }

    // Smooth position interpolation
    this.currentX += (this.targetX - this.currentX) * this.lerpSpeed;
    this.currentY += (this.targetY - this.currentY) * this.lerpSpeed;

    // Process screen shake trauma
    if (this.trauma > 0) {
      const shakeMag = this.trauma * this.trauma * 0.6;
      this.shakeX = (Math.random() * 2 - 1) * shakeMag;
      this.shakeY = (Math.random() * 2 - 1) * shakeMag;
      this.trauma = Math.max(0, this.trauma - dt * 3.0);
    } else {
      this.shakeX = 0;
      this.shakeY = 0;
    }

    // Update Babylon.js Camera Position & Target
    this.camera.position.x = this.currentX + this.shakeX;
    this.camera.position.y = this.currentY + this.shakeY;
    this.camera.position.z = this.currentZ;

    this.camera.setTarget(new BABYLON.Vector3(
      this.currentX + this.shakeX * 0.5,
      this.currentY - 1.2 + this.shakeY * 0.5,
      0
    ));
  }
}
