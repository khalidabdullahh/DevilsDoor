/**
 * Deception Actions — Physical and environmental changes executed upon trigger.
 */

export class ShiftTilesAction {
  constructor(targetTags, deltaX, deltaY, duration = 0.3) {
    this.targetTags = targetTags;
    this.deltaX = deltaX;
    this.deltaY = deltaY;
    this.duration = duration;
  }

  execute(level, context) {
    for (const solid of level.physicsWorld.solids) {
      if (this.targetTags.includes(solid.tag)) {
        solid.targetY = (solid.originalY !== undefined ? solid.originalY : solid.y) + this.deltaY;
        solid.targetX = (solid.originalX !== undefined ? solid.originalX : solid.x) + this.deltaX;
        solid.isMoving = true;
        solid.moveDuration = this.duration;
        solid.moveElapsed = 0;
      }
    }
    if (context.camera) {
      context.camera.addShake(0.35);
    }
  }
}

export class ToggleCollisionAction {
  constructor(targetTags, active) {
    this.targetTags = targetTags;
    this.active = active;
  }

  execute(level) {
    for (const solid of level.physicsWorld.solids) {
      if (this.targetTags.includes(solid.tag)) {
        solid.active = this.active;
      }
    }
  }
}

export class TriggerHazardAction {
  constructor(targetTags, delay = 0) {
    this.targetTags = targetTags;
    this.delay = delay;
  }

  execute(level) {
    for (const hazard of level.hazards) {
      if (this.targetTags.includes(hazard.tag)) {
        hazard.triggerFall(this.delay);
      }
    }
  }
}

export class DecoyDoorAction {
  constructor(decoyId, realDoorId) {
    this.decoyId = decoyId;
    this.realDoorId = realDoorId;
  }

  execute(level, context) {
    const decoy = level.doors.find(d => d.id === this.decoyId);
    if (decoy) {
      decoy.dissolve();
      if (context.audio) context.audio.playTrapSnap();
    }

    const realDoor = level.doors.find(d => d.id === this.realDoorId);
    if (realDoor) {
      realDoor.state = 'active';
      realDoor.box.active = true;
    }

    if (context.camera) context.camera.addShake(0.4);
  }
}

export class PhaseShiftAction {
  execute(level, context) {
    const newPhase = level.physicsWorld.togglePhase();
    if (context.player) {
      context.player.phaseColor = newPhase;
    }
    if (context.audio) {
      context.audio.playPhaseFlip();
    }
    if (context.camera) {
      context.camera.addShake(0.15);
    }
  }
}

export class PlaySoundAction {
  constructor(soundType) {
    this.soundType = soundType;
  }

  execute(level, context) {
    if (!context.audio) return;
    if (this.soundType === 'trap_snap') context.audio.playTrapSnap();
    if (this.soundType === 'phase_flip') context.audio.playPhaseFlip();
  }
}
