/**
 * DevilDoor3D — 3D Ancient Stone Torii Archway & Swirling Mystic Portal.
 * Features: Carved stone pillars, emissive runic glyphs, rotating vortex, and particle drift.
 */
export class DevilDoor3D {
  constructor(scene, shadowGenerator, x = 45, y = 3, id = 'level_door') {
    this.scene = scene;
    this.shadowGenerator = shadowGenerator;
    this.x = x;
    this.y = y;
    this.id = id;

    this.width = 2.4;
    this.height = 3.6;
    this.state = 'active'; // 'active', 'dissolved', 'locked'

    this.vortexAngle = 0;
    this._buildMesh();
  }

  _buildMesh() {
    this.rootMesh = new BABYLON.TransformNode(`doorRoot_${this.id}`, this.scene);
    this.rootMesh.position = new BABYLON.Vector3(this.x, this.y, 0);

    // 1. Materials
    const matStone = new BABYLON.StandardMaterial('matDoorStone', this.scene);
    matStone.diffuseColor = new BABYLON.Color3(0.12, 0.16, 0.22);
    matStone.specularColor = new BABYLON.Color3(0.2, 0.25, 0.35);

    const matPortal = new BABYLON.StandardMaterial('matDoorPortal', this.scene);
    matPortal.diffuseColor = new BABYLON.Color3(0.1, 0.6, 1.0);
    matPortal.emissiveColor = new BABYLON.Color3(0.15, 0.75, 1.0);
    matPortal.alpha = 0.85;

    const matRune = new BABYLON.StandardMaterial('matDoorRune', this.scene);
    matRune.emissiveColor = new BABYLON.Color3(0.3, 0.8, 1.0);

    // 2. Stone Arch Structure (Torii Style)
    // Left Pillar
    const pillarL = BABYLON.MeshBuilder.CreateBox('pillarL', { width: 0.45, height: 3.6, depth: 0.6 }, this.scene);
    pillarL.material = matStone;
    pillarL.parent = this.rootMesh;
    pillarL.position = new BABYLON.Vector3(-1.0, 1.8, 0);

    // Right Pillar
    const pillarR = BABYLON.MeshBuilder.CreateBox('pillarR', { width: 0.45, height: 3.6, depth: 0.6 }, this.scene);
    pillarR.material = matStone;
    pillarR.parent = this.rootMesh;
    pillarR.position = new BABYLON.Vector3(1.0, 1.8, 0);

    // Top Lintel Beam
    const lintel = BABYLON.MeshBuilder.CreateBox('lintel', { width: 3.2, height: 0.5, depth: 0.7 }, this.scene);
    lintel.material = matStone;
    lintel.parent = this.rootMesh;
    lintel.position = new BABYLON.Vector3(0, 3.6, 0);

    // Sub Lintel
    const subLintel = BABYLON.MeshBuilder.CreateBox('subLintel', { width: 2.5, height: 0.25, depth: 0.5 }, this.scene);
    subLintel.material = matStone;
    subLintel.parent = this.rootMesh;
    subLintel.position = new BABYLON.Vector3(0, 3.1, 0);

    // 3. Swirling Portal Disc
    this.portalDisc = BABYLON.MeshBuilder.CreateDisc('portalDisc', { radius: 1.2, tessellation: 32 }, this.scene);
    this.portalDisc.material = matPortal;
    this.portalDisc.parent = this.rootMesh;
    this.portalDisc.position = new BABYLON.Vector3(0, 1.8, 0.05);

    // Inner Portal Ring
    this.portalRing = BABYLON.MeshBuilder.CreateTorus('portalRing', { diameter: 1.9, thickness: 0.08, tessellation: 24 }, this.scene);
    this.portalRing.material = matRune;
    this.portalRing.parent = this.rootMesh;
    this.portalRing.position = new BABYLON.Vector3(0, 1.8, 0.1);

    if (this.shadowGenerator) {
      [pillarL, pillarR, lintel].forEach(m => {
        if (m) this.shadowGenerator.addShadowCaster(m);
      });
    }
  }

  update(dt) {
    if (this.state !== 'active') return;
    this.vortexAngle += dt * 2.5;
    if (this.portalRing) {
      this.portalRing.rotation.z = this.vortexAngle;
    }
  }

  checkPlayerEntered(player) {
    if (this.state !== 'active' || !player || player.isDead) return false;
    const px = player.rootMesh.position.x;
    const py = player.rootMesh.position.y;
    const dx = Math.abs(px - this.x);
    const dy = Math.abs(py - this.y);
    return dx < 1.0 && dy < 2.0;
  }
}
