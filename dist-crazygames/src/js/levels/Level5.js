import { PhysicsWorld } from '../physics/PhysicsWorld.js';
import { Door } from '../entities/Door.js';
import { ShadowDevil } from '../entities/ShadowDevil.js';
import { DeceptionEngine } from '../deception/DeceptionEngine.js';

/**
 * Level 5: "Gaze of the Shadow Devil"
 * Central Idea: The Shadow Devil watches the grand hall. When its crimson eye opens,
 * moving triggers an atmospheric death pulse. Players must observe the heartbeat warning
 * and freeze in place until the gaze subsides.
 */
export class Level5 {
  constructor() {
    this.id = 5;
    this.title = 'Gaze of the Shadow Devil';
    this.colorFamily = 'void';
    this.playerStartX = 80;
    this.playerStartY = 420;

    this.physicsWorld = new PhysicsWorld();
    this.deceptionEngine = new DeceptionEngine();
    this.shadowDevil = new ShadowDevil(480, 220);
    this.doors = [];
    this.hazards = [];

    this.build();
  }

  build() {
    this.physicsWorld.clear();
    this.deceptionEngine.clear();
    this.doors = [];
    this.hazards = [];
    this.shadowDevil.reset();

    // 1. Grand Hall Floor
    this.physicsWorld.addSolid(40, 480, 880, 60, 'hall_floor');

    // 2. Traversal Stone Pillars
    this.physicsWorld.addSolid(240, 400, 70, 80, 'pillar_1');
    this.physicsWorld.addSolid(450, 360, 80, 120, 'altar_pillar');
    this.physicsWorld.addSolid(660, 400, 70, 80, 'pillar_2');

    // 3. Sanctum Exit Door
    const door = new Door(820, 420, 40, 60, 'standard', 'level5_door');
    this.doors.push(door);
  }

  reset() {
    this.build();
    this.deceptionEngine.reset();
  }

  update(dt, player, input, camera, audio) {
    this.deceptionEngine.update(dt, this, player, input, camera, audio);

    // Update Shadow Devil gaze state machine
    this.shadowDevil.update(dt, player, audio);

    for (const door of this.doors) {
      door.update(dt);
    }
  }
}
