/**
 * NinjaPlayer3D — Stylized 3D Ninja Character with Procedural Kinematics & Combat.
 * Features: Masked cowl with glowing cyan visor, dual trailing headband ribbons,
 * articulated limb hierarchy, katana slash VFX, and responsive platformer physics.
 */
export class NinjaPlayer3D {
  constructor(scene, shadowGenerator, startX = 0, startY = 4) {
    this.scene = scene;
    this.shadowGenerator = shadowGenerator;

    // Movement & Physics Constants (in 3D world units)
    this.width = 0.8;
    this.height = 1.8;
    this.depth = 0.6;

    this.vx = 0;
    this.vy = 0;
    this.facing = 1; // 1 = Right (+X), -1 = Left (-X)

    this.runSpeed = 10.5;
    this.accel = 70.0;
    this.decel = 80.0;
    this.jumpSpeed = 15.2;
    this.gravity = -36.0;
    this.maxFallSpeed = -24.0;
    this.variableJumpFactor = 0.45;

    this.isGrounded = false;
    this.wasGrounded = false;
    this.isJumping = false;
    this.isDead = false;
    this.hasWon = false;

    // Combat & Health
    this.maxHealth = 3;
    this.health = 3;
    this.isAttacking = false;
    this.attackTimer = 0;
    this.attackDuration = 0.28; // 280ms slash action
    this.attackCooldown = 0;
    this.comboCount = 1;
    this.invulnerableTimer = 0;

    // Juice & Feel Timers
    this.coyoteTimer = 0;
    this.coyoteDuration = 0.12;
    this.jumpBufferTimer = 0;
    this.jumpBufferDuration = 0.14;

    // Kinematic Animation Variables
    this.animTime = 0;
    this.state = 'idle'; // idle, run, jump, fall, attack, hurt, dead
    this.ribbonNodes = [];

    this._buildMeshHierarchy(startX, startY);
  }

  _buildMeshHierarchy(startX, startY) {
    // 1. Root Container
    this.rootMesh = new BABYLON.TransformNode('ninjaRoot', this.scene);
    this.rootMesh.position = new BABYLON.Vector3(startX, startY, 0);

    // 2. Materials
    const pbrGarb = new BABYLON.StandardMaterial('matNinjaGarb', this.scene);
    pbrGarb.diffuseColor = new BABYLON.Color3(0.08, 0.11, 0.17);
    pbrGarb.specularColor = new BABYLON.Color3(0.15, 0.18, 0.25);
    pbrGarb.specularPower = 32;

    const matArmor = new BABYLON.StandardMaterial('matNinjaArmor', this.scene);
    matArmor.diffuseColor = new BABYLON.Color3(0.04, 0.05, 0.08);
    matArmor.specularColor = new BABYLON.Color3(0.4, 0.5, 0.6);
    matArmor.specularPower = 64;

    const matCyanVisor = new BABYLON.StandardMaterial('matCyanVisor', this.scene);
    matCyanVisor.diffuseColor = new BABYLON.Color3(0.1, 0.7, 1.0);
    matCyanVisor.emissiveColor = new BABYLON.Color3(0.2, 0.85, 1.0);

    const matSash = new BABYLON.StandardMaterial('matSash', this.scene);
    matSash.diffuseColor = new BABYLON.Color3(0.22, 0.28, 0.38);

    const matSteel = new BABYLON.StandardMaterial('matSteel', this.scene);
    matSteel.diffuseColor = new BABYLON.Color3(0.8, 0.85, 0.9);
    matSteel.specularColor = new BABYLON.Color3(1.0, 1.0, 1.0);
    matSteel.specularPower = 128;
    matSteel.emissiveColor = new BABYLON.Color3(0.05, 0.15, 0.25);

    this.matGarb = pbrGarb;
    this.matArmor = matArmor;

    // 3. Body Pivot (for breathing / tilt)
    this.bodyPivot = new BABYLON.TransformNode('bodyPivot', this.scene);
    this.bodyPivot.parent = this.rootMesh;
    this.bodyPivot.position.y = 0.9;

    // 4. Torso & Armor
    this.torsoMesh = BABYLON.MeshBuilder.CreateBox('torso', { width: 0.6, height: 0.7, depth: 0.4 }, this.scene);
    this.torsoMesh.material = pbrGarb;
    this.torsoMesh.parent = this.bodyPivot;
    this.torsoMesh.position.y = 0.05;

    const sash = BABYLON.MeshBuilder.CreateBox('sash', { width: 0.62, height: 0.16, depth: 0.42 }, this.scene);
    sash.material = matSash;
    sash.parent = this.torsoMesh;
    sash.position.y = -0.22;

    // 5. Head & Masked Cowl
    this.headPivot = new BABYLON.TransformNode('headPivot', this.scene);
    this.headPivot.parent = this.bodyPivot;
    this.headPivot.position.y = 0.55;

    this.headMesh = BABYLON.MeshBuilder.CreateSphere('head', { diameterX: 0.45, diameterY: 0.48, diameterZ: 0.46, segments: 12 }, this.scene);
    this.headMesh.material = matArmor;
    this.headMesh.parent = this.headPivot;

    // Glowing Cyan Visor / Eye Slit
    const visor = BABYLON.MeshBuilder.CreateBox('visor', { width: 0.32, height: 0.07, depth: 0.12 }, this.scene);
    visor.material = matCyanVisor;
    visor.parent = this.headMesh;
    visor.position = new BABYLON.Vector3(0.14, 0.03, 0);

    // 6. Trailing Headband Ribbons (Dual Cloth Physics)
    this.ribbon1 = BABYLON.MeshBuilder.CreateBox('ribbon1', { width: 0.45, height: 0.08, depth: 0.02 }, this.scene);
    this.ribbon1.material = matSash;
    this.ribbon1.parent = this.headPivot;
    this.ribbon1.position = new BABYLON.Vector3(-0.25, 0.05, 0.06);

    this.ribbon2 = BABYLON.MeshBuilder.CreateBox('ribbon2', { width: 0.55, height: 0.08, depth: 0.02 }, this.scene);
    this.ribbon2.material = matSash;
    this.ribbon2.parent = this.headPivot;
    this.ribbon2.position = new BABYLON.Vector3(-0.30, -0.02, -0.06);

    // 7. Shoulders & Arms
    // Left Arm (Back Arm)
    this.leftArmPivot = new BABYLON.TransformNode('leftArmPivot', this.scene);
    this.leftArmPivot.parent = this.bodyPivot;
    this.leftArmPivot.position = new BABYLON.Vector3(0, 0.32, -0.32);

    this.leftArmMesh = BABYLON.MeshBuilder.CreateCylinder('leftArm', { height: 0.55, diameter: 0.15, tessellation: 8 }, this.scene);
    this.leftArmMesh.material = pbrGarb;
    this.leftArmMesh.parent = this.leftArmPivot;
    this.leftArmMesh.position.y = -0.25;

    // Right Arm (Weapon Arm)
    this.rightArmPivot = new BABYLON.TransformNode('rightArmPivot', this.scene);
    this.rightArmPivot.parent = this.bodyPivot;
    this.rightArmPivot.position = new BABYLON.Vector3(0, 0.32, 0.32);

    this.rightArmMesh = BABYLON.MeshBuilder.CreateCylinder('rightArm', { height: 0.55, diameter: 0.15, tessellation: 8 }, this.scene);
    this.rightArmMesh.material = pbrGarb;
    this.rightArmMesh.parent = this.rightArmPivot;
    this.rightArmMesh.position.y = -0.25;

    // Shoulder Pauldrons
    const pauldronR = BABYLON.MeshBuilder.CreateBox('pauldronR', { width: 0.24, height: 0.14, depth: 0.22 }, this.scene);
    pauldronR.material = matArmor;
    pauldronR.parent = this.rightArmPivot;
    pauldronR.position.y = 0.02;

    const pauldronL = BABYLON.MeshBuilder.CreateBox('pauldronL', { width: 0.24, height: 0.14, depth: 0.22 }, this.scene);
    pauldronL.material = matArmor;
    pauldronL.parent = this.leftArmPivot;
    pauldronL.position.y = 0.02;

    // 8. Katana Blade & Scabbard
    this.katanaPivot = new BABYLON.TransformNode('katanaPivot', this.scene);
    this.katanaPivot.parent = this.rightArmPivot;
    this.katanaPivot.position = new BABYLON.Vector3(0.05, -0.48, 0);

    this.bladeMesh = BABYLON.MeshBuilder.CreateBox('blade', { width: 1.1, height: 0.05, depth: 0.015 }, this.scene);
    this.bladeMesh.material = matSteel;
    this.bladeMesh.parent = this.katanaPivot;
    this.bladeMesh.position.x = 0.55;

    const tsuba = BABYLON.MeshBuilder.CreateCylinder('tsuba', { height: 0.02, diameter: 0.12, tessellation: 8 }, this.scene);
    tsuba.material = matArmor;
    tsuba.parent = this.katanaPivot;
    tsuba.rotation.z = Math.PI / 2;

    // Sheathed Scabbard on Back
    const scabbard = BABYLON.MeshBuilder.CreateBox('scabbard', { width: 1.0, height: 0.06, depth: 0.04 }, this.scene);
    scabbard.material = matArmor;
    scabbard.parent = this.torsoMesh;
    scabbard.position = new BABYLON.Vector3(-0.24, 0.05, 0);
    scabbard.rotation.z = -0.7;

    // 9. Legs & Tabi Boots
    this.leftLegPivot = new BABYLON.TransformNode('leftLegPivot', this.scene);
    this.leftLegPivot.parent = this.bodyPivot;
    this.leftLegPivot.position = new BABYLON.Vector3(0, -0.35, -0.16);

    this.leftLegMesh = BABYLON.MeshBuilder.CreateCylinder('leftLeg', { height: 0.65, diameter: 0.18, tessellation: 8 }, this.scene);
    this.leftLegMesh.material = pbrGarb;
    this.leftLegMesh.parent = this.leftLegPivot;
    this.leftLegMesh.position.y = -0.32;

    this.rightLegPivot = new BABYLON.TransformNode('rightLegPivot', this.scene);
    this.rightLegPivot.parent = this.bodyPivot;
    this.rightLegPivot.position = new BABYLON.Vector3(0, -0.35, 0.16);

    this.rightLegMesh = BABYLON.MeshBuilder.CreateCylinder('rightLeg', { height: 0.65, diameter: 0.18, tessellation: 8 }, this.scene);
    this.rightLegMesh.material = pbrGarb;
    this.rightLegMesh.parent = this.rightLegPivot;
    this.rightLegMesh.position.y = -0.32;

    // Cast dynamic shadows
    if (this.shadowGenerator) {
      const meshes = [this.torsoMesh, this.headMesh, this.leftArmMesh, this.rightArmMesh, this.bladeMesh, this.leftLegMesh, this.rightLegMesh];
      meshes.forEach(m => {
        if (m) this.shadowGenerator.addShadowCaster(m);
      });
    }

    // 10. Slash Ribbon VFX Mesh
    this.slashArcMesh = BABYLON.MeshBuilder.CreateTorus('slashArc', { diameter: 1.8, thickness: 0.08, tessellation: 24 }, this.scene);
    const matSlash = new BABYLON.StandardMaterial('matSlash', this.scene);
    matSlash.emissiveColor = new BABYLON.Color3(0.3, 0.9, 1.0);
    matSlash.diffuseColor = new BABYLON.Color3(0.5, 0.95, 1.0);
    matSlash.alpha = 0;
    this.slashArcMesh.material = matSlash;
    this.slashArcMesh.parent = this.rootMesh;
    this.slashArcMesh.position = new BABYLON.Vector3(0.6, 1.0, 0);
    this.slashArcMesh.rotation.x = Math.PI / 2;
    this.matSlash = matSlash;
  }

  reset(startX = 0, startY = 4) {
    this.rootMesh.position.x = startX;
    this.rootMesh.position.y = startY;
    this.rootMesh.position.z = 0;
    this.vx = 0;
    this.vy = 0;
    this.health = this.maxHealth;
    this.isDead = false;
    this.hasWon = false;
    this.isAttacking = false;
    this.attackTimer = 0;
    this.coyoteTimer = 0;
    this.jumpBufferTimer = 0;
    this.invulnerableTimer = 0;
  }

  takeDamage(amount = 1, knockbackDir = -1, audio = null) {
    if (this.isDead || this.hasWon || this.invulnerableTimer > 0) return;
    this.health -= amount;
    this.invulnerableTimer = 0.8;
    this.vx = knockbackDir * 8.0;
    this.vy = 6.0;

    if (audio) audio.playBladeHit();

    if (this.health <= 0) {
      this.kill('enemy_strike', audio);
    }
  }

  kill(cause = '', audio = null) {
    if (this.isDead || this.hasWon) return;
    this.isDead = true;
    this.vx = 0;
    this.vy = 0;
    if (audio) audio.playDeath();
  }

  update(dt, input, physicsWorld, audio, camera) {
    if (this.isDead || this.hasWon) return;

    this.animTime += dt;
    if (this.invulnerableTimer > 0) {
      this.invulnerableTimer -= dt;
      // Flash visibility during invulnerability
      this.rootMesh.setEnabled(Math.floor(this.animTime * 20) % 2 === 0);
    } else {
      this.rootMesh.setEnabled(true);
    }

    if (this.attackCooldown > 0) this.attackCooldown -= dt;

    const movingLeft = input.isLeft();
    const movingRight = input.isRight();
    const jumpPressed = input.isJump();
    const jumpJustPressed = input.isJumpJustPressed();
    const attackJustPressed = input.isAttackJustPressed();

    // 1. Attack Trigger
    if (attackJustPressed && !this.isAttacking && this.attackCooldown <= 0) {
      this.isAttacking = true;
      this.attackTimer = this.attackDuration;
      this.attackCooldown = 0.35;
      if (audio) audio.playKatanaSlash();
      if (camera) camera.addShake(0.15);
      // Small forward lunging impulse
      this.vx = this.facing * (this.isGrounded ? 5.0 : 3.0);
    }

    // 2. Jump Buffering & Coyote Time
    if (jumpJustPressed) {
      this.jumpBufferTimer = this.jumpBufferDuration;
    } else {
      this.jumpBufferTimer = Math.max(0, this.jumpBufferTimer - dt);
    }

    if (this.isGrounded) {
      this.coyoteTimer = this.coyoteDuration;
    } else {
      this.coyoteTimer = Math.max(0, this.coyoteTimer - dt);
    }

    // 3. Horizontal Acceleration
    if (!this.isAttacking || !this.isGrounded) {
      if (movingLeft && !movingRight) {
        this.vx = Math.max(-this.runSpeed, this.vx - this.accel * dt);
        this.facing = -1;
      } else if (movingRight && !movingLeft) {
        this.vx = Math.min(this.runSpeed, this.vx + this.accel * dt);
        this.facing = 1;
      } else {
        if (this.vx > 0) this.vx = Math.max(0, this.vx - this.decel * dt);
        else if (this.vx < 0) this.vx = Math.min(0, this.vx + this.decel * dt);
      }
    }

    // 4. Jump Execution
    if (this.jumpBufferTimer > 0 && this.coyoteTimer > 0) {
      this.vy = this.jumpSpeed;
      this.isJumping = true;
      this.isGrounded = false;
      this.coyoteTimer = 0;
      this.jumpBufferTimer = 0;
      if (audio) audio.playJump();
    }

    // Variable jump height
    if (!jumpPressed && this.vy > 0 && this.isJumping) {
      this.vy *= this.variableJumpFactor;
      this.isJumping = false;
    }

    // 5. Gravity
    this.vy = Math.max(this.maxFallSpeed, this.vy + this.gravity * dt);

    // 6. Physics Collision Resolution
    const dx = this.vx * dt;
    const dy = this.vy * dt;
    const res = physicsWorld.resolveMovement(this.rootMesh.position.x, this.rootMesh.position.y, this.width, this.height, dx, dy);

    this.rootMesh.position.x = res.x;
    this.rootMesh.position.y = res.y;

    this.wasGrounded = this.isGrounded;
    this.isGrounded = res.grounded;

    if (res.collidedX) this.vx = 0;
    if (res.collidedY) {
      if (this.vy < -3 && !this.wasGrounded && this.isGrounded && audio) {
        audio.playLand();
      }
      this.vy = 0;
    }

    // Footsteps
    if (this.isGrounded && Math.abs(this.vx) > 2.0 && audio) {
      audio.playFootstep();
    }

    // 7. Update Facing & Rotation
    this.rootMesh.rotation.y = this.facing === 1 ? 0 : Math.PI;

    // 8. Update Procedural Animations
    this._updateProceduralAnimations(dt);
  }

  _updateProceduralAnimations(dt) {
    const t = this.animTime;
    const isRunning = this.isGrounded && Math.abs(this.vx) > 0.5;

    if (this.isAttacking) {
      this.attackTimer -= dt;
      const progress = 1.0 - (this.attackTimer / this.attackDuration); // 0 to 1

      // Slash arc sweep
      this.rightArmPivot.rotation.x = -Math.PI / 3 + progress * (Math.PI * 0.9);
      this.rightArmPivot.rotation.z = 0.4 - progress * 0.8;
      this.bodyPivot.rotation.y = (progress - 0.5) * 0.6;
      this.bodyPivot.rotation.z = 0.2;

      // Show and fade slash arc ribbon
      if (this.matSlash) {
        this.matSlash.alpha = Math.sin(progress * Math.PI) * 0.85;
      }

      if (this.attackTimer <= 0) {
        this.isAttacking = false;
        if (this.matSlash) this.matSlash.alpha = 0;
      }
    } else if (!this.isGrounded) {
      // In Air (Jump / Fall)
      const isRising = this.vy > 0;
      this.bodyPivot.rotation.z = isRising ? 0.1 : -0.05;
      this.bodyPivot.rotation.y = 0;

      // Legs tuck on rise, extend on fall
      this.leftLegPivot.rotation.x = isRising ? -0.7 : 0.2;
      this.rightLegPivot.rotation.x = isRising ? 0.5 : -0.2;

      // Arms ready pose
      this.leftArmPivot.rotation.x = 0.4;
      this.rightArmPivot.rotation.x = -0.5;
    } else if (isRunning) {
      // Running Sprint Cycle (Kinematic Limb Rotation)
      const runFreq = 14.0;
      const legAngle = Math.sin(t * runFreq) * 0.75;
      const armAngle = Math.cos(t * runFreq) * 0.65;

      this.bodyPivot.position.y = 0.9 + Math.abs(Math.sin(t * runFreq)) * 0.06;
      this.bodyPivot.rotation.z = 0.18; // Forward sprint lean
      this.bodyPivot.rotation.y = 0;

      this.leftLegPivot.rotation.x = legAngle;
      this.rightLegPivot.rotation.x = -legAngle;

      this.leftArmPivot.rotation.x = -armAngle;
      this.rightArmPivot.rotation.x = armAngle * 0.7 - 0.2;
    } else {
      // Idle Breathing Stance
      const breathe = Math.sin(t * 2.5) * 0.02;
      this.bodyPivot.position.y = 0.9 + breathe;
      this.bodyPivot.rotation.z = 0.02;
      this.bodyPivot.rotation.y = 0;

      this.leftLegPivot.rotation.x = 0.05;
      this.rightLegPivot.rotation.x = -0.05;

      this.leftArmPivot.rotation.x = 0.15 + breathe;
      this.rightArmPivot.rotation.x = -0.2 - breathe;
    }

    // Trailing Headband Ribbons (Dynamic wind / movement flutter)
    const ribbonFlutter1 = Math.sin(t * 18 + 0.5) * 0.15 - (this.vx * 0.03);
    const ribbonFlutter2 = Math.cos(t * 16) * 0.15 - (this.vx * 0.03);
    if (this.ribbon1) this.ribbon1.rotation.y = ribbonFlutter1;
    if (this.ribbon2) this.ribbon2.rotation.y = ribbonFlutter2;
  }

  getAttackHitbox() {
    if (!this.isAttacking) return null;
    const px = this.rootMesh.position.x;
    const py = this.rootMesh.position.y;
    return {
      x: px + (this.facing === 1 ? 0.3 : -1.5),
      y: py + 0.2,
      width: 1.2,
      height: 1.4,
      damage: 1,
      facing: this.facing
    };
  }
}
