import { LEFT, RIGHT, UP, DOWN } from "../../../Input.js";

export function stuck(entity, delta, root) {
  if (entity.facingDirection === LEFT) {
    entity.body.animations.play("attackLeft");
  }
  if (entity.facingDirection === RIGHT) {
    entity.body.animations.play("attackRight");
  }
  if (entity.facingDirection === UP) {
    entity.body.animations.play("attackUp");
  }
  if (entity.facingDirection === DOWN) {
    entity.body.animations.play("attackDown");
  }
}
