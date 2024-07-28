export function moving(entity, delta, root) {
  entity.move(entity.direction, root.children[0]);
}
