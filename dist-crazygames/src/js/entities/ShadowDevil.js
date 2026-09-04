/**
 * ShadowDevil — Background entity directing atmospheric events and gaze mechanics.
 */
export class ShadowDevil {
  constructor(x = 600, y = 250) {
    this.x = x;
    this.y = y;
    this.visible = true;

    // Gaze state machine
    // 'dormant' -> 'warning' (eye opens, heartbeat sound) -> 'gaze' (deadly pulse) -> 'cooldown'
    this.state = 'dormant';
    this.stateTimer = 0;
    this.cycleInterval = 4.0; // Seconds between gaze cycles
    this.warningDuration = 1.2; // Seconds of warning telegraph
    this.gazeDuration = 1.6; // Seconds of active gaze
    this.cooldownDuration = 2.0;

    this.eyeOpenProgress = 0; // 0 to 1
    this.pulseGlow = 0;
    this.isGazeActive = false;
  }

  reset() {
    this.state = 'dormant';
    this.stateTimer = 0;
    this.eyeOpenProgress = 0;
    this.pulseGlow = 0;
    this.isGazeActive = false;
  }

  update(dt, player, audio) {
    this.stateTimer += dt;

    switch (this.state) {
      case 'dormant':
        this.eyeOpenProgress = Math.max(0, this.eyeOpenProgress - dt * 2.0);
        this.isGazeActive = false;
        if (this.stateTimer >= this.cycleInterval) {
          this.state = 'warning';
          this.stateTimer = 0;
          if (audio) audio.playGazeHeartbeat();
        }
        break;

      case 'warning':
        this.eyeOpenProgress = Math.min(1.0, this.eyeOpenProgress + dt * 1.5);
        this.pulseGlow = Math.sin(this.stateTimer * 12) * 0.5 + 0.5;
        this.isGazeActive = false;
        if (this.stateTimer >= this.warningDuration) {
          this.state = 'gaze';
          this.stateTimer = 0;
          this.isGazeActive = true;
          if (audio) audio.playTrapSnap();
        }
        break;

      case 'gaze':
        this.eyeOpenProgress = 1.0;
        this.isGazeActive = true;
        this.pulseGlow = 1.0;

        // Deadly stealth condition: moving during active gaze triggers kill
        if (player && !player.isDead && (Math.abs(player.vx) > 20 || Math.abs(player.vy) > 20)) {
          player.kill('shadow_devil_gaze');
        }

        if (this.stateTimer >= this.gazeDuration) {
          this.state = 'cooldown';
          this.stateTimer = 0;
          this.isGazeActive = false;
        }
        break;

      case 'cooldown':
        this.eyeOpenProgress = Math.max(0, this.eyeOpenProgress - dt * 2.5);
        this.pulseGlow = 0;
        this.isGazeActive = false;
        if (this.stateTimer >= this.cooldownDuration) {
          this.state = 'dormant';
          this.stateTimer = 0;
        }
        break;
    }
  }
}
