import { PhysicsWorld } from '../physics/PhysicsWorld.js';
import { Door } from '../entities/Door.js';
import { Hazard } from '../entities/Hazard.js';
import { DeceptionEngine } from '../deception/DeceptionEngine.js';
import { AreaEnterTrigger } from '../deception/Triggers.js';
import { ShiftTilesAction } from '../deception/Actions.js';

/**
 * Level 1: "The First Assumption"
 * Central Idea: The obvious direct upper bridge collapses, dropping the player harmlessly
 * to the true illuminated lower pathway leading to the Door.
 */
export class Level1 {
  constructor() {
    this.id = 1;
    this.title = 'The First Assumption';
    this.colorFamily = 'slate';
    this.playerStartX = 80;
    this.playerStartY = 240;

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

    // 1. Starting Platform (Top tier)
    this.physicsWorld.addSolid(40, 300, 160, 40, 'start_platform');

    // 2. Collapsing Upper Bridge
    const bridge1 = this.physicsWorld.addSolid(200, 300, 140, 20, 'bridge_collapse');
    const bridge2 = this.physicsWorld.addSolid(340, 300, 140, 20, 'bridge_collapse');
    bridge1.originalY = 300;
    bridge2.originalY = 300;

    // 3. Ceiling Spikes above the bridge (Punishes jumping over the collapse blindly)
    const ceilingSpikes = new Hazard(200, 120, 280, 20, 'spike', 'ceiling_spikes');
    this.hazards.push(ceilingSpikes);
    this.physicsWorld.addHazard(ceilingSpikes.x, ceilingSpikes.y, ceilingSpikes.width, ceilingSpikes.height, 'ceiling_spikes');

    // 4. Safe Lower Subterranean Floor (Revealed upon falling)
    this.physicsWorld.addSolid(40, 480, 880, 60, 'lower_floor');

    // 5. Stepping Stone to Door
    this.physicsWorld.addSolid(640, 420, 100, 20, 'step_platform');

    // 6. Genuine Exit Door
    const door = new Door(780, 420, 40, 60, 'standard', 'level1_door');
    this.doors.push(door);

    // 7. Deception Rule: Stepping onto the top bridge collapses it harmlessly to y=440
    this.deceptionEngine.addRule(
      new AreaEnterTrigger({ x: 210, y: 260, width: 260, height: 50 }, true),
      [
        new ShiftTilesAction(['bridge_collapse'], 0, 160, 0.25)
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
