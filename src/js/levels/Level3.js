import { PhysicsWorld } from '../physics/PhysicsWorld.js';
import { Door } from '../entities/Door.js';
import { DeceptionEngine } from '../deception/DeceptionEngine.js';
import { DoorProximityTrigger } from '../deception/Triggers.js';
import { DecoyDoorAction } from '../deception/Actions.js';

/**
 * Level 3: "The False Exit"
 * Central Idea: The high glowing Door is a decoy. Approaching it causes it to dissolve
 * into shadow particles, unlocking the true sanctum Door below.
 */
export class Level3 {
  constructor() {
    this.id = 3;
    this.title = 'The False Exit';
    this.colorFamily = 'slate';
    this.playerStartX = 80;
    this.playerStartY = 380;

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

    // 1. Lower Ground
    this.physicsWorld.addSolid(40, 480, 880, 60, 'floor');

    // 2. Ascending Stepping Ledges to the Upper Decoy
    this.physicsWorld.addSolid(200, 380, 120, 20, 'ledge_1');
    this.physicsWorld.addSolid(380, 300, 120, 20, 'ledge_2');
    this.physicsWorld.addSolid(560, 220, 120, 20, 'ledge_3');
    this.physicsWorld.addSolid(700, 180, 160, 30, 'decoy_ledge');

    // 3. Decoy Door on High Ledge
    const decoyDoor = new Door(760, 120, 40, 60, 'decoy', 'decoy_door');
    this.doors.push(decoyDoor);

    // 4. True Door in Lower Chamber (Starts dormant/locked)
    const realDoor = new Door(480, 420, 40, 60, 'standard', 'real_door');
    realDoor.state = 'locked';
    realDoor.box.active = false;
    this.doors.push(realDoor);

    // 5. Deception Rule: Approaching Decoy Door triggers dissolution and awakens Real Door
    this.deceptionEngine.addRule(
      new DoorProximityTrigger('decoy_door', 70, true),
      [
        new DecoyDoorAction('decoy_door', 'real_door')
      ]
    );
  }

  reset() {
    this.build();
    this.deceptionEngine.reset();
  }

  update(dt, player, input, camera, audio) {
    this.deceptionEngine.update(dt, this, player, input, camera, audio);

    for (const door of this.doors) {
      door.update(dt);
    }
  }
}
