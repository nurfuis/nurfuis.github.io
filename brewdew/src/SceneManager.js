import { events } from "./Events.js";
import { Vector2 } from "./Vector2.js";
import { Commands } from "./Commands.js"; 

import { generateChunkData } from "./helpers/generateChunkData.js";
import { checkFileExists } from "./helpers/checkFileExists.js";
import { loadWorldMap } from "./helpers/loadWorldMap.js";

import { Player } from "./objects/Player/Player.js"; 
import { Chunk } from "./objects/Chunk/Chunk.js";
import { Terrain } from "./objects/Terrain/Terrain.js";
import { Entities } from "./objects/Entities/Entities.js";
import { Foreground } from "./objects/Foreground.js";
import { Collision } from "./objects/Collision/Collision.js";


const CHUNK_SIZE = 256;
const VIEW_DISTANCE_X = 2;
const VIEW_DISTANCE_Y = 1;

export class SceneManager {
  constructor(mainScene, worlds) {
    this.mainScene = mainScene;
    this.worlds = worlds;
    this.worldMaps = {};
    this.currentWorld = 'brewhouse';
    this.missingChunkBehavior = 'default';
    this.spawnPoint = new Vector2(96, 96);

    this.defaultChunks = {};
    this.chunks = {};
    this.loadedChunks = {};
    this.recentlyLoadedChunks = {}; 
    
    this.spawnZoneSize = 1;    
    this.spawnZoneReady = false;    
    this.currentChunkX = null;
    this.currentChunkY = null; 

    this.collision = new Collision({ position: new Vector2(0, 0) });
    this.mainScene.addChild(this.collision);     

    this.terrain = new Terrain({ position: new Vector2(0, 0) });
    this.mainScene.addChild(this.terrain);
    
    this.entities = new Entities({ position: new Vector2(0, 0) });
    this.mainScene.addChild(this.entities);
    
    this.foreground = new Foreground({ position: new Vector2(0, 0) });
    this.mainScene.addChild(this.foreground);
    
    this.player = new Player(this.spawnPoint.x, this.spawnPoint.y, this.currentWorld);

    events.on("RESOURCES_LOADED", this, () => {
      const loadWorlds = loadWorldMap(worlds);
      console.log('resources loaded');
      });     
    events.on("WORLD_LOADED", this, (world) => {
      const worldName = world.name;
      const worldMap = world.map;
      this.worldMaps[worldName] = worldMap;
      console.log(worldName, 'is loaded');
      if (this.currentWorld === worldName) {
        console.log('loading chunks for',worldName);
        this.updateVisibleArea(this.spawnPoint.x, this.spawnPoint.y, worldName);
      }
    });
    events.on("CHUNK_NOT_FOUND", this, (chunk) => {
      if (this.missingChunkBehavior){
        generateChunkData(chunk.x, chunk.y, this.currentWorld, this.missingChunkBehavior);
      }        
    });
    events.on("CHUNK_FOUND", this, (chunk) => {
      this.addChunk(chunk.x, chunk.y, chunk.world, chunk.data);
    });   
    events.on("REMOVE_CHUNK", this, (chunk) => {
      this.removeChunk(chunk.x, chunk.y, chunk.world, chunk.owner);
    });
    events.on("SPAWN_ZONE_READY", this, (world) => {
      console.log('spawning player in', world);      
      if (!this.player.isSpawned) {
        this.foreground.addChild(this.player);
      }
      console.log('mainScene',this.mainScene);
    });
    events.on("CAMERA_POSITION", this, (position) => {
      this.updateVisibleArea(position.x, position.y, this.currentWorld);
    });    
    events.on("PLAYER_POSITION", this, (position) => {
      this.updateVisibleArea(position.x, position.y, position.world);
    });
  }   
  updateVisibleArea(x, y, world) {
    const {chunkX, chunkY } = this.worldToChunkCoords(x, y);
    const newChunkX = chunkX;
    const newChunkY = chunkY;
              
    if (this.currentChunkX != newChunkX || this.currentChunkY != newChunkY || this.currentWorld != world) {
      this.currentChunkX = newChunkX;
      this.currentChunkY = newChunkY;
      this.currentWorld = world;
      
      this.calculateSurroundingChunks();
    }
  }    
  calculateSurroundingChunks() {
    const surroundingChunks = [];
    for (let xOffset = -VIEW_DISTANCE_X; xOffset <= VIEW_DISTANCE_X; xOffset++) {
      for (let yOffset = -VIEW_DISTANCE_Y; yOffset <= VIEW_DISTANCE_Y; yOffset++) {
        const surroundingChunkX = this.currentChunkX + xOffset;
        const surroundingChunkY = this.currentChunkY + yOffset;
        const world = this.currentWorld;
        surroundingChunks.push({
          x: surroundingChunkX,
          y: surroundingChunkY,
          world: world
        });
      }
    }
    this.processSurroundingChunks(surroundingChunks);
  }
  processSurroundingChunks(surroundingChunks) {  
    for (const chunk of surroundingChunks) {
      const chunkX = chunk.x;
      const chunkY = chunk.y;
      const world = chunk.world;
      const chunkId = this.getChunkId(chunkX, chunkY, world);    

      if (!this.chunks[chunkId]) {
        this.chunks[chunkId] = 'REQUESTED';                
        this.fetchChunk(chunkX, chunkY, world);       
      } 
    }
    for (const chunkId in this.recentlyLoadedChunks) {
      this.recentlyLoadedChunks[chunkId]--;
      if (this.recentlyLoadedChunks[chunkId] <= 0) {
        delete this.recentlyLoadedChunks[chunkId];
      }
    }  
    for (const chunkId in this.loadedChunks) {
      if (!this.recentlyLoadedChunks[chunkId]) {
        this.pruneChunks(chunkId);
      }
    }
  }
  pruneChunks(chunkId) {
    const chunk = this.loadedChunks[chunkId];
    const chunkX = chunk.x;
    const chunkY = chunk.y;
    const world = chunk.world;
    const owner = chunkId;    
    
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
  async fetchChunk(chunkX, chunkY, world) {
    const chunkId = this.getChunkId(chunkX, chunkY, world);
    this.chunks[chunkId] = 'PENDING';

    let numberOfChunkMaps = this.worldMaps[world].maps.length;
    for (let i = 0; i < numberOfChunkMaps; i++) {
      const worldMaps = this.worldMaps[world].maps;

      const fileName = worldMaps[i].fileName;
      const parts = fileName.split('_');
      const x = parseInt(parts[0]);
      const y = parseInt(parts[1].split('.')[0]);

      if (x === chunkX && y === chunkY) {
        await this.loadChunkData(chunkX, chunkY, world); // Await result
        return; // Exit after loading
      }
    }

    // Handle chunk not found in maps
    this.chunks[chunkId] = 'GENERATING';
    events.emit("CHUNK_NOT_FOUND", {
      x: chunkX,
      y: chunkY,
    });
  }
  async loadChunkData(chunkX, chunkY, world) {
    const chunkId = this.getChunkId(chunkX, chunkY, world);    
    const chunkPath = `./src/levels/${world}/${chunkX}_${chunkY}.tmj`;

    try {
      const exists = await checkFileExists(chunkPath);
      if (exists) {
        const response = await fetch(chunkPath);
        const chunkData = await response.json();
        this.chunks[chunkId] = 'PRELOADED';
        events.emit("CHUNK_FOUND", {
          x: chunkX,
          y: chunkY,
          world: world,
          data: chunkData,
        });
        return true;
      } else {
        console.warn(`Chunk not found: ${chunkPath}`);
        return false; // Indicate failure
      }
    } catch (error) {
      console.error('Error loading chunk:', error);
      return false; // Indicate failure
    }
  }  
  addChunk(chunkX, chunkY, world, chunkData) {  
    const chunkId = this.getChunkId(chunkX, chunkY, world);    
    this.chunks[chunkId] = 'LOADING';                
    const chunk = new Chunk(chunkX, chunkY, world, chunkData, chunkId);

    chunk.addCollision(this.collision);    
    chunk.addTerrain(this.terrain);
    chunk.spawnEntities(this.entities);
    
    this.chunks[chunkId] = 'COMPLETE';                        
    this.recentlyLoadedChunks[chunkId] = 1;        
    this.loadedChunks[chunkId] = chunk;
    this.isSpawnReady(world);    
  }
  isSpawnReady(world) {
    if (!this.spawnZoneReady) {
      const numLoadedChunks = Object.keys(this.loadedChunks).length;
      if (numLoadedChunks >= this.spawnZoneSize) {
        this.spawnZoneReady = true;
        console.log(world,'spawn zone ready ');
        events.emit("SPAWN_ZONE_READY", world);
      } 
    }    
  }
  removeChunk(chunkX, chunkY, world) {
    const chunkId = this.getChunkId(chunkX, chunkY, world);
    const chunk = this.loadedChunks[chunkId];
    chunk.despawnEntities(this.entities);      
    chunk.removeTerrain(this.terrain);
    chunk.removeCollision(this.collision);   

    delete this.loadedChunks[chunkId];
    delete this.chunks[chunkId];  
  }  
  getChunkId (chunkX, chunkY, world) {
    const chunkId = `${chunkX},${chunkY},${world}`;
    return chunkId;
  }
  worldToChunkCoords(x, y) {
    const posX = Math.floor(x);
    const posY = Math.floor(y);

    const chunkX = Math.floor(posX / CHUNK_SIZE);
    const chunkY = Math.floor(posY / CHUNK_SIZE);
    return { chunkX, chunkY };   
  } 
}
