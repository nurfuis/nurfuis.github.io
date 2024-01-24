export function iterateChunkTiles(chunkX, chunkY, chunkData, callback) {
  const tileWidth = chunkData.tilewidth;
  const tileHeight = chunkData.tileheight;
  const chunkWidth = chunkData.width * tileWidth;
  const chunkHeight = chunkData.height * tileHeight;

  const tileSets = chunkData.tilesets;

  const startX = Math.floor((chunkX * chunkHeight) / tileWidth);
  const endX = Math.ceil((chunkX * chunkWidth + chunkWidth) / tileWidth);
  const startY = Math.floor((chunkY * chunkHeight) / tileHeight);
  const endY = Math.ceil((chunkY * chunkHeight + chunkHeight) / tileHeight);
  let entry = 0;
  for (let y = startY; y < endY; y++) {
    for (let x = startX; x < endX; x++) {
      const posX = x * tileWidth;
      const posY = y * tileHeight;

      callback(entry, posX, posY, tileSets);

      entry++;
    }
  }
}