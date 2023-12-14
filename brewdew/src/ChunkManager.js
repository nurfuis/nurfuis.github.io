import { GameObject } from "./GameObject.js";
import { events } from "./Events.js";
import { Vector2 } from "./Vector2.js";
import { Chunk } from "./Chunk.js";

// Loaded area is 768px by 768px consisting of nine 256px by 256px chunks each consisting 256 tiles each 16px square in size.  Loaded chunks center on player and loads relative chunks -1, -1 through 1,1 (this number could be used like a view distance and set in a config file) arround the player. When the player transitions from the center chunk to a neighboring chunk, the ChunkManager loads the new chunks surrounding the target chunk and unloads the three chunks that will no longer be within the 768px square loaded area that centers on the players active chunk. 
// When the player enters a new chunk create an array of the chunks starting -1,-1 from players current chunk through chunk 1,1 from players chunk. Use that array to load any chunk that lies within the visible area that is not already loaded. Then with the array check which chunks should be unloaded and unload them.
export class ChunkManager extends GameObject {
  constructor(world) {
    super({});
    this.world = world;
    this.viewDistance = 1; // View distance in chunks
    this.chunkSize = 256; // Size of a chunk in pixels
    this.loadedChunks = {}; // Map of chunk coordinates to chunk objects
    this.playerChunkX = null; // Current player chunk X coordinate 
    this.playerChunkY = null; // Current player chunk Y coordinate
    this.tileTypes = [54, 70, 86]; // The pool of tile Ids to use in random chunk generation
    
    // Update when player moves
    events.on("PLAYER_POSITION", this, (playerPosition) => {
      this.updateVisibleArea(playerPosition);
    });
  }
  
  // Methods
  doesChunkExist(chunkX, chunkY) {
    for (let i = 0; i < this.world.maps.length; i++) {
      const fileName = this.world.maps[i].fileName;
      const parts = fileName.split('_'); // Split filename at _ symbol
      const x = parseInt(parts[0]); // Convert first part to integer (x)
      const y = parseInt(parts[1].split('.')[0]); // Convert second part to integer (y) after removing extension

      if (x === chunkX && y === chunkY) {
        return true; // Matching chunk found, return true immediately
      }
    }

    // No matching chunk found after iterating through all filenames
    return false;
  }

  checkFileExists(path) {
    return new Promise((resolve, reject) => {
      fetch(path, {
        method: 'HEAD', // Send HEAD request to check existence without downloading
        cache: 'no-cache', // Avoid caching HEAD request
      })
        .then(response => resolve(response.ok)) // File exists if response is OK (200)
        .catch(error => resolve(false)); // File doesn't exist or server error
    });
  }  

  generateChunkData() {
    // Allocate separate arrays for tiles, entities, and walls
    const tiles = [];
    const entities = new Array(this.chunkSize).fill(0);
    const walls = new Array(this.chunkSize).fill(0);

    // Implement logic to generate data for each element
    // 1. Tiles:
    for (let y = 0; y < this.chunkSize; y++) {
      for (let x = 0; x < this.chunkSize; x++) {
        // Replace with your logic to generate tile data based on position
        // For example, use a noise function or random values
        const tileId = Math.floor(Math.random() * this.tileTypes.length);
        tiles.push(this.tileTypes[tileId]);
      }
    }

    // 2. Entities: (modify if items are present)
    // No items are added by default
    // You can add logic to place items at specific locations


    // 3. Overlay: (modify if overlay present)

    
    // 4. Walls: (modify if walls are present)
    // For now, walls are filled with 0 (no wall)
    // You can modify this to generate walls based on specific rules

    return {
      layers: [
        { data: tiles },
        { data: entities },
        { data: walls },
      ],
    };
  } 
 
  loadChunk(chunkX, chunkY) {
    // check if chunk is in world 
    const chunkExists = this.doesChunkExist(chunkX, chunkY);
    
    if (chunkExists) {
      const chunkPath = `./src/levels/1/${chunkX}_${chunkY}.tmj`;
      this.checkFileExists(chunkPath)
        .then(exists => {
          if (exists) {
            // File exists, go ahead with fetch
            fetch(chunkPath)
              .then((response) => {
                return response.json();
              })
              .then((json) => {
                const chunkData = json;
                this.addChunk(chunkX, chunkY, chunkData);
              });
          } else {
            // File doesn't exist, handle missing file scenario
            console.warn(`Chunk not found: ${chunkPath}`);
          }
        });    
    } else {        
      const chunkData = this.generateChunkData();
      this.addChunk(chunkX, chunkY, chunkData);
    }
  }
  
  addChunk(chunkX, chunkY, chunkData) {      
    const chunkId = `${chunkX},${chunkY}`;    
    const chunk = new Chunk(chunkX, chunkY, chunkData);
    this.addChild(chunk);
    this.loadedChunks[chunkId] = chunk;
  }

  unloadChunk(chunkX, chunkY) {
    const chunkId = `${chunkX},${chunkY}`;
    const chunk = this.loadedChunks[chunkId];

    if (chunk) {
      this.removeChild(chunk);
      delete this.loadedChunks[chunkId];
    }
  }
  
  isSpaceFreeInChunk(nextChunk, nextX, nextY) {
    const chunkId = `${nextChunk.chunkX},${nextChunk.chunkY}`;
    const chunk = this.loadedChunks[chunkId];
    
    for (let i = 0; i < chunk.walls.length; i++) {
      if (chunk.walls[i] === `${nextX},${nextY}`) {
        // console.log('barrier detected');
        return false;
      }
    }
    return true;  
  }
  
  determineChunk(x, y) {
    const posX = Math.floor(x);
    const posY = Math.floor(y);

    const chunkX = Math.floor(posX / this.chunkSize);
    const chunkY = Math.floor(posY / this.chunkSize);
    return { chunkX, chunkY };   
  }

  updateVisibleArea(playerPosition) {
    // Determine the new player chunk using the dedicated method
    const {chunkX, chunkY } = this.determineChunk(playerPosition.x, playerPosition.y);
    const newPlayerChunkX = chunkX;
    const newPlayerChunkY = chunkY;
       
    // Check if the player has moved to a new chunk
    if (newPlayerChunkX !== this.playerChunkX || newPlayerChunkY !== this.playerChunkY) {
      this.playerChunkX = newPlayerChunkX;
      this.playerChunkY = newPlayerChunkY;
      // Create an array of chunks surrounding the player's new chunk
      const surroundingChunks = [];
      for (let xOffset = -this.viewDistance; xOffset <= this.viewDistance; xOffset++) {
        for (let yOffset = -this.viewDistance; yOffset <= this.viewDistance; yOffset++) {
          const surroundingChunkX = this.playerChunkX + xOffset;
          const surroundingChunkY = this.playerChunkY + yOffset;

          surroundingChunks.push({
            x: surroundingChunkX,
            y: surroundingChunkY
          });
        }
      }
      // Load new chunks within the visible area
      for (const chunk of surroundingChunks) {
        const chunkX = chunk.x;
        const chunkY = chunk.y;

        if (!this.loadedChunks[`${chunkX},${chunkY}`]) {
          this.loadChunk(chunkX, chunkY);        
        }
      }
      // Unload chunks outside the visible area
      for (const chunkId in this.loadedChunks) {
        const chunk = this.loadedChunks[chunkId];
        const chunkX = chunk.x;
        const chunkY = chunk.y;

        // Check if the chunk is outside the visible area
        if (
          chunkX < this.playerChunkX - this.viewDistance ||
          chunkX > this.playerChunkX + this.viewDistance ||
          chunkY < this.playerChunkY - this.viewDistance ||
          chunkY > this.playerChunkY + this.viewDistance
        ) {
          this.unloadChunk(chunkX, chunkY);
        }
      }           
    }
    // const numberOfChunks = Object.keys(this.loadedChunks).length;
    // console.log("Number of chunks loaded:", numberOfChunks);     
    // console.log(' chunk:' + this.playerChunkX + ',' + this.playerChunkY);   
  }
}


