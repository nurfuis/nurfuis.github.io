export const gridSize = 32;

export const gridCells = n => {
  return n * gridSize;	
}

export const obstacles = [];

export const isSpaceFree = (posX, posY, collider) => {
  for (let i = 0; i < obstacles.length; i++) {
    const collidee = obstacles[i];

    // Calculate bounding areas for both collider and collidee
    const colliderX1 = posX;
    const colliderX2 = colliderX1 + collider.width;
    const colliderY1 = posY;
    const colliderY2 = colliderY1 + collider.height;

    const collideeX1 = collidee.position.x;
    const collideeX2 = collideeX1 + collidee.width;
    const collideeY1 = collidee.position.y;
    const collideeY2 = collideeY1 + collidee.height;

    if (collidee == collider) {
      return { collisionDetected: false };
    }

    
    if (    
      colliderX1 >= collideeX1 && 
      colliderX1 < collideeX2 && 
      colliderY1 >= collideeY1 &&
      colliderY1 < collideeY2 
      ) {
      return { collisionDetected: true, collider: collider, collidee: collidee };
    }
    if (    
      collideeX1 >= colliderX1 && 
      collideeX1 < colliderX2 &&
      collideeY1 >= colliderY1 &&
      collideeY1 < colliderY2
      ) {
      return { collisionDetected: true, collider: collider, collidee: collidee };
    }    
    
    
  }

  return { collisionDetected: false };
};