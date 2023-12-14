export const gridSize = 16;

export const gridCells = n => {
  return n * gridSize;	
}

export const isSpaceFree = (walls, x, y) => {

  const str = `${x},${y}`;
  const isWallPresent = walls.has(str);

  return !isWallPresent;
}