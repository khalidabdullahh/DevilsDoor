import { PhysicsWorld3D } from '../physics/PhysicsWorld3D.js';
import { DevilDoor3D } from '../entities/DevilDoor3D.js';
import { ShadowSentry3D } from '../entities/ShadowSentry3D.js';

/**
 * Level01_3D — "The First Assumption" (3D Vertical Slice).
 * The player starts on an ancient cliffside. An obvious upper bridge appears to lead to the goal.
 * Stepping onto it triggers a structural collapse, safely dropping the player into the Lower Crypt,
 * where they battle a Shadow Sentry and uncover the genuine Devil's Door.
 */
export class Level01_3D {
  constructor(scene, shadowGenerator, environment) {
    this.scene = scene;
    this.shadowGenerator = shadowGenerator;
    this.environment = environment;

    this.id = 1;
    this.title = 'The First Assumption';
    this.playerStartX = 0;
    this.playerStartY = 6.5;

    this.physicsWorld = new PhysicsWorld3D();
    this.enemies = [];
    this.collapsingBlocks = [];
    this.doors = [];

    this.deceptionTriggered = false;
    this.collapseElapsed = 0;

    this._buildLevelGeometry();
  }

  _buildLevelGeometry() {
    this.physicsWorld.clear();
    this.enemies = [];
    this.collapsingBlocks = [];
    this.doors = [];

    // Materials
    const matStone = new BABYLON.StandardMaterial('matLevelStone', this.scene);
    matStone.diffuseColor = new BABYLON.Color3(0.12, 0.16, 0.22);
    matStone.specularColor = new BABYLON.Color3(0.2, 0.25, 0.35);

    const matBridge = new BABYLON.StandardMaterial('matBridgeStone', this.scene);
    matBridge.diffuseColor = new BABYLON.Color3(0.15, 0.18, 0.25);
    matBridge.specularColor = new BABYLON.Color3(0.25, 0.3, 0.4);

    const matSpike = new BABYLON.StandardMaterial('matSpike', this.scene);
    matSpike.diffuseColor = new BABYLON.Color3(0.2, 0.05, 0.08);
    matSpike.emissiveColor = new BABYLON.Color3(0.4, 0.05, 0.08);

    // Helper: Create 3D Solid Platform
    const createPlatform = (x, y, w, h, d = 2.4, mat = matStone, tag = 'stone') => {
      const mesh = BABYLON.MeshBuilder.CreateBox(`plat_${x}_${y}`, { width: w, height: h, depth: d }, this.scene);
      mesh.material = mat;
      mesh.position = new BABYLON.Vector3(x, y + h / 2, 0);
      if (this.shadowGenerator) {
        mesh.receiveShadows = true;
        this.shadowGenerator.addShadowCaster(mesh);
      }
      return this.physicsWorld.addSolid(x, y, w, h, d, tag, mesh);
    };

    // --- 1. STARTING CLIFF (Upper Tier, Y = 6.0) ---
    createPlatform(0, 5.0, 8.0, 2.0, 3.0, matStone, 'start_cliff');
    this.environment.createLantern(-2.5, 7.5);

    // --- 2. THE COLLAPSING UPPER BRIDGE (Y = 6.0, X = 8..24) ---
    // Stable Bridge Base
    createPlatform(6.5, 5.0, 5.0, 1.2, 2.6, matStone, 'bridge_base');

    // Collapsing Central Spans (3 dynamic falling stones)
    for (let i = 0; i < 3; i++) {
      const bx = 11.5 + i * 4.0;
      const bSolid = createPlatform(bx, 5.0, 3.8, 1.2, 2.6, matBridge, 'collapsing_bridge');
      this.collapsingBlocks.push(bSolid);
    }
    this.environment.createLantern(15.5, 6.8);

    // Upper Decoy Landing (High Ledge, Y = 7.0, X = 28)
    createPlatform(27.0, 6.0, 6.0, 1.5, 2.8, matStone, 'upper_ledge');

    // --- 3. CEILING HAZARDS (Prevents blindly jumping over the collapse) ---
    const spikes = BABYLON.MeshBuilder.CreateCylinder('ceilingSpikes', { height: 1.2, diameterTop: 0, diameterBottom: 1.0, tessellation: 4 }, this.scene);
    spikes.material = matSpike;
    spikes.position = new BABYLON.Vector3(15.5, 10.5, 0);
    spikes.rotation.z = Math.PI;
    this.physicsWorld.addHazard(15.5, 9.5, 8.0, 2.0, 'ceiling_spikes');

    // --- 4. THE LOWER CRYPT (Subterranean Safe Terrace, Y = 0.0, X = 0..48) ---
    createPlatform(22.0, -1.0, 48.0, 1.5, 3.6, matStone, 'crypt_floor');
    this.environment.createLantern(6.0, 1.2);
    this.environment.createLantern(22.0, 1.2);
    this.environment.createLantern(38.0, 1.2);

    // Ancient Crypt Statues / Pillars
    for (let sx = 8; sx <= 36; sx += 12) {
      const statue = BABYLON.MeshBuilder.CreateBox(`statue_${sx}`, { width: 0.9, height: 4.2, depth: 0.9 }, this.scene);
      statue.material = matStone;
      statue.position = new BABYLON.Vector3(sx, 2.6, 1.2);
      if (this.shadowGenerator) this.shadowGenerator.addShadowCaster(statue);
    }

    // --- 5. ENEMY: SHADOW SENTRY GUARD (Lower Crypt, X = 28..38) ---
    const sentry = new ShadowSentry3D(this.scene, this.shadowGenerator, 30, 0.5, 24, 37);
    this.enemies.push(sentry);

    // --- 6. GENUINE DEVIL'S DOOR (End of Lower Crypt, X = 42, Y = 0.5) ---
    const trueDoor = new DevilDoor3D(this.scene, this.shadowGenerator, 42, 0.5, 'level1_true_door');
    this.doors.push(trueDoor);
  }

  reset() {
    this.deceptionTriggered = false;
    this.collapseElapsed = 0;

    // Reset collapsing blocks
    for (const b of this.collapsingBlocks) {
      b.active = true;
      b.isFalling = false;
      b.y = b.originalY;
      if (b.mesh) {
        b.mesh.position.y = b.originalY + b.height / 2;
        b.mesh.rotation.z = 0;
      }
    }

    // Reset enemies
    for (const e of this.enemies) {
      e.health = e.maxHealth;
      e.isDead = false;
      if (e.rootMesh) {
        e.rootMesh.setEnabled(true);
        e.rootMesh.position.x = 30;
        e.rootMesh.position.y = 0.5;
      }
    }
  }

  update(dt, player, audio, camera) {
    // 1. Deception Engine Trigger: Player steps onto upper bridge span (X = 10..22, Y > 4.5)
    if (!this.deceptionTriggered && player) {
      const px = player.rootMesh.position.x;
      const py = player.rootMesh.position.y;

      if (px >= 10.0 && px <= 22.0 && py >= 4.8) {
        this.deceptionTriggered = true;
        this.collapseElapsed = 0;
        if (audio) audio.playStoneCollapse();
        if (camera) camera.addShake(0.6); // Strong seismic impact camera shake
      }
    }

    // 2. Animate Dynamic Collapsing Bridge Blocks
    if (this.deceptionTriggered) {
      this.collapseElapsed += dt;
      for (let i = 0; i < this.collapsingBlocks.length; i++) {
        const b = this.collapsingBlocks[i];
        const delay = i * 0.08;
        if (this.collapseElapsed > delay) {
          b.active = false; // Disable collision so player safely drops
          b.isFalling = true;
          b.y -= 14.0 * dt;
          if (b.mesh) {
            b.mesh.position.y = b.y + b.height / 2;
            b.mesh.rotation.z += (i % 2 === 0 ? 1 : -1) * 1.5 * dt;
          }
        }
      }
    }

    // 3. Update Enemies & Combat
    for (const sentry of this.enemies) {
      sentry.update(dt, player, audio, camera);
    }

    // 4. Update Doors
    for (const door of this.doors) {
      door.update(dt);
    }
  }
}
