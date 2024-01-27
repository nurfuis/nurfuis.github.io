export const gridSize = 32;

export const gridCells = n => {
  return n * gridSize;	
}

export const obstacles = [];

export const isSpaceFree = (posX, posY, entity) => {
  for (let i = 0; i < obstacles.length; i++) {
    const obstacle = obstacles[i]
    
    const x1 = obstacle.position.x;
    const x2 = x1 + obstacle.width;
    
    const y1 = obstacle.position.y;
    const y2 = y1 + obstacle.height;
    // console.log('posY',posY,'y1', y1,'y2', y2)
    if (
      posX >= x1 && 
      posX < x2 &&
      posY >= y1 &&
      posY < y2 
      ) {
      return { collisionDetected: true,
               collider: entity,      
               collidee: obstacle
      };
    };
  }
  return { collisionDetected: false };  
}

