import { events } from "../Events.js";


export async function generateChunkData(chunkX, chunkY, world, behavior) { // runs on CHUNK_NOT_FOUND with loadChunk and random generated data
  // Allocate separate arrays for tiles, entities, and walls
  const chunkSize = 256; // Size of a chunk in pixels
  const tileTypes = [0]; // The pool of tile Ids to use in random chunk generation   
  const entities = new Array(chunkSize).fill(0);
  const collisions = new Array(chunkSize).fill(0);

  // Implement logic to generate data for each element
  // 1. Tiles:
  const tiles = new Array(chunkSize).fill(0); // Pre-fill with 0

  await new Promise((resolve) => {
    setTimeout(() => {
      for (let i = 0; i < tiles.length; i++) {
        tiles[i] = Math.floor(Math.random() * tileTypes.length); // Set random tileId
      }
      resolve();
    }, 50);
  });

  // 2. Entities: (modify if items are present)
  // No items are added by default
  // You can add logic to place items at specific locations


  // 3. Overlay: (modify if overlay present)

  
  // 4. Walls: (modify if walls are present)
  // For now, walls are filled with 0 (no wall)
  // You can modify this to generate walls based on specific rules

  const chunkData = {
    layers: [
      { data: tiles },
      { data: entities },
      { data: collisions },
    ],
    height: 16,
    width: 16,
    tilewidth: 16,
    tileheight: 16,
    tilesets: [
          {
           firstgid:1,
           source: "terrain.tsx",
          },
    ],
  };
  if (tiles.length = 256) {
    events.emit("CHUNK_FOUND", {
      x: chunkX, 
      y: chunkY,
      world: world,
      data: chunkData,
    }); 
  }    
}