export const gridSize = 16;

export const gridCells = n => {
  return n * gridSize;	
}

export const obstacles = [];

export const isSpaceFree = (posX, posY, world, entity) => {
  for (let i = 0; i < obstacles.length; i++) {
    if (obstacles[i].id === `${posX},${posY},${world}`) {
      return { collisionDetected: true,
               position:`${posX},${posY},${world}`,
               owner: obstacles[i].owner,
               entity: entity
      };
    }
  }
  return { collisionDetected: false };  
}
