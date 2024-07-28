export function stagger(entity, delta, root) {
  if (!entity.stagger) {
    entity.stagger = 0;
  }
  // if (entity.stagger < 2) {
  //   entity.stagger += 1;
  // }
  // entity.speed = -BASE_SPEED;
  // setTimeout(() => {
  //   entity.speed = entity.baseSpeed;
  // }, 200);
  // if (entity.stagger < 3) {
  //   events.emit("SHAKE_CAMERA", entity);
  // }
}
