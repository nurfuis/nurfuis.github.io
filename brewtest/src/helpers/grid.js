import { events } from "../Events.js";

export const gridSize = 16;

export const gridCells = n => {
  return n * gridSize;	
}
export const isSpaceFree = (colliders, x, y, entityId) => {
  for (let i = 0; i < colliders.length; i++) {
    if (colliders[i].location === `${x},${y}`) {
      // console.log('barrier detected');
      events.emit("COLLISION_DETECTED", {collisionDetected: true,
                                                  location: colliders[i].location, 
                                                   ownerId: colliders[i].ownerId,
                                                  entityId: entityId,
      });
      return {collisionDetected: true,
                       location: colliders[i].location, 
                        ownerId: colliders[i].ownerId,
                       entityId: entityId,
      };
    }
  }
  return { collisionDetected: false };  
}
