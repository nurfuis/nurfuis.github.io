// Import essential libraries
import { events } from "../../Events.js";
import { GameObject } from "../../GameObject.js";
import { Vector2 } from "../.././Vector2.js";

// Import helper functions
import { generateChunkData } from "../../helpers/generateChunkData.js";
import { checkFileExists } from "../../helpers/checkFileExists.js";
import { loadWorldMap } from "../../helpers/loadWorldMap.js";

// Define constant values for chunk size and view distance
const CHUNK_SIZE = 256;
const VIEW_DISTANCE_X = 1;
const VIEW_DISTANCE_Y = 1;

// Class representing the Chunk Manager
export class Chunks extends GameObject {
  constructor(player, worlds, tiles, colliders, entities, foreground) {
    super({});
    // imports
    this.player = player;
    this.worlds = worlds;
    this.tiles = tiles;
    this.colliders = colliders;
    this.entities = entities;
    this.foreground = foreground;
    
    // properties
    this.worldMaps = {}; // Store loaded world.world maps
    this.loadedChunks = {}; // Map of chunk coordinates to chunk objects
    this.recentlyLoadedChunks = {}; 
    this.spawnZoneSize = 8;  // 
    this.spawnZoneReady = false; //    
    this.currentChunkX = null; // Current chunk X coordinate
    this.currentChunkY = null; // Current chunk Y coordinate
    
    // events
    events.on("RESOURCES_LOADED", this, () => {
      this.loadWorld = loadWorldMap(worlds);
      console.log('resources loaded');
      });     
    events.on("WORLD_LOADED", this, (world) => {
      const worldName = world.world;
      const worldMap = world.map;
      this.worldMaps[worldName] = worldMap; // Store world by name
      console.log(worldName, 'is loaded');
      if (this.player.currentWorld === worldName) {
        console.log('loading chunks for',worldName);
        this.updateVisibleArea(this.player.position.x, this.player.position.y, worldName);
      }
    });
    events.on("CHUNK_NOT_FOUND", this, (chunk) => {
      generateChunkData(chunk.x, chunk.y, this.player.currentWorld); 
    });
    events.on("CHUNK_READY", this, (chunk) => {
      this.loadChunk(chunk.x, chunk.y, chunk.world, chunk.data);
    }); 
    events.on("REMOVE_CHUNK", this, (chunk) => {
      this.unloadChunk(chunk.x, chunk.y, chunk.world, chunk.owner);
    });        
    events.on("SPAWN_ZONE_READY", this, (world) => {
      console.log('spawning player in', world);
      if (!this.player.isSpawned) {
        this.foreground.addChild(player);
      }
    });    
    events.on("PLAYER_POSITION", this, (position) => {
      this.updateVisibleArea(position.x, position.y, position.world); // Update visible chunks based on player movement
    });
  }
  ready() {
    // ...
  }
  step(delta, root) {
    
  };
  fetchChunk(chunkX, chunkY, world) { // emits the event CHUNK_READY or CHUNK_NOT_FOUND
    // Check for listing in world map   
    let mapsCount = this.worldMaps[world].maps.length;
    
    for (let i = 0; i <mapsCount; i++) {
      const worldMaps = this.worldMaps[world].maps;
      
      const fileName = worldMaps[i].fileName;
      const parts = fileName.split('_'); // Split filename at _ symbol
      const x = parseInt(parts[0]); // Convert first part to integer (x)
      const y = parseInt(parts[1].split('.')[0]); // Convert second part to integer (y) after removing extension
      // Chunk is listed in world...
      if (x === chunkX && y === chunkY) {
        // Get the chunk file path
        const chunkPath = `./src/levels/${world}/${chunkX}_${chunkY}.tmj`;
        // console.log(chunkPath);
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
                    world: world,
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
  loadChunk(chunkX, chunkY, world, chunkData) {  // for the event CHUNK_READY   
    const chunkId = `${chunkX},${chunkY},${world}`;    
    this.loadedChunks[chunkId] = {x: chunkX, y: chunkY, world: world, data: chunkData};
    this.colliders.loadChunkColliders(chunkX, chunkY, world, chunkData);
    this.tiles.loadTiles(chunkX, chunkY, world, chunkData);
    this.entities.loadEntities(chunkX, chunkY, world, chunkData);
    
    this.isSpawnReady(world);
  }
  isSpawnReady(world) {
    if (!this.spawnZoneReady) {
      const numLoadedChunks = Object.keys(this.loadedChunks).length; // Count the keys

      if (numLoadedChunks >= this.spawnZoneSize) {
        this.spawnZoneReady = true;
        // Spawn is Ready
        console.log(world,'spawn zone ready ');
        events.emit("SPAWN_ZONE_READY", world);
      } 
    }    
  }
  unloadChunk(chunkX, chunkY, world) { // runs during update to visible area
    const chunkId = `${chunkX},${chunkY},${world}`;
    const chunk = this.loadedChunks[chunkId];

    if (chunk) {
      // console.log('... unloading chunk', chunkX,chunkY,world);
      delete this.loadedChunks[chunkId];+
      this.colliders.removeChunkColliders(chunk.x, chunk.y, chunk.world, chunk.owner);
      this.tiles.removeTiles(chunk.x, chunk.y, chunk.world);
      this.entities.removeEntities(chunk.x, chunk.y, chunk.world);      
    }
  }  
  worldToChunkCoords(x, y) { // returns a given coordinate pair's corresponding chunk
    const posX = Math.floor(x);
    const posY = Math.floor(y);

    const chunkX = Math.floor(posX / CHUNK_SIZE);
    const chunkY = Math.floor(posY / CHUNK_SIZE);
    return { chunkX, chunkY };   
  }
  updateVisibleArea(x, y, world) { // triggers when player position is updated
    const posX = x;
    const posY = y;
    const posWorld = world;
        
    // Determine the new player chunk 
    const {chunkX, chunkY } = this.worldToChunkCoords(posX, posY);
    const newPlayerChunkX = chunkX;
    const newPlayerChunkY = chunkY;
              
    // Check if the player has moved to a new chunk
    this.currentChunkX = newPlayerChunkX; // store player position, initially set to null
    this.currentChunkY = newPlayerChunkY;
    // Create an array of chunksIds centered on the player's new chunk
    const surroundingChunks = [];
    for (let xOffset = -VIEW_DISTANCE_X; xOffset <= VIEW_DISTANCE_X; xOffset++) {
      for (let yOffset = -VIEW_DISTANCE_Y; yOffset <= VIEW_DISTANCE_Y; yOffset++) {
        const surroundingChunkX = this.currentChunkX + xOffset;
        const surroundingChunkY = this.currentChunkY + yOffset;

        surroundingChunks.push({
          x: surroundingChunkX,
          y: surroundingChunkY,
          world: posWorld
        });
      }
    }
    // Load new chunks within the visible area
    
    for (const chunk of surroundingChunks) {
      const chunkX = chunk.x;
      const chunkY = chunk.y;
      const chunkId = `${chunkX},${chunkY},${chunk.world}`;    

      if (!this.loadedChunks[chunkId] && !this.recentlyLoadedChunks[chunkId]) {
        this.fetchChunk(chunkX, chunkY, world);
        this.recentlyLoadedChunks[chunkId] = 1000 * VIEW_DISTANCE_X;
        // console.log(' fetching chunk ', chunkX, chunkY, world,' ...');
      } 
    }
    for (const chunkId in this.recentlyLoadedChunks) {
      this.recentlyLoadedChunks[chunkId]--; // Decrement counter
      if (this.recentlyLoadedChunks[chunkId] <= 0) {
        delete this.recentlyLoadedChunks[chunkId];
      }
    }  
    // Unload chunks outside the visible area
    for (const chunkId in this.loadedChunks) {
      if (this.recentlyLoadedChunks[chunkId]) {
        // console.log('tried to remove recently loaded chunk',chunkId);
        return;
      }  
      const chunk = this.loadedChunks[chunkId];
      const chunkX = chunk.x;
      const chunkY = chunk.y;
      const world = chunk.world;
      const owner = `${chunkX},${chunkY},${world}`;    
      
      // Check if the chunk is outside the visible area
      if (
        chunkX < this.currentChunkX - VIEW_DISTANCE_X ||
        chunkX > this.currentChunkX + VIEW_DISTANCE_X ||
        chunkY < this.currentChunkY - VIEW_DISTANCE_Y ||
        chunkY > this.currentChunkY + VIEW_DISTANCE_Y ||
        world != this.player.currentWorld
      ) {
        events.emit("REMOVE_CHUNK", {
          x: chunkX, 
          y: chunkY,
          world: world,
          owner: owner
        });
      }
    }           
  }
}


