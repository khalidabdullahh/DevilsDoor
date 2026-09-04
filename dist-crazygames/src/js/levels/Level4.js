import { PhysicsWorld } from '../physics/PhysicsWorld.js';
import { Door } from '../entities/Door.js';
import { Hazard } from '../entities/Hazard.js';
import { DeceptionEngine } from '../deception/DeceptionEngine.js';
import { PlayerJumpTrigger } from '../deception/Triggers.js';
import { PhaseShiftAction } from '../deception/Actions.js';

/**
 * Level 4: "Phase Shift"
 * Central Idea: Platforms alternate between Phase A (Cyan) and Phase B (Amber).
 * Every mid-air jump inverts the world's physical polarity.
 */
export class Level4 {
  constructor() {
    this.id = 4;
    this.title = 'Phase Shift';
    this.colorFamily = 'void';
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

    // Initial Phase state
    this.physicsWorld.setPhase('A');

    // 1. Starting Solid Platform
    this.physicsWorld.addSolid(40, 440, 140, 40, 'start_base');

    // 2. Chasm Floor Spikes
    const pitSpikes = new Hazard(180, 500, 620, 30, 'spike', 'pit_spikes');
    this.hazards.push(pitSpikes);
    this.physicsWorld.addHazard(pitSpikes.x, pitSpikes.y, pitSpikes.width, pitSpikes.height, 'pit_spikes');

    // 3. Alternating Phase Platforms
    // Platform 1: Cyan (Phase A) — Solid initially
    this.physicsWorld.addSolid(220, 380, 110, 20, 'phase_platform', 'A');

    // Platform 2: Amber (Phase B) — Hollow initially (becomes solid after 1st jump)
    this.physicsWorld.addSolid(390, 320, 110, 20, 'phase_platform', 'B');

    // Platform 3: Cyan (Phase A) — Becomes solid after 2nd jump
    this.physicsWorld.addSolid(560, 260, 110, 20, 'phase_platform', 'A');

    // 4. Final Exit Landing
    this.physicsWorld.addSolid(720, 360, 180, 40, 'exit_base');

    // 5. Exit Door
    const door = new Door(820, 300, 40, 60, 'standard', 'level4_door');
    this.doors.push(door);

    // 6. Deception Rule: Every Jump flips world phase
    this.deceptionEngine.addRule(
      new PlayerJumpTrigger(false),
      [
        new PhaseShiftAction()
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
