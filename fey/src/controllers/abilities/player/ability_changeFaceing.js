import { LEFT, RIGHT, UP, DOWN } from "../../../Input.js";
import { TURN_DELAY } from "../../../constants.js";

export function changeFacing(entity, delta, root) {

  if (entity.facingDirection != entity.lastDirection) {
    entity.facingDirection = entity.lastDirection;

    entity.turnDelay = TURN_DELAY;
  }

  if (entity.turnDelay > 0) {
    entity.turnDelay -= delta;
  } 
  if (entity.turnDelay <= 0) {
    entity.turnDelay = 0;
  }

  if (entity.facingDirection === LEFT) {
    entity.body.animations.play("standLeft");
  }
  if (entity.facingDirection === RIGHT) {
    entity.body.animations.play("standRight");
  }
  if (entity.facingDirection === UP) {
    entity.body.animations.play("standUp");
  }
  if (entity.facingDirection === DOWN) {
    entity.body.animations.play("standDown");
  }
}
