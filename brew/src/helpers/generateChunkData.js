import { events } from "../Events.js";


export function generateChunkData(chunkX, chunkY, world) { // runs on CHUNK_NOT_FOUND with loadChunk and random generated data
  // Allocate separate arrays for tiles, entities, and walls
  const chunkSize = 256; // Size of a chunk in pixels
  const tileTypes = [54, 70, 86]; // The pool of tile Ids to use in random chunk generation   
  const tiles = [];
  const entities = new Array(chunkSize).fill(0);
  const collisions = new Array(chunkSize).fill(0);

  // Implement logic to generate data for each element
  // 1. Tiles:
  for (let y = 0; y < chunkSize; y++) {
    for (let x = 0; x < chunkSize; x++) {
      // Replace with your logic to generate tile data based on position
      // For example, use a noise function or random values
      const tileId = Math.floor(Math.random() * tileTypes.length);
      tiles.push(tileTypes[tileId]);
    }
  }

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
    events.emit("CHUNK_READY", {
      x: chunkX, 
      y: chunkY,
      world: world,
      data: chunkData,
    }); 
  }    
}