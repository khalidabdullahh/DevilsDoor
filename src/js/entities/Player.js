import { CollisionBox } from '../physics/CollisionBox.js';

/**
 * Player — Responsive platformer controller with coyote time and jump buffering.
 */
export class Player {
  constructor(startX = 100, startY = 300) {
    this.startX = startX;
    this.startY = startY;

    this.width = 24;
    this.height = 36;
    this.box = new CollisionBox(startX, startY, this.width, this.height, 'player');

    this.vx = 0;
    this.vy = 0;
    this.facing = 1; // 1 = right, -1 = left

    // Physics constants
    this.gravity = 1400;
    this.maxFallSpeed = 900;
    this.accel = 2800;
    this.decel = 3200;
    this.maxRunSpeed = 280;
    this.jumpSpeed = -520;
    this.variableJumpFactor = 0.45;

    // Movement state
    this.isGrounded = false;
    this.wasGrounded = false;
    this.isJumping = false;
    this.isDead = false;
    this.hasWon = false;

    // Juice & feel timers
    this.coyoteTimer = 0;
    this.coyoteDuration = 0.10; // 100ms
    this.jumpBufferTimer = 0;
    this.jumpBufferDuration = 0.12; // 120ms

    // Particle / aura history
    this.trail = [];
    this.deathParticles = [];
    this.phaseColor = 'A'; // 'A' or 'B'
  }

  reset(startX, startY) {
    if (startX !== undefined) this.startX = startX;
    if (startY !== undefined) this.startY = startY;

    this.box.x = this.startX;
    this.box.y = this.startY;
    this.vx = 0;
    this.vy = 0;
    this.isGrounded = false;
    this.wasGrounded = false;
    this.isJumping = false;
    this.isDead = false;
    this.hasWon = false;
    this.coyoteTimer = 0;
    this.jumpBufferTimer = 0;
    this.trail = [];
    this.deathParticles = [];
  }

  kill(trapTag = '') {
    if (this.isDead || this.hasWon) return;
    this.isDead = true;
    this.vx = 0;
    this.vy = 0;

    // Spawn death disintegration particles
    this.deathParticles = [];
    for (let i = 0; i < 24; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 80 + Math.random() * 240;
      this.deathParticles.push({
        x: this.box.x + this.width / 2,
        y: this.box.y + this.height / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 50,
        size: 3 + Math.random() * 4,
        alpha: 1.0,
        color: Math.random() > 0.3 ? '#38bdf8' : '#f8fafc'
      });
    }
  }

  update(dt, input, physicsWorld, audio) {
    if (this.isDead) {
      // Update death particles
      for (const p of this.deathParticles) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 400 * dt; // slight gravity on particles
        p.alpha -= dt * 2.2;
      }
      return;
    }

    if (this.hasWon) return;

    const movingLeft = input.isLeft();
    const movingRight = input.isRight();
    const jumpPressed = input.isJump();
    const jumpJustPressed = input.isJumpJustPressed();

    // 1. Jump buffer queue
    if (jumpJustPressed) {
      this.jumpBufferTimer = this.jumpBufferDuration;
    } else {
      this.jumpBufferTimer = Math.max(0, this.jumpBufferTimer - dt);
    }

    // 2. Coyote timer
    if (this.isGrounded) {
      this.coyoteTimer = this.coyoteDuration;
    } else {
      this.coyoteTimer = Math.max(0, this.coyoteTimer - dt);
    }

    // 3. Horizontal movement
    if (movingLeft && !movingRight) {
      this.vx = Math.max(-this.maxRunSpeed, this.vx - this.accel * dt);
      this.facing = -1;
    } else if (movingRight && !movingLeft) {
      this.vx = Math.min(this.maxRunSpeed, this.vx + this.accel * dt);
      this.facing = 1;
    } else {
      // Snappy deceleration
      if (this.vx > 0) {
        this.vx = Math.max(0, this.vx - this.decel * dt);
      } else if (this.vx < 0) {
        this.vx = Math.min(0, this.vx + this.decel * dt);
      }
    }

    // 4. Jump initiation (Jump buffer + Coyote time)
    if (this.jumpBufferTimer > 0 && this.coyoteTimer > 0) {
      this.vy = this.jumpSpeed;
      this.isJumping = true;
      this.isGrounded = false;
      this.coyoteTimer = 0;
      this.jumpBufferTimer = 0;
      if (audio) audio.playJump();
    }

    // 5. Variable jump height (releasing jump button cuts upward velocity)
    if (!jumpPressed && this.vy < 0 && this.isJumping) {
      this.vy *= this.variableJumpFactor;
      this.isJumping = false;
    }

    // 6. Apply gravity
    this.vy = Math.min(this.maxFallSpeed, this.vy + this.gravity * dt);

    // 7. Resolve movement against physics world
    const dx = this.vx * dt;
    const dy = this.vy * dt;
    const moveResult = physicsWorld.resolveMovement(this.box, dx, dy);

    this.box.x = moveResult.x;
    this.box.y = moveResult.y;

    this.wasGrounded = this.isGrounded;
    this.isGrounded = moveResult.grounded;

    if (moveResult.collidedX) {
      this.vx = 0;
    }
    if (moveResult.collidedY) {
      if (this.vy > 0 && !this.wasGrounded && this.isGrounded) {
        // Landing
        if (audio && Math.abs(this.vy) > 150) audio.playLand();
      }
      this.vy = 0;
    }

    // 8. Trail history for visual flair
    if (Math.abs(this.vx) > 30 || !this.isGrounded) {
      this.trail.unshift({
        x: this.box.x,
        y: this.box.y,
        alpha: 0.4
      });
      if (this.trail.length > 5) this.trail.pop();
    }
    for (const t of this.trail) {
      t.alpha -= dt * 2.5;
    }
    this.trail = this.trail.filter(t => t.alpha > 0);
  }
}
