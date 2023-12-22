// Import essential libraries
import { events } from "../../Events.js";
import { GameObject } from "../../GameObject.js";
import { Vector2 } from "../.././Vector2.js";

// Import other required objects from main.js
import { colliders } from "../../../main.js";
import { tiles } from "../../../main.js";
import { entities } from "../../../main.js";

// Import helper functions
import { generateChunkData } from "../../helpers/generateChunkData.js";
import { checkFileExists } from "../../helpers/checkFileExists.js";
import { loadWorldMap } from "../../helpers/loadWorldMap.js";

// Define constant values for chunk size and view distance
const CHUNK_SIZE = 256;
const VIEW_DISTANCE = 1;

// Class representing the Chunk Manager
export class Chunks extends GameObject {
  constructor() {
    super({});

    // Load world map asynchronously
    this.loadWorld = loadWorldMap();

    // Initial state variables
    this.worldIsLoaded = false;
    this.spawnChunksLoaded = 0;
    this.spawnZone = false;
    this.world = null;
    this.playerChunkX = null; // Current player chunk X coordinate
    this.playerChunkY = null; // Current player chunk Y coordinate
    this.loadedChunks = {}; // Map of chunk coordinates to chunk objects
    this.recentlyLoadedChunks = {}; // **To be implemented:** Map of recently loaded chunks

    // Set up event listeners
    events.on("WORLD_LOADED", this, (worldMap) => {
      this.world = worldMap;
      this.worldIsLoaded = true;
      this.updateVisibleArea(this.position); // Initial chunk loading 
    });
    events.on("CHUNK_READY", this, (chunk) => {
      this.loadChunk(chunk.x, chunk.y, chunk.data);
      colliders.loadColliders(chunk.x, chunk.y, chunk.data);
      tiles.loadTiles(chunk.x, chunk.y, chunk.data);
      entities.loadEntities(chunk.x, chunk.y, chunk.data);
    });
    events.on("CHUNK_NOT_FOUND", this, (chunk) => {
      generateChunkData(chunk.x, chunk.y); // Handle missing chunk data generation
    });
    events.on("PLAYER_POSITION", this, (playerPosition) => {
      this.updateVisibleArea(playerPosition); // Update visible chunks based on player movement
    });
  }
  ready() {
    // ...
  }
  
  fetchChunk(chunkX, chunkY) { // emits the event CHUNK_READY or CHUNK_NOT_FOUND
    // Check for listing in world map
    for (let i = 0; i < this.world.maps.length; i++) {
      const fileName = this.world.maps[i].fileName;
      const parts = fileName.split('_'); // Split filename at _ symbol
      const x = parseInt(parts[0]); // Convert first part to integer (x)
      const y = parseInt(parts[1].split('.')[0]); // Convert second part to integer (y) after removing extension
      // Chunk is listed in world...
      if (x === chunkX && y === chunkY) {
        // Get the chunk file path
        const chunkPath = `./src/levels/1/${chunkX}_${chunkY}.tmj`;
        checkFileExists(chunkPath)
          .then(exists => {
            if (exists) {
              // File exists, go ahead with fetch
              fetch(chunkPath)
                .then((response) => {
                  return response.json();
                })
                .then((json) => {
                  const chunkData = json;
                  // return the chunk
                  events.emit("CHUNK_READY", {
                    x: chunkX, 
                    y: chunkY,
                    data: chunkData,
                  });
                });
            } else {
              // File doesn't exist, handle missing file scenario
              console.warn(`Chunk not found: ${chunkPath}`);
            }
          });             
         // Matching chunk was found in world
         return;         
      }
    }    
    // No matching chunk found after iterating through all filenames
    events.emit("CHUNK_NOT_FOUND", {
      x: chunkX, 
      y: chunkY,      
    });
  }
  
  loadChunk(chunkX, chunkY, chunkData) {  // for the event CHUNK_READY      
    const chunkId = `${chunkX},${chunkY}`;    
    this.loadedChunks[chunkId] = chunkData; 
    // Check 
    if (!this.spawnZone) {
      if (this.spawnChunksLoaded < 8) {
      this.spawnChunksLoaded++;
    } else if (this.spawnChunksLoaded >= 8) {
      this.spawnZone = true;
      // Spawn is Ready
      console.log(' spawn zone ready ');
      
      events.emit("SPAWN_ZONE_READY", this.position);
    }
    }
  }
  
  unloadChunk(chunkX, chunkY) { // runs during update to visible area
    const chunkId = `${chunkX},${chunkY}`;
    const chunk = this.loadedChunks[chunkId];

    if (chunk) {
      // this.removeChild(chunk);
      delete this.loadedChunks[chunkId];
    }
  }  
  
  worldToChunkCoords(x, y) { // returns a given coordinate pair's corresponding chunk
    const posX = Math.floor(x);
    const posY = Math.floor(y);

    const chunkX = Math.floor(posX / CHUNK_SIZE);
    const chunkY = Math.floor(posY / CHUNK_SIZE);
    return { chunkX, chunkY };   
  }
  
  updateVisibleArea(playerPosition) { // triggers when player position is updated
    if (!this.worldIsLoaded) {
      console.warn(' world is still loading... ');
      return;
    }
    // Determine the new player chunk 
    const {chunkX, chunkY } = this.worldToChunkCoords(playerPosition.x, playerPosition.y);
    const newPlayerChunkX = chunkX;
    const newPlayerChunkY = chunkY;
       
    // Check if the player has moved to a new chunk
    if (newPlayerChunkX !== this.playerChunkX || newPlayerChunkY !== this.playerChunkY) {
      this.playerChunkX = newPlayerChunkX; // store player position, initially set to null
      this.playerChunkY = newPlayerChunkY;
      // Create an array of chunksIds centered on the player's new chunk
      const surroundingChunks = [];
      for (let xOffset = -VIEW_DISTANCE; xOffset <= VIEW_DISTANCE; xOffset++) {
        for (let yOffset = -VIEW_DISTANCE; yOffset <= VIEW_DISTANCE; yOffset++) {
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
        const chunkId = `${chunkX},${chunkY}`;    

        if (!this.loadedChunks[chunkId]) {
          // Run method
          this.fetchChunk(chunkX, chunkY); 
          console.log(' fetching chunk ' + chunkX + ',' + chunkY + ' ... ');
          // this.recentlyLoadedChunks[chunkId] = true // TODO impliment this          
          // console.log(this.recentlyLoadedChunks);          
        }
      }
        
      // Unload chunks outside the visible area
      for (const chunkId in this.loadedChunks) {
        const chunk = this.loadedChunks[chunkId];
        const chunkX = chunk.x;
        const chunkY = chunk.y;

        // Check if the chunk is outside the visible area
        if (
          chunkX < this.playerChunkX - VIEW_DISTANCE ||
          chunkX > this.playerChunkX + VIEW_DISTANCE ||
          chunkY < this.playerChunkY - VIEW_DISTANCE ||
          chunkY > this.playerChunkY + VIEW_DISTANCE
        ) {
          this.unloadChunk(chunkX, chunkY);
        }
      }           
    }   
    // console.log(' chunk:' + this.playerChunkX + ',' + this.playerChunkY);   
  }
}


