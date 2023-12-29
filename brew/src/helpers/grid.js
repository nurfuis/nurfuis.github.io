import { events } from "../Events.js";
import { colliders } from "../../main.js";

export const gridSize = 16;

export const gridCells = n => {
  return n * gridSize;	
}
export const isSpaceFree = (x, y, world, entity) => {
  for (let i = 0; i < colliders.colliders.length; i++) {
    if (colliders.colliders[i].colliderId === `${x},${y},${world}`) {
      // console.log('barrier detected');
      events.emit("COLLISION_DETECTED", {collisionDetected: true,
                                         location: colliders.colliders[i].colliderId, 
                                         owner: colliders.colliders[i].owner,
                                         entity: entity,
      });
      return {collisionDetected: true,
              location: colliders.colliders[i].colliderId, 
              owner: colliders.colliders[i].owner,
              entity: entity,
      };
    }
  }
  return { collisionDetected: false };  
}
