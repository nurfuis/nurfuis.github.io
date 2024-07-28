import { PLAYER_REACH } from "../constants.js";

export function interact(entity, delta, root) {
  const direction = entity.facingDirection;
  // const range = entity.radius * PLAYER_REACH;
  // const facingOffset = entity.radius * 0.5; // pushes the attack origin out from center of body some

  let hit;

  // let targetPoint = { x: entity.center.x, y: entity.center.y };

  // switch (direction) {
  //   case "UP":
  //     targetPoint.y -= range;

  //     const raycastHitA = entity.position.raycastTarget(
  //       entity.center.x,
  //       entity.center.y - facingOffset,
  //       targetPoint.x,
  //       targetPoint.y,
  //       entity
  //     );

  //     if (raycastHitA.collision) {
  //       entity.raycast.visualize(
  //         entity.center.x,
  //         entity.center.y - facingOffset,

  //         raycastHitA.position.x,
  //         raycastHitA.position.y,
  //         raycastHitA.position,
  //         entity
  //       );
  //       hit = raycastHitA.entity;
  //     } else {
  //       entity.raycast.visualize(
  //         entity.center.x,
  //         entity.center.y - facingOffset,

  //         targetPoint.x,
  //         targetPoint.y,
  //         entity.center,
  //         entity
  //       );
  //     }

  //     break;

  //   case "RIGHT":
  //     targetPoint.x += range;

  //     // right straight
  //     const raycastHitD = entity.position.raycastTarget(
  //       entity.center.x + facingOffset,
  //       entity.center.y,
  //       targetPoint.x,
  //       targetPoint.y,
  //       entity
  //     );

  //     if (raycastHitD.collision) {
  //       entity.raycast.visualize(
  //         entity.center.x + facingOffset,
  //         entity.center.y,

  //         raycastHitD.position.x,
  //         raycastHitD.position.y,
  //         raycastHitD.position,
  //         entity
  //       );
  //       hit = raycastHitD.entity;
  //     } else {
  //       entity.raycast.visualize(
  //         entity.center.x + facingOffset,
  //         entity.center.y,

  //         targetPoint.x,
  //         targetPoint.y,
  //         entity.center,
  //         entity
  //       );
  //     }
  //     break;

  //   case "DOWN":
  //     targetPoint.y += range;

  //     const raycastHitG = entity.position.raycastTarget(
  //       entity.center.x,
  //       entity.center.y + facingOffset,
  //       targetPoint.x,
  //       targetPoint.y,
  //       entity
  //     );

  //     if (raycastHitG.collision) {
  //       entity.raycast.visualize(
  //         entity.center.x,
  //         entity.center.y + facingOffset,

  //         raycastHitG.position.x,
  //         raycastHitG.position.y,
  //         raycastHitG.position,
  //         entity
  //       );
  //       hit = raycastHitG.entity;
  //     } else {
  //       entity.raycast.visualize(
  //         entity.center.x,
  //         entity.center.y + facingOffset,

  //         targetPoint.x,
  //         targetPoint.y,
  //         entity.center,
  //         entity
  //       );
  //     }
  //     break;

  //   case "LEFT":
  //     targetPoint.x -= range;
  //     // left straight
  //     const raycastHitJ = entity.position.raycastTarget(
  //       entity.center.x - facingOffset,
  //       entity.center.y,
  //       targetPoint.x,
  //       targetPoint.y,
  //       entity
  //     );

  //     if (raycastHitJ.collision) {
  //       entity.raycast.visualize(
  //         entity.center.x - facingOffset,
  //         entity.center.y,

  //         raycastHitJ.position.x,
  //         raycastHitJ.position.y,
  //         raycastHitJ.position,
  //         entity
  //       );
  //       hit = raycastHitJ.entity;
  //     } else {
  //       entity.raycast.visualize(
  //         entity.center.x - facingOffset,
  //         entity.center.y,

  //         targetPoint.x,
  //         targetPoint.y,
  //         entity.center,
  //         entity
  //       );
  //     }
  //     break;
  // }
  // if (hit) {
  //   console.log(hit);
  // }

  // // we can use this loop to trigger some sounds and animations or indicate a strike somehow.
  // // then before the return we emit an event with the hitlist and involved objects,
  // // the caster and the hit entity
  // // handle this in an event by the collidee
  return hit;
}
