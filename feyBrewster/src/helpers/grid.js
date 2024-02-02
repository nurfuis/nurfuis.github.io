export const gridSize = 32;

export const gridCells = n => {
  return n * gridSize;	
}

export const obstacles = [];

export const isSpaceFree = (posX, posY, collider) => {
  for (let i = 0; i < obstacles.length; i++) {
    const collidee = obstacles[i];

    // Calculate AABB corners for collider and collidee:
    const colliderLeft = posX;
    const colliderRight = colliderLeft + collider.width;
    const colliderTop = posY;
    const colliderBottom = colliderTop + collider.height;

    const collideeLeft = collidee.position.x;
    const collideeRight = collideeLeft + collidee.width;
    const collideeTop = collidee.position.y;
    const collideeBottom = collideeTop + collidee.height;

    // AABB collision check:
    if (
      colliderRight > collideeLeft &&
      colliderLeft < collideeRight &&
      colliderBottom > collideeTop &&
      colliderTop < collideeBottom
    ) {
      return { collisionDetected: true, collider: collider, collidee: collidee };
    }
  }

  return { collisionDetected: false };
};