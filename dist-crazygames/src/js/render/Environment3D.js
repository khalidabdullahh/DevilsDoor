/**
 * Environment3D — Layered 3D Dark Fantasy World & Atmosphere.
 * Features: Distant pagoda silhouettes, mountain ridges, hanging oriental lanterns,
 * dynamic flickering point lights, and drifting cherry blossom / shadow ash particle VFX.
 */
export class Environment3D {
  constructor(scene, shadowGenerator) {
    this.scene = scene;
    this.shadowGenerator = shadowGenerator;
    this.lanternLights = [];
    this.particles = null;

    this._buildBackgroundLayers();
    this._buildParticleEffects();
  }

  _buildBackgroundLayers() {
    // 1. Materials
    const matFarMountain = new BABYLON.StandardMaterial('matFarMountain', this.scene);
    matFarMountain.diffuseColor = new BABYLON.Color3(0.03, 0.05, 0.08);
    matFarMountain.emissiveColor = new BABYLON.Color3(0.015, 0.025, 0.04);
    matFarMountain.specularColor = new BABYLON.Color3(0, 0, 0);

    const matMidPagoda = new BABYLON.StandardMaterial('matMidPagoda', this.scene);
    matMidPagoda.diffuseColor = new BABYLON.Color3(0.05, 0.07, 0.11);
    matMidPagoda.emissiveColor = new BABYLON.Color3(0.02, 0.03, 0.05);

    // 2. Distant Mountains (Z = 50)
    for (let i = -3; i <= 6; i++) {
      const height = 18 + Math.sin(i * 1.5) * 6;
      const width = 24;
      const mountain = BABYLON.MeshBuilder.CreateCylinder(`mountain_${i}`, {
        height: height,
        diameterTop: 0,
        diameterBottom: width,
        tessellation: 4
      }, this.scene);
      mountain.material = matFarMountain;
      mountain.position = new BABYLON.Vector3(i * 18, height / 2 - 8, 48);
      mountain.rotation.y = Math.PI / 4 + i * 0.3;
    }

    // 3. Mid-depth Pagoda Temples & Torii Gates (Z = 24..30)
    const pagodaPoints = [-8, 12, 32, 54];
    pagodaPoints.forEach((px, idx) => {
      const pagodaRoot = new BABYLON.TransformNode(`pagoda_${idx}`, this.scene);
      pagodaRoot.position = new BABYLON.Vector3(px, 4, 26);

      // Base Tower
      const tower = BABYLON.MeshBuilder.CreateBox(`pTower_${idx}`, { width: 4.5, height: 8, depth: 4.5 }, this.scene);
      tower.material = matMidPagoda;
      tower.parent = pagodaRoot;

      // Tier 1 Roof
      const roof1 = BABYLON.MeshBuilder.CreateCylinder(`pRoof1_${idx}`, { height: 0.8, diameterTop: 2, diameterBottom: 6.8, tessellation: 4 }, this.scene);
      roof1.material = matMidPagoda;
      roof1.parent = pagodaRoot;
      roof1.position.y = 4.2;
      roof1.rotation.y = Math.PI / 4;

      // Tier 2 Roof
      const roof2 = BABYLON.MeshBuilder.CreateCylinder(`pRoof2_${idx}`, { height: 0.8, diameterTop: 1, diameterBottom: 5.2, tessellation: 4 }, this.scene);
      roof2.material = matMidPagoda;
      roof2.parent = pagodaRoot;
      roof2.position.y = 6.2;
      roof2.rotation.y = Math.PI / 4;
    });

    // 4. Background Monolith Pillars (Z = 12)
    for (let x = -10; x <= 65; x += 14) {
      const pillar = BABYLON.MeshBuilder.CreateBox(`bgPillar_${x}`, { width: 1.2, height: 16, depth: 1.2 }, this.scene);
      pillar.material = matMidPagoda;
      pillar.position = new BABYLON.Vector3(x, 6, 12);
    }
  }

  createLantern(x, y, z = -0.6) {
    const matLanternFrame = new BABYLON.StandardMaterial(`matLantern_${Math.random()}`, this.scene);
    matLanternFrame.diffuseColor = new BABYLON.Color3(0.08, 0.08, 0.1);

    const matGlow = new BABYLON.StandardMaterial(`matGlow_${Math.random()}`, this.scene);
    matGlow.diffuseColor = new BABYLON.Color3(1.0, 0.7, 0.2);
    matGlow.emissiveColor = new BABYLON.Color3(1.0, 0.65, 0.2);

    const lanternRoot = new BABYLON.TransformNode(`lanternRoot_${Math.random()}`, this.scene);
    lanternRoot.position = new BABYLON.Vector3(x, y, z);

    // Roof cap
    const cap = BABYLON.MeshBuilder.CreateCylinder('lCap', { height: 0.2, diameterTop: 0.1, diameterBottom: 0.7, tessellation: 4 }, this.scene);
    cap.material = matLanternFrame;
    cap.parent = lanternRoot;
    cap.position.y = 0.3;
    cap.rotation.y = Math.PI / 4;

    // Glowing Core
    const core = BABYLON.MeshBuilder.CreateBox('lCore', { width: 0.35, height: 0.45, depth: 0.35 }, this.scene);
    core.material = matGlow;
    core.parent = lanternRoot;

    // Warm Point Light
    const light = new BABYLON.PointLight(`lanternLight_${Math.random()}`, new BABYLON.Vector3(x, y, z - 0.5), this.scene);
    light.diffuse = new BABYLON.Color3(1.0, 0.65, 0.25);
    light.specular = new BABYLON.Color3(0.8, 0.5, 0.1);
    light.intensity = 1.6;
    light.range = 8.0;

    this.lanternLights.push({ light, baseIntensity: 1.6, timeOffset: Math.random() * 10 });
    return lanternRoot;
  }

  _buildParticleEffects() {
    // 3D Drifting Cherry Blossom / Shadow Ash Embers
    const particleSystem = new BABYLON.ParticleSystem('shadowAsh', 300, this.scene);
    particleSystem.particleTexture = new BABYLON.Texture('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAJElEQVQoU2NkYGD4z4AGGEk1kFEE8zEKYkUuLgX4FCAbSKwBAM6uAgTf+fB4AAAAAElFTkSuQmCC', this.scene);

    particleSystem.emitter = new BABYLON.Vector3(25, 14, 0);
    particleSystem.minEmitBox = new BABYLON.Vector3(-35, 0, -5);
    particleSystem.maxEmitBox = new BABYLON.Vector3(35, 2, 5);

    particleSystem.color1 = new BABYLON.Color4(0.3, 0.7, 1.0, 0.6);
    particleSystem.color2 = new BABYLON.Color4(1.0, 0.4, 0.6, 0.5);
    particleSystem.colorDead = new BABYLON.Color4(0.1, 0.1, 0.2, 0.0);

    particleSystem.minSize = 0.08;
    particleSystem.maxSize = 0.22;

    particleSystem.minLifeTime = 4.0;
    particleSystem.maxLifeTime = 8.0;

    particleSystem.emitRate = 45;
    particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;

    particleSystem.gravity = new BABYLON.Vector3(-0.8, -0.6, 0);
    particleSystem.direction1 = new BABYLON.Vector3(-1.5, -0.8, -0.2);
    particleSystem.direction2 = new BABYLON.Vector3(-2.5, -1.2, 0.2);

    particleSystem.start();
    this.particles = particleSystem;
  }

  update(dt) {
    const t = performance.now() * 0.001;
    // Flickering Lantern Point Lights
    for (const l of this.lanternLights) {
      const flicker = Math.sin(t * 8 + l.timeOffset) * 0.12 + Math.cos(t * 14 + l.timeOffset) * 0.08;
      l.light.intensity = l.baseIntensity + flicker;
    }
  }
}
