/**
 * CombatSystem — Resolves melee blade slashes, damage, hit sparks, and knockbacks.
 */
export class CombatSystem {
  constructor(scene) {
    this.scene = scene;
  }

  update(player, enemies, audio, camera) {
    if (!player || player.isDead || !player.isAttacking) return;

    const attackBox = player.getAttackHitbox();
    if (!attackBox) return;

    for (const enemy of enemies) {
      if (enemy.isDead || enemy.health <= 0) continue;

      const eBounds = enemy.getBounds();
      const overlaps = (
        attackBox.x < eBounds.x + eBounds.width &&
        attackBox.x + attackBox.width > eBounds.x &&
        attackBox.y < eBounds.y + eBounds.height &&
        attackBox.y + attackBox.height > eBounds.y
      );

      if (overlaps) {
        enemy.takeDamage(attackBox.damage, attackBox.facing, audio);
        if (camera) camera.addShake(0.25);
      }
    }
  }
}
