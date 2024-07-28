import { LEFT, RIGHT, UP, DOWN } from "../../../Input.js";
export function idleAi(entity, delta, root) {
    entity.tryMoveAttempts = 0;
    if (entity.facingDirection === LEFT) {
        entity.body.animations.play("idleLeft");
      }
      if (entity.facingDirection === RIGHT) {
        entity.body.animations.play("idleRight");
      }
      if (entity.facingDirection === UP) {
        entity.body.animations.play("idleUp");
      }
      if (entity.facingDirection === DOWN) {
        entity.body.animations.play("idleDown");
      }  
}
