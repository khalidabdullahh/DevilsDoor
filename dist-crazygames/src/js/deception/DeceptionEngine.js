/**
 * DeceptionEngine — Evaluates declarative deception rules per frame.
 */
export class DeceptionEngine {
  constructor() {
    this.rules = [];
  }

  clear() {
    this.rules = [];
  }

  addRule(trigger, actions, conditions = []) {
    this.rules.push({
      trigger,
      actions: Array.isArray(actions) ? actions : [actions],
      conditions
    });
  }

  reset() {
    for (const rule of this.rules) {
      if (rule.trigger.reset) rule.trigger.reset();
    }
  }

  update(dt, level, player, input, camera, audio) {
    const context = { level, player, input, camera, audio, dt };

    // 1. Evaluate rules
    for (const rule of this.rules) {
      const isTriggered = rule.trigger.evaluate(player, input, dt, level.doors);
      if (isTriggered) {
        // Execute all actions
        for (const action of rule.actions) {
          action.execute(level, context);
        }
      }
    }

    // 2. Update moving solids
    for (const solid of level.physicsWorld.solids) {
      if (solid.isMoving) {
        solid.moveElapsed += dt;
        const progress = Math.min(1.0, solid.moveElapsed / solid.moveDuration);
        // Smooth ease-out quad
        const ease = 1 - (1 - progress) * (1 - progress);

        if (solid.targetX !== undefined && solid.originalX !== undefined) {
          solid.x = solid.originalX + (solid.targetX - solid.originalX) * ease;
        }
        if (solid.targetY !== undefined && solid.originalY !== undefined) {
          solid.y = solid.originalY + (solid.targetY - solid.originalY) * ease;
        }

        if (progress >= 1.0) {
          solid.isMoving = false;
          if (solid.targetX !== undefined) solid.x = solid.targetX;
          if (solid.targetY !== undefined) solid.y = solid.targetY;
        }
      }
    }
  }
}
