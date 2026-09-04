/**
 * Deception Triggers — Spatial and behavioral event detectors.
 */

export class AreaEnterTrigger {
  constructor(bounds, once = true) {
    this.bounds = bounds; // { x, y, width, height }
    this.once = once;
    this.triggered = false;
  }

  evaluate(player) {
    if (this.once && this.triggered) return false;
    const px = player.box.x;
    const py = player.box.y;
    const pw = player.box.width;
    const ph = player.box.height;

    const overlaps = (
      px < this.bounds.x + this.bounds.width &&
      px + pw > this.bounds.x &&
      py < this.bounds.y + this.bounds.height &&
      py + ph > this.bounds.y
    );

    if (overlaps) {
      this.triggered = true;
      return true;
    }
    return false;
  }

  reset() {
    this.triggered = false;
  }
}

export class PlayerJumpTrigger {
  constructor(once = false) {
    this.once = once;
    this.triggered = false;
  }

  evaluate(player, input) {
    if (this.once && this.triggered) return false;
    if (input.isJumpJustPressed()) {
      this.triggered = true;
      return true;
    }
    return false;
  }

  reset() {
    this.triggered = false;
  }
}

export class PlayerIdleTrigger {
  constructor(requiredDuration = 0.5, once = true) {
    this.requiredDuration = requiredDuration;
    this.once = once;
    this.idleTime = 0;
    this.triggered = false;
  }

  evaluate(player, input, dt) {
    if (this.once && this.triggered) return false;
    if (Math.abs(player.vx) < 10 && player.isGrounded) {
      this.idleTime += dt;
      if (this.idleTime >= this.requiredDuration) {
        this.triggered = true;
        return true;
      }
    } else {
      this.idleTime = 0;
    }
    return false;
  }

  reset() {
    this.idleTime = 0;
    this.triggered = false;
  }
}

export class DoorProximityTrigger {
  constructor(doorId, distance = 80, once = true) {
    this.doorId = doorId;
    this.distance = distance;
    this.once = once;
    this.triggered = false;
  }

  evaluate(player, input, dt, doors) {
    if (this.once && this.triggered) return false;
    const door = doors.find(d => d.id === this.doorId);
    if (!door) return false;

    const dx = (player.box.x + player.width / 2) - (door.x + door.width / 2);
    const dy = (player.box.y + player.height / 2) - (door.y + door.height / 2);
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist <= this.distance) {
      this.triggered = true;
      return true;
    }
    return false;
  }

  reset() {
    this.triggered = false;
  }
}
