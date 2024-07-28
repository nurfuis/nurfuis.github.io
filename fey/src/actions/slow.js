export function slow(entity, duration, amount) {
  // 0.0 - 1.0
  entity.speed = Math.max(0, entity.speed * amount);
  setTimeout(() => {
    entity.speed = entity.baseSpeed;
  }, duration);
}
