import { LEFT, RIGHT, UP, DOWN } from "../../../Input.js";
export function idle(entity, delta, root) {
  const check = entity.facingDirection || entity._lastDirection;
  if (check === LEFT) {
    entity.body.animations.play("standLeft");
  }
  if (check === RIGHT) {
    entity.body.animations.play("standRight");
  }
  if (check === UP) {
    entity.body.animations.play("standUp");
  }
  if (check === DOWN) {
    entity.body.animations.play("dance");
  }
}
