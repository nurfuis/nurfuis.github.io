export function sweepAttack(entity, delta, root) {
  const direction = entity.facingDirection;
  const range = entity.radius * 4;
  const spread = entity.radius * 1.2;
  const reach = entity.radius * 1.2;
  const facingOffset = entity.radius * 0.5; // pushes the attack origin out from center of body some

  let hitList = [];

  let targetPoint = { x: entity.center.x, y: entity.center.y };

  switch (direction) {
    case "UP":
      targetPoint.y -= range;

      const raycastHitA = entity.position.raycastCircle(
        entity.center.x,
        entity.center.y - facingOffset,
        targetPoint.x,
        targetPoint.y,
      );

      if (raycastHitA.collision) {
        entity.raycast.visualize(
          entity.center.x,
          entity.center.y - facingOffset,

          raycastHitA.position.x,
          raycastHitA.position.y,
          raycastHitA.position,
          entity,
        );
        hitList.push(raycastHitA.entity);
      } else {
        entity.raycast.visualize(
          entity.center.x,
          entity.center.y - facingOffset,

          targetPoint.x,
          targetPoint.y,
          entity.center,
          entity,
        );
      }

      const raycastHitB = entity.position.raycastCircle(
        entity.center.x,
        entity.center.y - facingOffset,
        targetPoint.x - spread,
        targetPoint.y + reach,
      );

      if (raycastHitB.collision) {
        entity.raycast.visualize(
          entity.center.x,
          entity.center.y - facingOffset,

          raycastHitB.position.x,
          raycastHitB.position.y,
          raycastHitB.position,
          entity,
        );
        hitList.push(raycastHitB.entity);
      } else {
        entity.raycast.visualize(
          entity.center.x,
          entity.center.y - facingOffset,

          targetPoint.x - spread,
          targetPoint.y + reach,
          entity.center,
          entity,
        );
      }

      const raycastHitC = entity.position.raycastCircle(
        entity.center.x,
        entity.center.y - facingOffset,
        targetPoint.x + spread,
        targetPoint.y + reach,
      );

      if (raycastHitC.collision) {
        entity.raycast.visualize(
          entity.center.x,
          entity.center.y - facingOffset,

          raycastHitC.position.x,
          raycastHitC.position.y,
          raycastHitC.position,
          entity,
        );
        hitList.push(raycastHitC.entity);
      } else {
        entity.raycast.visualize(
          entity.center.x,
          entity.center.y - facingOffset,

          targetPoint.x + spread,
          targetPoint.y + reach,
          entity.center,
          entity,
        );
      }
      break;

    case "RIGHT":
      targetPoint.x += range;

      // right straight
      const raycastHitD = entity.position.raycastCircle(
        entity.center.x + facingOffset,
        entity.center.y,
        targetPoint.x,
        targetPoint.y,
      );

      if (raycastHitD.collision) {
        entity.raycast.visualize(
          entity.center.x + facingOffset,
          entity.center.y,

          raycastHitD.position.x,
          raycastHitD.position.y,
          raycastHitD.position,
          entity,
        );
        hitList.push(raycastHitD.entity);
      } else {
        entity.raycast.visualize(
          entity.center.x + facingOffset,
          entity.center.y,

          targetPoint.x,
          targetPoint.y,
          entity.center,
          entity,
        );
      }
      // right up
      const raycastHitE = entity.position.raycastCircle(
        entity.center.x + facingOffset,
        entity.center.y,
        targetPoint.x - reach,
        targetPoint.y - spread,
      );

      if (raycastHitE.collision) {
        entity.raycast.visualize(
          entity.center.x + facingOffset,
          entity.center.y,

          raycastHitE.position.x,
          raycastHitE.position.y,
          raycastHitE.position,
          entity,
        );
        hitList.push(raycastHitE.entity);
      } else {
        entity.raycast.visualize(
          entity.center.x + facingOffset,
          entity.center.y,

          targetPoint.x - reach,
          targetPoint.y - spread,
          entity.center,
          entity,
        );
      }
      // right down
      const raycastHitF = entity.position.raycastCircle(
        entity.center.x + facingOffset,
        entity.center.y,
        targetPoint.x - reach,
        targetPoint.y + spread,
      );

      if (raycastHitF.collision) {
        entity.raycast.visualize(
          entity.center.x + facingOffset,
          entity.center.y,

          raycastHitF.position.x,
          raycastHitF.position.y,
          raycastHitF.position,
          entity,
        );
        hitList.push(raycastHitF.entity);
      } else {
        entity.raycast.visualize(
          entity.center.x + facingOffset,
          entity.center.y,

          targetPoint.x - reach,
          targetPoint.y + spread,
          entity.center,
          entity,
        );
      }
      break;

    case "DOWN":
      targetPoint.y += range;

      const raycastHitG = entity.position.raycastCircle(
        entity.center.x,
        entity.center.y + facingOffset,
        targetPoint.x,
        targetPoint.y,
      );

      if (raycastHitG.collision) {
        entity.raycast.visualize(
          entity.center.x,
          entity.center.y + facingOffset,

          raycastHitG.position.x,
          raycastHitG.position.y,
          raycastHitG.position,
          entity,
        );
        hitList.push(raycastHitG.entity);
      } else {
        entity.raycast.visualize(
          entity.center.x,
          entity.center.y + facingOffset,

          targetPoint.x,
          targetPoint.y,
          entity.center,
          entity,
        );
      }

      const raycastHitH = entity.position.raycastCircle(
        entity.center.x,
        entity.center.y + facingOffset,
        targetPoint.x - spread,
        targetPoint.y - reach,
      );

      if (raycastHitH.collision) {
        entity.raycast.visualize(
          entity.center.x,
          entity.center.y + facingOffset,

          raycastHitH.position.x,
          raycastHitH.position.y,
          raycastHitH.position,
          entity,
        );
        hitList.push(raycastHitH.entity);
      } else {
        entity.raycast.visualize(
          entity.center.x,
          entity.center.y + facingOffset,

          targetPoint.x - spread,
          targetPoint.y - reach,
          entity.center,
          entity,
        );
      }

      const raycastHitI = entity.position.raycastCircle(
        entity.center.x,
        entity.center.y + facingOffset,
        targetPoint.x + spread,
        targetPoint.y - reach,
      );

      if (raycastHitI.collision) {
        entity.raycast.visualize(
          entity.center.x,
          entity.center.y + facingOffset,

          raycastHitI.position.x,
          raycastHitI.position.y,
          raycastHitI.position,
          entity,
        );
        hitList.push(raycastHitI.entity);
      } else {
        entity.raycast.visualize(
          entity.center.x,
          entity.center.y + facingOffset,

          targetPoint.x + spread,
          targetPoint.y - reach,
          entity.center,
          entity,
        );
      }
      break;

    case "LEFT":
      targetPoint.x -= range;
      // left straight
      const raycastHitJ = entity.position.raycastCircle(
        entity.center.x - facingOffset,
        entity.center.y,
        targetPoint.x,
        targetPoint.y,
      );

      if (raycastHitJ.collision) {
        entity.raycast.visualize(
          entity.center.x - facingOffset,
          entity.center.y,

          raycastHitJ.position.x,
          raycastHitJ.position.y,
          raycastHitJ.position,
          entity,
        );
        hitList.push(raycastHitJ.entity);
      } else {
        entity.raycast.visualize(
          entity.center.x - facingOffset,
          entity.center.y,

          targetPoint.x,
          targetPoint.y,
          entity.center,
          entity,
        );
      }
      // left up
      const raycastHitK = entity.position.raycastCircle(
        entity.center.x - facingOffset,
        entity.center.y,
        targetPoint.x + reach,
        targetPoint.y - spread,
      );

      if (raycastHitK.collision) {
        entity.raycast.visualize(
          entity.center.x - facingOffset,
          entity.center.y,

          raycastHitK.position.x,
          raycastHitK.position.y,
          raycastHitK.position,
          entity,
        );
        hitList.push(raycastHitK.entity);
      } else {
        entity.raycast.visualize(
          entity.center.x - facingOffset,
          entity.center.y,

          targetPoint.x + spread,
          targetPoint.y - reach,
          entity.center,
          entity,
        );
      }
      // left down
      const raycastHitL = entity.position.raycastCircle(
        entity.center.x - facingOffset,
        entity.center.y,
        targetPoint.x + reach,
        targetPoint.y + spread,
      );

      if (raycastHitL.collision) {
        entity.raycast.visualize(
          entity.center.x - facingOffset,
          entity.center.y,

          raycastHitL.position.x,
          raycastHitL.position.y,
          raycastHitL.position,
          entity,
        );
        hitList.push(raycastHitL.entity);
      } else {
        entity.raycast.visualize(
          entity.center.x - facingOffset,
          entity.center.y,

          targetPoint.x + reach,
          targetPoint.y + spread,
          entity.center,
          entity,
        );
      }
      break;
  }

  for (let i = hitList.length - 1; i >= 0; i--) {
    const targets = hitList[i];
    // we can use this loop to trigger some sounds and animations or indicate a strike somehow.
    // then before the return we emit an event with the hitlist and involved objects,
    // the caster and the hit entity
    // handle this in an event by the collidee
  }
  return hitList;
}
