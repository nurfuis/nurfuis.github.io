export const gridSize = 32;

export const gridCells = n => {
  return n * gridSize;	
}

export const obstacles = [];

export const isSpaceFree = (posX, posY, collider) => {
  const startTime = Date.now();
  
  for (let i = 0; i < obstacles.length; i++) {
    const collidee = obstacles[i];
    
    const x1 = collidee.position.x;
    const x2 = x1 + collidee.width;
    
    const y1 = collidee.position.y;
    const y2 = y1 + collidee.height;

    if (    
      posX >= x1 && 
      posX < x2 &&
      posY >= y1 &&
      posY < y2 &&
      collidee != collider
      ) {               
      return { collisionDetected: true,
               collider: collider,      
               collidee: collidee
      };
    };
  }
  
  const endTime = Date.now();
  const executionTime = endTime - startTime;
  // console.log(`Execution time of isSpaceFree: ${executionTime.toFixed(3)} milliseconds`); 
  
  return { collisionDetected: false };   
}