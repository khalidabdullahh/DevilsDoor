/**
 * ShadowSentry3D — Stylized 3D Armored Ninja Sentry with AI Patrol & Combat.
 * Features: Crimson glowing visor, patrol waypoints, player detection vision cone,
 * telegraphed lunging katana strike, hurt flinch, and death dissolution.
 */
export class ShadowSentry3D {
  constructor(scene, shadowGenerator, x = 20, y = 2, patrolMin = 16, patrolMax = 26) {
    this.scene = scene;
    this.shadowGenerator = shadowGenerator;

    this.x = x;
    this.y = y;
    this.patrolMin = patrolMin;
    this.patrolMax = patrolMax;

    this.width = 0.9;
    this.height = 1.9;
    this.facing = 1; // 1 = right, -1 = left

    this.health = 2;
    this.maxHealth = 2;
    this.isDead = false;

    // AI States: 'patrol', 'alert', 'attack', 'cooldown', 'hurt'
    this.state = 'patrol';
    this.stateTimer = 0;
    this.speed = 3.5;
    this.attackRange = 2.2;
    this.detectRange = 9.0;

    this.animTime = 0;
    this._buildMeshHierarchy();
  }

  _buildMeshHierarchy() {
    this.rootMesh = new BABYLON.TransformNode(`sentryRoot_${Math.random()}`, this.scene);
    this.rootMesh.position = new BABYLON.Vector3(this.x, this.y, 0);

    // Materials
    const matArmor = new BABYLON.StandardMaterial('matSentryArmor', this.scene);
    matArmor.diffuseColor = new BABYLON.Color3(0.06, 0.04, 0.08);
    matArmor.specularColor = new BABYLON.Color3(0.3, 0.1, 0.15);

    const matCrimsonEye = new BABYLON.StandardMaterial('matCrimsonEye', this.scene);
    matCrimsonEye.diffuseColor = new BABYLON.Color3(1.0, 0.1, 0.2);
    matCrimsonEye.emissiveColor = new BABYLON.Color3(1.0, 0.15, 0.25);
    this.matCrimsonEye = matCrimsonEye;

    const matBlade = new BABYLON.StandardMaterial('matSentryBlade', this.scene);
    matBlade.diffuseColor = new BABYLON.Color3(0.4, 0.1, 0.15);
    matBlade.specularColor = new BABYLON.Color3(0.8, 0.4, 0.4);

    // Torso
    this.bodyPivot = new BABYLON.TransformNode('sentryBody', this.scene);
    this.bodyPivot.parent = this.rootMesh;
    this.bodyPivot.position.y = 0.95;

    this.torsoMesh = BABYLON.MeshBuilder.CreateBox('sentryTorso', { width: 0.7, height: 0.75, depth: 0.45 }, this.scene);
    this.torsoMesh.material = matArmor;
    this.torsoMesh.parent = this.bodyPivot;

    // Helmet & Crimson Eye
    this.headMesh = BABYLON.MeshBuilder.CreateBox('sentryHead', { width: 0.48, height: 0.5, depth: 0.48 }, this.scene);
    this.headMesh.material = matArmor;
    this.headMesh.parent = this.bodyPivot;
    this.headMesh.position.y = 0.6;

    const eye = BABYLON.MeshBuilder.CreateBox('sentryEye', { width: 0.35, height: 0.08, depth: 0.12 }, this.scene);
    eye.material = matCrimsonEye;
    eye.parent = this.headMesh;
    eye.position = new BABYLON.Vector3(0.18, 0.02, 0);

    // Armored Shoulders & Weapon
    this.armPivot = new BABYLON.TransformNode('sentryArmPivot', this.scene);
    this.armPivot.parent = this.bodyPivot;
    this.armPivot.position = new BABYLON.Vector3(0.1, 0.25, 0.35);

    const arm = BABYLON.MeshBuilder.CreateCylinder('sentryArm', { height: 0.6, diameter: 0.16 }, this.scene);
    arm.material = matArmor;
    arm.parent = this.armPivot;
    arm.position.y = -0.28;

    this.blade = BABYLON.MeshBuilder.CreateBox('sentryWeapon', { width: 1.3, height: 0.08, depth: 0.02 }, this.scene);
    this.blade.material = matBlade;
    this.blade.parent = this.armPivot;
    this.blade.position = new BABYLON.Vector3(0.65, -0.45, 0);

    // Legs
    this.leftLegPivot = new BABYLON.TransformNode('sentryLegL', this.scene);
    this.leftLegPivot.parent = this.bodyPivot;
    this.leftLegPivot.position = new BABYLON.Vector3(0, -0.38, -0.18);
    const legL = BABYLON.MeshBuilder.CreateCylinder('sentryL', { height: 0.65, diameter: 0.2 }, this.scene);
    legL.material = matArmor;
    legL.parent = this.leftLegPivot;
    legL.position.y = -0.32;

    this.rightLegPivot = new BABYLON.TransformNode('sentryLegR', this.scene);
    this.rightLegPivot.parent = this.bodyPivot;
    this.rightLegPivot.position = new BABYLON.Vector3(0, -0.38, 0.18);
    const legR = BABYLON.MeshBuilder.CreateCylinder('sentryR', { height: 0.65, diameter: 0.2 }, this.scene);
    legR.material = matArmor;
    legR.parent = this.rightLegPivot;
    legR.position.y = -0.32;

    if (this.shadowGenerator) {
      [this.torsoMesh, this.headMesh, arm, legL, legR].forEach(m => {
        if (m) this.shadowGenerator.addShadowCaster(m);
      });
    }
  }

  takeDamage(amount = 1, hitFacing = 1, audio = null) {
    if (this.isDead) return;
    this.health -= amount;
    this.state = 'hurt';
    this.stateTimer = 0.25;
    this.rootMesh.position.x += hitFacing * 1.2; // Knockback

    if (audio) audio.playBladeHit();

    if (this.health <= 0) {
      this.isDead = true;
      this.rootMesh.setEnabled(false);
    }
  }

  update(dt, player, audio, camera) {
    if (this.isDead || !this.rootMesh.isEnabled()) return;

    this.animTime += dt;
    const px = player ? player.rootMesh.position.x : 0;
    const py = player ? player.rootMesh.position.y : 0;
    const distToPlayer = Math.abs(this.rootMesh.position.x - px);
    const yDist = Math.abs(this.rootMesh.position.y - py);

    switch (this.state) {
      case 'patrol':
        this.rootMesh.position.x += this.facing * this.speed * dt;
        if (this.rootMesh.position.x > this.patrolMax) {
          this.rootMesh.position.x = this.patrolMax;
          this.facing = -1;
        } else if (this.rootMesh.position.x < this.patrolMin) {
          this.rootMesh.position.x = this.patrolMin;
          this.facing = 1;
        }

        // Check player detection
        if (distToPlayer < this.detectRange && yDist < 2.0) {
          const dirToPlayer = px > this.rootMesh.position.x ? 1 : -1;
          if (dirToPlayer === this.facing) {
            this.state = 'alert';
            this.stateTimer = 0.4;
            if (audio) audio.playEnemyAlert();
          }
        }
        break;

      case 'alert':
        this.stateTimer -= dt;
        // Turn towards player and flare eye
        this.facing = px > this.rootMesh.position.x ? 1 : -1;
        if (this.stateTimer <= 0) {
          if (distToPlayer <= this.attackRange) {
            this.state = 'attack';
            this.stateTimer = 0.35;
          } else {
            // Chase
            this.rootMesh.position.x += this.facing * (this.speed * 1.4) * dt;
            if (distToPlayer <= this.attackRange) {
              this.state = 'attack';
              this.stateTimer = 0.35;
            }
          }
        }
        break;

      case 'attack':
        this.stateTimer -= dt;
        const progress = 1.0 - (this.stateTimer / 0.35);

        // Telegraph & Lunge swing
        this.armPivot.rotation.x = -0.5 + progress * 1.6;
        if (progress > 0.4 && progress < 0.7) {
          // Check collision with player
          if (distToPlayer < 1.6 && yDist < 1.5 && player && !player.isDead) {
            player.takeDamage(1, this.facing, audio);
            if (camera) camera.addShake(0.3);
          }
        }

        if (this.stateTimer <= 0) {
          this.state = 'cooldown';
          this.stateTimer = 0.8;
          this.armPivot.rotation.x = 0;
        }
        break;

      case 'cooldown':
        this.stateTimer -= dt;
        if (this.stateTimer <= 0) {
          this.state = 'patrol';
        }
        break;

      case 'hurt':
        this.stateTimer -= dt;
        if (this.stateTimer <= 0) {
          this.state = 'alert';
          this.stateTimer = 0.2;
        }
        break;
    }

    this.rootMesh.rotation.y = this.facing === 1 ? 0 : Math.PI;

    // Kinematic Limb Animation
    const legAngle = Math.sin(this.animTime * 10.0) * 0.5;
    this.leftLegPivot.rotation.x = this.state === 'patrol' ? legAngle : 0;
    this.rightLegPivot.rotation.x = this.state === 'patrol' ? -legAngle : 0;
  }

  getBounds() {
    return {
      x: this.rootMesh.position.x - this.width / 2,
      y: this.rootMesh.position.y,
      width: this.width,
      height: this.height
    };
  }
}
