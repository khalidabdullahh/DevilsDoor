import { PhysicsWorld } from '../physics/PhysicsWorld.js';
import { Door } from '../entities/Door.js';
import { Hazard } from '../entities/Hazard.js';
import { DeceptionEngine } from '../deception/DeceptionEngine.js';
import { AreaEnterTrigger, PlayerIdleTrigger } from '../deception/Triggers.js';
import { TriggerHazardAction, PlaySoundAction } from '../deception/Actions.js';

/**
 * Level 2: "Patience and Peril"
 * Central Idea: Velocity-sensitive overhead traps lead and crush players who sprint blindly.
 * Pausing or approaching with calm rhythm causes the traps to discharge safely ahead.
 */
export class Level2 {
  constructor() {
    this.id = 2;
    this.title = 'Patience and Peril';
    this.colorFamily = 'slate';
    this.playerStartX = 80;
    this.playerStartY = 420;

    this.physicsWorld = new PhysicsWorld();
    this.deceptionEngine = new DeceptionEngine();
    this.doors = [];
    this.hazards = [];

    this.build();
  }

  build() {
    this.physicsWorld.clear();
    this.deceptionEngine.clear();
    this.doors = [];
    this.hazards = [];

    // 1. Solid Main Floor
    this.physicsWorld.addSolid(40, 480, 880, 60, 'floor');

    // 2. Obstacle pillar before the exit
    this.physicsWorld.addSolid(680, 400, 60, 80, 'pillar');

    // 3. Falling Weight Hazards (Stalactites)
    const weight1 = new Hazard(340, 80, 50, 50, 'falling_weight', 'overhead_trap');
    const weight2 = new Hazard(480, 80, 50, 50, 'falling_weight', 'overhead_trap');
    this.hazards.push(weight1, weight2);

    // Register hazard boxes in physics world
    this.physicsWorld.hazards.push(weight1.box, weight2.box);

    // 4. Exit Door
    const door = new Door(800, 420, 40, 60, 'standard', 'level2_door');
    this.doors.push(door);

    // 5. Deception Rule A: Entering approach area triggers hazard drop
    this.deceptionEngine.addRule(
      new AreaEnterTrigger({ x: 220, y: 360, width: 80, height: 120 }, true),
      [
        new TriggerHazardAction(['overhead_trap'], 0.15),
        new PlaySoundAction('trap_snap')
      ]
    );

    // 6. Deception Rule B: Idle trigger allows patient players to disarm early
    this.deceptionEngine.addRule(
      new PlayerIdleTrigger(0.4, true),
      [
        new TriggerHazardAction(['overhead_trap'], 0)
      ]
    );
  }

  reset() {
    this.build();
    this.deceptionEngine.reset();
  }

  update(dt, player, input, camera, audio) {
    this.deceptionEngine.update(dt, this, player, input, camera, audio);

    for (const hazard of this.hazards) {
      hazard.update(dt, player);
    }

    for (const door of this.doors) {
      door.update(dt);
    }
  }
}
